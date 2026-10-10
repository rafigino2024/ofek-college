import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDate, formatPrice } from '../api'
import { useAuth } from '../auth'

export default function MyCourses() {
  const { user, refreshEnrollments } = useAuth()
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    refreshEnrollments().then(setList).catch((e) => setError(e.message))
  }, [refreshEnrollments])

  async function cancel(courseId) {
    setCancelling(courseId)
    setError('')
    try {
      await api(`/courses/${courseId}/enroll`, { method: 'DELETE' })
      setList(await refreshEnrollments())
    } catch (e) {
      setError(e.message)
    } finally {
      setCancelling(null)
    }
  }

  const total = list?.reduce((sum, e) => sum + e.course.price, 0) ?? 0
  const credits = list?.reduce((sum, e) => sum + e.course.credits, 0) ?? 0

  return (
    <section className="container section">
      <h1>הקורסים שלי</h1>
      <p className="lead-sm">
        {user.full_name}, {user.email}
      </p>

      {error && <p className="alert alert-error">{error}</p>}
      {!list && !error && <p className="page-status">טוען…</p>}

      {list && list.length === 0 && (
        <div className="empty">
          <p>עוד לא נרשמת לאף קורס.</p>
          <Link to="/courses" className="btn btn-sun">לקטלוג הקורסים</Link>
        </div>
      )}

      {list && list.length > 0 && (
        <>
          <p className="summary">
            {list.length} קורסים, {credits} נקודות זכות, סך הכל {formatPrice(total)}
          </p>
          <ul className="my-list">
            {list.map(({ id, course }) => (
              <li key={id} style={{ '--dept': course.department.color }}>
                <div>
                  <Link to={`/courses/${course.id}`} className="my-title">{course.title}</Link>
                  <p className="my-meta">
                    {course.department.name}. נפתח ב-{formatDate(course.start_date)}, {course.schedule}
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={cancelling === course.id}
                  onClick={() => cancel(course.id)}
                >
                  {cancelling === course.id ? 'מבטל…' : 'ביטול ההרשמה'}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
