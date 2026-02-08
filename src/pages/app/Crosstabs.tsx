import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, Grid3X3, Users, BarChart3, ShoppingCart, TrendingUp } from 'lucide-react';
import { useCrosstabs } from '@/hooks/useCrosstabs';
import { SearchInput, Tabs, Pagination, EmptyState, Badge } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { Crosstab } from '@/api/types';
import './Crosstabs.css';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Crosstabs' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Crosstabs', icon: <Globe size={16} /> },
];

// Pre-built crosstab templates
const templates = [
  {
    id: 'demographics-media',
    name: 'Demographics by Media',
    description: 'Analyze media consumption patterns across age, gender, and income groups',
    icon: <Users size={22} />,
    color: 'var(--color-chart-1)',
  },
  {
    id: 'brand-awareness-market',
    name: 'Brand Awareness by Market',
    description: 'Compare brand recognition and recall metrics across key markets',
    icon: <TrendingUp size={22} />,
    color: 'var(--color-chart-2)',
  },
  {
    id: 'purchase-intent-age',
    name: 'Purchase Intent by Age',
    description: 'Explore purchase likelihood segmented by age cohorts',
    icon: <ShoppingCart size={22} />,
    color: 'var(--color-chart-3)',
  },
  {
    id: 'engagement-platform',
    name: 'Engagement by Platform',
    description: 'Measure content engagement rates across social and digital platforms',
    icon: <BarChart3 size={22} />,
    color: 'var(--color-chart-5)',
  },
];

// Mock data for metric badges and status per crosstab
const mockMetricConfig: Record<string, string[]> = {};
const mockLastRun: Record<string, string> = {};
const mockStatus: Record<string, 'available' | 'stale' | 'draft'> = {};

function getCrosstabMetrics(ct: Crosstab): string[] {
  if (mockMetricConfig[ct.id]) return mockMetricConfig[ct.id];
  // Derive from config if present, otherwise assign mock
  const metrics: string[] = [];
  if (ct.config?.metrics) {
    if (ct.config.metrics.includes('audience_percentage')) metrics.push('%');
    if (ct.config.metrics.includes('audience_index')) metrics.push('Index');
    if (ct.config.metrics.includes('positive_size') || ct.config.metrics.includes('audience_size')) metrics.push('Sample');
  }
  if (metrics.length === 0) {
    // Default mock
    metrics.push('%');
    if (Math.random() > 0.3) metrics.push('Index');
    if (Math.random() > 0.5) metrics.push('Sample');
  }
  mockMetricConfig[ct.id] = metrics;
  return metrics;
}

function getCrosstabLastRun(ct: Crosstab): string {
  if (mockLastRun[ct.id]) return mockLastRun[ct.id];
  // Generate a mock "last run" time near the updated_at
  if (ct.updated_at) {
    const d = new Date(ct.updated_at);
    d.setMinutes(d.getMinutes() + Math.floor(Math.random() * 30));
    mockLastRun[ct.id] = d.toISOString();
    return mockLastRun[ct.id];
  }
  mockLastRun[ct.id] = '';
  return '';
}

