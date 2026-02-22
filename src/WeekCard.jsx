import { useState } from 'react'
import './WeekCard.css'

export default function WeekCard({ week, onUpdate }) {
  const [expanded, setExpanded] = useState(false)

  const handleComplete = (e) => {
    onUpdate({ completed: e.target.checked })
  }

  const handleNotes = (e) => {
    onUpdate({ notes: e.target.value })
  }

  const handleMaterial = (index, url) => {
    const materials = [...week.materials]
    materials[index] = { ...materials[index], url }
    onUpdate({ materials })
  }

  return (
    <article
      className={`week-card ${week.completed ? 'week-card--completed' : ''} ${expanded ? 'week-card--expanded' : ''}`}
    >
      <div className="week-card__header" onClick={() => setExpanded(!expanded)}>
        <label className="week-card__checkbox-wrap" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={week.completed}
            onChange={handleComplete}
            className="week-card__checkbox"
            aria-label={`Mark week ${week.id} complete`}
          />
          <span className="week-card__check" aria-hidden />
        </label>
        <div className="week-card__title-wrap">
          <h2 className="week-card__title">{week.title}</h2>
          <span className="week-card__badge">Week {week.id}</span>
        </div>
        <span className="week-card__expand" aria-hidden>
          {expanded ? '−' : '+'}
        </span>
      </div>

      <div className="week-card__body">
        <div className="week-card__section">
          <label className="week-card__label">Notes</label>
          <textarea
            className="week-card__notes"
            placeholder="Reflections, takeaways, ideas…"
            value={week.notes}
            onChange={handleNotes}
            rows={3}
          />
        </div>

        <div className="week-card__section">
          <label className="week-card__label">Links & materials (portfolio)</label>
          <ul className="week-card__materials">
            {week.materials.map((m, i) => {
              const isUrl = /^https?:\/\//i.test((m.url || '').trim())
              return (
                <li key={i} className="week-card__material">
                  <input
                    type="text"
                    className="week-card__material-input"
                    placeholder={m.label}
                    value={m.url}
                    onChange={(e) => handleMaterial(i, e.target.value)}
                  />
                  {isUrl && (
                    <a
                      href={m.url.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="week-card__material-link"
                    >
                      Open →
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </article>
  )
}
