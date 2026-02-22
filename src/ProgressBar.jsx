import './ProgressBar.css'

export default function ProgressBar({ value, max, completed, total }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="progress">
      <div className="progress__text">
        <span className="progress__count">
          {completed} / {total} weeks
        </span>
        <span className="progress__pct">{Math.round(pct)}%</span>
      </div>
      <div className="progress__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
