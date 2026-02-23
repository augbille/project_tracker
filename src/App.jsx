import { useState, useCallback } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useProjects } from './hooks/useProjects'
import { useFeed } from './hooks/useFeed'
import { useTeams } from './hooks/useTeams'
import ActivityFeed from './components/ActivityFeed'
import ProjectCard from './components/ProjectCard'
import AddProjectModal from './components/AddProjectModal'
import TeamPanel from './TeamPanel'
import Auth from './Auth'
import { supabase } from './lib/supabase'
import './App.css'

const TABS = [
  { id: 'feed', label: 'Feed', icon: '📋' },
  { id: 'projects', label: 'My Projects', icon: '📁' },
  { id: 'team', label: 'Team', icon: '👥' },
]

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { projects, loading: projectsLoading, addProject, updateProject, deleteProject } = useProjects(user)
  const { feed, loading: feedLoading } = useFeed(user)
  const { teams, teammates, createTeam, joinTeam } = useTeams(user)
  const [activeTab, setActiveTab] = useState('feed')
  const [showAddProject, setShowAddProject] = useState(false)
  const [signOutLoading, setSignOutLoading] = useState(false)

  const handleSignOut = useCallback(async () => {
    if (signOutLoading) return
    setSignOutLoading(true)
    try {
      await signOut()
    } finally {
      setSignOutLoading(false)
    }
  }, [signOut, signOutLoading])

  if (authLoading) {
    return (
      <div className="app app--loading">
        <div className="app__loader" />
        <p className="app__loading-text">Loading…</p>
      </div>
    )
  }

  if (supabase && !user) {
    return <Auth />
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <div className="header__brand">
            <span className="header__logo">◆</span>
            <div>
              <h1 className="header__title">Project Share</h1>
              <p className="header__subtitle">Share projects with your team</p>
            </div>
          </div>
          <div className="header__user">
            <span className="header__name">{profile?.display_name || user?.email}</span>
            <button
              type="button"
              className="header__logout"
              onClick={handleSignOut}
              disabled={signOutLoading}
            >
              {signOutLoading ? '…' : 'Sign out'}
            </button>
          </div>
        </div>

        <nav className="nav">
          <div className="nav__inner">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`nav__tab ${activeTab === tab.id ? 'nav__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav__tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              className="nav__add"
              onClick={() => setShowAddProject(true)}
              title="Share a project"
            >
              + Share project
            </button>
          </div>
        </nav>
      </header>

      <main className="main">
        <div className="main__inner">
          {activeTab === 'feed' && (
            <ActivityFeed
              feed={feed}
              loading={feedLoading}
              currentUserId={user?.id}
            />
          )}
          {activeTab === 'projects' && (
            <div className="projects-view">
              {projectsLoading ? (
                <div className="projects-view__loading">Loading your projects…</div>
              ) : projects.length === 0 ? (
                <div className="projects-view__empty">
                  <p>No projects yet. Share your first one!</p>
                  <button
                    type="button"
                    className="projects-view__cta"
                    onClick={() => setShowAddProject(true)}
                  >
                    + Share project
                  </button>
                </div>
              ) : (
                <div className="projects-view__list">
                  {projects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      authorName={profile?.display_name || 'You'}
                      isOwn
                      onUpdate={(updates) => updateProject(p.id, updates)}
                      onDelete={() => deleteProject(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'team' && (
            <TeamPanel
              teams={teams}
              teammates={teammates}
              onCreateTeam={createTeam}
              onJoinTeam={joinTeam}
            />
          )}
        </div>
      </main>

      {showAddProject && (
        <AddProjectModal
          teams={teams}
          onAdd={addProject}
          onClose={() => setShowAddProject(false)}
        />
      )}
    </div>
  )
}
