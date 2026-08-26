from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from uuid import UUID
from typing import Optional
from datetime import datetime

from ..models.audit import AuditEvent
from ..models.auth import User


class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        organization_id: UUID,
        user_id: Optional[UUID],
        action: str,
        resource_type: str,
        resource_id: Optional[UUID] = None,
        details: Optional[str] = None,
        metadata: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditEvent:
        event = AuditEvent(
            organization_id=organization_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            event_metadata=metadata,
            ip_address=ip_address,
            user_agent=user_agent,
            timestamp=datetime.utcnow(),
        )
        db.add(event)
        await db.flush()
        return event

    @staticmethod
    async def list_events(
        db: AsyncSession,
        organization_id: UUID,
        page: int = 1,
        page_size: int = 50,
        action: Optional[str] = None,
        user_id: Optional[UUID] = None,
        resource_type: Optional[str] = None,
    ):
        query = select(AuditEvent).filter(AuditEvent.organization_id == organization_id)

        if action:
            query = query.filter(AuditEvent.action == action)
        if user_id:
            query = query.filter(AuditEvent.user_id == user_id)
        if resource_type:
            query = query.filter(AuditEvent.resource_type == resource_type)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Fetch paginated and sorted
        query = query.order_by(desc(AuditEvent.timestamp))
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        events = result.scalars().all()

        return events, total
