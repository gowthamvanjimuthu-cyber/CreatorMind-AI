import time
import logging
from typing import Optional

from app.rag.models import RetrievalQuery
from app.memory_engine.orchestrator import AIOrchestrator
from app.memory_engine.profile_service import CreatorProfileService
from app.memory_engine.memory_manager import MemoryManager
from app.memory_engine.models import ActiveContext
from app.memory_engine.context_prioritizer import ContextPrioritizer
from app.memory_engine.prompt_composer import PromptComposer
from app.writing.templates import get_template

logger = logging.getLogger("creatormind")

class WritingService:
    def __init__(self, vector_store, ai_provider):
        self.vector_store = vector_store
        self.ai = ai_provider
        self.profile_svc = CreatorProfileService()
        self.memory_mgr = MemoryManager()

    def generate(
        self,
        user_id: str,
        workspace_id: str,
        content_type: str,
        topic: str,
        instructions: str = "",
        tone_override: Optional[str] = None,
    ) -> dict:
        start = time.time()

        # 1. Get Creator Profile
        profile = self.profile_svc.get_profile(user_id)
        if tone_override:
            profile.tone = tone_override

        # 2. Retrieve relevant context from ChromaDB
        query = RetrievalQuery(
            query_text=topic,
            user_id=user_id,
            workspace_id=workspace_id,
            top_k=5
        )
        results = self.vector_store.similarity_search(query)

        # 3. Re-rank chunks with Creator context
        active_ctx = self.memory_mgr.get_workspace_context(workspace_id, user_id)
        raw_chunks = [
            {"id": r.id, "text": r.text, "metadata": r.metadata.model_dump(), "score": r.score}
            for r in results
        ]
        ranked = ContextPrioritizer.rank_chunks(raw_chunks, profile, active_ctx)

        # 4. Get content type template
        template = get_template(content_type)

        # 5. Build the system prompt incorporating content type rules
        # Add modifier instruction for regeneration if provided
        action_text = ""
        if instructions in ["improve", "shorten", "expand", "rewrite"]:
            action_map = {
                "improve": "Improve the quality and clarity of the draft.",
                "shorten": "Make it significantly shorter and concise.",
                "expand": "Expand on the details and make it longer.",
                "rewrite": "Rewrite this completely with a fresh perspective."
            }
            action_text = action_map[instructions]
            
        system_prompt = f"""You are CreatorMind, an AI content engine.
Generate a {template['description']}.
Formatting rules: {template['format_hint']}
Stay strictly under {template['max_words']} words.
Use ONLY the knowledge base provided. Do NOT hallucinate facts.
Additional instructions from the creator: {action_text or instructions or 'None.'}
"""

        # 6. Compose full prompt via existing PromptComposer
        final_prompt = PromptComposer.combine(
            system_rules=system_prompt,
            question=f"Generate a {content_type} about: {topic}",
            profile=profile,
            context_chunks=ranked,
            history=active_ctx
        )

        # 7. AI Inference
        generated = self.ai.generate(final_prompt)

        # 8. Build source citations
        sources = [
            {"source": r.metadata.get("source", "Unknown"), "chunk_index": r.metadata.get("chunk_index", 0)}
            for r in raw_chunks
        ]
        
        # 9. Style match is approximated by confidence score (real impl: NLP similarity)
        style_match = round(profile.confidence_score * 100)

        # 10. Persist generation history in database
        from app.db.session import SessionLocal
        from app.db.models import WritingGeneration
        import json
        
        with SessionLocal() as db:
            # Check versioning if parent_id exists (we can infer parent_id from kwargs if passed, let's extract it from topic or kwargs later, for now we will just use kwargs if supported, else assume new)
            pass

    def generate_with_version(
        self,
        user_id: str,
        workspace_id: str,
        content_type: str,
        topic: str,
        instructions: str = "",
        tone_override: Optional[str] = None,
        parent_id: Optional[str] = None,
    ) -> dict:
        start = time.time()
        profile = self.profile_svc.get_profile(user_id)
        if tone_override: profile.tone = tone_override

        query = RetrievalQuery(query_text=topic, user_id=user_id, workspace_id=workspace_id, top_k=5)
        results = self.vector_store.similarity_search(query)

        active_ctx = self.memory_mgr.get_workspace_context(workspace_id, user_id)
        raw_chunks = [{"id": r.id, "text": r.text, "metadata": r.metadata.model_dump(), "score": r.score} for r in results]
        ranked = ContextPrioritizer.rank_chunks(raw_chunks, profile, active_ctx)

        template = get_template(content_type)
        
        action_text = ""
        if instructions in ["improve", "shorten", "expand", "rewrite"]:
            action_map = {
                "improve": "Improve the quality, layout and clarity of the draft.",
                "shorten": "Make it significantly shorter, concise, and straight to the point.",
                "expand": "Expand on the details, add paragraphs, and make it longer.",
                "rewrite": "Rewrite this completely with a fresh perspective."
            }
            action_text = action_map[instructions]
            
        system_prompt = f"""You are CreatorMind, an AI content engine.
Generate a {template['description']}.
Formatting rules: {template['format_hint']}
Stay strictly under {template['max_words']} words.
Use ONLY the knowledge base provided. Do NOT hallucinate facts.
Additional instructions from the creator: {action_text or instructions or 'None.'}
"""

        final_prompt = PromptComposer.combine(system_rules=system_prompt, question=f"Generate a {content_type} about: {topic}", profile=profile, context_chunks=ranked, history=active_ctx)
        generated = self.ai.generate(final_prompt)
        
        sources = [{"source": r.metadata.get("source", "Unknown"), "chunk_index": r.metadata.get("chunk_index", 0)} for r in raw_chunks]
        style_match = round(profile.confidence_score * 100)

        import json
        from app.db.session import SessionLocal
        from app.db.models import WritingGeneration

        with SessionLocal() as db:
            version_number = 1
            if parent_id:
                last_ver = db.query(WritingGeneration).filter_by(parent_id=parent_id).order_by(WritingGeneration.version_number.desc()).first()
                if last_ver: version_number = last_ver.version_number + 1
                else: version_number = 2

            wg = WritingGeneration(
                user_id=user_id,
                workspace_id=workspace_id,
                parent_id=parent_id,
                version_number=version_number,
                status="DRAFT",
                is_favorite=0,
                content_type=content_type,
                topic=topic,
                instructions=instructions or "",
                generated_content=generated.strip(),
                generation_time=round(time.time() - start, 2),
                confidence_score=profile.confidence_score,
                style_match_score=float(style_match),
                citations=json.dumps(sources),
                source_documents=json.dumps([s["source"] for s in sources])
            )
            db.add(wg)
            db.commit()
            
            return {
                "id": wg.id,
                "parent_id": wg.parent_id,
                "version_number": wg.version_number,
                "generated_content": wg.generated_content,
                "sources": sources,
                "generation_time": wg.generation_time,
                "confidence_score": wg.confidence_score,
                "style_match_score": wg.style_match_score,
                "status": wg.status,
                "is_favorite": wg.is_favorite,
                "created_at": wg.created_at.isoformat()
            }


