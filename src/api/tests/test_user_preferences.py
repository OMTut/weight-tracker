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


def test_update_weight_unit_to_kg(auth_client):
    client, token = auth_client
    resp = client.patch(
        "/api/user/preferences",
        json={"weight_unit": "kg"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["weight_unit"] == "kg"


def test_update_weight_unit_to_lbs(auth_client):
    client, token = auth_client
    # First set to kg
    client.patch(
        "/api/user/preferences",
        json={"weight_unit": "kg"},
        headers={"Authorization": f"Bearer {token}"},
    )
    # Then back to lbs
    resp = client.patch(
        "/api/user/preferences",
        json={"weight_unit": "lbs"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["weight_unit"] == "lbs"


def test_invalid_weight_unit(auth_client):
    client, token = auth_client
    resp = client.patch(
        "/api/user/preferences",
        json={"weight_unit": "pounds"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_no_token(client):
    resp = client.patch("/api/user/preferences", json={"weight_unit": "kg"})
    assert resp.status_code == 403
