import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, fullWidth, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={`input-field ${fullWidth ? 'input-field--full' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-field__label">
            {label}
          </label>
        )}
        <div className={`input-field__wrapper ${error ? 'input-field__wrapper--error' : ''}`}>
          {icon && <span className="input-field__icon">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className="input-field__input"
            {...props}
          />
          {iconRight && <span className="input-field__icon input-field__icon--right">{iconRight}</span>}
        </div>
        {error && <span className="input-field__error">{error}</span>}
        {hint && !error && <span className="input-field__hint">{hint}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
