import os
import uuid
import datetime
from fastapi import UploadFile
from typing import List
import logging

from app.knowledge_processing.pipeline import DocumentPipeline
from app.knowledge_processing.chunking.recursive import RecursiveChunker
from app.rag.dependencies import get_vector_store, get_embedding_provider
from app.rag.models import ChunkMetadata

# ORM models and database session
from app.db.session import SessionLocal
from app.db.models import Document, Workspace

# Import our new Intelligence Modules
from app.memory_engine.profile_service import CreatorProfileService
from app.memory_engine.style_analyzer import StyleAnalyzer
from app.ai.dependencies import get_ai_provider

logger = logging.getLogger("creatormind")


class DocumentService:
    def __init__(self):
        self.upload_dir = "./uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
        chunker = RecursiveChunker(chunk_size=1000, chunk_overlap=100)
        self.pipeline = DocumentPipeline(chunker)
        embedding_provider = get_embedding_provider()
        self.vector_store = get_vector_store(embedding_provider)

    async def process_upload(self, file: UploadFile, user_id: str, workspace_id: str = "default_workspace") -> dict:
        allowed_exts = [".pdf", ".docx", ".md", ".txt", ".markdown"]
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_exts:
            raise Exception(f"Unsupported file type. Expected one of {allowed_exts}")

        doc_id = str(uuid.uuid4())
        safe_filename = f"{doc_id}{ext}"
        file_path = os.path.join(self.upload_dir, safe_filename)
        content = await file.read()
        
        if len(content) > 10 * 1024 * 1024:
            raise Exception("File too large. Maximum size is 10MB.")

        with open(file_path, "wb") as f: f.write(content)

        # 1. Pipeline parse with failed status recording
        try:
            result = self.pipeline.process_file(file_path)
            if not result.success:
                raise Exception(f"Processing failed: {result.error_message}")
        except Exception as e:
            # Persist upload failure log for analytics
            with SessionLocal() as db:
                doc_record = Document(
                    id=doc_id, user_id=user_id, workspace_id=workspace_id,
                    filename=file.filename, file_type=ext, file_size=len(content), chunk_count=0,
                    status="FAILED"
                )
                db.add(doc_record)
                db.commit()
            if os.path.exists(file_path): os.remove(file_path)
            raise e

        chunk_ids, texts, metas = [], [], []
        for chunk in result.chunks:
            chunk_ids.append(f"{doc_id}_{chunk.chunk_index}")
            texts.append(chunk.text)
            metas.append(
                ChunkMetadata(
                    document_id=doc_id, user_id=user_id, workspace_id=workspace_id,
                    source=file.filename, chunk_index=chunk.chunk_index,
                    created_at=datetime.datetime.utcnow()
                )
            )

        # 2. Add raw chunks to VectorDB
        self.vector_store.add_documents(chunk_ids, texts, metas)
        
        # 3. Creator Profile Intelligence Hooks (asynchronous background analysis in real world)
        try:
            profile_svc = CreatorProfileService()
            analyzer = StyleAnalyzer(get_ai_provider())
            analyzer.extract_and_update(user_id, texts, profile_svc)
        except Exception as e:
            logger.error(f"Style Analysis Pipeline failed for doc {doc_id}: {e}", exc_info=True)

        # 4. Extract preview (first 100 chars of first chunk)
        preview = ""
        if len(texts) > 0:
            preview = texts[0][:150] + "..." if len(texts[0]) > 150 else texts[0]

        # 5. Save metadata record in DB
        with SessionLocal() as db:
            doc_record = Document(
                id=doc_id, user_id=user_id, workspace_id=workspace_id,
                filename=file.filename, file_type=ext, file_size=len(content), 
                chunk_count=len(texts), preview_text=preview, status="INDEXED"
            )
            db.add(doc_record)
            db.commit()
            
            payload = {
                "id": doc_record.id, "user_id": doc_record.user_id, "filename": doc_record.filename,
                "file_type": doc_record.file_type, "file_size": doc_record.file_size,
                "created_at": doc_record.created_at.isoformat(), "status": doc_record.status, 
                "chunk_count": doc_record.chunk_count, "preview_text": doc_record.preview_text
            }

        if os.path.exists(file_path): os.remove(file_path)
        return payload

    def get_user_documents(self, user_id: str, workspace_id: str = "default_workspace", page: int = 1, limit: int = 10, search: str = None, sort_by: str = "created_at", sort_order: str = "desc", file_type: str = None, status: str = None) -> dict:
        with SessionLocal() as db:
            query = db.query(Document).filter(
                Document.user_id == user_id,
                Document.workspace_id == workspace_id
            )
            
            if search:
                query = query.filter((Document.filename.ilike(f"%{search}%")) | (Document.preview_text.ilike(f"%{search}%")))
                
            if file_type:
                query = query.filter(Document.file_type == file_type)
                
            if status:
                query = query.filter(Document.status == status)

            # Sorting logic
            sort_attr = getattr(Document, sort_by, Document.created_at)
            if sort_order == "desc":
                query = query.order_by(sort_attr.desc())
            else:
                query = query.order_by(sort_attr.asc())

            total = query.count()
            docs = query.offset((page - 1) * limit).limit(limit).all()

            return {
                "total": total,
                "page": page,
                "limit": limit,
                "items": [
                    {
                        "id": d.id, "user_id": d.user_id, "filename": d.filename,
                        "file_type": d.file_type, "file_size": d.file_size, 
                        "created_at": d.created_at.isoformat(),
                        "status": d.status, "chunk_count": d.chunk_count,
                        "preview_text": d.preview_text or ""
                    }
                    for d in docs
                ]
            }

    def delete_document(self, document_id: str, user_id: str) -> bool:
        with SessionLocal() as db:
            doc = db.query(Document).filter(Document.id == document_id, Document.user_id == user_id).first()
            if not doc:
                return False
            self.vector_store.delete_document(document_id)
            db.delete(doc)
            db.commit()
            return True

    def bulk_delete(self, document_ids: List[str], user_id: str) -> int:
        deleted = 0
        for did in document_ids:
            if self.delete_document(did, user_id):
                deleted += 1
        return deleted

    def bulk_reindex(self, document_ids: List[str], user_id: str) -> int:
        # In a real app we'd dispatch to celery. For now, mark as re-indexing
        with SessionLocal() as db:
            docs = db.query(Document).filter(Document.id.in_(document_ids), Document.user_id == user_id).all()
            for d in docs:
                if d.status != "INDEXED":
                    d.status = "INDEXING"
            db.commit()
            return len(docs)


