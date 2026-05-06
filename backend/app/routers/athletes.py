import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.athlete import Athlete
from app.schemas.athlete import AthleteCreate, AthleteRead

router = APIRouter(prefix="/athletes", tags=["athletes"])


@router.post("/", response_model=AthleteRead, status_code=201)
async def create_athlete(body: AthleteCreate, db: AsyncSession = Depends(get_db)):
    athlete = Athlete(**body.model_dump())
    db.add(athlete)
    await db.commit()
    await db.refresh(athlete)
    return athlete


@router.get("/", response_model=list[AthleteRead])
async def list_athletes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Athlete).order_by(Athlete.created_at.desc()))
    return result.scalars().all()


@router.get("/{athlete_id}", response_model=AthleteRead)
async def get_athlete(athlete_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    athlete = await db.get(Athlete, athlete_id)
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return athlete
