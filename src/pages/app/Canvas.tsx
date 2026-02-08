import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Target, Users, ArrowRight, BarChart2, TrendingUp, ShoppingCart,
  Tv, Shield, Globe, LucideIcon, Star, DollarSign, FileText,
  Calendar, ClipboardList, Sparkles, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/shared';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaceStore } from '@/stores/workspace';
import './Canvas.css';

interface Goal {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  popular?: boolean;
}

const goals: Goal[] = [
  { id: 'brand', label: 'Brand Awareness', desc: 'Measure and track brand recognition', icon: Shield, popular: true },
  { id: 'trends', label: 'Market Trends', desc: 'Identify emerging consumer trends', icon: TrendingUp, popular: true },
  { id: 'competitor', label: 'Competitor Analysis', desc: 'Benchmark against competitors', icon: BarChart2 },
  { id: 'behavior', label: 'Consumer Behavior', desc: 'Understand purchasing patterns', icon: ShoppingCart, popular: true },
  { id: 'purchase', label: 'Purchase Intent', desc: 'Predict future buying decisions', icon: Globe },
  { id: 'media', label: 'Media Consumption', desc: 'Analyze media habits and preferences', icon: Tv },
];

const budgetEstimates: Record<string, { sampleSize: number; credits: number }> = {
  brand: { sampleSize: 2500, credits: 120 },
  trends: { sampleSize: 3000, credits: 150 },
  competitor: { sampleSize: 2000, credits: 100 },
  behavior: { sampleSize: 3500, credits: 180 },
  purchase: { sampleSize: 2800, credits: 140 },
  media: { sampleSize: 2200, credits: 110 },
};