function getCrosstabStatus(ct: Crosstab): 'available' | 'stale' | 'draft' {
  if (mockStatus[ct.id]) return mockStatus[ct.id];
  const rowCount = ct.config?.rows?.reduce((sum, d) => sum + (d.datapoint_ids?.length ?? 1), 0) ?? 0;
  const colCount = ct.config?.columns?.reduce((sum, d) => sum + (d.datapoint_ids?.length ?? 1), 0) ?? 0;
  let status: 'available' | 'stale' | 'draft';
  if (rowCount === 0 || colCount === 0) {
    status = 'draft';
  } else if (ct.updated_at) {
    const daysSinceUpdate = (Date.now() - new Date(ct.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    status = daysSinceUpdate > 30 ? 'stale' : 'available';
  } else {
    status = 'draft';
  }
  mockStatus[ct.id] = status;
  return status;
}

const statusLabels: Record<string, string> = {
  available: 'Data available',
  stale: 'Stale data',
  draft: 'Draft',
};

export default function Crosstabs(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data: crosstabsResponse, isLoading, isError } = useCrosstabs({
    page,
    per_page: 20,
    search: searchQuery || undefined,
  });

  const crosstabs = crosstabsResponse?.data ?? [];
  const meta = crosstabsResponse?.meta;
  const totalPages = meta?.total_pages ?? 1;

  // Client-side tab filtering
  const filtered = crosstabs.filter((ct: Crosstab) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'my') return !ct.is_shared;
    if (activeTab === 'shared') return ct.is_shared;
    if (activeTab === 'gwi') return !ct.user_id;
    return true;
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <div className="crosstabs-page">
      <div className="crosstabs-header">
        <h1 className="page-title">Crosstabs</h1>
        <div className="crosstabs-tabs">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <Link to="/app/crosstabs/new" className="btn-create">
          <span>Create new crosstab</span>
          <Plus size={18} />
        </Link>
      </div>

      {/* Templates Section */}
      <div className="crosstabs-templates">
        <h3 className="crosstabs-templates-title">Quick Start Templates</h3>
        <div className="crosstabs-templates-grid">
          {templates.map((tpl) => (
            <Link
              key={tpl.id}
              to="/app/crosstabs/new"
              className="ct-template-card"
            >
              <div
                className="ct-template-icon"
                style={{ backgroundColor: `color-mix(in srgb, ${tpl.color} 12%, transparent)`, color: tpl.color }}
              >
                {tpl.icon}
              </div>
              <div className="ct-template-info">
                <span className="ct-template-name">{tpl.name}</span>
                <span className="ct-template-desc">{tpl.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="crosstabs-filters">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search crosstabs"
        />
      </div>

      {isLoading ? (
        <div className="crosstabs-loading">
          <div className="charts-loading-spinner" />
          <p>Loading crosstabs...</p>
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load crosstabs"
          description="Something went wrong while loading your crosstabs. Please try again."
          action={
            <button className="crosstabs-empty-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Grid3X3 size={48} />}
          title="No crosstabs found"
          description={searchQuery ? 'No crosstabs match your search' : 'Create your first crosstab to get started'}
          action={
            <button className="crosstabs-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          <div className="crosstabs-table">
            <div className="ct-table-header">
              <div className="ct-cell ct-name-cell">Name</div>
              <div className="ct-cell">Status</div>
              <div className="ct-cell">Metrics</div>
              <div className="ct-cell">Size</div>
              <div className="ct-cell">Dataset</div>
              <div className="ct-cell">Last run</div>
              <div className="ct-cell">Last updated</div>
            </div>
            <div className="ct-table-body">
              {filtered.map((ct: Crosstab) => {
                const rowCount = ct.config?.rows?.reduce((sum, d) => sum + (d.datapoint_ids?.length ?? 1), 0) ?? 0;
                const colCount = ct.config?.columns?.reduce((sum, d) => sum + (d.datapoint_ids?.length ?? 1), 0) ?? 0;
                const metrics = getCrosstabMetrics(ct);
                const lastRun = getCrosstabLastRun(ct);
                const status = getCrosstabStatus(ct);

                return (
                  <Link key={ct.id} to={`/app/crosstabs/${ct.id}`} className="ct-table-row">
                    <div className="ct-cell ct-name-cell">
                      <div className="ct-icon-wrapper">
                        <Grid3X3 size={18} />
                      </div>
                      <div>
                        <span className="ct-row-name">{ct.name}</span>
                        {ct.is_shared && (
                          <Badge variant="default" className="ct-shared-badge">Shared</Badge>
                        )}
                      </div>
                    </div>
                    <div className="ct-cell">
                      <span className={`ct-status-indicator ct-status--${status}`} title={statusLabels[status]}>
                        <span className="ct-status-dot" />
                        <span className="ct-status-text">{statusLabels[status]}</span>
                      </span>
                    </div>
                    <div className="ct-cell ct-metrics-cell">
                      {metrics.map((m) => (
                        <span key={m} className="ct-metric-badge">{m}</span>
                      ))}
                    </div>
                    <div className="ct-cell ct-size">
                      {rowCount > 0 || colCount > 0
                        ? `${rowCount} rows x ${colCount} cols`
                        : '-'
                      }
                    </div>
                    <div className="ct-cell">
                      <span className="ct-dataset-badge">
                        {ct.project_id ?? 'GWI Core'}
                      </span>
                    </div>
                    <div className="ct-cell ct-date">
                      {lastRun ? formatRelativeDate(lastRun) : '-'}
                    </div>
                    <div className="ct-cell ct-date">
                      {ct.updated_at ? formatRelativeDate(ct.updated_at) : 'Unknown'}
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
