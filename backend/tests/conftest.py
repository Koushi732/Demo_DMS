import pytest
from httpx import AsyncClient, ASGITransport
import os

# Set required environment variables for testing before importing app
os.environ["SECRET_KEY"] = "test_secret_key"
os.environ["DATABASE_URL"] = "postgresql+psycopg://postgres:postgres@localhost:5432/testdb"
os.environ["SUPABASE_URL"] = "https://test.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "test_anon_key"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "test_service_key"
os.environ["SUPABASE_JWT_SECRET"] = "test_jwt_secret_that_is_at_least_32_chars_long"
os.environ["STORAGE_URL"] = "https://test.supabase.co/storage/v1"

from app.main import app
from fastapi.testclient import TestClient
from app.database import get_db
from unittest.mock import AsyncMock, MagicMock

async def mock_get_db():
    mock_session = AsyncMock()
    
    # Mock the execute().scalars().first() chain for get_current_organization_id
    mock_result = MagicMock()
    mock_user = MagicMock()
    mock_user.id = "user_id_123"
    mock_user.organization_id = "org_id_123"
    mock_user.email = "test@example.com"
    mock_user.first_name = "Test"
    mock_user.last_name = "User"
    mock_user.position = "Tester"
    mock_user.is_active = True
    
    # Relationships
    mock_org = AsyncMock()
    mock_org.id = "org_id_123"
    mock_org.name = "Test Org"
    mock_user.organization = mock_org
    mock_user.department = None
    mock_user.roles = []
    
    mock_result.scalars.return_value.first.return_value = mock_user
    mock_session.execute.return_value = mock_result
    
    yield mock_session

@pytest.fixture
def client():
    app.dependency_overrides[get_db] = mock_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
