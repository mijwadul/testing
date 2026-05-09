from sqlalchemy import Column, Integer, Float, DateTime, String
from sqlalchemy.sql import func
from .base import Base

class FuelPrice(Base):
    __tablename__ = "fuel_prices"

    id = Column(Integer, primary_key=True, index=True)
    price_per_liter = Column(Float, nullable=False)  # Harga per liter
    fuel_type = Column(String, nullable=False)  # Jenis BBM (solar, premium, dll)
    effective_date = Column(DateTime(timezone=True), nullable=False)  # Tanggal berlaku
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Waktu pencatatan
    created_by = Column(Integer, nullable=True)  # User yang mencatat
