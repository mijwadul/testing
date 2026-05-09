from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from .base import Base

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    liters_filled = Column(Float, nullable=False)  # Jumlah liter diisi
    location = Column(String, nullable=True)  # Lokasi/proyek
    photo_url = Column(String, nullable=True)  # Foto nota (opsional)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # User yang mencatat
    notes = Column(String, nullable=True)  # Catatan tambahan
    refuel_date = Column(DateTime(timezone=True), nullable=False)  # Tanggal/jam pengisian BBM
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Waktu pencatatan di sistem

    # Relasi akan dibuat di query
    # equipment = relationship("Equipment", back_populates="fuel_logs")
