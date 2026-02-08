import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, BarChart3, LayoutGrid, List, ChevronDown, FolderOpen, Tag } from 'lucide-react';
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
  grouped_bar: 'Grouped Bar',
  horizontal_bar: 'Horizontal Bar',
  line: 'Line Chart',
  area: 'Area Chart',
  stacked_area: 'Stacked Area',
  combo: 'Combo Chart',
  pie: 'Pie Chart',
  donut: 'Donut Chart',
  scatter: 'Scatter Plot',
  waterfall: 'Waterfall',
  funnel: 'Funnel',
  radar: 'Radar',
  treemap: 'Treemap',
  bullet: 'Bullet',
  heatmap: 'Heatmap',
  gauge: 'Gauge',
  sankey: 'Sankey',
  geo_map: 'Geo Map',
  table: 'Table',
};

const allChartTypes = Object.keys(chartTypeLabels) as ChartType[];

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

function MiniArea(): React.JSX.Element {
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points="0,50 20,38 40,42 60,28 80,20 100,32 120,18 140,22 140,60 0,60" fill="url(#areaGrad)" />
      <polyline points="0,50 20,38 40,42 60,28 80,20 100,32 120,18 140,22" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MiniHorizontalBar(): React.JSX.Element {
  const bars: number[] = [110, 85, 120, 60, 95];
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      {bars.map((w: number, i: number) => (
        <rect key={i} x={2} y={i * 12 + 1} width={w} height="9" rx="2" fill="#0ea5e9" opacity={0.55 + i * 0.08} />
      ))}
    </svg>
  );
}

function MiniRadar(): React.JSX.Element {
  return (
    <svg viewBox="0 0 80 80" className="chart-mini-svg chart-mini-pie">
      <polygon points="40,10 65,28 58,55 22,55 15,28" fill="none" stroke="#ddd" strokeWidth="0.5" />
      <polygon points="40,18 57,31 52,50 28,50 23,31" fill="none" stroke="#ddd" strokeWidth="0.5" />
      <polygon points="40,15 60,30 54,52 26,52 20,30" fill="#0ea5e9" fillOpacity="0.25" stroke="#0ea5e9" strokeWidth="1.5" />
    </svg>
  );
}

function MiniGauge(): React.JSX.Element {
  return (
    <svg viewBox="0 0 80 50" className="chart-mini-svg chart-mini-pie">
      <path d="M10,45 A30,30 0 0,1 70,45" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />
      <path d="M10,45 A30,30 0 0,1 55,18" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
      <circle cx="40" cy="45" r="3" fill="#0ea5e9" />
    </svg>
  );
}

function MiniFunnel(): React.JSX.Element {
  const widths = [120, 95, 70, 50, 30];
  const colors = ['#0ea5e9', '#22c55e', '#8b5cf6', '#E31C79', '#f59e0b'];
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      {widths.map((w, i) => (
        <rect key={i} x={(140 - w) / 2} y={i * 12 + 1} width={w} height="10" rx="2" fill={colors[i]} opacity="0.7" />
      ))}
    </svg>
  );
}

function MiniHeatmap(): React.JSX.Element {
  const cells = [
    [0.2, 0.8, 0.5, 0.3],
    [0.6, 0.4, 0.9, 0.7],
    [0.1, 0.5, 0.3, 0.8],
  ];
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      {cells.map((row, ri) =>
        row.map((v, ci) => (
          <rect key={`${ri}-${ci}`} x={ci * 34 + 4} y={ri * 19 + 2} width="30" height="16" rx="2" fill="#0ea5e9" opacity={v} />
        ))
      )}
    </svg>
  );
}

function MiniTreemap(): React.JSX.Element {
  const colors = ['#0ea5e9', '#22c55e', '#8b5cf6', '#E31C79', '#f59e0b', '#06b6d4'];
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      <rect x="2" y="2" width="75" height="35" rx="2" fill={colors[0]} opacity="0.65" />
      <rect x="80" y="2" width="58" height="20" rx="2" fill={colors[1]} opacity="0.6" />
      <rect x="80" y="25" width="58" height="12" rx="2" fill={colors[2]} opacity="0.55" />
      <rect x="2" y="40" width="45" height="18" rx="2" fill={colors[3]} opacity="0.6" />
      <rect x="50" y="40" width="40" height="18" rx="2" fill={colors[4]} opacity="0.55" />
      <rect x="93" y="40" width="45" height="18" rx="2" fill={colors[5]} opacity="0.5" />
    </svg>
  );
}

