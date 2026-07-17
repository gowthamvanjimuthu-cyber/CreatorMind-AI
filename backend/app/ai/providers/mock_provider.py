from app.ai.providers.base import BaseAIProvider
import logging

logger = logging.getLogger("creatormind")

class MockProvider(BaseAIProvider):
    """Mock implementation for rapid local development and unit testing."""
    def generate(self, prompt: str, **kwargs) -> str:
        logger.info(f"Mocking AI inference. Prompt length: {len(prompt)}")
        return "This is a mock AI response. The RAG pipeline and PromptBuilder successfully delivered context to the Provider."
        
    def check_health(self) -> bool:
        # Mock provider is always healthy
        return True
