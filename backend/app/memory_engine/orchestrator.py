from typing import List
from app.memory_engine.profile_service import CreatorProfileService
from app.memory_engine.memory_manager import MemoryManager
from app.memory_engine.context_prioritizer import ContextPrioritizer
from app.memory_engine.prompt_composer import PromptComposer
from app.ai.providers.base import BaseAIProvider

class AIOrchestrator:
    """
    The central traffic controller. 
    Drives the lifecycle: Retrieve -> Rank -> Compose -> Generate -> Format.
    """
    def __init__(
        self,
        ai_provider: BaseAIProvider,
        profile_svc: CreatorProfileService,
        memory_mgr: MemoryManager,
    ):
        self.ai = ai_provider
        self.profiles = profile_svc
        self.memory = memory_mgr

    def run_inference_cycle(self, user_id: str, workspace_id: str, question: str, raw_rag_results: List[dict], system_prompt: str) -> str:
        profile = self.profiles.get_profile(user_id)
        active_context = self.memory.get_workspace_context(workspace_id, user_id)
        ranked_chunks = ContextPrioritizer.rank_chunks(raw_rag_results, profile, active_context)
        final_prompt = PromptComposer.combine(system_rules=system_prompt, question=question, profile=profile, context_chunks=ranked_chunks, history=active_context)
        
        raw_output = self.ai.generate(final_prompt)
        return raw_output.strip()

    async def run_stream_inference_cycle(self, user_id: str, workspace_id: str, question: str, raw_rag_results: List[dict], system_prompt: str):
        profile = self.profiles.get_profile(user_id)
        active_context = self.memory.get_workspace_context(workspace_id, user_id)
        ranked_chunks = ContextPrioritizer.rank_chunks(raw_rag_results, profile, active_context)
        final_prompt = PromptComposer.combine(system_rules=system_prompt, question=question, profile=profile, context_chunks=ranked_chunks, history=active_context)
        
        async for chunk in self.ai.stream_generate(final_prompt):
             yield chunk
