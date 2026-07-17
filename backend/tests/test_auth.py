import pytest
from unittest.mock import MagicMock, patch


@pytest.fixture
def unauthed_client():
    """TestClient without auth bypass — for testing auth protection."""
    from app.main import app
    from fastapi.testclient import TestClient
    return TestClient(app)


class TestAuthEndpoints:
    """Tests for the authentication module."""

    def test_signup_returns_user(self, client):
        """Test that /auth/signup returns user id and email on success."""
        mock_user = MagicMock()
        mock_user.id = "test-user-001"
        mock_user.email = "test@example.com"
        mock_response = MagicMock()
        mock_response.user = mock_user

        with patch("app.services.auth_service.supabase") as mock_sb:
            mock_sb.auth.sign_up.return_value = mock_response
            resp = client.post("/api/v1/auth/signup", json={
                "email": "test@example.com",
                "password": "StrongPass123!"
            })
            assert resp.status_code == 201
            data = resp.json()
            assert data["email"] == "test@example.com"
            assert "id" in data

    def test_signup_rejects_weak_password(self, client):
        """Test that /auth/signup rejects passwords shorter than 8 characters."""
        resp = client.post("/api/v1/auth/signup", json={
            "email": "test@example.com",
            "password": "short"
        })
        assert resp.status_code == 422  # Pydantic validation error

    def test_signup_rejects_invalid_email(self, client):
        """Test that /auth/signup rejects invalid email format."""
        resp = client.post("/api/v1/auth/signup", json={
            "email": "not-an-email",
            "password": "StrongPass123!"
        })
        assert resp.status_code == 422

    def test_login_returns_tokens(self, client):
        """Test that /auth/login returns access_token, token_type, and refresh_token."""
        mock_session = MagicMock()
        mock_session.access_token = "mock-jwt-token"
        mock_session.refresh_token = "mock-refresh-token"
        mock_response = MagicMock()
        mock_response.session = mock_session

        with patch("app.services.auth_service.supabase") as mock_sb:
            mock_sb.auth.sign_in_with_password.return_value = mock_response
            resp = client.post("/api/v1/auth/login", json={
                "email": "test@example.com",
                "password": "StrongPass123!"
            })
            assert resp.status_code == 200
            data = resp.json()
            assert data["access_token"] == "mock-jwt-token"
            assert data["token_type"] == "bearer"
            assert data["refresh_token"] == "mock-refresh-token"

    def test_login_invalid_credentials(self, client):
        """Test that /auth/login rejects invalid credentials with a 401."""
        with patch("app.services.auth_service.supabase") as mock_sb:
            mock_sb.auth.sign_in_with_password.side_effect = Exception("Invalid credentials")
            resp = client.post("/api/v1/auth/login", json={
                "email": "wrong@example.com",
                "password": "wrongpassword1"
            })
            assert resp.status_code == 401

    def test_me_endpoint_returns_user(self, client):
        """Test that /auth/me returns current user details."""
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "email" in data

    def test_logout_succeeds(self, client):
        """Test that /auth/logout returns 200 for authenticated users."""
        resp = client.post("/api/v1/auth/logout")
        assert resp.status_code == 200
        data = resp.json()
        assert data["detail"] == "Successfully logged out"

    def test_protected_route_rejects_unauthenticated(self, unauthed_client):
        """Test that protected endpoints return 401 without a valid token."""
        resp = unauthed_client.get("/api/v1/auth/me")
        assert resp.status_code == 401
