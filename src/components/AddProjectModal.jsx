import { useState } from 'react'
import './AddProjectModal.css'

export default function AddProjectModal({ teams, onAdd, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [teamId, setTeamId] = useState(teams[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onAdd({
        name: name.trim(),
        description: description.trim() || null,
        link: link.trim() || null,
        teamId: teamId || null,
        status: 'active',
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not add project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Share a project</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__label">
            Project name
            <input
              type="text"
              className="modal__input"
              placeholder="e.g. AI Dashboard v2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label className="modal__label">
            Description
            <textarea
              className="modal__textarea"
              placeholder="What's it about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <label className="modal__label">
            Link
            <input
              type="url"
              className="modal__input"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
          {teams.length > 0 && (
            <label className="modal__label">
              Share with team
              <select
                className="modal__select"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                <option value="">Don't share</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
          )}
          {error && <p className="modal__error">{error}</p>}
          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={loading}>
              {loading ? 'Sharing…' : 'Share project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
