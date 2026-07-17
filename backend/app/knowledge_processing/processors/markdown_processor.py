from app.knowledge_processing.processors.base import BaseDocumentProcessor
from app.knowledge_processing.models import DocumentMetadata
import datetime
import os

class MarkdownProcessor(BaseDocumentProcessor):
    @classmethod
    def supported_extensions(cls) -> list[str]:
        return [".md", ".markdown"]

    def extract_text(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    def extract_metadata(self, file_path: str) -> DocumentMetadata:
        stat = os.stat(file_path)
        return DocumentMetadata(
            filename=os.path.basename(file_path),
            file_type="text/markdown",
            size_bytes=stat.st_size,
            extracted_at=datetime.datetime.utcnow()
        )
