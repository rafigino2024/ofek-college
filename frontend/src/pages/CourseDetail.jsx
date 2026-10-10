import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, formatDate, formatPrice } from '../api'
import { useAuth } from '../auth'
import SeatsMeter from '../components/SeatsMeter'

export default function CourseDetail() {
  const { id } = useParams()
  const { user, enrolledIds, refreshEnrollments } = useAuth()
  const [course, setCourse] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setCourse(null)
    setError('')
    api(`/courses/${id}`).then(setCourse).catch((e) => setError(e.message))
  }, [id])

  const enrolled = course && enrolledIds.has(course.id)

  async function act(method) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api(`/courses/${id}/enroll`, { method })
      await refreshEnrollments()
      setCourse(await api(`/courses/${id}`)) // מספר המקומות התעדכן
      setNotice(method === 'POST' ? 'נרשמת לקורס.' : 'ההרשמה לקורס בוטלה.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (error && !course) {
    return (
      <section className="container section">
        <p className="alert alert-error">{error}</p>
        <Link to="/courses" className="btn btn-ghost">חזרה לקטלוג</Link>
      </section>
    )
  }
  if (!course) return <p className="page-status">טוען…</p>

  return (
    <article className="container section course-detail" style={{ '--dept': course.department.color }}>
      <Link to="/courses" className="back-link">חזרה לקטלוג</Link>

      <header className="detail-header">
        <div className="detail-meta">
          <span className="course-code">{course.code}</span>
          <Link to={`/courses?department=${course.department.slug}`} className="dept-name">
            {course.department.name}
          </Link>
        </div>
        <h1>{course.title}</h1>
        <p className="course-instructor">בהנחיית {course.instructor}</p>
      </header>

      <div className="detail-body">
        <div className="detail-description">
          <h2>על הקורס</h2>
          <p>{course.description || 'תיאור הקורס יתפרסם בקרוב.'}</p>
        </div>

        <aside className="enroll-box">
          <dl className="course-facts">
            <div className="fact-wide"><dt>מועד</dt><dd>{course.schedule || 'יפורסם'}</dd></div>
            <div><dt>פתיחה</dt><dd>{formatDate(course.start_date)}</dd></div>
            <div><dt>מחיר</dt><dd>{formatPrice(course.price)}</dd></div>
            <div><dt>נקודות זכות</dt><dd>{course.credits}</dd></div>
          </dl>

          <SeatsMeter capacity={course.capacity} left={course.seats_left} />

          {notice && <p className="alert alert-ok" role="status">{notice}</p>}
          {error && <p className="alert alert-error" role="alert">{error}</p>}

          {!user && (
            <Link to="/login" state={{ from: `/courses/${course.id}` }} className="btn btn-sun btn-block">
              התחברות להרשמה
            </Link>
          )}
          {user && enrolled && (
            <button className="btn btn-ghost btn-block" disabled={busy} onClick={() => act('DELETE')}>
              {busy ? 'מבטל…' : 'ביטול ההרשמה'}
            </button>
          )}
          {user && !enrolled && (
            <button
              className="btn btn-sun btn-block"
              disabled={busy || course.seats_left === 0}
              onClick={() => act('POST')}
            >
              {course.seats_left === 0 ? 'הקורס מלא' : busy ? 'נרשם…' : 'הרשמה לקורס'}
            </button>
          )}
        </aside>
      </div>
    </article>
  )
}
