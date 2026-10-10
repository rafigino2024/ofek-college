import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/my-courses'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>התחברות</h1>

        <label>
          מייל
          <input type="email" autoComplete="email" dir="ltr" required
                 value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          סיסמה
          <input type="password" autoComplete="current-password" dir="ltr" required
                 value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <button className="btn btn-sun btn-block" disabled={busy || !email || !password}>
          {busy ? 'מתחבר…' : 'התחברות'}
        </button>

        <p className="auth-switch">
          אין לך חשבון? <Link to="/register" state={location.state}>להרשמה</Link>
        </p>
      </form>
    </section>
  )
}
