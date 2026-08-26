from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from enum import Enum


class DocumentStatusEnum(str, Enum):
    DRAFT = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    EFFECTIVE = "EFFECTIVE"
    OBSOLETE = "OBSOLETE"
    ARCHIVED = "ARCHIVED"
    SUPERSEDED = "SUPERSEDED"


# ── Request Schemas ──────────────────────────────────────────────

class DocumentCreate(BaseModel):
    title: str = Field(..., max_length=500)
    document_type_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    folder_id: Optional[UUID] = None
    description: Optional[str] = None
    classification: Optional[str] = None
    tags: Optional[List[str]] = None


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    department_id: Optional[UUID] = None
    folder_id: Optional[UUID] = None
    classification: Optional[str] = None
    status: Optional[DocumentStatusEnum] = None
    effective_date: Optional[date] = None
    tags: Optional[List[str]] = None


# ── Response Schemas ─────────────────────────────────────────────

class DocumentVersionResponse(BaseModel):
    id: UUID
    version_number: int
    filename: str
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None
    status: Optional[str] = None
    change_reason: Optional[str] = None
    created_by: Optional[UUID] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentTypeResponse(BaseModel):
    id: UUID
    name: str
    prefix: str
    category: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DepartmentBrief(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class OwnerBrief(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class DocumentResponse(BaseModel):
    id: UUID
    document_number: str
    title: str
    description: Optional[str] = None
    status: str
    classification: Optional[str] = None
    tags: Optional[List[str]] = None
    processing_status: Optional[str] = None

    # Foreign keys
    organization_id: UUID
    owner_id: UUID
    department_id: Optional[UUID] = None
    document_type_id: Optional[UUID] = None
    folder_id: Optional[UUID] = None

    # Date fields
    effective_date: Optional[date] = None
    next_review_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    # Expanded relationships (populated on detail views)
    current_version: Optional[DocumentVersionResponse] = None
    document_type: Optional[DocumentTypeResponse] = None
    department: Optional[DepartmentBrief] = None
    owner: Optional[OwnerBrief] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    items: List[DocumentResponse]
    total: int
    page: int
    page_size: int


# ── Folder Schemas ───────────────────────────────────────────────

class FolderCreate(BaseModel):
    name: str = Field(..., max_length=255)
    parent_id: Optional[UUID] = None


class FolderResponse(BaseModel):
    id: UUID
    name: str
    parent_id: Optional[UUID] = None
    path: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Metadata Schemas ─────────────────────────────────────────────

class DocumentMetadataResponse(BaseModel):
    id: UUID
    key: str
    value: Optional[str] = None
    is_ai_generated: bool = False
    verified_by: Optional[UUID] = None
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentMetadataUpsert(BaseModel):
    key: str
    value: Optional[str] = None
    is_ai_generated: bool = False


# ── Stats & Upload Schemas ───────────────────────────────────────

class DocumentStatsResponse(BaseModel):
    total_documents: int
    effective_documents: int
    pending_reviews: int
    overdue_reviews: int


class DocumentUploadResponse(BaseModel):
    version: DocumentVersionResponse
    preview_url: str
