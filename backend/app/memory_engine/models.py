from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import datetime

class CreatorProfile(BaseModel):
    user_id: str
    preferred_writing_style: str = ""
    tone: str = ""
    target_audience: str = ""
    industry: str = ""
    reading_level: str = ""
    vocabulary_complexity: str = ""
    sentence_length: str = ""
    paragraph_length: str = ""
    question_usage: str = ""
    emoji_usage: str = ""
    cta_frequency: str = ""
    writing_rhythm: str = ""
    preferred_formatting: str = ""
    domain_expertise: str = ""
    frequently_used_phrases: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    writing_strengths: List[str] = Field(default_factory=list)
    confidence_score: float = 0.0
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class ActiveContext(BaseModel):
    workspace_id: str
    recent_history: List[ChatMessage] = Field(default_factory=list)
    user_preferences: Dict[str, str] = Field(default_factory=dict)

class RankedChunk(BaseModel):
    chunk_id: str
    text: str
    metadata: dict
    semantic_score: float = 0.0
    final_score: float = 0.0