function MiniWaterfall(): React.JSX.Element {
  const segments = [
    { x: 5, y: 10, h: 40, color: '#0ea5e9' },
    { x: 25, y: 15, h: 20, color: '#22c55e' },
    { x: 45, y: 10, h: 15, color: '#22c55e' },
    { x: 65, y: 25, h: 25, color: '#E31C79' },
    { x: 85, y: 20, h: 10, color: '#22c55e' },
    { x: 105, y: 5, h: 50, color: '#8b5cf6' },
  ];
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      {segments.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width="16" height={s.h} rx="2" fill={s.color} opacity="0.65" />
      ))}
    </svg>
  );
}

function MiniSankey(): React.JSX.Element {
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      <rect x="2" y="5" width="12" height="50" rx="2" fill="#0ea5e9" opacity="0.6" />
      <rect x="126" y="2" width="12" height="25" rx="2" fill="#22c55e" opacity="0.6" />
      <rect x="126" y="32" width="12" height="25" rx="2" fill="#E31C79" opacity="0.6" />
      <path d="M14,15 C70,15 70,12 126,12" fill="none" stroke="#0ea5e9" strokeWidth="8" opacity="0.2" />
      <path d="M14,40 C70,40 70,42 126,42" fill="none" stroke="#E31C79" strokeWidth="8" opacity="0.2" />
    </svg>
  );
}

function MiniGeoMap(): React.JSX.Element {
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      <ellipse cx="70" cy="30" rx="60" ry="25" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.5" />
      <circle cx="45" cy="25" r="4" fill="#0ea5e9" opacity="0.7" />
      <circle cx="75" cy="20" r="6" fill="#0ea5e9" opacity="0.5" />
      <circle cx="95" cy="35" r="3" fill="#E31C79" opacity="0.7" />
      <circle cx="55" cy="38" r="5" fill="#22c55e" opacity="0.6" />
    </svg>
  );
}

function MiniBullet(): React.JSX.Element {
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      <rect x="2" y="10" width="136" height="16" rx="2" fill="#e5e7eb" opacity="0.5" />
      <rect x="2" y="10" width="100" height="16" rx="2" fill="#d1d5db" opacity="0.5" />
      <rect x="2" y="13" width="75" height="10" rx="1" fill="#0ea5e9" opacity="0.7" />
      <line x1="90" y1="7" x2="90" y2="29" stroke="#1e293b" strokeWidth="2" />
      <rect x="2" y="36" width="136" height="16" rx="2" fill="#e5e7eb" opacity="0.5" />
      <rect x="2" y="36" width="110" height="16" rx="2" fill="#d1d5db" opacity="0.5" />
      <rect x="2" y="39" width="85" height="10" rx="1" fill="#22c55e" opacity="0.7" />
      <line x1="100" y1="33" x2="100" y2="55" stroke="#1e293b" strokeWidth="2" />
    </svg>
  );
}

function MiniCombo(): React.JSX.Element {
  const bars: number[] = [30, 42, 35, 50, 38];
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      {bars.map((h, i) => (
        <rect key={i} x={i * 28 + 4} y={60 - h} width="20" height={h} rx="2" fill="#0ea5e9" opacity="0.5" />
      ))}
      <polyline points="14,28 42,18 70,22 98,10 126,20" fill="none" stroke="#E31C79" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="28" r="2.5" fill="#E31C79" />
      <circle cx="42" cy="18" r="2.5" fill="#E31C79" />
      <circle cx="70" cy="22" r="2.5" fill="#E31C79" />
      <circle cx="98" cy="10" r="2.5" fill="#E31C79" />
      <circle cx="126" cy="20" r="2.5" fill="#E31C79" />
    </svg>
  );
}

function MiniTable(): React.JSX.Element {
  return (
    <svg viewBox="0 0 140 60" className="chart-mini-svg">
      <rect x="2" y="2" width="136" height="12" rx="2" fill="#94a3b8" opacity="0.3" />
      {[18, 34, 50].map((yy, i) => (
        <g key={i}>
          <rect x="2" y={yy} width="40" height="10" rx="1" fill="#e2e8f0" opacity="0.5" />
          <rect x="48" y={yy} width="30" height="10" rx="1" fill="#e2e8f0" opacity="0.35" />
          <rect x="84" y={yy} width="30" height="10" rx="1" fill="#e2e8f0" opacity="0.35" />
          <rect x="120" y={yy} width="18" height="10" rx="1" fill="#e2e8f0" opacity="0.35" />
        </g>
      ))}
    </svg>
  );
}

const miniCharts: Record<string, () => React.JSX.Element> = {
  bar: MiniBar,
  stacked_bar: MiniStacked,
  grouped_bar: MiniBar,
  horizontal_bar: MiniHorizontalBar,
  line: MiniLine,
  area: MiniArea,
  stacked_area: MiniArea,
  combo: MiniCombo,
  pie: MiniPie,
  donut: MiniPie,
  scatter: MiniBar,
  waterfall: MiniWaterfall,
  funnel: MiniFunnel,
  radar: MiniRadar,
  treemap: MiniTreemap,
  bullet: MiniBullet,
  heatmap: MiniHeatmap,
  gauge: MiniGauge,
  sankey: MiniSankey,
  geo_map: MiniGeoMap,
  table: MiniTable,
};

