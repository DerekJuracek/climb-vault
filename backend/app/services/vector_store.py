import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.analysis import Analysis
from app.models.video import Video
from app.schemas.analysis import SimilarVideoResult


async def find_similar_videos(
    db: AsyncSession,
    embedding: list[float],
    limit: int = 5,
    exclude_video_id: uuid.UUID | None = None,
) -> list[SimilarVideoResult]:
    
    smtp = select(Analysis, Video, (1 - Analysis.embedding.cosine_distance(embedding)).label("similarity")).join(Video, Analysis.video_id == Video.id).filter(Analysis.embedding.isnot(None)).order_by(Analysis.embedding.cosine_distance(embedding))
    if exclude_video_id is not None:
        smtp = smtp.where(Analysis.video_id != exclude_video_id)
    smtp = smtp.limit(limit)

    result = await db.execute(smtp)
    results = result.all()
    similar_videos = []
    for row in results:
        similar_videos.append(
            SimilarVideoResult(
                video_id=row.Analysis.video_id,
                title=row.Video.title,
                climb_grade=row.Video.climb_grade,
                movement_summary=row.Analysis.movement_summary,
                similarity=row.similarity
            )
        )
        
    return similar_videos


