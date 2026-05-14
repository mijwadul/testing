from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FuelLogBase(BaseModel):
    equipment_id: int
    liters_filled: float
    refuel_date: datetime
    location: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    hour_meter: Optional[float] = None
    operating_hours: Optional[float] = None


class FuelLogCreate(FuelLogBase):
    pass


class FuelLogUpdate(BaseModel):
    liters_filled: Optional[float] = None
    refuel_date: Optional[datetime] = None
    location: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    hour_meter: Optional[float] = None
    operating_hours: Optional[float] = None


class FuelLog(FuelLogBase):
    id: int
    recorded_by: Optional[int] = None
    created_at: datetime
    refuel_date: datetime

    model_config = ConfigDict(from_attributes=True)


class FuelLogWithEquipment(FuelLog):
    equipment_name: str
    equipment_type: str


class FuelEfficiencyStats(BaseModel):
    total_fuel_consumed: float
    equipment_count: int


class FuelEquipmentReportItem(BaseModel):
    equipment_id: int
    equipment_name: str
    equipment_type: str
    location: Optional[str] = None
    total_liters: float
    total_work_hours: float
    liter_per_hour: Optional[float] = None
    status_anomali: bool = False
    pesan_alert: str = ""
    refuel_count: int
