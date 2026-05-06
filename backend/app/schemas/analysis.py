import uuid
from datetime import datetime
from pydantic import BaseModel


class CoachNotesUpdate(BaseModel):
    coach_notes: str
    coach_id: str | None = None


class AnalysisRead(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    video_id: uuid.UUID
    movement_summary: str | None
    footwork_score: int | None
    body_position_score: int | None
    balance_score: int | None
    technique_tags: list[str] | None
    key_moments: list[dict] | None
    coach_notes: str | None
    coach_id: str | None
    created_at: datetime
    updated_at: datetime


class SimilarVideoResult(BaseModel):
    video_id: uuid.UUID
    title: str
    climb_grade: str | None
    movement_summary: str | None
    similarity: float
