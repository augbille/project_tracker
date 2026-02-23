import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const mountRef = useRef(true)

  useEffect(() => {
    mountRef.current = true
    return () => {
      mountRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false
    const timeout = setTimeout(() => {
      if (cancelled) return
      setLoading(false)
    }, 4000)

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return
        setUser(session?.user ?? null)
        setLoading(false)
        clearTimeout(timeout)
        if (session?.user) {
          fetchProfile(session.user.id).catch(() => {})
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
          clearTimeout(timeout)
        }
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountRef.current) return
        setUser(session?.user ?? null)
        if (session?.user) {
          const uid = session.user.id
          const p = await fetchProfileData(uid)
          if (mountRef.current) setProfile(p)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      cancelled = true
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfileData(userId) {
    if (!supabase) return null
    let { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()
    if (!data) {
      const { error } = await supabase.rpc('ensure_my_profile')
      if (!error) {
        const res = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', userId)
          .single()
        data = res.data
      }
    }
    return data ?? null
  }

  function fetchProfile(userId) {
    fetchProfileData(userId).then((p) => {
      if (mountRef.current) setProfile(p)
    }).catch(() => {})
  }

  const signOut = useCallback(async () => {
    setUser(null)
    setProfile(null)
    if (supabase) {
      await supabase.auth.signOut({ scope: 'local' })
    }
  }, [])

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    supabase,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
