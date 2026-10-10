import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// כל קריאה ל-/api מועברת לשרת FastAPI, כך שאין צורך ב-CORS בפיתוח.
// 127.0.0.1 ולא localhost: ב-Windows Node עלול לפנות ל-IPv6 (::1) בזמן ש-uvicorn מאזין רק ב-IPv4.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
