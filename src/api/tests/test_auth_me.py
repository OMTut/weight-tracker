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


def test_get_me_success(auth_client):
    client, token = auth_client
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "hashed_password" not in data


def test_get_me_no_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 403  # HTTPBearer returns 403 when no credentials provided


def test_get_me_invalid_token(client):
    resp = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
    assert resp.status_code == 401


def test_get_me_deleted_user(client):
    """Token pointing to a deleted user returns 401."""
    resp = client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    token = resp.json()["access_token"]
    user_id = resp.json()["user"]["id"]

    # Delete the user directly from the db
    db = TestingSessionLocal()
    from models.user import User

    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    db.close()

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "User not found"
