from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database import get_db
from app.models.auth import User

router = APIRouter()

@router.get("/me")
async def get_current_user_profile(
    user_claims: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the current authenticated user's profile from the database,
    including organization, department, and role relationships.
    """
    user_id = user_claims.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token structure",
        )

    # Fetch user with relationships
    stmt = (
        select(User)
        .options(
            selectinload(User.organization),
            selectinload(User.department),
            selectinload(User.roles)
        )
        .where(User.id == user_id)
    )
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found in database",
        )

    return {
        "status": "success",
        "data": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "position": user.position,
            "is_active": user.is_active,
            "organization": {
                "id": str(user.organization.id),
                "name": user.organization.name
            } if user.organization else None,
            "department": {
                "id": str(user.department.id),
                "name": user.department.name
            } if user.department else None,
            "roles": [{"id": str(r.id), "name": r.name} for r in user.roles]
        }
    }
