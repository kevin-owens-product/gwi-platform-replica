import { useState, useEffect } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { useUpdateTeam, useDeleteTeam } from '@/hooks/useTeams'
import { Button, Input } from '@/components/shared'
import type { Team } from '@/api/types'

interface TeamSettingsPanelProps {
  team: Team
  onDeleted?: () => void
}

export default function TeamSettingsPanel({ team, onDeleted }: TeamSettingsPanelProps) {
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description || '')
  const [allowMemberInvite, setAllowMemberInvite] = useState(team.settings.allow_member_invite)
  const [autoShare, setAutoShare] = useState(team.settings.auto_share_content)

  const updateTeam = useUpdateTeam()
  const deleteTeam = useDeleteTeam()

  useEffect(() => {
    setName(team.name)
    setDescription(team.description || '')
    setAllowMemberInvite(team.settings.allow_member_invite)
    setAutoShare(team.settings.auto_share_content)
  }, [team])

  const handleSave = () => {
    updateTeam.mutate({
      id: team.id,
      data: {
        name: name.trim(),
        description: description.trim() || undefined,
        settings: {
          allow_member_invite: allowMemberInvite,
          auto_share_content: autoShare,
        },
      },
    })
  }

  const handleDelete = () => {
    if (confirm(`Delete "${team.name}"? This cannot be undone. All team members will lose access.`)) {
      deleteTeam.mutate(team.id, { onSuccess: () => onDeleted?.() })
    }
  }

  return (
    <div className="team-settings">
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Team Settings</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Team Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <div>
          <label className="input-field__label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this team focus on?"
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allowMemberInvite}
              onChange={(e) => setAllowMemberInvite(e.target.checked)}
            />
            Allow team members to invite others
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoShare}
              onChange={(e) => setAutoShare(e.target.checked)}
            />
            Auto-share new content with the team
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 8 }}>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
            loading={updateTeam.isPending}
          >
            Save Changes
          </Button>

          <Button
            variant="ghost"
            icon={<Trash2 size={16} />}
            onClick={handleDelete}
            loading={deleteTeam.isPending}
            style={{ color: '#ef4444' }}
          >
            Delete Team
          </Button>
        </div>
      </div>
    </div>
  )
}
