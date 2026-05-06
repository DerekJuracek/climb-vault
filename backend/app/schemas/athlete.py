import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr


class AthleteCreate(BaseModel):
    name: str
    email: EmailStr


class AthleteRead(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    email: str
    created_at: datetime
