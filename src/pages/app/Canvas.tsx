import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Target, Users, ArrowRight, BarChart2, TrendingUp, ShoppingCart, Tv, Shield, Globe, LucideIcon } from 'lucide-react';
import { Button } from '@/components/shared';
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
  { id: 'brand', label: 'Brand Awareness', desc: 'Measure and track brand recognition', icon: Shield },
  { id: 'trends', label: 'Market Trends', desc: 'Identify emerging consumer trends', icon: TrendingUp },
  { id: 'competitor', label: 'Competitor Analysis', desc: 'Benchmark against competitors', icon: BarChart2 },
  { id: 'behavior', label: 'Consumer Behavior', desc: 'Understand purchasing patterns', icon: ShoppingCart },
  { id: 'purchase', label: 'Purchase Intent', desc: 'Predict future buying decisions', icon: Globe },
  { id: 'media', label: 'Media Consumption', desc: 'Analyze media habits and preferences', icon: Tv },
];

export default function Canvas(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canvasGoals = useWorkspaceStore((state) => state.canvasGoals);
  const setCanvasGoals = useWorkspaceStore((state) => state.setCanvasGoals);
  const isGoalsStep: boolean = location.pathname.includes('goals') || location.pathname === '/app/canvas';

  const greeting = user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome';

  const toggleGoal = (id: string): void => {
    const next = canvasGoals.includes(id)
      ? canvasGoals.filter((g) => g !== id)
      : [...canvasGoals, id];
    setCanvasGoals(next);
  };

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <h1 className="page-title">Canvas</h1>
        <p className="page-subtitle">{greeting} -- Define your research objectives and target audiences</p>
      </div>

      <div className="canvas-steps">
        <div className={`step ${isGoalsStep ? 'active' : 'completed'}`}>
          <div className="step-number">1</div>
          <div className="step-info">
            <h3>Define Goals</h3>
            <p>What do you want to learn?</p>
          </div>
        </div>
        <div className="step-connector" />
        <Link to="/app/canvas/audiences" className={`step ${!isGoalsStep ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-info">
            <h3>Define Audiences</h3>
            <p>Who do you want to study?</p>
          </div>
        </Link>
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
    </div>
  );
}
