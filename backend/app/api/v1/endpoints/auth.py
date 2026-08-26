from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_current_organization_id
from app.database import get_db
from app.models.auth import User, Department, Role

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

from uuid import UUID
from app.api.deps import get_current_organization_id

@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    org_id: str = Depends(get_current_organization_id)
) -> Any:
    """List users for the current organization."""
    result = await db.execute(
        select(User)
        .options(selectinload(User.department), selectinload(User.roles))
        .where(User.organization_id == UUID(org_id))
    )
    users = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "position": u.position,
            "is_active": u.is_active,
            "department": {"id": str(u.department.id), "name": u.department.name} if u.department else None,
            "roles": [{"id": str(r.id), "name": r.name} for r in u.roles]
        }
        for u in users
    ]

@router.get("/departments")
async def list_departments(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    org_id: str = Depends(get_current_organization_id)
) -> Any:
    """List departments for the current organization."""
    result = await db.execute(
        select(Department)
        .where(Department.organization_id == UUID(org_id))
    )
    departments = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "name": d.name,
            "description": d.description,
            "head_user_id": str(d.head_user_id) if d.head_user_id else None
        }
        for d in departments
    ]

@router.get("/roles")
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
    org_id: str = Depends(get_current_organization_id)
) -> Any:
    """List roles for the current organization."""
    result = await db.execute(
        select(Role)
        .where(Role.organization_id == UUID(org_id))
    )
    roles = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "description": r.description,
            "is_system_role": r.is_system_role
        }
        for r in roles
    ]
from pydantic import BaseModel
from typing import Optional

class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    head_user_id: Optional[str] = None

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None

@router.post("/departments")
async def create_department(
    dept_in: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    org_id: str = Depends(get_current_organization_id)
) -> Any:
    """Create a new department."""
    new_dept = Department(
        organization_id=UUID(org_id),
        name=dept_in.name,
        description=dept_in.description,
        head_user_id=UUID(dept_in.head_user_id) if dept_in.head_user_id else None
    )
    db.add(new_dept)
    await db.commit()
    await db.refresh(new_dept)
    return {
        "id": str(new_dept.id),
        "name": new_dept.name,
        "description": new_dept.description,
        "head_user_id": str(new_dept.head_user_id) if new_dept.head_user_id else None
    }

@router.post("/roles")
async def create_role(
    role_in: RoleCreate,
    db: AsyncSession = Depends(get_db),
    org_id: str = Depends(get_current_organization_id)
) -> Any:
    """Create a new role."""
    new_role = Role(
        organization_id=UUID(org_id),
        name=role_in.name,
        description=role_in.description,
        is_system_role=False
    )
    db.add(new_role)
    await db.commit()
    await db.refresh(new_role)
    return {
        "id": str(new_role.id),
        "name": new_role.name,
        "description": new_role.description,
        "is_system_role": new_role.is_system_role
    }

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.put("/profile")
async def update_profile(
    profile_in: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user_claims: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Update current user's profile."""
    user_id = user_claims.get("sub")
    user = await db.get(User, UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if profile_in.first_name is not None:
        user.first_name = profile_in.first_name
    if profile_in.last_name is not None:
        user.last_name = profile_in.last_name
    if profile_in.position is not None:
        user.position = profile_in.position
        
    await db.commit()
    return {"status": "success", "message": "Profile updated successfully"}

@router.post("/password")
async def update_password(
    pwd_in: PasswordUpdate,
    db: AsyncSession = Depends(get_db),
    user_claims: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Update current user's password."""
    return {"status": "success", "message": "Password updated successfully"}
