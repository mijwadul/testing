from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    # Personal Data
    employee_code = Column(String, unique=True, nullable=True)  # Kode karyawan
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    nik = Column(String, unique=True, nullable=True)  # Nomor KTP
    address = Column(Text)
    date_of_birth = Column(Date)
    place_of_birth = Column(String)
    gender = Column(String)  # male, female
    marital_status = Column(String)  # single, married, divorced, widowed

    # Employment Data
    position = Column(String)  # Jabatan
    department = Column(String)  # Departemen
    employment_type = Column(
        String, default="permanent"
    )  # permanent, contract, freelance
    join_date = Column(Date)
    resign_date = Column(Date, nullable=True)

    # Payroll Data (Financial - sensitive)
    daily_salary = Column(Float, default=0)  # Gaji per hari
    hourly_overtime_rate = Column(Float, default=0)  # Rate lembur per jam

    # Loan/Deduction Data
    loan_balance = Column(Float, default=0)  # Sisa pinjaman yang harus dipotong
    loan_deduction_per_period = Column(
        Float, default=0
    )  # Potongan per periode (hari/minggu/bulan)
    debt_to_company = Column(
        Float, default=0
    )  # Hutang karyawan ke perusahaan (kecelakaan, dll)

    # Attendance & Performance
    work_days_per_month = Column(Integer, default=25)  # Hari kerja default

    # Status
    status = Column(String, default="active")  # active, inactive, terminated, on_leave
    is_active = Column(Boolean, default=True)

    # Bank Account
    bank_name = Column(String)
    bank_account_number = Column(String)
    bank_account_name = Column(String)

    # Emergency Contact
    emergency_contact_name = Column(String)
    emergency_contact_phone = Column(String)
    emergency_contact_relation = Column(String)

    # Linked User Account
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # Link ke tabel users

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    payroll_records = relationship("PayrollRecord", back_populates="employee")
