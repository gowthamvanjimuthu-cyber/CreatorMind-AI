from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "CreatorMind API"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

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

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
