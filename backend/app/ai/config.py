from pydantic_settings import BaseSettings

class AIConfig(BaseSettings):
    """Centralized AI configuration isolated from other app settings"""
    PROVIDER: str = "mock"  # "mock" or "ibm_granite"
    DEFAULT_TEMPERATURE: float = 0.7
    DEFAULT_MAX_TOKENS: int = 1500
    
    class Config:
        case_sensitive = True
        env_prefix = "AI_"

ai_settings = AIConfig()
