from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Any, Dict, Optional

from app.database import get_db
from app.schemas.audit import AuditEventResponse, AuditEventListResponse
from app.services.audit_service import AuditService
from app.api.deps import get_current_user, get_current_organization_id

router = APIRouter()


@router.get("/audit", response_model=AuditEventListResponse)
async def list_audit_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    action: Optional[str] = None,
    user_id: Optional[UUID] = None,
    resource_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    organization_id: str = Depends(get_current_organization_id),
) -> Any:
    """List audit events for the current organization."""
    events, total = await AuditService.list_events(
        db=db,
        organization_id=organization_id,
        page=page,
        page_size=page_size,
        action=action,
        user_id=user_id,
        resource_type=resource_type,
    )
    
    items = []
    for event in events:
        item = AuditEventResponse.model_validate(event)
        items.append(item)
    
    return AuditEventListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )
