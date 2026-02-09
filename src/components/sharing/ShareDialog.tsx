import { useState } from 'react'
import { Share2, Globe, Users, Lock, Eye, Edit3, Shield } from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'
import { Modal, Button, Badge } from '@/components/shared'
import type { SharingConfig, SharingVisibility, SharingPermission } from '@/api/types'
import PermissionPicker from './PermissionPicker'
import './ShareDialog.css'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  title: string
  currentSharing?: SharingConfig
  onSave: (config: SharingConfig) => void
}

const visibilityOptions: Array<{ value: SharingVisibility; label: string; desc: string; icon: React.ReactNode }> = [
  { value: 'private', label: 'Private', desc: 'Only you can access', icon: <Lock size={16} /> },
  { value: 'team', label: 'Team', desc: 'Shared with your team', icon: <Users size={16} /> },
  { value: 'organization', label: 'Organization', desc: 'Everyone in your org', icon: <Globe size={16} /> },
]

export default function ShareDialog({ open, onClose, title, currentSharing, onSave }: ShareDialogProps) {
  const [visibility, setVisibility] = useState<SharingVisibility>(currentSharing?.visibility ?? 'private')
  const [sharedWithUsers, setSharedWithUsers] = useState<Array<{ user_id: string; permission: SharingPermission }>>(
    currentSharing?.shared_with ?? [],
  )
  const [sharedWithTeams, setSharedWithTeams] = useState<Array<{ team_id: string; permission: SharingPermission }>>(
    currentSharing?.shared_with_teams ?? [],
  )

  const { data: teamsData } = useTeams()

  const handleSave = () => {
    onSave({
      visibility,
      shared_with: sharedWithUsers.length > 0 ? sharedWithUsers : undefined,
      shared_with_teams: sharedWithTeams.length > 0 ? sharedWithTeams : undefined,
    })
    onClose()
  }

  const addTeamShare = (teamId: string) => {
    if (sharedWithTeams.some((t) => t.team_id === teamId)) return
    setSharedWithTeams([...sharedWithTeams, { team_id: teamId, permission: 'view' }])
  }

  const removeTeamShare = (teamId: string) => {
    setSharedWithTeams(sharedWithTeams.filter((t) => t.team_id !== teamId))
  }

  const updateTeamPermission = (teamId: string, permission: SharingPermission) => {
    setSharedWithTeams(
      sharedWithTeams.map((t) => (t.team_id === teamId ? { ...t, permission } : t)),
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Share: ${title}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon={<Share2 size={16} />} onClick={handleSave}>
            Save Sharing
          </Button>
        </>
      }
    >
      <div className="share-dialog">
        {/* Visibility */}
        <div className="share-dialog__section">
          <label className="share-dialog__label">Visibility</label>
          <div className="share-dialog__visibility-options">
            {visibilityOptions.map((opt) => (
              <button
                key={opt.value}
                className={`share-dialog__visibility-btn ${visibility === opt.value ? 'active' : ''}`}
                onClick={() => setVisibility(opt.value)}
              >
                {opt.icon}
                <div>
                  <div className="share-dialog__visibility-name">{opt.label}</div>
                  <div className="share-dialog__visibility-desc">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Team sharing */}
        {(visibility === 'team' || visibility === 'organization') && (
          <div className="share-dialog__section">
            <label className="share-dialog__label">Share with Teams</label>
            {teamsData?.data && teamsData.data.length > 0 && (
              <div className="share-dialog__team-picker">
                {teamsData.data.map((team) => {
                  const shared = sharedWithTeams.find((t) => t.team_id === team.id)
                  return (
                    <div key={team.id} className="share-dialog__team-row">
                      <div className="share-dialog__team-info">
                        <div
                          className="share-dialog__team-avatar"
                          style={{ backgroundColor: team.avatar_color || '#6b7280' }}
                        >
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{team.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {team.member_count} members
                          </div>
                        </div>
                      </div>
                      {shared ? (
                        <div className="share-dialog__team-controls">
                          <select
                            value={shared.permission}
                            onChange={(e) => updateTeamPermission(team.id, e.target.value as SharingPermission)}
                            className="share-dialog__perm-select"
                          >
                            <option value="view">View</option>
                            <option value="edit">Edit</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            className="share-dialog__remove-btn"
                            onClick={() => removeTeamShare(team.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => addTeamShare(team.id)}>
                          Add
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* User sharing */}
        <div className="share-dialog__section">
          <label className="share-dialog__label">Share with People</label>
          <PermissionPicker
            entries={sharedWithUsers}
            onChange={setSharedWithUsers}
          />
        </div>
      </div>
    </Modal>
  )
}
