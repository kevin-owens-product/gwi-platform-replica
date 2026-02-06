import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Plus, Save } from 'lucide-react';
import { useCrosstab, useUpdateCrosstab, useCreateCrosstab } from '@/hooks/useCrosstabs';
import { useAudiences } from '@/hooks/useAudiences';
import { useStudies } from '@/hooks/useTaxonomy';
import { useCrosstabQuery } from '@/hooks/useQueries';
import CrosstabGrid from '@/components/crosstab/CrosstabGrid';
import { Button, Dropdown } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { MetricType, CrosstabQueryRequest } from '@/api/types';
import './CrosstabDetail.css';

interface CrosstabDetailProps {
  isNew?: boolean;
}

const metricOptions: { value: MetricType; label: string }[] = [
  { value: 'audience_percentage', label: 'Percentage' },
  { value: 'audience_index', label: 'Index' },
  { value: 'audience_size', label: 'Audience Size' },
  { value: 'positive_size', label: 'Sample Count' },
];

const highlightOptions = [
  { label: 'None', value: 'none' },
  { label: 'Heatmap', value: 'heatmap' },
  { label: 'Index coloring', value: 'index' },
];

const fallbackAudiences: string[] = ['All Adults 16+', 'Adults 18-34', 'Adults 25-54', 'Gen Z', 'Millennials'];
const fallbackDataSources: string[] = ['GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Work'];

