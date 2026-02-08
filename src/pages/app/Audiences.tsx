import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Folder,
  Globe,
  Check,
  ChevronDown,
  Loader2,
  Users,
  GitCompare,
  X,
  Trash2,
  Download,
  Merge,
} from 'lucide-react';
import { useAudiences } from '@/hooks/useAudiences';
import { SearchInput, Tabs, Pagination, Badge, EmptyState } from '@/components/shared';
import { formatDate } from '@/utils/format';
import type { AudienceListParams } from '@/api/types';
import './Audiences.css';

interface SortOption {
  id: AudienceListParams['sort_by'] | 'frequently';
  label: string;
  apiValue?: AudienceListParams['sort_by'];
}

interface DatasetOption {
  id: string;
  label: string;
}

interface DemographicData {
  '16-24': number;
  '25-34': number;
  '35-44': number;
  '45-54': number;
  '55+': number;
}

const tabItems = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Audiences' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Audiences', icon: <Globe size={16} /> },
];

const sortOptions: SortOption[] = [
  { id: 'frequently', label: 'Frequently used', apiValue: undefined },
  { id: 'updated_at', label: 'Recently edited', apiValue: 'updated_at' },
  { id: 'name', label: 'A to Z', apiValue: 'name' },
];

const datasetOptions: DatasetOption[] = [
  { id: 'all', label: 'All' },
  { id: 'brand-tracker', label: 'Brand Tracker Wave 6' },
  { id: '2016', label: '2016' },
  { id: '2018', label: '2018' },
  { id: '2019', label: '2019' },
];

/* --- Mock demographic data keyed by a hash of the audience id --- */
const mockDemographics: DemographicData[] = [
  { '16-24': 28, '25-34': 32, '35-44': 20, '45-54': 12, '55+': 8 },
  { '16-24': 15, '25-34': 22, '35-44': 30, '45-54': 20, '55+': 13 },
  { '16-24': 35, '25-34': 30, '35-44': 18, '45-54': 10, '55+': 7 },
  { '16-24': 10, '25-34': 18, '35-44': 25, '45-54': 28, '55+': 19 },
  { '16-24': 22, '25-34': 28, '35-44': 24, '45-54': 16, '55+': 10 },
];

const mockAudienceSizes = [1240000, 870000, 2100000, 560000, 1750000, 930000, 420000, 1600000];

const barColors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

function getDemoForAudience(id: string): DemographicData {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return mockDemographics[Math.abs(hash) % mockDemographics.length];
}

function getSizeForAudience(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 37 + id.charCodeAt(i)) | 0;
  }
  return mockAudienceSizes[Math.abs(hash) % mockAudienceSizes.length];
}

