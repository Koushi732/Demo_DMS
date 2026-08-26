import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.document import DocumentType, Folder

DOCUMENT_TYPES = [
    {"name": "Standard Operating Procedure", "prefix": "SOP", "category": "Procedures", "description": "Standard operating procedures for regulated processes."},
    {"name": "Policy", "prefix": "POL", "category": "Governance", "description": "High-level quality and compliance policies."},
    {"name": "Work Instruction", "prefix": "WI", "category": "Procedures", "description": "Step-by-step work instructions for operators."},
    {"name": "Form", "prefix": "FRM", "category": "Records", "description": "Fillable forms and templates for recording data."},
    {"name": "Validation Plan", "prefix": "VAL", "category": "Validation", "description": "Computer system and process validation plans."},
    {"name": "Protocol", "prefix": "PRT", "category": "Validation", "description": "Validation protocols and qualification documents."},
]

async def seed_organization_defaults(db: AsyncSession, organization_id: uuid.UUID) -> dict:
    """Idempotently seed default document types for an organization."""
    created_count = 0
    existing_count = 0
    
    for dt in DOCUMENT_TYPES:
        existing = await db.scalar(
            select(DocumentType).where(
                DocumentType.prefix == dt["prefix"],
                DocumentType.organization_id == organization_id,
            )
        )
        if not existing:
            new_dt = DocumentType(
                organization_id=organization_id,
                name=dt["name"],
                prefix=dt["prefix"],
                category=dt["category"],
                description=dt["description"],
            )
            db.add(new_dt)
            created_count += 1
        else:
            existing_count += 1
            
    if created_count > 0:
        await db.commit()
        
    return {
        "created": created_count,
        "existing": existing_count,
        "total": created_count + existing_count
    }
