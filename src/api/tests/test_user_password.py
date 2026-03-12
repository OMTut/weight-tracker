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

USER = {"name": "Test User", "email": "test@example.com", "password": "oldpassword123"}


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


def test_update_password_success(auth_client):
    client, token = auth_client
    resp = client.patch(
        "/api/user/password",
        json={"current_password": USER["password"], "new_password": "newpassword456"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["message"] == "Password updated successfully"


def test_login_with_new_password(auth_client):
    """After password change, user can log in with new password."""
    client, token = auth_client
    client.patch(
        "/api/user/password",
        json={"current_password": USER["password"], "new_password": "newpassword456"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": USER["email"], "password": "newpassword456"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_wrong_current_password(auth_client):
    client, token = auth_client
    resp = client.patch(
        "/api/user/password",
        json={"current_password": "wrongpassword", "new_password": "newpassword456"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Current password is incorrect"


def test_new_password_too_short(auth_client):
    client, token = auth_client
    resp = client.patch(
        "/api/user/password",
        json={"current_password": USER["password"], "new_password": "short"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_no_token(client):
    resp = client.patch(
        "/api/user/password",
        json={"current_password": "anything", "new_password": "newpassword456"},
    )
    assert resp.status_code == 403
