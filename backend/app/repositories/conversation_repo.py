from sqlalchemy.orm import Session
from app.db.models import Conversation, Message
from typing import List, Optional
import datetime
import json

class ConversationRepository:

    @staticmethod
    def create(db: Session, user_id: str, workspace_id: str, title: str = "New Conversation") -> Conversation:
        conv = Conversation(user_id=user_id, workspace_id=workspace_id, title=title)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    @staticmethod
    def list_for_user(db: Session, user_id: str, workspace_id: str, search: Optional[str] = None) -> List[Conversation]:
        q = db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.workspace_id == workspace_id
        )
        if search:
            q = q.filter(Conversation.title.ilike(f"%{search}%"))
        return q.order_by(Conversation.updated_at.desc()).all()

    @staticmethod
    def get(db: Session, conversation_id: str, user_id: str) -> Optional[Conversation]:
        return db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()

    @staticmethod
    def rename(db: Session, conversation_id: str, user_id: str, new_title: str) -> Optional[Conversation]:
        conv = ConversationRepository.get(db, conversation_id, user_id)
        if not conv:
            return None
        conv.title = new_title
        conv.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(conv)
        return conv

    @staticmethod
    def delete(db: Session, conversation_id: str, user_id: str) -> bool:
        conv = ConversationRepository.get(db, conversation_id, user_id)
        if not conv:
            return False
        db.delete(conv)
        db.commit()
        return True

    @staticmethod
    def add_message(db: Session, conversation_id: str, role: str, content: str, sources: list = None, latency: float = 0.0) -> Message:
        sources_json = json.dumps(sources or [])
        msg = Message(conversation_id=conversation_id, role=role, content=content, sources=sources_json, latency=latency)
        db.add(msg)
        # Bump conversation timestamps + counter
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            conv.message_count += 1
            conv.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def get_messages(db: Session, conversation_id: str) -> List[Message]:
        return db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()
