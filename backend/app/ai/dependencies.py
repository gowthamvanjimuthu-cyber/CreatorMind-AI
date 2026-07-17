import logging
from app.core.config import settings
from app.ai.providers.base import BaseAIProvider

logger = logging.getLogger("creatormind")

def get_ai_provider() -> BaseAIProvider:
    provider = settings.AI_PROVIDER.lower().strip()

    if provider == "granite":
        try:
            from app.ai.providers.granite import GraniteProvider
            return GraniteProvider()
        except Exception as exc:
            logger.error(
                f"GraniteProvider failed to initialise ({exc}). "
                "Falling back to MockProvider."
            )
            from app.ai.providers.mock import MockProvider
            return MockProvider()

    from app.ai.providers.mock import MockProvider
    return MockProvider()
