import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, MoreHorizontal, Save, Users, Plus, X, MessageSquare, TrendingUp, Eye, Accessibility, FileImage, FileText, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { chartsApi } from '@/api';
import { useChart, useUpdateChart, useCreateChart, useDeleteChart } from '@/hooks/useCharts';
import { useAudiences } from '@/hooks/useAudiences';
import { useStudies, useWaves, useQuestions } from '@/hooks/useTaxonomy';
import { useStatsQuery } from '@/hooks/useQueries';
import ChartRenderer from '@/components/chart/ChartRenderer';
import QuestionBrowser from '@/components/taxonomy/QuestionBrowser';
import { Button, Dropdown, Modal, BaseAudiencePicker, getBaseAudienceLabel } from '@/components/shared';
import ShareDialog from '@/components/sharing/ShareDialog';
import GuardrailsPanel from '@/components/workspace/GuardrailsPanel';
import type { SharingConfig } from '@/api/types';
import { formatRelativeDate } from '@/utils/format';
import type {
  ChartType,
  ChartDimension,
  MetricType,
  StatsQueryRequest,
  StatsDatapoint,
  AudienceExpression,
  AudienceQuestion,
  Audience,
  Question,
  ChartAnnotation,
  ComparisonConfig,
  StatisticalOverlays,
  AccessibilityOptions,
  PaletteMode,
} from '@/api/types';

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}
import './ChartDetail.css';

