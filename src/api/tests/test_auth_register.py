import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture
def client():
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


def test_register_success(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["name"] == "Test User"
    assert "id" in data["user"]
    assert "hashed_password" not in data["user"]


def test_register_duplicate_email(client):
    payload = {"name": "Test User", "email": "test@example.com", "password": "password123"}
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Email already registered"


def test_register_missing_fields(client):
    resp = client.post("/api/auth/register", json={"email": "test@example.com"})
    assert resp.status_code == 422


def test_register_invalid_email(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Test", "email": "not-an-email", "password": "password123"},
    )
    assert resp.status_code == 422


def test_register_returns_weight_unit(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    assert resp.status_code == 201
    assert resp.json()["user"]["weight_unit"] == "lbs"
