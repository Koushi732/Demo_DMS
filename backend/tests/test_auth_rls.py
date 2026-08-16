import pytest
import jwt
from datetime import datetime, timedelta
from app.config import settings

def create_mock_token(payload_override=None, expired=False, secret=None):
    payload = {
        "sub": "user_id_123",
        "email": "test@example.com",
        "organization_id": "org_id_123",
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    
    if expired:
        payload["exp"] = datetime.utcnow() - timedelta(days=1)
        
    if payload_override:
        payload.update(payload_override)
        
    signing_secret = secret if secret else settings.supabase_jwt_secret
    return jwt.encode(payload, signing_secret, algorithm="HS256")

def test_auth_me_unauthenticated(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403

def test_auth_me_authenticated(client):
    token = create_mock_token()
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["email"] == "test@example.com"
    assert data["data"]["organization"]["id"] == "org_id_123"

def test_auth_me_invalid_token(client):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid authentication credentials"

def test_auth_me_expired_token(client):
    token = create_mock_token(expired=True)
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Token has expired"

def test_auth_me_wrong_signature(client):
    token = create_mock_token(secret="wrong_secret_string")
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid authentication credentials"
