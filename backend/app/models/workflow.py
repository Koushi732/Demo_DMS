from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from .base import Base, TimestampMixin, UUIDMixin
from .document import DocumentStatusEnum

class WorkflowStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class WorkflowStepStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class WorkflowTemplate(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workflow_templates"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    steps = relationship("WorkflowTemplateStep", back_populates="template", order_by="WorkflowTemplateStep.step_order", cascade="all, delete-orphan")


class WorkflowTemplateStep(Base, UUIDMixin):
    __tablename__ = "workflow_template_steps"

    template_id = Column(UUID(as_uuid=True), ForeignKey("workflow_templates.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    step_name = Column(String(255), nullable=False)
    role_required = Column(String(255), nullable=True) # e.g., "QA Reviewer", "Department Manager"
    
    template = relationship("WorkflowTemplate", back_populates="steps")


class WorkflowInstance(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workflow_instances"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("workflow_templates.id"), nullable=True)
    started_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(SAEnum(WorkflowStatusEnum, name="workflow_status"), default=WorkflowStatusEnum.IN_PROGRESS, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    document = relationship("Document")
    started_by = relationship("User")
    steps = relationship("WorkflowStepInstance", back_populates="workflow_instance", order_by="WorkflowStepInstance.step_order", cascade="all, delete-orphan")


class WorkflowStepInstance(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workflow_step_instances"

    workflow_instance_id = Column(UUID(as_uuid=True), ForeignKey("workflow_instances.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    step_name = Column(String(255), nullable=False)
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(SAEnum(WorkflowStepStatusEnum, name="workflow_step_status"), default=WorkflowStepStatusEnum.PENDING, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    comments = Column(Text, nullable=True)

    workflow_instance = relationship("WorkflowInstance", back_populates="steps")
    assigned_to = relationship("User")
