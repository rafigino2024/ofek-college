"""סכמות Pydantic — מה נכנס ל-API ומה יוצא ממנו."""
import re
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    phone: str | None = None
    password: str = Field(min_length=8, max_length=72)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        digits = re.sub(r"[\s-]", "", v)
        if not re.fullmatch(r"0\d{8,9}", digits):
            raise ValueError("מספר טלפון לא תקין")
        return digits

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("הסיסמה חייבת לכלול לפחות אות אחת וספרה אחת")
        return v


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    phone: str | None
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- מחלקות וקורסים ----------

class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    color: str


class CourseBase(BaseModel):
    code: str = Field(min_length=2, max_length=20)
    title: str = Field(min_length=2, max_length=150)
    description: str = ""
    instructor: str = Field(min_length=2, max_length=120)
    credits: int = Field(ge=0, le=20)
    price: int = Field(ge=0)
    capacity: int = Field(ge=1, le=500)
    start_date: date
    schedule: str = ""
    department_id: int


class CourseCreate(CourseBase):
    pass


class CourseOut(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    department: DepartmentOut
    enrolled_count: int
    seats_left: int


class EnrollmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    course: CourseOut
