from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "CreatorMind API"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Supabase Auth
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    JWT_SECRET: str = ""

    # AI Provider — "mock" or "granite"
    AI_PROVIDER: str = "mock"

    # IBM watsonx.ai
    IBM_API_KEY: Optional[str] = None
    IBM_PROJECT_ID: Optional[str] = None
    IBM_URL: str = "https://us-south.ml.cloud.ibm.com"
    IBM_MODEL_ID: str = "ibm/granite-13b-chat-v2"

    # RAG / vector store
    DATABASE_URL: str = "sqlite:///./creatormind.db"
    RAG_CHROMA_DB_DIR: str = "./chroma_data"
    RAG_EMBEDDING_PROVIDER: str = "mock"


settings = Settings()
