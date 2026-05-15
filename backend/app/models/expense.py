from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from .base import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(Date, nullable=False)
    category = Column(
        String(50), nullable=False
    )  # koordinasi, administrasi, transport, makan, lain-lain, operasional
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    receipt_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
