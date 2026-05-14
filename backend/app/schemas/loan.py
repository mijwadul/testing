from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EmployeeLoanCreate(BaseModel):
    """Schema untuk create loan"""

    nominal: float
    loan_date: date
    deduction_per_period: Optional[float] = 0
    notes: Optional[str] = None


class EmployeeLoanUpdate(BaseModel):
    """Schema untuk update loan"""

    remaining_balance: Optional[float] = None
    deduction_per_period: Optional[float] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class EmployeeLoanResponse(BaseModel):
    """Schema response untuk loan"""

    id: int
    employee_id: int
    nominal: float
    loan_date: date
    remaining_balance: float
    deduction_per_period: float
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime
    created_by: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
