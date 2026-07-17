from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DocumentMetadata(BaseModel):
    filename: str
    file_type: str
    size_bytes: int
    char_count: int = 0
    estimated_tokens: int = 0
    extracted_at: datetime

class Chunk(BaseModel):
    chunk_index: int
    text: str
    metadata: dict

class ProcessingResult(BaseModel):
    success: bool
    metadata: Optional[DocumentMetadata] = None
    chunks: List[Chunk] = []
    error_message: Optional[str] = None
