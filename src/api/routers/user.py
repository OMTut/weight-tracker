from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.user import User
from schemas.auth import UserResponse
from schemas.user import UpdateProfileRequest

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
