from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field


class CreateWeightRequest(BaseModel):
    """Schema for creating a new weight entry."""

    weight_value: float = Field(..., gt=0)


class WeightEntryResponse(BaseModel):
    """Schema for a single weight entry in API responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    weight_value: float
    recorded_at: date
    created_at: datetime


class PaginatedWeightResponse(BaseModel):
    """Schema for a paginated list of weight entries."""

    entries: list[WeightEntryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
