import { Activity, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { HealthStatus, OpsHealthSummary } from './types'

interface HomeOpsHealthProps {
  summary: OpsHealthSummary
  onCardOpen: (cardId: string) => void
}

function StatusIcon({ status }: { status: HealthStatus }) {
  if (status === 'critical') return <AlertTriangle size={16} />
  if (status === 'attention') return <Activity size={16} />
  return <CheckCircle2 size={16} />
}

export default function HomeOpsHealth({ summary, onCardOpen }: HomeOpsHealthProps): React.JSX.Element {
  return (
    <aside className="home-v2-ops" aria-labelledby="home-ops-title">
      <div className="home-v2-ops__header">
        <h2 id="home-ops-title">Operations Health</h2>
        <span className={`home-v2-ops__overall home-v2-health--${summary.overallStatus}`}>
          {summary.overallStatus}
        </span>
      </div>

      <div className="home-v2-ops__cards">
        {summary.cards.map((card) => (
          <article key={card.id} className={`home-v2-ops-card home-v2-health--${card.status}`}>
            <div className="home-v2-ops-card__title-row">
              <div className="home-v2-ops-card__status-icon" aria-hidden>
                <StatusIcon status={card.status} />
              </div>
              <h3>{card.title}</h3>
            </div>
            <p className="home-v2-ops-card__summary">{card.summary}</p>
            <p className="home-v2-ops-card__detail">{card.detail}</p>

            {card.actionLabel && card.actionPath ? (
              <Link
                className="home-v2-ops-card__link"
                to={card.actionPath}
                onClick={() => onCardOpen(card.id)}
              >
                <span>{card.actionLabel}</span>
                <ExternalLink size={14} />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </aside>
  )
}
