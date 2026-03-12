from pydantic import BaseModel, EmailStr, Field


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
