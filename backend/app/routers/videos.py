import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
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
    engine = create_async_engine(db_url, echo=False)  
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    video = select(Video).where(Video.id == video_id)
    async with async_session() as session:
        result = await session.execute(video)
        video_obj = result.scalar_one_or_none()
        if not video_obj:
            print(f"Video with ID {video_id} not found in DB.")
            return

        video_obj.status = VideoStatus.processing
        await session.commit()

        try:
            import aiofiles
            async with aiofiles.open(storage_url, "rb") as f:
                video_bytes = await f.read()

            gemini_result = await analyze_video(video_bytes)

            summary_text = json.dumps(gemini_result)
            embedding_vector = await generate_embedding(summary_text)

            analysis = Analysis(
                video_id=video_id,
                movement_summary=gemini_result.get("movement_summary", ""),
                footwork_score=gemini_result.get("footwork_score", 0),
                body_position_score=gemini_result.get("body_position_score", 0),
                balance_score=gemini_result.get("balance_score", 0),
                technique_tags=gemini_result.get("technique_tags", []),
                key_moments=gemini_result.get("key_moments", []),
                embedding=embedding_vector,
                raw_gemini_response=json.dumps(gemini_result),
            )
            print(f"Analysis for video {video_id}: {analysis}")
            session.add(analysis)

            video_obj.status = VideoStatus.analyzed
            await session.commit()
        except Exception as e:
            print(f"Error processing video {video_id}: {e}")
            video_obj.status = VideoStatus.failed
            await session.commit()
        
    await engine.dispose()


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
