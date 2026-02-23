import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTeams(user) {
  const [teams, setTeams] = useState([])
  const [teammates, setTeammates] = useState([])
  const [loading, setLoading] = useState(!!user)

  const load = useCallback(async () => {
    if (!user || !supabase) return

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

    setTeammates(profiles || [])
  }, [user?.id])

  useEffect(() => {
    if (!user || !supabase) {
      setTeams([])
      setTeammates([])
      setLoading(false)
      return
    }
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [user?.id, load])

  const createTeam = useCallback(async (name) => {
    if (!user || !supabase) throw new Error('Not authenticated')
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert({ name: name.trim(), invite_code: code, created_by: user.id })
      .select('id')
      .single()
    if (teamErr) throw teamErr
    await supabase.from('team_members').insert([{ team_id: team.id, user_id: user.id }])
    await load()
    return { ...team, name: name.trim(), invite_code: code }
  }, [user?.id, load])

  const joinTeam = useCallback(async (code) => {
    if (!supabase) throw new Error('Not configured')
    const { error } = await supabase.rpc('join_team_by_code', { code: code.trim().toLowerCase() })
    if (error) throw error
    await load()
  }, [load])

  return { teams, teammates, loading, load, createTeam, joinTeam }
}
