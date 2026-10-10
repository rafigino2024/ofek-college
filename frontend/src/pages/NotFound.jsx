import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="container section empty">
      <h1>הדף לא נמצא</h1>
      <p>ייתכן שהקישור שגוי או שהדף הוסר.</p>
      <Link to="/" className="btn btn-sun">לדף הבית</Link>
    </section>
  )
}
