import { useState, useRef, useEffect, type ReactNode } from 'react'
import './Dropdown.css'

interface DropdownItem {
  label: string
  value: string
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  onSelect: (value: string) => void
  align?: 'left' | 'right'
}

export default function Dropdown({ trigger, items, onSelect, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={`dropdown__menu dropdown__menu--${align}`}>
          {items.map((item) => (
            <button
              key={item.value}
              className={`dropdown__item ${item.danger ? 'dropdown__item--danger' : ''}`}
              disabled={item.disabled}
              onClick={() => {
                onSelect(item.value)
                setOpen(false)
              }}
            >
              {item.icon && <span className="dropdown__item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
