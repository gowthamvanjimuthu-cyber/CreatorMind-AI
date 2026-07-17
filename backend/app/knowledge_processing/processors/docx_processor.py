from app.knowledge_processing.processors.base import BaseDocumentProcessor
from app.knowledge_processing.models import DocumentMetadata
import datetime
import os

class DocxProcessor(BaseDocumentProcessor):
    @classmethod
    def supported_extensions(cls) -> list[str]:
        return [".docx"]

    def extract_text(self, file_path: str) -> str:
        # TODO: Implement python-docx extraction
        return "Mock DOCX Extracted Text"

    def extract_metadata(self, file_path: str) -> DocumentMetadata:
        stat = os.stat(file_path)
        return DocumentMetadata(
            filename=os.path.basename(file_path),
            file_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            size_bytes=stat.st_size,
            extracted_at=datetime.datetime.utcnow()
        )
