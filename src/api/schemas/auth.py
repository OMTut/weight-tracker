from pydantic import BaseModel, EmailStr, ConfigDict


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    name: str
    weight_unit: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
