from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user
from app.db.session import get_db
from app.repositories.workspace_repo import WorkspaceRepository
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceOut

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post("/", response_model=WorkspaceOut, status_code=201)
def create_workspace(
    body: WorkspaceCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return WorkspaceRepository.create(db, current_user.id, body.name, body.description or "")


@router.get("/", response_model=List[WorkspaceOut])
def list_workspaces(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return WorkspaceRepository.list_for_user(db, current_user.id)


@router.get("/default", response_model=WorkspaceOut)
def get_default_workspace(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns (or lazily creates) the user's first workspace — used on login restore."""
    return WorkspaceRepository.ensure_default(db, current_user.id)


@router.get("/{workspace_id}", response_model=WorkspaceOut)
def get_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = WorkspaceRepository.get(db, workspace_id, current_user.id)
    if not ws:
        raise HTTPException(404, "Workspace not found")
    return ws


@router.patch("/{workspace_id}", response_model=WorkspaceOut)
def update_workspace(
    workspace_id: str,
    body: WorkspaceUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = WorkspaceRepository.rename(
        db, workspace_id, current_user.id,
        new_name=body.name or "",
        new_desc=body.description,
    )
    if not ws:
        raise HTTPException(404, "Workspace not found")
    return ws


@router.delete("/{workspace_id}", status_code=204)
def delete_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ok = WorkspaceRepository.delete(db, workspace_id, current_user.id)
    if not ok:
        raise HTTPException(404, "Workspace not found")
