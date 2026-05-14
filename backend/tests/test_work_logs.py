"""
Tests untuk endpoint work logs / jam kerja (/api/v1/work-logs/*).

Coverage:
  - POST /api/v1/work-logs               — buat log (MANUAL & HM)
  - GET  /api/v1/work-logs               — list semua log
  - GET  /api/v1/work-logs/{id}          — detail log
  - GET  /api/v1/work-logs?equipment_id= — filter by equipment
  - PUT  /api/v1/work-logs/{id}          — update log
  - DELETE /api/v1/work-logs/{id}        — hapus log (200)
  - GET  /api/v1/work-logs/stats/summary — statistik ringkasan

CATATAN:
  - WorkLogCreate mengharuskan total_hours (bukan optional).
    Untuk metode HM, total_hours yang dikirim akan di-override oleh server
    dengan hasil hitungan hm_end - hm_start.
  - Route /stats/summary didefinisikan setelah /{work_log_id} di router,
    namun tidak konflik karena perbedaan jumlah path segment.
"""

from datetime import datetime

import pytest


@pytest.fixture(scope="module")
def wl_equipment_id(client, auth_headers):
    """Equipment khusus untuk test work logs."""
    response = client.post(
        "/api/v1/equipment",
        json={
            "name": "Excavator WorkLog Test",
            "type": "Excavator",
            "location": "Site WL",
            "ownership_status": "rental",
            "rental_rate_per_hour": 100000,
        },
        headers=auth_headers,
    )
    assert response.status_code == 200, f"Setup WL equipment gagal: {response.json()}"
    return response.json()["id"]


