from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
from models.weight_entry import WeightEntry

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
    user_id = resp.json()["user"]["id"]
    return client, token, user_id


def _add_entry(user_id: str, weight_value: float, recorded_at: date) -> None:
    db = TestingSessionLocal()
    entry = WeightEntry(user_id=user_id, weight_value=weight_value, recorded_at=recorded_at)
    db.add(entry)
    db.commit()
    db.close()


def test_list_entries_empty(auth_client):
    """Returns empty list with correct shape when user has no entries."""
    client, token, _ = auth_client
    resp = client.get("/api/weight/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["entries"] == []
    assert data["total"] == 0
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total_pages"] == 0


def test_list_entries_returns_only_own(auth_client, client):
    """Only current user's entries are returned."""
    _, token, user_id = auth_client
    # Register a second user and add an entry for them
    resp2 = client.post(
        "/api/auth/register",
        json={"name": "Other", "email": "other@example.com", "password": "pass1234"},
    )
    other_id = resp2.json()["user"]["id"]
    _add_entry(other_id, 80.0, date.today())
    _add_entry(user_id, 70.0, date.today())

    resp = client.get("/api/weight/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["entries"][0]["weight_value"] == 70.0


def test_list_entries_sorted_descending(auth_client):
    """Entries are sorted newest first."""
    client, token, user_id = auth_client
    older = date.today() - timedelta(days=5)
    newer = date.today()
    _add_entry(user_id, 68.0, older)
    _add_entry(user_id, 70.0, newer)

    resp = client.get("/api/weight/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    entries = resp.json()["entries"]
    assert entries[0]["weight_value"] == 70.0
    assert entries[1]["weight_value"] == 68.0


def test_list_entries_time_filter_7d(auth_client):
    """time_filter=7d excludes entries older than 7 days."""
    client, token, user_id = auth_client
    old_date = date.today() - timedelta(days=10)
    recent_date = date.today() - timedelta(days=3)
    _add_entry(user_id, 65.0, old_date)
    _add_entry(user_id, 70.0, recent_date)

    resp = client.get(
        "/api/weight/?time_filter=7d", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["entries"][0]["weight_value"] == 70.0


def test_list_entries_pagination(auth_client):
    """Pagination works correctly."""
    client, token, user_id = auth_client
    for i in range(15):
        _add_entry(user_id, 70.0 + i, date.today() - timedelta(days=i))

    resp = client.get(
        "/api/weight/?page=2&page_size=5", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 15
    assert data["total_pages"] == 3
    assert data["page"] == 2
    assert len(data["entries"]) == 5


def test_list_entries_no_token(client):
    """Returns 403 when no token provided."""
    resp = client.get("/api/weight/")
    assert resp.status_code == 403


def test_list_entries_invalid_token(client):
    """Returns 401 when token is invalid."""
    resp = client.get("/api/weight/", headers={"Authorization": "Bearer badtoken"})
    assert resp.status_code == 401
