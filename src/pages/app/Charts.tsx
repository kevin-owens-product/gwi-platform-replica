import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, BarChart3, LayoutGrid, List, Download, Trash2, CheckSquare, Filter, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
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

const chartTypeFilterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'stacked_bar', label: 'Stacked Bar' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'donut', label: 'Donut Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'table', label: 'Table' },
];

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [chartTypeFilter, setChartTypeFilter] = useState<string>('all');
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
  const filtered = useMemo(() => {
    return charts.filter((chart: Chart) => {
      // Tab filter
      if (activeTab === 'my' && chart.is_shared) return false;
      if (activeTab === 'shared' && !chart.is_shared) return false;
      if (activeTab === 'gwi' && chart.user_id) return false;

      // Chart type filter
      if (chartTypeFilter !== 'all' && chart.chart_type !== chartTypeFilter) return false;

      return true;
    });
  }, [charts, activeTab, chartTypeFilter]);

  // Recently viewed: take the first 3 charts as mock "recently viewed"
  const recentlyViewed = useMemo(() => {
    return charts.slice(0, 3);
  }, [charts]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkExport = () => {
    if (selectedIds.size === 0) {
      toast.error('No charts selected');
      return;
    }
    toast.success(`Exporting ${selectedIds.size} chart(s)...`);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      toast.error('No charts selected');
      return;
    }
    toast.success(`Deleted ${selectedIds.size} chart(s)`);
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const exitBulkMode = () => {
    setBulkMode(false);
    setSelectedIds(new Set());
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
        <div className="charts-filter-type">
          <Filter size={14} className="filter-icon" />
          <select
            className="charts-type-select"
            value={chartTypeFilter}
            onChange={(e) => { setChartTypeFilter(e.target.value); setPage(1); }}
          >
            {chartTypeFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="charts-view-toggle">
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
        <button
          className={`bulk-toggle-btn ${bulkMode ? 'active' : ''}`}
          onClick={() => bulkMode ? exitBulkMode() : setBulkMode(true)}
          title={bulkMode ? 'Exit selection mode' : 'Bulk select'}
        >
          <CheckSquare size={16} />
          <span>{bulkMode ? 'Cancel' : 'Select'}</span>
        </button>
      </div>

      {/* Bulk actions bar */}
      {bulkMode && (
        <div className="charts-bulk-bar">
          <label className="bulk-select-all">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selectedIds.size === filtered.length}
              onChange={toggleSelectAll}
            />
            <span>Select all ({filtered.length})</span>
          </label>
          <span className="bulk-count">{selectedIds.size} selected</span>
          <div className="bulk-actions">
            <button className="bulk-action-btn" onClick={handleBulkExport} disabled={selectedIds.size === 0}>
              <Download size={14} />
              <span>Export</span>
            </button>
            <button className="bulk-action-btn bulk-action-danger" onClick={handleBulkDelete} disabled={selectedIds.size === 0}>
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

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
      ) : (
        <>
          {/* Recently Viewed Section */}
          {!bulkMode && recentlyViewed.length > 0 && (
            <div className="recently-viewed-section">
              <div className="recently-viewed-header">
                <Clock size={16} />
                <h3>Recently Viewed</h3>
              </div>
              <div className="recently-viewed-row">
                {recentlyViewed.map((chart: Chart) => {
                  const MiniChart = miniCharts[chart.chart_type] || MiniBar;
                  return (
                    <Link key={`recent-${chart.id}`} to={`/app/chart-builder/chart/${chart.id}`} className="recent-card">
                      <div className="recent-card-preview">
                        <MiniChart />
                      </div>
                      <div className="recent-card-info">
                        <span className="recent-card-name">{chart.name}</span>
                        <span className="recent-card-type">{chartTypeLabels[chart.chart_type] ?? chart.chart_type}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="charts-grid">
              {filtered.map((chart: Chart) => {
                const MiniChart = miniCharts[chart.chart_type] || MiniBar;
                return (
                  <div key={chart.id} className={`chart-card-wrapper ${bulkMode && selectedIds.has(chart.id) ? 'selected' : ''}`}>
                    {bulkMode && (
                      <label className="chart-card-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(chart.id)}
                          onChange={() => toggleSelect(chart.id)}
                        />
                      </label>
                    )}
                    <Link to={`/app/chart-builder/chart/${chart.id}`} className="chart-card">
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
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="charts-list-table-wrapper">
              <table className="charts-list-table">
                <thead>
                  <tr>
                    {bulkMode && <th className="list-checkbox-col" />}
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((chart: Chart) => (
                    <tr key={chart.id} className={selectedIds.has(chart.id) ? 'selected' : ''}>
                      {bulkMode && (
                        <td className="list-checkbox-col">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(chart.id)}
                            onChange={() => toggleSelect(chart.id)}
                          />
                        </td>
                      )}
                      <td>
                        <Link to={`/app/chart-builder/chart/${chart.id}`} className="list-chart-name">
                          {chart.name}
                        </Link>
                      </td>
                      <td>
                        <Badge variant="info" className="chart-type-badge">
                          {chartTypeLabels[chart.chart_type] ?? chart.chart_type}
                        </Badge>
                      </td>
                      <td>
                        {chart.is_shared ? <Badge variant="default">Shared</Badge> : <Badge variant="default">Private</Badge>}
                      </td>
                      <td className="list-updated-col">
                        {chart.updated_at ? formatRelativeDate(chart.updated_at) : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
