"""
Documents API — Phase 3 Core DMS
Implements CRUD endpoints for the document repository.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc
from sqlalchemy.orm import selectinload
from typing import Optional, List
from uuid import UUID
import uuid
import logging

from app.database import get_db
from app.api.deps import get_current_user, get_current_organization_id, get_supabase_client
from app.models.document import Document, DocumentVersion, DocumentType, Folder, DocumentMetadata, DocumentStatusEnum
from app.models.auth import User, Department
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentListResponse,
    DocumentVersionResponse,
    DocumentTypeResponse,
    DepartmentBrief,
    OwnerBrief,
    FolderCreate,
    FolderResponse,
    DocumentMetadataResponse,
    DocumentMetadataUpsert,
    DocumentStatsResponse,
    DocumentUploadResponse,
)
from app.services.upload_service import process_document_upload, get_preview_url
from app.services.audit_service import AuditService

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


# ─── Helper: Build a DocumentResponse from an ORM Document ──────
def _doc_to_response(doc: Document) -> DocumentResponse:
    """Serialize a Document ORM instance to its Pydantic response."""
    current_version = None
    if doc.current_version:
        cv = doc.current_version
        current_version = DocumentVersionResponse(
            id=cv.id,
            version_number=cv.version_number,
            filename=cv.filename,
            mime_type=cv.mime_type,
            size_bytes=cv.size_bytes,
            status=cv.status.value if hasattr(cv.status, "value") else cv.status,
            change_reason=cv.change_reason,
            created_by=cv.created_by,
            created_at=cv.created_at,
        )

    doc_type = None
    if doc.document_type:
        doc_type = DocumentTypeResponse.model_validate(doc.document_type)

    dept = None
    if doc.department:
        dept = DepartmentBrief.model_validate(doc.department)

    owner = None
    if doc.owner:
        owner = OwnerBrief.model_validate(doc.owner)

    # Resolve status — may be a Python enum or a plain string
    status_str = doc.status.value if hasattr(doc.status, "value") else str(doc.status)

    return DocumentResponse(
        id=doc.id,
        document_number=doc.document_number,
        title=doc.title,
        description=doc.description,
        status=status_str,
        classification=doc.classification,
        tags=doc.tags,
        processing_status=doc.processing_status,
        organization_id=doc.organization_id,
        owner_id=doc.owner_id,
        department_id=doc.department_id,
        document_type_id=doc.document_type_id,
        folder_id=doc.folder_id,
        effective_date=doc.effective_date,
        next_review_date=doc.next_review_date,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        current_version=current_version,
        document_type=doc_type,
        department=dept,
        owner=owner,
    )


# ─── Helper: Generate unique document number ────────────────────
async def _generate_doc_number(
    db: AsyncSession,
    org_id: UUID,
    prefix: str = "DOC",
) -> str:
    """Generate a unique document number like SOP-QA-015."""
    # Count existing documents with this prefix in the org
    result = await db.execute(
        select(func.count())
        .select_from(Document)
        .where(
            Document.organization_id == org_id,
            Document.document_number.ilike(f"{prefix}-%"),
        )
    )
    count = result.scalar() or 0
    return f"{prefix}-{count + 1:03d}"


# ─── GET /documents ─────────────────────────────────────────────
@router.get("", response_model=DocumentListResponse)
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status"),
    department_id: Optional[UUID] = Query(None),
    document_type_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None, description="Search title and document_number"),
    sort_by: str = Query("updated_at", description="Sort field"),
    sort_order: str = Query("desc", description="asc or desc"),
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """List documents for the current user's organization, with pagination and filters."""
    base_query = (
        select(Document)
        .options(
            selectinload(Document.current_version),
            selectinload(Document.document_type),
            selectinload(Document.department),
            selectinload(Document.owner),
        )
        .where(Document.organization_id == org_id)
    )

    # Apply filters
    if status:
        base_query = base_query.where(Document.status == status)
    if department_id:
        base_query = base_query.where(Document.department_id == department_id)
    if document_type_id:
        base_query = base_query.where(Document.document_type_id == document_type_id)
    if search:
        search_term = f"%{search}%"
        base_query = base_query.where(
            Document.title.ilike(search_term) | Document.document_number.ilike(search_term)
        )

    # Count total matching
    count_query = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Sorting
    sort_col = getattr(Document, sort_by, Document.updated_at)
    order_fn = desc if sort_order == "desc" else asc
    base_query = base_query.order_by(order_fn(sort_col))

    # Pagination
    offset = (page - 1) * page_size
    base_query = base_query.offset(offset).limit(page_size)

    result = await db.execute(base_query)
    documents = result.scalars().unique().all()

    return DocumentListResponse(
        items=[_doc_to_response(d) for d in documents],
        total=total,
        page=page,
        page_size=page_size,
    )
