import { X } from 'lucide-react'

interface ConfigPillProps {
  label: string
  sublabel?: string
  removable?: boolean
  onRemove?: () => void
  active?: boolean
  onClick?: () => void
}

export default function ConfigPill({ label, sublabel, removable, onRemove, active, onClick }: ConfigPillProps) {
  const isToggle = typeof active === 'boolean'
  const className = [
    'config-pill',
    isToggle ? (active ? 'config-pill--active' : 'config-pill--inactive') : '',
    onClick ? 'config-pill--clickable' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={className} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <span className="config-pill__label">{label}</span>
      {sublabel && <span className="config-pill__sublabel">{sublabel}</span>}
      {removable && onRemove && (
        <button
          className="config-pill__remove"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove ${label}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
