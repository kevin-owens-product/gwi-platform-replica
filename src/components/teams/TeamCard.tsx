import { Users, Settings, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/shared'
import type { Team } from '@/api/types'
import './TeamCard.css'

interface TeamCardProps {
  team: Team
  onClick: () => void
  isActive?: boolean
}

export default function TeamCard({ team, onClick, isActive }: TeamCardProps) {
  return (
    <button
      className={`team-card ${isActive ? 'team-card--active' : ''}`}
      onClick={onClick}
    >
      <div className="team-card__avatar" style={{ backgroundColor: team.avatar_color || '#6b7280' }}>
        {team.name.charAt(0).toUpperCase()}
      </div>

      <div className="team-card__body">
        <div className="team-card__header">
          <h3 className="team-card__name">{team.name}</h3>
          <ChevronRight size={16} className="team-card__arrow" />
        </div>

        {team.description && (
          <p className="team-card__desc">{team.description}</p>
        )}

        <div className="team-card__meta">
          <span className="team-card__members">
            <Users size={14} />
            {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
          </span>
          {team.settings.auto_share_content && (
            <Badge variant="info">Auto-share</Badge>
          )}
          {team.settings.allow_member_invite && (
            <Badge variant="default">Open invites</Badge>
          )}
        </div>
      </div>
    </button>
  )
}
