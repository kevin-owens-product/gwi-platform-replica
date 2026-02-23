import { BarChart2, FileText, Grid3X3, LayoutDashboard, MessageSquareText, RefreshCw, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRelativeDate } from '@/utils/format'
import type { HomePanel, WorkspaceArtifact } from './types'

interface HomeRecentWorkProps {
  panel: HomePanel<WorkspaceArtifact>
  onRetry: () => void
}

function ArtifactIcon({ type }: { type: WorkspaceArtifact['type'] }) {
  switch (type) {
    case 'chart':
      return <BarChart2 size={14} />
    case 'crosstab':
      return <Grid3X3 size={14} />
    case 'dashboard':
      return <LayoutDashboard size={14} />
    case 'audience':
      return <Users size={14} />
    case 'report':
      return <FileText size={14} />
    case 'conversation':
      return <MessageSquareText size={14} />
    case 'agent_run':
      return <Sparkles size={14} />
    default:
      return <Sparkles size={14} />
  }
}

export default function HomeRecentWork({ panel, onRetry }: HomeRecentWorkProps): React.JSX.Element {
  return (
    <section className="home-v2-panel" aria-labelledby="home-recent-work-title">
      <div className="home-v2-section-header">
        <h2 id="home-recent-work-title">Recent Work</h2>
        <p>Latest assets and execution artifacts across your workspace.</p>
      </div>

      {panel.state === 'loading' ? (
        <div className="home-v2-list-skeleton" aria-label="Loading recent work">
          <div className="home-v2-skeleton-row" />
          <div className="home-v2-skeleton-row" />
          <div className="home-v2-skeleton-row" />
        </div>
      ) : null}

      {panel.state === 'error' ? (
        <div className="home-v2-fallback" role="alert">
          <h3>Recent work unavailable</h3>
          <p>{panel.errorMessage}</p>
          <div className="home-v2-fallback__actions">
            <button type="button" className="home-v2-secondary-btn" onClick={onRetry}>
              <RefreshCw size={14} />
              Retry
            </button>
            <Link to={panel.emptyCtaPath} className="home-v2-primary-link">
              {panel.emptyCtaLabel}
            </Link>
          </div>
        </div>
      ) : null}

      {panel.state === 'empty' ? (
        <div className="home-v2-fallback">
          <h3>{panel.emptyTitle}</h3>
          <p>{panel.emptyDescription}</p>
          <Link to={panel.emptyCtaPath} className="home-v2-primary-link">
            {panel.emptyCtaLabel}
          </Link>
        </div>
      ) : null}

      {panel.state === 'ready' ? (
        <div className="home-v2-list" role="list" aria-label="Recent work items">
          {panel.items.map((item) => (
            <Link key={item.id} to={item.path} className="home-v2-list-item">
              <span className="home-v2-list-item__icon">
                <ArtifactIcon type={item.type} />
              </span>
              <span className="home-v2-list-item__body">
                <span className="home-v2-list-item__title">{item.title}</span>
                <span className="home-v2-list-item__meta">
                  {item.subtitle} · {formatRelativeDate(item.updatedAt)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  )
}
