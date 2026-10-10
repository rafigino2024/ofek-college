"""נתיבי מחלקות, קורסים ורישום לקורסים."""
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Course, Department, Enrollment, User
from ..schemas import CourseCreate, CourseOut, DepartmentOut, EnrollmentOut
from ..security import get_current_user, require_admin

router = APIRouter(prefix="/api", tags=["courses"])


def _get_course_or_404(db: Session, course_id: int) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "הקורס לא נמצא")
    return course


# ---------- מחלקות ----------

@router.get("/departments", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.scalars(select(Department).order_by(Department.name)).all()


# ---------- קורסים ----------

@router.get("/courses", response_model=list[CourseOut])
def list_courses(
    department: str | None = Query(None, description="slug של מחלקה"),
    q: str | None = Query(None, description="חיפוש בשם, קוד או מרצה"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Course)
        .options(selectinload(Course.department), selectinload(Course.enrollments))
        .order_by(Course.start_date)
    )
    if department:
        stmt = stmt.join(Course.department).where(Department.slug == department)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(Course.title.ilike(like), Course.code.ilike(like), Course.instructor.ilike(like))
        )
    return db.scalars(stmt).all()


@router.get("/courses/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    return _get_course_or_404(db, course_id)


@router.post("/courses", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if db.get(Department, data.department_id) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "המחלקה לא קיימת")
    course = Course(**{**data.model_dump(), "code": data.code.upper()})
    db.add(course)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "קוד הקורס כבר קיים")
    db.refresh(course)
    return course


# ---------- רישום לקורס ----------

@router.post(
    "/courses/{course_id}/enroll",
    response_model=EnrollmentOut,
    status_code=status.HTTP_201_CREATED,
)
def enroll(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    course = _get_course_or_404(db, course_id)

    already = db.scalar(
        select(Enrollment).where(Enrollment.user_id == user.id, Enrollment.course_id == course.id)
    )
    if already:
        raise HTTPException(status.HTTP_409_CONFLICT, "כבר נרשמת לקורס הזה")
    if course.seats_left <= 0:
        raise HTTPException(status.HTTP_409_CONFLICT, "אין מקומות פנויים בקורס")

    enrollment = Enrollment(user_id=user.id, course_id=course.id)
    db.add(enrollment)
    try:
        db.commit()
    except IntegrityError:  # שתי בקשות במקביל מאותו משתמש
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "כבר נרשמת לקורס הזה")
    db.refresh(enrollment)
    return enrollment


@router.delete("/courses/{course_id}/enroll", status_code=status.HTTP_204_NO_CONTENT)
def cancel_enrollment(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    enrollment = db.scalar(
        select(Enrollment).where(Enrollment.user_id == user.id, Enrollment.course_id == course_id)
    )
    if enrollment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "לא נמצא רישום לקורס הזה")
    db.delete(enrollment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me/enrollments", response_model=list[EnrollmentOut])
def my_enrollments(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    stmt = (
        select(Enrollment)
        .where(Enrollment.user_id == user.id)
        .options(selectinload(Enrollment.course).selectinload(Course.department))
        .order_by(Enrollment.created_at.desc())
    )
    return db.scalars(stmt).all()
