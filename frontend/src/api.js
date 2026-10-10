// שכבת תקשורת אחת מול השרת. כל הקומפוננטות עוברות דרכה.

const TOKEN_KEY = 'ofek_token'

export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* מצב פרטי */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* מצב פרטי */ }
  },
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// FastAPI מחזיר שגיאות ולידציה (422) כמערך. כאן הופכים אותן להודעה אחת בעברית.
function errorMessage(data, status) {
  if (!data) return status >= 500 ? 'השרת לא זמין כרגע. נסו שוב בעוד רגע.' : 'הבקשה נכשלה'
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((d) => {
        const field = d.loc?.[d.loc.length - 1]
        if (field === 'email') return 'כתובת המייל לא תקינה'
        if (field === 'password' && d.type === 'string_too_short') return 'הסיסמה צריכה להכיל לפחות 8 תווים'
        if (field === 'full_name') return 'יש להזין שם מלא'
        return String(d.msg).replace(/^Value error, /, '')
      })
      .join('\n')
  }
  return 'הבקשה נכשלה'
}

/**
 * api('/courses')
 * api('/courses/3/enroll', { method: 'POST' })
 * api('/auth/login', { method: 'POST', form: { username, password } })
 */
export async function api(path, { method = 'GET', body, form, params } = {}) {
  const headers = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    payload = new URLSearchParams(form)
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let url = `/api${path}`
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString()
    if (qs) url += `?${qs}`
  }

  let res
  try {
    res = await fetch(url, { method, headers, body: payload })
  } catch {
    throw new ApiError('אין חיבור לשרת. בדקו שהבקאנד רץ על פורט 8000.', 0)
  }

  if (res.status === 204) return null

  // אם חזר HTML במקום JSON, כנראה ששרת אחר רץ על פורט 8000
  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status)
  if (!isJson || data === null) {
    throw new ApiError(
      'השרת החזיר תשובה לא צפויה. ייתכן ששרת של פרויקט אחר רץ על פורט 8000.',
      res.status,
    )
  }
  return data
}

// ---------- עזרי תצוגה ----------

const dateFmt = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
const shortDateFmt = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' })
const priceFmt = new Intl.NumberFormat('he-IL', {
  style: 'currency', currency: 'ILS', maximumFractionDigits: 0,
})

// "2026-11-01" → תאריך מקומי, בלי הזזה של אזור זמן
function parseDay(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const formatDate = (iso) => dateFmt.format(parseDay(iso))
export const formatShortDate = (iso) => shortDateFmt.format(parseDay(iso))
export const formatPrice = (n) => priceFmt.format(n)
