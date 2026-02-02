import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, Grid3X3 } from 'lucide-react';
import './Crosstabs.css';

const sampleCrosstabs = [
  { id: 1, name: 'Demographics Overview', rows: 12, columns: 8, lastUpdated: '3 hours ago' },
  { id: 2, name: 'Media Consumption Q1', rows: 24, columns: 15, lastUpdated: '2 days ago' },
  { id: 3, name: 'Brand Comparison', rows: 8, columns: 6, lastUpdated: '1 week ago' },
];

export default function Crosstabs() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="crosstabs-page">
      <div className="crosstabs-header">
        <h1 className="page-title">Crosstabs</h1>
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-btn">
          <span>Sort by</span>
          <span className="filter-value">Recently edited</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="crosstabs-list">
        {sampleCrosstabs.map((crosstab) => (
          <Link key={crosstab.id} to={`/app/crosstabs/${crosstab.id}`} className="crosstab-card">
            <div className="crosstab-icon">
              <Grid3X3 size={24} />
            </div>
            <div className="crosstab-info">
              <h3 className="crosstab-name">{crosstab.name}</h3>
              <p className="crosstab-meta">
                {crosstab.rows} rows × {crosstab.columns} columns • {crosstab.lastUpdated}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
