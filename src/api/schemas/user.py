from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UpdateProfileRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = None


class UpdatePasswordRequest(BaseModel):
    current_password: str = Field(..., max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)


class UpdatePreferencesRequest(BaseModel):
    weight_unit: Literal["lbs", "kg"]


class DeleteAccountRequest(BaseModel):
    password: str = Field(..., max_length=128)
