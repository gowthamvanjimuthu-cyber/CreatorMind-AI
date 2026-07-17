from abc import ABC, abstractmethod
from app.knowledge_processing.models import DocumentMetadata

class BaseDocumentProcessor(ABC):
    @classmethod
    @abstractmethod
    def supported_extensions(cls) -> list[str]:
        pass

    @abstractmethod
    def extract_text(self, file_path: str) -> str:
        """Extract plain text from the document."""
        pass
        
    @abstractmethod
    def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract metadata (size, author, etc) from the document."""
        pass
