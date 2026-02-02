import { Link, useLocation } from 'react-router-dom';
import { Target, Users, ArrowRight } from 'lucide-react';
import './Canvas.css';

export default function Canvas() {
  const location = useLocation();
  const isGoalsStep = location.pathname.includes('goals') || location.pathname === '/app/canvas';

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <h1 className="page-title">Canvas</h1>
        <p className="page-subtitle">Define your research objectives and target audiences</p>
      </div>

      <div className="canvas-steps">
        <div className={`step ${isGoalsStep ? 'active' : 'completed'}`}>
          <div className="step-icon">
            <Target size={24} />
          </div>
          <div className="step-info">
            <h3>Step 1: Define Goals</h3>
            <p>What do you want to learn?</p>
          </div>
        </div>
        <div className="step-connector" />
        <Link to="/app/canvas/audiences" className={`step ${!isGoalsStep ? 'active' : ''}`}>
          <div className="step-icon">
            <Users size={24} />
          </div>
          <div className="step-info">
            <h3>Step 2: Define Audiences</h3>
            <p>Who do you want to study?</p>
          </div>
        </Link>
      </div>

      {isGoalsStep && (
        <div className="canvas-content">
          <div className="goals-section">
            <h2>What are your research goals?</h2>
            <p>Select the topics you want to explore</p>

            <div className="goals-grid">
              {['Brand Awareness', 'Market Trends', 'Competitor Analysis', 'Consumer Behavior', 'Purchase Intent', 'Media Consumption'].map((goal) => (
                <button key={goal} className="goal-card">
                  <span>{goal}</span>
                </button>
              ))}
            </div>

            <div className="canvas-actions">
              <Link to="/app/canvas/audiences" className="btn-primary">
                <span>Continue to Audiences</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
