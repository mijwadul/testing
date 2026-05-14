"""
Tests untuk endpoint manajemen karyawan (/api/v1/employees/*).

PENTING — Struktur URL employees:
  Router di-include dengan prefix "/api/v1/employees", NAMUN route di dalam
  router menggunakan path "/employees" (bukan "/"). Sehingga URL lengkap:

    POST   /api/v1/employees/employees          — buat karyawan
    GET    /api/v1/employees/employees          — list karyawan
    GET    /api/v1/employees/employees/{id}     — detail karyawan
    PUT    /api/v1/employees/employees/{id}     — update karyawan
    DELETE /api/v1/employees/employees/{id}     — hapus karyawan (soft-delete)
    GET    /api/v1/employees/departments        — daftar departemen unik

Coverage:
  - Create employee
  - List employees
  - Get by ID
  - Update (termasuk financial field oleh GM)
  - Departments endpoint
  - Not found (404)
  - Unauthenticated (401)
"""

import pytest


@pytest.fixture(scope="module")
def employee_id(client, auth_headers):
    """
    Buat satu karyawan untuk dipakai bersama dalam module ini.
    Dikembalikan sebagai integer ID.
    """
    response = client.post(
        "/api/v1/employees/employees",
        json={
            "name": "Test Karyawan",
            "email": "testkaryawan@kusuma.com",
            "position": "Operator",
            "department": "Operations",
            "employment_type": "permanent",
            "daily_salary": 250000.0,
            "status": "active",
            "is_active": True,
        },
        headers=auth_headers,
    )
    assert response.status_code == 200, f"Setup employee gagal: {response.json()}"
    return response.json()["id"]


class TestEmployeeCRUD:
    def test_create_employee(self, client, auth_headers):
        """Buat karyawan baru — response harus mengandung data yang dikirim."""
        response = client.post(
            "/api/v1/employees/employees",
            json={
                "name": "Budi Santoso",
                "email": "budi@kusuma.com",
                "position": "Mekanik",
                "department": "Maintenance",
                "daily_salary": 200000.0,
                "employment_type": "contract",
                "is_active": True,
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Budi Santoso"
        assert data["department"] == "Maintenance"
        assert data["employment_type"] == "contract"
        assert "id" in data

    def test_create_employee_duplicate_email(self, client, auth_headers):
        """Membuat karyawan dengan email yang sudah ada harus gagal dengan 400."""
        payload = {
            "name": "Duplikat Email",
            "email": "duplikatkaryawan@kusuma.com",
            "position": "Staff",
        }
        first = client.post(
            "/api/v1/employees/employees", json=payload, headers=auth_headers
        )
        assert first.status_code == 200

        second = client.post(
            "/api/v1/employees/employees", json=payload, headers=auth_headers
        )
        assert second.status_code == 400

    def test_get_all_employees(self, client, auth_headers):
        """List karyawan aktif — response harus berupa list dengan minimal 1 item."""
        response = client.get("/api/v1/employees/employees", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_all_employees_with_department_filter(self, client, auth_headers):
        """Filter list karyawan berdasarkan department."""
        response = client.get(
            "/api/v1/employees/employees?department=Operations", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Semua hasil harus berada di departemen yang diminta
        for emp in data:
            assert emp["department"] == "Operations"

    def test_get_employee_by_id(self, client, auth_headers, employee_id):
        """Ambil karyawan berdasarkan ID — data harus sesuai fixture."""
        response = client.get(
            f"/api/v1/employees/employees/{employee_id}", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == employee_id
        assert data["name"] == "Test Karyawan"
        assert data["position"] == "Operator"
        assert data["department"] == "Operations"

    def test_get_employee_not_found(self, client, auth_headers):
        """Ambil karyawan dengan ID yang tidak ada harus mengembalikan 404."""
        response = client.get(
            "/api/v1/employees/employees/999999", headers=auth_headers
        )
        assert response.status_code == 404

    def test_update_employee_basic_fields(self, client, auth_headers, employee_id):
        """Update field umum karyawan (position)."""
        response = client.put(
            f"/api/v1/employees/employees/{employee_id}",
            json={"position": "Senior Operator"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["position"] == "Senior Operator"

    def test_update_employee_financial_fields_as_gm(
        self, client, auth_headers, employee_id
    ):
        """
        GM bisa mengupdate field finansial (daily_salary).
        Response untuk GM memuat daily_salary (EmployeePrivate schema).
        """
        response = client.put(
            f"/api/v1/employees/employees/{employee_id}",
            json={"daily_salary": 300000.0},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["daily_salary"] == 300000.0

    def test_update_employee_not_found(self, client, auth_headers):
        """Update karyawan dengan ID yang tidak ada harus mengembalikan 404."""
        response = client.put(
            "/api/v1/employees/employees/999999",
            json={"position": "Tidak Ada"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_unauthenticated_access(self, client):
        """Request tanpa token harus ditolak dengan 401."""
        response = client.get("/api/v1/employees/employees")
        assert response.status_code == 401


class TestDepartmentsEndpoint:
    def test_get_departments(self, client, auth_headers):
        """
        Endpoint departments mengembalikan list string nama departemen unik.
        Setelah fixture employee_id berjalan, setidaknya 'Operations' ada.
        """
        response = client.get("/api/v1/employees/departments", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Semua elemen harus berupa string
        assert all(isinstance(d, str) for d in data)
        # 'Maintenance' sudah dibuat oleh test_create_employee
        assert "Maintenance" in data

    def test_get_departments_unauthenticated(self, client):
        """Departments tanpa token harus ditolak."""
        response = client.get("/api/v1/employees/departments")
        assert response.status_code == 401
