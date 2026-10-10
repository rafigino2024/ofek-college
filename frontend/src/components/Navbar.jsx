import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const close = () => setOpen(false)

  function handleLogout() {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand" onClick={close}>
        <svg className="brand-mark" viewBox="0 0 40 24" aria-hidden="true">
          <path d="M4 22a16 16 0 0 1 32 0" />
          <path d="M11 22a9 9 0 0 1 18 0" />
          <line x1="0" y1="22" x2="40" y2="22" />
        </svg>
        מכללת אופק
      </Link>

      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'סגירה' : 'תפריט'}
      </button>

      <nav id="main-nav" className={open ? 'nav-links open' : 'nav-links'}>
        <NavLink to="/courses" onClick={close}>קורסים</NavLink>
        {user ? (
          <>
            <NavLink to="/my-courses" onClick={close}>הקורסים שלי</NavLink>
            <span className="nav-user">שלום, {user.full_name.split(' ')[0]}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>התנתקות</button>
          </>
        ) : (
          <>
            <NavLink to="/login" onClick={close}>התחברות</NavLink>
            <Link to="/register" className="btn btn-sun btn-sm" onClick={close}>הרשמה</Link>
          </>
        )}
      </nav>
    </header>
  )
}
