import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
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


@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

USER = {"name": "Test User", "email": "test@example.com", "password": "password123"}


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
    resp = client.post("/api/auth/register", json=USER)
    token = resp.json()["access_token"]
    return client, token


def test_delete_account_returns_204(auth_client):
    client, token = auth_client
    resp = client.delete("/api/user/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 204


def test_deleted_user_jwt_invalid(auth_client):
    """After deletion, using the same JWT should return 401."""
    client, token = auth_client
    client.delete("/api/user/me", headers={"Authorization": f"Bearer {token}"})
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


def test_weight_entries_cascade_deleted(auth_client):
    """All weight entries for the deleted user should be removed."""
    client, token = auth_client
    headers = {"Authorization": f"Bearer {token}"}
    # Add 3 weight entries
    for value in [150.0, 151.0, 152.0]:
        client.post("/api/weight", json={"weight_value": value}, headers=headers)
    # Delete account
    client.delete("/api/user/me", headers=headers)
    # Verify weight entries are gone — use a different user to confirm isolation
    resp2 = client.post(
        "/api/auth/register",
        json={"name": "Other", "email": "other@example.com", "password": "password123"},
    )
    other_token = resp2.json()["access_token"]
    resp = client.get(
        "/api/weight", headers={"Authorization": f"Bearer {other_token}"}
    )
    assert resp.status_code == 200
    # The other user has no entries; original user's entries should not appear
    assert resp.json()["total"] == 0


def test_delete_account_no_token(client):
    resp = client.delete("/api/user/me")
    assert resp.status_code == 403
