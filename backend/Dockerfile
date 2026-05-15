FROM python:3.13-slim
WORKDIR /app

# Install system dependencies yang dibutuhkan Psycopg2 dan WeasyPrint
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    python3-dev \
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pastikan CMD menggunakan port dinamis dari Railway
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
