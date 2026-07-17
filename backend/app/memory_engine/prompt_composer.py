from app.memory_engine.models import CreatorProfile, ActiveContext, RankedChunk
from typing import List

class PromptComposer:
    """Decoupled prompt compiler ensuring IBM Granite receives heavily personalized rule injections."""
    
    @staticmethod
    def combine(
        system_rules: str,
        question: str,
        profile: CreatorProfile,
        context_chunks: List[RankedChunk],
        history: ActiveContext
    ) -> str:
        
        # System instructions explicitly bounding the AI to assume this exact persona traits
        persona_block = f"""
[CREATOR PERSONA (MIMIC THIS STRICTLY)]
Tone: {profile.tone}
Reading Level: {profile.reading_level}
Vocabulary Complexity: {profile.vocabulary_complexity}
Sentence Length: {profile.sentence_length}
Writing Rhythm: {profile.writing_rhythm}
Preferred Formatting: {profile.preferred_formatting}
Target Audience: {profile.target_audience}
Domain Expertise: {profile.industry or profile.domain_expertise}
Frequently Used Phrases: {', '.join(profile.frequently_used_phrases)}
Keywords: {', '.join(profile.keywords)}
"""
        
        docs_block = "\n".join([f"- {c.text}" for c in context_chunks])
        history_block = "\n".join([f"{msg.role.upper()}: {msg.content}" for msg in history.recent_history])
        
        return f"""{system_rules}

{persona_block}

[KNOWLEDGE BASE]
{docs_block}

[CONVERSATION HISTORY]
{history_block}

[USER REQUEST]
{question}
"""
