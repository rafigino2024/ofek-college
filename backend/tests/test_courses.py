from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Course, Department, User
from app.security import hash_password

client = TestClient(app)


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        cs = Department(name="מדעי המחשב", slug="cs")
        design = Department(name="עיצוב", slug="design")
        db.add_all([cs, design])
        db.flush()
        db.add_all([
            Course(code="CS101", title="מבוא לפייתון", instructor="יעל", capacity=2,
                   start_date=date(2026, 11, 1), department_id=cs.id),
            Course(code="DS120", title="עיצוב UX", instructor="מיכל", capacity=10,
                   start_date=date(2026, 12, 1), department_id=design.id),
        ])
        db.add(User(email="admin@ofek.ac.il", full_name="מנהל", role="admin",
                    hashed_password=hash_password("Admin1234")))
        db.commit()
    yield


def register_and_login(email: str) -> dict:
    client.post("/api/auth/register",
                json={"email": email, "full_name": "סטודנט", "password": "secret123"})
    token = client.post("/api/auth/login",
                        data={"username": email, "password": "secret123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def admin_headers() -> dict:
    token = client.post("/api/auth/login",
                        data={"username": "admin@ofek.ac.il", "password": "Admin1234"}
                        ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def course_id(code: str) -> int:
    return next(c["id"] for c in client.get("/api/courses").json() if c["code"] == code)


# ---------- רשימות וחיפוש ----------

def test_list_departments():
    names = [d["slug"] for d in client.get("/api/departments").json()]
    assert set(names) == {"cs", "design"}


def test_list_courses_and_filter():
    assert len(client.get("/api/courses").json()) == 2
    cs = client.get("/api/courses", params={"department": "cs"}).json()
    assert [c["code"] for c in cs] == ["CS101"]
    found = client.get("/api/courses", params={"q": "UX"}).json()
    assert [c["code"] for c in found] == ["DS120"]


def test_course_not_found():
    assert client.get("/api/courses/9999").status_code == 404


# ---------- רישום לקורס ----------

def test_enroll_requires_login():
    assert client.post(f"/api/courses/{course_id('CS101')}/enroll").status_code == 401


def test_enroll_and_list_my_courses():
    h = register_and_login("a@test.com")
    cid = course_id("CS101")
    r = client.post(f"/api/courses/{cid}/enroll", headers=h)
    assert r.status_code == 201
    assert r.json()["course"]["seats_left"] == 1

    mine = client.get("/api/me/enrollments", headers=h).json()
    assert [e["course"]["code"] for e in mine] == ["CS101"]


def test_cannot_enroll_twice():
    h = register_and_login("a@test.com")
    cid = course_id("CS101")
    client.post(f"/api/courses/{cid}/enroll", headers=h)
    assert client.post(f"/api/courses/{cid}/enroll", headers=h).status_code == 409


def test_course_full():
    cid = course_id("CS101")  # קיבולת 2
    for email in ("a@test.com", "b@test.com"):
        assert client.post(f"/api/courses/{cid}/enroll",
                           headers=register_and_login(email)).status_code == 201
    r = client.post(f"/api/courses/{cid}/enroll", headers=register_and_login("c@test.com"))
    assert r.status_code == 409
    assert r.json()["detail"] == "אין מקומות פנויים בקורס"


def test_cancel_frees_seat():
    cid = course_id("CS101")
    h = register_and_login("a@test.com")
    client.post(f"/api/courses/{cid}/enroll", headers=h)
    assert client.delete(f"/api/courses/{cid}/enroll", headers=h).status_code == 204
    assert client.get(f"/api/courses/{cid}").json()["seats_left"] == 2
    assert client.delete(f"/api/courses/{cid}/enroll", headers=h).status_code == 404


# ---------- הרשאות מנהל ----------

NEW_COURSE = {
    "code": "cs999", "title": "קורס חדש", "instructor": "מרצה", "credits": 3,
    "price": 1000, "capacity": 15, "start_date": "2027-03-01", "department_id": 1,
}


def test_student_cannot_create_course():
    h = register_and_login("a@test.com")
    assert client.post("/api/courses", json=NEW_COURSE, headers=h).status_code == 403


def test_admin_creates_course():
    r = client.post("/api/courses", json=NEW_COURSE, headers=admin_headers())
    assert r.status_code == 201
    assert r.json()["code"] == "CS999"
    assert r.json()["seats_left"] == 15
    # קוד כפול
    assert client.post("/api/courses", json=NEW_COURSE,
                       headers=admin_headers()).status_code == 409
