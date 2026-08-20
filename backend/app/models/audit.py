from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .base import Base, UUIDMixin


class AuditEvent(Base, UUIDMixin):
    """Immutable audit log entries for compliance tracking."""
    __tablename__ = "audit_events"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g. DOCUMENT_CREATED, VERSION_UPLOADED, WORKFLOW_APPROVED
    resource_type = Column(String(50), nullable=False)  # e.g. document, workflow, user
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(Text, nullable=True)
    event_metadata = Column("metadata", JSONB, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default="now()")

    user = relationship("User")
    organization = relationship("Organization")
