import math
from datetime import date, timedelta
from uuid import uuid4

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.user import User
from models.weight_entry import WeightEntry
from schemas.weight import CreateWeightRequest, PaginatedWeightResponse, WeightEntryResponse

router = APIRouter(prefix="/api/weight", tags=["weight"])


@router.get("/", response_model=PaginatedWeightResponse)
def list_weight_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    time_filter: str = Query("all"),
):
    """Return a paginated list of the current user's weight entries with optional time filter."""
    query = db.query(WeightEntry).filter(WeightEntry.user_id == current_user.id)

    if time_filter == "7d":
        start_date = date.today() - timedelta(days=7)
        query = query.filter(WeightEntry.recorded_at >= start_date)
    elif time_filter == "30d":
        start_date = date.today() - timedelta(days=30)
        query = query.filter(WeightEntry.recorded_at >= start_date)
    elif time_filter == "3m":
        start_date = date.today() - timedelta(days=90)
        query = query.filter(WeightEntry.recorded_at >= start_date)

    total = query.count()
    entries = (
        query.order_by(WeightEntry.recorded_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedWeightResponse(
        entries=[WeightEntryResponse.model_validate(e) for e in entries],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.post("/", response_model=WeightEntryResponse, status_code=201)
def create_weight_entry(
    request: CreateWeightRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log a new weight entry for the current user. Date is always set to today server-side."""
    entry = WeightEntry(
        id=str(uuid4()),
        user_id=current_user.id,
        weight_value=request.weight_value,
        recorded_at=date.today(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return WeightEntryResponse.model_validate(entry)
