from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Any, Dict

from app.database import get_db
from app.schemas.collaboration import NotificationListResponse
from app.services.notification_service import NotificationService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/notifications", response_model=NotificationListResponse)
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """Get all notifications for the current user."""
    notifications, unread_count = await NotificationService.get_user_notifications(db, UUID(current_user["sub"]))
    return NotificationListResponse(items=notifications, unread_count=unread_count)

@router.post("/notifications/read")
async def mark_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """Mark all notifications as read for current user."""
    await NotificationService.mark_as_read(db, UUID(current_user["sub"]))
    return {"status": "success"}

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """Mark a specific notification as read."""
    await NotificationService.mark_as_read(db, UUID(current_user["sub"]), notification_id)
    return {"status": "success"}
