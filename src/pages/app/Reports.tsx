import { useState } from 'react';
import { Search, ChevronDown, FileText, Download, ExternalLink, Check } from 'lucide-react';
import './Reports.css';

interface Tab {
  id: string;
  label: string;
}

interface SortOption {
  id: string;
  label: string;
}

interface Report {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  category: string;
  tags: string[];
}

const tabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'industry', label: 'Industry' },
  { id: 'research', label: 'Research' },
  { id: 'custom', label: 'Custom' },
];

const sortOptions: SortOption[] = [
  { id: 'recent', label: 'Most recent' },
  { id: 'popular', label: 'Most popular' },
  { id: 'atoz', label: 'A to Z' },
];

const sampleReports: Report[] = [
  { id: 1, name: 'Q4 2024 Consumer Trends Report', type: 'PDF', size: '2.4 MB', date: '15 Jan 2025', category: 'research', tags: ['Consumer Trends', 'Global'] },
  { id: 2, name: 'Social Media Landscape 2024', type: 'PDF', size: '3.1 MB', date: '8 Jan 2025', category: 'industry', tags: ['Social Media', 'Digital'] },
  { id: 3, name: 'Gen Z Purchase Behavior Analysis', type: 'PDF', size: '1.8 MB', date: '2 Jan 2025', category: 'research', tags: ['Gen Z', 'Purchase'] },
  { id: 4, name: 'Global Brand Perception Study', type: 'PDF', size: '4.2 MB', date: '18 Dec 2024', category: 'industry', tags: ['Brand', 'Global'] },
  { id: 5, name: 'US Digital Advertising Report', type: 'PDF', size: '2.8 MB', date: '10 Dec 2024', category: 'industry', tags: ['Advertising', 'USA'] },
  { id: 6, name: 'Sustainability Consumer Index', type: 'PDF', size: '1.5 MB', date: '28 Nov 2024', category: 'research', tags: ['Sustainability', 'Attitudes'] },
  { id: 7, name: 'Media Consumption Q3 Summary', type: 'PDF', size: '3.4 MB', date: '15 Nov 2024', category: 'custom', tags: ['Media', 'Quarterly'] },
  { id: 8, name: 'E-commerce Growth Forecast 2025', type: 'PDF', size: '2.1 MB', date: '5 Nov 2024', category: 'industry', tags: ['E-commerce', 'Forecast'] },
  { id: 9, name: 'Health & Wellness Trend Report', type: 'PDF', size: '2.9 MB', date: '20 Oct 2024', category: 'research', tags: ['Health', 'Wellness'] },
  { id: 10, name: 'Custom Competitive Analysis', type: 'PDF', size: '1.2 MB', date: '10 Oct 2024', category: 'custom', tags: ['Competitive', 'Custom'] },
];

export default function Reports(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const filtered = sampleReports.filter((report: Report) => {
    const matchesTab = activeTab === 'all' || report.category === activeTab;
    const matchesSearch = !searchQuery || report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const sorted = [...filtered].sort((a: Report, b: Report) => {
    if (selectedSort === 'atoz') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleDownload = (id: number): void => {
    setDownloadingId(id);
    setTimeout(() => setDownloadingId(null), 1500);
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="page-title">Reports</h1>
        <div className="reports-tabs">
          {tabs.map((tab: Tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="reports-filters">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search reports by name or tag"
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
        <div className="reports-empty">
          <p>No reports match your search</p>
          <button className="reports-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>Clear filters</button>
        </div>
      ) : (
        <div className="reports-list">
          {sorted.map((report: Report) => (
            <div key={report.id} className="report-card">
              <div className="report-icon">
                <FileText size={24} />
              </div>
              <div className="report-info">
                <h3 className="report-name">{report.name}</h3>
                <div className="report-meta-row">
                  <span className="report-meta-item">{report.type}</span>
                  <span className="report-meta-dot">&middot;</span>
                  <span className="report-meta-item">{report.size}</span>
                  <span className="report-meta-dot">&middot;</span>
                  <span className="report-meta-item">{report.date}</span>
                </div>
                <div className="report-tags">
                  {report.tags.map((tag: string) => (
                    <span key={tag} className="report-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="report-actions">
                <button
                  className="report-download-btn"
                  onClick={() => handleDownload(report.id)}
                  disabled={downloadingId === report.id}
                >
                  <Download size={16} />
                  <span>{downloadingId === report.id ? 'Downloading...' : 'Download'}</span>
                </button>
                <button className="icon-btn" title="Open">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
