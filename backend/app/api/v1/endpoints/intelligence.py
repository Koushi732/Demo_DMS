from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Any, Dict
from uuid import UUID
from pydantic import BaseModel

from ...database import get_db
from ..deps import get_current_user, get_current_organization_id
from ...models.document import Document
from ...services.ai_service import AIService
from ...services.audit_service import AuditService

router = APIRouter()

class AskQuestionRequest(BaseModel):
    question: str

@router.get("/{document_id}/summary")
async def get_document_summary(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    organization_id: str = Depends(get_current_organization_id),
) -> Any:
    """Get AI summary of a document."""
    doc = await _get_document(db, document_id, organization_id)
    
    # In a real app, we'd use the actual extracted text from Phase 6.
    # For now, we pass the description.
    text_content = doc.description or ""
    
    result = await AIService.summarize_document(text_content, doc.title)
    
    await AuditService.log_event(
        db=db,
        organization_id=UUID(organization_id),
        user_id=UUID(current_user["sub"]),
        action="AI_SUMMARIZE",
        resource_type="document",
        resource_id=document_id,
        details="Generated document summary"
    )
    await db.commit()
    
    return result

@router.get("/{document_id}/metadata")
async def get_document_extracted_metadata(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    organization_id: str = Depends(get_current_organization_id),
) -> Any:
    """Get auto-extracted metadata entities."""
    doc = await _get_document(db, document_id, organization_id)
    
    text_content = doc.description or ""
    result = await AIService.extract_metadata(text_content)
    
    await AuditService.log_event(
        db=db,
        organization_id=UUID(organization_id),
        user_id=UUID(current_user["sub"]),
        action="AI_EXTRACT",
        resource_type="document",
        resource_id=document_id,
        details="Extracted document metadata"
    )
    await db.commit()
    
    return result

@router.post("/{document_id}/ask")
async def ask_document_question(
    document_id: UUID,
    request: AskQuestionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    organization_id: str = Depends(get_current_organization_id),
) -> Any:
    """Ask a question about the document."""
    doc = await _get_document(db, document_id, organization_id)
    
    text_content = doc.description or ""
    result = await AIService.ask_document(text_content, request.question, doc.title)
    
    await AuditService.log_event(
        db=db,
        organization_id=UUID(organization_id),
        user_id=UUID(current_user["sub"]),
        action="AI_ASK",
        resource_type="document",
        resource_id=document_id,
        details=f"Asked question: {request.question[:50]}..."
    )
    await db.commit()
    
    return result

async def _get_document(db: AsyncSession, document_id: UUID, organization_id: str) -> Document:
    result = await db.execute(
        select(Document)
        .filter(Document.id == document_id, Document.organization_id == organization_id)
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
