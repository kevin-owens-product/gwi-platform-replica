import { useState } from 'react'
import { Plus, MoreVertical, Mail, Shield, UserX, UserCheck, Trash2 } from 'lucide-react'
import { useAdminUsers, useInviteUser, useUpdateUserRole, useDisableUser, useEnableUser, useRemoveUser } from '@/hooks/useAdmin'
import { Button, DataTable, Badge, Modal, Input, SearchInput, Dropdown } from '@/components/shared'
import type { Column } from '@/components/shared'
import type { OrganizationUser, UserRole } from '@/api/types'
import { formatDate } from '@/utils/format'
import './UserManagement.css'

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('analyst')
  const [inviteName, setInviteName] = useState('')

  const { data, isLoading } = useAdminUsers({
    page,
    per_page: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  })

  const inviteUser = useInviteUser()
  const updateRole = useUpdateUserRole()
  const disableUser = useDisableUser()
  const enableUser = useEnableUser()
  const removeUser = useRemoveUser()

  const handleInvite = () => {
    if (!inviteEmail) return
    inviteUser.mutate(
      { email: inviteEmail, role: inviteRole, name: inviteName || undefined },
      {
        onSuccess: () => {
          setInviteModalOpen(false)
          setInviteEmail('')
          setInviteName('')
          setInviteRole('analyst')
        },
      }
    )
  }

  const handleAction = (userId: string, action: string) => {
    switch (action) {
      case 'make-admin':
        updateRole.mutate({ id: userId, data: { role: 'admin' } })
        break
      case 'make-manager':
        updateRole.mutate({ id: userId, data: { role: 'manager' } })
        break
      case 'make-analyst':
        updateRole.mutate({ id: userId, data: { role: 'analyst' } })
        break
      case 'make-viewer':
        updateRole.mutate({ id: userId, data: { role: 'viewer' } })
        break
      case 'disable':
        disableUser.mutate(userId)
        break
      case 'enable':
        enableUser.mutate(userId)
        break
      case 'remove':
        if (confirm('Are you sure you want to remove this user?')) {
          removeUser.mutate(userId)
        }
        break
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, 'primary' | 'info' | 'success' | 'default'> = {
      admin: 'primary',
      manager: 'info',
      analyst: 'success',
      viewer: 'default',
    }
    return <Badge variant={variants[role]}>{role}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      active: 'success',
      invited: 'warning',
      disabled: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const columns: Column<OrganizationUser>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      render: (user) => getRoleBadge(user.role),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => getStatusBadge(user.status),
    },
    {
      key: 'last_login_at',
      header: 'Last Login',
      render: (user) => user.last_login_at ? formatDate(user.last_login_at) : 'Never',
    },
    {
      key: 'actions',
      header: '',
      width: '48px',
      render: (user) => (
        <Dropdown
          trigger={
            <button className="user-mgmt__action-btn">
              <MoreVertical size={16} />
            </button>
          }
          items={[
            { label: 'Set as Admin', value: 'make-admin', icon: <Shield size={14} /> },
            { label: 'Set as Manager', value: 'make-manager', icon: <Shield size={14} /> },
            { label: 'Set as Analyst', value: 'make-analyst', icon: <Shield size={14} /> },
            { label: 'Set as Viewer', value: 'make-viewer', icon: <Shield size={14} /> },
            ...(user.status === 'disabled'
              ? [{ label: 'Enable User', value: 'enable', icon: <UserCheck size={14} /> }]
              : [{ label: 'Disable User', value: 'disable', icon: <UserX size={14} /> }]),
            { label: 'Remove User', value: 'remove', icon: <Trash2 size={14} />, danger: true },
          ]}
          onSelect={(action) => handleAction(user.id, action)}
          align="right"
        />
      ),
    },
  ]

  return (
    <div className="user-mgmt">
      <div className="user-mgmt__header">
        <h2>Team Members</h2>
        <Button icon={<Plus size={16} />} onClick={() => setInviteModalOpen(true)}>
          Invite User
        </Button>
      </div>

      <div className="user-mgmt__filters">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search users..."
        />
        <select
          className="user-mgmt__status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyField="id"
        loading={isLoading}
        emptyMessage="No team members found"
      />

      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              icon={<Mail size={16} />}
              onClick={handleInvite}
              loading={inviteUser.isPending}
            >
              Send Invite
            </Button>
          </>
        }
      >
        <div className="user-mgmt__invite-form">
          <Input
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            fullWidth
          />
          <Input
            label="Name (optional)"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="John Smith"
            fullWidth
          />
          <div className="user-mgmt__role-select">
            <label className="input-field__label">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="user-mgmt__select"
            >
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
