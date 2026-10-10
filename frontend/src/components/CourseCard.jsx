import { Link } from 'react-router-dom'
import { formatDate, formatPrice } from '../api'
import SeatsMeter from './SeatsMeter'

export default function CourseCard({ course, enrolled }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="course-card"
      style={{ '--dept': course.department.color }}
    >
      <div className="course-card-top">
        <span className="course-code">{course.code}</span>
        <span className="dept-name">{course.department.name}</span>
      </div>
      <h3>{course.title}</h3>
      <p className="course-instructor">{course.instructor}</p>
      <dl className="course-facts">
        <div><dt>פתיחה</dt><dd>{formatDate(course.start_date)}</dd></div>
        <div><dt>מחיר</dt><dd>{formatPrice(course.price)}</dd></div>
      </dl>
      {enrolled ? (
        <p className="enrolled-badge">את/ה רשום/ה לקורס</p>
      ) : (
        <SeatsMeter capacity={course.capacity} left={course.seats_left} />
      )}
    </Link>
  )
}