function formatSize(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function Audiences(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('updated_at');
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [showDatasetDropdown, setShowDatasetDropdown] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  /* --- Compare mode state --- */
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sortOption = sortOptions.find((s) => s.id === selectedSort);
  const sortBy = sortOption?.apiValue ?? 'updated_at';

  const { data, isLoading, isError } = useAudiences({
    page,
    per_page: 20,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: 'desc',
  });

  const audiences = data?.data ?? [];
  const totalPages = data?.meta?.total_pages ?? 1;

  /* --- Compute max audience size for relative bar width --- */
  const maxSize = useMemo(() => {
    if (audiences.length === 0) return 1;
    return Math.max(...audiences.map((a) => getSizeForAudience(a.id)));
  }, [audiences]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const toggleCompareMode = () => {
    setCompareMode((prev) => !prev);
    setSelectedIds([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const removeFromSelection = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const selectedAudiences = audiences.filter((a) => selectedIds.includes(a.id));

  return (
    <div className="audiences-page">
      <div className="audiences-header">
        <h1 className="page-title">Audiences</h1>
        <div className="audiences-tabs">
          <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <button
          className={`btn-compare ${compareMode ? 'active' : ''}`}
          onClick={toggleCompareMode}
        >
          <GitCompare size={16} />
          <span>{compareMode ? 'Exit Compare' : 'Compare'}</span>
        </button>
        <Link to="/app/audiences/new" className="btn-create">
          <span>Create new audience</span>
          <Plus size={18} />
        </Link>
      </div>

      {/* --- Batch Action Toolbar --- */}
      {compareMode && selectedIds.length > 0 && (
        <div className="batch-toolbar">
          <span className="batch-toolbar__count">
            {selectedIds.length} audience{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="batch-toolbar__actions">
            <button className="batch-action-btn batch-action-btn--danger">
              <Trash2 size={15} />
              <span>Delete Selected</span>
            </button>
            <button className="batch-action-btn">
              <Download size={15} />
              <span>Export Selected</span>
            </button>
            <button className="batch-action-btn">
              <Merge size={15} />
              <span>Merge Audiences</span>
            </button>
          </div>
        </div>
      )}

      <div className="audiences-filters">
        <div className="search-input-wrapper">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search audiences"
          />
        </div>

        <div className="filter-dropdown">
          <button
            className={`filter-btn ${showDatasetDropdown ? 'active' : ''}`}
            onClick={() => setShowDatasetDropdown(!showDatasetDropdown)}
          >
            <span className="filter-label">Data Set:</span>
            <span className="filter-value">
              {datasetOptions.find((d: DatasetOption) => d.id === selectedDataset)?.label || 'All'}
            </span>
            <ChevronDown size={16} />
          </button>
          {showDatasetDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span>0 Selected</span>
                <button className="clear-btn">Clear</button>
              </div>
              {datasetOptions.map((option: DatasetOption) => (
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
              {sortOptions.find((s: SortOption) => s.id === selectedSort)?.label}
            </span>
            <ChevronDown size={16} />
          </button>
          {showSortDropdown && (
            <div className="dropdown-menu">
              {sortOptions.map((option: SortOption) => (
                <button
                  key={option.id}
                  className={`dropdown-option-btn ${selectedSort === option.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSort(option.id ?? 'updated_at');
                    setShowSortDropdown(false);
                    setPage(1);
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

      {isLoading ? (
        <div className="audiences-table" style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Loader2 size={24} className="spin" />
        </div>
      ) : isError ? (
        <div className="audiences-table" style={{ padding: '24px' }}>
          <EmptyState
            title="Failed to load audiences"
            description="Something went wrong while loading your audiences. Please try again."
          />
        </div>
      ) : audiences.length === 0 ? (
        <div className="audiences-table" style={{ padding: '24px' }}>
          <EmptyState
            icon={<Users size={32} />}
            title="No audiences found"
            description={
              searchQuery
                ? `No audiences match "${searchQuery}". Try a different search term.`
                : 'Create your first audience to get started.'
            }
            action={
              <Link to="/app/audiences/new" className="btn-create">
                <span>Create new audience</span>
                <Plus size={18} />
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="audiences-table">
            <div className={`table-header ${compareMode ? 'table-header--compare' : ''}`}>
              {compareMode && <div className="table-cell checkbox-cell" />}
              <div className="table-cell name-cell">Name</div>
              <div className="table-cell">Size</div>
              <div className="table-cell demo-cell">Age Breakdown</div>
              <div className="table-cell">Owned by</div>
              <div className="table-cell">Last updated</div>
            </div>
            <div className="table-body">
              {audiences.map((audience) => {
                const demo = getDemoForAudience(audience.id);
                const size = getSizeForAudience(audience.id);
                const sizePercent = Math.max(8, (size / maxSize) * 100);
                const isSelected = selectedIds.includes(audience.id);
                const ageKeys = Object.keys(demo) as (keyof DemographicData)[];

                return (
                  <div
                    key={audience.id}
                    className={`table-row ${compareMode ? 'table-row--compare' : ''} ${isSelected ? 'table-row--selected' : ''}`}
                  >
                    {compareMode && (
                      <div className="table-cell checkbox-cell">
                        <label
                          className="compare-checkbox"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!isSelected && selectedIds.length >= 3}
                            onChange={() => toggleSelection(audience.id)}
                          />
                        </label>
                      </div>
                    )}
                    <Link
                      to={`/app/audiences/${audience.id}`}
                      className="table-cell name-cell"
                    >
                      <Folder size={18} className="folder-icon" />
                      {audience.is_shared && <Globe size={14} className="globe-icon" />}
                      <span>{audience.name}</span>
                      {audience.is_shared && (
                        <Badge variant="info">Shared</Badge>
                      )}
                    </Link>
                    <div className="table-cell size-cell">
                      <div className="audience-size-wrapper">
                        <span className="audience-size-label">{formatSize(size)}</span>
                        <div className="audience-size-bar">
                          <div
                            className="audience-size-bar__fill"
                            style={{ width: `${sizePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="table-cell demo-cell">
                      <div className="demo-bar-inline">
                        {ageKeys.map((key, i) => (
                          <div
                            key={key}
                            className="demo-bar-inline__segment"
                            style={{
                              width: `${demo[key]}%`,
                              backgroundColor: barColors[i],
                            }}
                            title={`${key}: ${demo[key]}%`}
                          />
                        ))}
                      </div>
                      <div className="demo-bar-labels">
                        {ageKeys.map((key) => (
                          <span key={key} className="demo-bar-labels__item">
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="table-cell">{audience.user_id}</div>
                    <div className="table-cell">{formatDate(audience.updated_at)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* --- Sticky Comparison Bar --- */}
      {compareMode && selectedIds.length > 0 && (
        <div className="compare-bar">
          <div className="compare-bar__items">
            {selectedAudiences.map((a) => (
              <div key={a.id} className="compare-bar__chip">
                <Users size={14} />
                <span>{a.name}</span>
                <button
                  className="compare-bar__chip-remove"
                  onClick={() => removeFromSelection(a.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {selectedIds.length < 3 && (
              <div className="compare-bar__placeholder">
                + Select {3 - selectedIds.length} more
              </div>
            )}
          </div>
          <button
            className="compare-bar__btn"
            disabled={selectedIds.length < 2}
          >
            <GitCompare size={16} />
            Compare Selected ({selectedIds.length})
          </button>
        </div>
      )}
    </div>
  );
}
