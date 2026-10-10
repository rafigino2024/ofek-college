import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

const EMPTY = { full_name: '', email: '', phone: '', password: '', confirm: '' }

// אותם כללים כמו בשרת, כדי לתת משוב מיידי. השרת עדיין בודק בעצמו.
function validate(f) {
  const errors = {}
  if (f.full_name.trim().length < 2) errors.full_name = 'יש להזין שם מלא'
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = 'כתובת המייל לא תקינה'
  if (f.phone && !/^0\d{8,9}$/.test(f.phone.replace(/[\s-]/g, '')))
    errors.phone = 'מספר טלפון לא תקין, למשל 050-1234567'
  if (f.password.length < 8) errors.password = 'לפחות 8 תווים'
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
    errors.password = 'הסיסמה צריכה לכלול אות באנגלית וספרה'
  if (f.confirm !== f.password) errors.confirm = 'הסיסמאות לא תואמות'
  return errors
}

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/courses'

  const [form, setForm] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  const errors = validate(form)
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const blur = (field) => () => setTouched({ ...touched, [field]: true })
  const show = (field) => touched[field] && errors[field]

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ full_name: true, email: true, phone: true, password: true, confirm: true })
    if (Object.keys(errors).length) return
    setBusy(true)
    setServerError('')
    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
      })
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const field = (name, label, props = {}) => (
    <div className={show(name) ? 'field has-error' : 'field'}>
      <label htmlFor={`reg-${name}`}>{label}</label>
      <input
        id={`reg-${name}`}
        value={form[name]}
        onChange={set(name)}
        onBlur={blur(name)}
        aria-invalid={Boolean(show(name))}
        aria-describedby={show(name) ? `${name}-err` : undefined}
        {...props}
      />
      {show(name) && <span className="field-error" id={`${name}-err`}>{errors[name]}</span>}
    </div>
  )

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>פתיחת חשבון</h1>
        <p className="auth-sub">החשבון מאפשר להירשם לקורסים ולנהל אותם במקום אחד.</p>

        {field('full_name', 'שם מלא', { autoComplete: 'name' })}
        {field('email', 'מייל', { type: 'email', autoComplete: 'email', dir: 'ltr' })}
        {field('phone', 'טלפון (לא חובה)', { type: 'tel', autoComplete: 'tel', dir: 'ltr' })}
        {field('password', 'סיסמה', { type: 'password', autoComplete: 'new-password', dir: 'ltr' })}
        {field('confirm', 'אימות סיסמה', { type: 'password', autoComplete: 'new-password', dir: 'ltr' })}

        {serverError && <p className="alert alert-error" role="alert">{serverError}</p>}

        <button className="btn btn-sun btn-block" disabled={busy}>
          {busy ? 'פותח חשבון…' : 'פתיחת חשבון'}
        </button>

        <p className="auth-switch">
          כבר יש לך חשבון? <Link to="/login" state={location.state}>להתחברות</Link>
        </p>
      </form>
    </section>
  )
}
