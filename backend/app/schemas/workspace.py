from pydantic import BaseModel
from typing import Optional
import datetime


class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class WorkspaceOut(BaseModel):
    id: str
    name: str
    description: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
