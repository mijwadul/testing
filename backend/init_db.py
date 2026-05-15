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
    existing_admin = db.query(User).filter(User.email == "mijwadul@kusuma.com").first()
    if not existing_admin:
        admin_user = User(
            email="mijwadul@kusuma.com",
            password_hash=get_password_hash("12345"),
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

    db.commit()
    print("\nDatabase initialized successfully!")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    import traceback

    traceback.print_exc()
finally:
    db.close()
