import { useState } from 'react'
import './ProjectCard.css'

export default function ProjectCard({ project, authorName, onUpdate, onDelete, isOwn }) {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return d.toLocaleDateString()
  }

  return (
    <article className={`project-card project-card--${project.status}`}>
      <div className="project-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="project-card__avatar">
          {authorName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="project-card__meta">
          <h3 className="project-card__name">{project.name}</h3>
          <div className="project-card__info">
            <span className="project-card__author">{authorName}</span>
            <span className="project-card__dot">·</span>
            <span className="project-card__time">{formatDate(project.created_at)}</span>
            {project.team_id && (
              <>
                <span className="project-card__dot">·</span>
                <span className="project-card__shared">Shared</span>
              </>
            )}
          </div>
        </div>
        <span className="project-card__status-badge">{project.status}</span>
        <span className="project-card__expand">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <div className="project-card__body">
          {project.description && (
            <p className="project-card__description">{project.description}</p>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link"
            >
              Open project →
            </a>
          )}
          {isOwn && (
            <div className="project-card__actions">
              <button
                type="button"
                className="project-card__btn project-card__btn--danger"
                onClick={(e) => { e.stopPropagation(); onDelete?.(project.id) }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
