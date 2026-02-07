import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Save, ChevronLeft } from 'lucide-react';
import { useCrosstab, useUpdateCrosstab, useCreateCrosstab } from '@/hooks/useCrosstabs';
import { useAudiences } from '@/hooks/useAudiences';
import { useStudies, useWaves, useQuestions } from '@/hooks/useTaxonomy';
import { useCrosstabConfig } from '@/hooks/useCrosstabConfig';
import { useCrosstabQuery } from '@/hooks/useQueries';
import CrosstabGrid from '@/components/crosstab/CrosstabGrid';
import CrosstabConfigPanel from '@/components/crosstab/CrosstabConfigPanel';
import QuestionBrowser from '@/components/taxonomy/QuestionBrowser';
import { Button, Modal, SearchInput } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { MetricType, CrosstabQueryRequest, Question, Study, AudienceQuestion } from '@/api/types';
import './CrosstabDetail.css';

interface CrosstabDetailProps {
  isNew?: boolean;
}

export default function CrosstabDetail({ isNew: isNewProp = false }: CrosstabDetailProps): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = isNewProp || id === 'new';

  // Config state
  const crosstabConfig = useCrosstabConfig();
  const [crosstabName, setCrosstabName] = useState<string>('');
  const [highlightMode, setHighlightMode] = useState<'none' | 'heatmap' | 'index'>('heatmap');
  const [isInitialized, setIsInitialized] = useState(false);

  // Modal states
  const [rowPickerOpen, setRowPickerOpen] = useState(false);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [columnPickerTab, setColumnPickerTab] = useState<'question' | 'audience'>('question');
  const [audiencePickerOpen, setAudiencePickerOpen] = useState(false);
  const [audienceSearch, setAudienceSearch] = useState('');
  const [basePickerTab, setBasePickerTab] = useState<'saved' | 'question' | 'clear'>('saved');
  const [baseQuestion, setBaseQuestion] = useState<Question | null>(null);
  const [baseDatapointIds, setBaseDatapointIds] = useState<Set<string>>(new Set());
  const [dataSetPickerOpen, setDataSetPickerOpen] = useState(false);
  const [dataSetStep, setDataSetStep] = useState<'study' | 'wave'>('study');
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [wavePickerOpen, setWavePickerOpen] = useState(false);
  const [columnAudienceSearch, setColumnAudienceSearch] = useState('');

  // Fetch data
  const { data: crosstab, isLoading: crosstabLoading } = useCrosstab(isNew ? '' : (id ?? ''));
  const updateCrosstab = useUpdateCrosstab();
  const createCrosstab = useCreateCrosstab();
  const { data: audienceResponse } = useAudiences({ per_page: 50 });
  const { data: studies } = useStudies();
  const { data: allWaves } = useWaves();
  const { data: questionsResponse } = useQuestions({ per_page: 100 });

  const audiences = useMemo(() => audienceResponse?.data ?? [], [audienceResponse]);
  const questions = useMemo(() => questionsResponse?.data ?? [], [questionsResponse]);
  const waves = useMemo(() => allWaves ?? [], [allWaves]);

  // Already-selected question IDs for picker highlighting
  const selectedRowQuestionIds = useMemo(
    () => crosstabConfig.config.rows.filter((r) => r.question_id).map((r) => r.question_id!),
    [crosstabConfig.config.rows]
  );
  const selectedColumnQuestionIds = useMemo(
    () => crosstabConfig.config.columns.filter((c) => c.type === 'question' && c.question_id).map((c) => c.question_id!),
    [crosstabConfig.config.columns]
  );

  // Seed config from fetched crosstab once
  useEffect(() => {
    if (crosstab && !isInitialized) {
      setCrosstabName(crosstab.name);
      crosstabConfig.initializeFrom(crosstab.config);
      if (crosstab.config.highlight?.type) {
        setHighlightMode(
          crosstab.config.highlight.type === 'heatmap' ? 'heatmap' :
          crosstab.config.highlight.type === 'significance' ? 'index' : 'none'
        );
      }
      setIsInitialized(true);
    }
  }, [crosstab, isInitialized, crosstabConfig]);

  // Build crosstab query from config
  const crosstabRequest: CrosstabQueryRequest | null = useMemo(() => {
    const cfg = crosstabConfig.config;
    const rowQuestionIds = cfg.rows.filter((d) => d.type === 'question' && d.question_id).map((d) => d.question_id!);
    if (rowQuestionIds.length === 0) return null;

    const colQuestionIds = cfg.columns.filter((d) => d.type === 'question' && d.question_id).map((d) => d.question_id!);
    const colAudienceIds = cfg.columns.filter((d) => d.type === 'audience' && d.audience_id).map((d) => d.audience_id!);

    return {
      row_question_ids: rowQuestionIds,
      column_question_ids: colQuestionIds.length > 0 ? colQuestionIds : undefined,
      column_audience_ids: colAudienceIds.length > 0 ? colAudienceIds : undefined,
      metrics: cfg.metrics,
      wave_ids: cfg.wave_ids,
      location_ids: cfg.location_ids,
      base_audience: cfg.base_audience,
    };
  }, [crosstabConfig.config]);

  const { data: queryResult, isLoading: queryLoading } = useCrosstabQuery(crosstabRequest);

  const gridRows = queryResult?.rows ?? [];
  const gridColumns = queryResult?.columns ?? [];
  const gridCells = queryResult?.cells ?? [];
  const activeMetric: MetricType = crosstabConfig.config.metrics[0] ?? 'audience_percentage';

  // Save handler
  const handleSave = () => {
    const cfg = crosstabConfig.config;
    const configPayload = {
      ...cfg,
      highlight: highlightMode !== 'none' ? {
        type: highlightMode === 'heatmap' ? 'heatmap' as const : 'significance' as const,
      } : undefined,
    };

    if (isNew) {
      createCrosstab.mutate(
        {
          name: crosstabName || 'Untitled Crosstab',
          config: configPayload,
        },
        {
          onSuccess: (newCrosstab) => {
            crosstabConfig.markSaved();
            if (newCrosstab?.id) navigate(`/app/crosstabs/${newCrosstab.id}`);
          },
        }
      );
    } else if (id) {
      updateCrosstab.mutate(
        {
          id,
          data: { name: crosstabName, config: configPayload },
        },
        {
          onSuccess: () => crosstabConfig.markSaved(),
        }
      );
    }
  };

  // Highlight change handler
  const handleHighlightChange = (mode: string) => {
    const m = mode as 'none' | 'heatmap' | 'index';
    setHighlightMode(m);
    if (m === 'none') {
      crosstabConfig.setHighlight(undefined);
    } else {
      crosstabConfig.setHighlight({
        type: m === 'heatmap' ? 'heatmap' : 'significance',
      });
    }
  };

  // Row picker handlers
  const handleRowQuestionSelect = (question: Question) => {
    const dpIds = question.datapoints.map((dp) => dp.id);
    crosstabConfig.addRowQuestion(question.id, dpIds);
  };

  // Column picker handlers
  const handleColumnQuestionSelect = (question: Question) => {
    const dpIds = question.datapoints.map((dp) => dp.id);
    crosstabConfig.addColumnQuestion(question.id, dpIds);
  };

  const handleColumnAudienceSelect = (audienceId: string) => {
    crosstabConfig.addColumnAudience(audienceId);
  };

  // Base audience picker
  const handleBaseApply = () => {
    if (basePickerTab === 'saved') return; // saved tab uses direct selection
    if (basePickerTab === 'clear') {
      crosstabConfig.setBaseAudience(undefined);
    } else if (basePickerTab === 'question' && baseQuestion && baseDatapointIds.size > 0) {
      const expr: AudienceQuestion = {
        question: {
          question_id: baseQuestion.id,
          datapoint_ids: Array.from(baseDatapointIds),
        },
      };
      crosstabConfig.setBaseAudience(expr);
    }
    setAudiencePickerOpen(false);
  };

  const handleBaseSavedSelect = (audienceId: string) => {
    const aud = audiences.find((a) => a.id === audienceId);
    if (aud) {
      crosstabConfig.setBaseAudience(aud.expression);
    }
    setAudiencePickerOpen(false);
  };

  const handleBaseQuestionSelect = (question: Question) => {
    setBaseQuestion(question);
    setBaseDatapointIds(new Set());
  };

  const handleBaseDatapointToggle = (dpId: string) => {
    setBaseDatapointIds((prev) => {
      const next = new Set(prev);
      if (next.has(dpId)) {
        next.delete(dpId);
      } else {
        next.add(dpId);
      }
      return next;
    });
  };

  // Data set picker
  const handleStudySelect = (study: Study) => {
    setSelectedStudy(study);
    setDataSetStep('wave');
  };

  const handleDataSetWaveSelect = (study: Study, waveId: string) => {
    crosstabConfig.setWaveIds([{ study_id: study.id, wave_id: waveId }]);
    setDataSetPickerOpen(false);
    setDataSetStep('study');
    setSelectedStudy(null);
  };

  // Wave picker
  const handleWaveAdd = (studyId: string, waveId: string) => {
    crosstabConfig.addWave({ study_id: studyId, wave_id: waveId });
  };

  const isDataLoading = crosstabLoading || queryLoading;
  const isSaving = updateCrosstab.isPending || createCrosstab.isPending;

  // Filtered audiences for pickers
  const filteredAudiences = useMemo(() => {
    if (!audienceSearch) return audiences;
    const q = audienceSearch.toLowerCase();
    return audiences.filter((a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }, [audiences, audienceSearch]);

  const filteredColumnAudiences = useMemo(() => {
    if (!columnAudienceSearch) return audiences;
    const q = columnAudienceSearch.toLowerCase();
    return audiences.filter((a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }, [audiences, columnAudienceSearch]);

  // Waves grouped by study for wave picker
  const wavesGroupedByStudy = useMemo(() => {
    const groups: Record<string, { studyName: string; studyId: string; waves: typeof waves }> = {};
    for (const w of waves) {
      if (!groups[w.study_id]) {
        groups[w.study_id] = { studyName: w.study_name, studyId: w.study_id, waves: [] };
      }
      groups[w.study_id].waves.push(w);
    }
    return Object.values(groups);
  }, [waves]);

  const selectedWaveIds = useMemo(
    () => new Set(crosstabConfig.config.wave_ids.map((w) => w.wave_id)),
    [crosstabConfig.config.wave_ids]
  );

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

        <CrosstabConfigPanel
          config={crosstabConfig.config}
          questions={questions}
          audiences={audiences}
          waves={waves}
          studies={studies}
          highlightMode={highlightMode}
          onRemoveRow={(i) => crosstabConfig.removeRow(i)}
          onRemoveColumn={(i) => crosstabConfig.removeColumn(i)}
          onToggleMetric={(m) => crosstabConfig.toggleMetric(m)}
          onRemoveWave={(i) => crosstabConfig.removeWave(i)}
          onHighlightChange={handleHighlightChange}
          onOpenRowPicker={() => setRowPickerOpen(true)}
          onOpenColumnPicker={() => { setColumnPickerTab('question'); setColumnPickerOpen(true); }}
          onOpenBasePicker={() => { setAudienceSearch(''); setBasePickerTab('saved'); setBaseQuestion(null); setBaseDatapointIds(new Set()); setAudiencePickerOpen(true); }}
          onOpenDataSetPicker={() => { setDataSetStep('study'); setSelectedStudy(null); setDataSetPickerOpen(true); }}
          onOpenWavePicker={() => setWavePickerOpen(true)}
        />

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
              activeMetric={activeMetric}
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

      {/* ==================== MODALS ==================== */}

      {/* 1. Row Question Picker */}
      <Modal
        open={rowPickerOpen}
        onClose={() => setRowPickerOpen(false)}
        title="Add Row Questions"
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setRowPickerOpen(false)}>
            Done
          </Button>
        }
      >
        <QuestionBrowser
          onSelectQuestion={handleRowQuestionSelect}
          selectedQuestionIds={selectedRowQuestionIds}
        />
      </Modal>

      {/* 2. Column Picker (Question / Audience tabs) */}
      <Modal
        open={columnPickerOpen}
        onClose={() => setColumnPickerOpen(false)}
        title="Add Column Dimensions"
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setColumnPickerOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="picker-tabs">
          <button
            className={`picker-tab ${columnPickerTab === 'question' ? 'picker-tab--active' : ''}`}
            onClick={() => setColumnPickerTab('question')}
          >
            Question
          </button>
          <button
            className={`picker-tab ${columnPickerTab === 'audience' ? 'picker-tab--active' : ''}`}
            onClick={() => setColumnPickerTab('audience')}
          >
            Audience
          </button>
        </div>
        {columnPickerTab === 'question' ? (
          <QuestionBrowser
            onSelectQuestion={handleColumnQuestionSelect}
            selectedQuestionIds={selectedColumnQuestionIds}
          />
        ) : (
          <>
            <SearchInput
              value={columnAudienceSearch}
              onChange={setColumnAudienceSearch}
              placeholder="Search audiences..."
            />
            <div className="picker-list" style={{ marginTop: 'var(--spacing-md)' }}>
              {filteredColumnAudiences.map((aud) => {
                const isSelected = crosstabConfig.config.columns.some(
                  (c) => c.type === 'audience' && c.audience_id === aud.id
                );
                return (
                  <div
                    key={aud.id}
                    className={`picker-list-item ${isSelected ? 'picker-list-item--selected' : ''}`}
                    onClick={() => handleColumnAudienceSelect(aud.id)}
                  >
                    <div className="picker-list-item__info">
                      <span className="picker-list-item__name">{aud.name}</span>
                      {aud.description && <span className="picker-list-item__desc">{aud.description}</span>}
                    </div>
                    {aud.sample_size != null && (
                      <span className="picker-list-item__meta">n={aud.sample_size.toLocaleString()}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>

      {/* 3. Base Audience Picker (tabbed) */}
      <Modal
        open={audiencePickerOpen}
        onClose={() => setAudiencePickerOpen(false)}
        title="Select Base Audience"
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setAudiencePickerOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={
                basePickerTab === 'saved' ||
                (basePickerTab === 'question' && baseDatapointIds.size === 0)
              }
              onClick={handleBaseApply}
            >
              Apply
            </Button>
          </div>
        }
      >
        <div className="picker-tabs">
          <button
            className={`picker-tab ${basePickerTab === 'saved' ? 'picker-tab--active' : ''}`}
            onClick={() => setBasePickerTab('saved')}
          >
            Saved Audiences
          </button>
          <button
            className={`picker-tab ${basePickerTab === 'question' ? 'picker-tab--active' : ''}`}
            onClick={() => setBasePickerTab('question')}
          >
            By Question
          </button>
          <button
            className={`picker-tab ${basePickerTab === 'clear' ? 'picker-tab--active' : ''}`}
            onClick={() => setBasePickerTab('clear')}
          >
            All Adults
          </button>
        </div>

        {basePickerTab === 'saved' && (
          <>
            <SearchInput
              value={audienceSearch}
              onChange={setAudienceSearch}
              placeholder="Search audiences..."
            />
            <div className="picker-list" style={{ marginTop: 'var(--spacing-md)' }}>
              {filteredAudiences.map((aud) => (
                <div
                  key={aud.id}
                  className="picker-list-item"
                  onClick={() => handleBaseSavedSelect(aud.id)}
                >
                  <div className="picker-list-item__info">
                    <span className="picker-list-item__name">{aud.name}</span>
                    {aud.description && <span className="picker-list-item__desc">{aud.description}</span>}
                  </div>
                  {aud.sample_size != null && (
                    <span className="picker-list-item__meta">n={aud.sample_size.toLocaleString()}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {basePickerTab === 'question' && (
          <div className="base-picker__split">
            <QuestionBrowser
              onSelectQuestion={handleBaseQuestionSelect}
              selectedQuestionIds={baseQuestion ? [baseQuestion.id] : []}
            />
            {baseQuestion ? (
              <div className="base-picker__question-detail">
                <h4>{baseQuestion.name}</h4>
                <p>Select datapoints to filter by:</p>
                <div className="base-picker__dp-list">
                  {baseQuestion.datapoints.map((dp) => (
                    <div
                      key={dp.id}
                      className="base-picker__dp-item"
                      onClick={() => handleBaseDatapointToggle(dp.id)}
                    >
                      <input
                        type="checkbox"
                        checked={baseDatapointIds.has(dp.id)}
                        onChange={() => handleBaseDatapointToggle(dp.id)}
                      />
                      <label>{dp.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="base-picker__question-detail">
                <div className="base-picker__empty">
                  Select a question to see its datapoints
                </div>
              </div>
            )}
          </div>
        )}

        {basePickerTab === 'clear' && (
          <div className="base-picker__clear">
            <p>
              Use the full survey base with no audience filter applied.
              This resets the base to <strong>All Adults</strong>.
            </p>
          </div>
        )}
      </Modal>

      {/* 4. Data Set Picker (Study → Wave two-step) */}
      <Modal
        open={dataSetPickerOpen}
        onClose={() => { setDataSetPickerOpen(false); setDataSetStep('study'); setSelectedStudy(null); }}
        title={dataSetStep === 'study' ? 'Select Data Set' : `Select Wave — ${selectedStudy?.name ?? ''}`}
        size="md"
      >
        {dataSetStep === 'wave' && selectedStudy ? (
          <>
            <button className="picker-back-btn" onClick={() => { setDataSetStep('study'); setSelectedStudy(null); }}>
              <ChevronLeft size={14} />
              Back to studies
            </button>
            <div className="picker-list">
              {selectedStudy.waves.map((w) => (
                <div
                  key={w.id}
                  className="picker-list-item"
                  onClick={() => handleDataSetWaveSelect(selectedStudy, w.id)}
                >
                  <div className="picker-list-item__info">
                    <span className="picker-list-item__name">{w.name}</span>
                    <span className="picker-list-item__desc">
                      {w.start_date} — {w.end_date} · n={w.sample_size.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="picker-list">
            {(studies ?? []).map((study) => (
              <div
                key={study.id}
                className="picker-list-item"
                onClick={() => handleStudySelect(study)}
              >
                <div className="picker-list-item__info">
                  <span className="picker-list-item__name">{study.name}</span>
                  {study.description && <span className="picker-list-item__desc">{study.description}</span>}
                </div>
                <span className="picker-list-item__meta">{study.waves.length} waves</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* 5. Wave Picker (multi-select, grouped by study) */}
      <Modal
        open={wavePickerOpen}
        onClose={() => setWavePickerOpen(false)}
        title="Add Waves"
        size="md"
        footer={
          <Button variant="primary" onClick={() => setWavePickerOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="picker-list">
          {wavesGroupedByStudy.map((group) => (
            <div key={group.studyId}>
              <div className="picker-study-header">{group.studyName}</div>
              {group.waves.map((w) => {
                const isSelected = selectedWaveIds.has(w.id);
                return (
                  <div
                    key={w.id}
                    className={`picker-list-item ${isSelected ? 'picker-list-item--selected' : ''}`}
                    onClick={() => handleWaveAdd(w.study_id, w.id)}
                  >
                    <div className="picker-list-item__info">
                      <span className="picker-list-item__name">{w.name}</span>
                      <span className="picker-list-item__desc">n={w.sample_size.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
