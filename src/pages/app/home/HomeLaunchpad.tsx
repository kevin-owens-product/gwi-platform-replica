import {
  BarChart2,
  FileText,
  Grid3X3,
  LayoutDashboard,
  Microscope,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LaunchpadAction } from './types'

interface HomeLaunchpadProps {
  actions: LaunchpadAction[]
  onActionClick: (action: LaunchpadAction) => void
}

function ActionIcon({ icon }: { icon: LaunchpadAction['icon'] }) {
  switch (icon) {
    case 'spark':
      return <Sparkles size={16} />
    case 'charts':
      return <BarChart2 size={16} />
    case 'crosstabs':
      return <Grid3X3 size={16} />
    case 'dashboards':
      return <LayoutDashboard size={16} />
    case 'audiences':
      return <Users size={16} />
    case 'reports':
      return <FileText size={16} />
    case 'canvas':
      return <Microscope size={16} />
    default:
      return <Sparkles size={16} />
  }
}

export default function HomeLaunchpad({ actions, onActionClick }: HomeLaunchpadProps): React.JSX.Element {
  return (
    <section className="home-v2-launchpad" aria-labelledby="home-launchpad-title">
      <div className="home-v2-section-header">
        <h2 id="home-launchpad-title">Launchpad</h2>
        <p>High-utility entry points for analysis, orchestration, and delivery.</p>
      </div>

      <div className="home-v2-launchpad-grid" role="list" aria-label="Quick actions">
        {actions.map((action) => {
          if (action.disabledReason) {
            return (
              <button
                key={action.id}
                type="button"
                className="home-v2-launchpad-card is-disabled"
                disabled
                aria-label={`${action.label}. ${action.disabledReason}`}
              >
                <span className="home-v2-launchpad-card__icon"><ActionIcon icon={action.icon} /></span>
                <span className="home-v2-launchpad-card__title">{action.label}</span>
                <span className="home-v2-launchpad-card__desc">{action.disabledReason}</span>
              </button>
            )
          }

          return (
            <Link
              key={action.id}
              to={action.path}
              className="home-v2-launchpad-card"
              onClick={() => onActionClick(action)}
            >
              <span className="home-v2-launchpad-card__icon"><ActionIcon icon={action.icon} /></span>
              <span className="home-v2-launchpad-card__title">{action.label}</span>
              <span className="home-v2-launchpad-card__desc">{action.description}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
