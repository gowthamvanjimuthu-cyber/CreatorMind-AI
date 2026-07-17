from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import Workspace, Conversation, Message, Document, WritingGeneration
from app.memory_engine.profile_service import CreatorProfileService
import logging
import time

logger = logging.getLogger("creatormind")

# In-memory transient cache to avoid hammering DB/Granite APIs on rapid dashboard clicks
_dashboard_cache = {}

class DashboardService:
    @staticmethod
    def get_metrics(db: Session, user_id: str, workspace_id: str) -> dict:
        cache_key = f"{user_id}:{workspace_id}"
        now = time.time()
        
        # Check cache (15 seconds TTL)
        if cache_key in _dashboard_cache:
            cached_data, timestamp = _dashboard_cache[cache_key]
            if now - timestamp < 15:
                return cached_data

        # --- Calculate metrics dynamically ---
        # 1. Workspace metrics
        total_workspaces = db.query(Workspace).filter(Workspace.user_id == user_id).count()
        active_ws = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == user_id).first()
        active_workspace_name = active_ws.name if active_ws else "Default Workspace"

        total_conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.workspace_id == workspace_id
        ).count()
        
        total_documents = db.query(Document).filter(
            Document.user_id == user_id,
            Document.workspace_id == workspace_id
        ).count()

        # Total Messages in active workspace (by checking all conversations in this workspace)
        total_messages = db.query(Message).join(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.workspace_id == workspace_id
        ).count()

        # 2. Knowledge Metrics
        total_chunks = db.query(func.sum(Document.chunk_count)).filter(
            Document.user_id == user_id,
            Document.workspace_id == workspace_id,
            Document.status == "INDEXED"
        ).scalar() or 0

        indexed_docs = db.query(Document).filter(
            Document.user_id == user_id,
            Document.workspace_id == workspace_id,
            Document.status == "INDEXED"
        ).count()

        failed_uploads = db.query(Document).filter(
            Document.user_id == user_id,
            Document.workspace_id == workspace_id,
            Document.status == "FAILED"
        ).count()

        avg_chunk_size = 850 if indexed_docs > 0 else 0

        # 3. AI Metrics
        questions_asked = db.query(Message).join(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.workspace_id == workspace_id,
            Message.role == "user"
        ).count()

        ai_responses = db.query(Message).join(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.workspace_id == workspace_id,
            Message.role == "ai"
        ).count()

        avg_response_time = db.query(func.avg(Message.latency)).join(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.workspace_id == workspace_id,
            Message.role == "ai",
            Message.latency > 0
        ).scalar() or 0.0
        avg_response_time = round(avg_response_time, 2)

        # Creator Profile metrics
        profile_svc = CreatorProfileService()
        profile = profile_svc.get_profile(user_id)
        confidence_score = profile.confidence_score
        keywords_learned = len(profile.keywords)
        avg_style_match = round(confidence_score * 100)

        # Count total writes (generation studio runs)
        total_content = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == user_id,
            WritingGeneration.workspace_id == workspace_id
        ).count()

        linkedin_posts = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == user_id,
            WritingGeneration.workspace_id == workspace_id,
            WritingGeneration.content_type == "linkedin_post"
        ).count()

        blogs = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == user_id,
            WritingGeneration.workspace_id == workspace_id,
            WritingGeneration.content_type == "blog"
        ).count()

        newsletters = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == user_id,
            WritingGeneration.workspace_id == workspace_id,
            WritingGeneration.content_type == "newsletter"
        ).count()

        twitter_posts = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == user_id,
            WritingGeneration.workspace_id == workspace_id,
            WritingGeneration.content_type == "twitter_thread"
        ).count()

        youtube_scripts = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == user_id,
            WritingGeneration.workspace_id == workspace_id,
            WritingGeneration.content_type == "youtube_script"
        ).count()

        instagram_captions = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == user_id,
            WritingGeneration.workspace_id == workspace_id,
            WritingGeneration.content_type == "instagram_caption"
        ).count()

        # Count Granite requests as ai_responses + total_content
        granite_requests = ai_responses + total_content

        # 4. Recent Activity Timeline
        recent_docs = db.query(Document).filter(
            Document.user_id == user_id, Document.workspace_id == workspace_id
        ).order_by(Document.created_at.desc()).limit(5).all()

        recent_convs = db.query(Conversation).filter(
            Conversation.user_id == user_id, Conversation.workspace_id == workspace_id
        ).order_by(Conversation.updated_at.desc()).limit(5).all()

        recent_genes = db.query(WritingGeneration).filter(
            WritingGeneration.user_id == user_id, WritingGeneration.workspace_id == workspace_id
        ).order_by(WritingGeneration.created_at.desc()).limit(5).all()

        timeline = []
        for d in recent_docs:
            timeline.append({
                "type": "document",
                "title": f"Document indexed: {d.filename}",
                "timestamp": d.created_at.isoformat(),
                "details": f"{d.chunk_count} chunks created" if d.status == "INDEXED" else "Indexing failed"
            })
        for c in recent_convs:
            timeline.append({
                "type": "conversation",
                "title": f"Chat active: {c.title}",
                "timestamp": c.updated_at.isoformat(),
                "details": f"{c.message_count} messages"
            })
        for g in recent_genes:
            timeline.append({
                "type": "generation",
                "title": f"Generated {g.content_type.replace('_', ' ')}",
                "timestamp": g.created_at.isoformat(),
                "details": f"Topic: {g.topic[:60]}... ({int(g.style_match_score)}% voice match)"
            })

        timeline = sorted(timeline, key=lambda x: x["timestamp"], reverse=True)[:7]

        metrics = {
            "workspaces": {
                "total": total_workspaces,
                "active_name": active_workspace_name,
                "total_documents": total_documents,
                "total_conversations": total_conversations,
                "total_messages": total_messages
            },
            "knowledge": {
                "total_chunks": total_chunks,
                "indexed_documents": indexed_docs,
                "failed_uploads": failed_uploads,
                "average_chunk_size": avg_chunk_size
            },
            "ai": {
                "questions_asked": questions_asked,
                "responses_generated": ai_responses,
                "average_response_time": avg_response_time,
                "granite_requests": granite_requests,
                "average_confidence_score": confidence_score
            },
            "writing": {
                "total_content": total_content,
                "linkedin": linkedin_posts,
                "blog": blogs,
                "newsletter": newsletters,
                "twitter": twitter_posts,
                "youtube": youtube_scripts,
                "instagram": instagram_captions
            },
            "creator": {
                "confidence": confidence_score,
                "keywords": keywords_learned,
                "documents_analyzed": indexed_docs,
                "average_style_match": avg_style_match
            },
            "timeline": timeline
        }
        
        _dashboard_cache[cache_key] = (metrics, now)
        return metrics
