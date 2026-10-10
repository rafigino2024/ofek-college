"""טבלאות מסד הנתונים."""
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="student")  # student / admin
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Department(Base):
    """מחלקה / פקולטה — למשל 'מדעי המחשב'."""

    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    color: Mapped[str] = mapped_column(String(7), default="#7c3aed")  # לכרטיסים בפרונט

    courses: Mapped[list["Course"]] = relationship(back_populates="department")


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)  # למשל CS101
    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str] = mapped_column(Text, default="")
    instructor: Mapped[str] = mapped_column(String(120))
    credits: Mapped[int] = mapped_column(Integer, default=3)
    price: Mapped[int] = mapped_column(Integer, default=0)  # בשקלים
    capacity: Mapped[int] = mapped_column(Integer, default=30)
    start_date: Mapped[date] = mapped_column(Date)
    schedule: Mapped[str] = mapped_column(String(100), default="")  # "ימי ב' 18:00-21:00"
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))

    department: Mapped[Department] = relationship(back_populates="courses")
    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )

    @property
    def enrolled_count(self) -> int:
        return len(self.enrollments)

    @property
    def seats_left(self) -> int:
        return max(self.capacity - self.enrolled_count, 0)


class Enrollment(Base):
    """רישום של סטודנט לקורס. סטודנט יכול להירשם לכל קורס פעם אחת בלבד."""

    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_user_course"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped[User] = relationship(back_populates="enrollments")
    course: Mapped[Course] = relationship(back_populates="enrollments")
