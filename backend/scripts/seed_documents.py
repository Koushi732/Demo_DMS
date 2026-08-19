"""
Seed script: Populates the document repository with realistic demo data.
Run after seed_master_admin.py has created the organization and admin user.

Usage:
  python scripts/seed_documents.py
"""

import sys
import os

if sys.platform == "win32":
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import asyncio
import uuid
from datetime import datetime, date, timedelta, timezone

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if "STORAGE_URL" not in os.environ:
    os.environ["STORAGE_URL"] = "dummy"

from app.database import AsyncSessionLocal
from app.models.auth import Organization, Department, User
from app.models.document import DocumentType, Folder, Document, DocumentVersion, DocumentStatusEnum
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload


# ── Demo Data ────────────────────────────────────────────────────

DOCUMENT_TYPES = [
    {"name": "Standard Operating Procedure", "prefix": "SOP", "category": "Procedures", "description": "Standard operating procedures for regulated processes."},
    {"name": "Policy", "prefix": "POL", "category": "Governance", "description": "High-level quality and compliance policies."},
    {"name": "Work Instruction", "prefix": "WI", "category": "Procedures", "description": "Step-by-step work instructions for operators."},
    {"name": "Form", "prefix": "FRM", "category": "Records", "description": "Fillable forms and templates for recording data."},
    {"name": "Validation Plan", "prefix": "VAL", "category": "Validation", "description": "Computer system and process validation plans."},
    {"name": "Protocol", "prefix": "PRT", "category": "Validation", "description": "Validation protocols and qualification documents."},
]

FOLDERS = [
    {"name": "Quality Assurance", "path": "/Quality Assurance"},
    {"name": "Manufacturing", "path": "/Manufacturing"},
    {"name": "Information Technology", "path": "/Information Technology"},
    {"name": "Regulatory Affairs", "path": "/Regulatory Affairs"},
]

