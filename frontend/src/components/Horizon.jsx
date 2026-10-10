// הרגע הזכיר של האתר: אופק עם קשתות בצבעי המחלקות ושמש שעולה פעם אחת בטעינה.
const ARCS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function Horizon() {
  return (
    <svg className="horizon" viewBox="0 0 600 300" aria-hidden="true">
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#FFB547" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFB547" stopOpacity="0" />
        </radialGradient>
        <clipPath id="above-line">
          <rect x="0" y="0" width="600" height="260" />
        </clipPath>
      </defs>

      <rect x="0" y="40" width="600" height="220" fill="url(#sun-glow)" />

      <g clipPath="url(#above-line)">
        <circle className="sun" cx="300" cy="260" r="70" fill="#FFB547" />
        {ARCS.map((color, i) => (
          <path
            key={color}
            className="arc"
            style={{ animationDelay: `${0.25 + i * 0.12}s` }}
            d={`M ${300 - (110 + i * 42)} 260 A ${110 + i * 42} ${110 + i * 42} 0 0 1 ${300 + 110 + i * 42} 260`}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
          />
        ))}
      </g>

      <line x1="0" y1="260" x2="600" y2="260" stroke="#F3F0FF" strokeOpacity="0.5" strokeWidth="2" />
    </svg>
  )
}
