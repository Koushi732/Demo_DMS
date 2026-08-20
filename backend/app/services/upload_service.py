import os
import uuid
import hashlib
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from supabase import Client

from app.config import settings
from app.models.document import Document, DocumentVersion, DocumentStatusEnum

async def process_document_upload(
    db: AsyncSession,
    supabase: Client,
    document: Document,
    file: UploadFile,
    change_reason: str,
    user_id: str
) -> DocumentVersion:
    # 1. Validation
    # File size validation requires reading the file
    content = await file.read()
    size_bytes = len(content)
    
    max_bytes = settings.max_file_size_mb * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed size is {settings.max_file_size_mb} MB"
        )
        
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    allowed_types = [t.strip().lower() for t in settings.allowed_file_types.split(",")]
    if ext not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type {ext} not allowed. Allowed types: {settings.allowed_file_types}"
        )
        
    # Calculate checksum
    checksum = hashlib.sha256(content).hexdigest()
    
    # 2. Determine Version Number
    # Get the latest version number for this document
    stmt = select(func.max(DocumentVersion.version_number)).where(DocumentVersion.document_id == document.id)
    result = await db.execute(stmt)
    max_version = result.scalar() or 0
    next_version = max_version + 1
    
    # 3. Store in Supabase
    filename = file.filename or f"doc_{next_version}"
    storage_path = f"{document.organization_id}/{document.id}/{next_version}/{filename}"
    
    # Use supabase client to upload
    res = supabase.storage.from_(settings.storage_bucket).upload(
        path=storage_path,
        file=content,
        file_options={"content-type": file.content_type}
    )
    
    # In some versions of supabase-py, upload returns a Response object
    # Let's handle it safely
    
    # 4. Record DocumentVersion
    version = DocumentVersion(
        id=uuid.uuid4(),
        document_id=document.id,
        version_number=next_version,
        storage_path=storage_path,
        filename=filename,
        mime_type=file.content_type,
        size_bytes=size_bytes,
        checksum_sha256=checksum,
        status=DocumentStatusEnum.DRAFT,
        change_reason=change_reason,
        created_by=uuid.UUID(user_id)
    )
    
    try:
        db.add(version)
        await db.flush()
        
        # 5. Update Document
        document.current_version_id = version.id
        # Reset processing status for new upload
        document.processing_status = "UPLOADED"
        
        await db.commit()
        await db.refresh(version)
    except Exception as e:
        await db.rollback()
        # Clean up storage to prevent orphans
        try:
            supabase.storage.from_(settings.storage_bucket).remove([storage_path])
        except Exception as cleanup_e:
            print(f"Failed to cleanup storage after DB error: {cleanup_e}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save document version: {str(e)}"
        )
    
    return version

def get_preview_url(supabase: Client, storage_path: str, expires_in: int = 3600) -> str:
    """Generate a signed URL for viewing the document."""
    res = supabase.storage.from_(settings.storage_bucket).create_signed_url(
        path=storage_path, 
        expires_in=expires_in
    )
    
    # Extract the URL properly from the dictionary response (which is what create_signed_url usually returns)
    if isinstance(res, dict):
        if "signedURL" in res:
            return res["signedURL"]
        elif "signedUrl" in res:
            return res["signedUrl"]
        
    return str(res)
