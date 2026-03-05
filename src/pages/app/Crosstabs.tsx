import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, Grid3X3, FlaskConical, LayoutGrid, List } from 'lucide-react';
import { useCrosstabs } from '@/hooks/useCrosstabs';
import { useWaves } from '@/hooks/useTaxonomy';
import { useWorkspaceStore } from '@/stores/workspace';
import { SearchInput, Tabs, Pagination, EmptyState, Badge, WaveCadenceSwitcher } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { Crosstab } from '@/api/types';
import { getWavesForCadence, type WaveCadence } from '@/utils/waves';
import './Crosstabs.css';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Crosstabs' },
  { id: 'shared', label: 'Shared' },
  { id: 'gwi', label: 'GWI Crosstabs', icon: <Globe size={16} /> },
  { id: 'templates', label: 'Templates' },
];

export default function Crosstabs(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [waveCadence, setWaveCadence] = useState<WaveCadence>('quarterly');
  const [selectedWaveId, setSelectedWaveId] = useState<string>('');

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId);

  const { data: crosstabsResponse, isLoading, isError } = useCrosstabs({
    page,
    per_page: 20,
    search: searchQuery || undefined,
    project_id: activeProjectId || undefined,
  });
  const { data: allWaves } = useWaves();

  const crosstabs = crosstabsResponse?.data ?? [];
  const waves = allWaves ?? [];
  const meta = crosstabsResponse?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const cadenceWaveIds = useMemo(
    () => new Set(getWavesForCadence(waves, waveCadence).map((wave) => wave.id)),
    [waves, waveCadence],
  );

  useEffect(() => {
    if (selectedWaveId && !cadenceWaveIds.has(selectedWaveId)) {
      setSelectedWaveId('');
    }
  }, [selectedWaveId, cadenceWaveIds]);

  // Client-side tab filtering
  const filtered = crosstabs.filter((ct: Crosstab) => {
    if (activeTab === 'all') { /* pass */ }
    else if (activeTab === 'my' && ct.is_shared) return false;
    else if (activeTab === 'shared' && !ct.is_shared) return false;
    else if (activeTab === 'gwi' && ct.user_id) return false;
    else if (activeTab === 'templates' && !ct.template_id) return false;

    const crosstabWaveIds = ct.config.wave_ids?.map((wave) => wave.wave_id) ?? [];
    if (selectedWaveId) {
      return crosstabWaveIds.includes(selectedWaveId);
    }
    if (crosstabWaveIds.length > 0 && cadenceWaveIds.size > 0) {
      return crosstabWaveIds.some((waveId) => cadenceWaveIds.has(waveId));
    }

    return true;
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((ct) => ct.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <div className="crosstabs-page">
      <div className="crosstabs-header">
        <h1 className="page-title">Crosstabs</h1>
        {activeProject && (
          <Badge variant="info">Project: {activeProject.name}</Badge>
        )}
        <div className="crosstabs-tabs">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <div className="ct-view-toggle">
          <button
            className={`ct-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List size={16} />
          </button>
          <button
            className={`ct-view-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            title="Card view"
          >
            <LayoutGrid size={16} />
          </button>
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
        <WaveCadenceSwitcher
          waves={waves}
          cadence={waveCadence}
          selectedWaveId={selectedWaveId}
          onCadenceChange={(cadence) => {
            setWaveCadence(cadence);
            setSelectedWaveId('');
            setPage(1);
            clearSelection();
          }}
          onWaveChange={(waveId) => {
            setSelectedWaveId(waveId);
            setPage(1);
            clearSelection();
          }}
        />
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="ct-bulk-bar">
          <span className="ct-bulk-count">{selectedIds.size} selected</span>
          <button className="ct-bulk-action" onClick={() => { /* export */ }}>Export</button>
          <button className="ct-bulk-action" onClick={() => { /* delete */ }}>Delete</button>
          <button className="ct-bulk-action" onClick={() => { /* share */ }}>Share</button>
          <button className="ct-bulk-clear" onClick={clearSelection}>Clear</button>
        </div>
      )}

      {isLoading ? (
        <div className="crosstabs-loading">
          <div className="crosstabs-loading-spinner" />
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
            <button className="crosstabs-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); setWaveCadence('quarterly'); setSelectedWaveId(''); clearSelection(); }}>
              Clear filters
            </button>
          }
        />
      ) : viewMode === 'list' ? (
        <>
          <div className="crosstabs-table">
            <div className="ct-table-header">
              <div className="ct-cell ct-checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="ct-cell ct-name-cell">Name</div>
              <div className="ct-cell">Size</div>
              <div className="ct-cell">Dataset</div>
              <div className="ct-cell">Stat Testing</div>
              <div className="ct-cell">Last updated</div>
            </div>
            <div className="ct-table-body">
              {filtered.map((ct: Crosstab) => {
                const rowCount = ct.config?.rows?.reduce((sum, d) => sum + (d.datapoint_ids?.length ?? 1), 0) ?? 0;
                const colCount = ct.config?.columns?.reduce((sum, d) => sum + (d.datapoint_ids?.length ?? 1), 0) ?? 0;

                return (
                  <div key={ct.id} className="ct-table-row">
                    <div className="ct-cell ct-checkbox-cell" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(ct.id)}
                        onChange={() => toggleSelect(ct.id)}
                      />
                    </div>
                    <Link to={`/app/crosstabs/${ct.id}`} className="ct-cell ct-name-cell">
                      <div className="ct-icon-wrapper">
                        <Grid3X3 size={18} />
                      </div>
                      <div>
                        <span className="ct-row-name">{ct.name}</span>
                        {ct.is_shared && (
                          <Badge variant="default" className="ct-shared-badge">Shared</Badge>
                        )}
                        {ct.tags && ct.tags.length > 0 && (
                          <div className="ct-tags">
                            {ct.tags.map((tag) => (
                              <Badge key={tag} variant="info" className="ct-tag-badge">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
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
                    <div className="ct-cell ct-stat-test">
                      {ct.config?.stat_test && (
                        <span className="ct-stat-indicator" title={`${ct.config.stat_test.test_type} @ ${ct.config.stat_test.confidence_levels?.primary}%`}>
                          <FlaskConical size={14} />
                        </span>
                      )}
                    </div>
                    <div className="ct-cell ct-date">
                      {ct.updated_at ? formatRelativeDate(ct.updated_at) : 'Unknown'}
                    </div>
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
      ) : (
        <>
          <div className="ct-card-grid">
            {filtered.map((ct: Crosstab) => {
              const rowCount = ct.config?.rows?.reduce((sum, d) => sum + (d.datapoint_ids?.length ?? 1), 0) ?? 0;
              const colCount = ct.config?.columns?.reduce((sum, d) => sum + (d.datapoint_ids?.length ?? 1), 0) ?? 0;

              return (
                <div key={ct.id} className="ct-card">
                  <div className="ct-card-checkbox" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(ct.id)}
                      onChange={() => toggleSelect(ct.id)}
                    />
                  </div>
                  <Link to={`/app/crosstabs/${ct.id}`} className="ct-card-link">
                    <div className="ct-card-icon">
                      <Grid3X3 size={24} />
                      {ct.config?.stat_test && (
                        <FlaskConical size={12} className="ct-card-flask" />
                      )}
                    </div>
                    <h3 className="ct-card-name">{ct.name}</h3>
                    <p className="ct-card-meta">
                      {rowCount > 0 || colCount > 0
                        ? `${rowCount} rows x ${colCount} cols`
                        : 'Empty'}
                      <span className="meta-dot">&middot;</span>
                      {ct.updated_at ? formatRelativeDate(ct.updated_at) : 'Unknown'}
                    </p>
                    {ct.tags && ct.tags.length > 0 && (
                      <div className="ct-tags">
                        {ct.tags.map((tag) => (
                          <Badge key={tag} variant="info" className="ct-tag-badge">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    {ct.is_shared && <Badge variant="default">Shared</Badge>}
                  </Link>
                </div>
              );
            })}
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
