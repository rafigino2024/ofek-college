export default function SeatsMeter({ capacity, left }) {
  const taken = capacity - left
  const pct = Math.round((taken / capacity) * 100)
  const label =
    left === 0 ? 'הקורס מלא' : left <= 5 ? `נשארו רק ${left} מקומות` : `${left} מקומות פנויים`

  return (
    <div className={`seats ${left === 0 ? 'full' : left <= 5 ? 'low' : ''}`}>
      <div
        className="seats-bar"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={taken}
        aria-label="תפוסת הקורס"
      >
        <span style={{ width: `${pct}%` }} />
      </div>
      <span className="seats-label">{label}</span>
    </div>
  )
}
