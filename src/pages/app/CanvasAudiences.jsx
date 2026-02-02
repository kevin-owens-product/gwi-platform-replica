import { Link } from 'react-router-dom';
import { Target, Users, ArrowLeft, Plus, Check } from 'lucide-react';
import './Canvas.css';

const audiences = [
  { id: 1, name: 'Gen Z (18-24)', size: '245M' },
  { id: 2, name: 'Millennials (25-34)', size: '312M' },
  { id: 3, name: 'Gen X (35-44)', size: '298M' },
  { id: 4, name: 'Heavy Social Media Users', size: '156M' },
];

export default function CanvasAudiences() {
  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <h1 className="page-title">Canvas</h1>
        <p className="page-subtitle">Define your research objectives and target audiences</p>
      </div>

      <div className="canvas-steps">
        <Link to="/app/canvas" className="step completed">
          <div className="step-icon">
            <Check size={24} />
          </div>
          <div className="step-info">
            <h3>Step 1: Define Goals</h3>
            <p>What do you want to learn?</p>
          </div>
        </Link>
        <div className="step-connector" />
        <div className="step active">
          <div className="step-icon">
            <Users size={24} />
          </div>
          <div className="step-info">
            <h3>Step 2: Define Audiences</h3>
            <p>Who do you want to study?</p>
          </div>
        </div>
      </div>

      <div className="canvas-content">
        <div className="audiences-section">
          <h2>Select your target audiences</h2>
          <p>Choose the audiences you want to analyze</p>

          <div className="audiences-list">
            {audiences.map((audience) => (
              <button key={audience.id} className="audience-option">
                <div className="audience-checkbox">
                  <Check size={14} />
                </div>
                <div className="audience-info">
                  <span className="audience-name">{audience.name}</span>
                  <span className="audience-size">{audience.size} people</span>
                </div>
              </button>
            ))}
          </div>

          <button className="add-custom-btn">
            <Plus size={16} />
            <span>Create custom audience</span>
          </button>

          <div className="canvas-actions">
            <Link to="/app/canvas" className="btn-secondary">
              <ArrowLeft size={18} />
              <span>Back to Goals</span>
            </Link>
            <button className="btn-primary">
              <span>Generate Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
