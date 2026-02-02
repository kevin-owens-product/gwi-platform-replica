import { useState } from 'react';
import { Search, ChevronDown, FileText, Download, ExternalLink } from 'lucide-react';
import './Reports.css';

const sampleReports = [
  { id: 1, name: 'Q4 2024 Consumer Trends Report', type: 'PDF', size: '2.4 MB', date: '15 Jan 2025' },
  { id: 2, name: 'Social Media Landscape 2024', type: 'PDF', size: '3.1 MB', date: '8 Jan 2025' },
  { id: 3, name: 'Gen Z Purchase Behavior Analysis', type: 'PDF', size: '1.8 MB', date: '2 Jan 2025' },
  { id: 4, name: 'Global Brand Perception Study', type: 'PDF', size: '4.2 MB', date: '18 Dec 2024' },
];

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div className="reports-filters">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search reports"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-btn">
          <span>Sort by</span>
          <span className="filter-value">Most recent</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="reports-list">
        {sampleReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-icon">
              <FileText size={24} />
            </div>
            <div className="report-info">
              <h3 className="report-name">{report.name}</h3>
              <p className="report-meta">
                <span>{report.type}</span>
                <span>•</span>
                <span>{report.size}</span>
                <span>•</span>
                <span>{report.date}</span>
              </p>
            </div>
            <div className="report-actions">
              <button className="icon-btn" title="Download">
                <Download size={18} />
              </button>
              <button className="icon-btn" title="Open">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
