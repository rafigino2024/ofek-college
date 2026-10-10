import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app

client = TestClient(app)

STUDENT = {
    "email": "Dana@Example.com",
    "full_name": "דנה לוי",
    "phone": "050-1234567",
    "password": "secret123",
}


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def test_register_success():
    r = client.post("/api/auth/register", json=STUDENT)
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "dana@example.com"
    assert body["phone"] == "0501234567"
    assert body["role"] == "student"
    assert "password" not in body and "hashed_password" not in body


def test_register_duplicate_email():
    client.post("/api/auth/register", json=STUDENT)
    r = client.post("/api/auth/register", json=STUDENT)
    assert r.status_code == 409


def test_register_weak_password():
    r = client.post("/api/auth/register", json={**STUDENT, "password": "onlyletters"})
    assert r.status_code == 422


def test_register_bad_phone():
    r = client.post("/api/auth/register", json={**STUDENT, "phone": "12345"})
    assert r.status_code == 422


def test_login_and_me():
    client.post("/api/auth/register", json=STUDENT)
    r = client.post(
        "/api/auth/login",
        data={"username": "dana@example.com", "password": "secret123"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["full_name"] == "דנה לוי"


def test_login_wrong_password():
    client.post("/api/auth/register", json=STUDENT)
    r = client.post(
        "/api/auth/login",
        data={"username": "dana@example.com", "password": "wrong999"},
    )
    assert r.status_code == 401


def test_me_without_token():
    assert client.get("/api/auth/me").status_code == 401
