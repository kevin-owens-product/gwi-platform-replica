import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, Check, Globe, LayoutDashboard, LucideIcon } from 'lucide-react';
import './Dashboards.css';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface SortOption {
  id: string;
  label: string;
}

type PreviewType = 'bars' | 'line' | 'pie' | 'mixed';

interface Dashboard {
  id: number;
  name: string;
  widgets: number;
  lastUpdated: string;
  owner: string;
  tab: string;
  previewType: PreviewType;
}

const tabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Dashboards' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Dashboards', icon: Globe },
];

const sortOptions: SortOption[] = [
  { id: 'recently', label: 'Recently edited' },
  { id: 'frequently', label: 'Frequently used' },
  { id: 'atoz', label: 'A to Z' },
  { id: 'ztoa', label: 'Z to A' },
];

const sampleDashboards: Dashboard[] = [
  { id: 1, name: 'Q4 Performance Overview', widgets: 8, lastUpdated: '1 hour ago', owner: 'Kevin Owens', tab: 'my', previewType: 'mixed' },
  { id: 2, name: 'Social Media Insights', widgets: 6, lastUpdated: '5 hours ago', owner: 'Kevin Owens', tab: 'my', previewType: 'bars' },
  { id: 3, name: 'Brand Health Dashboard', widgets: 12, lastUpdated: '2 days ago', owner: 'Sarah Chen', tab: 'shared', previewType: 'line' },
  { id: 4, name: 'Customer Segments Analysis', widgets: 10, lastUpdated: '1 week ago', owner: 'Mike Johnson', tab: 'shared', previewType: 'pie' },
  { id: 5, name: 'GWI Market Overview', widgets: 15, lastUpdated: '2 weeks ago', owner: '', tab: 'gwi', previewType: 'mixed' },
  { id: 6, name: 'Competitive Landscape', widgets: 9, lastUpdated: '3 weeks ago', owner: 'Emily Davis', tab: 'shared', previewType: 'bars' },
  { id: 7, name: 'Media Consumption Tracker', widgets: 7, lastUpdated: '1 month ago', owner: 'Kevin Owens', tab: 'my', previewType: 'line' },
  { id: 8, name: 'GWI Demographics Dashboard', widgets: 14, lastUpdated: '1 month ago', owner: '', tab: 'gwi', previewType: 'pie' },
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

const previews: Record<PreviewType, React.FC> = { bars: PreviewBars, line: PreviewLine, pie: PreviewPie, mixed: PreviewMixed };

export default function Dashboards(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('recently');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);

  const filtered = sampleDashboards.filter((d: Dashboard) => {
    const matchesTab = activeTab === 'all' || d.tab === activeTab;
    const matchesSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const sorted = [...filtered].sort((a: Dashboard, b: Dashboard) => {
    if (selectedSort === 'atoz') return a.name.localeCompare(b.name);
    if (selectedSort === 'ztoa') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="dashboards-page">
      <div className="dashboards-header">
        <h1 className="page-title">Dashboards</h1>
        <div className="dashboards-tabs">
          {tabs.map((tab: Tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon && <tab.icon size={16} />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <Link to="/app/dashboards/new" className="btn-create">
          <span>Create new dashboard</span>
          <Plus size={18} />
        </Link>
      </div>

      <div className="dashboards-filters">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search dashboards"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <button
            className={`filter-btn ${showSortDropdown ? 'open' : ''}`}
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <span className="filter-label">Sort by</span>
            <span className="filter-value">{sortOptions.find(s => s.id === selectedSort)?.label}</span>
            <ChevronDown size={16} />
          </button>
          {showSortDropdown && (
            <div className="dropdown-menu">
              {sortOptions.map((option: SortOption) => (
                <button
                  key={option.id}
                  className={`dropdown-option-btn ${selectedSort === option.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedSort(option.id); setShowSortDropdown(false); }}
                >
                  {selectedSort === option.id && <Check size={16} className="check-icon" />}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="dashboards-empty">
          <p>No dashboards match your filters</p>
          <button className="dashboards-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>Clear filters</button>
        </div>
      ) : (
        <div className="dashboards-grid">
          {sorted.map((dashboard: Dashboard) => {
            const Preview = previews[dashboard.previewType] || PreviewMixed;
            return (
              <Link key={dashboard.id} to={`/app/dashboards/${dashboard.id}`} className="dashboard-card">
                <div className="dashboard-preview">
                  <Preview />
                </div>
                <div className="dashboard-info">
                  <h3 className="dashboard-name">{dashboard.name}</h3>
                  <p className="dashboard-meta">
                    <span>{dashboard.widgets} widgets</span>
                    <span className="meta-dot">&middot;</span>
                    <span>{dashboard.lastUpdated}</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
