from pydantic import BaseModel, EmailStr


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
