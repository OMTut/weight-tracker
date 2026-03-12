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

USER_A = {"name": "User A", "email": "usera@example.com", "password": "password123"}
USER_B = {"name": "User B", "email": "userb@example.com", "password": "password123"}


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
    """Register user A and return (client, token)."""
    resp = client.post("/api/auth/register", json=USER_A)
    token = resp.json()["access_token"]
    return client, token


def test_update_name(auth_client):
    client, token = auth_client
    resp = client.patch(
        "/api/user/profile",
        json={"name": "New Name"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"
    assert resp.json()["email"] == USER_A["email"]


def test_update_email(auth_client):
    client, token = auth_client
    resp = client.patch(
        "/api/user/profile",
        json={"email": "newemail@example.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == "newemail@example.com"
    assert resp.json()["name"] == USER_A["name"]


def test_update_email_conflict(client):
    """Changing to an email already used by another user returns 400."""
    client.post("/api/auth/register", json=USER_A)
    resp_b = client.post("/api/auth/register", json=USER_B)
    token_b = resp_b.json()["access_token"]

    resp = client.patch(
        "/api/user/profile",
        json={"email": USER_A["email"]},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Email already in use"


def test_update_persisted_in_me(auth_client):
    """Updated values are reflected in GET /api/auth/me."""
    client, token = auth_client
    client.patch(
        "/api/user/profile",
        json={"name": "Persisted Name"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Persisted Name"


def test_update_no_token(client):
    resp = client.patch("/api/user/profile", json={"name": "X"})
    assert resp.status_code == 403


def test_update_same_email_no_conflict(auth_client):
    """User can 'update' their own email with no conflict."""
    client, token = auth_client
    resp = client.patch(
        "/api/user/profile",
        json={"email": USER_A["email"]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == USER_A["email"]
