from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base, UUIDMixin


class Notification(Base, UUIDMixin):
    """In-app notifications for users."""
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String(50), nullable=False)  # success, warning, error, info
    read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default="now()")

    user = relationship("User")


class DocumentShare(Base, UUIDMixin):
    """Tracks document sharing and secure links."""
    __tablename__ = "document_shares"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    shared_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    shared_with_email = Column(String(255), nullable=True)
    shared_with_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    permission = Column(String(50), nullable=False, default="viewer")  # viewer, editor
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default="now()")

    document = relationship("Document")
    shared_by = relationship("User", foreign_keys=[shared_by_id])
    shared_with_user = relationship("User", foreign_keys=[shared_with_user_id])
