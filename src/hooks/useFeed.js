import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFeed(user) {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(!!user)

  useEffect(() => {
    if (!user || !supabase) {
      setFeed([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function load() {
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)

      const teamIds = (memberships || []).map((m) => m.team_id).filter(Boolean)
      if (teamIds.length === 0 || cancelled) {
        setFeed([])
        setLoading(false)
        return
      }

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .in('team_id', teamIds)
        .order('created_at', { ascending: false })
        .limit(50)

      if (cancelled) return
      if (error) {
        setFeed([])
        setLoading(false)
        return
      }

      const userIds = [...new Set((projects || []).map((p) => p.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds)

      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p.display_name || 'Teammate']))

      const feedWithProfiles = (projects || []).map((p) => ({
        ...p,
        authorName: profileMap[p.user_id] || 'Teammate',
      }))

      if (!cancelled) setFeed(feedWithProfiles)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [user?.id])

  return { feed, loading }
}
