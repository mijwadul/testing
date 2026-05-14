"""
Script inisialisasi database dengan data contoh.
Jalankan sekali saja: python init_db.py
PERINGATAN: Script ini akan menambahkan data dummy. Jangan dijalankan di production!
"""

from app.core.database import engine
from app.models import Base  # Import Base from models

# Create tables
Base.metadata.create_all(bind=engine)

from app.core.auth import get_password_hash
from app.models import Employee, Equipment, Project, User
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Cek apakah admin sudah ada
    existing_admin = db.query(User).filter(User.email == "admin@kusuma.com").first()
    if not existing_admin:
        admin_user = User(
            email="admin@kusuma.com",
            password_hash=get_password_hash("GantiPassword123!"),
            role="gm",
            is_admin=True,
            is_superuser=True,
            is_active=True,
            password_change_required=True,
        )
        db.add(admin_user)
        print(
            "Admin user created. Email: admin@kusuma.com | Password: GantiPassword123!"
        )
    else:
        print("Admin user already exists, skipping.")

    # Equipment
    if db.query(Equipment).count() == 0:
        equipment_data = [
            {
                "name": "Excavator 1",
                "type": "Excavator",
                "location": "Site A",
                "status": "active",
            },
            {
                "name": "Truck 1",
                "type": "Truck",
                "location": "Site B",
                "status": "active",
            },
            {
                "name": "Bulldozer 1",
                "type": "Bulldozer",
                "location": "Site C",
                "status": "active",
            },
        ]
        for eq in equipment_data:
            db.add(Equipment(**eq))
        print("Equipment data added.")

    # Employees
    if db.query(Employee).count() == 0:
        employee_data = [
            {
                "name": "John Doe",
                "email": "john@example.com",
                "position": "Operator",
                "department": "Operations",
                "daily_salary": 200000.0,  # Rp 200.000/hari
                "employment_type": "permanent",
                "status": "active",
                "is_active": True,
            },
            {
                "name": "Jane Smith",
                "email": "jane@example.com",
                "position": "Manager",
                "department": "Management",
                "daily_salary": 350000.0,  # Rp 350.000/hari
                "employment_type": "permanent",
                "status": "active",
                "is_active": True,
            },
            {
                "name": "Bob Johnson",
                "email": "bob@example.com",
                "position": "Mechanic",
                "department": "Maintenance",
                "daily_salary": 180000.0,  # Rp 180.000/hari
                "employment_type": "contract",
                "status": "active",
                "is_active": True,
            },
        ]
        for emp in employee_data:
            db.add(Employee(**emp))
        print("Employee data added.")

    # Projects
    if db.query(Project).count() == 0:
        project_data = [
            {
                "name": "Mining Project Alpha",
                "location": "Location A",
                "budget": 100000000.0,
                "progress": 75.0,
                "status": "ongoing",
            },
            {
                "name": "Logistics Hub Beta",
                "location": "Location B",
                "budget": 50000000.0,
                "progress": 100.0,
                "status": "completed",
            },
        ]
        for proj in project_data:
            db.add(Project(**proj))
        print("Project data added.")

    db.commit()
    print("\nDatabase initialized successfully!")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    import traceback

    traceback.print_exc()
finally:
    db.close()
