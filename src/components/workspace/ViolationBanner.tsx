import { AlertTriangle, Info, XCircle, X } from 'lucide-react'
import './ViolationBanner.css'

interface Violation {
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion?: string
}

interface ViolationBannerProps {
  violations: Violation[]
  onDismiss?: (index: number) => void
}

export default function ViolationBanner({ violations, onDismiss }: ViolationBannerProps) {
  if (violations.length === 0) return null

  const icons = {
    info: <Info size={16} />,
    warning: <AlertTriangle size={16} />,
    error: <XCircle size={16} />,
  }

  return (
    <div className="violation-banner">
      {violations.map((v, i) => (
        <div key={i} className={`violation-banner__item violation-banner__item--${v.severity}`}>
          <span className="violation-banner__icon">{icons[v.severity]}</span>
          <div className="violation-banner__content">
            <span className="violation-banner__message">{v.message}</span>
            {v.suggestion && (
              <span className="violation-banner__suggestion">{v.suggestion}</span>
            )}
          </div>
          {onDismiss && (
            <button className="violation-banner__dismiss" onClick={() => onDismiss(i)}>
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
