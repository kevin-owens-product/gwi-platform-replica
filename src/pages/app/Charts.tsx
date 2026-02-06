import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, BarChart3 } from 'lucide-react';
import { useCharts } from '@/hooks/useCharts';
import { SearchInput, Tabs, Pagination, EmptyState, Badge } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { Chart, ChartType } from '@/api/types';
import './Charts.css';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Charts' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Charts', icon: <Globe size={16} /> },
];

const chartTypeLabels: Record<string, string> = {
  bar: 'Bar Chart',
  stacked_bar: 'Stacked Bar',
  line: 'Line Chart',
  pie: 'Pie Chart',
  donut: 'Donut Chart',
  scatter: 'Scatter Plot',
  table: 'Table',
};

function MiniBar(): React.JSX.Element {
  const bars: number[] = [65, 45, 80, 35, 60, 50, 72];
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      {bars.map((h: number, i: number) => (
        <rect key={i} x={i * 20 + 2} y={60 - h * 0.6} width="14" height={h * 0.6} rx="2" fill="#0ea5e9" opacity={0.6 + i * 0.05} />
      ))}
    </svg>
  );
}

function MiniLine(): React.JSX.Element {
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      <defs>
        <linearGradient id="lineGradChart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E31C79" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#E31C79" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="0,50 20,42 40,45 60,30 80,25 100,20 120,28 140,15 140,60 0,60" fill="url(#lineGradChart)" />
      <polyline points="0,50 20,42 40,45 60,30 80,25 100,20 120,28 140,15" fill="none" stroke="#E31C79" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniPie(): React.JSX.Element {
  return (
    <svg viewBox="0 0 60 60" className="chart-mini-svg chart-mini-pie">
      <circle cx="30" cy="30" r="25" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeDasharray="55 157" strokeDashoffset="0" />
      <circle cx="30" cy="30" r="25" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="40 157" strokeDashoffset="-55" />
      <circle cx="30" cy="30" r="25" fill="none" stroke="#E31C79" strokeWidth="8" strokeDasharray="32 157" strokeDashoffset="-95" />
      <circle cx="30" cy="30" r="25" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="30 157" strokeDashoffset="-127" />
    </svg>
  );
}

function MiniStacked(): React.JSX.Element {
  const data: number[][] = [[25, 20, 15], [20, 25, 18], [30, 15, 20], [18, 22, 25], [22, 28, 12]];
  const colors: string[] = ['#0ea5e9', '#22c55e', '#8b5cf6'];
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      {data.map((stack: number[], i: number) => {
        let y = 60;
        return stack.map((h: number, j: number) => {
          const scaledH = h * 0.85;
          y -= scaledH;
          return <rect key={`${i}-${j}`} x={i * 28 + 4} y={y} width="20" height={scaledH} rx="1" fill={colors[j]} opacity="0.75" />;
        });
      })}
    </svg>
  );
}

const miniCharts: Record<string, () => React.JSX.Element> = {
  bar: MiniBar,
  line: MiniLine,
  pie: MiniPie,
  donut: MiniPie,
  stacked_bar: MiniStacked,
  scatter: MiniBar,
  table: MiniBar,
};

export default function Charts(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data: chartsResponse, isLoading, isError } = useCharts({
    page,
    per_page: 20,
    search: searchQuery || undefined,
    sort_by: 'updated_at',
    sort_order: 'desc',
  });

  const charts = chartsResponse?.data ?? [];
  const meta = chartsResponse?.meta;
  const totalPages = meta?.total_pages ?? 1;

  // Client-side tab filtering (tabs represent ownership, not a server filter)
  const filtered = charts.filter((chart: Chart) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'my') return !chart.is_shared;
    if (activeTab === 'shared') return chart.is_shared;
    if (activeTab === 'gwi') return !chart.user_id;
    return true;
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <div className="charts-page">
      <div className="charts-header">
        <h1 className="page-title">Charts</h1>
        <div className="charts-tabs">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <Link to="/app/chart-builder/chart/new" className="btn-create">
          <span>Create new chart</span>
          <Plus size={18} />
        </Link>
      </div>

      <div className="charts-filters">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search charts"
        />
      </div>

      {isLoading ? (
        <div className="charts-loading">
          <div className="charts-loading-spinner" />
          <p>Loading charts...</p>
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load charts"
          description="Something went wrong while loading your charts. Please try again."
          action={
            <button className="charts-empty-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={48} />}
          title="No charts found"
          description={searchQuery ? 'No charts match your search' : 'Create your first chart to get started'}
          action={
            <button className="charts-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          <div className="charts-grid">
            {filtered.map((chart: Chart) => {
              const MiniChart = miniCharts[chart.chart_type] || MiniBar;
              return (
                <Link key={chart.id} to={`/app/chart-builder/chart/${chart.id}`} className="chart-card">
                  <div className="chart-preview">
                    {chart.thumbnail_url ? (
                      <img src={chart.thumbnail_url} alt={chart.name} className="chart-thumbnail" />
                    ) : (
                      <MiniChart />
                    )}
                  </div>
                  <div className="chart-info">
                    <h3 className="chart-name">{chart.name}</h3>
                    <p className="chart-meta">
                      <Badge variant="info" className="chart-type-badge">
                        {chartTypeLabels[chart.chart_type] ?? chart.chart_type}
                      </Badge>
                      {chart.is_shared && <Badge variant="default">Shared</Badge>}
                    </p>
                    <p className="chart-updated">
                      {chart.updated_at ? formatRelativeDate(chart.updated_at) : 'Unknown'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
