"""
Pytest fixtures untuk testing PT. Kusuma Samudera Berkah API.
Menggunakan SQLite in-memory database yang fresh untuk setiap test session.
"""

import os

# ─────────────────────────────────────────────────────────────────────────────
# Set required environment variables SEBELUM import apapun dari app.
# Settings dibaca pada import-time; SECRET_KEY wajib ada dan tidak punya default.
# ─────────────────────────────────────────────────────────────────────────────
os.environ.setdefault(
    "SECRET_KEY", "test-secret-key-for-testing-only-do-not-use-in-prod"
)
os.environ.setdefault("DATABASE_URL", "sqlite:///./sql_app.db")

import pytest
from app.core.auth import get_password_hash
from app.core.database import get_db
from app.main import app
from app.models import Base, User
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# ─────────────────────────────────────────────────────────────────────────────
# In-memory SQLite — terisolasi total dari database development.
# StaticPool memastikan SATU koneksi dipakai seluruh test session sehingga
# data yang dibuat oleh fixture langsung terlihat oleh test client.
# ─────────────────────────────────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite://"

engine_test = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    """Override dependency get_db dengan test database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Buat semua tabel sekali per test session, hapus setelah selesai."""
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(scope="session")
def client(setup_database):
    """
    FastAPI TestClient yang diinjeksikan test database.
    Dependen eksplisit pada setup_database agar tabel sudah ada
    sebelum lifespan app berjalan.
    """
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def admin_user(client):
    """
    Buat user admin test langsung ke test DB dan kembalikan object User.
    Menggunakan TestingSessionLocal (bukan API) agar tidak tergantung
    endpoint yang belum ditest.
    """
    db = TestingSessionLocal()
    try:
        user = User(
            email="testadmin@kusuma.com",
            password_hash=get_password_hash("TestPassword123!"),
            role="gm",
            is_admin=True,
            is_superuser=True,
            is_active=True,
            password_change_required=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


@pytest.fixture(scope="session")
def admin_token(client, admin_user):
    """Login sebagai admin dan kembalikan Bearer token string."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testadmin@kusuma.com", "password": "TestPassword123!"},
    )
    assert response.status_code == 200, f"Login gagal: {response.json()}"
    return response.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    """Header Authorization siap pakai untuk semua request yang butuh autentikasi."""
    return {"Authorization": f"Bearer {admin_token}"}
