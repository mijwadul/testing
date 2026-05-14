from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    # Role: gm (General Manager), finance (Finance Staff), admin (Admin/HR), field (Field Staff)
    role = Column(String, default="field")  # gm, finance, admin, field
    is_admin = Column(Boolean, default=False)  # GM level
    is_superuser = Column(Boolean, default=False)  # Backward compatibility
    is_active = Column(Boolean, default=True)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)  # Link to employee record
    last_login = Column(DateTime(timezone=True), nullable=True)
    password_change_required = Column(Boolean, default=False, nullable=False)  # Force password change on first login
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())