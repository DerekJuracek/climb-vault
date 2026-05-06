from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/climb_vault"
    GEMINI_API_KEY: str = ""
    SECRET_KEY: str = "change-me"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:8081", "exp://localhost:8081"]
    MAX_VIDEO_SIZE_MB: int = 500

    # Optional S3
    S3_BUCKET: str = ""
    S3_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""


settings = Settings()
