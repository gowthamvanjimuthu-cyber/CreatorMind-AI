from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import time, json
from app.api.deps import get_current_user
from app.rag.dependencies import get_vector_store
from app.ai.dependencies import get_ai_provider
from app.writing.service import WritingService
from app.db.session import SessionLocal
from app.db.models import WritingGeneration
from app.rag.models import RetrievalQuery
from app.memory_engine.profile_service import CreatorProfileService
from app.memory_engine.memory_manager import MemoryManager
from app.memory_engine.context_prioritizer import ContextPrioritizer
from app.memory_engine.prompt_composer import PromptComposer
from app.writing.templates import get_template

router = APIRouter(prefix="/writing", tags=["Writing Studio"])

VALID_CONTENT_TYPES = ["linkedin_post", "blog", "twitter_thread", "newsletter", "youtube_script", "instagram_caption"]

class GenerateRequest(BaseModel):
    content_type: str
    topic: str
    instructions: Optional[str] = ""
    workspace_id: str
    tone_override: Optional[str] = None
    parent_id: Optional[str] = None # For regeneration / versioning

class GenerateResponse(BaseModel):
    id: str
    parent_id: Optional[str]
    version_number: int
    generated_content: str
    sources: List[dict]
    generation_time: float
    confidence_score: float
    style_match_score: float
    status: str
    is_favorite: int
    created_at: str

@router.post("/generate", response_model=GenerateResponse)
def generate_content(
    req: GenerateRequest,
    current_user = Depends(get_current_user),
    vector_store = Depends(get_vector_store),
    ai_provider = Depends(get_ai_provider)
):
    if req.content_type not in VALID_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid content_type. Choose from: {VALID_CONTENT_TYPES}")

    svc = WritingService(vector_store, ai_provider)
    # the generate_with_version method returns the db dictionary representation
    return svc.generate_with_version(
        user_id=current_user.id,
        workspace_id=req.workspace_id,
        content_type=req.content_type,
        topic=req.topic,
        instructions=req.instructions,
        tone_override=req.tone_override,
        parent_id=req.parent_id
    )

@router.get("/drafts")
def get_drafts(
    workspace_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    current_user = Depends(get_current_user)
):
    with SessionLocal() as db:

        query = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == current_user.id,
            WritingGeneration.parent_id == None
        )

        if workspace_id:
            query = query.filter(
                WritingGeneration.workspace_id == workspace_id
            )

        query = query.order_by(
            WritingGeneration.created_at.desc()
        )

        total = query.count()

        drafts = query.offset(
            (page - 1) * limit
        ).limit(limit).all()

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": [
                {
                    "id": d.id,
                    "content_type": d.content_type,
                    "topic": d.topic,
                    "status": d.status,
                    "is_favorite": d.is_favorite,
                    "created_at": d.created_at.isoformat(),
                    "generation_time": d.generation_time,
                    "style_match_score": d.style_match_score,
                    "confidence_score": d.confidence_score,
                    "generated_content": d.generated_content,
                    "citations": d.citations,
                    "source_documents": d.source_documents
                }
                for d in drafts
            ]
        }
        
@router.get("/drafts/{draft_id}/versions")
def get_draft_versions(
    draft_id: str,
    current_user = Depends(get_current_user)
):
    with SessionLocal() as db:
        parent = db.query(WritingGeneration).filter_by(id=draft_id, user_id=current_user.id).first()
        if not parent: raise HTTPException(status_code=404)
        
        versions = db.query(WritingGeneration).filter_by(parent_id=draft_id).order_by(WritingGeneration.version_number.desc()).all()
        # insert parent at bottom conceptually (version 1)
        res = [parent] + versions
        res.sort(key=lambda x: x.version_number, reverse=True)
        
        return [
            {
                "id": v.id,
                "version_number": v.version_number,
                "generated_content": v.generated_content,
                "generation_time": v.generation_time,
                "created_at": v.created_at.isoformat(),
                "instructions": v.instructions
            }
            for v in res
        ]

@router.put("/drafts/{draft_id}/favorite")
def toggle_favorite(draft_id: str, is_favorite: int, current_user = Depends(get_current_user)):
    with SessionLocal() as db:
        d = db.query(WritingGeneration).filter_by(id=draft_id, user_id=current_user.id).first()
        if not d: raise HTTPException(status_code=404)
        d.is_favorite = is_favorite
        db.commit()
    return {"status": "success", "is_favorite": is_favorite}

@router.put("/drafts/{draft_id}/status")
def change_status(draft_id: str, status: str, current_user = Depends(get_current_user)):
    with SessionLocal() as db:
        d = db.query(WritingGeneration).filter_by(id=draft_id, user_id=current_user.id).first()
        if not d: raise HTTPException(status_code=404)
        d.status = status # DRAFT or SAVED
        db.commit()
    return {"status": "success", "record_status": status}
    
