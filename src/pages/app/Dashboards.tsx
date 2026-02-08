import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Globe, LayoutDashboard, MoreVertical, Edit, Copy, Trash2, LucideIcon, Loader2, Calendar, Bell, Eye } from 'lucide-react';
import { useDashboards, useDeleteDashboard } from '@/hooks/useDashboards';
import { SearchInput, Tabs, Pagination, EmptyState, Badge, Dropdown } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { Dashboard, DashboardWidgetType } from '@/api/types';
import './Dashboards.css';

type PreviewType = 'bars' | 'line' | 'pie' | 'mixed';

const tabItems = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Dashboards' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Dashboards', icon: <Globe size={16} /> },
  { id: 'templates', label: 'Templates' },
];

function PreviewBars(): React.JSX.Element {
  return (
    <svg viewBox="0 0 120 50" className="dash-preview-svg">
      <rect x="5" y="15" width="15" height="35" rx="2" fill="#0ea5e9" opacity="0.6" />
      <rect x="25" y="8" width="15" height="42" rx="2" fill="#0ea5e9" opacity="0.75" />
      <rect x="45" y="20" width="15" height="30" rx="2" fill="#0ea5e9" opacity="0.5" />
      <rect x="65" y="5" width="15" height="45" rx="2" fill="#E31C79" opacity="0.7" />
      <rect x="85" y="12" width="15" height="38" rx="2" fill="#0ea5e9" opacity="0.65" />
      <rect x="105" y="18" width="15" height="32" rx="2" fill="#0ea5e9" opacity="0.55" />
    </svg>
  );
}

function PreviewLine(): React.JSX.Element {
  return (
    <svg viewBox="0 0 120 50" className="dash-preview-svg">
      <polyline points="0,40 20,32 40,35 60,22 80,18 100,25 120,12" fill="none" stroke="#E31C79" strokeWidth="2" strokeLinecap="round" />
      <polyline points="0,42 20,38 40,40 60,35 80,30 100,32 120,28" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
    </svg>
  );
}

function PreviewPie(): React.JSX.Element {
  return (
    <svg viewBox="0 0 50 50" className="dash-preview-svg dash-preview-pie">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#E31C79" strokeWidth="6" strokeDasharray="45 126" strokeDashoffset="0" />
      <circle cx="25" cy="25" r="20" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeDasharray="35 126" strokeDashoffset="-45" />
      <circle cx="25" cy="25" r="20" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="25 126" strokeDashoffset="-80" />
      <circle cx="25" cy="25" r="20" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="21 126" strokeDashoffset="-105" />
    </svg>
  );
}

function PreviewMixed(): React.JSX.Element {
  return (
    <svg viewBox="0 0 120 50" className="dash-preview-svg">
      <rect x="5" y="20" width="12" height="30" rx="2" fill="#0ea5e9" opacity="0.5" />
      <rect x="20" y="12" width="12" height="38" rx="2" fill="#0ea5e9" opacity="0.65" />
      <rect x="35" y="25" width="12" height="25" rx="2" fill="#22c55e" opacity="0.5" />
      <polyline points="55,38 70,28 85,32 100,18 115,22" fill="none" stroke="#E31C79" strokeWidth="2" strokeLinecap="round" />
      <circle cx="70" cy="28" r="2.5" fill="#E31C79" />
      <circle cx="100" cy="18" r="2.5" fill="#E31C79" />
    </svg>
  );
}

const previewComponents: Record<PreviewType, React.FC> = { bars: PreviewBars, line: PreviewLine, pie: PreviewPie, mixed: PreviewMixed };

function getPreviewType(dashboard: Dashboard): PreviewType {
  const widgetCount = dashboard.widgets?.length ?? 0;
  if (widgetCount === 0) return 'mixed';
  const chartTypes = dashboard.widgets
    ?.filter(w => w.type === 'chart')
    .map(w => w.chart_type) ?? [];
  if (chartTypes.includes('line')) return 'line';
  if (chartTypes.includes('pie') || chartTypes.includes('donut')) return 'pie';
  if (chartTypes.includes('bar')) return 'bars';
  return 'mixed';
}

function getWidgetTypeBreakdown(dashboard: Dashboard): string {
  const widgets = dashboard.widgets ?? [];
  if (widgets.length === 0) return '0 widgets';

  const counts: Partial<Record<DashboardWidgetType, number>> = {};
  for (const w of widgets) {
    counts[w.type] = (counts[w.type] ?? 0) + 1;
  }

  const parts: string[] = [];
  if (counts.chart) parts.push(`${counts.chart} chart${counts.chart > 1 ? 's' : ''}`);
  if (counts.stat) parts.push(`${counts.stat} stat${counts.stat > 1 ? 's' : ''}`);
  if (counts.text) parts.push(`${counts.text} text`);
  if (counts.table) parts.push(`${counts.table} table${counts.table > 1 ? 's' : ''}`);
  if (counts.gauge) parts.push(`${counts.gauge} gauge${counts.gauge > 1 ? 's' : ''}`);
  if (counts.map) parts.push(`${counts.map} map${counts.map > 1 ? 's' : ''}`);

  // If there are remaining types not listed above, sum them
  const listedCount = (counts.chart ?? 0) + (counts.stat ?? 0) + (counts.text ?? 0) + (counts.table ?? 0) + (counts.gauge ?? 0) + (counts.map ?? 0);
  const otherCount = widgets.length - listedCount;
  if (otherCount > 0) parts.push(`${otherCount} other`);

  return parts.length > 0 ? parts.join(', ') : `${widgets.length} widgets`;
}

