import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import { useAuth } from './auth'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MyCourses from './pages/MyCourses'
import NotFound from './pages/NotFound'

// דפים שדורשים התחברות. אחרי ההתחברות חוזרים לדף המקורי.
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p className="page-status">טוען…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  // סוגריים מסולסלים חובה: useEffect מצפה לקבל בחזרה פונקציית ניקוי או כלום.
  // בדפדפנים חדשים scrollTo מחזיר Promise, ו-React מנסה להריץ אותו כפונקציה וקורס.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/my-courses"
            element={<RequireAuth><MyCourses /></RequireAuth>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>מכללת אופק היא מכללה דמיונית שנבנתה כפרויקט פורטפוליו.</p>
      </footer>
    </>
  )
}
