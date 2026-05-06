import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.video import Video, VideoStatus
from app.schemas.video import VideoRead
from app.services.storage import store_video
from app.services.gemini import analyze_video, generate_embedding
from app.models.analysis import Analysis
from app.config import settings

router = APIRouter(prefix="/videos", tags=["videos"])


async def _run_analysis(video_id: uuid.UUID, storage_url: str, db_url: str):
    """Background task that runs after a video is uploaded.

    This is the core of the RAG pipeline — runs outside the HTTP request cycle.
    It needs its own DB session because FastAPI's request-scoped session is already closed.

    CHALLENGE — implement these steps in order:
    1. Create a new async engine + session from db_url (see how upload_video uses get_db
       for reference, but here you can't use Depends — you have to build it manually)
    2. Fetch the Video by video_id and set status → VideoStatus.processing, then commit
    3. Read the video file bytes from storage_url using aiofiles.open(..., "rb")
    4. Call analyze_video(video_bytes) → gemini_result dict
    5. Stringify the result with json.dumps() — this is the text you'll embed
    6. Call generate_embedding(summary_text) → a list of 1536 floats
    7. Create an Analysis row and add it to the session
       (map each key from gemini_result, store the embedding, set raw_gemini_response)
    8. Set video.status → VideoStatus.analyzed and commit
    9. Wrap steps 3-8 in try/except — on any exception set status → VideoStatus.failed
    10. Always dispose the engine when done
    """
    raise NotImplementedError


@router.post("/upload", response_model=VideoRead, status_code=201)
async def upload_video(
    background_tasks: BackgroundTasks,
    athlete_id: uuid.UUID = Form(...),
    title: str = Form(...),
    description: str | None = Form(None),
    climb_grade: str | None = Form(None),
    location: str | None = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    max_bytes = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
    file_bytes = await file.read(max_bytes + 1)
    if len(file_bytes) > max_bytes:
        raise HTTPException(status_code=413, detail=f"Video exceeds {settings.MAX_VIDEO_SIZE_MB}MB limit")

    storage_url = await store_video(file_bytes, file.filename or "video.mp4", file.content_type or "video/mp4")

    video = Video(
        athlete_id=athlete_id,
        title=title,
        description=description,
        storage_url=storage_url,
        climb_grade=climb_grade,
        location=location,
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)

    # Fire and forget — _run_analysis runs after this response is sent
    background_tasks.add_task(_run_analysis, video.id, storage_url, settings.DATABASE_URL)
    return video


@router.get("/", response_model=list[VideoRead])
async def list_videos(
    athlete_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Video).order_by(Video.created_at.desc())
    if athlete_id:
        query = query.where(Video.athlete_id == athlete_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{video_id}", response_model=VideoRead)
async def get_video(video_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    video = await db.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video
