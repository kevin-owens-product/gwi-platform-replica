import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCreateTeam } from '@/hooks/useTeams'
import { Button, Input, Modal } from '@/components/shared'

interface TeamCreateModalProps {
  open: boolean
  onClose: () => void
  onCreated?: (teamId: string) => void
}

export default function TeamCreateModal({ open, onClose, onCreated }: TeamCreateModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [allowMemberInvite, setAllowMemberInvite] = useState(true)
  const [autoShare, setAutoShare] = useState(false)

  const createTeam = useCreateTeam()

  const handleCreate = () => {
    if (!name.trim()) return
    createTeam.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        settings: {
          allow_member_invite: allowMemberInvite,
          auto_share_content: autoShare,
        },
      },
      {
        onSuccess: (team) => {
          setName('')
          setDescription('')
          setAllowMemberInvite(true)
          setAutoShare(false)
          onClose()
          onCreated?.(team.id)
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Team"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            icon={<Plus size={16} />}
            onClick={handleCreate}
            loading={createTeam.isPending}
            disabled={!name.trim()}
          >
            Create Team
          </Button>
        </>
      }
    >
      <div className="team-create-form">
        <Input
          label="Team Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Brand & Marketing"
          fullWidth
        />

        <div style={{ marginTop: 12 }}>
          <label className="input-field__label">Description (optional)</label>
          <textarea
            className="team-create-form__textarea"
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

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allowMemberInvite}
              onChange={(e) => setAllowMemberInvite(e.target.checked)}
            />
            Allow members to invite others
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoShare}
              onChange={(e) => setAutoShare(e.target.checked)}
            />
            Auto-share new content with team
          </label>
        </div>
      </div>
    </Modal>
  )
}
