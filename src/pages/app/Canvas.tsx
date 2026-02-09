import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users, ArrowRight, BarChart2, TrendingUp, ShoppingCart, Tv, Shield, Globe,
  type LucideIcon, FileText, Plus, Trash2, Clock, CheckCircle2,
  Target, Lightbulb, Zap, Eye, Layers,
  BookOpen, Compass, PieChart, UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal } from '@/components/shared';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaceStore } from '@/stores/workspace';
import './Canvas.css';

interface Goal {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

const goals: Goal[] = [
  { id: 'brand_awareness', label: 'Brand Awareness', desc: 'Measure and track brand recognition', icon: Shield },
  { id: 'market_trends', label: 'Market Trends', desc: 'Identify emerging consumer trends', icon: TrendingUp },
  { id: 'competitor_analysis', label: 'Competitor Analysis', desc: 'Benchmark against competitors', icon: BarChart2 },
  { id: 'consumer_behavior', label: 'Consumer Behavior', desc: 'Understand purchasing patterns', icon: ShoppingCart },
  { id: 'purchase_intent', label: 'Purchase Intent', desc: 'Predict future buying decisions', icon: Globe },
  { id: 'media_consumption', label: 'Media Consumption', desc: 'Analyze media habits and preferences', icon: Tv },
  { id: 'audience_profiling', label: 'Audience Profiling', desc: 'Deep-dive into audience characteristics', icon: UserCheck },
  { id: 'campaign_effectiveness', label: 'Campaign Effectiveness', desc: 'Measure campaign performance and ROI', icon: Target },
  { id: 'product_positioning', label: 'Product Positioning', desc: 'Understand product perception and positioning', icon: Layers },
  { id: 'content_strategy', label: 'Content Strategy', desc: 'Optimize content for your audience', icon: FileText },
  { id: 'customer_journey', label: 'Customer Journey', desc: 'Map the purchase decision journey', icon: Compass },
  { id: 'market_sizing', label: 'Market Sizing', desc: 'Estimate addressable market size', icon: PieChart },
];

interface TemplateCard {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_duration: string;
  usage_count: number;
}

const mockTemplates: TemplateCard[] = [
  { id: 'tpl-1', name: 'Brand Health Tracker', description: 'Comprehensive brand awareness, consideration, and preference tracking', category: 'brand_health', estimated_duration: '15 min', usage_count: 2340 },
  { id: 'tpl-2', name: 'Competitive Landscape', description: 'Compare your brand against key competitors across multiple dimensions', category: 'competitive', estimated_duration: '20 min', usage_count: 1890 },
  { id: 'tpl-3', name: 'Media Habits Deep Dive', description: 'Analyze media consumption patterns across channels and platforms', category: 'media_habits', estimated_duration: '25 min', usage_count: 1560 },
  { id: 'tpl-4', name: 'Purchase Journey Analysis', description: 'Map the customer decision journey from awareness to purchase', category: 'purchase_journey', estimated_duration: '30 min', usage_count: 1120 },
  { id: 'tpl-5', name: 'Trend Explorer', description: 'Identify and track emerging consumer and market trends', category: 'trend_analysis', estimated_duration: '15 min', usage_count: 980 },
  { id: 'tpl-6', name: 'Audience Profiling Kit', description: 'Build detailed profiles of your target audience segments', category: 'audience_profiling', estimated_duration: '20 min', usage_count: 2100 },
];

// 7-step wizard config
const STEP_META: Array<{ type: string; label: string; desc: string; icon: LucideIcon }> = [
  { type: 'objectives', label: 'Objectives', desc: 'Define goals', icon: Target },
  { type: 'markets', label: 'Markets', desc: 'Select regions', icon: Globe },
  { type: 'audiences', label: 'Audiences', desc: 'Target groups', icon: Users },
  { type: 'time_period', label: 'Time Period', desc: 'Select waves', icon: Clock },
  { type: 'analysis_framework', label: 'Framework', desc: 'Configure analysis', icon: Layers },
  { type: 'review', label: 'Review', desc: 'Confirm setup', icon: Eye },
  { type: 'results', label: 'Results', desc: 'View insights', icon: Lightbulb },
];

type ViewMode = 'projects' | 'new' | 'templates';

export default function Canvas(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canvasGoals = useWorkspaceStore((state) => state.canvasGoals);
  const setCanvasGoals = useWorkspaceStore((state) => state.setCanvasGoals);
  const canvasWorkflow = useWorkspaceStore((state) => state.canvasWorkflow);
  const setCanvasStep = useWorkspaceStore((state) => state.setCanvasStep);
  const completeCanvasStep = useWorkspaceStore((state) => state.completeCanvasStep);

  const isGoalsStep: boolean = location.pathname.includes('goals') || location.pathname === '/app/canvas';

  const [viewMode, setViewMode] = useState<ViewMode>('new');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [researchQuestion, setResearchQuestion] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [customGoals, setCustomGoals] = useState<string[]>([]);

  const greeting = user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome';
  const activeStep = canvasWorkflow.currentStep;

  const toggleGoal = (id: string): void => {
    const next = canvasGoals.includes(id)
      ? canvasGoals.filter((g) => g !== id)
      : [...canvasGoals, id];
    setCanvasGoals(next);
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !customGoals.includes(customGoal.trim())) {
      setCustomGoals([...customGoals, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  const removeCustomGoal = (goal: string) => {
    setCustomGoals(customGoals.filter((g) => g !== goal));
  };

  const handleStartFromTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tpl = mockTemplates.find((t) => t.id === templateId);
    if (tpl) {
      toast.success(`Starting project from "${tpl.name}" template`);
      setShowTemplateModal(false);
      setViewMode('new');
    }
  };

  const handleContinue = () => {
    completeCanvasStep(activeStep);
    if (activeStep < STEP_META.length - 1) {
      setCanvasStep(activeStep + 1);
    }
    if (activeStep === 0) {
      navigate('/app/canvas/audiences');
    }
  };

  // Progress bar percentage
  const progressPct = Math.round((canvasWorkflow.completedSteps.length / STEP_META.length) * 100);

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Canvas</h1>
            <p className="page-subtitle">{greeting} -- Define your research objectives and target audiences</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button variant="ghost" onClick={() => setShowTemplateModal(true)}>
              <BookOpen size={16} />
              Templates
            </Button>
            <Button variant="primary" onClick={() => setViewMode('new')}>
              <Plus size={16} />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {canvasWorkflow.completedSteps.length > 0 && (
        <div className="canvas-progress-bar">
          <div className="canvas-progress-track">
            <div className="canvas-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="canvas-progress-label">{progressPct}% complete</span>
        </div>
      )}

      {/* 7-Step Wizard */}
      <div className="canvas-steps">
        {STEP_META.map((step, idx) => {
          const isCompleted = canvasWorkflow.completedSteps.includes(idx);
          const isActive = idx === activeStep && isGoalsStep;
          const StepIcon = step.icon;
          return (
            <React.Fragment key={step.type}>
              {idx > 0 && <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />}
              <button
                className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (isCompleted || idx <= activeStep) {
                    setCanvasStep(idx);
                  }
                }}
                disabled={!isCompleted && idx > activeStep}
                style={{ cursor: isCompleted || idx <= activeStep ? 'pointer' : 'not-allowed', opacity: !isCompleted && idx > activeStep ? 0.5 : 1 }}
              >
                <div className="step-number">
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <div className="step-info">
                  <h3>{step.label}</h3>
                  <p>{step.desc}</p>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Objectives Step (step 0) */}
      {isGoalsStep && activeStep === 0 && (
        <div className="canvas-content">
          <div className="goals-section">
            <h2>What are your research goals?</h2>
            <p>Select the topics you want to explore ({canvasGoals.length + customGoals.length} selected)</p>

            {/* Research Question */}
            <div className="canvas-field-group">
              <label className="canvas-field-label">Research Question (optional)</label>
              <input
                type="text"
                className="canvas-field-input"
                placeholder="e.g., How does brand perception differ across age groups in the UK?"
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
              />
            </div>

            {/* Hypothesis */}
            <div className="canvas-field-group">
              <label className="canvas-field-label">Hypothesis (optional)</label>
              <input
                type="text"
                className="canvas-field-input"
                placeholder="e.g., Younger audiences have higher brand awareness through social media"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
              />
            </div>

            <div className="goals-grid">
              {goals.map((goal: Goal) => {
                const isSelected: boolean = canvasGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    className={`goal-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleGoal(goal.id)}
                  >
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

            {/* Custom Goals */}
            <div className="canvas-custom-goals">
              <label className="canvas-field-label">Custom Goals</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                <input
                  type="text"
                  className="canvas-field-input"
                  placeholder="Add a custom research goal..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomGoal()}
                  style={{ flex: 1 }}
                />
                <Button variant="secondary" onClick={addCustomGoal} disabled={!customGoal.trim()}>
                  <Plus size={14} />
                  Add
                </Button>
              </div>
              {customGoals.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                  {customGoals.map((cg) => (
                    <span key={cg} className="canvas-custom-goal-chip">
                      {cg}
                      <button onClick={() => removeCustomGoal(cg)}><Trash2 size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="canvas-actions">
              <Button
                variant="primary"
                iconRight={<ArrowRight size={18} />}
                disabled={canvasGoals.length === 0 && customGoals.length === 0}
                onClick={handleContinue}
              >
                Continue to Markets
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <Modal open={true} title="Research Templates" onClose={() => setShowTemplateModal(false)} size="lg">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-body-sm)' }}>
            Start with a pre-configured template to accelerate your research
          </p>
          <div className="canvas-template-grid">
            {mockTemplates.map((tpl) => (
              <button
                key={tpl.id}
                className={`canvas-template-card ${selectedTemplate === tpl.id ? 'selected' : ''}`}
                onClick={() => handleStartFromTemplate(tpl.id)}
              >
                <div className="canvas-template-icon">
                  <Zap size={20} />
                </div>
                <div className="canvas-template-body">
                  <h4>{tpl.name}</h4>
                  <p>{tpl.description}</p>
                  <div className="canvas-template-meta">
                    <span><Clock size={12} /> {tpl.estimated_duration}</span>
                    <span><Users size={12} /> {tpl.usage_count.toLocaleString()} uses</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
