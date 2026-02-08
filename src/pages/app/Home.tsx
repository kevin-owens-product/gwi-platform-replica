import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  ChevronDown,
  Send,
  ExternalLink,
  Loader2,
  LucideIcon,
  BarChart3,
  Grid3X3,
  LayoutDashboard,
  Search,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Zap,
  Clock,
  UserPlus,
  Pencil,
  Share2,
  Trash2,
  BookmarkPlus,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useSparkChat, useSparkConversations } from '@/hooks/useSpark';
import { formatRelativeDate } from '@/utils/format';
import './Home.css';

interface ExamplePrompt {
  label: string;
  icon: LucideIcon;
}

const examplePrompts: ExamplePrompt[] = [
  { label: 'Understanding GWI taxonomy', icon: ExternalLink },
  { label: 'Strategy and consumer trends', icon: ExternalLink },
  { label: 'Audience profiling', icon: ExternalLink },
  { label: 'Competitive positioning', icon: ExternalLink },
];

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  to: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Create Audience',
    description: 'Define and save a new target audience segment',
    icon: UserPlus,
    to: '/app/audiences/new',
    color: 'pink',
  },
  {
    label: 'Build Chart',
    description: 'Visualize data with customizable chart types',
    icon: BarChart3,
    to: '/app/chart-builder',
    color: 'blue',
  },
  {
    label: 'New Crosstab',
    description: 'Cross-tabulate data points for deep analysis',
    icon: Grid3X3,
    to: '/app/crosstabs/new',
    color: 'green',
  },
  {
    label: 'New Dashboard',
    description: 'Combine charts and insights into one view',
    icon: LayoutDashboard,
    to: '/app/dashboards',
    color: 'purple',
  },
  {
    label: 'Browse Questions',
    description: 'Explore the full GWI question taxonomy',
    icon: Search,
    to: '/app/chart-builder/questions',
    color: 'orange',
  },
  {
    label: 'View Reports',
    description: 'Access pre-built insight reports and analyses',
    icon: FileText,
    to: '/app/reports',
    color: 'teal',
  },
];

interface TrendingInsight {
  title: string;
  metric: string;
  change: string;
  direction: 'up' | 'down';
  category: string;
}

const trendingInsights: TrendingInsight[] = [
  {
    title: 'Social Media Usage',
    metric: 'Up 12%',
    change: '+12%',
    direction: 'up',
    category: 'Digital Behavior',
  },
  {
    title: 'Gen Z Brand Loyalty Index',
    metric: '142',
    change: '+8pts',
    direction: 'up',
    category: 'Brand Health',
  },
  {
    title: 'E-commerce Growth',
    metric: '+18% YoY',
    change: '+18%',
    direction: 'up',
    category: 'Commerce',
  },
  {
    title: 'Streaming Overtakes TV',
    metric: '25-34 Demo',
    change: '+23%',
    direction: 'up',
    category: 'Media Consumption',
  },
];

interface RecentActivity {
  id: string;
  action: string;
  item: string;
  timestamp: string;
  icon: LucideIcon;
  type: 'audience' | 'chart' | 'dashboard' | 'report' | 'crosstab';
}

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    action: 'Created audience',
    item: 'Gen Z Shoppers',
    timestamp: '2 hours ago',
    icon: UserPlus,
    type: 'audience',
  },
  {
    id: '2',
    action: 'Updated chart',
    item: 'Q4 Platform Usage',
    timestamp: '4 hours ago',
    icon: Pencil,
    type: 'chart',
  },
  {
    id: '3',
    action: 'Shared dashboard',
    item: 'Social Media Trends 2024',
    timestamp: 'Yesterday',
    icon: Share2,
    type: 'dashboard',
  },
  {
    id: '4',
    action: 'Bookmarked report',
    item: 'APAC Consumer Insights',
    timestamp: 'Yesterday',
    icon: BookmarkPlus,
    type: 'report',
  },
  {
    id: '5',
    action: 'Deleted crosstab',
    item: 'Legacy Brand Analysis',
    timestamp: '2 days ago',
    icon: Trash2,
    type: 'crosstab',
  },
];

