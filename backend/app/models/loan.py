from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey, Text, Boolean, func
from .base import Base

class EmployeeLoan(Base):
    """
    Employee Loan Records - Catatan pinjaman karyawan
    """
    __tablename__ = "employee_loans"

    id = Column(Integer, primary_key=True, index=True)
    
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    # Loan Details
    nominal = Column(Float, nullable=False)  # Jumlah pinjaman
    loan_date = Column(Date, nullable=False)  # Tanggal pinjam
    
    # Tracking
    remaining_balance = Column(Float, nullable=False)  # Sisa saldo
    deduction_per_period = Column(Float, default=0)  # Potongan per periode (0 jika manual)
    
    # Status
    is_active = Column(Boolean, default=True)  # Apakah pinjaman masih aktif
    notes = Column(Text)  # Catatan/alasan pinjaman
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer)  # User yang membuat
