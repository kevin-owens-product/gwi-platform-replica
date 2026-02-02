import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Auth.css';

export default function SignUp() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign up logic
  };

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

        <h1 className="auth-title">Sign up</h1>
        <p className="auth-subtitle">
          Enter your work email to get started with GWI.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Work email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full ${!email ? 'btn-disabled' : ''}`}
            disabled={!email}
          >
            Continue
          </button>
        </form>

        <p className="auth-subtitle" style={{ marginTop: 'var(--spacing-lg)', fontSize: '0.8125rem' }}>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <div className="auth-background">
        <div className="auth-illustration">
          <svg viewBox="0 0 400 400" className="wave-graphic">
            <defs>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E31C79" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#E31C79" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="url(#waveGradient2)" strokeWidth="3"/>
            <path d="M0,220 Q100,120 200,220 T400,220" fill="none" stroke="url(#waveGradient2)" strokeWidth="2" opacity="0.6"/>
            <path d="M0,240 Q100,140 200,240 T400,240" fill="none" stroke="url(#waveGradient2)" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
