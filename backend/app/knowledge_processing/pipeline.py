from app.knowledge_processing.models import ProcessingResult, DocumentMetadata
from app.knowledge_processing.exceptions import UnsupportedFileTypeError, KnowledgeProcessingError
from app.knowledge_processing.processors.pdf_processor import PDFProcessor
from app.knowledge_processing.processors.docx_processor import DocxProcessor
from app.knowledge_processing.processors.markdown_processor import MarkdownProcessor
from app.knowledge_processing.processors.text_processor import TextProcessor
from app.knowledge_processing.chunking.base import BaseChunker
import os
import logging

logger = logging.getLogger("creatormind")

class DocumentPipeline:
    """
    Orchestrates the entire document ingestion process securely:
    Routing -> Extraction -> Metrics -> Normalization -> Chunking
    """
    def __init__(self, chunker: BaseChunker):
        self.chunker = chunker
        self._processors = self._register_processors()

    def _register_processors(self):
        """Open/Closed Principle: Future developers can inject new processors here."""
        processors = [PDFProcessor(), DocxProcessor(), MarkdownProcessor(), TextProcessor()]
        registry = {}
        for proc in processors:
            for ext in proc.supported_extensions():
                registry[ext.lower()] = proc
        return registry

    def process_file(self, file_path: str) -> ProcessingResult:
        _, ext = os.path.splitext(file_path)
        processor = self._processors.get(ext.lower())
        
        if not processor:
            return ProcessingResult(success=False, error_message=f"Unsupported file type: {ext}")

        try:
            # 1. Extraction (File -> Text & Meta)
            metadata = processor.extract_metadata(file_path)
            raw_text = processor.extract_text(file_path)
            
            # 2. Normalization (Clean garbage chars)
            normalized_text = raw_text.strip()
            
            # 3. Metrics updates
            metadata.char_count = len(normalized_text)
            metadata.estimated_tokens = metadata.char_count // 4  # Rough heuristic
            
            # 4. Chunking (Text -> Array of Chunks)
            chunks = self.chunker.split_text(normalized_text, metadata.model_dump())
            
            return ProcessingResult(
                success=True,
                metadata=metadata,
                chunks=chunks
            )
            
        except Exception as e:
            logger.error(f"Failed to process {file_path}: {e}", exc_info=True)
            return ProcessingResult(success=False, error_message=str(e))
