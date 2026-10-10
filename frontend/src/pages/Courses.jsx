import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import CourseCard from '../components/CourseCard'

export default function Courses() {
  const { enrolledIds } = useAuth()
  const [params, setParams] = useSearchParams()
  const department = params.get('department') || ''
  const q = params.get('q') || ''

  const [search, setSearch] = useState(q)
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/departments').then(setDepartments).catch(() => {})
  }, [])

  // החיפוש מתעדכן ב-URL חצי שנייה אחרי שמפסיקים להקליד
  useEffect(() => {
    const t = setTimeout(() => {
      if (search === q) return
      const next = new URLSearchParams(params)
      if (search) next.set('q', search)
      else next.delete('q')
      setParams(next, { replace: true })
    }, 400)
    return () => clearTimeout(t)
  }, [search, q, params, setParams])

  useEffect(() => {
    setError('')
    api('/courses', { params: { department, q } })
      .then(setCourses)
      .catch((e) => setError(e.message))
  }, [department, q])

  function pickDepartment(slug) {
    const next = new URLSearchParams(params)
    if (slug) next.set('department', slug)
    else next.delete('department')
    setParams(next)
  }

  return (
    <section className="container section">
      <h1>קטלוג הקורסים</h1>

      <div className="filters">
        <label className="search">
          <span className="sr-only">חיפוש קורס</span>
          <input
            type="search"
            placeholder="חיפוש לפי שם קורס, קוד או מרצה"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="chips" role="group" aria-label="סינון לפי מחלקה">
          <button
            className={!department ? 'chip active' : 'chip'}
            aria-pressed={!department}
            onClick={() => pickDepartment('')}
          >
            הכל
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              className={department === d.slug ? 'chip active' : 'chip'}
              aria-pressed={department === d.slug}
              style={{ '--dept': d.color }}
              onClick={() => pickDepartment(d.slug)}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {!courses && !error && <p className="page-status">טוען קורסים…</p>}

      {courses && courses.length === 0 && (
        <div className="empty">
          <p>לא מצאנו קורסים שמתאימים לחיפוש.</p>
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setParams({}) }}>
            ניקוי הסינון
          </button>
        </div>
      )}

      {courses && courses.length > 0 && (
        <>
          <p className="result-count">{courses.length} קורסים</p>
          <div className="course-grid">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} enrolled={enrolledIds.has(c.id)} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
