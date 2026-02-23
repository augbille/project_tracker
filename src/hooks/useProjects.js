import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects(user) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(!!user)

  useEffect(() => {
    if (!user || !supabase) {
      setProjects([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setProjects([])
        } else {
          setProjects(data || [])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [user?.id])

  const addProject = useCallback(async (project) => {
    if (!user || !supabase) return null
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        team_id: project.teamId || null,
        name: project.name,
        description: project.description || null,
        link: project.link || null,
        status: project.status || 'active',
      })
      .select()
      .single()
    if (error) throw error
    setProjects((prev) => [data, ...prev])
    return data
  }, [user?.id])

  const updateProject = useCallback(async (id, updates) => {
    if (!user || !supabase) return
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error
    setProjects((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }, [user?.id])

  const deleteProject = useCallback(async (id) => {
    if (!user || !supabase) return
    await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [user?.id])

  return { projects, loading, addProject, updateProject, deleteProject }
}
