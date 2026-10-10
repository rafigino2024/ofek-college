"""הצפנת סיסמאות, יצירת JWT וזיהוי המשתמש המחובר."""
import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

# בפרודקשן חובה להגדיר SECRET_KEY כמשתנה סביבה
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-key-change-me-in-production-32b+")
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="יש להתחבר מחדש",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise credentials_error
    user = db.get(User, user_id)
    if user is None:
        raise credentials_error
    return user


def require_admin(current: User = Depends(get_current_user)) -> User:
    """מאפשר גישה רק למשתמשים עם תפקיד admin."""
    if current.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "אין לך הרשאה לפעולה זו")
    return current
