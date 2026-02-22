import { useState, useCallback } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useProgress } from './hooks/useProgress'
import WeekCard from './WeekCard'
import ProgressBar from './ProgressBar'
import TeamPanel from './TeamPanel'
import Auth from './Auth'
import { supabase } from './lib/supabase'
import './App.css'

export default function App() {
  const { user, profile, loading: authLoading } = useAuth()
  const { weeks, updateWeek, loading: progressLoading, TOTAL_WEEKS } = useProgress(user)
  const [signOutLoading, setSignOutLoading] = useState(false)

  const handleSignOut = useCallback(async () => {
    if (!supabase || signOutLoading) return
    setSignOutLoading(true)
    try {
      await supabase.auth.signOut()
    } finally {
      setSignOutLoading(false)
    }
  }, [signOutLoading])

  const completedCount = weeks.filter((w) => w.completed).length
  const progress = Math.round((completedCount / TOTAL_WEEKS) * 100)

  if (authLoading) {
    return (
      <div className="app app--loading">
        <div className="loading-spinner">Loading…</div>
      </div>
    )
  }

  if (supabase && !user) {
    return <Auth />
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <h1 className="title">AI 10 Workshop</h1>
              <p className="subtitle">Progress & portfolio tracker</p>
            </div>
            {user && (
            <div className="header-user">
              <span className="header-user-name">{profile?.display_name || user.email}</span>
              <button
                type="button"
                className="header-logout"
                onClick={handleSignOut}
                disabled={signOutLoading}
                aria-busy={signOutLoading}
              >
                {signOutLoading ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
          </div>
          <ProgressBar
            value={progress}
            max={100}
            completed={completedCount}
            total={TOTAL_WEEKS}
          />
        </div>
      </header>

      <main className="main">
        {supabase && <TeamPanel />}
        {progressLoading ? (
          <div className="loading-spinner">Loading progress…</div>
        ) : (
          <div className="weeks-grid">
            {weeks.map((week) => (
              <WeekCard
                key={week.id}
                week={week}
                onUpdate={(updates) => updateWeek(week.id, updates)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <span>
          {supabase
            ? 'Progress is saved to your account and visible to your team.'
            : 'Progress is saved locally (Supabase not configured).'}
        </span>
      </footer>
    </div>
  )
}
