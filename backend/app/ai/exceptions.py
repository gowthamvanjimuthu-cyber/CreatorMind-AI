class AIException(Exception):
    """Base exception for all AI platform errors."""
    pass

class ProviderConnectionError(AIException):
    """Raised when the underlying AI provider is unreachable."""
    pass

class PromptGenerationError(AIException):
    """Raised when a prompt fails to build gracefully."""
    pass
