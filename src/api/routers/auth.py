import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from dependencies.security import create_access_token, hash_password, verify_password
from models.user import User
from schemas.auth import AuthResponse, LoginRequest, RegisterRequest, ResetPasswordRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

ALLOW_PASSWORD_RESET = os.getenv("ALLOW_PASSWORD_RESET", "false").lower() == "true"


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email/password and return a JWT token."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id})
    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset a user's password by email.

    Only available when ALLOW_PASSWORD_RESET=true is set in the environment.
    Always returns 204 regardless of whether the email exists, to prevent enumeration.
    """
    if not ALLOW_PASSWORD_RESET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Password reset is disabled on this server. Contact your administrator.",
        )
    user = db.query(User).filter(User.email == body.email).first()
    if user:
        user.hashed_password = hash_password(body.new_password)
        db.commit()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new user account and return a JWT token."""
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
