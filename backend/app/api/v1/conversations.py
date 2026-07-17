from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_current_user
from app.db.session import get_db
from app.repositories.conversation_repo import ConversationRepository
from app.schemas.conversation import (
    ConversationCreate, ConversationRename,
    ConversationOut, ConversationDetail
)

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("/", response_model=ConversationOut, status_code=201)
def create_conversation(
    body: ConversationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ConversationRepository.create(
        db, user_id=current_user.id,
        workspace_id=body.workspace_id,
        title=body.title
    )


@router.get("/", response_model=List[ConversationOut])
def list_conversations(
    workspace_id: str = Query("default_workspace"),
    search: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ConversationRepository.list_for_user(
        db, user_id=current_user.id,
        workspace_id=workspace_id, search=search
    )


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = ConversationRepository.get(db, conversation_id, current_user.id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.patch("/{conversation_id}", response_model=ConversationOut)
def rename_conversation(
    conversation_id: str,
    body: ConversationRename,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = ConversationRepository.rename(db, conversation_id, current_user.id, body.title)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ok = ConversationRepository.delete(db, conversation_id, current_user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Conversation not found")
