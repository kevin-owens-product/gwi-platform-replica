import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Globe, LayoutDashboard, MoreVertical, Edit, Copy, Trash2,
  Loader2, Star, Eye, BarChart3, Users, Target, TrendingUp,
  ArrowUpDown, Grid3X3,
} from 'lucide-react';
import { useDashboards, useDeleteDashboard } from '@/hooks/useDashboards';
import { SearchInput, Tabs, Pagination, EmptyState, Badge, Dropdown } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { Dashboard } from '@/api/types';
import './Dashboards.css';

type PreviewType = 'bars' | 'line' | 'pie' | 'mixed';

// --- Templates data ---
interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  previewType: PreviewType;
}

const templates: DashboardTemplate[] = [
  {
    id: 'brand-health',
    name: 'Brand Health Monitor',
    description: 'Track brand awareness, perception, and loyalty metrics across markets.',
    icon: <TrendingUp size={24} />,
    previewType: 'line',
  },
  {
    id: 'social-media',
    name: 'Social Media Performance',
    description: 'Monitor engagement, reach, and growth across all social platforms.',
    icon: <BarChart3 size={24} />,
    previewType: 'bars',
  },
  {
    id: 'audience-demographics',
    name: 'Audience Demographics Overview',
    description: 'Visualize audience segments by age, gender, income, and location.',
    icon: <Users size={24} />,
    previewType: 'pie',
  },
  {
    id: 'campaign-roi',
    name: 'Campaign ROI Tracker',
    description: 'Measure campaign effectiveness with cost, conversion, and ROI analysis.',
    icon: <Target size={24} />,
    previewType: 'mixed',
  },
];

// --- Sort options ---
type SortOption = 'updated' | 'name' | 'widgets';

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Recently Updated', value: 'updated' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Most Widgets', value: 'widgets' },
];

// --- Mock "last viewed" data ---
const lastViewedMap: Record<string, string> = {};
function getLastViewed(dashboardId: string): string {
  if (!lastViewedMap[dashboardId]) {
    const options = ['2 hours ago', '5 hours ago', 'Yesterday', '3 days ago', 'Last week'];
    lastViewedMap[dashboardId] = options[Math.abs(dashboardId.charCodeAt(0) + dashboardId.length) % options.length];
  }
  return lastViewedMap[dashboardId];
}

// --- Tab items ---
const tabItems = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Dashboards' },
  { id: 'shared', label: 'Shared' },
  { id: 'favorites', label: 'Favorites', icon: <Star size={16} /> },
  { id: 'gwi', label: 'GWI Dashboards', icon: <Globe size={16} /> },
];

// --- Preview SVG components ---

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
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showTemplates, setShowTemplates] = useState<boolean>(true);

  const { data, isLoading, isError } = useDashboards({ page, per_page: 20, search: searchQuery || undefined });
  const deleteDashboard = useDeleteDashboard();

  const dashboards = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages ?? 1;

  const toggleFavorite = (dashboardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(dashboardId)) {
        next.delete(dashboardId);
      } else {
        next.add(dashboardId);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = dashboards.filter((d: Dashboard) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'shared') return d.is_shared;
      if (activeTab === 'my') return !d.is_shared;
      if (activeTab === 'favorites') return favorites.has(d.id);
      return true;
    });

    // Sort
    result = [...result].sort((a: Dashboard, b: Dashboard) => {
      switch (sortBy) {
        case 'name':
          return (a.name ?? '').localeCompare(b.name ?? '');
        case 'widgets':
          return (b.widgets?.length ?? 0) - (a.widgets?.length ?? 0);
        case 'updated':
        default:
          return new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();
      }
    });

    return result;
  }, [dashboards, activeTab, sortBy, favorites]);

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

      {/* Templates Section */}
      {showTemplates && activeTab !== 'favorites' && (
        <div className="templates-section">
          <div className="templates-header">
            <div className="templates-header-left">
              <Grid3X3 size={18} className="templates-header-icon" />
              <h2 className="templates-title">Templates</h2>
              <span className="templates-count">{templates.length} templates</span>
            </div>
            <button className="templates-hide-btn" onClick={() => setShowTemplates(false)}>
              Hide
            </button>
          </div>
          <div className="templates-grid">
            {templates.map((template) => {
              const Preview = previewComponents[template.previewType];
              return (
                <div key={template.id} className="template-card">
                  <div className="template-preview">
                    <div className="template-icon">{template.icon}</div>
                    <Preview />
                  </div>
                  <div className="template-info">
                    <h3 className="template-name">{template.name}</h3>
                    <p className="template-description">{template.description}</p>
                    <Link to="/app/dashboards/new" className="template-use-btn">
                      Use Template
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="dashboards-filters">
        <SearchInput
          value={searchQuery}
          onChange={(value) => { setSearchQuery(value); setPage(1); }}
          placeholder="Search dashboards"
        />
        <div className="sort-dropdown">
          <ArrowUpDown size={14} className="sort-icon" />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
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
          title={activeTab === 'favorites' ? 'No favorite dashboards' : 'No dashboards found'}
          description={
            activeTab === 'favorites'
              ? 'Star dashboards to add them to your favorites'
              : searchQuery
                ? 'No dashboards match your search'
                : 'Create your first dashboard to get started'
          }
          action={
            activeTab === 'favorites' ? (
              <button className="dashboards-empty-btn" onClick={() => setActiveTab('all')}>View all dashboards</button>
            ) : searchQuery ? (
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
              const isFavorited = favorites.has(dashboard.id);
              const widgetCount = dashboard.widgets?.length ?? 0;
              return (
                <div key={dashboard.id} className="dashboard-card">
                  <Link to={`/app/dashboards/${dashboard.id}`} className="dashboard-card-link">
                    <div className="dashboard-preview">
                      <Preview />
                      {/* Widget count badge */}
                      <span className="widget-count-badge">
                        <LayoutDashboard size={12} />
                        {widgetCount}
                      </span>
                    </div>
                    <div className="dashboard-info">
                      <h3 className="dashboard-name">{dashboard.name}</h3>
                      <p className="dashboard-meta">
                        <span>{widgetCount} widgets</span>
                        <span className="meta-dot">&middot;</span>
                        <span>{formatRelativeDate(dashboard.updated_at)}</span>
                      </p>
                      <div className="dashboard-last-viewed">
                        <Eye size={12} />
                        <span>Viewed {getLastViewed(dashboard.id)}</span>
                      </div>
                      {dashboard.is_shared && <Badge variant="info">Shared</Badge>}
                    </div>
                  </Link>
                  {/* Favorite star button */}
                  <button
                    className={`dashboard-star-btn ${isFavorited ? 'favorited' : ''}`}
                    onClick={(e) => toggleFavorite(dashboard.id, e)}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
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
