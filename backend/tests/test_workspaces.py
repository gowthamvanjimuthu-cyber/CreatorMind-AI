from unittest.mock import patch, MagicMock
import datetime, uuid

def _ws(**kw):
    from app.db.models import Workspace
    w = Workspace()
    w.id = kw.get("id", str(uuid.uuid4()))
    w.user_id = "test-user-001"
    w.name = kw.get("name", "My Workspace")
    w.description = ""
    w.created_at = datetime.datetime.utcnow()
    w.updated_at = datetime.datetime.utcnow()
    w.conversations = []
    return w

def test_create_workspace(client):
    ws = _ws()
    with patch("app.repositories.workspace_repo.WorkspaceRepository.create", return_value=ws):
        resp = client.post("/api/v1/workspaces/", json={"name": "My Workspace"})
    assert resp.status_code == 201
    assert resp.json()["name"] == "My Workspace"

def test_list_workspaces(client):
    with patch("app.repositories.workspace_repo.WorkspaceRepository.list_for_user", return_value=[]):
        resp = client.get("/api/v1/workspaces/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_get_default_workspace(client):
    ws = _ws()
    with patch("app.repositories.workspace_repo.WorkspaceRepository.ensure_default", return_value=ws):
        resp = client.get("/api/v1/workspaces/default")
    assert resp.status_code == 200

def test_rename_workspace(client):
    ws = _ws(name="Renamed")
    with patch("app.repositories.workspace_repo.WorkspaceRepository.rename", return_value=ws):
        resp = client.patch("/api/v1/workspaces/some-id", json={"name": "Renamed"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Renamed"

def test_delete_workspace(client):
    with patch("app.repositories.workspace_repo.WorkspaceRepository.delete", return_value=True):
        resp = client.delete("/api/v1/workspaces/some-id")
    assert resp.status_code == 204

def test_delete_404(client):
    with patch("app.repositories.workspace_repo.WorkspaceRepository.delete", return_value=False):
        resp = client.delete("/api/v1/workspaces/bad-id")
    assert resp.status_code == 404
