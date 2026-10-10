# מכללת אופק

אתר למכללה דמיונית: קטלוג קורסים, הרשמה, התחברות ורישום לקורסים.

- **בקאנד:** FastAPI, SQLAlchemy, SQLite, JWT
- **פרונטאנד:** React 19, Vite, React Router, עיצוב כהה ב-RTL

## הרצה מקומית

צריך שני טרמינלים.

### טרמינל 1: הבקאנד

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python seed.py                 # נתוני דמו, פעם אחת
uvicorn app.main:app --reload
```

תיעוד ה-API: http://localhost:8000/docs

### טרמינל 2: הפרונטאנד

```bash
cd frontend
npm install
npm run dev
```

האתר: http://localhost:5173

Vite מעביר כל קריאה ל-`/api` לשרת בפורט 8000, ולכן בפיתוח אין צורך בהגדרות CORS.

## משתמש מנהל לדמו

`admin@ofek.ac.il` / `Admin1234`

## בדיקות

```bash
cd backend
pytest
```

## מבנה

```
backend/
  app/
    main.py            השרת
    models.py          User, Department, Course, Enrollment
    schemas.py         ולידציה של קלט ופלט
    security.py        bcrypt, JWT, הרשאות מנהל
    routers/auth.py    הרשמה, התחברות, פרופיל
    routers/courses.py קורסים ורישום לקורס
  seed.py              נתוני דמו
  tests/               17 בדיקות

frontend/src/
  api.js               כל התקשורת עם השרת
  auth.jsx             מצב ההתחברות (Context)
  components/          Navbar, CourseCard, SeatsMeter, Horizon
  pages/               Home, Courses, CourseDetail, Login, Register, MyCourses
  styles.css           טוקנים ועיצוב
```
