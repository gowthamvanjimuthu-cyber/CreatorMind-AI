from pydantic_settings import BaseSettings

class RAGConfig(BaseSettings):
    CHROMA_DB_DIR: str = "./chroma_data"
    EMBEDDING_PROVIDER: str = "mock"  # "mock", "granite", "sentence_transformers"
    DEFAULT_COLLECTION_NAME: str = "creatormind_docs"
    
    class Config:
        case_sensitive = True
        env_prefix = "RAG_"

rag_settings = RAGConfig()