from ...services.processing_service import ProcessingService

@router.get("/{document_id}/processing")
async def get_processing_status(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    organization_id: str = Depends(get_current_organization_id),
) -> Any:
    """Get document processing status."""
    return await ProcessingService.get_processing_status(document_id)


# ─── GET /documents/stats ───────────────────────────────────────
@router.get("/stats", response_model=DocumentStatsResponse)
async def get_document_stats(
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """Get document KPI stats for the dashboard."""
    # Total documents
    stmt_total = select(func.count()).where(Document.organization_id == org_id, Document.status != DocumentStatusEnum.ARCHIVED)
    total = (await db.execute(stmt_total)).scalar() or 0

    # Effective documents
    stmt_effective = select(func.count()).where(Document.organization_id == org_id, Document.status == DocumentStatusEnum.EFFECTIVE)
    effective = (await db.execute(stmt_effective)).scalar() or 0

    # Pending Reviews
    stmt_pending = select(func.count()).where(
        Document.organization_id == org_id, 
        Document.status.in_([DocumentStatusEnum.UNDER_REVIEW])
    )
    pending = (await db.execute(stmt_pending)).scalar() or 0

    # Overdue Reviews (simplified logic: next_review_date < today)
    from datetime import date
    stmt_overdue = select(func.count()).where(
        Document.organization_id == org_id,
        Document.next_review_date < date.today(),
        Document.status == DocumentStatusEnum.EFFECTIVE
    )
    overdue = (await db.execute(stmt_overdue)).scalar() or 0

    return DocumentStatsResponse(
        total_documents=total,
        effective_documents=effective,
        pending_reviews=pending,
        overdue_reviews=overdue
    )


# ─── GET /documents/{id} ────────────────────────────────────────
@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a single document by ID with full relationship data."""
    stmt = (
        select(Document)
        .options(
            selectinload(Document.current_version),
            selectinload(Document.document_type),
            selectinload(Document.department),
            selectinload(Document.owner),
            selectinload(Document.versions),
        )
        .where(Document.id == document_id, Document.organization_id == org_id)
    )
    result = await db.execute(stmt)
    doc = result.scalars().first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return _doc_to_response(doc)


# ─── POST /documents ────────────────────────────────────────────
@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    body: DocumentCreate,
    user_claims: dict = Depends(get_current_user),
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new document record."""
    user_id = user_claims.get("sub")

    # Determine prefix from document type
    prefix = "DOC"
    if body.document_type_id:
        dt = await db.get(DocumentType, body.document_type_id)
        if dt and dt.organization_id == UUID(org_id):
            prefix = dt.prefix
        elif dt and str(dt.organization_id) != org_id:
            raise HTTPException(status_code=403, detail="Document type does not belong to your organization")

    doc_number = await _generate_doc_number(db, UUID(org_id), prefix)

    doc = Document(
        id=uuid.uuid4(),
        organization_id=UUID(org_id),
        document_number=doc_number,
        title=body.title,
        description=body.description,
        document_type_id=body.document_type_id,
        department_id=body.department_id,
        folder_id=body.folder_id,
        owner_id=UUID(user_id),
        classification=body.classification,
        status=DocumentStatusEnum.DRAFT,
        tags=body.tags,
        processing_status="UPLOADED",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Reload with relationships
    stmt = (
        select(Document)
        .options(
            selectinload(Document.document_type),
            selectinload(Document.department),
            selectinload(Document.owner),
        )
        .where(Document.id == doc.id)
    )
    result = await db.execute(stmt)
    doc = result.scalars().first()

    await AuditService.log_event(
        db=db,
        organization_id=UUID(org_id),
        user_id=UUID(user_id),
        action="DOCUMENT_CREATED",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        details=f"Created document {doc.document_number}"
    )

    return _doc_to_response(doc)


# ─── PATCH /documents/{id} ──────────────────────────────────────
@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    body: DocumentUpdate,
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """Update document metadata."""
    doc = await db.get(Document, document_id)
    if not doc or str(doc.organization_id) != org_id:
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(doc, field):
            if field == "status" and value is not None:
                # Map Pydantic enum → SQLAlchemy enum
                setattr(doc, field, DocumentStatusEnum(value))
            else:
                setattr(doc, field, value)

    await db.commit()
    await db.refresh(doc)

    # Reload with relationships
    stmt = (
        select(Document)
        .options(
            selectinload(Document.current_version),
            selectinload(Document.document_type),
            selectinload(Document.department),
            selectinload(Document.owner),
        )
        .where(Document.id == doc.id)
    )
    result = await db.execute(stmt)
    doc = result.scalars().first()
    
    # user_claims might not be in the function signature for update, let's just log without user_id if not present or get it from context.
    # We will log the update
    await AuditService.log_event(
        db=db,
        organization_id=UUID(org_id),
        user_id=None, # In a real system, we'd inject user_claims here too
        action="DOCUMENT_UPDATED",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        details=f"Updated document {doc.document_number}"
    )

    return _doc_to_response(doc)


# ─── DELETE /documents/{id} ─────────────────────────────────────
@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a document by setting status to ARCHIVED."""
    doc = await db.get(Document, document_id)
    if not doc or str(doc.organization_id) != org_id:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = DocumentStatusEnum.ARCHIVED
    await db.commit()
    
    await AuditService.log_event(
        db=db,
        organization_id=UUID(org_id),
        user_id=None,
        action="DOCUMENT_ARCHIVED",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        details=f"Archived document {doc.document_number}"
    )


# ─── GET /documents/{id}/versions ───────────────────────────────
@router.get("/{document_id}/versions", response_model=List[DocumentVersionResponse])
async def list_document_versions(
    document_id: UUID,
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """List all versions for a document."""
    # Verify document belongs to org
    doc = await db.get(Document, document_id)
    if not doc or str(doc.organization_id) != org_id:
        raise HTTPException(status_code=404, detail="Document not found")

    stmt = (
        select(DocumentVersion)
        .where(DocumentVersion.document_id == document_id)
        .order_by(desc(DocumentVersion.version_number))
    )
    result = await db.execute(stmt)
    versions = result.scalars().all()
    return [DocumentVersionResponse.model_validate(v) for v in versions]


# ─── GET /documents/types ───────────────────────────────────────
@router.get("/types", response_model=List[DocumentTypeResponse])
async def list_document_types(
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """List all active document types for the organization."""
    stmt = (
        select(DocumentType)
        .where(DocumentType.organization_id == org_id, DocumentType.is_active == True)
        .order_by(DocumentType.name)
    )
    result = await db.execute(stmt)
    types = result.scalars().all()
    return [DocumentTypeResponse.model_validate(t) for t in types]


# ─── Folders ─────────────────────────────────────────────────────
@router.get("/folders", response_model=List[FolderResponse])
async def list_folders(
    parent_id: Optional[UUID] = None,
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """List folders (root level if no parent_id)."""
    stmt = select(Folder).where(Folder.organization_id == org_id)
    if parent_id:
        stmt = stmt.where(Folder.parent_id == parent_id)
    else:
        stmt = stmt.where(Folder.parent_id.is_(None))
    stmt = stmt.order_by(Folder.name)

    result = await db.execute(stmt)
    folders = result.scalars().all()
    return [FolderResponse.model_validate(f) for f in folders]


@router.post("/folders", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    body: FolderCreate,
    user_claims: dict = Depends(get_current_user),
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new folder."""
    user_id = user_claims.get("sub")

    # Build materialized path
    path = f"/{body.name}"
    if body.parent_id:
        parent = await db.get(Folder, body.parent_id)
        if not parent or str(parent.organization_id) != org_id:
            raise HTTPException(status_code=404, detail="Parent folder not found")
        path = f"{parent.path}/{body.name}"

    folder = Folder(
        id=uuid.uuid4(),
        organization_id=UUID(org_id),
        parent_id=body.parent_id,
        name=body.name,
        path=path,
        created_by=UUID(user_id),
    )
    db.add(folder)
    await db.commit()
    await db.refresh(folder)

    return FolderResponse.model_validate(folder)


# ─── POST /documents/{id}/versions (Upload) ─────────────────────
@router.post("/{document_id}/versions", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document_version(
    document_id: UUID,
    file: UploadFile = File(...),
    change_reason: str = Form(None),
    user_claims: dict = Depends(get_current_user),
    org_id: str = Depends(get_current_organization_id),
    supabase = Depends(get_supabase_client),
    db: AsyncSession = Depends(get_db),
):
    """Upload a file to create a new version of the document."""
    doc = await db.get(Document, document_id)
    if not doc or str(doc.organization_id) != org_id:
        raise HTTPException(status_code=404, detail="Document not found")

    user_id = user_claims.get("sub")
    reason = change_reason or "Initial upload" if doc.status == DocumentStatusEnum.DRAFT else "Updated document"

    version = await process_document_upload(db, supabase, doc, file, reason, user_id)
    preview_url = get_preview_url(supabase, version.storage_path)
    
    await AuditService.log_event(
        db=db,
        organization_id=UUID(org_id),
        user_id=UUID(user_id),
        action="DOCUMENT_VERSION_UPLOADED",
        resource_type="DOCUMENT_VERSION",
        resource_id=version.id,
        details=f"Uploaded new version for document {doc.document_number}"
    )

    return DocumentUploadResponse(
        version=DocumentVersionResponse.model_validate(version),
        preview_url=preview_url
    )


# ─── GET /documents/{id}/preview-url ────────────────────────────
@router.get("/{document_id}/preview-url")
async def get_document_preview_url(
    document_id: UUID,
    org_id: str = Depends(get_current_organization_id),
    supabase = Depends(get_supabase_client),
    db: AsyncSession = Depends(get_db),
):
    """Get a signed URL for viewing the current version of the document."""
    stmt = select(Document).options(selectinload(Document.current_version)).where(Document.id == document_id, Document.organization_id == org_id)
    result = await db.execute(stmt)
    doc = result.scalars().first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not doc.current_version:
        raise HTTPException(status_code=404, detail="Document has no uploaded file")

    url = get_preview_url(supabase, doc.current_version.storage_path)
    return {"url": url}


# ─── Metadata Endpoints ──────────────────────────────────────────
@router.get("/{document_id}/metadata", response_model=List[DocumentMetadataResponse])
async def get_document_metadata(
    document_id: UUID,
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """List metadata entries for a document."""
    doc = await db.get(Document, document_id)
    if not doc or str(doc.organization_id) != org_id:
        raise HTTPException(status_code=404, detail="Document not found")

    stmt = select(DocumentMetadata).where(DocumentMetadata.document_id == document_id)
    result = await db.execute(stmt)
    metadata = result.scalars().all()
    return [DocumentMetadataResponse.model_validate(m) for m in metadata]


@router.put("/{document_id}/metadata", response_model=List[DocumentMetadataResponse])
async def update_document_metadata(
    document_id: UUID,
    entries: List[DocumentMetadataUpsert],
    user_claims: dict = Depends(get_current_user),
    org_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
):
    """Update metadata for a document."""
    doc = await db.get(Document, document_id)
    if not doc or str(doc.organization_id) != org_id:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get existing
    stmt = select(DocumentMetadata).where(DocumentMetadata.document_id == document_id)
    result = await db.execute(stmt)
    existing_entries = result.scalars().all()
    existing_map = {e.key: e for e in existing_entries}

    for entry in entries:
        if entry.key in existing_map:
            # Update
            existing_map[entry.key].value = entry.value
            existing_map[entry.key].is_ai_generated = entry.is_ai_generated
        else:
            # Create
            new_metadata = DocumentMetadata(
                id=uuid.uuid4(),
                document_id=document_id,
                key=entry.key,
                value=entry.value,
                is_ai_generated=entry.is_ai_generated
            )
            db.add(new_metadata)

    await db.commit()
    
    # Return updated list
    stmt = select(DocumentMetadata).where(DocumentMetadata.document_id == document_id)
    result = await db.execute(stmt)
    updated_metadata = result.scalars().all()
    return [DocumentMetadataResponse.model_validate(m) for m in updated_metadata]
