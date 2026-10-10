"""ממלא את מסד הנתונים בנתוני דמו: מחלקות, קורסים ומשתמש מנהל.

הרצה:  python seed.py
אפשר להריץ שוב ושוב — הסקריפט לא יוצר כפילויות.
"""
from datetime import date

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import Course, Department, User
from app.security import hash_password

DEPARTMENTS = [
    {"name": "מדעי המחשב", "slug": "cs", "color": "#8b5cf6"},
    {"name": "עיצוב דיגיטלי", "slug": "design", "color": "#ec4899"},
    {"name": "ניהול עסקי", "slug": "business", "color": "#f59e0b"},
    {"name": "מדעי הנתונים", "slug": "data", "color": "#10b981"},
]

COURSES = [
    ("cs", "CS101", "מבוא לתכנות בפייתון", "ד\"ר יעל כהן", 4, 2400, 30,
     date(2026, 11, 1), "ימי א' 18:00-21:00",
     "משתנים, לולאות, פונקציות ומבני נתונים — מאפס ועד פרויקט ראשון."),
    ("cs", "CS210", "פיתוח Full-Stack", "אבי מזרחי", 6, 4800, 25,
     date(2026, 11, 15), "ימי ב' ו-ד' 18:00-21:30",
     "React בצד הלקוח, FastAPI בצד השרת, ומסדי נתונים ביניהם."),
    ("cs", "CS305", "ארכיטקטורת תוכנה", "פרופ' רון שגיא", 4, 3200, 20,
     date(2026, 12, 6), "ימי ג' 18:00-21:00",
     "דפוסי עיצוב, מיקרו-שירותים ותכנון מערכות שגדלות."),
    ("design", "DS120", "עיצוב UX/UI", "מיכל ברק", 4, 2900, 22,
     date(2026, 11, 8), "ימי ה' 17:00-20:00",
     "מחקר משתמשים, פריימים ב-Figma ובניית מערכת עיצוב."),
    ("design", "DS230", "מושן גרפיקס", "נועה פרידמן", 3, 2600, 18,
     date(2027, 1, 10), "ימי א' 17:00-20:00",
     "אנימציה לממשקים ולרשתות חברתיות."),
    ("business", "BA110", "יזמות וסטארט-אפ", "גיל אורן", 3, 1900, 40,
     date(2026, 11, 20), "ימי ו' 09:00-13:00",
     "מרעיון למוצר: מודל עסקי, גיוס והצגה למשקיעים."),
    ("business", "BA240", "מכירות B2B", "שירן לוי", 3, 2100, 30,
     date(2027, 1, 5), "ימי ג' 18:00-21:00",
     "ניהול לקוחות אסטרטגיים, משא ומתן וסגירת עסקאות."),
    ("data", "DA150", "SQL וניתוח נתונים", "עידו רוזן", 4, 2700, 28,
     date(2026, 11, 3), "ימי ג' 18:00-21:00",
     "שאילתות, JOIN-ים, אגרגציות ודשבורדים."),
    ("data", "DA310", "למידת מכונה מעשית", "ד\"ר תמר אלון", 5, 3900, 20,
     date(2027, 2, 1), "ימי ב' 18:00-21:30",
     "רגרסיה, סיווג ועבודה עם scikit-learn על דאטה אמיתי."),
]

ADMIN = {"email": "admin@ofek.ac.il", "full_name": "מנהל המערכת", "password": "Admin1234"}


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        depts: dict[str, Department] = {}
        for d in DEPARTMENTS:
            dept = db.scalar(select(Department).where(Department.slug == d["slug"]))
            if dept is None:
                dept = Department(**d)
                db.add(dept)
            depts[d["slug"]] = dept
        db.flush()

        for slug, code, title, instructor, credits, price, cap, start, sched, desc in COURSES:
            if db.scalar(select(Course).where(Course.code == code)) is None:
                db.add(Course(
                    code=code, title=title, instructor=instructor, credits=credits,
                    price=price, capacity=cap, start_date=start, schedule=sched,
                    description=desc, department_id=depts[slug].id,
                ))

        if db.scalar(select(User).where(User.email == ADMIN["email"])) is None:
            db.add(User(
                email=ADMIN["email"], full_name=ADMIN["full_name"], role="admin",
                hashed_password=hash_password(ADMIN["password"]),
            ))

        db.commit()
        print(f"✓ {len(DEPARTMENTS)} מחלקות, {len(COURSES)} קורסים, משתמש מנהל: {ADMIN['email']}")


if __name__ == "__main__":
    seed()
