import sys
import os

if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import asyncio
from supabase import create_client, Client
from pydantic_settings import BaseSettings

# Set dummy variable to satisfy Settings validation for missing storage_url
if "STORAGE_URL" not in os.environ:
    os.environ["STORAGE_URL"] = "dummy"

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.auth import Organization, Department, Role, Permission, User
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

PERMISSIONS = [
    ("DOCUMENT_CREATE", "Documents"), ("DOCUMENT_VIEW", "Documents"),
    ("DOCUMENT_EDIT", "Documents"), ("DOCUMENT_DELETE", "Documents"),
    ("DOCUMENT_DOWNLOAD", "Documents"), ("DOCUMENT_SUBMIT", "Documents"),
    ("DOCUMENT_REVIEW", "Documents"), ("DOCUMENT_APPROVE", "Documents"),
    ("DOCUMENT_REJECT", "Documents"), ("DOCUMENT_REQUEST_CHANGES", "Documents"),
    ("DOCUMENT_VERSION_CREATE", "Documents"), ("DOCUMENT_VERSION_VIEW", "Documents"),
    ("DOCUMENT_VERSION_RESTORE", "Documents"), ("DOCUMENT_SHARE", "Documents"),
    ("WORKFLOW_CREATE", "Workflows"), ("WORKFLOW_ASSIGN", "Workflows"),
    ("WORKFLOW_REVIEW", "Workflows"), ("WORKFLOW_APPROVE", "Workflows"),
    ("AUDIT_VIEW", "System"),
    ("USER_CREATE", "Users"), ("USER_EDIT", "Users"), ("USER_DEACTIVATE", "Users"),
    ("ROLE_ASSIGN", "Users"), ("SYSTEM_CONFIGURE", "System")
]

import httpx

async def seed_master_admin():
    url = settings.supabase_url
    key = settings.supabase_service_role_key
    
    email = "admin@aureonpharma.com"
    password = "AureonDemo@2026"
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    # 1. Ensure Supabase Auth User
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{url}/auth/v1/admin/users", headers=headers)
            res.raise_for_status()
            users = res.json().get("users", [])
            admin_user = next((u for u in users if u.get("email") == email), None)
            
            if admin_user:
                print(f"User {email} already exists in auth.users.")
                user_id = admin_user["id"]
            else:
                print(f"Creating user {email} in auth.users...")
                create_res = await client.post(
                    f"{url}/auth/v1/admin/users",
                    headers=headers,
                    json={"email": email, "password": password, "email_confirm": True}
                )
                create_res.raise_for_status()
                user_id = create_res.json()["id"]
                print(f"Created user with UUID: {user_id}")
    except Exception as e:
        print(f"Failed interacting with Supabase Auth API: {e}")
        return

    # 2. Add Organization, Dept, Role, User
    async with AsyncSessionLocal() as session:
        # Organization
        org = await session.scalar(select(Organization).where(Organization.name == "Aureon Pharmaceuticals"))
        if not org:
            org = Organization(name="Aureon Pharmaceuticals", domain="aureonpharma.com")
            session.add(org)
            await session.commit()
            await session.refresh(org)
            print("Created Organization")

        # Department
        dept = await session.scalar(select(Department).where(Department.name == "Information Technology", Department.organization_id == org.id))
        if not dept:
            dept = Department(name="Information Technology", organization_id=org.id)
            session.add(dept)
            await session.commit()
            await session.refresh(dept)
            print("Created Department")

        # Permissions
        db_perms = []
        for name, module in PERMISSIONS:
            p = await session.scalar(select(Permission).where(Permission.name == name))
            if not p:
                p = Permission(name=name, module=module)
                session.add(p)
            db_perms.append(p)
        await session.commit()
        for p in db_perms:
            await session.refresh(p)
            
        print("Created/Verified Permissions")

        # Role
        role = await session.scalar(select(Role).options(selectinload(Role.permissions)).where(Role.name == "System Administrator", Role.organization_id == org.id))
        if not role:
            role = Role(name="System Administrator", organization_id=org.id, is_system_role=True)
            role.permissions = db_perms
            session.add(role)
            await session.commit()
            await session.refresh(role)
            print("Created Role")
        else:
            # Add any missing permissions
            role_perm_names = [p.name for p in role.permissions]
            added = False
            for p in db_perms:
                if p.name not in role_perm_names:
                    role.permissions.append(p)
                    added = True
            if added:
                await session.commit()
                print("Added missing permissions to Role")

        # User
        user = await session.scalar(select(User).where(User.id == user_id))
        if not user:
            # Use specific UUID from auth
            user = User(
                id=user_id,
                email=email,
                first_name="Rahul",
                last_name="Sharma",
                position="Master Administrator",
                organization_id=org.id,
                department_id=dept.id
            )
            user.roles = [role]
            session.add(user)
            await session.commit()
            print("Created public.users record linked to auth.users")
        else:
            print("public.users record already exists.")

if __name__ == "__main__":
    asyncio.run(seed_master_admin())
