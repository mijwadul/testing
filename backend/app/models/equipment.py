from sqlalchemy import Column, Integer, String, Float, DateTime, DECIMAL
from sqlalchemy.sql import func
from .base import Base

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)  # Merk alat berat
    type = Column(String, nullable=False)  # e.g., Bucket Breaker, Loader
    capacity = Column(Float, nullable=True)  # Kapasitas dalam ton
    location = Column(String)
    status = Column(String, default="active")  # active, maintenance, inactive
    
    # Ownership and financial information
    ownership_status = Column(String, default="internal")  # internal, rental
    rental_rate_per_hour = Column(DECIMAL(15, 2), default=0)  # Tarif rental per jam
    deposit_amount = Column(DECIMAL(15, 2), default=0)  # Nilai deposit
    vendor_id = Column(Integer, nullable=True)  # Reference to vendor table
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())