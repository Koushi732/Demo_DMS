from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import jwt
from typing import Dict, Any, Optional

from ..config import settings
from ..database import get_db

security = HTTPBearer()

def get_supabase_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_anon_key)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Validates the Supabase JWT and returns the user claims.
    Ensures that the token is valid and hasn't expired.
    """
    token = credentials.credentials
    try:
        # Supabase uses HS256 to sign JWTs with the JWT secret
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.auth import User

async def get_current_organization_id(
    user_claims: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> str:
    """
    Extracts the organization_id by looking up the user in the database (Option B).
    """
    user_id = user_claims.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token structure",
        )
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user or not user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to an organization",
        )
        
    return str(user.organization_id)
