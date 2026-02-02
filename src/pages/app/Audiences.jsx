import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, Folder, Globe, Check } from 'lucide-react';
import './Audiences.css';

const tabs = [
  { id: 'all', label: 'All', icon: null },
  { id: 'my', label: 'My Audiences', icon: null },
  { id: 'shared', label: 'Shared', icon: null },
  { id: 'gwi', label: 'GWI Audiences', icon: Globe },
];

const sampleAudiences = [
  { id: 1, name: 'GWI Zeitgeist', owner: '', dateCreated: '11 Feb 2021', lastUpdated: '10 Mar 2025', type: 'folder' },
  { id: 2, name: 'GWI Open Access/Bespoke Audiences', owner: '', dateCreated: '19 Feb 2024', lastUpdated: '11 Feb 2025', type: 'folder' },
  { id: 3, name: 'GWI USA', owner: '', dateCreated: '29 Oct 2019', lastUpdated: '28 Jan 2025', type: 'folder' },
  { id: 4, name: 'GWI Demographics & Segmentations', owner: '', dateCreated: '29 Oct 2019', lastUpdated: '6 Jan 2025', type: 'folder' },
  { id: 5, name: 'GWI Travel', owner: '', dateCreated: '5 Oct 2022', lastUpdated: '30 Oct 2024', type: 'folder' },
  { id: 6, name: 'GWI Work', owner: '', dateCreated: '4 Sep 2020', lastUpdated: '13 Sep 2024', type: 'folder' },
  { id: 7, name: 'GWI Moments', owner: '', dateCreated: '6 Aug 2024', lastUpdated: '7 Aug 2024', type: 'folder' },
  { id: 8, name: 'GWI Sports', owner: '', dateCreated: '27 Apr 2021', lastUpdated: '6 Aug 2024', type: 'folder' },
  { id: 9, name: 'GWI Gaming', owner: '', dateCreated: '5 Oct 2022', lastUpdated: '22 Jul 2024', type: 'folder' },
];

const sortOptions = [
  { id: 'frequently', label: 'Frequently used' },
  { id: 'recently', label: 'Recently edited' },
  { id: 'atoz', label: 'A to Z' },
  { id: 'ztoa', label: 'Z to A' },
];

const datasetOptions = [
  { id: 'all', label: 'All' },
  { id: 'brand-tracker', label: 'Brand Tracker Wave 6' },
  { id: '2016', label: '2016' },
  { id: '2018', label: '2018' },
  { id: '2019', label: '2019' },
];

export default function Audiences() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('recently');
  const [selectedDataset, setSelectedDataset] = useState('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDatasetDropdown, setShowDatasetDropdown] = useState(false);

  return (
    <div className="audiences-page">
      <div className="audiences-header">
        <h1 className="page-title">Audiences</h1>
        <div className="audiences-tabs">
          {tabs.map((tab) => (
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
        <Link to="/app/audiences/new" className="btn-create">
          <span>Create new audience</span>
          <Plus size={18} />
        </Link>
      </div>

      <div className="audiences-filters">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search audiences"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <button
            className={`filter-btn ${showDatasetDropdown ? 'active' : ''}`}
            onClick={() => setShowDatasetDropdown(!showDatasetDropdown)}
          >
            <span className="filter-label">Data Set:</span>
            <span className="filter-value">
              {datasetOptions.find(d => d.id === selectedDataset)?.label || 'All'}
            </span>
            <ChevronDown size={16} />
          </button>
          {showDatasetDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span>0 Selected</span>
                <button className="clear-btn">Clear</button>
              </div>
              {datasetOptions.map((option) => (
                <label key={option.id} className="dropdown-option">
                  <input
                    type="checkbox"
                    checked={selectedDataset === option.id}
                    onChange={() => setSelectedDataset(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="filter-dropdown">
          <button
            className={`filter-btn ${showSortDropdown ? 'active' : ''}`}
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <span className="filter-label">Sort by</span>
            <span className="filter-value">
              {sortOptions.find(s => s.id === selectedSort)?.label}
            </span>
            <ChevronDown size={16} />
          </button>
          {showSortDropdown && (
            <div className="dropdown-menu">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  className={`dropdown-option-btn ${selectedSort === option.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSort(option.id);
                    setShowSortDropdown(false);
                  }}
                >
                  {selectedSort === option.id && <Check size={16} className="check-icon" />}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="audiences-table">
        <div className="table-header">
          <div className="table-cell name-cell">Name</div>
          <div className="table-cell">Owned by</div>
          <div className="table-cell">Date created</div>
          <div className="table-cell">Last updated</div>
        </div>
        <div className="table-body">
          {sampleAudiences.map((audience) => (
            <Link
              key={audience.id}
              to={`/app/audiences/${audience.id}`}
              className="table-row"
            >
              <div className="table-cell name-cell">
                <Folder size={18} className="folder-icon" />
                <Globe size={14} className="globe-icon" />
                <span>{audience.name}</span>
              </div>
              <div className="table-cell">{audience.owner}</div>
              <div className="table-cell">{audience.dateCreated}</div>
              <div className="table-cell">{audience.lastUpdated}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
