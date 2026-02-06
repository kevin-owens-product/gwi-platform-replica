import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder, Globe, Check, ChevronDown, Loader2, Users } from 'lucide-react';
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

export default function Audiences(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('updated_at');
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [showDatasetDropdown, setShowDatasetDropdown] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <div className="audiences-page">
      <div className="audiences-header">
        <h1 className="page-title">Audiences</h1>
        <div className="audiences-tabs">
          <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <Link to="/app/audiences/new" className="btn-create">
          <span>Create new audience</span>
          <Plus size={18} />
        </Link>
      </div>

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
            <div className="table-header">
              <div className="table-cell name-cell">Name</div>
              <div className="table-cell">Owned by</div>
              <div className="table-cell">Date created</div>
              <div className="table-cell">Last updated</div>
            </div>
            <div className="table-body">
              {audiences.map((audience) => (
                <Link
                  key={audience.id}
                  to={`/app/audiences/${audience.id}`}
                  className="table-row"
                >
                  <div className="table-cell name-cell">
                    <Folder size={18} className="folder-icon" />
                    {audience.is_shared && <Globe size={14} className="globe-icon" />}
                    <span>{audience.name}</span>
                    {audience.is_shared && (
                      <Badge variant="info">Shared</Badge>
                    )}
                  </div>
                  <div className="table-cell">{audience.user_id}</div>
                  <div className="table-cell">{formatDate(audience.created_at)}</div>
                  <div className="table-cell">{formatDate(audience.updated_at)}</div>
                </Link>
              ))}
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
