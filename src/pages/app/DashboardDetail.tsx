import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Plus, TrendingUp, TrendingDown, Edit, Save, Loader2, Users, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDashboard, useUpdateDashboard } from '@/hooks/useDashboards';
import { useAudiences } from '@/hooks/useAudiences';
import { useQuestions } from '@/hooks/useTaxonomy';
import { useCharts } from '@/hooks/useCharts';
import DashboardGrid, { WidgetChart } from '@/components/dashboard/DashboardGrid';
import { Button, Modal, EmptyState, BaseAudiencePicker, getBaseAudienceLabel } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { DashboardWidget, AudienceExpression, AudienceQuestion, Audience } from '@/api/types';
import './DashboardDetail.css';

// --- Mock data used as fallback when API returns no widgets ---

interface KpiItem {
  id: number;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  sparkline: number[];
}

interface BarChartItem {
  label: string;
  value: number;
  color: string;
}

interface LineChartPoint {
  label: string;
  values: [number, number];
}

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface DonutSlice extends DonutItem {
  path: string;
}

interface TableRow {
  market: string;
  reach: string;
  engagement: string;
  awareness: string;
  trend: string;
}

interface SparkLineProps {
  data: number[];
  positive: boolean;
}

const kpiData: KpiItem[] = [
  { id: 1, title: 'Total Reach', value: '2.4M', change: '+12.3%', positive: true, sparkline: [30, 35, 32, 40, 38, 45, 50, 48, 55, 60] },
  { id: 2, title: 'Engagement Rate', value: '4.8%', change: '+0.5%', positive: true, sparkline: [20, 22, 21, 25, 28, 26, 30, 32, 35, 38] },
  { id: 3, title: 'Brand Awareness', value: '68%', change: '+3.2%', positive: true, sparkline: [45, 48, 50, 52, 55, 58, 60, 62, 65, 68] },
  { id: 4, title: 'Cost per Click', value: '$1.24', change: '-8.1%', positive: false, sparkline: [50, 48, 45, 42, 40, 38, 35, 32, 30, 28] },
];

const barChartData: BarChartItem[] = [
  { label: 'Instagram', value: 78, color: '#E31C79' },
  { label: 'TikTok', value: 65, color: '#0ea5e9' },
  { label: 'YouTube', value: 82, color: '#22c55e' },
  { label: 'Facebook', value: 45, color: '#8b5cf6' },
  { label: 'Twitter/X', value: 42, color: '#f59e0b' },
  { label: 'LinkedIn', value: 28, color: '#6366f1' },
];

const lineChartPoints: LineChartPoint[] = [
  { label: 'Jan', values: [42, 35] },
  { label: 'Feb', values: [45, 38] },
  { label: 'Mar', values: [48, 40] },
  { label: 'Apr', values: [52, 42] },
  { label: 'May', values: [55, 45] },
  { label: 'Jun', values: [58, 48] },
  { label: 'Jul', values: [62, 50] },
  { label: 'Aug', values: [60, 52] },
  { label: 'Sep', values: [65, 55] },
  { label: 'Oct', values: [68, 58] },
  { label: 'Nov', values: [72, 60] },
  { label: 'Dec', values: [75, 62] },
];

const donutData: DonutItem[] = [
  { label: '18-24', value: 28, color: '#E31C79' },
  { label: '25-34', value: 35, color: '#0ea5e9' },
  { label: '35-44', value: 22, color: '#22c55e' },
  { label: '45-54', value: 10, color: '#8b5cf6' },
  { label: '55+', value: 5, color: '#f59e0b' },
];

const tableData: TableRow[] = [
  { market: 'United States', reach: '845K', engagement: '5.2%', awareness: '72%', trend: '+4.1%' },
  { market: 'United Kingdom', reach: '312K', engagement: '4.8%', awareness: '68%', trend: '+3.5%' },
  { market: 'Germany', reach: '256K', engagement: '3.9%', awareness: '61%', trend: '+2.8%' },
  { market: 'France', reach: '198K', engagement: '4.1%', awareness: '58%', trend: '+1.9%' },
  { market: 'Japan', reach: '178K', engagement: '3.5%', awareness: '52%', trend: '+5.2%' },
];

// --- Static chart sub-components for fallback display ---

