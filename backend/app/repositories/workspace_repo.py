from sqlalchemy.orm import Session
from app.db.models import Workspace
from typing import List, Optional
import datetime


class WorkspaceRepository:

    @staticmethod
    def create(db: Session, user_id: str, name: str, description: str = "") -> Workspace:
        ws = Workspace(user_id=user_id, name=name, description=description)
        db.add(ws)
        db.commit()
        db.refresh(ws)
        return ws

    @staticmethod
    def list_for_user(db: Session, user_id: str) -> List[Workspace]:
        return (
            db.query(Workspace)
            .filter(Workspace.user_id == user_id)
            .order_by(Workspace.updated_at.desc())
            .all()
        )

    @staticmethod
    def get(db: Session, workspace_id: str, user_id: str) -> Optional[Workspace]:
        """Ownership check enforced at DB level."""
        return db.query(Workspace).filter(
            Workspace.id == workspace_id,
            Workspace.user_id == user_id,
        ).first()

    @staticmethod
    def rename(db: Session, workspace_id: str, user_id: str,
               new_name: str, new_desc: str = None) -> Optional[Workspace]:
        ws = WorkspaceRepository.get(db, workspace_id, user_id)
        if not ws:
            return None
        ws.name = new_name
        if new_desc is not None:
            ws.description = new_desc
        ws.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(ws)
        return ws

    @staticmethod
    def delete(db: Session, workspace_id: str, user_id: str) -> bool:
        ws = WorkspaceRepository.get(db, workspace_id, user_id)
        if not ws:
            return False
        db.delete(ws)
        db.commit()
        return True

    @staticmethod
    def ensure_default(db: Session, user_id: str) -> Workspace:
        """Guarantee every user has at least one workspace."""
        existing = WorkspaceRepository.list_for_user(db, user_id)
        if existing:
            return existing[0]
        return WorkspaceRepository.create(db, user_id, name="My Workspace")
