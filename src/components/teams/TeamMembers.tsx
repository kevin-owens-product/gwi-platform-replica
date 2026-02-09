import { useState } from 'react'
import { MoreVertical, Shield, UserX, UserCheck, Trash2, Plus } from 'lucide-react'
import { useTeamMembers, useUpdateTeamMemberRole, useRemoveTeamMember } from '@/hooks/useTeams'
import { DataTable, Badge, Dropdown, Button } from '@/components/shared'
import type { Column } from '@/components/shared'
import type { TeamMember, TeamRole } from '@/api/types'
import { formatDate } from '@/utils/format'
import TeamInviteModal from './TeamInviteModal'
import './TeamMembers.css'

interface TeamMembersProps {
  teamId: string
  teamName: string
  isTeamAdmin: boolean
  allowMemberInvite: boolean
}

export default function TeamMembers({ teamId, teamName, isTeamAdmin, allowMemberInvite }: TeamMembersProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const { data, isLoading } = useTeamMembers(teamId)
  const updateRole = useUpdateTeamMemberRole()
  const removeMember = useRemoveTeamMember()

  const canInvite = isTeamAdmin || allowMemberInvite

  const handleAction = (member: TeamMember, action: string) => {
    switch (action) {
      case 'make-team_admin':
        updateRole.mutate({ teamId, userId: member.user_id, data: { team_role: 'team_admin' } })
        break
      case 'make-member':
        updateRole.mutate({ teamId, userId: member.user_id, data: { team_role: 'member' } })
        break
      case 'make-viewer':
        updateRole.mutate({ teamId, userId: member.user_id, data: { team_role: 'viewer' } })
        break
      case 'remove':
        if (confirm(`Remove ${member.name} from the team?`)) {
          removeMember.mutate({ teamId, userId: member.user_id })
        }
        break
    }
  }

  const getRoleBadge = (role: TeamRole) => {
    const variants: Record<TeamRole, 'primary' | 'success' | 'default'> = {
      team_admin: 'primary',
      member: 'success',
      viewer: 'default',
    }
    const labels: Record<TeamRole, string> = {
      team_admin: 'Admin',
      member: 'Member',
      viewer: 'Viewer',
    }
    return <Badge variant={variants[role]}>{labels[role]}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      active: 'success',
      invited: 'warning',
      removed: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const columns: Column<TeamMember>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (m) => (
        <div className="team-members__user">
          <div className="team-members__avatar" style={{ backgroundColor: '#6b7280' }}>
            {m.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="team-members__name">{m.name}</div>
            <div className="team-members__email">{m.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'team_role',
      header: 'Team Role',
      render: (m) => getRoleBadge(m.team_role),
    },
    {
      key: 'org_role',
      header: 'Org Role',
      render: (m) => <Badge variant="default">{m.org_role}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => getStatusBadge(m.status),
    },
    {
      key: 'joined_at',
      header: 'Joined',
      render: (m) => formatDate(m.joined_at),
    },
    ...(isTeamAdmin
      ? [{
          key: 'actions' as keyof TeamMember,
          header: '',
          width: '48px',
          render: (m: TeamMember) => (
            <Dropdown
              trigger={
                <button className="team-members__action-btn">
                  <MoreVertical size={16} />
                </button>
              }
              items={[
                { label: 'Set as Admin', value: 'make-team_admin', icon: <Shield size={14} /> },
                { label: 'Set as Member', value: 'make-member', icon: <UserCheck size={14} /> },
                { label: 'Set as Viewer', value: 'make-viewer', icon: <UserX size={14} /> },
                { label: 'Remove', value: 'remove', icon: <Trash2 size={14} />, danger: true },
              ]}
              onSelect={(action) => handleAction(m, action)}
              align="right"
            />
          ),
        } as Column<TeamMember>]
      : []),
  ]

  return (
    <div className="team-members">
      <div className="team-members__header">
        <h3>Members ({data?.meta.total ?? 0})</h3>
        {canInvite && (
          <Button icon={<Plus size={16} />} onClick={() => setInviteOpen(true)}>
            Invite
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyField="id"
        loading={isLoading}
        emptyMessage="No team members yet"
      />

      <TeamInviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        teamId={teamId}
        teamName={teamName}
      />
    </div>
  )
}
