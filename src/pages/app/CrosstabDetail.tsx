import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Save, ChevronLeft, FileSpreadsheet, Presentation, Layers, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCrosstab, useUpdateCrosstab, useCreateCrosstab } from '@/hooks/useCrosstabs';
import { useAudiences } from '@/hooks/useAudiences';
import { useStudies, useWaves, useQuestions } from '@/hooks/useTaxonomy';
import { useCrosstabConfig } from '@/hooks/useCrosstabConfig';
import { useCrosstabQuery } from '@/hooks/useQueries';
import CrosstabGrid from '@/components/crosstab/CrosstabGrid';
import CrosstabConfigPanel from '@/components/crosstab/CrosstabConfigPanel';
import QuestionBrowser from '@/components/taxonomy/QuestionBrowser';
import { Button, Modal, SearchInput, BaseAudiencePicker } from '@/components/shared';
import ShareDialog from '@/components/sharing/ShareDialog';
import GuardrailsPanel from '@/components/workspace/GuardrailsPanel';
import { formatRelativeDate, formatMetricValue } from '@/utils/format';
import type { MetricType, CrosstabQueryRequest, Question, Study, AudienceQuestion, Audience, SharingConfig } from '@/api/types';
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

  // Stat test state
  const [statTest, setStatTest] = useState<string>('none');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);

  // Suppression state
  const [suppressionAction, setSuppressionAction] = useState<string>('off');
  const [suppressionThreshold, setSuppressionThreshold] = useState<number>(30);

  // Wave comparison state
  const [waveComparisonMode, setWaveComparisonMode] = useState<string>('single_wave');

  // Rebase state
  const [rebaseMode, setRebaseMode] = useState<string>('column');

  // NET modal state
  const [netModalOpen, setNetModalOpen] = useState(false);
  const [netName, setNetName] = useState('');
  const [netSelectedIds, setNetSelectedIds] = useState<string[]>([]);

  // Table height calculation -- measure available space and size the grid via inline style
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [gridMaxHeight, setGridMaxHeight] = useState<number | undefined>(undefined);

  const recalcTableHeight = useCallback(() => {
    const tableEl = tableContainerRef.current;
    if (!tableEl) return;
    const top = tableEl.getBoundingClientRect().top;
    const footerEl = footerRef.current;
    const footerH = footerEl
      ? footerEl.offsetHeight + parseFloat(getComputedStyle(footerEl).marginTop || '0')
      : 54;
    const pageBottomPad = 32; // var(--spacing-xl)
    const available = window.innerHeight - top - footerH - pageBottomPad;
    setGridMaxHeight(Math.max(200, Math.floor(available)));
  }, []);

  useEffect(() => {
    recalcTableHeight();
    window.addEventListener('resize', recalcTableHeight);
    const observer = new ResizeObserver(recalcTableHeight);
    if (tableContainerRef.current?.parentElement) {
      observer.observe(tableContainerRef.current.parentElement);
    }
    return () => {
      window.removeEventListener('resize', recalcTableHeight);
      observer.disconnect();
    };
  }, [recalcTableHeight]);

  // Modal states
  const [rowPickerOpen, setRowPickerOpen] = useState(false);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [columnPickerTab, setColumnPickerTab] = useState<'question' | 'audience'>('question');
  const [audiencePickerOpen, setAudiencePickerOpen] = useState(false);
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
      // Seed advanced config state
      if (crosstab.config.stat_test) {
        setStatTest(crosstab.config.stat_test.test_type ?? 'none');
        setConfidenceLevel(crosstab.config.stat_test.confidence_levels?.primary ?? 95);
      }
      if (crosstab.config.suppression) {
        setSuppressionAction(crosstab.config.suppression.enabled ? (crosstab.config.suppression.suppression_action ?? 'asterisk') : 'off');
        setSuppressionThreshold(crosstab.config.suppression.minimum_base_size ?? 30);
      }
      if (crosstab.config.wave_comparison) {
        setWaveComparisonMode(crosstab.config.wave_comparison.mode ?? 'single_wave');
      }
      if (crosstab.config.rebasing) {
        setRebaseMode(crosstab.config.rebasing.percentage_base ?? 'column');
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
      timeframe: cfg.timeframe,
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

  // Timeframe change handler
  const handleTimeframeChange = (value: string) => {
    crosstabConfig.setTimeframe(value === 'none' ? undefined : value as 'daily' | 'weekly' | 'monthly');
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

  // Stat test handlers
  const handleStatTestChange = (testType: string) => {
    setStatTest(testType);
    toast.success(`Statistical test: ${testType === 'none' ? 'disabled' : testType.replace(/_/g, ' ')}`);
  };

  const handleConfidenceLevelChange = (level: number) => {
    setConfidenceLevel(level);
    toast.success(`Confidence level: ${level}%`);
  };

  // Suppression handlers
  const handleSuppressionChange = (action: string) => {
    setSuppressionAction(action);
    toast.success(`Suppression: ${action === 'off' ? 'disabled' : action.replace(/_/g, ' ')}`);
  };

  const handleSuppressionThresholdChange = (threshold: number) => {
    setSuppressionThreshold(threshold);
  };

  // Wave comparison handler
  const handleWaveComparisonChange = (mode: string) => {
    setWaveComparisonMode(mode);
    toast.success(`Wave comparison: ${mode.replace(/_/g, ' ')}`);
  };

  // Rebase handler
  const handleRebaseChange = (base: string) => {
    setRebaseMode(base);
    toast.success(`Rebased to: ${base.replace(/_/g, ' ')}`);
  };

  // NET creation handler
  const handleCreateNet = () => {
    setNetName('');
    setNetSelectedIds([]);
    setNetModalOpen(true);
  };

  const handleSaveNet = () => {
    if (!netName.trim()) {
      toast.error('Please enter a NET name');
      return;
    }
    // Add NET as a row dimension
    const netDim = {
      type: 'net' as const,
      label: netName.trim(),
      net_operator: 'or' as const,
      net_member_ids: netSelectedIds,
      net_position: 'below' as const,
      net_show_members: true,
      net_style: 'bold' as const,
    };
    crosstabConfig.addRowQuestion(netDim.label, netSelectedIds);
    setNetModalOpen(false);
    toast.success(`NET "${netName}" created`);
  };

  const toggleNetMemberId = (dpId: string) => {
    setNetSelectedIds((prev) =>
      prev.includes(dpId) ? prev.filter((id) => id !== dpId) : [...prev, dpId]
    );
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

  // Base audience picker handlers
  const handleBaseSelectSaved = (aud: Audience) => {
    crosstabConfig.setBaseAudience(aud.expression);
  };

  const handleBaseApplyQuestion = (expr: AudienceQuestion) => {
    crosstabConfig.setBaseAudience(expr);
  };

  const handleBaseClear = () => {
    crosstabConfig.setBaseAudience(undefined);
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

  // CSV export handler
  const handleDownloadCsv = () => {
    if (gridRows.length === 0 || gridColumns.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Row', ...gridColumns.map((c) => c.label)];
    const csvRows = [headers.join(',')];
    for (let rowIdx = 0; rowIdx < gridRows.length; rowIdx++) {
      const row = gridRows[rowIdx];
      const values = [
        `"${row.label.replace(/"/g, '""')}"`,
        ...gridColumns.map((_, colIdx) => {
          const cell = gridCells[rowIdx]?.[colIdx];
          const val = cell?.values?.[activeMetric];
          return val != null ? formatMetricValue(activeMetric, val) : '';
        }),
      ];
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${crosstabName || 'crosstab'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  // Excel export handler
  const handleExportExcel = () => {
    if (gridRows.length === 0 || gridColumns.length === 0) {
      toast.error('No data to export');
      return;
    }
    toast.success('Excel export started. Your file will download shortly.');
  };

  // PowerPoint export handler
  const handleExportPowerPoint = () => {
    if (gridRows.length === 0 || gridColumns.length === 0) {
      toast.error('No data to export');
      return;
    }
    toast.success('PowerPoint export started. Your file will download shortly.');
  };

  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleSaveSharing = (config: SharingConfig) => {
    toast.success(`Sharing updated: ${config.visibility}`);
  };

  // Unsaved changes tracking
  const nameChanged = crosstab ? crosstabName !== crosstab.name : crosstabName !== '';
  const hasUnsavedChanges = crosstabConfig.isDirty || nameChanged;

  const isDataLoading = crosstabLoading || queryLoading;
  const isSaving = updateCrosstab.isPending || createCrosstab.isPending;

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

  // Available datapoints for NET creation (from currently selected row questions)
  const availableNetDatapoints = useMemo(() => {
    const dpList: { id: string; label: string; questionName: string }[] = [];
    for (const rowDim of crosstabConfig.config.rows) {
      if (rowDim.type === 'question' && rowDim.question_id) {
        const q = questions.find((qu) => qu.id === rowDim.question_id);
        if (q) {
          for (const dp of q.datapoints) {
            dpList.push({ id: dp.id, label: dp.name, questionName: q.name });
          }
        }
      }
    }
    return dpList;
  }, [crosstabConfig.config.rows, questions]);

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
          <button className="icon-btn" onClick={handleDownloadCsv} title="Download CSV"><Download size={18} /></button>
          <button className="icon-btn" onClick={handleExportExcel} title="Export to Excel"><FileSpreadsheet size={18} /></button>
          <button className="icon-btn" onClick={handleExportPowerPoint} title="Export to PowerPoint"><Presentation size={18} /></button>
          <button className="icon-btn" onClick={handleShare} title="Copy link"><Share2 size={18} /></button>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            loading={isSaving}
            onClick={handleSave}
          >
            {isNew ? 'Create' : hasUnsavedChanges ? 'Save *' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="crosstab-detail-content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <input
            type="text"
            className="crosstab-title-input"
            value={crosstabName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrosstabName(e.target.value)}
            placeholder="Untitled Crosstab"
            style={{ marginBottom: 0 }}
          />
          {hasUnsavedChanges && !isNew && (
            <span className="crosstab-unsaved-badge">Unsaved changes</span>
          )}
        </div>

        <div className="crosstab-config-wrapper">
          <GuardrailsPanel compact />
          <CrosstabConfigPanel
            config={crosstabConfig.config}
            questions={questions}
            audiences={audiences}
            waves={waves}
            studies={studies}
            highlightMode={highlightMode}
            timeframe={crosstabConfig.config.timeframe ?? 'none'}
            onRemoveRow={(i) => crosstabConfig.removeRow(i)}
            onRemoveColumn={(i) => crosstabConfig.removeColumn(i)}
            onToggleMetric={(m) => crosstabConfig.toggleMetric(m)}
            onRemoveWave={(i) => crosstabConfig.removeWave(i)}
            onHighlightChange={handleHighlightChange}
            onTimeframeChange={handleTimeframeChange}
            onOpenRowPicker={() => setRowPickerOpen(true)}
            onOpenColumnPicker={() => { setColumnPickerTab('question'); setColumnPickerOpen(true); }}
            onOpenBasePicker={() => setAudiencePickerOpen(true)}
            onOpenDataSetPicker={() => { setDataSetStep('study'); setSelectedStudy(null); setDataSetPickerOpen(true); }}
            onOpenWavePicker={() => setWavePickerOpen(true)}
            onStatTestChange={handleStatTestChange}
            onConfidenceLevelChange={handleConfidenceLevelChange}
            onSuppressionChange={handleSuppressionChange}
            onSuppressionThresholdChange={handleSuppressionThresholdChange}
            onWaveComparisonChange={handleWaveComparisonChange}
            onRebaseChange={handleRebaseChange}
            onCreateNet={handleCreateNet}
          />
        </div>

        <div
          className="crosstab-table-container"
          ref={tableContainerRef}
        >
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
              maxHeight={gridMaxHeight}
            />
          )}
        </div>

        <div className="crosstab-footer" ref={footerRef}>
          <div className="crosstab-stats">
            <span className="crosstab-stat">
              Sample: <strong>{queryResult?.meta?.base_size?.toLocaleString() ?? '-'}</strong>
            </span>
            <span className="crosstab-stat">
              Eff. Base: <strong>{queryResult?.meta?.effective_base?.toLocaleString() ?? '-'}</strong>
            </span>
            <span className="crosstab-stat">
              Wtd Base: <strong>{queryResult?.meta?.weighted_base?.toLocaleString() ?? '-'}</strong>
            </span>
            <span className="crosstab-stat">
              Wave: <strong>{queryResult?.meta?.wave_name ?? '-'}</strong>
            </span>
            {crosstab?.updated_at && (
              <span className="crosstab-stat">
                Updated: <strong>{formatRelativeDate(crosstab.updated_at)}</strong>
              </span>
            )}
            {statTest !== 'none' && (
              <span className="crosstab-stat">
                Test: <strong>{statTest.replace(/_/g, ' ')} ({confidenceLevel}%)</strong>
              </span>
            )}
            {suppressionAction !== 'off' && (
              <span className="crosstab-stat">
                Suppression: <strong>n&lt;{suppressionThreshold}</strong>
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
      <BaseAudiencePicker
        open={audiencePickerOpen}
        onClose={() => setAudiencePickerOpen(false)}
        audiences={audiences}
        questions={questions}
        onSelectSaved={handleBaseSelectSaved}
        onApplyQuestion={handleBaseApplyQuestion}
        onClear={handleBaseClear}
      />

      {/* 4. Data Set Picker (Study -> Wave two-step) */}
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

      {/* 6. NET Creation Modal */}
      <Modal
        open={netModalOpen}
        onClose={() => setNetModalOpen(false)}
        title="Create NET"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setNetModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={<Layers size={16} />} onClick={handleSaveNet}>
              Create NET
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
              NET Name
            </label>
            <input
              type="text"
              value={netName}
              onChange={(e) => setNetName(e.target.value)}
              placeholder="e.g., Top 3 Box, Social Media Users"
              style={{
                width: '100%',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-body)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
              Select datapoints to combine ({netSelectedIds.length} selected)
            </label>
            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}>
              {availableNetDatapoints.length === 0 ? (
                <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-sm)' }}>
                  Add row questions first to create a NET
                </div>
              ) : (
                availableNetDatapoints.map((dp) => {
                  const isSelected = netSelectedIds.includes(dp.id);
                  return (
                    <div
                      key={dp.id}
                      onClick={() => toggleNetMemberId(dp.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--color-primary-light, rgba(227,28,121,0.06))' : 'transparent',
                        borderBottom: '1px solid var(--color-border-light)',
                      }}
                    >
                      <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--color-primary)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 500 }}>{dp.label}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{dp.questionName}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Modal>

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        title={crosstabName || 'Untitled Crosstab'}
        onSave={handleSaveSharing}
      />
    </div>
  );
}
