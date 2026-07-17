from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query, status
from typing import List, Optional
from app.api.deps import get_current_user
from app.services.document_service import DocumentService
from pydantic import BaseModel

router = APIRouter(prefix="/documents", tags=["Documents Integration"])

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    file_size: int
    created_at: str
    status: str
    chunk_count: int
    preview_text: str

class DocumentPaginatedResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[DocumentResponse]

class BulkActionRequest(BaseModel):
    document_ids: List[str]

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    workspace_id: str = Query(...),
    current_user = Depends(get_current_user)
):
    try:
        service = DocumentService()
        doc = await service.process_upload(file, current_user.id, workspace_id)
        return doc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=DocumentPaginatedResponse)
def list_documents(
    workspace_id: str = Query(...),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    file_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user = Depends(get_current_user)
):
    service = DocumentService()
    return service.get_user_documents(
        current_user.id, workspace_id, page, limit, search, sort_by, sort_order, file_type, status
    )

@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: str, current_user = Depends(get_current_user)):
    service = DocumentService()
    success = service.delete_document(document_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return None

@router.post("/bulk/delete", status_code=200)
def bulk_delete_documents(req: BulkActionRequest, current_user = Depends(get_current_user)):
    service = DocumentService()
    deleted = service.bulk_delete(req.document_ids, current_user.id)
    return {"deleted": deleted}

@router.post("/bulk/reindex", status_code=200)
def bulk_reindex_documents(req: BulkActionRequest, current_user = Depends(get_current_user)):
    service = DocumentService()
    reindexed = service.bulk_reindex(req.document_ids, current_user.id)
    return {"reindexed": reindexed, "status": "In Progress"}

