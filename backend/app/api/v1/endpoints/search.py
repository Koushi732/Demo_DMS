from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, text
from typing import Any, Dict, Optional, List
from uuid import UUID

from ...database import get_db
from ..deps import get_current_user, get_current_organization_id
from ...models.document import Document

router = APIRouter()


@router.get("/search")
async def full_text_search(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    department_id: Optional[UUID] = None,
    document_type_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    organization_id: str = Depends(get_current_organization_id),
) -> Any:
    """Full-text search across documents using PostgreSQL tsvector."""
    query = select(Document).filter(Document.organization_id == organization_id)
    
    # Full-text search using tsvector
    search_query = func.plainto_tsquery('english', q)
    query = query.filter(
        text("search_vector @@ plainto_tsquery('english', :q)").bindparams(q=q)
    )
    
    if status:
        query = query.filter(Document.status == status)
    if department_id:
        query = query.filter(Document.department_id == department_id)
    if document_type_id:
        query = query.filter(Document.document_type_id == document_type_id)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Paginate & rank
    query = query.order_by(
        text("ts_rank(search_vector, plainto_tsquery('english', :q)) DESC").bindparams(q=q)
    )
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    docs = result.scalars().all()
    
    items = []
    for d in docs:
        items.append({
            "id": str(d.id),
            "document_number": d.document_number,
            "title": d.title,
            "description": d.description,
            "status": d.status.value if d.status else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "updated_at": d.updated_at.isoformat() if d.updated_at else None,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "query": q,
    }
