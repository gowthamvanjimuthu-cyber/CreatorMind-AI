from unittest.mock import patch, MagicMock

def _make_conv(**kwargs):
    from app.db.models import Conversation
    import datetime, uuid
    c = Conversation()
    c.id = kwargs.get("id", str(uuid.uuid4()))
    c.user_id = "test-user-001"
    c.workspace_id = "default_workspace"
    c.title = kwargs.get("title", "New Conversation")
    c.message_count = 0
    c.created_at = datetime.datetime.utcnow()
    c.updated_at = datetime.datetime.utcnow()
    c.messages = []
    return c

def test_create_conversation(client):
    conv = _make_conv()
    with patch("app.repositories.conversation_repo.ConversationRepository.create", return_value=conv):
        resp = client.post("/api/v1/conversations/", json={"workspace_id": "default_workspace"})
    assert resp.status_code == 201
    assert resp.json()["title"] == "New Conversation"

def test_list_conversations(client):
    with patch("app.repositories.conversation_repo.ConversationRepository.list_for_user", return_value=[]):
        resp = client.get("/api/v1/conversations/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_rename_conversation(client):
    conv = _make_conv(title="Updated Title")
    with patch("app.repositories.conversation_repo.ConversationRepository.rename", return_value=conv):
        resp = client.patch("/api/v1/conversations/some-id", json={"title": "Updated Title"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"

def test_delete_conversation(client):
    with patch("app.repositories.conversation_repo.ConversationRepository.delete", return_value=True):
        resp = client.delete("/api/v1/conversations/some-id")
    assert resp.status_code == 204

def test_delete_nonexistent_404(client):
    with patch("app.repositories.conversation_repo.ConversationRepository.delete", return_value=False):
        resp = client.delete("/api/v1/conversations/bad-id")
    assert resp.status_code == 404
