import sys
import os

if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import asyncio
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set dummy variable to satisfy Settings validation for missing storage_url
if "STORAGE_URL" not in os.environ:
    os.environ["STORAGE_URL"] = "dummy"

from app.database import AsyncSessionLocal
from app.models.auth import User, Role, Organization, Department, Permission

async def verify():
    async with AsyncSessionLocal() as session:
        print("--- MASTER ACCOUNT VERIFICATION ---")
        stmt = select(User).options(
            selectinload(User.organization),
            selectinload(User.department),
            selectinload(User.roles).selectinload(Role.permissions)
        ).where(User.email == 'admin@aureonpharma.com')
        result = await session.execute(stmt)
        user = result.scalars().first()
        
        if not user:
            print("ERROR: User not found!")
            return
            
        print(f"Email: {user.email}")
        print(f"Organization: {user.organization.name}")
        print(f"Department: {user.department.name}")
        
        role = user.roles[0] if user.roles else None
        if not role:
            print("ERROR: No role assigned!")
            return
            
        print(f"Role: {role.name}")
        
        print("\n--- EXACT PERMISSION INVENTORY ---")
        perms = [p.name for p in role.permissions]
        for p in perms:
            print(f"- {p}")
            
        print(f"Total permissions: {len(perms)}")

if __name__ == "__main__":
    asyncio.run(verify())
