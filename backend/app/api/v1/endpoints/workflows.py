from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import Any, Dict

from app.database import get_db
from app.schemas.workflow import (
    WorkflowInstanceResponse,
    WorkflowStepInstanceResponse,
    StartWorkflowRequest,
    SubmitReviewRequest
)
from app.models.workflow import WorkflowTemplate
from app.services.workflow_service import WorkflowService
from app.api.deps import get_current_user, get_current_organization_id

router = APIRouter()

@router.get("/templates")
async def list_workflow_templates(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    org_id: str = Depends(get_current_organization_id)
) -> Any:
    """List all workflow templates for the current organization."""
    result = await db.execute(
        select(WorkflowTemplate).where(WorkflowTemplate.organization_id == UUID(org_id))
    )
    templates = result.scalars().all()
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "description": t.description,
            "steps": t.steps
        }
        for t in templates
    ]

@router.get("/documents/{document_id}/workflow", response_model=WorkflowInstanceResponse)
async def get_workflow(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """
    Get the active workflow for a document.
    """
    workflow = await WorkflowService.get_document_workflow(db, document_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="No workflow found for this document")
    return workflow

@router.post("/documents/{document_id}/workflow/start", response_model=WorkflowInstanceResponse)
async def start_workflow(
    document_id: UUID,
    request: StartWorkflowRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """
    Start a new workflow for a document.
    """
    return await WorkflowService.start_workflow(
        db=db, 
        document_id=document_id, 
        user_id=current_user["sub"],
        template_id=request.template_id
    )

@router.post("/workflows/steps/{step_id}/review", response_model=WorkflowStepInstanceResponse)
async def submit_review(
    step_id: UUID,
    request: SubmitReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """
    Submit a review (Approve or Reject) for a workflow step.
    """
    return await WorkflowService.submit_review(
        db=db,
        step_id=step_id,
        user_id=current_user["sub"],
        action=request.action,
        comments=request.comments
    )
