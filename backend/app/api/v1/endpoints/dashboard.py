from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from typing import Any, Dict
from uuid import UUID
from datetime import datetime, timedelta

from ...database import get_db
from ..deps import get_current_user, get_current_organization_id
from ...models.document import Document
from ...models.auth import Department
from ...models.audit import AuditEvent

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    organization_id: str = Depends(get_current_organization_id),
) -> Any:
    """Get aggregated dashboard metrics for the organization."""
    org_uuid = UUID(organization_id)
    
    # 1. Total Documents
    total_docs = await db.scalar(
        select(func.count()).select_from(Document).where(Document.organization_id == org_uuid)
    ) or 0
    
    # 2. Document Distribution by Department
    dept_dist_query = (
        select(Department.name, func.count(Document.id))
        .outerjoin(Document, Document.department_id == Department.id)
        .where(Department.organization_id == org_uuid)
        .group_by(Department.name)
    )
    dist_result = await db.execute(dept_dist_query)
    distribution = {row[0]: row[1] for row in dist_result.all()}
    
    # 3. Recent Activity (Audit Events)
    recent_activity_query = (
        select(AuditEvent)
        .where(AuditEvent.organization_id == org_uuid)
        .order_by(desc(AuditEvent.timestamp))
        .limit(10)
    )
    activity_result = await db.execute(recent_activity_query)
    recent_activity = [
        {
            "id": str(evt.id),
            "action": evt.action,
            "resource_type": evt.resource_type,
            "details": evt.details,
            "timestamp": evt.timestamp.isoformat(),
            "user_id": str(evt.user_id) if evt.user_id else None
        }
        for evt in activity_result.scalars().all()
    ]
    
    # 4. Periodic Review Queue (Documents needing review soon)
    # Mocking this slightly by fetching APPROVED docs
    review_queue_query = (
        select(Document)
        .where(
            Document.organization_id == org_uuid,
            Document.status == "APPROVED"
        )
        .limit(5)
    )
    review_result = await db.execute(review_queue_query)
    review_queue = [
        {
            "id": str(doc.id),
            "title": doc.title,
            "document_number": doc.document_number,
            "due_date": (datetime.utcnow() + timedelta(days=30)).isoformat() # Placeholder logic
        }
        for doc in review_result.scalars().all()
    ]
    
    return {
        "total_documents": total_docs,
        "distribution": distribution,
        "recent_activity": recent_activity,
        "periodic_review_queue": review_queue
    }
