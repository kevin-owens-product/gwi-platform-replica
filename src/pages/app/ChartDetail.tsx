import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, MoreHorizontal, Save, Users, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { chartsApi } from '@/api';
import { useChart, useUpdateChart, useCreateChart, useDeleteChart } from '@/hooks/useCharts';
import { useAudiences } from '@/hooks/useAudiences';
import { useStudies, useWaves, useQuestions } from '@/hooks/useTaxonomy';
import { useStatsQuery } from '@/hooks/useQueries';
import ChartRenderer from '@/components/chart/ChartRenderer';
import QuestionBrowser from '@/components/taxonomy/QuestionBrowser';
import { Button, Dropdown, Modal, BaseAudiencePicker, getBaseAudienceLabel } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { ChartType, ChartDimension, MetricType, StatsQueryRequest, StatsDatapoint, AudienceExpression, AudienceQuestion, Audience, Question } from '@/api/types';

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}
import './ChartDetail.css';

const chartTypeOptions: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'stacked_bar', label: 'Stacked Bar' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie / Donut' },
  { value: 'donut', label: 'Donut' },
  { value: 'scatter', label: 'Scatter Plot' },
];

const metricOptions: { value: MetricType; label: string }[] = [
  { value: 'audience_percentage', label: 'Percentage' },
  { value: 'audience_index', label: 'Index' },
  { value: 'audience_size', label: 'Audience Size' },
  { value: 'positive_size', label: 'Sample Count' },
];

const fallbackDataSources: string[] = ['GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Work'];

