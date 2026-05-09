from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

class EquipmentBase(BaseModel):
    name: str
    type: str
    location: Optional[str] = None
    status: Optional[str] = "active"
    ownership_status: Optional[str] = "internal"
    rental_rate_per_hour: Optional[Decimal] = 0
    deposit_amount: Optional[Decimal] = 0
    vendor_id: Optional[int] = None

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    ownership_status: Optional[str] = None
    rental_rate_per_hour: Optional[Decimal] = None
    deposit_amount: Optional[Decimal] = None
    vendor_id: Optional[int] = None

class Equipment(EquipmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True