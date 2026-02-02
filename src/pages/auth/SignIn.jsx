import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo: just navigate to the app
    navigate('/app');
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <span className="logo-text">GWI</span>
          <span className="logo-dot">.</span>
        </div>

        <h1 className="auth-title">Sign in</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-text">Remember me</span>
            </label>
            <Link to="/password-recovery" className="form-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full ${!isFormValid ? 'btn-disabled' : ''}`}
            disabled={!isFormValid}
          >
            Sign in
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="btn btn-sso btn-full">
          <svg className="sso-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          Sign in with SSO
        </button>

        <div className="auth-footer">
          <Link to="/cant-login" className="form-link">Can't log in?</Link>
          <span className="auth-footer-separator">|</span>
          <Link to="/sign-up" className="form-link">Sign up</Link>
        </div>
      </div>

      <div className="auth-background">
        <div className="auth-illustration">
          <svg viewBox="0 0 400 400" className="wave-graphic">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E31C79" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#E31C79" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="url(#waveGradient)" strokeWidth="3"/>
            <path d="M0,220 Q100,120 200,220 T400,220" fill="none" stroke="url(#waveGradient)" strokeWidth="2" opacity="0.6"/>
            <path d="M0,240 Q100,140 200,240 T400,240" fill="none" stroke="url(#waveGradient)" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
