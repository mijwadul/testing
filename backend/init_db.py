from app.core.database import engine
from app.models import Base  # Import Base from models

# Create tables
Base.metadata.create_all(bind=engine)

# Dummy data
from sqlalchemy.orm import sessionmaker
from app.models import Equipment, Employee, Project, User
from app.core.auth import get_password_hash

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Admin User
admin_user = User(
    email="mijwadul@kusuma.com",
    password_hash=get_password_hash("12345"),
    is_admin=True
)
db.add(admin_user)

# Equipment
equipment_data = [
    {"name": "Excavator 1", "type": "Excavator", "location": "Site A"},
    {"name": "Truck 1", "type": "Truck", "location": "Site B"},
    {"name": "Bulldozer 1", "type": "Bulldozer", "location": "Site C"},
]

for eq in equipment_data:
    db_equipment = Equipment(**eq)
    db.add(db_equipment)

# Employees
employee_data = [
    {"name": "John Doe", "email": "john@example.com", "position": "Operator", "department": "Operations", "salary": 5000.0},
    {"name": "Jane Smith", "email": "jane@example.com", "position": "Manager", "department": "Management", "salary": 8000.0},
    {"name": "Bob Johnson", "email": "bob@example.com", "position": "Mechanic", "department": "Maintenance", "salary": 4500.0},
]

for emp in employee_data:
    db_employee = Employee(**emp)
    db.add(db_employee)

# Projects
project_data = [
    {"name": "Mining Project Alpha", "location": "Location A", "budget": 100000.0, "progress": 75.0},
    {"name": "Logistics Hub Beta", "location": "Location B", "budget": 50000.0, "progress": 50.0},
]

for proj in project_data:
    db_project = Project(**proj)
    db.add(db_project)

db.commit()
db.close()

print("Database initialized with dummy data!")