DEMO_DOCUMENTS = [
    {
        "doc_number": "SOP-QA-014",
        "title": "Standard Operating Procedure for Batch Record Review",
        "description": "Defines the procedure for the review of batch production and control records before final product release.",
        "type_prefix": "SOP",
        "dept_name": "Quality Assurance",
        "folder_name": "Quality Assurance",
        "status": "EFFECTIVE",
        "classification": "Internal",
        "tags": ["GMP", "Batch Review", "Quality"],
        "effective_date": date(2026, 5, 12),
        "next_review_date": date(2027, 5, 12),
        "version": {
            "number": 2,
            "filename": "SOP-QA-014_v2.0_Batch_Record_Review.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 245760,
            "status": "EFFECTIVE",
        },
    },
    {
        "doc_number": "SOP-QA-021",
        "title": "Deviation Management Procedure",
        "description": "Guidelines for recording, investigating, and resolving quality deviations in manufacturing.",
        "type_prefix": "SOP",
        "dept_name": "Quality Assurance",
        "folder_name": "Quality Assurance",
        "status": "UNDER_REVIEW",
        "classification": "Internal",
        "tags": ["Deviations", "CAPA", "Quality"],
        "effective_date": None,
        "next_review_date": None,
        "version": {
            "number": 1,
            "filename": "SOP-QA-021_v1.1_Deviation_Mgmt.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 189440,
            "status": "DRAFT",
        },
    },
    {
        "doc_number": "POL-QA-003",
        "title": "Quality Management Policy",
        "description": "High-level policy defining Aureon Pharmaceuticals' commitment to quality standards.",
        "type_prefix": "POL",
        "dept_name": "Quality Assurance",
        "folder_name": "Quality Assurance",
        "status": "EFFECTIVE",
        "classification": "Public",
        "tags": ["Quality Policy", "Management", "Compliance"],
        "effective_date": date(2025, 1, 1),
        "next_review_date": date(2027, 1, 1),
        "version": {
            "number": 3,
            "filename": "POL-QA-003_v3.0_Quality_Mgmt_Policy.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 102400,
            "status": "EFFECTIVE",
        },
    },
    {
        "doc_number": "WI-MFG-008",
        "title": "Equipment Cleaning Procedure",
        "description": "Work instructions for the cleaning of primary mixing vessels in Line A.",
        "type_prefix": "WI",
        "dept_name": "Manufacturing",
        "folder_name": "Manufacturing",
        "status": "EFFECTIVE",
        "classification": "Internal",
        "tags": ["Cleaning", "Equipment", "Manufacturing"],
        "effective_date": date(2026, 2, 10),
        "next_review_date": date(2027, 2, 10),
        "version": {
            "number": 4,
            "filename": "WI-MFG-008_v4.2_Equipment_Cleaning.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 327680,
            "status": "EFFECTIVE",
        },
    },
    {
        "doc_number": "FRM-QA-112",
        "title": "Deviation Investigation Form",
        "description": "Standard template form to be used when investigating a manufacturing deviation.",
        "type_prefix": "FRM",
        "dept_name": "Quality Assurance",
        "folder_name": "Quality Assurance",
        "status": "APPROVED",
        "classification": "Internal",
        "tags": ["Form", "Deviation", "Investigation"],
        "effective_date": None,
        "next_review_date": None,
        "version": {
            "number": 2,
            "filename": "FRM-QA-112_v2.1_Deviation_Investigation.docx",
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "size_bytes": 51200,
            "status": "APPROVED",
        },
    },
    {
        "doc_number": "VAL-IT-005",
        "title": "Computer System Validation Plan - ERP",
        "description": "Validation master plan for the upcoming ERP system upgrade.",
        "type_prefix": "VAL",
        "dept_name": "Information Technology",
        "folder_name": "Information Technology",
        "status": "DRAFT",
        "classification": "Confidential",
        "tags": ["Validation", "CSV", "ERP", "IT"],
        "effective_date": None,
        "next_review_date": None,
        "version": {
            "number": 1,
            "filename": "VAL-IT-005_v1.0_ERP_Validation_Plan.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 409600,
            "status": "DRAFT",
        },
    },
    {
        "doc_number": "SOP-MFG-042",
        "title": "Aseptic Gowning Procedures for Class A Area",
        "description": "Previous version of gowning procedures before Annex 1 update.",
        "type_prefix": "SOP",
        "dept_name": "Manufacturing",
        "folder_name": "Manufacturing",
        "status": "SUPERSEDED",
        "classification": "Internal",
        "tags": ["Aseptic", "Gowning", "Annex 1"],
        "effective_date": date(2020, 11, 15),
        "next_review_date": None,
        "version": {
            "number": 3,
            "filename": "SOP-MFG-042_v3.1_Aseptic_Gowning.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 286720,
            "status": "SUPERSEDED",
        },
    },
    {
        "doc_number": "PRT-QA-007",
        "title": "Equipment Qualification Protocol - Autoclave #3",
        "description": "Installation and operational qualification protocol for replacement autoclave unit.",
        "type_prefix": "PRT",
        "dept_name": "Quality Assurance",
        "folder_name": "Quality Assurance",
        "status": "UNDER_REVIEW",
        "classification": "Internal",
        "tags": ["IQ/OQ", "Equipment", "Qualification"],
        "effective_date": None,
        "next_review_date": None,
        "version": {
            "number": 1,
            "filename": "PRT-QA-007_v1.0_Autoclave_Qualification.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 524288,
            "status": "DRAFT",
        },
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        # 1. Get Organization
        org = await session.scalar(
            select(Organization).where(Organization.name == "Aureon Pharmaceuticals")
        )
        if not org:
            print("ERROR: Organization not found. Run seed_master_admin.py first.")
            return

        # 2. Get admin user (document owner)
        admin = await session.scalar(
            select(User).where(User.email == "admin@aureonpharma.com")
        )
        if not admin:
            print("ERROR: Admin user not found. Run seed_master_admin.py first.")
            return

        print(f"Organization: {org.name} ({org.id})")
        print(f"Owner: {admin.email} ({admin.id})")

        # 3. Create departments if missing
        dept_map = {}
        for name in ["Quality Assurance", "Manufacturing", "Information Technology", "Regulatory Affairs"]:
            dept = await session.scalar(
                select(Department).where(Department.name == name, Department.organization_id == org.id)
            )
            if not dept:
                dept = Department(name=name, organization_id=org.id)
                session.add(dept)
                await session.flush()
                print(f"  Created department: {name}")
            dept_map[name] = dept

        # 4. Create document types
        type_map = {}
        for dt in DOCUMENT_TYPES:
            existing = await session.scalar(
                select(DocumentType).where(
                    DocumentType.prefix == dt["prefix"],
                    DocumentType.organization_id == org.id,
                )
            )
            if not existing:
                existing = DocumentType(
                    organization_id=org.id,
                    name=dt["name"],
                    prefix=dt["prefix"],
                    category=dt["category"],
                    description=dt["description"],
                )
                session.add(existing)
                await session.flush()
                print(f"  Created document type: {dt['prefix']} — {dt['name']}")
            type_map[dt["prefix"]] = existing

        # 5. Create folders
        folder_map = {}
        for f in FOLDERS:
            existing = await session.scalar(
                select(Folder).where(
                    Folder.name == f["name"],
                    Folder.organization_id == org.id,
                    Folder.parent_id.is_(None),
                )
            )
            if not existing:
                existing = Folder(
                    organization_id=org.id,
                    name=f["name"],
                    path=f["path"],
                    created_by=admin.id,
                )
                session.add(existing)
                await session.flush()
                print(f"  Created folder: {f['name']}")
            folder_map[f["name"]] = existing

        # 6. Create documents + versions
        for doc_data in DEMO_DOCUMENTS:
            existing = await session.scalar(
                select(Document).where(
                    Document.document_number == doc_data["doc_number"],
                    Document.organization_id == org.id,
                )
            )
            if existing:
                print(f"  Document {doc_data['doc_number']} already exists, skipping.")
                continue

            doc_type = type_map.get(doc_data["type_prefix"])
            dept = dept_map.get(doc_data["dept_name"])
            folder = folder_map.get(doc_data["folder_name"])

            doc = Document(
                id=uuid.uuid4(),
                organization_id=org.id,
                document_number=doc_data["doc_number"],
                title=doc_data["title"],
                description=doc_data["description"],
                document_type_id=doc_type.id if doc_type else None,
                department_id=dept.id if dept else None,
                folder_id=folder.id if folder else None,
                owner_id=admin.id,
                classification=doc_data["classification"],
                status=DocumentStatusEnum(doc_data["status"]),
                tags=doc_data["tags"],
                effective_date=doc_data["effective_date"],
                next_review_date=doc_data["next_review_date"],
                processing_status="READY",
            )
            session.add(doc)
            await session.flush()

            # Create version
            ver_data = doc_data["version"]
            version = DocumentVersion(
                id=uuid.uuid4(),
                document_id=doc.id,
                version_number=ver_data["number"],
                storage_path=f"{org.id}/{doc.id}/{ver_data['filename']}",
                filename=ver_data["filename"],
                mime_type=ver_data["mime_type"],
                size_bytes=ver_data["size_bytes"],
                status=DocumentStatusEnum(ver_data["status"]),
                created_by=admin.id,
                created_at=datetime.now(timezone.utc),
            )
            session.add(version)
            await session.flush()

            # Link current_version
            doc.current_version_id = version.id
            await session.flush()

            print(f"  Created document: {doc_data['doc_number']} — {doc_data['title']}")

        await session.commit()
        print("\n[OK] Document seeding complete!")

        # Verify
        count = await session.scalar(
            select(func.count()).select_from(Document).where(Document.organization_id == org.id)
        )
        print(f"Total documents in org: {count}")


from sqlalchemy import func

if __name__ == "__main__":
    asyncio.run(seed())
