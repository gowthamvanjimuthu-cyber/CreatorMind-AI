from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

class ChunkMetadata(BaseModel):
    document_id: str
    user_id: str
    workspace_id: str
    source: str
    chunk_index: int
    page_number: Optional[int] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class RetrievalQuery(BaseModel):
    query_text: str
    user_id: str
    workspace_id: str
    top_k: int = 5

class RetrievedChunk(BaseModel):
    id: str
    text: str
    metadata: ChunkMetadata
    score: float
