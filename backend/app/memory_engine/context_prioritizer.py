from typing import List
from app.memory_engine.models import RankedChunk, CreatorProfile, ActiveContext
import datetime

class ContextPrioritizer:
    """
    Re-Ranks RAG output by injecting business-logic specific biases 
    (e.g., recency, creator profile relevance) over raw vector cosine similarity.
    """
    
    @staticmethod
    def rank_chunks(
        raw_chunks: List[dict], 
        profile: CreatorProfile, 
        context: ActiveContext
    ) -> List[RankedChunk]:
        
        ranked_results = []
        for raw in raw_chunks:
            base_score = raw.get("score", 0.0)
            
            # Simulated weighting algorithms
            # 1. Similarity weight
            final_score = base_score * 0.5 
            
            # 2. Recency weight (Boost if created recently)
            created_str = raw["metadata"].get("created_at", datetime.datetime.utcnow().isoformat())
            # Logic: adjust final_score based on date proximity...
            final_score += 0.2
            
            # 3. Creator / Workspace relevance weight
            if raw["metadata"].get("workspace_id") == context.workspace_id:
                final_score += 0.3
                
            ranked_results.append(RankedChunk(
                chunk_id=raw["id"],
                text=raw["text"],
                metadata=raw["metadata"],
                semantic_score=base_score,
                final_score=final_score
            ))
            
        # Sort by the business-logic synthesized score descending
        return sorted(ranked_results, key=lambda x: x.final_score, reverse=True)