export default function Charts(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [chartTypeFilter, setChartTypeFilter] = useState<string>('all');
  const [showTypeDropdown, setShowTypeDropdown] = useState<boolean>(false);

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
    if (activeTab === 'all') { /* pass */ }
    else if (activeTab === 'my' && chart.is_shared) return false;
    else if (activeTab === 'shared' && !chart.is_shared) return false;
    else if (activeTab === 'gwi' && chart.user_id) return false;

    // Chart type filter
    if (chartTypeFilter !== 'all' && chart.chart_type !== chartTypeFilter) return false;

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

        {/* Chart type filter dropdown */}
        <div className="chart-type-filter">
          <button
            className={`filter-btn ${showTypeDropdown ? 'active' : ''}`}
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <span className="filter-label">Type:</span>
            <span className="filter-value">
              {chartTypeFilter === 'all' ? 'All Types' : chartTypeLabels[chartTypeFilter] ?? chartTypeFilter}
            </span>
            <ChevronDown size={16} />
          </button>
          {showTypeDropdown && (
            <div className="chart-type-dropdown">
              <button
                className={`dropdown-option-btn ${chartTypeFilter === 'all' ? 'selected' : ''}`}
                onClick={() => { setChartTypeFilter('all'); setShowTypeDropdown(false); setPage(1); }}
              >
                All Types
              </button>
              {allChartTypes.map((type) => (
                <button
                  key={type}
                  className={`dropdown-option-btn ${chartTypeFilter === type ? 'selected' : ''}`}
                  onClick={() => { setChartTypeFilter(type); setShowTypeDropdown(false); setPage(1); }}
                >
                  {chartTypeLabels[type]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View mode toggle */}
        <div className="chart-view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
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
            <button className="charts-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); setChartTypeFilter('all'); }}>
              Clear filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
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
                    {/* Folder grouping indicator */}
                    {chart.folder_id && (
                      <span className="chart-folder-indicator">
                        <FolderOpen size={12} />
                        <span>{chart.folder_id}</span>
                      </span>
                    )}
                    {/* Tag display */}
                    {chart.tags && chart.tags.length > 0 && (
                      <div className="chart-tags">
                        <Tag size={11} className="chart-tags-icon" />
                        {chart.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="chart-tag">{tag}</span>
                        ))}
                        {chart.tags.length > 3 && (
                          <span className="chart-tag chart-tag-more">+{chart.tags.length - 3}</span>
                        )}
                      </div>
                    )}
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
      ) : (
        /* List view */
        <>
          <div className="charts-list">
            <div className="charts-list-header">
              <div className="charts-list-cell charts-list-name-cell">Name</div>
              <div className="charts-list-cell">Type</div>
              <div className="charts-list-cell">Tags</div>
              <div className="charts-list-cell">Folder</div>
              <div className="charts-list-cell">Last updated</div>
            </div>
            <div className="charts-list-body">
              {filtered.map((chart: Chart) => {
                const MiniChart = miniCharts[chart.chart_type] || MiniBar;
                return (
                  <Link key={chart.id} to={`/app/chart-builder/chart/${chart.id}`} className="charts-list-row">
                    <div className="charts-list-cell charts-list-name-cell">
                      <div className="charts-list-mini-preview">
                        <MiniChart />
                      </div>
                      <div>
                        <span className="charts-list-row-name">{chart.name}</span>
                        {chart.is_shared && (
                          <Badge variant="default" className="charts-list-shared-badge">Shared</Badge>
                        )}
                      </div>
                    </div>
                    <div className="charts-list-cell">
                      <Badge variant="info" className="chart-type-badge">
                        {chartTypeLabels[chart.chart_type] ?? chart.chart_type}
                      </Badge>
                    </div>
                    <div className="charts-list-cell">
                      {chart.tags && chart.tags.length > 0 ? (
                        <div className="chart-tags">
                          {chart.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="chart-tag">{tag}</span>
                          ))}
                          {chart.tags.length > 2 && (
                            <span className="chart-tag chart-tag-more">+{chart.tags.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="charts-list-muted">-</span>
                      )}
                    </div>
                    <div className="charts-list-cell">
                      {chart.folder_id ? (
                        <span className="chart-folder-indicator">
                          <FolderOpen size={12} />
                          <span>{chart.folder_id}</span>
                        </span>
                      ) : (
                        <span className="charts-list-muted">-</span>
                      )}
                    </div>
                    <div className="charts-list-cell charts-list-date">
                      {chart.updated_at ? formatRelativeDate(chart.updated_at) : 'Unknown'}
                    </div>
                  </Link>
                );
              })}
            </div>
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
