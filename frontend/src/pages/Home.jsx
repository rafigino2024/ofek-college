import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatShortDate } from '../api'
import { useAuth } from '../auth'
import Horizon from '../components/Horizon'

export default function Home() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/departments'), api('/courses')])
      .then(([depts, courses]) => {
        setDepartments(depts)
        setUpcoming(courses.slice(0, 4)) // השרת כבר ממיין לפי תאריך פתיחה
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1>הקריירה הבאה שלך מתחילה בערב</h1>
          <p className="lead">
            קורסי ערב ב{departments.length ? `-${departments.length} ` : ''}מחלקות, עם מרצים
            מהתעשייה ומחזורים קטנים. בוחרים קורס, נרשמים, ומתחילים.
          </p>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-sun">לכל הקורסים</Link>
            {!user && <Link to="/register" className="btn btn-ghost">פתיחת חשבון</Link>}
          </div>
        </div>
        <Horizon />
      </section>

      {error && <p className="alert alert-error container">{error}</p>}

      {departments.length > 0 && (
        <section className="container section">
          <h2>המחלקות שלנו</h2>
          <div className="dept-grid">
            {departments.map((d) => (
              <Link
                key={d.id}
                to={`/courses?department=${d.slug}`}
                className="dept-tile"
                style={{ '--dept': d.color }}
              >
                {d.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="container section">
          <h2>מתחילים בקרוב</h2>
          <ol className="timeline">
            {upcoming.map((c) => (
              <li key={c.id} style={{ '--dept': c.department.color }}>
                <time dateTime={c.start_date}>{formatShortDate(c.start_date)}</time>
                <Link to={`/courses/${c.id}`}>
                  <strong>{c.title}</strong>
                  <span>{c.department.name}, {c.schedule}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
