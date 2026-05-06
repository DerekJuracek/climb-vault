import uuid
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
    """Query pgvector for analyses whose embedding is closest to the given one.

    CHALLENGE:
    - Build a SQLAlchemy select() that joins Analysis → Video
    - Filter out rows where Analysis.embedding IS NULL
    - Order by Analysis.embedding.cosine_distance(embedding)  ← pgvector operator
    - Compute a similarity score as (1 - cosine_distance) and label it "similarity"
    - Apply the exclude_video_id filter if provided
    - Apply .limit(limit)
    - Execute, then map each row to a SimilarVideoResult and return the list

    Cosine distance of 0 = identical, 2 = opposite.
    Similarity of 1 = identical, which is why we do 1 - distance.
    """
    raise NotImplementedError
