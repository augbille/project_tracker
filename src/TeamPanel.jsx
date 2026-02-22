import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import ProgressBar from './ProgressBar'
import './TeamPanel.css'

function generateInviteCode() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

const TOTAL_WEEKS = 10

export default function TeamPanel() {
  const { user, supabase } = useAuth()
  const [teams, setTeams] = useState([])
  const [teammates, setTeammates] = useState([]) // { id, display_name, completedCount }
  const [inviteCode, setInviteCode] = useState('')
  const [joinMessage, setJoinMessage] = useState({ type: '', text: '' })
  const [createName, setCreateName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!user || !supabase) return

    async function load() {
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name, invite_code)')
        .eq('user_id', user.id)

      const teamList = (memberships || [])
        .map((m) => m.teams)
        .filter(Boolean)
        .reduce((acc, t) => (t && !acc.find((x) => x.id === t.id) ? [...acc, t] : acc), [])

      setTeams(teamList)

      if (teamList.length === 0) {
        setTeammates([])
        return
      }

      const teamIds = teamList.map((t) => t.id)
      const { data: allMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .in('team_id', teamIds)

      const userIds = [...new Set((allMembers || []).map((m) => m.user_id).filter((id) => id !== user.id))]
      if (userIds.length === 0) {
        setTeammates([])
        return
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds)

      const { data: progressRows } = await supabase
        .from('user_progress')
        .select('user_id, progress')
        .in('user_id', userIds)

      const progressMap = {}
      (progressRows || []).forEach((r) => {
        const completed = Array.isArray(r.progress) ? r.progress.filter((w) => w.completed).length : 0
        progressMap[r.user_id] = completed
      })

      setTeammates(
        (profiles || []).map((p) => ({
          id: p.id,
          display_name: p.display_name || 'Teammate',
          completedCount: progressMap[p.id] ?? 0,
        }))
      )
    }

    load()
  }, [user?.id, supabase])

  async function handleCreateTeam(e) {
    e.preventDefault()
    if (!createName.trim() || !supabase || !user) return
    setCreateLoading(true)
    const code = generateInviteCode()
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert({ name: createName.trim(), invite_code: code, created_by: user.id })
      .select('id')
      .single()

    if (teamErr) {
      setCreateLoading(false)
      return
    }
    await supabase.from('team_members').insert([{ team_id: team.id, user_id: user.id }])
    setTeams((prev) => [...prev, { id: team.id, name: createName.trim(), invite_code: code }])
    setCreateName('')
    setCreateLoading(false)
    setExpanded(true)
  }

  async function handleJoinTeam(e) {
    e.preventDefault()
    const code = inviteCode.trim()
    if (!code || !supabase) return
    setJoinLoading(true)
    setJoinMessage({ type: '', text: '' })
    const { data, error } = await supabase.rpc('join_team_by_code', { code })
    if (error) {
      setJoinMessage({ type: 'error', text: error.message || 'Invalid code' })
      setJoinLoading(false)
      return
    }
    setJoinMessage({ type: 'success', text: "You've joined the team." })
    setInviteCode('')
    setJoinLoading(false)
    if (data) {
      const { data: team } = await supabase
        .from('teams')
        .select('id, name, invite_code')
        .eq('id', data)
        .single()
      if (team) setTeams((prev) => (prev.some((t) => t.id === team.id) ? prev : [...prev, team]))
    }
  }

  return (
    <section className="team-panel">
      <button
        type="button"
        className="team-panel__toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="team-panel__toggle-title">Team progress</span>
        <span className="team-panel__toggle-badge">{teammates.length > 0 ? teammates.length : ''}</span>
        <span className="team-panel__toggle-icon">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="team-panel__body">
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
                    <span className="team-panel__teammate-name">{tm.display_name}</span>
                    <div className="team-panel__teammate-progress">
                      <ProgressBar
                        value={Math.round((tm.completedCount / TOTAL_WEEKS) * 100)}
                        max={100}
                        completed={tm.completedCount}
                        total={TOTAL_WEEKS}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
