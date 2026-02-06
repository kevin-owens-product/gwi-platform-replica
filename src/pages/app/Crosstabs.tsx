import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, Grid3X3 } from 'lucide-react';
import { useCrosstabs } from '@/hooks/useCrosstabs';
import { SearchInput, Tabs, Pagination, EmptyState, Badge } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { Crosstab } from '@/api/types';
import './Crosstabs.css';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Crosstabs' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Crosstabs', icon: <Globe size={16} /> },
];

export default function Crosstabs(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data: crosstabsResponse, isLoading, isError } = useCrosstabs({
    page,
    per_page: 20,
    search: searchQuery || undefined,
  });

  const crosstabs = crosstabsResponse?.data ?? [];
  const meta = crosstabsResponse?.meta;
  const totalPages = meta?.total_pages ?? 1;

  // Client-side tab filtering
  const filtered = crosstabs.filter((ct: Crosstab) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'my') return !ct.is_shared;
    if (activeTab === 'shared') return ct.is_shared;
    if (activeTab === 'gwi') return !ct.user_id;
    return true;
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <div className="crosstabs-page">
      <div className="crosstabs-header">
        <h1 className="page-title">Crosstabs</h1>
        <div className="crosstabs-tabs">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <Link to="/app/crosstabs/new" className="btn-create">
          <span>Create new crosstab</span>
          <Plus size={18} />
        </Link>
      </div>

      <div className="crosstabs-filters">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search crosstabs"
        />
      </div>

      {isLoading ? (
        <div className="crosstabs-loading">
          <div className="charts-loading-spinner" />
          <p>Loading crosstabs...</p>
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load crosstabs"
          description="Something went wrong while loading your crosstabs. Please try again."
          action={
            <button className="crosstabs-empty-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Grid3X3 size={48} />}
          title="No crosstabs found"
          description={searchQuery ? 'No crosstabs match your search' : 'Create your first crosstab to get started'}
          action={
            <button className="crosstabs-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          <div className="crosstabs-table">
            <div className="ct-table-header">
              <div className="ct-cell ct-name-cell">Name</div>
              <div className="ct-cell">Size</div>
              <div className="ct-cell">Dataset</div>
              <div className="ct-cell">Last updated</div>
            </div>
            <div className="ct-table-body">
              {filtered.map((ct: Crosstab) => {
                const rowCount = ct.config?.rows?.length ?? 0;
                const colCount = ct.config?.columns?.length ?? 0;

                return (
                  <Link key={ct.id} to={`/app/crosstabs/${ct.id}`} className="ct-table-row">
                    <div className="ct-cell ct-name-cell">
                      <div className="ct-icon-wrapper">
                        <Grid3X3 size={18} />
                      </div>
                      <div>
                        <span className="ct-row-name">{ct.name}</span>
                        {ct.is_shared && (
                          <Badge variant="default" className="ct-shared-badge">Shared</Badge>
                        )}
                      </div>
                    </div>
                    <div className="ct-cell ct-size">
                      {rowCount > 0 || colCount > 0
                        ? `${rowCount} rows x ${colCount} cols`
                        : '-'
                      }
                    </div>
                    <div className="ct-cell">
                      <span className="ct-dataset-badge">
                        {ct.project_id ?? 'GWI Core'}
                      </span>
                    </div>
                    <div className="ct-cell ct-date">
                      {ct.updated_at ? formatRelativeDate(ct.updated_at) : 'Unknown'}
                    </div>
                  </Link>
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
    </div>
  );
}
