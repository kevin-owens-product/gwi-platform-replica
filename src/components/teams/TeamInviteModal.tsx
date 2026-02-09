import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useInviteToTeam } from '@/hooks/useTeams'
import { Button, Input, Modal } from '@/components/shared'
import type { TeamRole } from '@/api/types'

interface TeamInviteModalProps {
  open: boolean
  onClose: () => void
  teamId: string
  teamName: string
}

export default function TeamInviteModal({ open, onClose, teamId, teamName }: TeamInviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('member')
  const [message, setMessage] = useState('')

  const invite = useInviteToTeam()

  const handleInvite = () => {
    if (!email.trim()) return
    invite.mutate(
      {
        teamId,
        data: {
          email: email.trim(),
          team_role: role,
          message: message.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setEmail('')
          setRole('member')
          setMessage('')
          onClose()
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Invite to ${teamName}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            icon={<Mail size={16} />}
            onClick={handleInvite}
            loading={invite.isPending}
            disabled={!email.trim()}
          >
            Send Invite
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          fullWidth
        />

        <div>
          <label className="input-field__label">Team Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          >
            <option value="viewer">Viewer — can see team content</option>
            <option value="member">Member — can create and edit</option>
            <option value="team_admin">Team Admin — full team management</option>
          </select>
        </div>

        <div>
          <label className="input-field__label">Personal message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hey! Join our team to collaborate on..."
            rows={2}
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
      </div>
    </Modal>
  )
}
