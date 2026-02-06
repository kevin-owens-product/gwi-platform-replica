import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Plus, Check } from 'lucide-react';
import './Canvas.css';

interface Audience {
  id: number;
  name: string;
  size: string;
  desc: string;
}

const audiences: Audience[] = [
  { id: 1, name: 'Gen Z (18-24)', size: '245M', desc: 'Digital natives, social-first generation' },
  { id: 2, name: 'Millennials (25-34)', size: '312M', desc: 'Experience-driven, brand-conscious consumers' },
  { id: 3, name: 'Gen X (35-44)', size: '298M', desc: 'Established professionals with spending power' },
  { id: 4, name: 'Heavy Social Media Users', size: '156M', desc: '3+ hours daily on social platforms' },
  { id: 5, name: 'Online Shoppers', size: '428M', desc: 'Made 5+ online purchases in past month' },
  { id: 6, name: 'Health-Conscious Consumers', size: '189M', desc: 'Prioritize wellness in purchase decisions' },
];

export default function CanvasAudiences(): React.JSX.Element {
  const [selectedAudiences, setSelectedAudiences] = useState<number[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);

  const toggleAudience = (id: number): void => {
    setSelectedAudiences((prev: number[]) =>
      prev.includes(id) ? prev.filter((a: number) => a !== id) : [...prev, id]
    );
  };

  const handleGenerate = (): void => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <h1 className="page-title">Canvas</h1>
        <p className="page-subtitle">Define your research objectives and target audiences</p>
      </div>

      <div className="canvas-steps">
        <Link to="/app/canvas" className="step completed">
          <div className="step-number">&#10003;</div>
          <div className="step-info">
            <h3>Define Goals</h3>
            <p>What do you want to learn?</p>
          </div>
        </Link>
        <div className="step-connector" />
        <div className="step active">
          <div className="step-number">2</div>
          <div className="step-info">
            <h3>Define Audiences</h3>
            <p>Who do you want to study?</p>
          </div>
        </div>
      </div>

      <div className="canvas-content">
        <div className="audiences-section">
          <h2>Select your target audiences</h2>
          <p>Choose the audiences you want to analyze ({selectedAudiences.length} selected)</p>

          <div className="audiences-list">
            {audiences.map((audience: Audience) => {
              const isSelected: boolean = selectedAudiences.includes(audience.id);
              return (
                <button
                  key={audience.id}
                  className={`audience-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleAudience(audience.id)}
                >
                  <div className="audience-checkbox">
                    {isSelected && <Check size={14} />}
                  </div>
                  <div className="audience-info">
                    <span className="audience-name">{audience.name}</span>
                    <span className="audience-size">{audience.size} people &middot; {audience.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button className="add-custom-btn">
            <Plus size={16} />
            <span>Create custom audience</span>
          </button>

          <div className="canvas-actions" style={{ justifyContent: 'space-between' }}>
            <Link to="/app/canvas" className="btn-secondary">
              <ArrowLeft size={18} />
              <span>Back to Goals</span>
            </Link>
            <button
              className={`btn-primary ${selectedAudiences.length === 0 ? 'btn-disabled' : ''}`}
              disabled={selectedAudiences.length === 0 || generating}
              onClick={handleGenerate}
            >
              <span>{generating ? 'Generating...' : 'Generate Insights'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
