from fastapi import APIRouter, Depends, status, HTTPException
from app.rag.store import VectorStore
from app.rag.dependencies import get_vector_store
import logging

logger = logging.getLogger("creatormind")
router = APIRouter(prefix="/rag", tags=["RAG Lifecycle"])

@router.get("/health", status_code=status.HTTP_200_OK)
def rag_health_check(store: VectorStore = Depends(get_vector_store)):
    """Validates connectivity to the ChromaDB process."""
    if not store.client or not store.collection:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vector store (ChromaDB) is currently unreachable."
        )
    return {
        "status": "healthy",
        "collection": store.collection.name,
        "embedding_provider": store.embedding_provider.__class__.__name__
    }
