from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from typing import Dict, Any
import logging

from ..config import settings
from ..database import get_db

security = HTTPBearer(auto_error=False)
logger = logging.getLogger("uvicorn.error")

def get_supabase_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Validates the Supabase JWT by calling Supabase Auth's getUser endpoint.
    This correctly handles ES256-signed tokens from Supabase Cloud.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        # Use Supabase anon client to verify the token, since the token belongs to the user
        supabase = create_client(settings.supabase_url, settings.supabase_anon_key)
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = user_response.user
        return {
            "sub": str(user.id),
            "email": user.email,
            "aud": user.aud,
            "role": user.role,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
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
    Extracts the organization_id by looking up the user in the database.
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


async def get_current_db_user(
    user_claims: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Returns the full database User object for the authenticated user.
    """
    user_id = user_claims.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token structure",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return user
