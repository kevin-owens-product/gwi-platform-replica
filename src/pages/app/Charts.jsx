import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, BarChart2 } from 'lucide-react';
import './Charts.css';

const sampleCharts = [
  { id: 1, name: 'Social Media Usage by Age', type: 'Bar Chart', lastUpdated: '2 hours ago' },
  { id: 2, name: 'Device Preferences Q4 2024', type: 'Pie Chart', lastUpdated: '1 day ago' },
  { id: 3, name: 'Brand Awareness Trends', type: 'Line Chart', lastUpdated: '3 days ago' },
  { id: 4, name: 'Purchase Intent by Region', type: 'Bar Chart', lastUpdated: '1 week ago' },
];

export default function Charts() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="charts-page">
      <div className="charts-header">
        <h1 className="page-title">Charts</h1>
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-btn">
          <span>Sort by</span>
          <span className="filter-value">Recently edited</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="charts-grid">
        {sampleCharts.map((chart) => (
          <Link key={chart.id} to={`/app/chart-builder/chart/${chart.id}`} className="chart-card">
            <div className="chart-preview">
              <BarChart2 size={48} className="chart-preview-icon" />
            </div>
            <div className="chart-info">
              <h3 className="chart-name">{chart.name}</h3>
              <p className="chart-meta">
                <span>{chart.type}</span>
                <span>•</span>
                <span>{chart.lastUpdated}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
