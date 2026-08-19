from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, update
from uuid import UUID

from ..models.collaboration import Notification


class NotificationService:
    @staticmethod
    async def get_user_notifications(db: AsyncSession, user_id: UUID):
        query = select(Notification).filter(Notification.user_id == user_id).order_by(desc(Notification.created_at))
        result = await db.execute(query)
        notifications = result.scalars().all()
        
        count_query = select(func.count()).select_from(Notification).filter(
            Notification.user_id == user_id, 
            Notification.read == False
        )
        count_result = await db.execute(count_query)
        unread_count = count_result.scalar() or 0
        
        return notifications, unread_count

    @staticmethod
    async def mark_as_read(db: AsyncSession, user_id: UUID, notification_id: UUID = None):
        stmt = update(Notification).filter(Notification.user_id == user_id)
        if notification_id:
            stmt = stmt.filter(Notification.id == notification_id)
        
        stmt = stmt.values(read=True)
        await db.execute(stmt)
        await db.commit()
        return True
    @staticmethod
    async def send_notification(
        db: AsyncSession,
        user_id: UUID,
        title: str,
        message: str,
        type: str,
        related_entity_id: UUID = None,
        related_entity_type: str = None
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            related_entity_id=related_entity_id,
            related_entity_type=related_entity_type,
            read=False
        )
        db.add(notification)
        await db.flush()
        return notification
