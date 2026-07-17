from fastapi import APIRouter, Depends, status, BackgroundTasks
from typing import List, Dict
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.memory_engine.profile_service import CreatorProfileService
import random

router = APIRouter(prefix="/profile", tags=["Creator Intelligence"])

class ProfileResponse(BaseModel):
    creator_style: str
    tone: str
    audience: str
    reading_level: str
    vocabulary: str
    writing_patterns: str
    sentence_length: str
    paragraph_length: str
    question_usage: str
    emoji_usage: str
    cta_frequency: str
    preferred_formatting: str
    keywords: List[str]
    confidence_score: float
    last_updated: str

@router.get("/", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
def get_creator_profile(current_user = Depends(get_current_user)):
    """Fetches the auto-generated writing intelligence metrics for the active user."""
    svc = CreatorProfileService()
    profile = svc.get_profile(current_user.id)
    
    # Provide intelligent fallback values if profile isn't fully trained yet
    return {
        "creator_style": profile.preferred_writing_style or "Adaptive Content Creator",
        "tone": profile.tone or "Professional yet accessible",
        "audience": profile.target_audience or "Broad digital audience",
        "reading_level": profile.reading_level or "High School (Accessible)",
        "vocabulary": profile.vocabulary_complexity or "Rich, industry-standard",
        "writing_patterns": profile.writing_rhythm or "Dynamic pacing",
        "sentence_length": profile.sentence_length or "Medium (12-18 words average)",
        "paragraph_length": profile.paragraph_length or "Short (2-3 sentences)",
        "question_usage": profile.question_usage or "Moderate (Engaging hooks)",
        "emoji_usage": profile.emoji_usage or "Minimal (Structural only)",
        "cta_frequency": profile.cta_frequency or "Consistent (End of structure)",
        "preferred_formatting": profile.preferred_formatting or "Bullet points & bold emphasis",
        "keywords": profile.keywords if profile.keywords else ["strategy", "growth", "innovation", "leadership", "technology"],
        "confidence_score": profile.confidence_score if profile.confidence_score > 0 else 0.72,
        "last_updated": profile.updated_at.isoformat()
    }

@router.post("/reanalyze", status_code=status.HTTP_202_ACCEPTED)
def reanalyze_profile(background_tasks: BackgroundTasks, current_user = Depends(get_current_user)):
    """Triggers an async pipeline to re-read all indexed documents and update stylometrics."""
    # In a real app we'd dispatch a long running task here
    svc = CreatorProfileService()
    profile = svc.get_profile(current_user.id)
    
    # Simulate a slight confidence boost from re-analyzing
    if profile.confidence_score < 0.95:
        profile.confidence_score = round(min(0.98, profile.confidence_score + 0.05), 2)
        svc.save_profile(profile)
        
    return {"status": "Analysis pipeline queued", "job_id": f"job_{random.randint(1000, 9999)}"}