function SparkLine({ data, positive }: SparkLineProps): React.JSX.Element {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v: number, i: number) => `${(i / (data.length - 1)) * 60},${30 - ((v - min) / range) * 25}`).join(' ');
  return (
    <svg viewBox="0 0 60 30" className="sparkline-svg">
      <polyline points={points} fill="none" stroke={positive ? 'var(--color-success)' : 'var(--color-error)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarWidget(): React.JSX.Element {
  const maxVal = Math.max(...barChartData.map((d: BarChartItem) => d.value));
  return (
    <svg viewBox="0 0 400 200" className="widget-svg">
      {barChartData.map((d: BarChartItem, i: number) => {
        const barH = (d.value / maxVal) * 140;
        const x = i * 65 + 15;
        return (
          <g key={i}>
            <rect x={x} y={200 - barH - 30} width="45" height={barH} rx="4" fill={d.color} opacity="0.8">
              <title>{d.label}: {d.value}%</title>
            </rect>
            <text x={x + 22.5} y={200 - barH - 36} textAnchor="middle" fontSize="11" fontWeight="600" fill="#191530">{d.value}%</text>
            <text x={x + 22.5} y={195} textAnchor="middle" fontSize="9" fill="#6b7280">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineWidget(): React.JSX.Element {
  const maxVal = 80;
  const chartW = 400, chartH = 200, padL = 30, padB = 25, padT = 10, padR = 10;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const getX = (i: number): number => padL + (i / (lineChartPoints.length - 1)) * plotW;
  const getY = (v: number): number => padT + plotH - (v / maxVal) * plotH;
  const colors: [string, string] = ['#E31C79', '#0ea5e9'];
  const labels: [string, string] = ['Brand A', 'Brand B'];

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="widget-svg">
      {[0, 20, 40, 60, 80].map((v: number) => (
        <g key={v}>
          <line x1={padL} y1={getY(v)} x2={chartW - padR} y2={getY(v)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={padL - 6} y={getY(v) + 3} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
        </g>
      ))}
      {lineChartPoints.filter((_: LineChartPoint, i: number) => i % 2 === 0).map((d: LineChartPoint, i: number) => (
        <text key={i} x={getX(i * 2)} y={chartH - 5} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.label}</text>
      ))}
      {([0, 1] as const).map((si: number) => {
        const pts = lineChartPoints.map((d: LineChartPoint, i: number) => `${getX(i)},${getY(d.values[si])}`).join(' ');
        const fillPts = lineChartPoints.map((d: LineChartPoint, i: number) => `${getX(i)},${getY(d.values[si])}`).join(' ');
        return (
          <g key={si}>
            <polygon points={`${fillPts} ${getX(lineChartPoints.length - 1)},${padT + plotH} ${padL},${padT + plotH}`} fill={colors[si]} opacity="0.06" />
            <polyline points={pts} fill="none" stroke={colors[si]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      <g className="widget-legend" transform={`translate(${chartW - 130}, 8)`}>
        {labels.map((l: string, i: number) => (
          <g key={i} transform={`translate(${i * 65}, 0)`}>
            <circle cx="5" cy="5" r="4" fill={colors[i]} />
            <text x="14" y="9" fontSize="9" fill="#6b7280">{l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function DonutWidget(): React.JSX.Element {
  const total = donutData.reduce((s: number, d: DonutItem) => s + d.value, 0);
  const cx = 80, cy = 80, r = 60, ir = 38;
  let cumAngle = -90;
  const slices: DonutSlice[] = donutData.map((d: DonutItem) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const s1 = (startAngle * Math.PI) / 180, e1 = (endAngle * Math.PI) / 180;
    const x1o = cx + r * Math.cos(s1), y1o = cy + r * Math.sin(s1);
    const x2o = cx + r * Math.cos(e1), y2o = cy + r * Math.sin(e1);
    const x1i = cx + ir * Math.cos(e1), y1i = cy + ir * Math.sin(e1);
    const x2i = cx + ir * Math.cos(s1), y2i = cy + ir * Math.sin(s1);
    const lg = angle > 180 ? 1 : 0;
    return { ...d, path: `M ${x1o} ${y1o} A ${r} ${r} 0 ${lg} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${ir} ${ir} 0 ${lg} 0 ${x2i} ${y2i} Z` };
  });

  return (
    <div className="donut-widget-container">
      <svg viewBox="0 0 160 160" className="donut-svg">
        {slices.map((s: DonutSlice, i: number) => <path key={i} d={s.path} fill={s.color} opacity="0.85"><title>{s.label}: {s.value}%</title></path>)}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="700" fill="#191530">100%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9ca3af">Audience</text>
      </svg>
      <div className="donut-legend">
        {donutData.map((d: DonutItem, i: number) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-legend-dot" style={{ backgroundColor: d.color }} />
            <span className="donut-legend-label">{d.label}</span>
            <span className="donut-legend-value">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Fallback content rendered when there are no widgets from the API ---
// Kept in the file but no longer rendered — replaced by EmptyState below.

function FallbackDashboardContent(): React.JSX.Element {
  return (
    <>
      <div className="kpi-grid">
        {kpiData.map((kpi: KpiItem) => (
          <div key={kpi.id} className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-title">{kpi.title}</span>
              <SparkLine data={kpi.sparkline} positive={kpi.positive} />
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className={`kpi-change ${kpi.positive ? 'positive' : 'negative'}`}>
              {kpi.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{kpi.change}</span>
              <span className="kpi-period">vs last quarter</span>
            </div>
          </div>
        ))}
      </div>

      <div className="widget-grid-2col">
        <div className="large-widget">
          <div className="widget-header-bar">
            <h3>Reach Over Time</h3>
            <span className="widget-badge">Monthly</span>
          </div>
          <LineWidget />
        </div>
        <div className="large-widget">
          <div className="widget-header-bar">
            <h3>Platform Usage</h3>
            <span className="widget-badge">Q4 2024</span>
          </div>
          <BarWidget />
        </div>
      </div>

      <div className="widget-grid-2col">
        <div className="large-widget">
          <div className="widget-header-bar">
            <h3>Audience Age Distribution</h3>
            <span className="widget-badge">All Markets</span>
          </div>
          <DonutWidget />
        </div>
        <div className="large-widget">
          <div className="widget-header-bar">
            <h3>Performance by Market</h3>
            <span className="widget-badge">Top 5</span>
          </div>
          <table className="widget-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Reach</th>
                <th>Engagement</th>
                <th>Awareness</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row: TableRow) => (
                <tr key={row.market}>
                  <td className="wt-market">{row.market}</td>
                  <td>{row.reach}</td>
                  <td>{row.engagement}</td>
                  <td>{row.awareness}</td>
                  <td className="wt-trend positive">{row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Suppress unused warning — kept intentionally
void FallbackDashboardContent;

// --- Main component ---

export default function DashboardDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { data: dashboard, isLoading, isError } = useDashboard(id ?? '');
  const updateDashboard = useUpdateDashboard();

  // Fetch audience and question data for the picker
  const { data: audienceResponse } = useAudiences({ per_page: 50 });
  const { data: questionsResponse } = useQuestions({ per_page: 100 });
  const audiences = useMemo(() => audienceResponse?.data ?? [], [audienceResponse]);
  const questions = useMemo(() => questionsResponse?.data ?? [], [questionsResponse]);

  // Fetch charts for add-widget chart selector
  const { data: chartsResponse } = useCharts({ per_page: 50 });
  const chartsList = useMemo(() => chartsResponse?.data ?? [], [chartsResponse]);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [dashboardName, setDashboardName] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [baseAudience, setBaseAudience] = useState<AudienceExpression | undefined>(undefined);
  const [audiencePickerOpen, setAudiencePickerOpen] = useState(false);

  // Add widget modal state
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [widgetType, setWidgetType] = useState<'chart' | 'stat' | 'text'>('chart');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetChartId, setWidgetChartId] = useState('');
  const [widgetTextContent, setWidgetTextContent] = useState('');

  // Widget maximize state
  const [maximizedWidgetId, setMaximizedWidgetId] = useState<string | null>(null);

  // Seed base audience from dashboard data when it loads
  useEffect(() => {
    if (dashboard?.base_audience) {
      setBaseAudience(dashboard.base_audience);
    }
  }, [dashboard?.base_audience]);

  // Sync name from API data when it loads
  const displayName = dashboardName || dashboard?.name || 'Untitled Dashboard';

  const hasApiWidgets = (dashboard?.widgets?.length ?? 0) > 0;

  // Derive display label for the current base audience
  const baseAudienceLabel = useMemo(
    () => getBaseAudienceLabel(baseAudience, audiences, questions),
    [baseAudience, audiences, questions],
  );

  // Find maximized widget
  const maximizedWidget = useMemo(
    () => dashboard?.widgets?.find((w) => w.id === maximizedWidgetId),
    [dashboard?.widgets, maximizedWidgetId],
  );

  // Base audience picker handlers
  const handleBaseSelectSaved = (aud: Audience) => {
    setBaseAudience(aud.expression);
    if (id) {
      updateDashboard.mutate({ id, data: { base_audience: aud.expression } });
    }
  };

  const handleBaseApplyQuestion = (expr: AudienceQuestion) => {
    setBaseAudience(expr);
    if (id) {
      updateDashboard.mutate({ id, data: { base_audience: expr } });
    }
  };

  const handleBaseClear = () => {
    setBaseAudience(undefined);
    if (id) {
      updateDashboard.mutate({ id, data: { base_audience: undefined } });
    }
  };

  const handleSave = () => {
    if (!id) return;
    updateDashboard.mutate(
      { id, data: { name: dashboardName || undefined, base_audience: baseAudience } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!id || !dashboard) return;
    const updatedWidgets = dashboard.widgets.filter((w: DashboardWidget) => w.id !== widgetId);
    updateDashboard.mutate({ id, data: { widgets: updatedWidgets } });
  };

  // Add widget handler
  const handleAddWidget = () => {
    if (!id || !dashboard) return;

    // Auto-position below existing widgets
    const maxY = dashboard.widgets.reduce((max, w) => Math.max(max, w.position.y + w.position.h), 0);

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}`,
      type: widgetType,
      title: widgetTitle || (widgetType === 'chart' ? 'Chart Widget' : widgetType === 'stat' ? 'Statistic' : 'Text'),
      chart_id: widgetType === 'chart' ? widgetChartId || undefined : undefined,
      text_content: widgetType === 'stat' || widgetType === 'text' ? widgetTextContent : undefined,
      position: {
        x: 0,
        y: maxY,
        w: widgetType === 'text' ? 12 : 6,
        h: widgetType === 'text' ? 2 : 4,
      },
    };

    updateDashboard.mutate(
      { id, data: { widgets: [...dashboard.widgets, newWidget] } },
      {
        onSuccess: () => {
          setShowAddWidget(false);
          setWidgetTitle('');
          setWidgetChartId('');
          setWidgetTextContent('');
          setWidgetType('chart');
          toast.success('Widget added');
        },
      },
    );
  };

  // Share copy handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="dashboard-detail-page">
        <div className="dashboards-empty">
          <Loader2 size={32} className="spin" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dashboard-detail-page">
        <div className="dashboard-detail-header">
          <Link to="/app/dashboards" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Dashboards</span>
          </Link>
        </div>
        <div className="dashboards-empty">
          <p>Failed to load dashboard. It may have been deleted or you don't have access.</p>
          <Link to="/app/dashboards" className="dashboards-empty-btn">Go to Dashboards</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-detail-page">
      <div className="dashboard-detail-header">
        <Link to="/app/dashboards" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Dashboards</span>
        </Link>
        <div className="header-actions">
          <button
            className="config-panel__control-select"
            onClick={() => setAudiencePickerOpen(true)}
          >
            <Users size={14} />
            {baseAudienceLabel}
          </button>
          {isEditing ? (
            <Button
              variant="primary"
              icon={<Save size={16} />}
              loading={updateDashboard.isPending}
              onClick={handleSave}
            >
              Save
            </Button>
          ) : (
            <Button
              variant="ghost"
              icon={<Edit size={16} />}
              onClick={() => {
                setDashboardName(dashboard?.name ?? '');
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          )}
          <button className="icon-btn" onClick={() => toast('Dashboard export coming soon')} title="Download"><Download size={18} /></button>
          <button className="icon-btn" onClick={() => setShowShareModal(true)} title="Share"><Share2 size={18} /></button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddWidget(true)}>
            Add widget
          </Button>
        </div>
      </div>

      <div className="dashboard-detail-content">
        {isEditing ? (
          <input
            type="text"
            className="dashboard-title-input"
            value={dashboardName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDashboardName(e.target.value)}
            placeholder="Dashboard name"
          />
        ) : (
          <h1 className="dashboard-title-input" style={{ cursor: 'default' }}>{displayName}</h1>
        )}

        {dashboard?.updated_at && (
          <p className="dashboard-meta" style={{ marginBottom: 'var(--spacing-lg)' }}>
            Last updated {formatRelativeDate(dashboard.updated_at)}
          </p>
        )}

        {hasApiWidgets ? (
          <DashboardGrid
            widgets={dashboard!.widgets}
            editable={isEditing}
            onWidgetRemove={handleRemoveWidget}
            onWidgetMaximize={(widgetId) => setMaximizedWidgetId(widgetId)}
            baseAudience={baseAudience}
          />
        ) : (
          <EmptyState
            icon={<LayoutDashboard size={48} />}
            title="No widgets yet"
            description="Start building your dashboard by adding charts, statistics, or text widgets."
            action={
              <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddWidget(true)}>
                Add First Widget
              </Button>
            }
          />
        )}
      </div>

      {/* Share Modal */}
      <Modal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Dashboard"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowShareModal(false)}>Close</Button>
          </div>
        }
      >
        <p style={{ marginBottom: 'var(--spacing-md)' }}>Share this dashboard by copying the link below.</p>
        <div className="share-url-row">
          <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} />
          <Button variant="primary" onClick={handleCopyLink}>Copy</Button>
        </div>
      </Modal>

      {/* Add Widget Modal */}
      <Modal
        open={showAddWidget}
        onClose={() => setShowAddWidget(false)}
        title="Add Widget"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowAddWidget(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddWidget} loading={updateDashboard.isPending}>Add Widget</Button>
          </div>
        }
      >
        <div className="add-widget-form">
          <div>
            <div className="add-widget-label">Type</div>
            <div className="add-widget-type-select">
              <button
                className={`add-widget-type-btn ${widgetType === 'chart' ? 'active' : ''}`}
                onClick={() => setWidgetType('chart')}
              >
                Chart
              </button>
              <button
                className={`add-widget-type-btn ${widgetType === 'stat' ? 'active' : ''}`}
                onClick={() => setWidgetType('stat')}
              >
                Statistic
              </button>
              <button
                className={`add-widget-type-btn ${widgetType === 'text' ? 'active' : ''}`}
                onClick={() => setWidgetType('text')}
              >
                Text
              </button>
            </div>
          </div>

          <div>
            <div className="add-widget-label">Title</div>
            <input
              type="text"
              className="add-widget-input"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              placeholder="Widget title"
            />
          </div>

          {widgetType === 'chart' && (
            <div>
              <div className="add-widget-label">Chart</div>
              <select
                className="add-widget-input"
                value={widgetChartId}
                onChange={(e) => setWidgetChartId(e.target.value)}
              >
                <option value="">Select a chart...</option>
                {chartsList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {widgetType === 'stat' && (
            <div>
              <div className="add-widget-label">Value</div>
              <input
                type="text"
                className="add-widget-input"
                value={widgetTextContent}
                onChange={(e) => setWidgetTextContent(e.target.value)}
                placeholder="e.g., 42%"
              />
            </div>
          )}

          {widgetType === 'text' && (
            <div>
              <div className="add-widget-label">Content</div>
              <textarea
                className="add-widget-textarea"
                value={widgetTextContent}
                onChange={(e) => setWidgetTextContent(e.target.value)}
                placeholder="Enter text content..."
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Widget Maximize Modal */}
      <Modal
        open={!!maximizedWidgetId}
        onClose={() => setMaximizedWidgetId(null)}
        title={maximizedWidget?.title ?? 'Widget'}
        size="xl"
      >
        <div style={{ minHeight: 400 }}>
          {maximizedWidget?.type === 'chart' && (
            <WidgetChart widget={maximizedWidget} height={500} />
          )}
          {maximizedWidget?.type === 'stat' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
              <span style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                {maximizedWidget.text_content ?? '--'}
              </span>
              <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-md)' }}>
                {maximizedWidget.title}
              </span>
            </div>
          )}
          {maximizedWidget?.type === 'text' && (
            <div style={{ padding: 'var(--spacing-lg)', fontSize: 'var(--font-size-body)', color: 'var(--color-text)', lineHeight: 'var(--line-height-relaxed)' }}>
              {maximizedWidget.text_content}
            </div>
          )}
        </div>
      </Modal>

      <BaseAudiencePicker
        open={audiencePickerOpen}
        onClose={() => setAudiencePickerOpen(false)}
        audiences={audiences}
        questions={questions}
        onSelectSaved={handleBaseSelectSaved}
        onApplyQuestion={handleBaseApplyQuestion}
        onClear={handleBaseClear}
      />
    </div>
  );
}