export default function Canvas(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canvasGoals = useWorkspaceStore((state) => state.canvasGoals);
  const setCanvasGoals = useWorkspaceStore((state) => state.setCanvasGoals);

  const [activeStep, setActiveStep] = useState<number>(() => {
    if (location.pathname.includes('review')) return 3;
    if (location.pathname.includes('audiences')) return 2;
    return 1;
  });
  const [showBrief, setShowBrief] = useState<boolean>(false);

  const isGoalsStep: boolean = activeStep === 1;
  const isReviewStep: boolean = activeStep === 3;

  const greeting = user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome';

  const toggleGoal = (id: string): void => {
    const next = canvasGoals.includes(id)
      ? canvasGoals.filter((g) => g !== id)
      : [...canvasGoals, id];
    setCanvasGoals(next);
  };

  const selectedGoalLabels = goals.filter((g) => canvasGoals.includes(g.id));

  // Budget estimator calculations
  const totalSampleSize = canvasGoals.reduce(
    (sum, id) => sum + (budgetEstimates[id]?.sampleSize ?? 0), 0
  );
  const totalCredits = canvasGoals.reduce(
    (sum, id) => sum + (budgetEstimates[id]?.credits ?? 0), 0
  );

  const handleGoToReview = (): void => {
    setActiveStep(3);
  };

  const handleBackToGoals = (): void => {
    setActiveStep(1);
  };

  const handleGenerateBrief = (): void => {
    setShowBrief(true);
  };

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <h1 className="page-title">Canvas</h1>
        <p className="page-subtitle">{greeting} -- Define your research objectives and target audiences</p>
      </div>

      <div className="canvas-steps">
        <button
          className={`step ${isGoalsStep ? 'active' : 'completed'}`}
          onClick={handleBackToGoals}
        >
          <div className="step-number">{isGoalsStep ? '1' : '\u2713'}</div>
          <div className="step-info">
            <h3>Define Goals</h3>
            <p>What do you want to learn?</p>
          </div>
        </button>
        <div className="step-connector" />
        <Link
          to="/app/canvas/audiences"
          className={`step ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : ''}`}
        >
          <div className="step-number">{activeStep > 2 ? '\u2713' : '2'}</div>
          <div className="step-info">
            <h3>Define Audiences</h3>
            <p>Who do you want to study?</p>
          </div>
        </Link>
        <div className="step-connector" />
        <button
          className={`step ${isReviewStep ? 'active' : ''}`}
          onClick={canvasGoals.length > 0 ? handleGoToReview : undefined}
          disabled={canvasGoals.length === 0}
        >
          <div className="step-number">3</div>
          <div className="step-info">
            <h3>Review &amp; Generate</h3>
            <p>Finalize your research brief</p>
          </div>
        </button>
      </div>

      {isGoalsStep && (
        <div className="canvas-content">
          <div className="goals-section">
            <h2>What are your research goals?</h2>
            <p>Select the topics you want to explore ({canvasGoals.length} selected)</p>

            <div className="goals-grid">
              {goals.map((goal: Goal) => {
                const isSelected: boolean = canvasGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    className={`goal-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    {goal.popular && (
                      <div className="goal-popular-badge">
                        <Star size={10} />
                        Popular
                      </div>
                    )}
                    <div className={`goal-icon ${isSelected ? 'selected' : ''}`}>
                      <goal.icon size={22} />
                    </div>
                    <span className="goal-label">{goal.label}</span>
                    <span className="goal-desc">{goal.desc}</span>
                    {isSelected && <div className="goal-check">&#10003;</div>}
                  </button>
                );
              })}
            </div>

            {/* Research Budget Estimator */}
            {canvasGoals.length > 0 && (
              <div className="budget-estimator">
                <div className="budget-header">
                  <DollarSign size={18} />
                  <h3>Research Budget Estimate</h3>
                </div>
                <div className="budget-grid">
                  <div className="budget-card">
                    <span className="budget-card-label">Estimated Sample Size</span>
                    <span className="budget-card-value">{totalSampleSize.toLocaleString()}</span>
                    <span className="budget-card-unit">respondents</span>
                  </div>
                  <div className="budget-card">
                    <span className="budget-card-label">Data Credits Required</span>
                    <span className="budget-card-value">{totalCredits.toLocaleString()}</span>
                    <span className="budget-card-unit">credits</span>
                  </div>
                  <div className="budget-card">
                    <span className="budget-card-label">Goals Selected</span>
                    <span className="budget-card-value">{canvasGoals.length}</span>
                    <span className="budget-card-unit">of {goals.length}</span>
                  </div>
                </div>
                <div className="budget-breakdown">
                  <span className="budget-breakdown-title">Breakdown by goal:</span>
                  {selectedGoalLabels.map((g) => (
                    <div key={g.id} className="budget-breakdown-row">
                      <span className="budget-breakdown-name">{g.label}</span>
                      <span className="budget-breakdown-detail">
                        {budgetEstimates[g.id].sampleSize.toLocaleString()} respondents / {budgetEstimates[g.id].credits} credits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="canvas-actions">
              <Button
                variant="primary"
                iconRight={<ArrowRight size={18} />}
                disabled={canvasGoals.length === 0}
                onClick={() => navigate('/app/canvas/audiences')}
              >
                Continue to Audiences
              </Button>
            </div>
          </div>
        </div>
      )}

      {isReviewStep && (
        <div className="canvas-content">
          <div className="review-section">
            <div className="review-header">
              <ClipboardList size={22} />
              <h2>Review &amp; Generate</h2>
            </div>
            <p className="review-subtitle">Review your selections before generating the research brief</p>

            <div className="review-summary">
              <div className="review-summary-card">
                <div className="review-summary-card-header">
                  <Target size={16} />
                  <h4>Selected Goals ({selectedGoalLabels.length})</h4>
                </div>
                <div className="review-summary-list">
                  {selectedGoalLabels.length === 0 ? (
                    <span className="review-empty">No goals selected</span>
                  ) : (
                    selectedGoalLabels.map((g) => (
                      <div key={g.id} className="review-summary-item">
                        <CheckCircle2 size={14} />
                        <span>{g.label}</span>
                        <span className="review-summary-item-desc">{g.desc}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="review-summary-card">
                <div className="review-summary-card-header">
                  <Users size={16} />
                  <h4>Target Audiences</h4>
                </div>
                <p className="review-summary-note">
                  Audiences will be configured in Step 2. Return to the Audiences step to refine your selections.
                </p>
              </div>

              <div className="review-summary-card">
                <div className="review-summary-card-header">
                  <DollarSign size={16} />
                  <h4>Budget Summary</h4>
                </div>
                <div className="review-budget-row">
                  <span>Total Sample Size:</span>
                  <strong>{totalSampleSize.toLocaleString()} respondents</strong>
                </div>
                <div className="review-budget-row">
                  <span>Data Credits:</span>
                  <strong>{totalCredits.toLocaleString()} credits</strong>
                </div>
              </div>
            </div>

            <div className="review-actions">
              <Button variant="secondary" onClick={handleBackToGoals}>
                Back to Goals
              </Button>
              <Button
                variant="primary"
                iconRight={<Sparkles size={16} />}
                onClick={handleGenerateBrief}
                disabled={canvasGoals.length === 0}
              >
                Generate Research Brief
              </Button>
            </div>

            {/* Research Brief Preview */}
            {showBrief && (
              <div className="research-brief">
                <div className="research-brief-header">
                  <FileText size={20} />
                  <h3>Research Brief Preview</h3>
                </div>

                <div className="brief-section">
                  <h4 className="brief-section-title">Objective</h4>
                  <p className="brief-section-content">
                    Conduct comprehensive research to{' '}
                    {selectedGoalLabels.map((g, i) => (
                      <span key={g.id}>
                        {i > 0 && i < selectedGoalLabels.length - 1 ? ', ' : ''}
                        {i > 0 && i === selectedGoalLabels.length - 1 ? ' and ' : ''}
                        {g.desc.toLowerCase()}
                      </span>
                    ))}
                    {'. '}
                    This study aims to deliver actionable insights for strategic decision-making across the selected research areas.
                  </p>
                </div>

                <div className="brief-section">
                  <h4 className="brief-section-title">Target Audience</h4>
                  <p className="brief-section-content">
                    Global internet users aged 16-64 across key markets. Audience segments will be refined based on demographic,
                    behavioral, and attitudinal criteria to ensure representative sampling of the target population.
                  </p>
                </div>

                <div className="brief-section">
                  <h4 className="brief-section-title">Key Questions</h4>
                  <ul className="brief-question-list">
                    {selectedGoalLabels.map((g) => (
                      <li key={g.id}>How does the target audience engage with {g.label.toLowerCase()} topics?</li>
                    ))}
                    <li>What are the primary drivers and barriers in each research area?</li>
                    <li>How do segments differ in their attitudes and behaviors?</li>
                  </ul>
                </div>

                <div className="brief-section">
                  <h4 className="brief-section-title">Methodology</h4>
                  <p className="brief-section-content">
                    Online quantitative survey via GWI Platform. Data collected through structured questionnaires
                    targeting {totalSampleSize.toLocaleString()} respondents across representative panels, with statistical
                    weighting applied to ensure accuracy and representativeness.
                  </p>
                </div>

                <div className="brief-section">
                  <h4 className="brief-section-title">
                    <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Timeline
                  </h4>
                  <div className="brief-timeline">
                    <div className="brief-timeline-item">
                      <span className="brief-timeline-phase">Phase 1: Setup</span>
                      <span className="brief-timeline-duration">Week 1-2</span>
                    </div>
                    <div className="brief-timeline-item">
                      <span className="brief-timeline-phase">Phase 2: Data Collection</span>
                      <span className="brief-timeline-duration">Week 3-5</span>
                    </div>
                    <div className="brief-timeline-item">
                      <span className="brief-timeline-phase">Phase 3: Analysis</span>
                      <span className="brief-timeline-duration">Week 6-7</span>
                    </div>
                    <div className="brief-timeline-item">
                      <span className="brief-timeline-phase">Phase 4: Reporting</span>
                      <span className="brief-timeline-duration">Week 8</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
