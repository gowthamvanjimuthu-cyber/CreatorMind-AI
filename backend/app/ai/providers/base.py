from abc import ABC, abstractmethod

class BaseAIProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        """Single-turn text generation."""
        pass

    @abstractmethod
    async def stream_generate(self, prompt: str, **kwargs):
        """Streaming text generation."""
        pass

    @abstractmethod
    def chat(self, messages: list[dict], **kwargs) -> str:
        """Multi-turn chat inference."""
        pass

    @abstractmethod
    async def stream_chat(self, messages: list[dict], **kwargs):
        """Streaming multi-turn chat inference."""
        pass
