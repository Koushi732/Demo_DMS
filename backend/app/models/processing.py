from sqlalchemy import Column, String, ForeignKey, Text, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.orm import relationship

from .base import Base, UUIDMixin, TimestampMixin


class DocumentProcessingJob(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "document_processing_jobs"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    document_version_id = Column(UUID(as_uuid=True), ForeignKey("document_versions.id"), nullable=False)
    job_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default='QUEUED')
    error_message = Column(Text, nullable=True)
    attempts = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    organization = relationship("Organization")
    document_version = relationship("DocumentVersion")


class DocumentExtractedText(Base, UUIDMixin):
    __tablename__ = "document_extracted_text"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    document_version_id = Column(UUID(as_uuid=True), ForeignKey("document_versions.id"), nullable=False, unique=True)
    extracted_text = Column(Text, nullable=True)
    extraction_method = Column(String(50), nullable=True)
    search_vector = Column(TSVECTOR, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization")
    document_version = relationship("DocumentVersion")
