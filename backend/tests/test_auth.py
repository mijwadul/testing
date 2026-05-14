"""
Tests untuk endpoint autentikasi dan manajemen user (/api/v1/auth/*).

Coverage:
  - POST /api/v1/auth/login          — login dengan form-data
  - GET  /api/v1/auth/me             — profil user yang sedang login
  - GET  /api/v1/auth/users          — daftar semua user (admin only)
  - POST /api/v1/auth/users          — buat user baru (admin only)
"""


class TestLogin:
    def test_login_success(self, client, admin_user):
        """Login dengan kredensial yang benar harus mengembalikan token & data user."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "testadmin@kusuma.com", "password": "TestPassword123!"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == "testadmin@kusuma.com"
        assert data["user"]["role"] == "gm"

    def test_login_wrong_password(self, client, admin_user):
        """Login dengan password salah harus ditolak dengan 401."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "testadmin@kusuma.com", "password": "password_salah"},
        )
        assert response.status_code == 401

    def test_login_wrong_email(self, client):
        """Login dengan email yang tidak terdaftar harus ditolak dengan 401."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "tidakada@kusuma.com", "password": "apapun123"},
        )
        assert response.status_code == 401

    def test_login_empty_credentials(self, client):
        """Login tanpa field username/password harus gagal validasi (422)."""
        response = client.post("/api/v1/auth/login", data={})
        assert response.status_code == 422

    def test_login_returns_correct_user_flags(self, client, admin_user):
        """Pastikan flag is_admin dan is_active dikembalikan dengan benar."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "testadmin@kusuma.com", "password": "TestPassword123!"},
        )
        assert response.status_code == 200
        user_data = response.json()["user"]
        assert user_data["is_admin"] is True
        assert user_data["is_active"] is True


class TestGetCurrentUser:
    def test_get_me_authenticated(self, client, auth_headers):
        """Endpoint /me harus mengembalikan data user yang sedang login."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "testadmin@kusuma.com"
        assert data["role"] == "gm"
        assert data["is_admin"] is True

    def test_get_me_unauthenticated(self, client):
        """Endpoint /me tanpa Authorization header harus ditolak dengan 401."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client):
        """Endpoint /me dengan token yang tidak valid harus ditolak dengan 401."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer token_palsu_tidak_valid_sama_sekali"},
        )
        assert response.status_code == 401

    def test_get_me_malformed_header(self, client):
        """Header Authorization tanpa prefix 'Bearer' harus ditolak."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "token_tanpa_bearer_prefix"},
        )
        assert response.status_code == 401


class TestUserManagement:
    def test_get_users_as_admin(self, client, auth_headers):
        """Admin (GM) bisa mengambil daftar semua user — response harus berupa list."""
        response = client.get("/api/v1/auth/users", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Minimal ada 1 user (admin yang kita buat di conftest)
        assert len(data) >= 1

    def test_get_users_unauthenticated(self, client):
        """Daftar user tanpa token harus ditolak."""
        response = client.get("/api/v1/auth/users")
        assert response.status_code == 401

    def test_create_user(self, client, auth_headers):
        """Admin bisa membuat user baru; response berisi data user yang dibuat."""
        response = client.post(
            "/api/v1/auth/users",
            json={
                "email": "newuser@kusuma.com",
                "password": "Password123!",
                "role": "field",
                "is_active": True,
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newuser@kusuma.com"
        assert data["role"] == "field"
        # Password tidak boleh dikembalikan dalam response
        assert "password" not in data
        assert "password_hash" not in data

    def test_create_user_duplicate_email(self, client, auth_headers):
        """Membuat user dengan email yang sudah dipakai harus gagal dengan 400."""
        payload = {
            "email": "duplikat@kusuma.com",
            "password": "Pass123!",
            "role": "field",
        }
        # Pertama kali — berhasil
        first = client.post("/api/v1/auth/users", json=payload, headers=auth_headers)
        assert first.status_code == 200

        # Kedua kali dengan email sama — harus gagal
        second = client.post("/api/v1/auth/users", json=payload, headers=auth_headers)
        assert second.status_code == 400
        assert "already" in second.json()["detail"].lower()

    def test_create_user_missing_required_fields(self, client, auth_headers):
        """Membuat user tanpa email/password harus gagal validasi (422)."""
        response = client.post(
            "/api/v1/auth/users",
            json={"role": "field"},  # tidak ada email dan password
            headers=auth_headers,
        )
        assert response.status_code == 422