export default function CrosstabDetail({ isNew: isNewProp = false }: CrosstabDetailProps): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = isNewProp || id === 'new';

  // Fetch audience and study options from API
  const { data: audienceResponse } = useAudiences({ per_page: 50 });
  const { data: studies } = useStudies();

  const audiences = useMemo(() => {
    if (audienceResponse?.data && audienceResponse.data.length > 0) {
      return audienceResponse.data.map((a) => a.name);
    }
    return fallbackAudiences;
  }, [audienceResponse]);

  const dataSources = useMemo(() => {
    if (studies && studies.length > 0) {
      return studies.map((s) => s.name);
    }
    return fallbackDataSources;
  }, [studies]);

  // Fetch existing crosstab data
  const { data: crosstab, isLoading: crosstabLoading } = useCrosstab(isNew ? '' : (id ?? ''));
  const updateCrosstab = useUpdateCrosstab();
  const createCrosstab = useCreateCrosstab();

  // Local editable state
  const [crosstabName, setCrosstabName] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('audience_percentage');
  const [highlightMode, setHighlightMode] = useState<'none' | 'heatmap' | 'index'>('heatmap');
  const [selectedAudience, setSelectedAudience] = useState<string>('All Adults 16+');
  const [selectedSource, setSelectedSource] = useState<string>('GWI Core');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Seed local state from the fetched crosstab once
  if (crosstab && !isInitialized) {
    setCrosstabName(crosstab.name);
    if (crosstab.config.metrics?.[0]) {
      setSelectedMetric(crosstab.config.metrics[0]);
    }
    if (crosstab.config.highlight?.type) {
      setHighlightMode(
        crosstab.config.highlight.type === 'heatmap' ? 'heatmap' :
        crosstab.config.highlight.type === 'significance' ? 'index' : 'none'
      );
    }
    setIsInitialized(true);
  }

  // Build crosstab query from the config
  const crosstabRequest: CrosstabQueryRequest | null = useMemo(() => {
    if (!crosstab?.config) return null;

    const rowQuestionIds = crosstab.config.rows
      ?.filter((d) => d.type === 'question' && d.question_id)
      .map((d) => d.question_id!) ?? [];
    if (rowQuestionIds.length === 0) return null;

    const colQuestionIds = crosstab.config.columns
      ?.filter((d) => d.type === 'question' && d.question_id)
      .map((d) => d.question_id!) ?? [];

    const colAudienceIds = crosstab.config.columns
      ?.filter((d) => d.type === 'audience' && d.audience_id)
      .map((d) => d.audience_id!) ?? [];

    return {
      row_question_ids: rowQuestionIds,
      column_question_ids: colQuestionIds.length > 0 ? colQuestionIds : undefined,
      column_audience_ids: colAudienceIds.length > 0 ? colAudienceIds : undefined,
      metrics: crosstab.config.metrics ?? [selectedMetric],
      wave_ids: crosstab.config.wave_ids ?? [],
      location_ids: crosstab.config.location_ids ?? [],
      base_audience: crosstab.config.base_audience,
    };
  }, [crosstab?.config, selectedMetric]);

  const { data: queryResult, isLoading: queryLoading } = useCrosstabQuery(crosstabRequest);

  // Extract grid data from query result
  const gridRows = queryResult?.rows ?? [];
  const gridColumns = queryResult?.columns ?? [];
  const gridCells = queryResult?.cells ?? [];

  // Save handler
  const handleSave = () => {
    const configPayload = {
      ...crosstab?.config,
      metrics: [selectedMetric],
      highlight: highlightMode !== 'none' ? {
        type: highlightMode === 'heatmap' ? 'heatmap' as const : 'significance' as const,
      } : undefined,
    };

    if (isNew) {
      createCrosstab.mutate(
        {
          name: crosstabName || 'Untitled Crosstab',
          config: {
            rows: [],
            columns: [],
            metrics: [selectedMetric],
            wave_ids: [],
            location_ids: [],
          },
        },
        {
          onSuccess: (newCrosstab) => {
            if (newCrosstab?.id) navigate(`/app/crosstabs/${newCrosstab.id}`);
          },
        }
      );
    } else if (id) {
      updateCrosstab.mutate({
        id,
        data: {
          name: crosstabName,
          config: configPayload,
        },
      });
    }
  };

  const isDataLoading = crosstabLoading || queryLoading;
  const isSaving = updateCrosstab.isPending || createCrosstab.isPending;

  if (crosstabLoading && !isNew) {
    return (
      <div className="crosstab-detail-page">
        <div className="crosstab-detail-header">
          <Link to="/app/crosstabs" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Crosstabs</span>
          </Link>
        </div>
        <div className="crosstab-detail-loading">
          <div className="charts-loading-spinner" />
          <p>Loading crosstab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crosstab-detail-page">
      <div className="crosstab-detail-header">
        <Link to="/app/crosstabs" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Crosstabs</span>
        </Link>
        <div className="header-actions">
          <button className="icon-btn"><Download size={18} /></button>
          <button className="icon-btn"><Share2 size={18} /></button>
          <Button
            variant="ghost"
            icon={<Plus size={16} />}
            onClick={() => {
              // Placeholder for adding a new row question
            }}
          >
            Add row
          </Button>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            loading={isSaving}
            onClick={handleSave}
          >
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="crosstab-detail-content">
        <input
          type="text"
          className="crosstab-title-input"
          value={crosstabName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrosstabName(e.target.value)}
          placeholder="Untitled Crosstab"
        />

        <div className="crosstab-config-bar">
          <div className="crosstab-config-item">
            <label>Data Source</label>
            <select className="crosstab-config-select" value={selectedSource} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSource(e.target.value)}>
              {dataSources.map((ds: string) => <option key={ds} value={ds}>{ds}</option>)}
            </select>
          </div>
          <div className="crosstab-config-item">
            <label>Audience</label>
            <select className="crosstab-config-select" value={selectedAudience} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAudience(e.target.value)}>
              {audiences.map((a: string) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="crosstab-config-item">
            <label>Metric</label>
            <select className="crosstab-config-select" value={selectedMetric} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMetric(e.target.value as MetricType)}>
              {metricOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="crosstab-config-item">
            <label>Highlight</label>
            <Dropdown
              trigger={
                <button className="crosstab-config-select" style={{ cursor: 'pointer' }}>
                  {highlightOptions.find((h) => h.value === highlightMode)?.label ?? 'None'}
                </button>
              }
              items={highlightOptions}
              onSelect={(value) => setHighlightMode(value as 'none' | 'heatmap' | 'index')}
            />
          </div>
        </div>

        <div className="crosstab-table-container">
          {isDataLoading ? (
            <div className="crosstab-detail-loading">
              <div className="charts-loading-spinner" />
              <p>Loading crosstab data...</p>
            </div>
          ) : gridRows.length === 0 || gridColumns.length === 0 ? (
            <div className="crosstab-empty-grid">
              <p>{isNew ? 'Add row and column questions to build your crosstab.' : 'No data available for this configuration.'}</p>
            </div>
          ) : (
            <CrosstabGrid
              rows={gridRows}
              columns={gridColumns}
              cells={gridCells}
              activeMetric={selectedMetric}
              highlightMode={highlightMode}
            />
          )}
        </div>

        <div className="crosstab-footer">
          <div className="crosstab-stats">
            <span className="crosstab-stat">
              Sample: <strong>{queryResult?.meta?.base_size?.toLocaleString() ?? '-'}</strong>
            </span>
            <span className="crosstab-stat">
              Wave: <strong>{queryResult?.meta?.wave_name ?? '-'}</strong>
            </span>
            <span className="crosstab-stat">
              Source: <strong>{selectedSource}</strong>
            </span>
            {crosstab?.updated_at && (
              <span className="crosstab-stat">
                Updated: <strong>{formatRelativeDate(crosstab.updated_at)}</strong>
              </span>
            )}
          </div>
          {highlightMode === 'heatmap' && (
            <div className="crosstab-color-legend">
              <span className="color-legend-label">Low</span>
              <div className="color-legend-bar" />
              <span className="color-legend-label">High</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
