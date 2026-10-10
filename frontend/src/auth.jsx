// מצב ההתחברות של כל האתר: מי המשתמש, ולאילו קורסים הוא רשום.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, tokenStore } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [enrolledIds, setEnrolledIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const refreshEnrollments = useCallback(async () => {
    const list = await api('/me/enrollments')
    setEnrolledIds(new Set(list.map((e) => e.course.id)))
    return list
  }, [])

  const loadUser = useCallback(async () => {
    if (!tokenStore.get()) {
      setLoading(false)
      return
    }
    try {
      setUser(await api('/auth/me'))
      await refreshEnrollments()
    } catch {
      tokenStore.clear() // טוקן פג תוקף
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [refreshEnrollments])

  useEffect(() => { loadUser() }, [loadUser])

  async function login(email, password) {
    const { access_token } = await api('/auth/login', {
      method: 'POST',
      form: { username: email, password },
    })
    tokenStore.set(access_token)
    setUser(await api('/auth/me'))
    await refreshEnrollments()
  }

  async function register(data) {
    await api('/auth/register', { method: 'POST', body: data })
    await login(data.email, data.password)
  }

  function logout() {
    tokenStore.clear()
    setUser(null)
    setEnrolledIds(new Set())
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, enrolledIds, login, register, logout, refreshEnrollments }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
