import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.video import VideoStatus


class VideoCreate(BaseModel):
    athlete_id: uuid.UUID
    title: str
    description: str | None = None
    climb_grade: str | None = None
    location: str | None = None


class VideoRead(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    athlete_id: uuid.UUID
    title: str
    description: str | None
    storage_url: str
    status: VideoStatus
    climb_grade: str | None
    location: str | None
    duration_seconds: int | None
    created_at: datetime
    updated_at: datetime
