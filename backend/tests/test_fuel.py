"""
Tests untuk endpoint logistik BBM (/api/v1/fuel/*).

Coverage:
  - POST /api/v1/fuel/refuel               — catat pengisian BBM
  - GET  /api/v1/fuel/logs                 — history pengisian
  - GET  /api/v1/fuel/logs?equipment_id=X  — filter by equipment
  - GET  /api/v1/fuel/efficiency           — statistik efisiensi
  - GET  /api/v1/fuel/equipment-report     — laporan per alat
  - DELETE /api/v1/fuel/logs/{id}          — hapus catatan (204)
  - Error: equipment tidak ada (404)
"""

from datetime import datetime

import pytest


@pytest.fixture(scope="module")
def fuel_equipment_id(client, auth_headers):
    """Equipment khusus untuk test-test BBM dalam module ini."""
    response = client.post(
        "/api/v1/equipment",
        json={
            "name": "Excavator BBM Test",
            "type": "Excavator",
            "location": "Pit A",
            "status": "active",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200, f"Setup fuel equipment gagal: {response.json()}"
    return response.json()["id"]


@pytest.fixture(scope="module")
def fuel_log_id(client, auth_headers, fuel_equipment_id):
    """
    Buat satu fuel log untuk dipakai di test lain (misal: test delete).
    Dibuat setelah fuel_equipment_id tersedia.
    """
    response = client.post(
        "/api/v1/fuel/refuel",
        json={
            "equipment_id": fuel_equipment_id,
            "liters_filled": 150.5,
            "refuel_date": datetime.now().isoformat(),
            "location": "Pit A",
            "notes": "Test pengisian BBM awal",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200, f"Setup fuel log gagal: {response.json()}"
    return response.json()["id"]


class TestFuelLog:
    def test_create_fuel_log(self, client, auth_headers, fuel_equipment_id):
        """Catat pengisian BBM baru — response harus memuat data yang dikirim."""
        response = client.post(
            "/api/v1/fuel/refuel",
            json={
                "equipment_id": fuel_equipment_id,
                "liters_filled": 200.0,
                "refuel_date": datetime.now().isoformat(),
                "location": "Depo Bahan Bakar",
                "notes": "Full tank",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["liters_filled"] == 200.0
        assert data["equipment_id"] == fuel_equipment_id
        assert data["location"] == "Depo Bahan Bakar"
        assert "id" in data
        assert "created_at" in data

    def test_create_fuel_log_with_hour_meter(
        self, client, auth_headers, fuel_equipment_id
    ):
        """Catat pengisian BBM beserta data hour meter opsional."""
        response = client.post(
            "/api/v1/fuel/refuel",
            json={
                "equipment_id": fuel_equipment_id,
                "liters_filled": 80.0,
                "refuel_date": datetime.now().isoformat(),
                "hour_meter": 1500.5,
                "location": "Pit B",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["liters_filled"] == 80.0
        assert data["hour_meter"] == 1500.5

    def test_create_fuel_log_invalid_equipment(self, client, auth_headers):
        """Catat BBM untuk equipment yang tidak ada harus mengembalikan 404."""
        response = client.post(
            "/api/v1/fuel/refuel",
            json={
                "equipment_id": 999999,
                "liters_filled": 100.0,
                "refuel_date": datetime.now().isoformat(),
            },
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_get_fuel_logs(self, client, auth_headers):
        """Ambil history pengisian BBM — response harus berupa list."""
        response = client.get("/api/v1/fuel/logs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_fuel_logs_contains_equipment_info(self, client, auth_headers):
        """Setiap fuel log dalam list harus menyertakan nama dan tipe equipment."""
        response = client.get("/api/v1/fuel/logs", headers=auth_headers)
        assert response.status_code == 200
        for log in response.json():
            assert "equipment_name" in log
            assert "equipment_type" in log

    def test_get_fuel_logs_filter_by_equipment(
        self, client, auth_headers, fuel_equipment_id
    ):
        """Filter fuel logs berdasarkan equipment_id — semua hasil harus milik equipment itu."""
        response = client.get(
            f"/api/v1/fuel/logs?equipment_id={fuel_equipment_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        logs = response.json()
        assert isinstance(logs, list)
        assert len(logs) >= 1
        for log in logs:
            assert log["equipment_id"] == fuel_equipment_id

    def test_get_fuel_logs_unauthenticated(self, client):
        """Akses fuel logs tanpa token harus ditolak dengan 401."""
        response = client.get("/api/v1/fuel/logs")
        assert response.status_code == 401

    def test_get_fuel_efficiency(self, client, auth_headers):
        """
        Endpoint efisiensi BBM harus mengembalikan objek dengan field
        total_fuel_consumed dan equipment_count.
        """
        response = client.get("/api/v1/fuel/efficiency", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_fuel_consumed" in data
        assert "equipment_count" in data
        assert isinstance(data["total_fuel_consumed"], (int, float))
        assert isinstance(data["equipment_count"], int)

    def test_get_fuel_equipment_report(self, client, auth_headers):
        """
        Laporan BBM per alat harus berupa list; setiap item punya field
        equipment_id, total_liters, dan equipment_name.
        """
        response = client.get("/api/v1/fuel/equipment-report", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:  # Ada data — validasi struktur item pertama
            item = data[0]
            assert "equipment_id" in item
            assert "equipment_name" in item
            assert "total_liters" in item
            assert "total_work_hours" in item
            assert "status_anomali" in item

    def test_delete_fuel_log(self, client, auth_headers, fuel_log_id):
        """
        Hapus catatan BBM (204 No Content).
        Setelah dihapus, GET by ID harus mengembalikan 404.
        """
        delete_resp = client.delete(
            f"/api/v1/fuel/logs/{fuel_log_id}", headers=auth_headers
        )
        assert delete_resp.status_code == 204

        # Verifikasi sudah tidak ada
        get_resp = client.get(f"/api/v1/fuel/logs/{fuel_log_id}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_delete_fuel_log_not_found(self, client, auth_headers):
        """Hapus fuel log dengan ID yang tidak ada harus mengembalikan 404."""
        response = client.delete("/api/v1/fuel/logs/999999", headers=auth_headers)
        assert response.status_code == 404
