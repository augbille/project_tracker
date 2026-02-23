import { useState } from 'react'
import { supabase } from './lib/supabase'
import './Auth.css'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)
    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase is not configured.' })
      setLoading(false)
      return
    }
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName || undefined } },
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Check your email to confirm your account.' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong.' })
    }
    setLoading(false)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__logo">◆</span>
          <h1 className="auth__title">Project Share</h1>
          <p className="auth__subtitle">Sign in or create an account to share projects with your team.</p>
        </div>

        <div className="auth__tabs">
          <button
            type="button"
            className={`auth__tab ${mode === 'signin' ? 'auth__tab--active' : ''}`}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth__tab ${mode === 'signup' ? 'auth__tab--active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form className="auth__form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="auth__label">
              Display name
              <input
                type="text"
                className="auth__input"
                placeholder="How teammates see you"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label className="auth__label">
            Email
            <input
              type="email"
              className="auth__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="auth__label">
            Password
            <input
              type="password"
              className="auth__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>
          {message.text && (
            <p className={`auth__message auth__message--${message.type}`}>{message.text}</p>
          )}
          <button type="submit" className="auth__submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
