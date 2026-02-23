import { useState } from 'react'
import './TeamPanel.css'

export default function TeamPanel({ teams, teammates = [], onCreateTeam, onJoinTeam, onRefresh }) {
  const [createName, setCreateName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [createMessage, setCreateMessage] = useState({ type: '', text: '' })
  const [joinMessage, setJoinMessage] = useState({ type: '', text: '' })

  async function handleCreateTeam(e) {
    e.preventDefault()
    if (!createName.trim() || !onCreateTeam) return
    setCreateLoading(true)
    setCreateMessage({ type: '', text: '' })
    try {
      await onCreateTeam(createName.trim())
      setCreateName('')
      setCreateMessage({ type: 'success', text: 'Team created. Share the invite code with teammates.' })
    } catch (err) {
      setCreateMessage({ type: 'error', text: err.message || 'Could not create team' })
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleJoinTeam(e) {
    e.preventDefault()
    if (!inviteCode.trim() || !onJoinTeam) return
    setJoinLoading(true)
    setJoinMessage({ type: '', text: '' })
    try {
      await onJoinTeam(inviteCode.trim())
      setInviteCode('')
      setJoinMessage({ type: 'success', text: "You've joined the team." })
    } catch (err) {
      setJoinMessage({ type: 'error', text: err.message || 'Invalid code' })
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <div className="team-panel">
      <div className="team-panel__section">
        <h3 className="team-panel__heading">Create a team</h3>
        <form onSubmit={handleCreateTeam} className="team-panel__form">
          <input
            type="text"
            className="team-panel__input"
            placeholder="Team name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <button type="submit" className="team-panel__btn" disabled={createLoading}>
            {createLoading ? 'Creating…' : 'Create'}
          </button>
        </form>
        {createMessage.text && (
          <p className={`team-panel__message team-panel__message--${createMessage.type}`}>
            {createMessage.text}
          </p>
        )}
      </div>

      <div className="team-panel__section">
        <h3 className="team-panel__heading">Join with invite code</h3>
        <form onSubmit={handleJoinTeam} className="team-panel__form">
          <input
            type="text"
            className="team-panel__input"
            placeholder="Enter code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <button type="submit" className="team-panel__btn" disabled={joinLoading}>
            {joinLoading ? 'Joining…' : 'Join'}
          </button>
        </form>
        {joinMessage.text && (
          <p className={`team-panel__message team-panel__message--${joinMessage.type}`}>
            {joinMessage.text}
          </p>
        )}
      </div>

      {teams.length > 0 && (
        <div className="team-panel__section">
          <h3 className="team-panel__heading">Your teams</h3>
          <ul className="team-panel__team-list">
            {teams.map((t) => (
              <li key={t.id} className="team-panel__team">
                <span className="team-panel__team-name">{t.name}</span>
                <code className="team-panel__team-code">{t.invite_code}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {teammates.length > 0 && (
        <div className="team-panel__section">
          <h3 className="team-panel__heading">Teammates</h3>
          <ul className="team-panel__teammates">
            {teammates.map((tm) => (
              <li key={tm.id} className="team-panel__teammate">
                <div className="team-panel__teammate-avatar">
                  {tm.display_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="team-panel__teammate-name">{tm.display_name || 'Teammate'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
