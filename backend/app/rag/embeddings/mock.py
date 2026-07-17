from app.rag.embeddings.base import BaseEmbeddingProvider
from typing import List
import logging

logger = logging.getLogger("creatormind")

class MockEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        logger.info(f"Mocking embeddings for {len(texts)} documents")
        return [[0.1] * self.dimension for _ in texts]

    def embed_query(self, text: str) -> List[float]:
        logger.info(f"Mocking embedding for query: {text[:20]}...")
        return [0.1] * self.dimension
