import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, LayoutDashboard } from 'lucide-react';
import './Dashboards.css';

const sampleDashboards = [
  { id: 1, name: 'Q4 Performance Overview', widgets: 8, lastUpdated: '1 hour ago' },
  { id: 2, name: 'Social Media Insights', widgets: 6, lastUpdated: '5 hours ago' },
  { id: 3, name: 'Brand Health Dashboard', widgets: 12, lastUpdated: '2 days ago' },
  { id: 4, name: 'Customer Segments Analysis', widgets: 10, lastUpdated: '1 week ago' },
];

export default function Dashboards() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="dashboards-page">
      <div className="dashboards-header">
        <h1 className="page-title">Dashboards</h1>
        <button className="btn-create">
          <span>Create new dashboard</span>
          <Plus size={18} />
        </button>
      </div>

      <div className="dashboards-filters">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search dashboards"
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

      <div className="dashboards-grid">
        {sampleDashboards.map((dashboard) => (
          <Link key={dashboard.id} to={`/app/dashboards/${dashboard.id}`} className="dashboard-card">
            <div className="dashboard-preview">
              <LayoutDashboard size={48} className="dashboard-preview-icon" />
            </div>
            <div className="dashboard-info">
              <h3 className="dashboard-name">{dashboard.name}</h3>
              <p className="dashboard-meta">
                <span>{dashboard.widgets} widgets</span>
                <span>•</span>
                <span>{dashboard.lastUpdated}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
