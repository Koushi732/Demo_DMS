import asyncio
import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.database import AsyncSessionLocal
from app.models.auth import User
from app.models.document import DocumentType
from sqlalchemy import select

async def run():
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(User).where(User.email=='admin@aureonpharma.com'))).scalars().first()
        print(f"User org: {user.organization_id}" if user else "User not found")
        
        dts = (await session.execute(select(DocumentType))).scalars().all()
        print(f"Doc types orgs: {[dt.organization_id for dt in dts]}")

if __name__ == "__main__":
    asyncio.run(run())
