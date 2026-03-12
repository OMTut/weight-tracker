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
OTHER_USER_PAYLOAD = {"name": "Other User", "email": "other@example.com", "password": "password123"}


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


@pytest.fixture
def entry_id(auth_client):
    """Create a weight entry and return its id along with client and token."""
    client, token = auth_client
    resp = client.post(
        "/api/weight/",
        json={"weight_value": 185.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    return client, token, resp.json()["id"]


def test_delete_weight_entry_success(entry_id):
    """DELETE /api/weight/{id} returns 204 No Content on success."""
    client, token, eid = entry_id
    resp = client.delete(f"/api/weight/{eid}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 204
    assert resp.content == b""


def test_delete_weight_entry_removed_from_db(entry_id):
    """After DELETE, entry is no longer returned by GET /api/weight."""
    client, token, eid = entry_id
    client.delete(f"/api/weight/{eid}", headers={"Authorization": f"Bearer {token}"})
    list_resp = client.get("/api/weight/", headers={"Authorization": f"Bearer {token}"})
    assert list_resp.json()["total"] == 0


def test_delete_weight_entry_twice_returns_404(entry_id):
    """Deleting the same entry a second time returns 404."""
    client, token, eid = entry_id
    client.delete(f"/api/weight/{eid}", headers={"Authorization": f"Bearer {token}"})
    resp = client.delete(f"/api/weight/{eid}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 404


def test_delete_weight_entry_not_found(auth_client):
    """DELETE /api/weight/{id} returns 404 for non-existent entry."""
    client, token = auth_client
    resp = client.delete("/api/weight/nonexistent-id", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 404


def test_delete_weight_entry_other_user_returns_403(client, entry_id):
    """DELETE /api/weight/{id} returns 403 when entry belongs to another user."""
    _, _, eid = entry_id
    resp = client.post("/api/auth/register", json=OTHER_USER_PAYLOAD)
    other_token = resp.json()["access_token"]
    resp = client.delete(f"/api/weight/{eid}", headers={"Authorization": f"Bearer {other_token}"})
    assert resp.status_code == 403


def test_delete_weight_entry_no_token(client, entry_id):
    """DELETE without token returns 403."""
    _, _, eid = entry_id
    resp = client.delete(f"/api/weight/{eid}")
    assert resp.status_code == 403
