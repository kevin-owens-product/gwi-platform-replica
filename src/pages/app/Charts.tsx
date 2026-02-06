import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, Check, Globe, LucideIcon } from 'lucide-react';
import './Charts.css';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface SortOption {
  id: string;
  label: string;
}

interface TypeOption {
  id: string;
  label: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'stacked';

interface SampleChart {
  id: number;
  name: string;
  type: ChartType;
  owner: string;
  lastUpdated: string;
  tab: string;
  dataset: string;
}

const tabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Charts' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Charts', icon: Globe },
];

const sortOptions: SortOption[] = [
  { id: 'recently', label: 'Recently edited' },
  { id: 'frequently', label: 'Frequently used' },
  { id: 'atoz', label: 'A to Z' },
  { id: 'ztoa', label: 'Z to A' },
];

const typeOptions: TypeOption[] = [
  { id: 'all', label: 'All types' },
  { id: 'bar', label: 'Bar Chart' },
  { id: 'line', label: 'Line Chart' },
  { id: 'pie', label: 'Pie Chart' },
  { id: 'stacked', label: 'Stacked Bar' },
];

const sampleCharts: SampleChart[] = [
  { id: 1, name: 'Social Media Usage by Age', type: 'bar', owner: 'Kevin Owens', lastUpdated: '2 hours ago', tab: 'my', dataset: 'GWI Core' },
  { id: 2, name: 'Device Preferences Q4 2024', type: 'pie', owner: 'Kevin Owens', lastUpdated: '1 day ago', tab: 'my', dataset: 'GWI Core' },
  { id: 3, name: 'Brand Awareness Trends', type: 'line', owner: 'Sarah Chen', lastUpdated: '3 days ago', tab: 'shared', dataset: 'GWI Zeitgeist' },
  { id: 4, name: 'Purchase Intent by Region', type: 'bar', owner: 'Kevin Owens', lastUpdated: '1 week ago', tab: 'my', dataset: 'GWI Core' },
  { id: 5, name: 'Streaming Platform Market Share', type: 'pie', owner: 'Sarah Chen', lastUpdated: '1 week ago', tab: 'shared', dataset: 'GWI Core' },
  { id: 6, name: 'Consumer Confidence Index', type: 'line', owner: 'Mike Johnson', lastUpdated: '2 weeks ago', tab: 'shared', dataset: 'GWI Zeitgeist' },
  { id: 7, name: 'Gen Z vs Millennials - Media', type: 'stacked', owner: 'Kevin Owens', lastUpdated: '2 weeks ago', tab: 'my', dataset: 'GWI Core' },
  { id: 8, name: 'Ad Recall by Channel', type: 'bar', owner: '', lastUpdated: '3 weeks ago', tab: 'gwi', dataset: 'GWI Core' },
  { id: 9, name: 'Sustainability Attitudes by Region', type: 'stacked', owner: '', lastUpdated: '1 month ago', tab: 'gwi', dataset: 'GWI Zeitgeist' },
  { id: 10, name: 'Online Shopping Frequency', type: 'line', owner: 'Emily Davis', lastUpdated: '1 month ago', tab: 'shared', dataset: 'GWI USA' },
  { id: 11, name: 'Health & Wellness Priorities', type: 'bar', owner: '', lastUpdated: '1 month ago', tab: 'gwi', dataset: 'GWI Core' },
  { id: 12, name: 'Podcast Listening Habits', type: 'line', owner: 'Kevin Owens', lastUpdated: '6 weeks ago', tab: 'my', dataset: 'GWI Core' },
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

const miniCharts: Record<ChartType, () => React.JSX.Element> = { bar: MiniBar, line: MiniLine, pie: MiniPie, stacked: MiniStacked };

export default function Charts(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('recently');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showTypeDropdown, setShowTypeDropdown] = useState<boolean>(false);

  const filtered: SampleChart[] = sampleCharts.filter((chart: SampleChart) => {
    const matchesTab = activeTab === 'all' || chart.tab === activeTab;
    const matchesSearch = !searchQuery || chart.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || chart.type === selectedType;
    return matchesTab && matchesSearch && matchesType;
  });

  const sorted: SampleChart[] = [...filtered].sort((a: SampleChart, b: SampleChart) => {
    if (selectedSort === 'atoz') return a.name.localeCompare(b.name);
    if (selectedSort === 'ztoa') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="charts-page">
      <div className="charts-header">
        <h1 className="page-title">Charts</h1>
        <div className="charts-tabs">
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
        <Link to="/app/chart-builder/chart/new" className="btn-create">
          <span>Create new chart</span>
          <Plus size={18} />
        </Link>
      </div>

      <div className="charts-filters">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search charts"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <button
            className={`filter-btn ${showTypeDropdown ? 'open' : ''}`}
            onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowSortDropdown(false); }}
          >
            <span className="filter-label">Type:</span>
            <span className="filter-value">{typeOptions.find((t: TypeOption) => t.id === selectedType)?.label}</span>
            <ChevronDown size={16} />
          </button>
          {showTypeDropdown && (
            <div className="dropdown-menu">
              {typeOptions.map((option: TypeOption) => (
                <button
                  key={option.id}
                  className={`dropdown-option-btn ${selectedType === option.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedType(option.id); setShowTypeDropdown(false); }}
                >
                  {selectedType === option.id && <Check size={16} className="check-icon" />}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="filter-dropdown">
          <button
            className={`filter-btn ${showSortDropdown ? 'open' : ''}`}
            onClick={() => { setShowSortDropdown(!showSortDropdown); setShowTypeDropdown(false); }}
          >
            <span className="filter-label">Sort by</span>
            <span className="filter-value">{sortOptions.find((s: SortOption) => s.id === selectedSort)?.label}</span>
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
        <div className="charts-empty">
          <p>No charts match your filters</p>
          <button className="charts-empty-btn" onClick={() => { setSearchQuery(''); setSelectedType('all'); setActiveTab('all'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="charts-grid">
          {sorted.map((chart: SampleChart) => {
            const MiniChart = miniCharts[chart.type] || MiniBar;
            return (
              <Link key={chart.id} to={`/app/chart-builder/chart/${chart.id}`} className="chart-card">
                <div className="chart-preview">
                  <MiniChart />
                </div>
                <div className="chart-info">
                  <h3 className="chart-name">{chart.name}</h3>
                  <p className="chart-meta">
                    <span className="chart-type-badge">{typeOptions.find((t: TypeOption) => t.id === chart.type)?.label}</span>
                    <span className="chart-dataset">{chart.dataset}</span>
                  </p>
                  <p className="chart-updated">{chart.lastUpdated}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