@pytest.fixture(scope="module")
def work_log_id(client, auth_headers, wl_equipment_id):
    """
    Buat satu work log untuk dipakai di test lain.
    Menggunakan metode MANUAL agar total_hours langsung dipakai server.
    """
    response = client.post(
        "/api/v1/work-logs",
        json={
            "equipment_id": wl_equipment_id,
            "input_method": "MANUAL",
            "total_hours": 8.5,
            "work_date": datetime.now().isoformat(),
            "operator_name": "Operator Test",
            "work_description": "Pekerjaan test awal",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200, f"Setup work log gagal: {response.json()}"
    return response.json()["id"]


class TestWorkLogCRUD:
    def test_create_work_log_manual(self, client, auth_headers, wl_equipment_id):
        """
        Buat work log dengan metode MANUAL.
        total_hours yang dikirim harus tersimpan apa adanya.
        """
        response = client.post(
            "/api/v1/work-logs",
            json={
                "equipment_id": wl_equipment_id,
                "input_method": "MANUAL",
                "total_hours": 6.0,
                "work_date": datetime.now().isoformat(),
                "operator_name": "Budi",
                "work_description": "Gali tanah",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert float(data["total_hours"]) == 6.0
        assert data["input_method"] == "MANUAL"
        assert data["operator_name"] == "Budi"
        assert "id" in data

    def test_create_work_log_hm(self, client, auth_headers, wl_equipment_id):
        """
        Buat work log dengan metode HM (Hour Meter).
        Server menghitung total_hours = hm_end - hm_start secara otomatis,
        mengabaikan nilai total_hours yang dikirim.
        hm_start=1000, hm_end=1008.5 → total_hours = 8.5
        """
        response = client.post(
            "/api/v1/work-logs",
            json={
                "equipment_id": wl_equipment_id,
                "input_method": "HM",
                "hm_start": 1000.0,
                "hm_end": 1008.5,
                # total_hours WAJIB ada di schema meski akan di-override server
                "total_hours": 0,
                "work_date": datetime.now().isoformat(),
                "operator_name": "Sari",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        # Server menghitung: 1008.5 - 1000.0 = 8.5
        assert float(data["total_hours"]) == 8.5
        assert data["input_method"] == "HM"

    def test_create_work_log_invalid_equipment(self, client, auth_headers):
        """Work log dengan equipment_id yang tidak ada harus mengembalikan 404."""
        response = client.post(
            "/api/v1/work-logs",
            json={
                "equipment_id": 999999,
                "input_method": "MANUAL",
                "total_hours": 5.0,
                "work_date": datetime.now().isoformat(),
            },
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_create_work_log_invalid_input_method(
        self, client, auth_headers, wl_equipment_id
    ):
        """input_method yang tidak dikenal (bukan HM/MANUAL) harus gagal validasi (422)."""
        response = client.post(
            "/api/v1/work-logs",
            json={
                "equipment_id": wl_equipment_id,
                "input_method": "INVALID",
                "total_hours": 5.0,
                "work_date": datetime.now().isoformat(),
            },
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_get_all_work_logs(self, client, auth_headers):
        """List semua work logs — response harus berupa list dengan minimal 1 item."""
        response = client.get("/api/v1/work-logs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_work_logs_contains_equipment_info(self, client, auth_headers):
        """Setiap work log dalam list harus memuat equipment_name dan equipment_type."""
        response = client.get("/api/v1/work-logs", headers=auth_headers)
        assert response.status_code == 200
        for log in response.json():
            assert "equipment_name" in log
            assert "equipment_type" in log

    def test_get_work_log_by_id(self, client, auth_headers, work_log_id):
        """Ambil work log berdasarkan ID — data harus sesuai fixture."""
        response = client.get(f"/api/v1/work-logs/{work_log_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == work_log_id
        assert data["operator_name"] == "Operator Test"
        assert float(data["total_hours"]) == 8.5

    def test_get_work_log_not_found(self, client, auth_headers):
        """Get work log dengan ID yang tidak ada harus mengembalikan 404."""
        response = client.get("/api/v1/work-logs/999999", headers=auth_headers)
        assert response.status_code == 404

    def test_filter_work_logs_by_equipment(self, client, auth_headers, wl_equipment_id):
        """
        Filter work logs berdasarkan equipment_id.
        Semua hasil harus milik equipment yang diminta.
        """
        response = client.get(
            f"/api/v1/work-logs?equipment_id={wl_equipment_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        logs = response.json()
        assert isinstance(logs, list)
        assert len(logs) >= 1
        for log in logs:
            assert log["equipment_id"] == wl_equipment_id

    def test_update_work_log(self, client, auth_headers, work_log_id):
        """Update work log — field yang dikirim harus berubah."""
        response = client.put(
            f"/api/v1/work-logs/{work_log_id}",
            json={
                "work_description": "Updated: Pekerjaan sudah selesai",
                "total_hours": 9.0,
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["work_description"] == "Updated: Pekerjaan sudah selesai"
        assert float(data["total_hours"]) == 9.0

    def test_update_work_log_not_found(self, client, auth_headers):
        """Update work log dengan ID yang tidak ada harus mengembalikan 404."""
        response = client.put(
            "/api/v1/work-logs/999999",
            json={"work_description": "Tidak ada"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_delete_work_log(self, client, auth_headers, wl_equipment_id):
        """
        Hapus work log — setelah dihapus GET by ID harus mengembalikan 404.
        Buat work log baru khusus untuk dihapus agar tidak mempengaruhi fixture.
        """
        create_resp = client.post(
            "/api/v1/work-logs",
            json={
                "equipment_id": wl_equipment_id,
                "input_method": "MANUAL",
                "total_hours": 3.0,
                "work_date": datetime.now().isoformat(),
                "operator_name": "Hapus Me",
            },
            headers=auth_headers,
        )
        assert create_resp.status_code == 200
        wl_id = create_resp.json()["id"]

        delete_resp = client.delete(f"/api/v1/work-logs/{wl_id}", headers=auth_headers)
        assert delete_resp.status_code == 200

        get_resp = client.get(f"/api/v1/work-logs/{wl_id}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_unauthenticated_access(self, client):
        """Request tanpa token harus ditolak dengan 401."""
        response = client.get("/api/v1/work-logs")
        assert response.status_code == 401


class TestWorkLogStats:
    def test_get_work_log_stats(self, client, auth_headers):
        """
        Statistik work logs harus memuat semua field WorkLogStats:
        total_hours_worked, total_work_days, avg_hours_per_day,
        equipment_count, hm_active_count, manual_count.
        """
        response = client.get("/api/v1/work-logs/stats/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_hours_worked" in data
        assert "total_work_days" in data
        assert "avg_hours_per_day" in data
        assert "equipment_count" in data
        assert "hm_active_count" in data
        assert "manual_count" in data
        # Nilai numerik harus non-negatif
        assert data["total_hours_worked"] >= 0
        assert data["total_work_days"] >= 0

    def test_get_work_log_stats_filter_by_equipment(
        self, client, auth_headers, wl_equipment_id
    ):
        """Stats dengan filter equipment_id — equipment_count harus <= 1."""
        response = client.get(
            f"/api/v1/work-logs/stats/summary?equipment_id={wl_equipment_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        # Hanya 1 equipment yang difilter, jadi equipment_count <= 1
        assert data["equipment_count"] <= 1

    def test_get_work_log_stats_unauthenticated(self, client):
        """Stats tanpa token harus ditolak."""
        response = client.get("/api/v1/work-logs/stats/summary")
        assert response.status_code == 401
