import time
import logging
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("creatormind")

class ObservabilityMiddleware(BaseHTTPMiddleware):
    """Attaches request IDs, logs method/path/status/latency for every request."""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        t0 = time.perf_counter()

        response = await call_next(request)

        latency = round((time.perf_counter() - t0) * 1000, 1)
        logger.info(
            f"req_id={request_id} method={request.method} "
            f"path={request.url.path} status={response.status_code} "
            f"latency_ms={latency}"
        )
        response.headers["X-Request-ID"] = request_id
        return response
