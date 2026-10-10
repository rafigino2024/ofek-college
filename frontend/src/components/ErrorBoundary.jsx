// רשת ביטחון: אם קומפוננטה קורסת, מציגים הודעה במקום מסך ריק.
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('האתר קרס:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <section className="container section crash">
        <h1>משהו השתבש בדף הזה</h1>
        <p>טעינה מחדש בדרך כלל פותרת את זה. אם הבעיה חוזרת, פרטי השגיאה נמצאים למטה.</p>
        <button className="btn btn-sun" onClick={() => window.location.reload()}>
          טעינה מחדש
        </button>
        <pre dir="ltr">{String(this.state.error?.message || this.state.error)}</pre>
      </section>
    )
  }
}
