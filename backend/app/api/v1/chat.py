from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import time, json
from pydantic import BaseModel
from typing import List, Optional

from app.api.deps import get_current_user
from app.rag.models import RetrievalQuery
from app.rag.dependencies import get_vector_store
from app.ai.dependencies import get_ai_provider
from app.memory_engine.orchestrator import AIOrchestrator
from app.memory_engine.profile_service import CreatorProfileService
from app.memory_engine.memory_manager import MemoryManager
from app.db.session import get_db, SessionLocal
from app.repositories.conversation_repo import ConversationRepository

router = APIRouter(prefix="/chat", tags=["AI Chat"])


class ChatRequest(BaseModel):
    question: str
    workspace_id: str = "default_workspace"
    conversation_id: Optional[str] = None


class Citation(BaseModel):
    source: str
    chunk_index: int
    text_preview: str


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    citations: List[Citation]
    retrieved_chunks: int
    response_time: float


@router.post("/", response_model=ChatResponse)
def ask_question(
    req: ChatRequest,
    current_user=Depends(get_current_user),
    vector_store=Depends(get_vector_store),
    ai_provider=Depends(get_ai_provider),
    db: Session = Depends(get_db)
):
    start = time.time()

    # ── Resolve or create conversation ──────────────────────────
    if req.conversation_id:
        conv = ConversationRepository.get(db, req.conversation_id, current_user.id)
        if not conv:
            raise HTTPException(404, "Conversation not found")
    else:
        conv = ConversationRepository.create(
            db, user_id=current_user.id,
            workspace_id=req.workspace_id,
            title=req.question[:60]
        )

    ConversationRepository.add_message(db, conv.id, role="user", content=req.question)

    query = RetrievalQuery(
        query_text=req.question,
        user_id=current_user.id,
        workspace_id=req.workspace_id,
        top_k=5
    )
    results = vector_store.similarity_search(query)
    raw_rag = [
        {"id": r.id, "text": r.text, "metadata": r.metadata.model_dump(), "score": r.score}
        for r in results
    ]

    orchestrator = AIOrchestrator(ai_provider, CreatorProfileService(), MemoryManager())
    system_prompt = (
        "You are CreatorMind. Answer STRICTLY from the KNOWLEDGE BASE provided. "
        "Be concise and match the creator's tone."
    )
    answer = orchestrator.run_inference_cycle(
        user_id=current_user.id,
        workspace_id=req.workspace_id,
        question=req.question,
        raw_rag_results=raw_rag,
        system_prompt=system_prompt
    )

    citations = [
        Citation(source=r.metadata.source,
                 chunk_index=r.metadata.chunk_index,
                 text_preview=r.text[:80] + "...")
        for r in results
    ]
    sources_list = [{"source": c.source, "chunk_index": c.chunk_index} for c in citations]

    ConversationRepository.add_message(db, conv.id, role="ai",
                                        content=answer, sources=sources_list,
                                        latency=round(time.time() - start, 2))

    return ChatResponse(
        conversation_id=conv.id,
        answer=answer,
        citations=citations,
        retrieved_chunks=len(results),
        response_time=round(time.time() - start, 2)
    )


# ═══════════════════════════════════════════════════════════════
# SSE Streaming Chat Endpoint
# ═══════════════════════════════════════════════════════════════
@router.post("/stream")
async def ask_question_stream(
    req: ChatRequest,
    request: Request,
    current_user=Depends(get_current_user),
    vector_store=Depends(get_vector_store),
    ai_provider=Depends(get_ai_provider),
    db: Session = Depends(get_db)
):
    start = time.time()

    # ── Resolve or create conversation ──────────────────────────
    if req.conversation_id:
        conv = ConversationRepository.get(db, req.conversation_id, current_user.id)
        if not conv:
            raise HTTPException(404, "Conversation not found")
    else:
        conv = ConversationRepository.create(
            db, user_id=current_user.id,
            workspace_id=req.workspace_id,
            title=req.question[:60]
        )

    ConversationRepository.add_message(db, conv.id, role="user", content=req.question)

    # ── RAG retrieval (synchronous — fast) ───────────────────────
    query = RetrievalQuery(
        query_text=req.question,
        user_id=current_user.id,
        workspace_id=req.workspace_id,
        top_k=5
    )
    results = vector_store.similarity_search(query)
    raw_rag = [
        {"id": r.id, "text": r.text, "metadata": r.metadata.model_dump(), "score": r.score}
        for r in results
    ]

    citations = [
        {"source": r.metadata.source, "chunk_index": r.metadata.chunk_index, "text_preview": r.text[:80] + "..."}
        for r in results
    ]

    orchestrator = AIOrchestrator(ai_provider, CreatorProfileService(), MemoryManager())
    system_prompt = (
        "You are CreatorMind. Answer STRICTLY from the KNOWLEDGE BASE provided. "
        "Be concise and match the creator's tone."
    )

    async def event_generator():
        accumulated = ""
        try:
            # Phase 1: Thinking
            yield f"data: {json.dumps({'type': 'status', 'status': 'thinking', 'conversation_id': conv.id})}\n\n"

            # Phase 2: Generating (stream tokens)
            yield f"data: {json.dumps({'type': 'status', 'status': 'generating'})}\n\n"

            async for chunk in orchestrator.run_stream_inference_cycle(
                user_id=current_user.id,
                workspace_id=req.workspace_id,
                question=req.question,
                raw_rag_results=raw_rag,
                system_prompt=system_prompt
            ):
                # Client disconnected?
                if await request.is_disconnected():
                    break
                accumulated += chunk
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

            # Phase 3: Completed
            elapsed = round(time.time() - start, 2)

            # Persist AI message (using a fresh session to avoid request-scoped session issues)
            with SessionLocal() as persist_db:
                sources_list = [{"source": c["source"], "chunk_index": c["chunk_index"]} for c in citations]
                ConversationRepository.add_message(
                    persist_db, conv.id, role="ai",
                    content=accumulated.strip(),
                    sources=sources_list,
                    latency=elapsed
                )

            yield f"data: {json.dumps({'type': 'status', 'status': 'completed', 'elapsed': elapsed, 'citations': citations, 'retrieved_chunks': len(results)})}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            # Graceful error — preserve partial output on client
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'partial_content': accumulated})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
