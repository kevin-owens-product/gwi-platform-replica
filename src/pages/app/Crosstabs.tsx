import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, Check, Globe, Grid3X3, Users, LucideIcon } from 'lucide-react';
import './Crosstabs.css';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface SortOption {
  id: string;
  label: string;
}

interface Crosstab {
  id: number;
  name: string;
  rows: number;
  columns: number;
  lastUpdated: string;
  owner: string;
  tab: string;
  dataset: string;
}

const tabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Crosstabs' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Crosstabs', icon: Globe },
];

const sortOptions: SortOption[] = [
  { id: 'recently', label: 'Recently edited' },
  { id: 'frequently', label: 'Frequently used' },
  { id: 'atoz', label: 'A to Z' },
  { id: 'ztoa', label: 'Z to A' },
];

const sampleCrosstabs: Crosstab[] = [
  { id: 1, name: 'Demographics Overview', rows: 12, columns: 8, lastUpdated: '3 hours ago', owner: 'Kevin Owens', tab: 'my', dataset: 'GWI Core' },
  { id: 2, name: 'Media Consumption Q1 2025', rows: 24, columns: 15, lastUpdated: '2 days ago', owner: 'Kevin Owens', tab: 'my', dataset: 'GWI Core' },
  { id: 3, name: 'Brand Comparison - Tech', rows: 8, columns: 6, lastUpdated: '1 week ago', owner: 'Sarah Chen', tab: 'shared', dataset: 'GWI Core' },
  { id: 4, name: 'Social Media by Age Group', rows: 16, columns: 10, lastUpdated: '1 week ago', owner: 'Kevin Owens', tab: 'my', dataset: 'GWI Core' },
  { id: 5, name: 'Purchase Behavior by Region', rows: 20, columns: 12, lastUpdated: '2 weeks ago', owner: 'Mike Johnson', tab: 'shared', dataset: 'GWI USA' },
  { id: 6, name: 'GWI Standard - Demographics', rows: 32, columns: 18, lastUpdated: '1 month ago', owner: '', tab: 'gwi', dataset: 'GWI Core' },
  { id: 7, name: 'Gaming Habits by Gender', rows: 14, columns: 8, lastUpdated: '3 weeks ago', owner: 'Emily Davis', tab: 'shared', dataset: 'GWI Core' },
  { id: 8, name: 'GWI Standard - Media Matrix', rows: 28, columns: 20, lastUpdated: '2 months ago', owner: '', tab: 'gwi', dataset: 'GWI Core' },
];

export default function Crosstabs(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('recently');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);

  const filtered = sampleCrosstabs.filter((ct: Crosstab) => {
    const matchesTab = activeTab === 'all' || ct.tab === activeTab;
    const matchesSearch = !searchQuery || ct.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const sorted = [...filtered].sort((a: Crosstab, b: Crosstab) => {
    if (selectedSort === 'atoz') return a.name.localeCompare(b.name);
    if (selectedSort === 'ztoa') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="crosstabs-page">
      <div className="crosstabs-header">
        <h1 className="page-title">Crosstabs</h1>
        <div className="crosstabs-tabs">
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
        <Link to="/app/crosstabs/new" className="btn-create">
          <span>Create new crosstab</span>
          <Plus size={18} />
        </Link>
      </div>

      <div className="crosstabs-filters">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search crosstabs"
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
        <div className="crosstabs-empty">
          <p>No crosstabs match your filters</p>
          <button className="crosstabs-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>Clear filters</button>
        </div>
      ) : (
        <div className="crosstabs-table">
          <div className="ct-table-header">
            <div className="ct-cell ct-name-cell">Name</div>
            <div className="ct-cell">Size</div>
            <div className="ct-cell">Dataset</div>
            <div className="ct-cell">Last updated</div>
          </div>
          <div className="ct-table-body">
            {sorted.map((ct: Crosstab) => (
              <Link key={ct.id} to={`/app/crosstabs/${ct.id}`} className="ct-table-row">
                <div className="ct-cell ct-name-cell">
                  <div className="ct-icon-wrapper">
                    <Grid3X3 size={18} />
                  </div>
                  <div>
                    <span className="ct-row-name">{ct.name}</span>
                    {ct.owner && <span className="ct-row-owner">{ct.owner}</span>}
                  </div>
                </div>
                <div className="ct-cell ct-size">{ct.rows} rows x {ct.columns} cols</div>
                <div className="ct-cell"><span className="ct-dataset-badge">{ct.dataset}</span></div>
                <div className="ct-cell ct-date">{ct.lastUpdated}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
