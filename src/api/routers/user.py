from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from dependencies.security import hash_password, verify_password
from models.user import User
from schemas.auth import UserResponse
from schemas.user import UpdatePasswordRequest, UpdatePreferencesRequest, UpdateProfileRequest

router = APIRouter(prefix="/api/user", tags=["user"])


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    body: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's display name and/or email address."""
    if body.name is not None:
        current_user.name = body.name

    if body.email is not None:
        conflict = (
            db.query(User)
            .filter(User.email == body.email, User.id != current_user.id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = body.email

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.patch("/password")
def update_password(
    body: UpdatePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change the current user's password after verifying the existing one."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.patch("/preferences", response_model=UserResponse)
def update_preferences(
    body: UpdatePreferencesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's weight unit preference (lbs or kg)."""
    current_user.weight_unit = body.weight_unit
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
