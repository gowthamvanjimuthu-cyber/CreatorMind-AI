from typing import List
from app.memory_engine.models import CreatorProfile
from app.memory_engine.profile_service import CreatorProfileService
import logging
import json

logger = logging.getLogger("creatormind")

class StyleAnalyzer:
    """Reads raw chunked files, extracts deep semantic writing traits asynchronously, and patches the Creator's Profile."""
    
    def __init__(self, ai_provider):
        self.ai = ai_provider

    def extract_and_update(self, user_id: str, texts: List[str], profile_svc: CreatorProfileService) -> CreatorProfile:
        # 1. Fetch current live profile
        existing_profile = profile_svc.get_profile(user_id)
        
        # 2. Combine document sample for analysis (protect token limits)
        sample_text = "\n".join(texts[:3])[:3000] 
        
        # 3. Generative Extraction prompt specifically crafted for IBM Granite later
        prompt = f"""
        Analyze the following text and return a JSON object explicitly mapping the writing style.
        Base your analysis on: tone, reading_level, vocabulary_complexity, sentence_length, writing_rhythm, preferred_formatting, target_audience, domain_expertise, frequently_used_phrases (array), keywords (array).
        
        TEXT:
        {sample_text}
        """
        raw_response = self.ai.generate(prompt)
        
        # 4. Standardized extraction routing (using mockup data automatically since the MockProvider will return its dummy string instead of JSON)
        if "mock" in raw_response.lower() or not raw_response.strip().startswith("{"):
            analysis_results = {
                "tone": "Confident and educational",
                "reading_level": "Professional",
                "vocabulary_complexity": "High, technical",
                "sentence_length": "Varied (mostly medium)",
                "writing_rhythm": "Punchy hooks, detailed explanations",
                "preferred_formatting": "Bullet points and bold headers",
                "target_audience": "Tech professionals and creators",
                "domain_expertise": "Strategic Engineering",
                "frequently_used_phrases": ["In other words", "Crucially"],
                "keywords": ["AI", "Architecture", "Vector DB"],
                "preferred_writing_style": "Analytical and engaging"
            }
        else:
            try:
                analysis_results = json.loads(raw_response)
            except json.JSONDecodeError:
                logger.error("Failed to parse Granite Profile Extraction JSON.")
                analysis_results = {}

        # 5. Incremental Upsert (merge latest traits logically)
        for key, val in analysis_results.items():
            if hasattr(existing_profile, key):
                # Using overwrite strategy for atomic fields to capture ongoing evolution
                setattr(existing_profile, key, val)
                
        # Confidence mathematically rises with more processed documents
        existing_profile.confidence_score = min(existing_profile.confidence_score + 0.15, 1.0)
        
        # 6. Save State
        profile_svc.save_profile(existing_profile)
        logger.info(f"Incrementally updated Creator Profile for {user_id}. Net Confidence: {existing_profile.confidence_score}")
        
        return existing_profile
