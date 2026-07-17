from fastapi import APIRouter, Depends, HTTPException, status
from app.ai.providers.base import BaseAIProvider
from app.ai.dependencies import get_ai_provider
from app.ai.exceptions import ProviderConnectionError

router = APIRouter(prefix="/ai", tags=["AI Platform"])

@router.get("/health", status_code=status.HTTP_200_OK)
def ai_health_check(provider: BaseAIProvider = Depends(get_ai_provider)):
    """
    Verifies that the configured AI provider is reachable.
    Dynamically tests either the Mock provider or IBM Granite SDK.
    """
    try:
        is_healthy = provider.check_health()
        return {
            "status": "healthy" if is_healthy else "degraded",
            "provider": provider.__class__.__name__
        }
    except ProviderConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail=str(e)
        )
