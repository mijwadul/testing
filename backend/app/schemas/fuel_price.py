from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FuelPriceBase(BaseModel):
    price_per_liter: float
    fuel_type: str
    effective_date: datetime

class FuelPriceCreate(FuelPriceBase):
    pass

class FuelPriceUpdate(BaseModel):
    price_per_liter: Optional[float] = None
    fuel_type: Optional[str] = None
    effective_date: Optional[datetime] = None

class FuelPrice(FuelPriceBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True
