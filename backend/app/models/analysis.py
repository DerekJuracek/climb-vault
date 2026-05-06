import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.db.database import Base

EMBEDDING_DIM = 1536


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    video_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("videos.id"), unique=True, index=True)

    # Gemini extracted attributes
    movement_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    footwork_score: Mapped[int | None] = mapped_column(nullable=True)  # 1-10
    body_position_score: Mapped[int | None] = mapped_column(nullable=True)
    balance_score: Mapped[int | None] = mapped_column(nullable=True)
    technique_tags: Mapped[list | None] = mapped_column(JSON, nullable=True)  # ["heel hook", "flag", ...]
    key_moments: Mapped[list | None] = mapped_column(JSON, nullable=True)   # [{timestamp, description}, ...]
    raw_gemini_response: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Coach notes
    coach_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    coach_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # pgvector embedding for similarity search
    embedding: Mapped[list[float] | None] = mapped_column(Vector(EMBEDDING_DIM), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    video: Mapped["Video"] = relationship(back_populates="analysis")  # noqa: F821