export default function ChartDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  // Fetch audience, study, and question data from API
  const { data: audienceResponse } = useAudiences({ per_page: 50 });
  const { data: studies } = useStudies();
  const { data: waves } = useWaves();
  const { data: questionsResponse } = useQuestions({ per_page: 100 });

  const audiences = useMemo(() => audienceResponse?.data ?? [], [audienceResponse]);
  const questions = useMemo(() => questionsResponse?.data ?? [], [questionsResponse]);

  const dataSources = useMemo(() => {
    if (studies && studies.length > 0) {
      return studies.map((s) => s.name);
    }
    return fallbackDataSources;
  }, [studies]);

  const waveOptions = useMemo(() => {
    if (waves && waves.length > 0) {
      return waves.map((w) => ({ label: w.name, value: w.id }));
    }
    return [
      { label: 'Q4 2024', value: 'q4-2024' },
      { label: 'Q3 2024', value: 'q3-2024' },
      { label: 'Q2 2024', value: 'q2-2024' },
      { label: 'Q1 2024', value: 'q1-2024' },
    ];
  }, [waves]);

  // Fetch existing chart data
  const { data: chart, isLoading: chartLoading } = useChart(isNew ? '' : (id ?? ''));
  const updateChart = useUpdateChart();
  const createChart = useCreateChart();
  const deleteChart = useDeleteChart();

  // Local editable state, seeded from API data
  const [chartName, setChartName] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('audience_percentage');
  const [activeView, setActiveView] = useState<'chart' | 'table' | 'summary'>('chart');
  const [baseAudience, setBaseAudience] = useState<AudienceExpression | undefined>(undefined);
  const [audiencePickerOpen, setAudiencePickerOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('GWI Core');
  const [selectedWave, setSelectedWave] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Question editor state
  const [rows, setRows] = useState<ChartDimension[]>([]);
  const [questionPickerOpen, setQuestionPickerOpen] = useState(false);

  // Display options state
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Seed local state from the fetched chart once
  useEffect(() => {
    if (chart && !isInitialized) {
      setChartName(chart.name);
      setChartType(chart.chart_type);
      if (chart.config.metrics?.[0]) {
        setSelectedMetric(chart.config.metrics[0]);
      }
      if (chart.config.base_audience) {
        setBaseAudience(chart.config.base_audience);
      }
      if (chart.config.wave_ids?.[0]) {
        setSelectedWave(chart.config.wave_ids[0].wave_id);
      } else if (waveOptions[0]) {
        setSelectedWave(waveOptions[0].value);
      }
      if (chart.config.rows) {
        setRows(chart.config.rows);
      }
      if (chart.config.options) {
        setShowLegend(chart.config.options.show_legend ?? true);
        setShowGrid(chart.config.options.show_grid ?? true);
        setShowLabels(chart.config.options.show_labels ?? true);
      }
      setIsInitialized(true);
    }
  }, [chart, isInitialized, waveOptions]);

  // Derive display label for the current base audience
  const baseAudienceLabel = useMemo(
    () => getBaseAudienceLabel(baseAudience, audiences, questions),
    [baseAudience, audiences, questions],
  );

  // Selected question IDs for picker highlighting
  const selectedQuestionIds = useMemo(
    () => rows.filter((r) => r.question_id).map((r) => r.question_id!),
    [rows],
  );

  // Build stats query from local state
  const statsRequest: StatsQueryRequest | null = useMemo(() => {
    const questionIds = rows
      .filter((d) => d.type === 'question' && d.question_id)
      .map((d) => d.question_id!);
    if (questionIds.length === 0) return null;

    return {
      question_ids: questionIds,
      metrics: [selectedMetric],
      wave_ids: selectedWave ? [{ study_id: '', wave_id: selectedWave }] : (chart?.config.wave_ids ?? []),
      location_ids: chart?.config.location_ids ?? [],
      base_audience: baseAudience,
    };
  }, [rows, selectedMetric, selectedWave, chart?.config.wave_ids, chart?.config.location_ids, baseAudience]);

  const { data: statsData, isLoading: statsLoading } = useStatsQuery(statsRequest);

  // Transform stats response into format ChartRenderer expects
  const { chartData, series } = useMemo((): { chartData: ChartDataPoint[]; series: string[] } => {
    if (!statsData?.results?.length) {
      return { chartData: [], series: [] };
    }

    const result = statsData.results[0];
    if (!result) return { chartData: [], series: [] };

    const seriesNames = [metricOptions.find((m) => m.value === selectedMetric)?.label ?? selectedMetric];

    const data: ChartDataPoint[] = result.datapoints.map((dp: StatsDatapoint) => ({
      name: dp.datapoint_name,
      [seriesNames[0]]: dp.metrics[selectedMetric] ?? 0,
    }));

    if (statsData.results.length > 1) {
      const multiSeries = statsData.results.map((r) => r.question_name);
      const dpNames = new Set<string>();
      statsData.results.forEach((r) =>
        r.datapoints.forEach((dp: StatsDatapoint) => dpNames.add(dp.datapoint_name))
      );

      const multiData: ChartDataPoint[] = Array.from(dpNames).map((dpName) => {
        const row: ChartDataPoint = { name: dpName };
        statsData.results.forEach((r) => {
          const dp = r.datapoints.find((d: StatsDatapoint) => d.datapoint_name === dpName);
          row[r.question_name] = dp?.metrics[selectedMetric] ?? 0;
        });
        return row;
      });

      return { chartData: multiData, series: multiSeries };
    }

    return { chartData: data, series: seriesNames };
  }, [statsData, selectedMetric]);

  // Base audience picker handlers
  const handleBaseSelectSaved = (aud: Audience) => {
    setBaseAudience(aud.expression);
  };

  const handleBaseApplyQuestion = (expr: AudienceQuestion) => {
    setBaseAudience(expr);
  };

  const handleBaseClear = () => {
    setBaseAudience(undefined);
  };

  // Question editor handlers
  const handleQuestionSelect = (question: Question) => {
    const dpIds = question.datapoints.map((dp) => dp.id);
    setRows((prev) => {
      if (prev.some((r) => r.question_id === question.id)) return prev;
      return [...prev, { type: 'question', question_id: question.id, datapoint_ids: dpIds }];
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Dirty tracking
  const isDirty = useMemo(() => {
    if (!chart || isNew) return false;
    if (chartName !== chart.name) return true;
    if (chartType !== chart.chart_type) return true;
    if (selectedMetric !== (chart.config.metrics?.[0] ?? 'audience_percentage')) return true;
    if (JSON.stringify(rows) !== JSON.stringify(chart.config.rows ?? [])) return true;
    if (showLegend !== (chart.config.options?.show_legend ?? true)) return true;
    if (showGrid !== (chart.config.options?.show_grid ?? true)) return true;
    if (showLabels !== (chart.config.options?.show_labels ?? true)) return true;
    return false;
  }, [chart, isNew, chartName, chartType, selectedMetric, rows, showLegend, showGrid, showLabels]);

  // Save handler
  const handleSave = () => {
    const configPayload = {
      ...chart?.config,
      rows,
      metrics: [selectedMetric],
      base_audience: baseAudience,
      wave_ids: selectedWave ? [{ study_id: '', wave_id: selectedWave }] : (chart?.config.wave_ids ?? []),
      options: {
        show_legend: showLegend,
        show_grid: showGrid,
        show_labels: showLabels,
      },
    };

    if (isNew) {
      createChart.mutate(
        {
          name: chartName || 'Untitled Chart',
          chart_type: chartType,
          config: {
            rows,
            columns: [],
            metrics: [selectedMetric],
            wave_ids: selectedWave ? [{ study_id: '', wave_id: selectedWave }] : [],
            location_ids: [],
            base_audience: baseAudience,
            options: { show_legend: showLegend, show_grid: showGrid, show_labels: showLabels },
          },
        },
        {
          onSuccess: (newChart) => {
            if (newChart?.id) navigate(`/app/chart-builder/chart/${newChart.id}`);
          },
        }
      );
    } else if (id) {
      updateChart.mutate({
        id,
        data: {
          name: chartName,
          chart_type: chartType,
          config: configPayload,
        },
      });
    }
  };

  // CSV export
  const handleDownloadCsv = () => {
    if (chartData.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Label', ...series];
    const csvRows = [headers.join(',')];
    for (const row of chartData) {
      csvRows.push([
        `"${String(row.name).replace(/"/g, '""')}"`,
        ...series.map((s) => String(row[s] ?? '')),
      ].join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartName || 'chart'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  // Share handler
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  // More actions handler
  const handleMoreAction = async (value: string) => {
    switch (value) {
      case 'duplicate': {
        if (!id || isNew) return;
        try {
          const copy = await chartsApi.duplicate(id);
          toast.success('Chart duplicated');
          navigate(`/app/chart-builder/chart/${copy.id}`);
        } catch {
          toast.error('Failed to duplicate chart');
        }
        break;
      }
      case 'export-csv':
        handleDownloadCsv();
        break;
      case 'export-png':
        toast('PNG export coming soon');
        break;
      case 'delete':
        setShowDeleteModal(true);
        break;
    }
  };

  const handleConfirmDelete = () => {
    if (!id) return;
    deleteChart.mutate(id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        navigate('/app/chart-builder');
      },
    });
  };

  const isDataLoading = chartLoading || statsLoading;
  const isSaving = updateChart.isPending || createChart.isPending;

  // More actions dropdown
  const moreActions = [
    { label: 'Duplicate', value: 'duplicate' },
    { label: 'Export as PNG', value: 'export-png' },
    { label: 'Export as CSV', value: 'export-csv' },
    { label: 'Delete', value: 'delete', danger: true },
  ];

  // Get question labels for pills
  const questionLabels = useMemo(() => {
    return rows.map((r) => {
      const q = questions.find((q) => q.id === r.question_id);
      return q?.name ?? r.question_id ?? 'Unknown';
    });
  }, [rows, questions]);

  if (chartLoading && !isNew) {
    return (
      <div className="chart-detail-page">
        <div className="chart-detail-header">
          <Link to="/app/chart-builder" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Charts</span>
          </Link>
        </div>
        <div className="chart-detail-loading">
          <div className="charts-loading-spinner" />
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-detail-page">
      <div className="chart-detail-header">
        <Link to="/app/chart-builder" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Charts</span>
        </Link>
        <div className="header-actions">
          <button className="icon-btn" onClick={handleDownloadCsv} title="Download CSV"><Download size={18} /></button>
          <button className="icon-btn" onClick={handleShare} title="Copy link"><Share2 size={18} /></button>
          <Dropdown
            trigger={<button className="icon-btn"><MoreHorizontal size={18} /></button>}
            items={moreActions}
            onSelect={handleMoreAction}
            align="right"
          />
          <Button
            variant="primary"
            icon={<Save size={16} />}
            loading={isSaving}
            onClick={handleSave}
          >
            {isNew ? 'Create' : isDirty ? 'Save *' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="chart-detail-title-section">
        <input
          type="text"
          className="chart-title-input"
          value={chartName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChartName(e.target.value)}
          placeholder="Untitled Chart"
        />
        <p className="chart-subtitle">
          {chart?.updated_at ? `Last updated ${formatRelativeDate(chart.updated_at)}` : isNew ? 'New chart' : ''}
        </p>
      </div>

      <div className="chart-detail-content">
        <div className="chart-main-area">
          <div className="chart-view-tabs">
            <button className={`chart-view-tab ${activeView === 'chart' ? 'active' : ''}`} onClick={() => setActiveView('chart')}>Chart</button>
            <button className={`chart-view-tab ${activeView === 'table' ? 'active' : ''}`} onClick={() => setActiveView('table')}>Table</button>
            <button className={`chart-view-tab ${activeView === 'summary' ? 'active' : ''}`} onClick={() => setActiveView('summary')}>Summary</button>
          </div>

          <div className="chart-canvas">
            {activeView === 'chart' && (
              <>
                {isDataLoading ? (
                  <div className="chart-detail-loading">
                    <div className="charts-loading-spinner" />
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <ChartRenderer
                    type={chartType}
                    data={chartData}
                    series={series}
                    showLegend={showLegend}
                    showGrid={showGrid}
                  />
                )}
              </>
            )}
            {activeView === 'table' && (
              <div className="chart-table-wrapper">
                {isDataLoading ? (
                  <div className="chart-detail-loading">
                    <div className="charts-loading-spinner" />
                    <p>Loading data...</p>
                  </div>
                ) : chartData.length > 0 ? (
                  <table className="chart-data-table">
                    <thead>
                      <tr>
                        <th>Label</th>
                        {series.map((s: string) => <th key={s}>{s}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((row) => (
                        <tr key={String(row.name)}>
                          <td className="row-label">{String(row.name)}</td>
                          {series.map((s: string) => (
                            <td key={s}>{typeof row[s] === 'number' ? `${row[s]}%` : row[s] ?? '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="chart-empty-message">No data to display. Configure chart questions first.</p>
                )}
              </div>
            )}
            {activeView === 'summary' && (
              <div className="chart-summary">
                <div className="summary-stat">
                  <span className="summary-label">Sample Size</span>
                  <span className="summary-value">{statsData?.meta?.base_size?.toLocaleString() ?? '-'}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Wave</span>
                  <span className="summary-value">{statsData?.meta?.wave_name ?? '-'}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Location</span>
                  <span className="summary-value">{statsData?.meta?.location_name ?? '-'}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Data Source</span>
                  <span className="summary-value">{selectedSource}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Audience</span>
                  <span className="summary-value">{baseAudienceLabel}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Execution Time</span>
                  <span className="summary-value">{statsData?.meta?.execution_time_ms ? `${statsData.meta.execution_time_ms}ms` : '-'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="chart-config-panel">
          <h3>Configuration</h3>
          <div className="config-options">
            {/* Questions section */}
            <div className="config-group">
              <label>Questions</label>
              {rows.length > 0 && (
                <div className="config-pills-list">
                  {rows.map((r, i) => (
                    <span key={r.question_id ?? i} className="config-pill-item">
                      {questionLabels[i]}
                      <button className="config-pill-remove" onClick={() => handleRemoveQuestion(i)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setQuestionPickerOpen(true)}
              >
                Add Question
              </Button>
            </div>
            <div className="config-group">
              <label>Chart Type</label>
              <select className="config-select" value={chartType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChartType(e.target.value as ChartType)}>
                {chartTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="config-group">
              <label>Metric</label>
              <select className="config-select" value={selectedMetric} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMetric(e.target.value as MetricType)}>
                {metricOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="config-group">
              <label>Data Source</label>
              <select className="config-select" value={selectedSource} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSource(e.target.value)}>
                {dataSources.map((ds: string) => <option key={ds} value={ds}>{ds}</option>)}
              </select>
            </div>
            <div className="config-group">
              <label>Audience</label>
              <button
                className="config-select"
                onClick={() => setAudiencePickerOpen(true)}
                style={{ textAlign: 'left', width: '100%' }}
              >
                <Users size={14} />
                {baseAudienceLabel}
              </button>
            </div>
            <div className="config-group">
              <label>Wave</label>
              <select
                className="config-select"
                value={selectedWave}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedWave(e.target.value)}
              >
                {waveOptions.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
            <div className="config-divider" />
            {/* Display Options */}
            <div className="config-group">
              <label>Display Options</label>
              <label className="config-checkbox">
                <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />
                Show Legend
              </label>
              <label className="config-checkbox">
                <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                Show Grid
              </label>
              <label className="config-checkbox">
                <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                Show Labels
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Question Picker Modal */}
      <Modal
        open={questionPickerOpen}
        onClose={() => setQuestionPickerOpen(false)}
        title="Add Questions"
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setQuestionPickerOpen(false)}>
            Done
          </Button>
        }
      >
        <QuestionBrowser
          onSelectQuestion={handleQuestionSelect}
          selectedQuestionIds={selectedQuestionIds}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Chart"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={deleteChart.isPending} onClick={handleConfirmDelete}>Delete</Button>
          </div>
        }
      >
        <p>Are you sure you want to delete &ldquo;{chartName || 'this chart'}&rdquo;? This action cannot be undone.</p>
      </Modal>

      <BaseAudiencePicker
        open={audiencePickerOpen}
        onClose={() => setAudiencePickerOpen(false)}
        audiences={audiences}
        questions={questions}
        onSelectSaved={handleBaseSelectSaved}
        onApplyQuestion={handleBaseApplyQuestion}
        onClear={handleBaseClear}
      />
    </div>
  );
}
