from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.middleware.observability import ObservabilityMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.api.v1 import documents, chat, writing, profile, conversations, workspaces, dashboard
from app.api.v1 import rag as rag_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware (order matters: outermost runs first) ──────────────
app.add_middleware(ObservabilityMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.include_router(documents.router,  prefix="/api/v1")
app.include_router(chat.router,       prefix="/api/v1")
app.include_router(writing.router,    prefix="/api/v1")
app.include_router(profile.router,    prefix="/api/v1")
app.include_router(conversations.router, prefix="/api/v1")
app.include_router(workspaces.router,  prefix="/api/v1")
app.include_router(dashboard.router,   prefix="/api/v1")
app.include_router(rag_router.router, prefix="/api/v1")

# ── Health Endpoint ───────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health():
    return {"status": "healthy", "service": settings.APP_NAME, "version": settings.VERSION}
