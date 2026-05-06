import uuid
import aiofiles
import os
from pathlib import Path
from app.config import settings

LOCAL_UPLOAD_DIR = Path("uploads")


async def save_video_local(file_bytes: bytes, filename: str) -> str:
    LOCAL_UPLOAD_DIR.mkdir(exist_ok=True)
    unique_name = f"{uuid.uuid4()}_{filename}"
    dest = LOCAL_UPLOAD_DIR / unique_name
    async with aiofiles.open(dest, "wb") as f:
        await f.write(file_bytes)
    return str(dest)


async def upload_to_s3(file_bytes: bytes, filename: str, content_type: str) -> str:
    import boto3
    s3 = boto3.client(
        "s3",
        region_name=settings.S3_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )
    key = f"videos/{uuid.uuid4()}_{filename}"
    s3.put_object(
        Bucket=settings.S3_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/{key}"


async def store_video(file_bytes: bytes, filename: str, content_type: str = "video/mp4") -> str:
    if settings.S3_BUCKET:
        return await upload_to_s3(file_bytes, filename, content_type)
    return await save_video_local(file_bytes, filename)
