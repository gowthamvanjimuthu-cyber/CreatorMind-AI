from typing import List
from app.memory_engine.models import ActiveContext, ChatMessage

class MemoryManager:
    """Handles ephemeral memory: storing active conversations and session states."""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client

    def get_workspace_context(self, workspace_id: str, user_id: str) -> ActiveContext:
        # TODO: Load active context from Redis/DB logic
        return ActiveContext(workspace_id=workspace_id)

    def append_message(self, workspace_id: str, message: ChatMessage) -> bool:
        # TODO: Push to conversation history queue (trimming older than N messages)
        return True
