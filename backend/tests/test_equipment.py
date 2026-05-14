"""
Tests untuk endpoint manajemen alat berat (/api/v1/equipment/*).

Router equipment menggunakan path "" dan "/{id}" sehingga URL lengkapnya:
  - GET/POST  /api/v1/equipment
  - GET/PUT/DELETE  /api/v1/equipment/{equipment_id}

Coverage:
  - Create equipment (POST)
  - List all equipment (GET)
  - Get by ID (GET /{id})
  - Update (PUT /{id})
  - Delete (DELETE /{id})
  - Unauthenticated access (401)
  - Not found (404)
"""

import pytest


@pytest.fixture(scope="module")
def equipment_id(client, auth_headers):
    """
    Buat satu equipment untuk dipakai bersama oleh test-test dalam module ini.
    Scope 'module' agar dibuat sekali dan tidak diulang tiap test method.
    """
    response = client.post(
        "/api/v1/equipment",
        json={
            "name": "Test Excavator",
            "type": "Excavator",
            "location": "Site Test",
            "status": "active",
            "ownership_status": "internal",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200, f"Setup equipment gagal: {response.json()}"
    return response.json()["id"]


class TestEquipmentCRUD:
    def test_create_equipment(self, client, auth_headers):
        """Buat equipment baru — response harus mengandung data yang dikirim."""
        response = client.post(
            "/api/v1/equipment",
            json={
                "name": "Truck Besar",
                "type": "Truck",
                "location": "Gudang A",
                "status": "active",
                "ownership_status": "rental",
                "rental_rate_per_hour": 150000,
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Truck Besar"
        assert data["type"] == "Truck"
        assert data["ownership_status"] == "rental"
        assert "id" in data
        assert "created_at" in data

    def test_create_equipment_minimal_fields(self, client, auth_headers):
        """Buat equipment hanya dengan field wajib (name + type)."""
        response = client.post(
            "/api/v1/equipment",
            json={"name": "Alat Minimal", "type": "Compactor"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Alat Minimal"
        assert data["type"] == "Compactor"
        # Field optional harus punya nilai default
        assert data["status"] == "active"
        assert data["ownership_status"] == "internal"

    def test_get_all_equipment(self, client, auth_headers):
        """List semua equipment — response harus berupa list dengan minimal 1 item."""
        response = client.get("/api/v1/equipment", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_equipment_by_id(self, client, auth_headers, equipment_id):
        """Ambil equipment berdasarkan ID — data harus sesuai fixture."""
        response = client.get(f"/api/v1/equipment/{equipment_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == equipment_id
        assert data["name"] == "Test Excavator"
        assert data["type"] == "Excavator"
        assert data["location"] == "Site Test"

    def test_get_equipment_not_found(self, client, auth_headers):
        """Request equipment dengan ID yang tidak ada harus mengembalikan 404."""
        response = client.get("/api/v1/equipment/999999", headers=auth_headers)
        assert response.status_code == 404

    def test_update_equipment(self, client, auth_headers, equipment_id):
        """Update partial equipment — field yang dikirim harus berubah."""
        response = client.put(
            f"/api/v1/equipment/{equipment_id}",
            json={"location": "Site Baru", "status": "maintenance"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["location"] == "Site Baru"
        assert data["status"] == "maintenance"
        # Field yang tidak diupdate tetap sama
        assert data["name"] == "Test Excavator"

    def test_update_equipment_not_found(self, client, auth_headers):
        """Update equipment dengan ID tidak ada harus mengembalikan 404."""
        response = client.put(
            "/api/v1/equipment/999999",
            json={"location": "Entah Mana"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_delete_equipment(self, client, auth_headers):
        """Hapus equipment — setelah dihapus, GET by ID harus mengembalikan 404."""
        # Buat equipment baru khusus untuk dihapus
        create_resp = client.post(
            "/api/v1/equipment",
            json={"name": "Alat Hapus", "type": "Bulldozer", "location": "Mana saja"},
            headers=auth_headers,
        )
        assert create_resp.status_code == 200
        eq_id = create_resp.json()["id"]

        # Hapus
        delete_resp = client.delete(f"/api/v1/equipment/{eq_id}", headers=auth_headers)
        assert delete_resp.status_code == 200

        # Verifikasi sudah tidak ada
        get_resp = client.get(f"/api/v1/equipment/{eq_id}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_delete_equipment_not_found(self, client, auth_headers):
        """Hapus equipment dengan ID yang tidak ada harus mengembalikan 404."""
        response = client.delete("/api/v1/equipment/999999", headers=auth_headers)
        assert response.status_code == 404

    def test_unauthenticated_get_list(self, client):
        """GET /equipment tanpa token harus ditolak dengan 401."""
        response = client.get("/api/v1/equipment")
        assert response.status_code == 401

    def test_unauthenticated_create(self, client):
        """POST /equipment tanpa token harus ditolak dengan 401."""
        response = client.post(
            "/api/v1/equipment",
            json={"name": "Coba", "type": "Truck"},
        )
        assert response.status_code == 401
