from sqlalchemy import Column, String, Boolean, ForeignKey, Table, Text
from sqlalchemy.orm import relationship

from .base import UUIDMixin, TimestampMixin
from ..database import Base

class Organization(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "organizations"

    name = Column(String(255), nullable=False)
    domain = Column(String(255))
    is_active = Column(Boolean, default=True)

    departments = relationship("Department", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="organization", cascade="all, delete-orphan")

class Department(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "departments"

    organization_id = Column(ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    head_user_id = Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="departments")
    users = relationship("User", back_populates="department", foreign_keys="User.department_id")
    head_user = relationship("User", foreign_keys=[head_user_id])

class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"
    # id is explicitly a foreign key to auth.users in Supabase, but SQLAlchemy just sees it as UUID primary key
    
    organization_id = Column(ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False)
    department_id = Column(ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    email = Column(String(255), nullable=False, unique=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    position = Column(String(255))
    is_active = Column(Boolean, default=True)
    last_login_at = Column(String) # Simple string/datetime representation

    organization = relationship("Organization", back_populates="users")
    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    roles = relationship("Role", secondary="user_roles", back_populates="users", primaryjoin="User.id == user_roles.c.user_id", secondaryjoin="Role.id == user_roles.c.role_id")

class Permission(UUIDMixin, Base):
    __tablename__ = "permissions"
    
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    module = Column(String(100), nullable=False)
    created_at = Column(String) # Base doesn't have TimestampMixin to avoid updated_at
    
    roles = relationship("Role", secondary="role_permissions", back_populates="permissions")

class Role(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "roles"

    organization_id = Column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_system_role = Column(Boolean, default=False)

    organization = relationship("Organization", back_populates="roles")
    users = relationship("User", secondary="user_roles", back_populates="roles", primaryjoin="Role.id == user_roles.c.role_id", secondaryjoin="User.id == user_roles.c.user_id")
    permissions = relationship("Permission", secondary="role_permissions", back_populates="roles")

# Association Tables
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", String)
)

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("assigned_by", ForeignKey("users.id", ondelete="SET NULL")),
    Column("created_at", String)
)
