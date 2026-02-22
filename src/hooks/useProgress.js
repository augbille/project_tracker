import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'ai10-workshop-progress'
const TOTAL_WEEKS = 10

export const defaultWeeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => ({
  id: i + 1,
  completed: false,
  notes: '',
  title: `Week ${i + 1}`,
  materials: [
    { label: 'Project link', url: '' },
    { label: 'Repo or demo', url: '' },
    { label: 'Notes / resources', url: '' },
  ],
}))

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed.length === TOTAL_WEEKS ? parsed : defaultWeeks
    }
  } catch (_) {}
  return defaultWeeks
}

function saveToStorage(weeks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks))
  } catch (_) {}
}

export function useProgress(user) {
  const [weeks, setWeeks] = useState(defaultWeeks)
  const [loading, setLoading] = useState(!!user)

  // Load: Supabase when logged in, else localStorage
  useEffect(() => {
    if (!user) {
      setWeeks(loadFromStorage())
      setLoading(false)
      return
    }
    if (!supabase) {
      setWeeks(loadFromStorage())
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setWeeks(loadFromStorage())
        setLoading(false)
      }
    }, 6000)

    supabase
      .from('user_progress')
      .select('progress')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data?.progress?.length) {
          const local = loadFromStorage()
          setWeeks(local)
          supabase.from('user_progress').upsert(
            { user_id: user.id, progress: local, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          ).then(() => {})
        } else {
          const p = data.progress
          setWeeks(p.length === TOTAL_WEEKS ? p : defaultWeeks)
        }
      })
      .catch(() => {
        if (!cancelled) setWeeks(loadFromStorage())
      })
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timeout)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [user?.id])

  const updateWeek = useCallback((id, updates) => {
    setWeeks((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
      if (user && supabase) {
        supabase
          .from('user_progress')
          .upsert(
            { user_id: user.id, progress: next, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
          .then(() => {})
      } else {
        saveToStorage(next)
      }
      return next
    })
  }, [user?.id])

  return { weeks, setWeeks, updateWeek, loading, TOTAL_WEEKS }
}
