from typing import List
import chromadb
import logging

from app.rag.config import rag_settings
from app.rag.models import ChunkMetadata, RetrievedChunk, RetrievalQuery
from app.rag.embeddings.base import BaseEmbeddingProvider

logger = logging.getLogger("creatormind")

class VectorStore:
    """Manages collections, indexing, multi-tenant isolation, and retrieval from ChromaDB."""
    
    def __init__(self, embedding_provider: BaseEmbeddingProvider):
        self.embedding_provider = embedding_provider
        try:
            self.client = chromadb.PersistentClient(path=rag_settings.CHROMA_DB_DIR)
            self.collection = self.client.get_or_create_collection(
                name=rag_settings.DEFAULT_COLLECTION_NAME
            )
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.client = None
            self.collection = None

    def add_documents(self, ids: List[str], texts: List[str], metadatas: List[ChunkMetadata]) -> bool:
        if not self.collection: return False
        try:
            embeddings = self.embedding_provider.embed_documents(texts)
            
            clean_metadatas = []
            for meta in metadatas:
                m = meta.model_dump(exclude_none=True)
                if 'created_at' in m:
                    m['created_at'] = m['created_at'].isoformat()
                clean_metadatas.append(m)

            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=clean_metadatas
            )
            return True
        except Exception as e:
            logger.error(f"Error adding documents to ChromaDB: {e}")
            return False

    def delete_document(self, document_id: str) -> bool:
        if not self.collection: return False
        try:
            self.collection.delete(where={"document_id": document_id})
            return True
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False

    def update_document(self, document_id: str, new_ids: list[str], new_texts: list[str], new_metadatas: list[ChunkMetadata]) -> bool:
        self.delete_document(document_id)
        return self.add_documents(new_ids, new_texts, new_metadatas)

    def similarity_search(self, query: RetrievalQuery) -> List[RetrievedChunk]:
        if not self.collection: return []
        try:
            query_embedding = self.embedding_provider.embed_query(query.query_text)
            
            # Enforce multi-tenant data isolation at the vector DB level
            where_clause = {
                "$and": [
                    {"user_id": query.user_id},
                    {"workspace_id": query.workspace_id}
                ]
            }
            
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=query.top_k,
                where=where_clause
            )
            
            retrieved = []
            if results["documents"] and len(results["documents"]) > 0:
                for i in range(len(results["documents"][0])):
                    chunk_meta = results["metadatas"][0][i]
                    meta_obj = ChunkMetadata(**chunk_meta)
                    retrieved.append(
                        RetrievedChunk(
                            id=results["ids"][0][i],
                            text=results["documents"][0][i],
                            metadata=meta_obj,
                            score=results["distances"][0][i] if results["distances"] else 0.0
                        )
                    )
            return retrieved
        except Exception as e:
            logger.error(f"Error during similarity search: {e}", exc_info=True)
            return []
