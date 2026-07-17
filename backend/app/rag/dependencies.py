from fastapi import Depends
from app.rag.config import rag_settings
from app.rag.embeddings.base import BaseEmbeddingProvider
from app.rag.embeddings.mock import MockEmbeddingProvider
from app.rag.embeddings.granite import GraniteEmbeddingProvider
from app.rag.store import VectorStore

def get_embedding_provider() -> BaseEmbeddingProvider:
    if rag_settings.EMBEDDING_PROVIDER.lower() == "granite":
        return GraniteEmbeddingProvider()
    return MockEmbeddingProvider(dimension=1536)

def get_vector_store(embedding_provider: BaseEmbeddingProvider = Depends(get_embedding_provider)) -> VectorStore:
    return VectorStore(embedding_provider=embedding_provider)
