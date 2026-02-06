import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePasswordReset } from '@/hooks/useAuth'
import './Auth.css'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword(): React.JSX.Element {
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [submittedEmail, setSubmittedEmail] = useState<string>('')
  const passwordReset = usePasswordReset()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data: ForgotPasswordForm): void => {
    setSubmittedEmail(data.email)
    passwordReset.mutate(data.email, {
      onSuccess: () => {
        setSubmitted(true)
      },
    })
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={16} />
            Back to sign in
          </Link>

          <div className="auth-logo">
            <span className="logo-text">GWI</span>
            <span className="logo-dot">.</span>
          </div>

          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            We've sent a password reset link to <strong>{submittedEmail}</strong>.
            Please check your email and follow the instructions to reset your password.
          </p>

          <div className="auth-footer">
            <p className="auth-subtitle">
              Didn't receive the email?{' '}
              <button onClick={() => setSubmitted(false)} className="form-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                Try again
              </button>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="auth-illustration">
            <svg viewBox="0 0 400 400" className="wave-graphic">
              <defs>
                <linearGradient id="waveGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E31C79" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#E31C79" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
              <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="url(#waveGradient4)" strokeWidth="3"/>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        <div className="auth-logo">
          <span className="logo-text">GWI</span>
          <span className="logo-dot">.</span>
        </div>

        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full ${!isValid || passwordReset.isPending ? 'btn-disabled' : ''}`}
            disabled={!isValid || passwordReset.isPending}
          >
            {passwordReset.isPending ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>

      <div className="auth-background">
        <div className="auth-illustration">
          <svg viewBox="0 0 400 400" className="wave-graphic">
            <defs>
              <linearGradient id="waveGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E31C79" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#E31C79" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="url(#waveGradient5)" strokeWidth="3"/>
            <path d="M0,220 Q100,120 200,220 T400,220" fill="none" stroke="url(#waveGradient5)" strokeWidth="2" opacity="0.6"/>
            <path d="M0,240 Q100,140 200,240 T400,240" fill="none" stroke="url(#waveGradient5)" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
