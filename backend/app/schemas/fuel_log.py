from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FuelLogBase(BaseModel):
    equipment_id: int
    operating_hours: float
    liters_filled: float
    refuel_date: datetime
    location: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogUpdate(BaseModel):
    operating_hours: Optional[float] = None
    liters_filled: Optional[float] = None
    refuel_date: Optional[datetime] = None
    location: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class FuelLog(FuelLogBase):
    id: int
    recorded_by: Optional[int] = None
    created_at: datetime
    refuel_date: datetime

    class Config:
        from_attributes = True

class FuelLogWithEquipment(FuelLog):
    equipment_name: str
    equipment_type: str

class FuelEfficiencyStats(BaseModel):
    total_fuel_consumed: float
    total_hours_operated: float
    avg_fuel_ratio: float  # Liter per Hour
    equipment_count: int