@router.delete("/drafts/{draft_id}")
def delete_draft(draft_id: str, current_user = Depends(get_current_user)):
    with SessionLocal() as db:
        d = db.query(WritingGeneration).filter_by(id=draft_id, user_id=current_user.id).first()
        if not d: raise HTTPException(status_code=404)
        # Delete children
        db.query(WritingGeneration).filter_by(parent_id=draft_id).delete()
        db.delete(d)
        db.commit()
    return {"status": "success"}


# ═══════════════════════════════════════════════════════════════
# SSE Streaming Writing Generation
# ═══════════════════════════════════════════════════════════════
@router.post("/generate/stream")
async def generate_content_stream(
    req: GenerateRequest,
    request: Request,
    current_user = Depends(get_current_user),
    vector_store = Depends(get_vector_store),
    ai_provider = Depends(get_ai_provider)
):
    if req.content_type not in VALID_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid content_type. Choose from: {VALID_CONTENT_TYPES}")

    start = time.time()
    
    # ── Reuse the same prompt construction as WritingService ─────
    profile_svc = CreatorProfileService()
    memory_mgr = MemoryManager()
    
    profile = profile_svc.get_profile(current_user.id)
    if req.tone_override:
        profile.tone = req.tone_override

    query = RetrievalQuery(query_text=req.topic, user_id=current_user.id, workspace_id=req.workspace_id, top_k=5)
    results = vector_store.similarity_search(query)
    
    active_ctx = memory_mgr.get_workspace_context(req.workspace_id, current_user.id)
    raw_chunks = [{"id": r.id, "text": r.text, "metadata": r.metadata.model_dump(), "score": r.score} for r in results]
    ranked = ContextPrioritizer.rank_chunks(raw_chunks, profile, active_ctx)
    
    template = get_template(req.content_type)
    
    action_text = ""
    inst = req.instructions or ""
    if inst in ["improve", "shorten", "expand", "rewrite"]:
        action_map = {
            "improve": "Improve the quality, layout and clarity of the draft.",
            "shorten": "Make it significantly shorter, concise, and straight to the point.",
            "expand": "Expand on the details, add paragraphs, and make it longer.",
            "rewrite": "Rewrite this completely with a fresh perspective."
        }
        action_text = action_map[inst]
        
    system_prompt = f"""You are CreatorMind, an AI content engine.
Generate a {template['description']}.
Formatting rules: {template['format_hint']}
Stay strictly under {template['max_words']} words.
Use ONLY the knowledge base provided. Do NOT hallucinate facts.
Additional instructions from the creator: {action_text or inst or 'None.'}
"""
    
    final_prompt = PromptComposer.combine(
        system_rules=system_prompt,
        question=f"Generate a {req.content_type} about: {req.topic}",
        profile=profile,
        context_chunks=ranked,
        history=active_ctx
    )
    
    sources = [
    {
        "source": r.get("metadata", {}).get("source", "Unknown"),
        "chunk_index": r.get("metadata", {}).get("chunk_index", 0)
    }
    for r in raw_chunks
]
    style_match = round(profile.confidence_score * 100)

    async def event_generator():
        accumulated = ""
        try:
            yield f"data: {json.dumps({'type': 'status', 'status': 'thinking'})}\n\n"
            yield f"data: {json.dumps({'type': 'status', 'status': 'generating'})}\n\n"
            
            async for chunk in ai_provider.stream_generate(final_prompt):
                if await request.is_disconnected():
                    break
                accumulated += chunk
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

            elapsed = round(time.time() - start, 2)
            
            # Persist to DB
            with SessionLocal() as db:
                version_number = 1
                if req.parent_id:
                    last_ver = db.query(WritingGeneration).filter_by(parent_id=req.parent_id).order_by(WritingGeneration.version_number.desc()).first()
                    if last_ver: version_number = last_ver.version_number + 1
                    else: version_number = 2

                wg = WritingGeneration(
                    user_id=current_user.id,
                    workspace_id=req.workspace_id,
                    parent_id=req.parent_id,
                    version_number=version_number,
                    status="DRAFT",
                    is_favorite=0,
                    content_type=req.content_type,
                    topic=req.topic,
                    instructions=inst,
                    generated_content=accumulated.strip(),
                    generation_time=elapsed,
                    confidence_score=profile.confidence_score,
                    style_match_score=float(style_match),
                    citations=json.dumps(sources),
                    source_documents=json.dumps([s["source"] for s in sources])
                )
                db.add(wg)
                db.commit()
                
                yield f"data: {json.dumps({'type': 'status', 'status': 'completed', 'elapsed': elapsed, 'id': wg.id, 'version_number': version_number, 'style_match_score': style_match, 'confidence_score': profile.confidence_score, 'sources': sources})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'partial_content': accumulated})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
