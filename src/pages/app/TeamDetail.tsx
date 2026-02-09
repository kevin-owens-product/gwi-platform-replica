import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, Settings, LayoutDashboard, Shield, Check,
} from 'lucide-react'
import { useTeam } from '@/hooks/useTeams'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import { Button, Tabs, Badge } from '@/components/shared'
import TeamMembers from '@/components/teams/TeamMembers'
import TeamSettingsPanel from '@/components/teams/TeamSettingsPanel'
import WorkspaceSettings from '@/components/workspace/WorkspaceSettings'
import GuardrailsEditor from '@/components/workspace/GuardrailsEditor'
import ApprovalQueue from '@/components/workspace/ApprovalQueue'
import './TeamDetail.css'

const teamTabs = [
  { id: 'members', label: 'Members', icon: <Users size={16} /> },
  { id: 'workspace', label: 'Workspace', icon: <LayoutDashboard size={16} /> },
  { id: 'guardrails', label: 'Guardrails', icon: <Shield size={16} /> },
  { id: 'approvals', label: 'Approvals', icon: <Check size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
]

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('members')

  const { data: team, isLoading } = useTeam(id || '')
  const user = useAuthStore((s) => s.user)
  const { activeTeamId, setActiveTeamId } = useWorkspaceStore()

  if (isLoading) {
    return (
      <div className="team-detail">
        <div className="team-detail__loading">Loading team...</div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="team-detail">
        <div className="team-detail__not-found">
          <h2>Team not found</h2>
          <Button variant="secondary" onClick={() => navigate('/app/teams')}>
            Back to Teams
          </Button>
        </div>
      </div>
    )
  }

  // For mock purposes, assume current user is team admin if they're org admin
  const isTeamAdmin = user?.role === 'admin' || user?.role === 'manager'
  const isActive = activeTeamId === team.id

  return (
    <div className="team-detail">
      <div className="team-detail__top-bar">
        <button className="team-detail__back" onClick={() => navigate('/app/teams')}>
          <ArrowLeft size={18} />
          <span>Teams</span>
        </button>
      </div>

      <div className="team-detail__header">
        <div className="team-detail__title-row">
          <div
            className="team-detail__avatar"
            style={{ backgroundColor: team.avatar_color || '#6b7280' }}
          >
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div className="team-detail__info">
            <h1 className="team-detail__name">{team.name}</h1>
            {team.description && (
              <p className="team-detail__desc">{team.description}</p>
            )}
            <div className="team-detail__badges">
              <Badge variant="default">
                <Users size={12} style={{ marginRight: 4 }} />
                {team.member_count} members
              </Badge>
              {team.settings.auto_share_content && <Badge variant="info">Auto-share</Badge>}
              {isActive && <Badge variant="success">Active workspace</Badge>}
            </div>
          </div>
          <div className="team-detail__actions">
            <Button
              variant={isActive ? 'secondary' : 'primary'}
              onClick={() => setActiveTeamId(isActive ? null : team.id)}
            >
              {isActive ? 'Deactivate' : 'Set as Active'}
            </Button>
          </div>
        </div>
      </div>

      <div className="team-detail__tabs">
        <Tabs
          tabs={teamTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="team-detail__content">
        {activeTab === 'members' && (
          <TeamMembers
            teamId={team.id}
            teamName={team.name}
            isTeamAdmin={isTeamAdmin}
            allowMemberInvite={team.settings.allow_member_invite}
          />
        )}

        {activeTab === 'workspace' && (
          <WorkspaceSettings teamId={team.id} />
        )}

        {activeTab === 'guardrails' && (
          <GuardrailsEditor teamId={team.id} />
        )}

        {activeTab === 'approvals' && (
          <ApprovalQueue teamId={team.id} />
        )}

        {activeTab === 'settings' && isTeamAdmin && (
          <TeamSettingsPanel
            team={team}
            onDeleted={() => navigate('/app/teams')}
          />
        )}

        {activeTab === 'settings' && !isTeamAdmin && (
          <div style={{ padding: 24, color: '#64748b' }}>
            Only team admins can modify team settings.
          </div>
        )}
      </div>
    </div>
  )
}
