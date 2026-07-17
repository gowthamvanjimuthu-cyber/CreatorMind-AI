from abc import ABC, abstractmethod
from typing import List
from app.knowledge_processing.models import Chunk

class BaseChunker(ABC):
    """Abstract Strategy for splitting document text into chunks."""
    @abstractmethod
    def split_text(self, text: str, metadata: dict) -> List[Chunk]:
        pass
