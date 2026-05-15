from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ExpenseBase(BaseModel):
    expense_date: date
    category: str
    description: str
    amount: float
    project_id: Optional[int] = None
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    expense_date: Optional[date] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    project_id: Optional[int] = None
    notes: Optional[str] = None


class ExpenseResponse(ExpenseBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    project_name: Optional[str] = None
    approval_status: str
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
