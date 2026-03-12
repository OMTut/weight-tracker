from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


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
