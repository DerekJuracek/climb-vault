import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
import enum


class VideoStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    analyzed = "analyzed"
    failed = "failed"


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    athlete_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("athletes.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    storage_url: Mapped[str] = mapped_column(String(1024))
    status: Mapped[VideoStatus] = mapped_column(Enum(VideoStatus), default=VideoStatus.uploaded)
    climb_grade: Mapped[str | None] = mapped_column(String(16), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    athlete: Mapped["Athlete"] = relationship(back_populates="videos")  # noqa: F821
    analysis: Mapped["Analysis | None"] = relationship(back_populates="video", uselist=False)  # noqa: F821
