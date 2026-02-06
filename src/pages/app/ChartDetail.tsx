import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, MoreHorizontal, Save } from 'lucide-react';
import { useChart, useUpdateChart, useCreateChart } from '@/hooks/useCharts';
import { useAudiences } from '@/hooks/useAudiences';
import { useStudies, useWaves } from '@/hooks/useTaxonomy';
import { useStatsQuery } from '@/hooks/useQueries';
import ChartRenderer from '@/components/chart/ChartRenderer';
import { Button, Dropdown } from '@/components/shared';
import { formatRelativeDate } from '@/utils/format';
import type { ChartType, MetricType, StatsQueryRequest, StatsDatapoint } from '@/api/types';

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

const fallbackAudiences: string[] = ['All Adults 16+', 'Adults 18-34', 'Adults 25-54', 'Gen Z', 'Millennials'];
const fallbackDataSources: string[] = ['GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Work'];

export default function ChartDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  // Fetch audience and study options from API
  const { data: audienceResponse } = useAudiences({ per_page: 50 });
  const { data: studies } = useStudies();
  const { data: waves } = useWaves();

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

  // Local editable state, seeded from API data
  const [chartName, setChartName] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('audience_percentage');
  const [activeView, setActiveView] = useState<'chart' | 'table' | 'summary'>('chart');
  const [selectedAudience, setSelectedAudience] = useState<string>('All Adults 16+');
  const [selectedSource, setSelectedSource] = useState<string>('GWI Core');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Seed local state from the fetched chart once
  if (chart && !isInitialized) {
    setChartName(chart.name);
    setChartType(chart.chart_type);
    if (chart.config.metrics?.[0]) {
      setSelectedMetric(chart.config.metrics[0]);
    }
    setIsInitialized(true);
  }

  // Build stats query from the chart config
  const statsRequest: StatsQueryRequest | null = useMemo(() => {
    if (!chart?.config) return null;
    const questionIds = chart.config.rows
      ?.filter((d) => d.type === 'question' && d.question_id)
      .map((d) => d.question_id!) ?? [];
    if (questionIds.length === 0) return null;

    return {
      question_ids: questionIds,
      metrics: chart.config.metrics ?? [selectedMetric],
      wave_ids: chart.config.wave_ids ?? [],
      location_ids: chart.config.location_ids ?? [],
      base_audience: chart.config.base_audience,
    };
  }, [chart?.config, selectedMetric]);

  const { data: statsData, isLoading: statsLoading } = useStatsQuery(statsRequest);

  // Transform stats response into format ChartRenderer expects: array of {name, ...seriesValues}
  const { chartData, series } = useMemo((): { chartData: ChartDataPoint[]; series: string[] } => {
    if (!statsData?.results?.length) {
      return { chartData: [], series: [] };
    }

    // For single-question charts: datapoints become rows, metrics/audiences become series
    const result = statsData.results[0];
    if (!result) return { chartData: [], series: [] };

    const seriesNames = [metricOptions.find((m) => m.value === selectedMetric)?.label ?? selectedMetric];

    const data: ChartDataPoint[] = result.datapoints.map((dp: StatsDatapoint) => ({
      name: dp.datapoint_name,
      [seriesNames[0]]: dp.metrics[selectedMetric] ?? 0,
    }));

    // If there are multiple results (multiple questions), build multi-series
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

  // Save handler
  const handleSave = () => {
    const configPayload = {
      ...chart?.config,
      metrics: [selectedMetric],
    };

    if (isNew) {
      createChart.mutate(
        {
          name: chartName || 'Untitled Chart',
          chart_type: chartType,
          config: {
            rows: [],
            columns: [],
            metrics: [selectedMetric],
            wave_ids: [],
            location_ids: [],
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

  const isDataLoading = chartLoading || statsLoading;
  const isSaving = updateChart.isPending || createChart.isPending;

  // More actions dropdown
  const moreActions = [
    { label: 'Duplicate', value: 'duplicate' },
    { label: 'Export as PNG', value: 'export-png' },
    { label: 'Export as CSV', value: 'export-csv' },
    { label: 'Delete', value: 'delete', danger: true },
  ];

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
          <button className="icon-btn"><Download size={18} /></button>
          <button className="icon-btn"><Share2 size={18} /></button>
          <Dropdown
            trigger={<button className="icon-btn"><MoreHorizontal size={18} /></button>}
            items={moreActions}
            onSelect={(value) => {
              // Action handling placeholder
              console.log('Action selected:', value);
            }}
            align="right"
          />
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

      <div className="chart-detail-title-section">
        <input
          type="text"
          className="chart-title-input"
          value={chartName || (isNew ? '' : '')}
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
                  <span className="summary-value">{selectedAudience}</span>
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
              <select className="config-select" value={selectedAudience} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAudience(e.target.value)}>
                {audiences.map((a: string) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="config-group">
              <label>Wave</label>
              <select className="config-select" defaultValue={waveOptions[0]?.value}>
                {waveOptions.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
            <div className="config-divider" />
            <Button
              variant="primary"
              fullWidth
              loading={isSaving}
              onClick={handleSave}
            >
              {isNew ? 'Create Chart' : 'Apply Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
