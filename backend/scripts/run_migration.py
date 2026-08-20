import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

async def run_migration():
    db_url = os.environ.get("DATABASE_URL")
    if db_url and db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
        
    engine = create_async_engine(db_url)
    
    migration_path = os.path.join(os.path.dirname(__file__), '..', '..', 'supabase', 'migrations', '20260820000000_006_processing_intelligence.sql')
    with open(migration_path, 'r') as f:
        sql = f.read()
        
    async with engine.begin() as conn:
        print("Applying migration...")
        await conn.execute(text(sql))
        print("Migration applied successfully.")
        
    await engine.dispose()

if __name__ == "__main__":
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_migration())