interface PlatformStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

const platformStats: PlatformStat[] = [
  { label: 'Saved Audiences', value: '24', icon: Users },
  { label: 'Charts', value: '87', icon: BarChart3 },
  { label: 'Active Dashboards', value: '12', icon: LayoutDashboard },
  { label: 'Reports Available', value: '156', icon: FileText },
];

export default function Home(): React.JSX.Element {
  const [question, setQuestion] = useState<string>('');
  const [dataset, setDataset] = useState<string>('GWI Core');
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const sparkChat = useSparkChat();
  const { data: conversations, isLoading: conversationsLoading } = useSparkConversations();

  const firstName = user?.name?.split(' ')[0] ?? 'there';

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
        {/* Agent Spark Hero */}
        <div className="agent-spark-hero">
          <div className="agent-spark-avatar">
            <span className="wave-emoji">👋</span>
          </div>
          <h1 className="agent-spark-title">
            Hi {firstName}, what can<br />
            <span className="highlight">Agent Spark</span> help you with today?
          </h1>

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
        </div>

        {/* Example Prompts */}
        <div className="example-prompts-section">
          <div className="example-prompts-header">
            <span className="sparkle-icon">✨</span>
            <span>See example prompts from popular categories</span>
          </div>
          <div className="example-prompts-list">
            {examplePrompts.map((prompt: ExamplePrompt, index: number) => (
              <button key={index} className="example-prompt-btn">
                <span>{prompt.label}</span>
                <ExternalLink size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="platform-stats-section">
          {platformStats.map((stat: PlatformStat) => (
            <div key={stat.label} className="platform-stat-card">
              <div className="platform-stat-icon">
                <stat.icon size={20} />
              </div>
              <div className="platform-stat-info">
                <span className="platform-stat-value">{stat.value}</span>
                <span className="platform-stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-header">
            <Zap size={18} className="section-header-icon" />
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action: QuickAction) => (
              <Link
                key={action.label}
                to={action.to}
                className={`quick-action-card quick-action-card--${action.color}`}
              >
                <div className={`quick-action-icon quick-action-icon--${action.color}`}>
                  <action.icon size={22} />
                </div>
                <div className="quick-action-content">
                  <h3 className="quick-action-label">{action.label}</h3>
                  <p className="quick-action-description">{action.description}</p>
                </div>
                <ArrowUpRight size={16} className="quick-action-arrow" />
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Insights */}
        <div className="trending-insights-section">
          <div className="section-header">
            <Activity size={18} className="section-header-icon" />
            <h2 className="section-title">Trending Insights</h2>
          </div>
          <div className="trending-insights-grid">
            {trendingInsights.map((insight: TrendingInsight) => (
              <div key={insight.title} className="trending-insight-card">
                <div className="trending-insight-header">
                  <span className="trending-insight-category">{insight.category}</span>
                  <span className={`trending-insight-badge trending-insight-badge--${insight.direction}`}>
                    {insight.direction === 'up' ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>{insight.change}</span>
                  </span>
                </div>
                <h3 className="trending-insight-title">{insight.title}</h3>
                <p className="trending-insight-metric">{insight.metric}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="recent-section">
          <h2 className="recent-title">Most Recent</h2>
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

        {/* Recent Activity Timeline */}
        <div className="recent-activity-section">
          <div className="section-header">
            <Clock size={18} className="section-header-icon" />
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <div className="activity-timeline">
            {recentActivities.map((activity: RecentActivity) => (
              <div key={activity.id} className="activity-timeline-item">
                <div className="activity-timeline-line" />
                <div className={`activity-timeline-dot activity-timeline-dot--${activity.type}`}>
                  <activity.icon size={14} />
                </div>
                <div className="activity-timeline-content">
                  <p className="activity-timeline-text">
                    <span className="activity-timeline-action">{activity.action}</span>
                    {' '}
                    <span className="activity-timeline-item-name">'{activity.item}'</span>
                  </p>
                  <span className="activity-timeline-timestamp">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
