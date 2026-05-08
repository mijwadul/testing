import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from .api.v1.dashboard import router as dashboard_router
from .api.v1.auth import router as auth_router
from .api.v1.equipment import router as equipment_router
from .api.v1.fuel import router as fuel_router
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
    _migrate_fuel_logs_columns_if_needed()

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
                    is_admin=True,
                    is_active=True,
                )
            )
        else:
            # Update password hash in case it's not properly hashed
            existing_admin.password_hash = get_password_hash(default_admin_password)
        db.commit()
    finally:
        db.close()


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
    }

    with engine.begin() as conn:
        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                conn.execute(
                    text(f'ALTER TABLE fuel_logs ADD COLUMN "{column_name}" {column_type}')
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

@app.get('/')
def read_root():
    return {'message': 'Welcome to PT. Kusuma Samudera Berkah API'}