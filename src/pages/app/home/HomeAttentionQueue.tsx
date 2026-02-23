import { AlertTriangle, Bell, Info, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRelativeDate } from '@/utils/format'
import type { AttentionItem, HomePanel } from './types'

interface HomeAttentionQueueProps {
  panel: HomePanel<AttentionItem>
  onRetry: () => void
  onOpenItem: (item: AttentionItem) => void
}

function AttentionIcon({ severity }: { severity: AttentionItem['severity'] }) {
  if (severity === 'critical') return <AlertTriangle size={14} />
  if (severity === 'warning') return <Bell size={14} />
  return <Info size={14} />
}

export default function HomeAttentionQueue({ panel, onRetry, onOpenItem }: HomeAttentionQueueProps): React.JSX.Element {
  return (
    <section className="home-v2-panel" aria-labelledby="home-attention-title">
      <div className="home-v2-section-header">
        <h2 id="home-attention-title">Attention Queue</h2>
        <p>Operational alerts, validation gaps, and proactive insight signals.</p>
      </div>

      {panel.state === 'loading' ? (
        <div className="home-v2-list-skeleton" aria-label="Loading attention queue">
          <div className="home-v2-skeleton-row" />
          <div className="home-v2-skeleton-row" />
          <div className="home-v2-skeleton-row" />
        </div>
      ) : null}

      {panel.state === 'error' ? (
        <div className="home-v2-fallback" role="alert">
          <h3>Attention queue unavailable</h3>
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
        <div className="home-v2-list" role="list" aria-label="Attention queue items">
          {panel.items.map((item) => (
            <Link
              key={item.id}
              to={item.actionPath}
              className={`home-v2-list-item is-${item.severity}`}
              onClick={() => onOpenItem(item)}
            >
              <span className={`home-v2-list-item__icon is-${item.severity}`}>
                <AttentionIcon severity={item.severity} />
              </span>
              <span className="home-v2-list-item__body">
                <span className="home-v2-list-item__title">{item.title}</span>
                <span className="home-v2-list-item__meta">{item.description}</span>
                <span className="home-v2-list-item__time">{formatRelativeDate(item.createdAt)}</span>
              </span>
              <span className="home-v2-list-item__action">{item.actionLabel}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  )
}
