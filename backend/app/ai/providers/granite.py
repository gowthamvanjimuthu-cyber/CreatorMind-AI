import time
import logging
from typing import Optional

from app.ai.providers.base import BaseAIProvider
from app.core.config import settings

logger = logging.getLogger("creatormind")


def _build_client():
    """Lazily build the IBM watsonx.ai client — fails loudly if env vars are missing."""
    try:
        from ibm_watsonx_ai import APIClient, Credentials
        credentials = Credentials(
            url=settings.IBM_URL,
            api_key=settings.IBM_API_KEY,
        )
        return APIClient(credentials)
    except ImportError:
        raise RuntimeError(
            "ibm-watsonx-ai package not installed. "
            "Run: pip install ibm-watsonx-ai"
        )
    except Exception as exc:
        raise RuntimeError(f"Failed to initialize IBM watsonx.ai client: {exc}") from exc


class GraniteProvider(BaseAIProvider):
    """
    Production IBM Granite inference provider.
    Conforms to BaseAIProvider — no business logic inside.
    """

    MAX_RETRIES = 3
    RETRY_DELAY = 1.5  # seconds between retries

    def __init__(self):
        if not settings.IBM_API_KEY or not settings.IBM_PROJECT_ID:
            raise EnvironmentError(
                "IBM_API_KEY and IBM_PROJECT_ID must be set in .env "
                "when AI_PROVIDER=granite"
            )
        self._client = _build_client()
        self._model_id = settings.IBM_MODEL_ID
        self._project_id = settings.IBM_PROJECT_ID
        logger.info(f"GraniteProvider initialised — model: {self._model_id}")

    # ----------------------------------------------------------------
    # Core inference (with retry + latency logging)
    # ----------------------------------------------------------------
    def generate(self, prompt: str, max_tokens: int = 1024, temperature: float = 0.7) -> str:
        from ibm_watsonx_ai.foundation_models import ModelInference
        from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params

        generate_params = {
            Params.MAX_NEW_TOKENS: max_tokens,
            Params.TEMPERATURE: temperature,
            Params.REPETITION_PENALTY: 1.1,
        }

        model = ModelInference(
            model_id=self._model_id,
            api_client=self._client,
            project_id=self._project_id,
            params=generate_params,
        )

        last_exc: Optional[Exception] = None
        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                t0 = time.perf_counter()
                response = model.generate_text(prompt=prompt)
                latency = round(time.perf_counter() - t0, 3)

                # Token usage (available in full response object)
                logger.info(
                    f"Granite inference OK | attempt={attempt} "
                    f"latency={latency}s | model={self._model_id}"
                )
                return response

            except Exception as exc:
                last_exc = exc
                logger.warning(
                    f"Granite inference attempt {attempt}/{self.MAX_RETRIES} failed: {exc}"
                )
                if attempt < self.MAX_RETRIES:
                    time.sleep(self.RETRY_DELAY * attempt)

        logger.error(f"Granite inference failed after {self.MAX_RETRIES} retries.")
        raise RuntimeError(f"IBM Granite inference failed: {last_exc}") from last_exc

    # ----------------------------------------------------------------
    # Chat inference (multi-turn)
    # ----------------------------------------------------------------
    def chat(self, messages: list[dict], max_tokens: int = 1024) -> str:
        """
        Accepts OpenAI-style messages list:
          [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]
        Concatenates into a single prompt for Granite models that don't expose a
        native chat endpoint yet.
        """
        prompt = "\n".join(
            f"{m['role'].upper()}:\n{m['content']}" for m in messages
        )
        return self.generate(prompt, max_tokens=max_tokens)
        
    async def stream_generate(self, prompt: str, max_tokens: int = 1024, temperature: float = 0.7):
        import asyncio
        from ibm_watsonx_ai.foundation_models import ModelInference
        from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params

        generate_params = {
            Params.MAX_NEW_TOKENS: max_tokens,
            Params.TEMPERATURE: temperature,
            Params.REPETITION_PENALTY: 1.1,
        }

        model = ModelInference(
            model_id=self._model_id,
            api_client=self._client,
            project_id=self._project_id,
            params=generate_params,
        )
        
        # watsonx generator object
        stream_response = model.generate_text_stream(prompt=prompt)
        
        # non-blocking iteration using asyncio
        # Some versions of watsonx return an iterator. We need to yield it asynchronously to avoid blocking loop
        for chunk in stream_response:
             yield chunk
             await asyncio.sleep(0.001)
             
    async def stream_chat(self, messages: list[dict], max_tokens: int = 1024):
        prompt = "\n".join(
            f"{m['role'].upper()}:\n{m['content']}" for m in messages
        )
        async for chunk in self.stream_generate(prompt, max_tokens=max_tokens):
             yield chunk
