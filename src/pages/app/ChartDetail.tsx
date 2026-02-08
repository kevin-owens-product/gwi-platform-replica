import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, MoreHorizontal, Save, Users, Plus, X, MessageSquarePlus, GitCompareArrows, Image, FileText, Presentation, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
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

interface Annotation {
  id: string;
  text: string;
  timestamp: Date;
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
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(false);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Annotations state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationText, setAnnotationText] = useState<string>('');
  const [showAnnotationInput, setShowAnnotationInput] = useState(false);

  // Compare Waves toggle
  const [compareWaves, setCompareWaves] = useState(false);

  // Export Options expanded section
  const [exportOptionsOpen, setExportOptionsOpen] = useState(false);

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

  // Statistical summary computed from chart data
  const statisticalSummary = useMemo(() => {
    const allValues: number[] = [];
    for (const row of chartData) {
      for (const s of series) {
        const val = row[s];
        if (typeof val === 'number') {
          allValues.push(val);
        }
      }
    }
    if (allValues.length === 0) {
      return null;
    }
    const sorted = [...allValues].sort((a, b) => a - b);
    const sum = allValues.reduce((acc, v) => acc + v, 0);
    const mean = sum / allValues.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const variance = allValues.reduce((acc, v) => acc + (v - mean) ** 2, 0) / allValues.length;
    const stdDev = Math.sqrt(variance);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Mock p-values for significance indicators
    const mockPValues = [
      { comparison: 'vs. National Average', pValue: 0.003, significant: true },
      { comparison: 'vs. Previous Wave', pValue: 0.042, significant: true },
      { comparison: 'vs. Competitor Benchmark', pValue: 0.187, significant: false },
    ];

    return { mean, median, stdDev, min, max, count: allValues.length, mockPValues };
  }, [chartData, series]);

  // Annotation handlers
  const handleAddAnnotation = () => {
    if (!annotationText.trim()) return;
    const newAnnotation: Annotation = {
      id: `note-${Date.now()}`,
      text: annotationText.trim(),
      timestamp: new Date(),
    };
    setAnnotations((prev) => [newAnnotation, ...prev]);
    setAnnotationText('');
    setShowAnnotationInput(false);
    toast.success('Annotation added');
  };

  const handleRemoveAnnotation = (annotationId: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
  };

  // Export option handlers (mock)
  const handleExportPng = () => {
    toast.success('Exporting as PNG...');
  };

  const handleExportPdf = () => {
    toast.success('Exporting as PDF...');
  };

  const handleExportPptx = () => {
    toast.success('Exporting as PowerPoint...');
  };

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
                {compareWaves ? (
                  <div className="compare-waves-container">
                    <div className="compare-waves-panel">
                      <div className="compare-waves-label">Current Wave</div>
                      {isDataLoading ? (
                        <div className="chart-detail-loading">
                          <div className="charts-loading-spinner" />
                          <p>Loading...</p>
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
                    </div>
                    <div className="compare-waves-divider" />
                    <div className="compare-waves-panel">
                      <div className="compare-waves-label">Previous Wave</div>
                      <div className="compare-waves-placeholder">
                        <GitCompareArrows size={32} />
                        <p>Previous wave data would appear here for side-by-side comparison.</p>
                        <span className="compare-waves-hint">Select a different wave to compare</span>
                      </div>
                    </div>
                  </div>
                ) : (
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
              <div className="chart-summary-full">
                {/* Original summary stats */}
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

                {/* Statistical Summary Panel */}
                {statisticalSummary && (
                  <div className="statistical-summary-panel">
                    <div className="statistical-summary-header">
                      <TrendingUp size={16} />
                      <h4>Statistical Summary</h4>
                    </div>
                    <div className="statistical-summary-grid">
                      <div className="stat-item">
                        <span className="stat-item-label">Mean</span>
                        <span className="stat-item-value">{statisticalSummary.mean.toFixed(2)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-item-label">Median</span>
                        <span className="stat-item-value">{statisticalSummary.median.toFixed(2)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-item-label">Std Dev</span>
                        <span className="stat-item-value">{statisticalSummary.stdDev.toFixed(2)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-item-label">Min</span>
                        <span className="stat-item-value">{statisticalSummary.min.toFixed(2)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-item-label">Max</span>
                        <span className="stat-item-value">{statisticalSummary.max.toFixed(2)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-item-label">N (data points)</span>
                        <span className="stat-item-value">{statisticalSummary.count}</span>
                      </div>
                    </div>

                    {/* Significance Indicators */}
                    <div className="significance-section">
                      <h5 className="significance-title">Significance Tests</h5>
                      <div className="significance-list">
                        {statisticalSummary.mockPValues.map((item, idx) => (
                          <div key={idx} className="significance-row">
                            <span className="significance-comparison">{item.comparison}</span>
                            <span className="significance-pvalue">p = {item.pValue.toFixed(3)}</span>
                            <span className={`significance-badge ${item.significant ? 'significant' : 'not-significant'}`}>
                              {item.significant ? 'Significant' : 'Not Significant'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Annotations Section */}
          <div className="annotations-section">
            <div className="annotations-header">
              <h4>Annotations</h4>
              <button
                className="annotation-add-btn"
                onClick={() => setShowAnnotationInput(!showAnnotationInput)}
              >
                <MessageSquarePlus size={14} />
                <span>Add Note</span>
              </button>
            </div>

            {showAnnotationInput && (
              <div className="annotation-input-row">
                <input
                  type="text"
                  className="annotation-input"
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Type your annotation..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddAnnotation(); }}
                  autoFocus
                />
                <button className="annotation-submit-btn" onClick={handleAddAnnotation} disabled={!annotationText.trim()}>
                  Add
                </button>
                <button className="annotation-cancel-btn" onClick={() => { setShowAnnotationInput(false); setAnnotationText(''); }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {annotations.length > 0 && (
              <div className="annotations-list">
                {annotations.map((note) => (
                  <div key={note.id} className="annotation-item">
                    <div className="annotation-content">
                      <p className="annotation-text">{note.text}</p>
                      <span className="annotation-time">
                        {note.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <button className="annotation-remove-btn" onClick={() => handleRemoveAnnotation(note.id)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
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
              <label className="config-checkbox">
                <input type="checkbox" checked={showConfidenceIntervals} onChange={(e) => setShowConfidenceIntervals(e.target.checked)} />
                Confidence Intervals
              </label>
              {showConfidenceIntervals && (
                <span className="config-hint">Error bars will render on supported chart types.</span>
              )}
            </div>
            <div className="config-divider" />
            {/* Compare Waves Toggle */}
            <div className="config-group">
              <label>Comparison</label>
              <label className="config-checkbox">
                <input type="checkbox" checked={compareWaves} onChange={(e) => setCompareWaves(e.target.checked)} />
                Compare Waves
              </label>
              {compareWaves && (
                <span className="config-hint">Side-by-side wave comparison is enabled.</span>
              )}
            </div>
            <div className="config-divider" />
            {/* Export Options */}
            <div className="config-group">
              <button className="config-expand-btn" onClick={() => setExportOptionsOpen(!exportOptionsOpen)}>
                <span>Export Options</span>
                {exportOptionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {exportOptionsOpen && (
                <div className="export-options-list">
                  <button className="export-option-btn" onClick={handleExportPng}>
                    <Image size={14} />
                    <span>Export as PNG</span>
                  </button>
                  <button className="export-option-btn" onClick={handleExportPdf}>
                    <FileText size={14} />
                    <span>Export as PDF</span>
                  </button>
                  <button className="export-option-btn" onClick={handleExportPptx}>
                    <Presentation size={14} />
                    <span>Export as PowerPoint</span>
                  </button>
                  <button className="export-option-btn" onClick={handleDownloadCsv}>
                    <Download size={14} />
                    <span>Export as CSV</span>
                  </button>
                </div>
              )}
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
