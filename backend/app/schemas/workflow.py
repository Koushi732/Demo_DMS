from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from .document import DocumentStatusEnum

# Base Schemas

class WorkflowTemplateStepBase(BaseModel):
    step_order: int
    step_name: str
    role_required: Optional[str] = None

class WorkflowTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class WorkflowStepInstanceBase(BaseModel):
    step_order: int
    step_name: str
    assigned_to_id: Optional[UUID] = None
    status: str
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    comments: Optional[str] = None

class WorkflowInstanceBase(BaseModel):
    document_id: UUID
    template_id: Optional[UUID] = None
    status: str
    completed_at: Optional[datetime] = None


# Response Schemas

class WorkflowStepInstanceResponse(WorkflowStepInstanceBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    workflow_instance_id: UUID
    created_at: datetime
    updated_at: datetime
    
class WorkflowInstanceResponse(WorkflowInstanceBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    started_by_id: UUID
    created_at: datetime
    updated_at: datetime
    steps: List[WorkflowStepInstanceResponse] = []

class WorkflowTemplateStepResponse(WorkflowTemplateStepBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    template_id: UUID

class WorkflowTemplateResponse(WorkflowTemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    steps: List[WorkflowTemplateStepResponse] = []

# Request Schemas

class StartWorkflowRequest(BaseModel):
    template_id: Optional[UUID] = None

class SubmitReviewRequest(BaseModel):
    action: str # "APPROVE" or "REJECT"
    comments: Optional[str] = None
