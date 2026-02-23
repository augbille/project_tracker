import ProjectCard from './ProjectCard'
import './ActivityFeed.css'

export default function ActivityFeed({ feed, loading, currentUserId }) {
  if (loading) {
    return (
      <div className="feed feed--loading">
        <div className="feed__loader" />
        <p className="feed__loading-text">Loading activity…</p>
      </div>
    )
  }

  if (!feed || feed.length === 0) {
    return (
      <div className="feed feed--empty">
        <div className="feed__empty-icon">📂</div>
        <h3 className="feed__empty-title">No activity yet</h3>
        <p className="feed__empty-text">
          Join a team and share your first project. Your teammates' projects will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="feed">
      <div className="feed__list">
        {feed.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            authorName={project.authorName}
            isOwn={project.user_id === currentUserId}
          />
        ))}
      </div>
    </div>
  )
}
