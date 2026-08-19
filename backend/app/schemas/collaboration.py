from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    read: bool
    link: Optional[str] = None
    created_at: datetime
    
class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    unread_count: int
