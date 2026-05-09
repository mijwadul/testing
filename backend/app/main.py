import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from .api.v1.dashboard import router as dashboard_router
from .api.v1.auth import router as auth_router
from .api.v1.equipment import router as equipment_router
from .api.v1.fuel import router as fuel_router
from .api.v1.work_logs import router as work_logs_router
from .api.v1.employees import router as employees_router
from .core.auth import get_password_hash
from .core.database import SessionLocal, engine
from .models import Base, User
import traceback

app = FastAPI(title='PT. Kusuma Samudera Berkah API')

# CORS middleware - allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)


@app.on_event("startup")
def bootstrap_database():
    """Ensure tables exist and default admin can login on fresh setup."""
    Base.metadata.create_all(bind=engine)
    _migrate_users_columns_if_needed()
    _migrate_fuel_logs_columns_if_needed()
    _migrate_employees_columns_if_needed()

    default_admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "mijwadul@kusuma.com").strip().lower()
    default_admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "12345")

    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.email == default_admin_email).first()
        if existing_admin is None:
            db.add(
                User(
                    email=default_admin_email,
                    password_hash=get_password_hash(default_admin_password),
                    role="admin",
                    is_admin=True,
                    is_superuser=True,
                    is_active=True,
                )
            )
        else:
            # Update password hash in case it's not properly hashed
            existing_admin.password_hash = get_password_hash(default_admin_password)
            # Ensure role is set to admin
            if existing_admin.role != "admin":
                existing_admin.role = "admin"
            if not existing_admin.is_admin:
                existing_admin.is_admin = True
            if not existing_admin.is_superuser:
                existing_admin.is_superuser = True
        db.commit()
    finally:
        db.close()


def _migrate_users_columns_if_needed():
    """Add missing columns to users table."""
    inspector = inspect(engine)
    if "users" not in set(inspector.get_table_names()):
        return

    existing_columns = {col["name"] for col in inspector.get_columns("users")}
    required_columns = {
        "role": "VARCHAR",
        "full_name": "VARCHAR", 
        "phone": "VARCHAR",
        "is_superuser": "BOOLEAN",
        "employee_id": "VARCHAR",
        "last_login": "DATETIME",
    }

    with engine.begin() as conn:
        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                conn.execute(
                    text(f'ALTER TABLE users ADD COLUMN "{column_name}" {column_type}')
                )


def _migrate_fuel_logs_columns_if_needed():
    """Patch legacy fuel_logs schema so inserts don't fail on missing columns."""
    inspector = inspect(engine)
    if "fuel_logs" not in set(inspector.get_table_names()):
        return

    existing_columns = {col["name"] for col in inspector.get_columns("fuel_logs")}
    required_columns = {
        "hour_meter": "FLOAT",
        "liters_filled": "FLOAT",
        "location": "VARCHAR",
        "photo_url": "VARCHAR",
        "recorded_by": "INTEGER",
        "notes": "VARCHAR",
        "refuel_date": "DATETIME",
        "operating_hours": "FLOAT",
    }

    with engine.begin() as conn:
        table_info = conn.execute(text('PRAGMA table_info(fuel_logs)')).fetchall()
        hour_meter_info = next((col for col in table_info if col[1] == 'hour_meter'), None)

        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                conn.execute(
                    text(f'ALTER TABLE fuel_logs ADD COLUMN "{column_name}" {column_type}')
                )

        if hour_meter_info and hour_meter_info[3] == 1:
            # Rebuild the table so hour_meter becomes nullable and legacy rows are preserved.
            conn.execute(text('PRAGMA foreign_keys = OFF'))
            conn.execute(text('ALTER TABLE fuel_logs RENAME TO fuel_logs_old'))
            conn.execute(text('''
                CREATE TABLE fuel_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    equipment_id INTEGER NOT NULL,
                    hour_meter FLOAT,
                    liters_filled FLOAT NOT NULL,
                    location VARCHAR,
                    photo_url VARCHAR,
                    recorded_by INTEGER,
                    notes VARCHAR,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    operating_hours FLOAT,
                    refuel_date DATETIME NOT NULL,
                    FOREIGN KEY (equipment_id) REFERENCES equipment (id),
                    FOREIGN KEY (recorded_by) REFERENCES users (id)
                )
            '''))
            conn.execute(text('''
                INSERT INTO fuel_logs (id, equipment_id, hour_meter, liters_filled, location, photo_url, recorded_by, notes, created_at, operating_hours, refuel_date)
                SELECT id, equipment_id, hour_meter, liters_filled, location, photo_url, recorded_by, notes, created_at, operating_hours, refuel_date
                FROM fuel_logs_old
            '''))
            conn.execute(text('DROP TABLE fuel_logs_old'))
            conn.execute(text('PRAGMA foreign_keys = ON'))

def _migrate_employees_columns_if_needed():
    """Add missing columns to employees table for payroll system."""
    inspector = inspect(engine)
    if "employees" not in set(inspector.get_table_names()):
        return
    
    existing_columns = {col["name"] for col in inspector.get_columns("employees")}
    
    # New columns for expanded employee model
    required_columns = {
        # Personal data
        "employee_code": "VARCHAR",
        "phone": "VARCHAR",
        "nik": "VARCHAR",
        "address": "TEXT",
        "date_of_birth": "DATE",
        "place_of_birth": "VARCHAR",
        "gender": "VARCHAR",
        "marital_status": "VARCHAR",
        # Employment
        "employment_type": "VARCHAR",
        "join_date": "DATE",
        "resign_date": "DATE",
        # Payroll data
        "daily_salary": "FLOAT",
        "hourly_overtime_rate": "FLOAT",
        "loan_balance": "FLOAT",
        "loan_deduction_per_period": "FLOAT",
        "debt_to_company": "FLOAT",
        "work_days_per_month": "INTEGER",
        # Status
        "is_active": "BOOLEAN",
        # Bank
        "bank_name": "VARCHAR",
        "bank_account_number": "VARCHAR",
        "bank_account_name": "VARCHAR",
        # Emergency contact
        "emergency_contact_name": "VARCHAR",
        "emergency_contact_phone": "VARCHAR",
        "emergency_contact_relation": "VARCHAR",
        # Link
        "user_id": "INTEGER",
    }
    
    with engine.begin() as conn:
        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                conn.execute(
                    text(f'ALTER TABLE employees ADD COLUMN "{column_name}" {column_type}')
                )

# Exception handler to see detailed errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = str(exc)
    traceback_str = traceback.format_exc()
    print(f"ERROR: {error_detail}")
    print(f"TRACEBACK: {traceback_str}")
    return JSONResponse(
        status_code=500,
        content={"detail": error_detail, "traceback": traceback_str}
    )

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(equipment_router, prefix="/api/v1/equipment", tags=["equipment"])
app.include_router(fuel_router, prefix="/api/v1/fuel", tags=["fuel"])
app.include_router(work_logs_router, prefix="/api/v1/work-logs", tags=["work-logs"])
app.include_router(employees_router, prefix="/api/v1/employees", tags=["employees"])

@app.get('/')
def read_root():
    return {'message': 'Welcome to PT. Kusuma Samudera Berkah API'}