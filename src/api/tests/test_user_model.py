"""Unit tests for the User model and database setup."""
import os
import sys
import pytest
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

# Ensure the api module root is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from database import Base  # noqa: E402
from models.user import User  # noqa: E402


@pytest.fixture
def db():
    """Create an in-memory SQLite database for each test."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


def test_users_table_exists(db):
    """Users table must be created by Base.metadata.create_all."""
    engine = db.get_bind()
    inspector = inspect(engine)
    assert "users" in inspector.get_table_names()


def test_users_columns(db):
    """Users table must have all required columns."""
    engine = db.get_bind()
    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns("users")}
    assert columns == {"id", "email", "name", "hashed_password", "weight_unit", "created_at"}


def test_create_user_defaults(db):
    """User id is auto-generated UUID and weight_unit defaults to 'lbs'."""
    user = User(email="alice@example.com", name="Alice", hashed_password="hashed")
    db.add(user)
    db.commit()
    db.refresh(user)

    assert user.id is not None
    assert len(user.id) == 36  # UUID format
    assert user.weight_unit == "lbs"
    assert user.created_at is not None


def test_email_unique_constraint(db):
    """Email column must enforce uniqueness."""
    u1 = User(email="dup@example.com", name="User1", hashed_password="hash1")
    u2 = User(email="dup@example.com", name="User2", hashed_password="hash2")
    db.add(u1)
    db.commit()

    db.add(u2)
    with pytest.raises(IntegrityError):
        db.commit()


def test_weight_unit_accepts_kg(db):
    """weight_unit column should accept 'kg' value."""
    user = User(email="bob@example.com", name="Bob", hashed_password="hash", weight_unit="kg")
    db.add(user)
    db.commit()
    db.refresh(user)
    assert user.weight_unit == "kg"
