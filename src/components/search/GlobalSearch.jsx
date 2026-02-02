import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, BarChart2, Users, Tv, Globe, Tag } from 'lucide-react';
import './GlobalSearch.css';

const datasets = ['All Datasets', 'GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Kids', 'GWI Work'];

const sampleResults = [
  { id: 1, text: 'Age of respondent', category: 'Demographics', dataset: 'GWI Core', icon: Users },
  { id: 2, text: 'Gender identity', category: 'Demographics', dataset: 'GWI Core', icon: Users },
  { id: 3, text: 'Social media platforms used in the past month', category: 'Media Consumption', dataset: 'GWI Core', icon: Tv },
  { id: 4, text: 'Time spent watching online TV per day', category: 'Media Consumption', dataset: 'GWI Core', icon: Tv },
  { id: 5, text: 'Brands purchased in the last 3 months', category: 'Brand Perceptions', dataset: 'GWI Core', icon: Tag },
  { id: 6, text: 'Household income bracket', category: 'Demographics', dataset: 'GWI Core', icon: Users },
  { id: 7, text: 'Attitudes toward sustainability', category: 'Attitudes & Lifestyle', dataset: 'GWI Zeitgeist', icon: Globe },
  { id: 8, text: 'Devices used to access the internet', category: 'Technology', dataset: 'GWI Core', icon: BarChart2 },
  { id: 9, text: 'Online purchase frequency', category: 'Purchase Journey', dataset: 'GWI Core', icon: Tag },
  { id: 10, text: 'Preferred news sources', category: 'Media Consumption', dataset: 'GWI USA', icon: Tv },
];

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [dataset, setDataset] = useState('All Datasets');
  const [datasetOpen, setDatasetOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filtered = sampleResults.filter((r) => {
    const matchesQuery = !query || r.text.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase());
    const matchesDataset = dataset === 'All Datasets' || r.dataset === dataset;
    return matchesQuery && matchesDataset;
  });

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleResultClick = () => {
    onClose();
    navigate('/app/chart-builder/chart/new');
  };

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-input-row">
          <Search size={20} className="global-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Search attributes, audiences, charts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="global-search-dataset-wrapper">
            <button
              className="global-search-dataset-btn"
              onClick={() => setDatasetOpen(!datasetOpen)}
            >
              <span>{dataset}</span>
              <ChevronDown size={14} />
            </button>
            {datasetOpen && (
              <div className="global-search-dataset-dropdown">
                {datasets.map((d) => (
                  <button
                    key={d}
                    className={`global-search-dataset-option ${d === dataset ? 'selected' : ''}`}
                    onClick={() => { setDataset(d); setDatasetOpen(false); }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="global-search-results">
          {Object.keys(grouped).length === 0 && (
            <div className="global-search-empty">No results found</div>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="global-search-group">
              <div className="global-search-group-label">{category}</div>
              {items.map((item) => (
                <button
                  key={item.id}
                  className="global-search-result"
                  onClick={handleResultClick}
                >
                  <item.icon size={16} className="global-search-result-icon" />
                  <span className="global-search-result-text">{item.text}</span>
                  <span className="global-search-result-badge">{item.category}</span>
                  <span className="global-search-result-dataset">{item.dataset}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="global-search-footer">
          <span className="global-search-hint">Press <kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
