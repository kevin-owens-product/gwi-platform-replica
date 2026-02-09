import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, ChevronDown, Send, ExternalLink, Loader2, LucideIcon,
  BarChart3, PieChart, Table2, LayoutDashboard, Microscope, FileText,
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Bell,
  X, Eye, Activity, Clock, User, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useSparkChat, useSparkConversations } from '@/hooks/useSpark';
import { formatRelativeDate } from '@/utils/format';
import { Badge } from '@/components/shared';
import './Home.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExamplePrompt {
  label: string;
  prompt: string;
  icon: LucideIcon;
}

type InsightSeverity = 'info' | 'notable' | 'important' | 'critical';
type InsightType = 'anomaly' | 'trend' | 'opportunity' | 'alert' | 'recommendation';

interface ProactiveInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  metricChange: string;
  metricDirection: 'up' | 'down' | 'neutral';
}

interface QuickAction {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface ActivityItem {
  id: string;
  name: string;
  type: 'chart' | 'crosstab' | 'dashboard' | 'audience' | 'report';
  date: string;
  author: string;
}

interface KpiWidget {
  label: string;
  count: number;
  trend: number[];
  change: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const examplePrompts: ExamplePrompt[] = [
  { label: 'Understanding GWI taxonomy', prompt: 'Explain the GWI taxonomy structure and how questions, datapoints, and waves are organized', icon: ExternalLink },
  { label: 'Strategy and consumer trends', prompt: 'What are the key consumer trends across markets for Q4 2024?', icon: ExternalLink },
  { label: 'Audience profiling', prompt: 'Help me build a profile of Gen Z social media users and their key behaviors', icon: ExternalLink },
  { label: 'Competitive positioning', prompt: 'How can I use GWI data to analyze competitive brand positioning?', icon: ExternalLink },
];

const mockInsights: ProactiveInsight[] = [
  {
    id: 'ins-1',
    type: 'anomaly',
    severity: 'critical',
    title: 'Social media usage spike in APAC',
    description: 'TikTok daily active usage among 18-24 in APAC jumped 23% week-over-week, significantly above seasonal norms.',
    metricChange: '+23%',
    metricDirection: 'up',
  },
  {
    id: 'ins-2',
    type: 'trend',
    severity: 'important',
    title: 'Declining TV viewership in Europe',
    description: 'Linear TV consumption in the 25-34 demographic has dropped for the 4th consecutive quarter across EU5 markets.',
    metricChange: '-8.2%',
    metricDirection: 'down',
  },
  {
    id: 'ins-3',
    type: 'opportunity',
    severity: 'notable',
    title: 'Podcast ad receptivity rising',
    description: 'Consumers who listen to podcasts weekly show 2.1x higher ad recall. Consider shifting audio budget allocation.',
    metricChange: '+2.1x',
    metricDirection: 'up',
  },
  {
    id: 'ins-4',
    type: 'recommendation',
    severity: 'info',
    title: 'Audience overlap detected',
    description: 'Your "Tech Enthusiasts" and "Early Adopters" audiences share 74% overlap. Consider merging or refining.',
    metricChange: '74%',
    metricDirection: 'neutral',
  },
];

const quickActions: QuickAction[] = [
  { label: 'Create Chart', icon: BarChart3, path: '/app/charts' },
  { label: 'Create Audience', icon: Users, path: '/app/audiences' },
  { label: 'New Crosstab', icon: Table2, path: '/app/crosstab' },
  { label: 'New Dashboard', icon: LayoutDashboard, path: '/app/dashboards' },
  { label: 'Start Research', icon: Microscope, path: '/app/canvas' },
  { label: 'View Reports', icon: FileText, path: '/app/reports' },
];

const mockActivity: ActivityItem[] = [
  { id: 'act-1', name: 'Q4 Social Media Trends', type: 'chart', date: '2026-02-08T10:30:00Z', author: 'You' },
  { id: 'act-2', name: 'Gen Z vs Millennials', type: 'crosstab', date: '2026-02-07T16:45:00Z', author: 'You' },
  { id: 'act-3', name: 'Brand Health Dashboard', type: 'dashboard', date: '2026-02-07T09:15:00Z', author: 'Sarah Chen' },
  { id: 'act-4', name: 'Fitness Enthusiasts 18-34', type: 'audience', date: '2026-02-06T14:20:00Z', author: 'You' },
  { id: 'act-5', name: 'Monthly Insights Report', type: 'report', date: '2026-02-05T11:00:00Z', author: 'James Park' },
];

const kpiWidgets: KpiWidget[] = [
  { label: 'Total Audiences', count: 24, trend: [18, 19, 20, 21, 22, 23, 24], change: 12 },
  { label: 'Total Charts', count: 156, trend: [120, 128, 135, 140, 148, 152, 156], change: 8 },
  { label: 'Active Dashboards', count: 12, trend: [8, 9, 9, 10, 11, 11, 12], change: 20 },
  { label: 'Research Projects', count: 7, trend: [3, 4, 4, 5, 6, 6, 7], change: 17 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const insightIconMap: Record<InsightType, LucideIcon> = {
  anomaly: AlertTriangle,
  trend: TrendingUp,
  opportunity: Lightbulb,
  alert: Bell,
  recommendation: Target,
};

const severityClassMap: Record<InsightSeverity, string> = {
  info: 'insight-card--info',
  notable: 'insight-card--notable',
  important: 'insight-card--important',
  critical: 'insight-card--critical',
};

const activityIconMap: Record<string, LucideIcon> = {
  chart: BarChart3,
  crosstab: Table2,
  dashboard: LayoutDashboard,
  audience: Users,
  report: FileText,
};

const activityBadgeVariant: Record<string, 'primary' | 'info' | 'success' | 'warning' | 'default'> = {
  chart: 'primary',
  crosstab: 'info',
  dashboard: 'success',
  audience: 'warning',
  report: 'default',
};

function MiniSparkline({ data, color = 'var(--color-primary)' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mini-sparkline">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Home(): React.JSX.Element {
  const [question, setQuestion] = useState<string>('');
  const [dataset, setDataset] = useState<string>('GWI Core');
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const sparkChat = useSparkChat();
  const { data: conversations, isLoading: conversationsLoading } = useSparkConversations();

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const visibleInsights = mockInsights.filter((ins) => !dismissedInsights.has(ins.id));

  const handleDismissInsight = (id: string) => {
    setDismissedInsights((prev) => new Set(prev).add(id));
  };

  const handleSend = () => {
    if (!question.trim() || sparkChat.isPending) return;

    sparkChat.mutate(
      { message: question.trim() },
      {
        onSuccess: (response) => {
          navigate(`/app/agent-spark/${response.conversation_id}`);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">

        {/* ---- Proactive Insights Panel ---- */}
        {visibleInsights.length > 0 && (
          <section className="insights-panel">
            <div className="insights-panel-header">
              <Sparkles size={18} />
              <h2 className="insights-panel-title">Proactive Insights</h2>
              <span className="insights-panel-count">{visibleInsights.length}</span>
            </div>
            <div className="insights-grid">
              {visibleInsights.map((insight) => {
                const IconComp = insightIconMap[insight.type];
                return (
                  <div key={insight.id} className={`insight-card ${severityClassMap[insight.severity]}`}>
                    <div className="insight-card-header">
                      <div className="insight-card-icon">
                        <IconComp size={16} />
                      </div>
                      <Badge variant={insight.severity === 'critical' ? 'danger' : insight.severity === 'important' ? 'warning' : insight.severity === 'notable' ? 'info' : 'default'}>
                        {insight.type}
                      </Badge>
                    </div>
                    <h3 className="insight-card-title">{insight.title}</h3>
                    <p className="insight-card-desc">{insight.description}</p>
                    <div className="insight-card-metric">
                      <span className={`insight-metric-value insight-metric--${insight.metricDirection}`}>
                        {insight.metricDirection === 'up' && <TrendingUp size={14} />}
                        {insight.metricDirection === 'down' && <TrendingDown size={14} />}
                        {insight.metricChange}
                      </span>
                    </div>
                    <div className="insight-card-actions">
                      <button className="insight-action-btn insight-action-btn--primary">
                        <Eye size={14} />
                        View Details
                      </button>
                      <button
                        className="insight-action-btn insight-action-btn--dismiss"
                        onClick={() => handleDismissInsight(insight.id)}
                      >
                        <X size={14} />
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ---- Dashboard Summary KPI Widgets ---- */}
        <section className="kpi-widgets">
          {kpiWidgets.map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <div className="kpi-card-info">
                <span className="kpi-card-count">{kpi.count}</span>
                <span className="kpi-card-label">{kpi.label}</span>
              </div>
              <div className="kpi-card-right">
                <MiniSparkline data={kpi.trend} />
                <span className={`kpi-card-change ${kpi.change >= 0 ? 'kpi-card-change--up' : 'kpi-card-change--down'}`}>
                  {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* ---- Quick Actions Bar ---- */}
        <section className="quick-actions">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.path} className="quick-action-btn">
              <action.icon size={20} />
              <span>{action.label}</span>
            </Link>
          ))}
        </section>

        {/* ---- Agent Spark Hero (compact) ---- */}
        <div className="agent-spark-hero agent-spark-hero--compact">
          <div className="agent-spark-hero-row">
            <div className="agent-spark-avatar agent-spark-avatar--sm">
              <span className="wave-emoji">👋</span>
            </div>
            <div className="agent-spark-hero-text">
              <h1 className="agent-spark-title agent-spark-title--compact">
                Hi {firstName}, what can <span className="highlight">Agent Spark</span> help you with?
              </h1>
            </div>
          </div>

          {/* Input Area */}
          <div className="agent-spark-input-container">
            <input
              type="text"
              className="agent-spark-input"
              placeholder="Ask Agent Spark a question"
              value={question}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sparkChat.isPending}
            />
            <div className="agent-spark-input-actions">
              <button className="add-audience-btn">
                <Users size={16} />
                <span>Add audience</span>
              </button>
              <div className="agent-spark-input-right">
                <button className="dataset-selector">
                  <span>{dataset}</span>
                  <ChevronDown size={16} />
                </button>
                <button
                  className="send-btn"
                  disabled={!question.trim() || sparkChat.isPending}
                  onClick={handleSend}
                >
                  {sparkChat.isPending ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="agent-spark-disclaimer">
            AI can make mistakes. Consider checking important information.
          </p>

          {/* Example Prompts (inline) */}
          <div className="example-prompts-inline">
            <div className="example-prompts-header">
              <span className="sparkle-icon">✨</span>
              <span>Example prompts</span>
            </div>
            <div className="example-prompts-list">
              {examplePrompts.map((prompt: ExamplePrompt, index: number) => (
                <button
                  key={index}
                  className="example-prompt-btn"
                  onClick={() => navigate(`/app/agent-spark?prompt=${encodeURIComponent(prompt.prompt)}`)}
                >
                  <span>{prompt.label}</span>
                  <ExternalLink size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Recent Activity Feed ---- */}
        <section className="activity-feed">
          <div className="activity-feed-header">
            <Activity size={18} />
            <h2 className="activity-feed-title">Recent Activity</h2>
            <Link to="/app/dashboards" className="activity-feed-viewall">View all</Link>
          </div>
          <div className="activity-feed-list">
            {mockActivity.map((item) => {
              const IconComp = activityIconMap[item.type] || FileText;
              return (
                <div key={item.id} className="activity-feed-item">
                  <div className="activity-feed-item-icon">
                    <IconComp size={16} />
                  </div>
                  <div className="activity-feed-item-content">
                    <span className="activity-feed-item-name">{item.name}</span>
                    <div className="activity-feed-item-meta">
                      <Badge variant={activityBadgeVariant[item.type] || 'default'}>{item.type}</Badge>
                      <span className="activity-feed-item-date">
                        <Clock size={12} />
                        {formatRelativeDate(item.date)}
                      </span>
                      <span className="activity-feed-item-author">
                        <User size={12} />
                        {item.author}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---- Recent Spark Conversations ---- */}
        <div className="recent-section">
          <h2 className="recent-title">Recent Conversations</h2>
          <div className="recent-list">
            {conversationsLoading ? (
              <div className="recent-item" style={{ justifyContent: 'center' }}>
                <Loader2 size={20} className="spin" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.slice(0, 5).map((chat) => (
                <Link key={chat.id} to={`/app/agent-spark/${chat.id}`} className="recent-item">
                  <div className="recent-item-icon">
                    <span className="sparkle-icon small">✨</span>
                  </div>
                  <div className="recent-item-content">
                    <h3 className="recent-item-title">{chat.title}</h3>
                    <p className="recent-item-date">{formatRelativeDate(chat.updated_at)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="recent-item">
                <div className="recent-item-content">
                  <p className="recent-item-date">No recent conversations yet. Ask a question above to get started.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
