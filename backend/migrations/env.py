import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# Tambahkan direktori backend ke sys.path agar bisa import app
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import settings dan semua model agar terdaftar ke Base.metadata
from app.core.config import settings  # noqa: E402
from app.models import (  # noqa: E402, F401
    Attendance,
    Base,
    BonusDeduction,
    Employee,
    EmployeeLoan,
    Equipment,
    FuelLog,
    FuelPrice,
    PayrollRecord,
    Project,
    User,
    WorkLog,
)

# Alembic Config object
config = context.config

# Setup logging dari alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Gunakan metadata dari seluruh model kita (untuk autogenerate)
target_metadata = Base.metadata


def get_url() -> str:
    """Ambil DATABASE_URL dari settings (dibaca dari .env)."""
    return settings.DATABASE_URL


def run_migrations_offline() -> None:
    """Jalankan migrasi dalam mode 'offline' (tanpa koneksi aktif)."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Jalankan migrasi dalam mode 'online' (dengan koneksi aktif)."""
    url = get_url()

    # SQLite butuh check_same_thread=False
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    # Override URL dari config dengan nilai dari settings
    cfg = config.get_section(config.config_ini_section, {})
    cfg["sqlalchemy.url"] = url

    connectable = engine_from_config(
        cfg,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
