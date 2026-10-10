"""חיבור למסד הנתונים (SQLite לפיתוח מקומי)."""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ofek.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency של FastAPI: פותח סשן לכל בקשה וסוגר אותו בסוף."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
