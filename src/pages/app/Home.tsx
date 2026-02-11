import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, ChevronDown, Send, ExternalLink, Loader2, LucideIcon,
  BarChart3, PieChart, Table2, LayoutDashboard, Microscope, FileText,
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Bell,
  X, Eye, Activity, Clock, User, Sparkles, ArrowRight, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useSparkChat, useSparkConversations } from '@/hooks/useSpark';
import { useAgenticRuns } from '@/hooks/useAgentic';
import { formatRelativeDate } from '@/utils/format';
import { Badge } from '@/components/shared';
import { getFeaturedAgents } from '@/data/agents';
import './Home.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

const featuredAgents = getFeaturedAgents(4);
const MAX_AGENTIC_RUNS = 3;

const suggestedPrompts = [
  'What are the top social media trends?',
  'Compare Gen Z vs Millennials',
  'Analyze brand health metrics',
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

const INITIAL_INSIGHTS_COUNT = 2;

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
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const sparkChat = useSparkChat();
  const { data: conversations, isLoading: conversationsLoading } = useSparkConversations();
  const { data: agenticRuns } = useAgenticRuns();

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const visibleInsights = mockInsights.filter((ins) => !dismissedInsights.has(ins.id));
  const displayedInsights = insightsExpanded
    ? visibleInsights
    : visibleInsights.slice(0, INITIAL_INSIGHTS_COUNT);
  const hiddenInsightsCount = visibleInsights.length - INITIAL_INSIGHTS_COUNT;
  const recentAgenticRuns = (agenticRuns ?? []).slice(0, MAX_AGENTIC_RUNS);

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

  const handlePromptClick = (prompt: string) => {
    setQuestion(prompt);
  };

  return (
    <div className="home-page">
      <div className="home-content">

        {/* ---- HERO: Focused AI Input ---- */}
        <section className="home-hero">
          <div className="home-hero-inner">
            <div className="agent-spark-hero-row">
              <div className="agent-spark-avatar agent-spark-avatar--sm">
                <span className="wave-emoji">👋</span>
              </div>
              <div className="agent-spark-hero-text">
                <h1 className="agent-spark-title agent-spark-title--compact">
                  Hi {firstName}, <span className="highlight">your AI agents</span> are ready
                </h1>
              </div>
            </div>

            <div className="agent-spark-input-container">
              <input
                type="text"
                className="agent-spark-input"
                placeholder="Ask your AI agents a question"
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

            {/* Suggested prompt pills */}
            <div className="suggested-prompts">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="suggested-prompt-pill"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <Sparkles size={12} />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---- QUICK ACTIONS: Lightweight horizontal row ---- */}
        <section className="home-quick-actions">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.path} className="home-quick-action-btn">
              <action.icon size={16} />
              <span>{action.label}</span>
            </Link>
          ))}
        </section>

        {/* ---- FEATURED AGENTS: Compact horizontal strip ---- */}
        <section className="home-featured-agents">
          <div className="home-section-header">
            <div className="home-section-header-left">
              <Sparkles size={16} />
              <h2 className="home-section-title">Featured Agents</h2>
            </div>
            <Link to="/app/agent-catalog" className="home-section-link">
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="featured-agents-strip">
            {featuredAgents.map((agent) => {
              const IconComp = agent.icon;
              return (
                <button
                  key={agent.id}
                  className="featured-agent-strip-card"
                  onClick={() => navigate(`/app/agent-spark?agent=${agent.id}`)}
                >
                  <div
                    className="featured-agent-strip-icon"
                    style={{ background: agent.iconBg, color: agent.iconColor }}
                  >
                    <IconComp size={16} />
                  </div>
                  <div className="featured-agent-strip-info">
                    <span className="featured-agent-strip-name">{agent.name}</span>
                    <span className="featured-agent-strip-desc">{agent.examplePrompt}</span>
                  </div>
                  <ChevronRight size={14} className="featured-agent-strip-arrow" />
                </button>
              );
            })}
          </div>
        </section>

        {/* ---- KPI WIDGETS ---- */}
        <section className="home-kpi-section">
          <div className="home-section-header">
            <div className="home-section-header-left">
              <Activity size={16} />
              <h2 className="home-section-title">Your Workspace</h2>
            </div>
          </div>
          <div className="kpi-widgets">
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
          </div>
        </section>

        {/* ---- AGENTIC WORKSPACE ---- */}
        <section className="agentic-workspace">
          <div className="home-section-header">
            <div className="home-section-header-left">
              <Sparkles size={16} />
              <h2 className="home-section-title">Agentic Workspace</h2>
            </div>
            <Link to="/app/agent-catalog" className="home-section-link">
              View flows
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="agentic-workspace-grid">
            {recentAgenticRuns.map((run) => (
              <div key={run.id} className="agentic-workspace-card">
                <div className="agentic-workspace-card-title">{run.brief}</div>
                <div className="agentic-workspace-card-meta">
                  Flow: {run.flow_id} • Status: {run.status}
                </div>
                <div className="agentic-workspace-card-outputs">
                  {run.outputs.map((output) => (
                    <span key={output.id} className="agentic-workspace-pill">
                      {output.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {recentAgenticRuns.length === 0 && (
              <div className="agentic-workspace-empty">No agentic runs yet</div>
            )}
          </div>
        </section>

        {/* ---- FEEDS (two-column) ---- */}
        <div className="home-feeds">
          {/* Left column: Recent Activity */}
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

          {/* Right column: Insights + Conversations */}
          <div className="home-feeds__sidebar">
            {/* Proactive Insights */}
            {visibleInsights.length > 0 && (
              <section className="insights-panel">
                <div className="insights-panel-header">
                  <Sparkles size={18} />
                  <h2 className="insights-panel-title">Proactive Insights</h2>
                  <span className="insights-panel-count">{visibleInsights.length}</span>
                </div>
                <div className="insights-grid">
                  {displayedInsights.map((insight) => {
                    const IconComp = insightIconMap[insight.type];
                    return (
                      <div key={insight.id} className={`insight-card ${severityClassMap[insight.severity]}`}>
                        <div className="insight-card-header">
                          <div className="insight-card-icon">
                            <IconComp size={16} />
                          </div>
                          <div className="insight-card-header-right">
                            <Badge variant={insight.severity === 'critical' ? 'danger' : insight.severity === 'important' ? 'warning' : insight.severity === 'notable' ? 'info' : 'default'}>
                              {insight.type}
                            </Badge>
                            <span className={`insight-metric-value insight-metric--${insight.metricDirection}`}>
                              {insight.metricDirection === 'up' && <TrendingUp size={12} />}
                              {insight.metricDirection === 'down' && <TrendingDown size={12} />}
                              {insight.metricChange}
                            </span>
                          </div>
                        </div>
                        <h3 className="insight-card-title">{insight.title}</h3>
                        <p className="insight-card-desc">{insight.description}</p>
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
                {!insightsExpanded && hiddenInsightsCount > 0 && (
                  <button
                    className="insights-show-more"
                    onClick={() => setInsightsExpanded(true)}
                  >
                    Show {hiddenInsightsCount} more
                  </button>
                )}
                {insightsExpanded && visibleInsights.length > INITIAL_INSIGHTS_COUNT && (
                  <button
                    className="insights-show-more"
                    onClick={() => setInsightsExpanded(false)}
                  >
                    Show less
                  </button>
                )}
              </section>
            )}

            {/* Recent Spark Conversations */}
            <section className="recent-conversations-panel">
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
