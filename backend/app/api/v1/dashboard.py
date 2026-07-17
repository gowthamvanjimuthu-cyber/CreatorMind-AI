from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.db.session import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])

@router.get("/metrics")
def get_dashboard_metrics(
    workspace_id: str = Query(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DashboardService.get_metrics(db, current_user.id, workspace_id)
