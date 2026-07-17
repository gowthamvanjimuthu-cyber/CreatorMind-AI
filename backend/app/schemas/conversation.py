from pydantic import BaseModel
from typing import List, Optional
import datetime

class ConversationCreate(BaseModel):
    workspace_id: str
    title: str = "New Conversation"

class ConversationRename(BaseModel):
    title: str

class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[str] = "[]"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: str
    title: str
    workspace_id: str
    message_count: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class ConversationDetail(ConversationOut):
    messages: List[MessageOut] = []