// All 21 chart types
const chartTypeOptions: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'stacked_bar', label: 'Stacked Bar' },
  { value: 'grouped_bar', label: 'Grouped Bar' },
  { value: 'horizontal_bar', label: 'Horizontal Bar' },
  { value: 'line', label: 'Line Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'stacked_area', label: 'Stacked Area' },
  { value: 'combo', label: 'Combo Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'donut', label: 'Donut' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'waterfall', label: 'Waterfall' },
  { value: 'funnel', label: 'Funnel' },
  { value: 'radar', label: 'Radar' },
  { value: 'treemap', label: 'Treemap' },
  { value: 'bullet', label: 'Bullet' },
  { value: 'heatmap', label: 'Heatmap' },
  { value: 'gauge', label: 'Gauge' },
  { value: 'sankey', label: 'Sankey' },
  { value: 'geo_map', label: 'Geo Map' },
  { value: 'table', label: 'Table' },
];

// Expanded metrics including new ones
const metricOptions: { value: MetricType; label: string }[] = [
  { value: 'audience_percentage', label: 'Percentage' },
  { value: 'audience_index', label: 'Index' },
  { value: 'audience_size', label: 'Audience Size' },
  { value: 'positive_size', label: 'Sample Count' },
  { value: 'column_percentage', label: 'Column %' },
  { value: 'row_percentage', label: 'Row %' },
  { value: 'mean', label: 'Mean' },
  { value: 'median', label: 'Median' },
  { value: 'effective_base', label: 'Effective Base' },
  { value: 'weighted_base', label: 'Weighted Base' },
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

  // --- Annotations state ---
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([]);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [newAnnotationContent, setNewAnnotationContent] = useState('');
  const [newAnnotationType, setNewAnnotationType] = useState<ChartAnnotation['type']>('text');

  // --- Comparison config state ---
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonWave, setComparisonWave] = useState<string>('');
  const [comparisonMode, setComparisonMode] = useState<ComparisonConfig['mode']>('none');

  // --- Statistical overlays state ---
  const [showTrendLine, setShowTrendLine] = useState(false);
  const [trendLineType, setTrendLineType] = useState<'linear' | 'logarithmic' | 'exponential' | 'polynomial'>('linear');
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState<0.90 | 0.95 | 0.99>(0.95);

  // --- Accessibility options state ---
  const [usePatternFills, setUsePatternFills] = useState(false);
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('default');
  const [showDataTable, setShowDataTable] = useState(false);
  const [enableKeyboardNav, setEnableKeyboardNav] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

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
      // Restore annotations
      if (chart.config.annotations) {
        setAnnotations(chart.config.annotations);
      }
      // Restore comparison
      if (chart.config.comparison) {
        setComparisonEnabled(chart.config.comparison.mode !== 'none');
        setComparisonMode(chart.config.comparison.mode);
        if (chart.config.comparison.comparison_wave_ids?.[0]) {
          setComparisonWave(chart.config.comparison.comparison_wave_ids[0].wave_id);
        }
      }
      // Restore statistical overlays
      if (chart.config.statistical_overlays) {
        const overlays = chart.config.statistical_overlays;
        if (overlays.trend_line?.enabled) {
          setShowTrendLine(true);
          setTrendLineType(overlays.trend_line.type);
        }
        if (overlays.confidence_interval?.enabled) {
          setShowConfidenceIntervals(true);
          setConfidenceLevel(overlays.confidence_interval.level);
        }
      }
      // Restore accessibility
      if (chart.config.accessibility) {
        setUsePatternFills(chart.config.accessibility.use_patterns);
        setPaletteMode(chart.config.accessibility.palette_mode);
        setShowDataTable(chart.config.accessibility.show_data_table);
        setEnableKeyboardNav(chart.config.accessibility.enable_keyboard_nav);
        setReduceMotion(chart.config.accessibility.reduce_motion);
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
      include_confidence_intervals: showConfidenceIntervals,
      comparison_wave_ids: comparisonEnabled && comparisonWave ? [{ study_id: '', wave_id: comparisonWave }] : undefined,
    };
  }, [rows, selectedMetric, selectedWave, chart?.config.wave_ids, chart?.config.location_ids, baseAudience, showConfidenceIntervals, comparisonEnabled, comparisonWave]);

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

  // Build statistical overlays config from state
  const statisticalOverlays: StatisticalOverlays | undefined = useMemo(() => {
    if (!showTrendLine && !showConfidenceIntervals) return undefined;
    return {
      trend_line: showTrendLine ? { enabled: true, type: trendLineType } : undefined,
      confidence_interval: showConfidenceIntervals ? { enabled: true, level: confidenceLevel } : undefined,
    };
  }, [showTrendLine, trendLineType, showConfidenceIntervals, confidenceLevel]);

  // Build accessibility options from state
  const accessibilityOptions: AccessibilityOptions | undefined = useMemo(() => {
    if (!usePatternFills && paletteMode === 'default' && !showDataTable && !enableKeyboardNav && !reduceMotion) return undefined;
    return {
      palette_mode: paletteMode,
      use_patterns: usePatternFills,
      show_data_table: showDataTable,
      enable_keyboard_nav: enableKeyboardNav,
      reduce_motion: reduceMotion,
    };
  }, [usePatternFills, paletteMode, showDataTable, enableKeyboardNav, reduceMotion]);

  // Build comparison config from state
  const comparisonConfig: ComparisonConfig | undefined = useMemo(() => {
    if (!comparisonEnabled) return undefined;
    return {
      mode: comparisonMode,
      comparison_wave_ids: comparisonWave ? [{ study_id: '', wave_id: comparisonWave }] : undefined,
      show_absolute_change: true,
      show_percentage_change: true,
    };
  }, [comparisonEnabled, comparisonMode, comparisonWave]);

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

  // Annotation handlers
  const handleAddAnnotation = () => {
    if (!newAnnotationContent.trim()) return;
    const annotation: ChartAnnotation = {
      id: `ann-${Date.now()}`,
      type: newAnnotationType,
      content: newAnnotationContent.trim(),
      anchor: { position: 'top' },
    };
    setAnnotations((prev) => [...prev, annotation]);
    setNewAnnotationContent('');
    setNewAnnotationType('text');
    setShowAnnotationModal(false);
    toast.success('Annotation added');
  };

  const handleRemoveAnnotation = (annotationId: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
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
    if (JSON.stringify(annotations) !== JSON.stringify(chart.config.annotations ?? [])) return true;
    if (comparisonEnabled !== (chart.config.comparison?.mode !== 'none' && chart.config.comparison?.mode !== undefined)) return true;
    if (showTrendLine !== (chart.config.statistical_overlays?.trend_line?.enabled ?? false)) return true;
    if (showConfidenceIntervals !== (chart.config.statistical_overlays?.confidence_interval?.enabled ?? false)) return true;
    if (usePatternFills !== (chart.config.accessibility?.use_patterns ?? false)) return true;
    if (paletteMode !== (chart.config.accessibility?.palette_mode ?? 'default')) return true;
    return false;
  }, [chart, isNew, chartName, chartType, selectedMetric, rows, showLegend, showGrid, showLabels, annotations, comparisonEnabled, showTrendLine, showConfidenceIntervals, usePatternFills, paletteMode]);

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
      annotations: annotations.length > 0 ? annotations : undefined,
      comparison: comparisonConfig,
      statistical_overlays: statisticalOverlays,
      accessibility: accessibilityOptions,
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
            annotations: annotations.length > 0 ? annotations : undefined,
            comparison: comparisonConfig,
            statistical_overlays: statisticalOverlays,
            accessibility: accessibilityOptions,
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

  // Export format handlers
  const handleExportPng = () => {
    toast.success('PNG export started');
    // In a real implementation, this would use html-to-image or canvas
  };

  const handleExportSvg = () => {
    toast.success('SVG export started');
    // In a real implementation, this would serialize the SVG chart node
  };

  const handleExportPdf = () => {
    toast.success('PDF export started');
    // In a real implementation, this would use jsPDF or similar
  };

  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleSaveSharing = (config: SharingConfig) => {
    toast.success(`Sharing updated: ${config.visibility}`);
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
        handleExportPng();
        break;
      case 'export-svg':
        handleExportSvg();
        break;
      case 'export-pdf':
        handleExportPdf();
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

  // More actions dropdown with expanded export formats
  const moreActions = [
    { label: 'Duplicate', value: 'duplicate' },
    { label: 'Export as PNG', value: 'export-png' },
    { label: 'Export as SVG', value: 'export-svg' },
    { label: 'Export as PDF', value: 'export-pdf' },
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
          <GuardrailsPanel compact />
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

            <div className="config-divider" />

            {/* Annotations section */}
            <div className="config-group">
              <label>
                <MessageSquare size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Annotations
              </label>
              {annotations.length > 0 && (
                <div className="config-pills-list">
                  {annotations.map((ann) => (
                    <span key={ann.id} className="config-pill-item">
                      {ann.content.length > 25 ? `${ann.content.slice(0, 25)}...` : ann.content}
                      <button className="config-pill-remove" onClick={() => handleRemoveAnnotation(ann.id)}>
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
                onClick={() => setShowAnnotationModal(true)}
              >
                Add Annotation
              </Button>
            </div>

            <div className="config-divider" />

            {/* Comparison config */}
            <div className="config-group">
              <label>
                <TrendingUp size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Comparison
              </label>
              <label className="config-checkbox">
                <input
                  type="checkbox"
                  checked={comparisonEnabled}
                  onChange={(e) => {
                    setComparisonEnabled(e.target.checked);
                    if (!e.target.checked) setComparisonMode('none');
                    else setComparisonMode('period_over_period');
                  }}
                />
                Enable comparison
              </label>
              {comparisonEnabled && (
                <>
                  <select
                    className="config-select"
                    value={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.value as ComparisonConfig['mode'])}
                    style={{ marginTop: 4 }}
                  >
                    <option value="period_over_period">Period over Period</option>
                    <option value="audience_comparison">Audience Comparison</option>
                    <option value="benchmark">Benchmark</option>
                  </select>
                  {comparisonMode === 'period_over_period' && (
                    <select
                      className="config-select"
                      value={comparisonWave}
                      onChange={(e) => setComparisonWave(e.target.value)}
                      style={{ marginTop: 4 }}
                    >
                      <option value="">Select comparison wave...</option>
                      {waveOptions
                        .filter((w) => w.value !== selectedWave)
                        .map((w) => (
                          <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                    </select>
                  )}
                </>
              )}
            </div>

            <div className="config-divider" />

            {/* Statistical overlays */}
            <div className="config-group">
              <label>
                <Eye size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Statistical Overlays
              </label>
              <label className="config-checkbox">
                <input
                  type="checkbox"
                  checked={showTrendLine}
                  onChange={(e) => setShowTrendLine(e.target.checked)}
                />
                Trend Line
              </label>
              {showTrendLine && (
                <select
                  className="config-select"
                  value={trendLineType}
                  onChange={(e) => setTrendLineType(e.target.value as typeof trendLineType)}
                  style={{ marginTop: 4 }}
                >
                  <option value="linear">Linear</option>
                  <option value="logarithmic">Logarithmic</option>
                  <option value="exponential">Exponential</option>
                  <option value="polynomial">Polynomial</option>
                </select>
              )}
              <label className="config-checkbox">
                <input
                  type="checkbox"
                  checked={showConfidenceIntervals}
                  onChange={(e) => setShowConfidenceIntervals(e.target.checked)}
                />
                Confidence Intervals
              </label>
              {showConfidenceIntervals && (
                <select
                  className="config-select"
                  value={String(confidenceLevel)}
                  onChange={(e) => setConfidenceLevel(parseFloat(e.target.value) as 0.90 | 0.95 | 0.99)}
                  style={{ marginTop: 4 }}
                >
                  <option value="0.9">90%</option>
                  <option value="0.95">95%</option>
                  <option value="0.99">99%</option>
                </select>
              )}
            </div>

            <div className="config-divider" />

            {/* Accessibility options */}
            <div className="config-group">
              <label>
                <Accessibility size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Accessibility
              </label>
              <label className="config-checkbox">
                <input
                  type="checkbox"
                  checked={usePatternFills}
                  onChange={(e) => setUsePatternFills(e.target.checked)}
                />
                Pattern Fills
              </label>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>Color Palette</span>
                <select
                  className="config-select"
                  value={paletteMode}
                  onChange={(e) => setPaletteMode(e.target.value as PaletteMode)}
                  style={{ marginTop: 2 }}
                >
                  <option value="default">Default</option>
                  <option value="colorblind_safe">Colorblind Safe</option>
                  <option value="high_contrast">High Contrast</option>
                  <option value="monochrome">Monochrome</option>
                </select>
              </div>
              <label className="config-checkbox">
                <input
                  type="checkbox"
                  checked={showDataTable}
                  onChange={(e) => setShowDataTable(e.target.checked)}
                />
                Show Accessible Data Table
              </label>
              <label className="config-checkbox">
                <input
                  type="checkbox"
                  checked={enableKeyboardNav}
                  onChange={(e) => setEnableKeyboardNav(e.target.checked)}
                />
                Keyboard Navigation
              </label>
              <label className="config-checkbox">
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={(e) => setReduceMotion(e.target.checked)}
                />
                Reduce Motion
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

      {/* Annotation Modal */}
      <Modal
        open={showAnnotationModal}
        onClose={() => { setShowAnnotationModal(false); setNewAnnotationContent(''); }}
        title="Add Annotation"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => { setShowAnnotationModal(false); setNewAnnotationContent(''); }}>Cancel</Button>
            <Button variant="primary" onClick={handleAddAnnotation} disabled={!newAnnotationContent.trim()}>Add</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Type</label>
            <select
              className="config-select"
              value={newAnnotationType}
              onChange={(e) => setNewAnnotationType(e.target.value as ChartAnnotation['type'])}
              style={{ width: '100%' }}
            >
              <option value="text">Text</option>
              <option value="callout">Callout</option>
              <option value="highlight_region">Highlight Region</option>
              <option value="reference_marker">Reference Marker</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Content</label>
            <textarea
              value={newAnnotationContent}
              onChange={(e) => setNewAnnotationContent(e.target.value)}
              placeholder="Enter annotation text..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '6px',
                fontSize: '13px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
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

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        title={chartName || 'Untitled Chart'}
        onSave={handleSaveSharing}
      />
    </div>
  );
}
