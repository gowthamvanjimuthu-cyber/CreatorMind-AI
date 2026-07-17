from app.rag.embeddings.base import BaseEmbeddingProvider
from typing import List
import logging

logger = logging.getLogger("creatormind")

class GraniteEmbeddingProvider(BaseEmbeddingProvider):
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        logger.info("Placeholder: IBM Granite Embeddings not implemented.")
        return []

    def embed_query(self, text: str) -> List[float]:
        return []
