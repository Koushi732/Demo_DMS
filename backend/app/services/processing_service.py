import asyncio
from uuid import UUID
import datetime
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from supabase import Client

from app.database import AsyncSessionLocal

from app.models.document import Document, DocumentVersion
from app.models.processing import DocumentProcessingJob, DocumentExtractedText
from app.services.processors import get_processor_for_mime_type
from app.config import settings

class ProcessingService:
    @staticmethod
    async def process_document_version_task(
        supabase: Client, 
        document_id: UUID, 
        version_id: UUID
    ):
        """Background task to process a document."""
        async with AsyncSessionLocal() as db:
            # Get document and version
            stmt = select(DocumentVersion).where(DocumentVersion.id == version_id)
            result = await db.execute(stmt)
            version = result.scalar_one_or_none()
        
            if not version:
                return
                
            stmt = select(Document).where(Document.id == document_id)
            result = await db.execute(stmt)
            document = result.scalar_one_or_none()
            
            if not document:
                return

            # Check for existing job or create one
            stmt = select(DocumentProcessingJob).where(DocumentProcessingJob.document_version_id == version.id)
            result = await db.execute(stmt)
            job = result.scalar_one_or_none()
            
            if job:
                job.status = "PROCESSING"
                job.started_at = datetime.datetime.utcnow()
                job.attempts += 1
                job.error_message = None
            else:
                job = DocumentProcessingJob(
                    organization_id=document.organization_id,
                    document_version_id=version.id,
                    job_type="TEXT_EXTRACTION",
                    status="PROCESSING",
                    started_at=datetime.datetime.utcnow(),
                    attempts=1
                )
                db.add(job)
                
            document.processing_status = "PROCESSING"
            await db.commit()
            
            try:
                # 1. Download file from Supabase
                res = supabase.storage.from_(settings.storage_bucket).download(version.storage_path)
                if not res:
                    raise Exception("Failed to download file from storage.")
                
                # 2. Extract text
                processor = get_processor_for_mime_type(version.mime_type)
                extracted_text = processor.extract_text(res)
                
                # 3. Save extracted text
                stmt = select(DocumentExtractedText).where(DocumentExtractedText.document_version_id == version.id)
                result = await db.execute(stmt)
                extracted = result.scalar_one_or_none()
                
                if extracted:
                    extracted.extracted_text = extracted_text
                    extracted.extraction_method = "NATIVE"
                else:
                    extracted = DocumentExtractedText(
                        organization_id=document.organization_id,
                        document_version_id=version.id,
                        extracted_text=extracted_text,
                        extraction_method="NATIVE"
                    )
                    db.add(extracted)
                
                # Update job status
                job.status = "COMPLETED"
                job.completed_at = datetime.datetime.utcnow()
                document.processing_status = "READY"
                
                await db.commit()
                
            except Exception as e:
                await db.rollback()
                
                # Re-fetch objects after rollback since they may be expired
                stmt = select(DocumentProcessingJob).where(DocumentProcessingJob.document_version_id == version_id)
                result = await db.execute(stmt)
                job = result.scalar_one_or_none()
                
                stmt = select(Document).where(Document.id == document_id)
                result = await db.execute(stmt)
                document = result.scalar_one_or_none()
                
                if job:
                    job.status = "FAILED"
                    job.error_message = str(e)
                    job.completed_at = datetime.datetime.utcnow()
                if document:
                    document.processing_status = "FAILED"
                await db.commit()

    @staticmethod
    async def get_processing_status(db: AsyncSession, document_id: UUID) -> Dict[str, Any]:
        """Get the current processing status of a document."""
        stmt = select(Document).where(Document.id == document_id)
        result = await db.execute(stmt)
        document = result.scalar_one_or_none()
        
        if not document:
            return {"status": "NOT_FOUND"}
            
        if not document.current_version_id:
            return {"status": "NO_VERSION"}
            
        stmt = select(DocumentProcessingJob).where(DocumentProcessingJob.document_version_id == document.current_version_id).order_by(DocumentProcessingJob.created_at.desc())
        result = await db.execute(stmt)
        job = result.scalars().first()
        
        if not job:
            return {
                "status": document.processing_status or "UPLOADED",
                "overall_progress": 0,
                "steps": []
            }
            
        progress = 0
        if job.status == "COMPLETED":
            progress = 100
        elif job.status == "PROCESSING":
            progress = 50
            
        return {
            "status": job.status,
            "overall_progress": progress,
            "error_message": job.error_message,
            "steps": [
                {"name": "File Upload", "status": "COMPLETED", "progress": 100},
                {"name": "Text Extraction", "status": job.status, "progress": progress},
            ]
        }
