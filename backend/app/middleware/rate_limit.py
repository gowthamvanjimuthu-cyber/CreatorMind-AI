import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-process token-bucket rate limiter targeting AI endpoints."""

    AI_PATHS = {
        "/api/v1/chat/",
        "/api/v1/chat/stream",
        "/api/v1/writing/generate",
        "/api/v1/writing/generate/stream"
    }
    MAX_REQUESTS = 20    # per window
    WINDOW_SECONDS = 60

    def __init__(self, app):
        super().__init__(app)
        self._counters: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.AI_PATHS:
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()
            window_start = now - self.WINDOW_SECONDS

            # Prune old timestamps
            self._counters[client_ip] = [
                t for t in self._counters[client_ip] if t > window_start
            ]

            if len(self._counters[client_ip]) >= self.MAX_REQUESTS:
                return JSONResponse(
                    {"detail": "Rate limit exceeded. Please wait before making more requests."},
                    status_code=429,
                )

            self._counters[client_ip].append(now)

        return await call_next(request)