const dropdownActions = [
  { label: 'Edit', value: 'edit', icon: <Edit size={14} /> },
  { label: 'Duplicate', value: 'duplicate', icon: <Copy size={14} /> },
  { label: 'Delete', value: 'delete', icon: <Trash2 size={14} />, danger: true },
];

export default function Dashboards(): React.JSX.Element {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError } = useDashboards({ page, per_page: 20, search: searchQuery || undefined });
  const deleteDashboard = useDeleteDashboard();

  const dashboards = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages ?? 1;

  const filtered = dashboards.filter((d: Dashboard) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'shared') return d.is_shared;
    if (activeTab === 'my') return !d.is_shared;
    if (activeTab === 'templates') return !!d.template_id;
    return true;
  });

  const handleDropdownAction = (dashboardId: string, action: string) => {
    switch (action) {
      case 'edit':
        navigate(`/app/dashboards/${dashboardId}`);
        break;
      case 'duplicate':
        // Duplicate is not wired to a mutation since there's no duplicate endpoint
        break;
      case 'delete':
        deleteDashboard.mutate(dashboardId);
        break;
    }
  };

  return (
    <div className="dashboards-page">
      <div className="dashboards-header">
        <h1 className="page-title">Dashboards</h1>
        <div className="dashboards-tabs">
          <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <Link to="/app/dashboards/new" className="btn-create">
          <span>Create new dashboard</span>
          <Plus size={18} />
        </Link>
      </div>

      <div className="dashboards-filters">
        <SearchInput
          value={searchQuery}
          onChange={(value) => { setSearchQuery(value); setPage(1); }}
          placeholder="Search dashboards"
        />
      </div>

      {isLoading ? (
        <div className="dashboards-empty">
          <Loader2 size={32} className="spin" />
          <p>Loading dashboards...</p>
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load dashboards"
          description="Something went wrong. Please try again later."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboard size={40} />}
          title="No dashboards found"
          description={searchQuery ? 'No dashboards match your search' : 'Create your first dashboard to get started'}
          action={
            searchQuery ? (
              <button className="dashboards-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>Clear filters</button>
            ) : (
              <Link to="/app/dashboards/new" className="btn-create">
                <span>Create new dashboard</span>
                <Plus size={18} />
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="dashboards-grid">
            {filtered.map((dashboard: Dashboard) => {
              const previewType = getPreviewType(dashboard);
              const Preview = previewComponents[previewType];
              const widgetBreakdown = getWidgetTypeBreakdown(dashboard);
              // Use 'any' escape for fields not yet on the Dashboard type
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const d = dashboard as any;

              return (
                <div key={dashboard.id} className="dashboard-card">
                  <Link to={`/app/dashboards/${dashboard.id}`} className="dashboard-card-link">
                    <div className="dashboard-preview">
                      <Preview />
                      {/* Scheduled indicator */}
                      {d.schedule && (
                        <span className="dash-schedule-indicator">
                          <Calendar size={14} />
                        </span>
                      )}
                      {/* Alert indicator */}
                      {d.alerts?.length ? (
                        <span className="dash-alert-indicator">
                          <Bell size={14} />
                        </span>
                      ) : null}
                    </div>
                    <div className="dashboard-info">
                      <h3 className="dashboard-name">{dashboard.name}</h3>
                      <p className="dashboard-meta">
                        <span>{widgetBreakdown}</span>
                        <span className="meta-dot">&middot;</span>
                        <span>{formatRelativeDate(dashboard.updated_at)}</span>
                      </p>
                      {/* View count */}
                      {d.view_count != null && (
                        <p className="dashboard-views">
                          <Eye size={12} />
                          <span>{d.view_count} views</span>
                        </p>
                      )}
                      {dashboard.is_shared && <Badge variant="info">Shared</Badge>}
                      {/* Tag filter chips */}
                      {dashboard.tags && dashboard.tags.length > 0 && (
                        <div className="dash-tag-chips">
                          {dashboard.tags.map((tag) => (
                            <Badge key={tag} variant="default" className="dash-tag-chip">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="dashboard-card-actions">
                    <Dropdown
                      trigger={<button className="icon-btn" onClick={(e) => e.preventDefault()}><MoreVertical size={16} /></button>}
                      items={dropdownActions}
                      onSelect={(action) => handleDropdownAction(dashboard.id, action)}
                      align="right"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
