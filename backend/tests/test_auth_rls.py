import pytest
import jwt
from datetime import datetime, timedelta, timezone
from app.config import settings
from unittest.mock import patch, MagicMock

# 32 byte secret for testing
TEST_SECRET = "this_is_a_test_secret_that_is_32_bytes_long"

def create_mock_token(payload_override=None, expired=False, secret=None):
    payload = {
        "sub": "user_id_123",
        "email": "test@example.com",
        "organization_id": "org_id_123",
        "exp": datetime.now(timezone.utc) + timedelta(days=1)
    }
    
    if expired:
        payload["exp"] = datetime.now(timezone.utc) - timedelta(days=1)
        
    if payload_override:
        payload.update(payload_override)
        
    signing_secret = secret if secret else TEST_SECRET
    return jwt.encode(payload, signing_secret, algorithm="HS256")

@pytest.fixture
def mock_supabase():
    with patch("app.api.deps.create_client") as mock_create:
        mock_client = MagicMock()
        mock_create.return_value = mock_client
        
        # Setup successful get_user response
        mock_user = MagicMock()
        mock_user.id = "user_id_123"
        mock_user.email = "test@example.com"
        mock_user.aud = "authenticated"
        mock_user.role = "authenticated"
        
        mock_response = MagicMock()
        mock_response.user = mock_user
        mock_client.auth.get_user.return_value = mock_response
        
        yield mock_client

def test_auth_me_unauthenticated(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_auth_me_authenticated(client, mock_supabase):
    token = create_mock_token()
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["email"] == "test@example.com"
    # Note: organization id comes from db lookup in get_current_organization_id
    # But for /auth/me we might need to mock db as well if it hits db.
    # Since this is a simple mock, we'll just check status and email.

def test_auth_me_invalid_token(client, mock_supabase):
    # Mock exception for invalid token
    mock_supabase.auth.get_user.side_effect = Exception("Invalid token")
    
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid authentication credentials"

def test_auth_me_expired_token(client, mock_supabase):
    mock_supabase.auth.get_user.side_effect = Exception("Token has expired")
    
    token = create_mock_token(expired=True)
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid authentication credentials"

def test_auth_me_wrong_signature(client, mock_supabase):
    mock_supabase.auth.get_user.side_effect = Exception("Invalid signature")
    
    token = create_mock_token(secret="wrong_secret_string")
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid authentication credentials"
