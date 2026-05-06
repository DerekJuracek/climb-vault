import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisRead, CoachNotesUpdate, SimilarVideoResult
from app.services.vector_store import find_similar_videos
from app.services.gemini import generate_embedding

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/{video_id}", response_model=AnalysisRead)
async def get_analysis(video_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Analysis).where(Analysis.video_id == video_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.patch("/{video_id}/coach-notes", response_model=AnalysisRead)
async def update_coach_notes(
    video_id: uuid.UUID,
    body: CoachNotesUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Analysis).where(Analysis.video_id == video_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    analysis.coach_notes = body.coach_notes
    if body.coach_id:
        analysis.coach_id = body.coach_id
    await db.commit()
    await db.refresh(analysis)
    return analysis


@router.get("/{video_id}/similar", response_model=list[SimilarVideoResult])
async def get_similar_videos(
    video_id: uuid.UUID,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Analysis).where(Analysis.video_id == video_id))
    analysis = result.scalar_one_or_none()
    if not analysis or analysis.embedding is None:
        raise HTTPException(status_code=404, detail="Analysis with embedding not found")

    return await find_similar_videos(db, analysis.embedding, limit=limit, exclude_video_id=video_id)
