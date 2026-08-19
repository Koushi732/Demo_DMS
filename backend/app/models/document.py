from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text, Date, BigInteger, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
import enum

from .base import Base, TimestampMixin, UUIDMixin


class DocumentStatusEnum(str, enum.Enum):
    """Maps to PostgreSQL enum type 'document_status'."""
    DRAFT = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    EFFECTIVE = "EFFECTIVE"
    OBSOLETE = "OBSOLETE"
    ARCHIVED = "ARCHIVED"
    SUPERSEDED = "SUPERSEDED"


class DocumentType(Base, UUIDMixin):
    """document_types — no updated_at column in the database."""
    __tablename__ = "document_types"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    prefix = Column(String(20), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    metadata_schema = Column(JSONB, nullable=True, default={})
    default_review_period_days = Column(Integer, default=365)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization")


class Folder(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "folders"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("folders.id"), nullable=True)
    name = Column(String(255), nullable=False)
    path = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    children = relationship("Folder", backref="parent", remote_side="Folder.id")
    documents = relationship("Document", back_populates="folder")
    organization = relationship("Organization")


class Document(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "documents"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    document_number = Column(String(50), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    document_type_id = Column(UUID(as_uuid=True), ForeignKey("document_types.id"), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    folder_id = Column(UUID(as_uuid=True), ForeignKey("folders.id"), nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    classification = Column(String(50), nullable=True)
    # Use the PostgreSQL enum type 'document_status' that was created by the migration
    status = Column(
        SAEnum(DocumentStatusEnum, name="document_status", create_type=False),
        default=DocumentStatusEnum.DRAFT,
        nullable=False,
    )

    current_version_id = Column(UUID(as_uuid=True), ForeignKey("document_versions.id"), nullable=True)

    effective_date = Column(Date, nullable=True)
    review_period_days = Column(Integer, nullable=True)
    next_review_date = Column(Date, nullable=True)
    superseded_by_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)

    tags = Column(ARRAY(Text), nullable=True)
    processing_status = Column(String(50), nullable=True)

    # Relationships
    folder = relationship("Folder", back_populates="documents")
    organization = relationship("Organization")
    department = relationship("Department")
    owner = relationship("User")
    document_type = relationship("DocumentType")
    versions = relationship("DocumentVersion", back_populates="document", foreign_keys="[DocumentVersion.document_id]")
    current_version = relationship("DocumentVersion", foreign_keys=[current_version_id])
    metadata_entries = relationship("DocumentMetadata", back_populates="document")


class DocumentVersion(Base, UUIDMixin):
    """document_versions — only has created_at, no updated_at."""
    __tablename__ = "document_versions"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    storage_path = Column(Text, nullable=False)
    filename = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=True)
    size_bytes = Column(BigInteger, nullable=True)
    checksum_sha256 = Column(String(64), nullable=True)
    status = Column(
        SAEnum(DocumentStatusEnum, name="document_status", create_type=False),
        default=DocumentStatusEnum.DRAFT,
    )
    change_reason = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)

    document = relationship("Document", back_populates="versions", foreign_keys=[document_id])
    creator = relationship("User", foreign_keys=[created_by])


class DocumentMetadata(Base, UUIDMixin):
    """document_metadata — no timestamp columns."""
    __tablename__ = "document_metadata"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=True)
    is_ai_generated = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    document = relationship("Document", back_populates="metadata_entries")
