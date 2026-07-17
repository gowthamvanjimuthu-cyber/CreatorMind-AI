import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

@pytest.fixture
def client():
    """TestClient with auth bypassed."""
    with patch("app.api.deps.get_current_user", return_value=MagicMock(id="test-user-001")):
        from app.main import app
        yield TestClient(app)

@pytest.fixture
def mock_ai_provider():
    provider = MagicMock()
    provider.generate.return_value = "This is a mocked AI response."
    provider.chat.return_value = "This is a mocked chat response."
    return provider
