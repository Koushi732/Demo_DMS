from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from uuid import UUID
from datetime import datetime

from ..models.workflow import (
    WorkflowInstance, 
    WorkflowStepInstance, 
    WorkflowStatusEnum, 
    WorkflowStepStatusEnum,
    WorkflowTemplate,
    WorkflowTemplateStep
)
from ..models.document import Document, DocumentStatusEnum
from .notification_service import NotificationService

class WorkflowService:
    @staticmethod
    async def get_document_workflow(db: AsyncSession, document_id: UUID) -> WorkflowInstance:
        result = await db.execute(
            select(WorkflowInstance)
            .options(selectinload(WorkflowInstance.steps))
            .filter(WorkflowInstance.document_id == document_id)
            .order_by(WorkflowInstance.created_at.desc())
        )
        workflow = result.scalars().first()
        return workflow

    @staticmethod
    async def start_workflow(db: AsyncSession, document_id: UUID, user_id: UUID, template_id: UUID = None) -> WorkflowInstance:
        # Check if doc exists
        result = await db.execute(select(Document).filter(Document.id == document_id))
        document = result.scalars().first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if document.status != DocumentStatusEnum.DRAFT:
            raise HTTPException(status_code=400, detail="Only DRAFT documents can start a workflow")

        # Check existing active workflow
        existing_workflow = await WorkflowService.get_document_workflow(db, document_id)
        if existing_workflow and existing_workflow.status == WorkflowStatusEnum.IN_PROGRESS:
            raise HTTPException(status_code=400, detail="Workflow already in progress for this document")

        # Create new workflow instance
        workflow = WorkflowInstance(
            document_id=document_id,
            template_id=template_id,
            started_by_id=user_id,
            status=WorkflowStatusEnum.IN_PROGRESS
        )
        db.add(workflow)
        await db.flush()

        # If template provided, use it. Otherwise, use hardcoded linear flow for Phase 4.
        if template_id:
            # We would load the template steps here, but for now we fallback to hardcoded
            # to guarantee the demo works even without seeded templates.
            pass

        # Hardcoded linear flow: Department Review -> QA Review
        step1 = WorkflowStepInstance(
            workflow_instance_id=workflow.id,
            step_order=1,
            step_name="Department Review",
            assigned_to_id=None, # In real world, assign to department manager
            status=WorkflowStepStatusEnum.PENDING
        )
        step2 = WorkflowStepInstance(
            workflow_instance_id=workflow.id,
            step_order=2,
            step_name="QA Final Review",
            assigned_to_id=None,
            status=WorkflowStepStatusEnum.PENDING
        )
        
        db.add_all([step1, step2])

        # Update document status
        document.status = DocumentStatusEnum.UNDER_REVIEW
        
        await db.commit()
        await db.refresh(workflow)
        
        # Notify document owner
        await NotificationService.send_notification(
            db=db,
            user_id=document.owner_id,
            title="Workflow Started",
            message=f"A new workflow has been started for {document.document_number}.",
            type="WORKFLOW_EVENT",
            related_entity_id=workflow.id,
            related_entity_type="WORKFLOW"
        )
        await db.commit()

        return await WorkflowService.get_document_workflow(db, document_id)

    @staticmethod
    async def submit_review(db: AsyncSession, step_id: UUID, user_id: UUID, action: str, comments: str = None) -> WorkflowStepInstance:
        # Find step
        result = await db.execute(
            select(WorkflowStepInstance)
            .filter(WorkflowStepInstance.id == step_id)
        )
        step = result.scalars().first()
        
        if not step:
            raise HTTPException(status_code=404, detail="Workflow step not found")
            
        if step.status != WorkflowStepStatusEnum.PENDING:
            raise HTTPException(status_code=400, detail="Step is already completed")

        # Get the parent workflow instance
        result = await db.execute(
            select(WorkflowInstance)
            .options(selectinload(WorkflowInstance.steps))
            .filter(WorkflowInstance.id == step.workflow_instance_id)
        )
        workflow = result.scalars().first()
        
        if workflow.status != WorkflowStatusEnum.IN_PROGRESS:
            raise HTTPException(status_code=400, detail="Workflow is not active")

        # Optional: check if user is assigned to this step or is admin. 
        # Skipping strict check for demo purposes.

        # Process action
        if action == "APPROVE":
            step.status = WorkflowStepStatusEnum.APPROVED
        elif action == "REJECT":
            step.status = WorkflowStepStatusEnum.REJECTED
        else:
            raise HTTPException(status_code=400, detail="Invalid action")

        step.completed_at = datetime.utcnow()
        step.assigned_to_id = user_id # Record who actually did it
        
        if comments:
            step.comments = comments
            
        # Check overall workflow status
        all_steps_approved = True
        for s in workflow.steps:
            # We must use the updated status for the current step
            current_status = step.status if s.id == step.id else s.status
            if current_status != WorkflowStepStatusEnum.APPROVED:
                all_steps_approved = False
                break
                
        # Get associated document
        doc_result = await db.execute(select(Document).filter(Document.id == workflow.document_id))
        document = doc_result.scalars().first()

        if action == "REJECT":
            workflow.status = WorkflowStatusEnum.CANCELLED
            workflow.completed_at = datetime.utcnow()
            document.status = DocumentStatusEnum.DRAFT # Revert back
            
            await NotificationService.send_notification(
                db=db,
                user_id=document.owner_id,
                title="Workflow Rejected",
                message=f"The workflow for {document.document_number} was rejected.",
                type="WORKFLOW_EVENT",
                related_entity_id=workflow.id,
                related_entity_type="WORKFLOW"
            )
        elif all_steps_approved:
            workflow.status = WorkflowStatusEnum.COMPLETED
            workflow.completed_at = datetime.utcnow()
            document.status = DocumentStatusEnum.EFFECTIVE
            document.effective_date = datetime.utcnow().date()
            
            await NotificationService.send_notification(
                db=db,
                user_id=document.owner_id,
                title="Workflow Completed",
                message=f"The workflow for {document.document_number} is complete and the document is now Effective.",
                type="WORKFLOW_EVENT",
                related_entity_id=workflow.id,
                related_entity_type="WORKFLOW"
            )

        await db.commit()
        await db.refresh(step)
        return step
