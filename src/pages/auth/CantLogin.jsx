import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Auth.css';

export default function CantLogin() {
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

        <h1 className="auth-title">Can't log in?</h1>
        <p className="auth-subtitle">
          We're here to help. Choose an option below to get back into your account.
        </p>

        <div className="auth-help-links">
          <Link to="/password-recovery" className="btn btn-secondary btn-full">
            Reset my password
          </Link>
          <Link to="/resend-confirmation" className="btn btn-secondary btn-full">
            Resend confirmation email
          </Link>
        </div>

        <div className="auth-footer" style={{ marginTop: 'var(--spacing-xl)' }}>
          <p className="auth-subtitle">
            Still having trouble? Contact our support team at{' '}
            <a href="mailto:support@gwi.com" className="form-link">support@gwi.com</a>
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="auth-illustration">
          <svg viewBox="0 0 400 400" className="wave-graphic">
            <defs>
              <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E31C79" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#E31C79" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="url(#waveGradient3)" strokeWidth="3"/>
            <path d="M0,220 Q100,120 200,220 T400,220" fill="none" stroke="url(#waveGradient3)" strokeWidth="2" opacity="0.6"/>
            <path d="M0,240 Q100,140 200,240 T400,240" fill="none" stroke="url(#waveGradient3)" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
