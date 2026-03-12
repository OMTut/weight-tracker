from datetime import date

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

REGISTER_PAYLOAD = {"name": "Test User", "email": "test@example.com", "password": "password123"}


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


@pytest.fixture
def auth_client(client):
    """Client with a registered user and their token."""
    resp = client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    token = resp.json()["access_token"]
    return client, token


def test_create_weight_entry_success(auth_client):
    """POST /api/weight returns 201 with the created entry."""
    client, token = auth_client
    resp = client.post(
        "/api/weight/",
        json={"weight_value": 185.5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["weight_value"] == 185.5
    assert data["recorded_at"] == date.today().isoformat()
    assert "id" in data
    assert "created_at" in data


def test_create_weight_entry_zero_returns_422(auth_client):
    """POST with weight_value=0 returns 422."""
    client, token = auth_client
    resp = client.post(
        "/api/weight/",
        json={"weight_value": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_create_weight_entry_negative_returns_422(auth_client):
    """POST with weight_value=-5 returns 422."""
    client, token = auth_client
    resp = client.post(
        "/api/weight/",
        json={"weight_value": -5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_create_weight_entry_no_token(client):
    """POST without token returns 403."""
    resp = client.post("/api/weight/", json={"weight_value": 185.5})
    assert resp.status_code == 403


def test_create_weight_entry_associates_with_user(auth_client, client):
    """Entry is associated with the current authenticated user only."""
    _, token = auth_client
    resp = client.post(
        "/api/weight/",
        json={"weight_value": 175.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201

    # Verify it appears in the list endpoint for this user
    list_resp = client.get("/api/weight/", headers={"Authorization": f"Bearer {token}"})
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] == 1
    assert list_resp.json()["entries"][0]["weight_value"] == 175.0
