import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { SharingPermission } from '@/api/types'
import './PermissionPicker.css'

interface PermissionEntry {
  user_id: string
  permission: SharingPermission
}

interface PermissionPickerProps {
  entries: PermissionEntry[]
  onChange: (entries: PermissionEntry[]) => void
}

export default function PermissionPicker({ entries, onChange }: PermissionPickerProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<SharingPermission>('view')

  const handleAdd = () => {
    if (!email.trim()) return
    // Use email as user_id for now (in a real app this would resolve to user_id)
    if (entries.some((e) => e.user_id === email.trim())) return
    onChange([...entries, { user_id: email.trim(), permission }])
    setEmail('')
    setPermission('view')
  }

  const handleRemove = (userId: string) => {
    onChange(entries.filter((e) => e.user_id !== userId))
  }

  const handlePermissionChange = (userId: string, newPerm: SharingPermission) => {
    onChange(entries.map((e) => (e.user_id === userId ? { ...e, permission: newPerm } : e)))
  }

  return (
    <div className="perm-picker">
      <div className="perm-picker__input-row">
        <input
          className="perm-picker__email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
        />
        <select
          className="perm-picker__select"
          value={permission}
          onChange={(e) => setPermission(e.target.value as SharingPermission)}
        >
          <option value="view">View</option>
          <option value="edit">Edit</option>
          <option value="admin">Admin</option>
        </select>
        <button className="perm-picker__add-btn" onClick={handleAdd} disabled={!email.trim()}>
          <Plus size={16} />
        </button>
      </div>

      {entries.length > 0 && (
        <div className="perm-picker__list">
          {entries.map((entry) => (
            <div key={entry.user_id} className="perm-picker__entry">
              <div className="perm-picker__entry-avatar">
                {entry.user_id.charAt(0).toUpperCase()}
              </div>
              <span className="perm-picker__entry-id">{entry.user_id}</span>
              <select
                className="perm-picker__select perm-picker__select--small"
                value={entry.permission}
                onChange={(e) => handlePermissionChange(entry.user_id, e.target.value as SharingPermission)}
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="admin">Admin</option>
              </select>
              <button className="perm-picker__remove" onClick={() => handleRemove(entry.user_id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="perm-picker__empty">No individual users added. Enter an email above to share.</p>
      )}
    </div>
  )
}
