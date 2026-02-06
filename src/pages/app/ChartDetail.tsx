import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, MoreHorizontal, ChevronDown } from 'lucide-react';
import './ChartDetail.css';

type ChartType = 'bar' | 'pie' | 'line';

interface ChartInfo {
  name: string;
  type: ChartType;
  updated: string;
  dataset: string;
}

interface BarDataGroup {
  label: string;
  values: number[];
}

interface PieDataSlice {
  label: string;
  value: number;
  color: string;
}

interface LineDataPoint {
  label: string;
  values: number[];
}

interface PieSlice extends PieDataSlice {
  path: string;
}

interface ChartLegendProps {
  type: ChartType;
}

interface DataTableProps {
  type: ChartType;
}

const chartData: Record<string, ChartInfo> = {
  1: { name: 'Social Media Usage by Age', type: 'bar', updated: '2 hours ago', dataset: 'GWI Core' },
  2: { name: 'Device Preferences Q4 2024', type: 'pie', updated: '1 day ago', dataset: 'GWI Core' },
  3: { name: 'Brand Awareness Trends', type: 'line', updated: '3 days ago', dataset: 'GWI Zeitgeist' },
  new: { name: 'Untitled Chart', type: 'bar', updated: 'Just now', dataset: 'GWI Core' },
};

const barData: BarDataGroup[] = [
  { label: '18-24', values: [78, 65, 45, 42] },
  { label: '25-34', values: [72, 52, 62, 48] },
  { label: '35-44', values: [58, 35, 68, 44] },
  { label: '45-54', values: [42, 18, 72, 38] },
  { label: '55-64', values: [28, 8, 75, 32] },
];
const barSeries: string[] = ['Instagram', 'TikTok', 'Facebook', 'Twitter/X'];
const barColors: string[] = ['#E31C79', '#0ea5e9', '#22c55e', '#8b5cf6'];

const pieData: PieDataSlice[] = [
  { label: 'Smartphone', value: 42, color: '#E31C79' },
  { label: 'Laptop', value: 28, color: '#0ea5e9' },
  { label: 'Tablet', value: 15, color: '#22c55e' },
  { label: 'Desktop', value: 10, color: '#8b5cf6' },
  { label: 'Smart TV', value: 5, color: '#f59e0b' },
];

const lineData: LineDataPoint[] = [
  { label: 'Q1 23', values: [45, 38, 52] },
  { label: 'Q2 23', values: [48, 40, 50] },
  { label: 'Q3 23', values: [52, 42, 48] },
  { label: 'Q4 23', values: [55, 45, 46] },
  { label: 'Q1 24', values: [58, 48, 45] },
  { label: 'Q2 24', values: [62, 52, 44] },
  { label: 'Q3 24', values: [65, 55, 43] },
  { label: 'Q4 24', values: [68, 58, 42] },
];
const lineSeries: string[] = ['Brand A', 'Brand B', 'Brand C'];
const lineColors: string[] = ['#E31C79', '#0ea5e9', '#22c55e'];

const audiences: string[] = ['All Adults 16+', 'Adults 18-34', 'Adults 25-54', 'Gen Z', 'Millennials'];
const dataSources: string[] = ['GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Work'];

function BarChart(): React.JSX.Element {
  const maxVal = 80;
  const chartW = 600, chartH = 300, padL = 40, padB = 40, padT = 20, padR = 20;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const groupW = plotW / barData.length;
  const barW = (groupW - 12) / barSeries.length;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="chart-svg">
      {[0, 20, 40, 60, 80].map((v: number) => {
        const y = padT + plotH - (v / maxVal) * plotH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{v}%</text>
          </g>
        );
      })}
      {barData.map((group: BarDataGroup, gi: number) => {
        const gx = padL + gi * groupW + 6;
        return (
          <g key={gi}>
            <text x={gx + (groupW - 12) / 2} y={chartH - 10} textAnchor="middle" fontSize="11" fill="#6b7280">{group.label}</text>
            {group.values.map((val: number, si: number) => {
              const h = (val / maxVal) * plotH;
              return (
                <rect key={si} x={gx + si * barW} y={padT + plotH - h} width={barW - 2} height={h} rx="3" fill={barColors[si]} opacity="0.85">
                  <title>{barSeries[si]}: {val}%</title>
                </rect>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function PieChartViz(): React.JSX.Element {
  const total: number = pieData.reduce((s: number, d: PieDataSlice) => s + d.value, 0);
  const cx = 150, cy = 150, r = 120, ir = 65;
  let cumAngle = -90;
  const slices: PieSlice[] = pieData.map((d: PieDataSlice) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1o = cx + r * Math.cos(startRad), y1o = cy + r * Math.sin(startRad);
    const x2o = cx + r * Math.cos(endRad), y2o = cy + r * Math.sin(endRad);
    const x1i = cx + ir * Math.cos(endRad), y1i = cy + ir * Math.sin(endRad);
    const x2i = cx + ir * Math.cos(startRad), y2i = cy + ir * Math.sin(startRad);
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${x1o} ${y1o} A ${r} ${r} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${ir} ${ir} 0 ${largeArc} 0 ${x2i} ${y2i} Z`;
    return { ...d, path };
  });

  return (
    <div className="pie-chart-container">
      <svg viewBox="0 0 300 300" className="chart-svg chart-svg-pie">
        {slices.map((s: PieSlice, i: number) => (
          <path key={i} d={s.path} fill={s.color} opacity="0.85">
            <title>{s.label}: {s.value}%</title>
          </path>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#191530">100%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#9ca3af">Total</text>
      </svg>
      <div className="pie-legend">
        {pieData.map((d: PieDataSlice, i: number) => (
          <div key={i} className="pie-legend-item">
            <span className="pie-legend-dot" style={{ backgroundColor: d.color }} />
            <span className="pie-legend-label">{d.label}</span>
            <span className="pie-legend-value">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChartViz(): React.JSX.Element {
  const maxVal = 80;
  const chartW = 600, chartH = 300, padL = 40, padB = 40, padT = 20, padR = 20;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const getX = (i: number): number => padL + (i / (lineData.length - 1)) * plotW;
  const getY = (v: number): number => padT + plotH - (v / maxVal) * plotH;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="chart-svg">
      {[0, 20, 40, 60, 80].map((v: number) => {
        const y = getY(v);
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{v}%</text>
          </g>
        );
      })}
      {lineData.map((d: LineDataPoint, i: number) => (
        <text key={i} x={getX(i)} y={chartH - 10} textAnchor="middle" fontSize="10" fill="#6b7280">{d.label}</text>
      ))}
      {lineSeries.map((_: string, si: number) => {
        const points = lineData.map((d: LineDataPoint, i: number) => `${getX(i)},${getY(d.values[si])}`).join(' ');
        return (
          <polyline key={si} points={points} fill="none" stroke={lineColors[si]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      })}
      {lineSeries.map((_: string, si: number) =>
        lineData.map((d: LineDataPoint, i: number) => (
          <circle key={`${si}-${i}`} cx={getX(i)} cy={getY(d.values[si])} r="3.5" fill={lineColors[si]} stroke="white" strokeWidth="2">
            <title>{lineSeries[si]}: {d.values[si]}%</title>
          </circle>
        ))
      )}
    </svg>
  );
}

const chartComponents: Record<ChartType, () => React.JSX.Element> = { bar: BarChart, pie: PieChartViz, line: LineChartViz };

function ChartLegend({ type }: ChartLegendProps): React.JSX.Element | null {
  if (type === 'bar') {
    return (
      <div className="chart-legend">
        {barSeries.map((s: string, i: number) => (
          <div key={i} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ backgroundColor: barColors[i] }} />
            <span>{s}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'line') {
    return (
      <div className="chart-legend">
        {lineSeries.map((s: string, i: number) => (
          <div key={i} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ backgroundColor: lineColors[i] }} />
            <span>{s}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function DataTable({ type }: DataTableProps): React.JSX.Element {
  if (type === 'bar') {
    return (
      <table className="chart-data-table">
        <thead>
          <tr>
            <th>Age Group</th>
            {barSeries.map((s: string) => <th key={s}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {barData.map((row: BarDataGroup) => (
            <tr key={row.label}>
              <td className="row-label">{row.label}</td>
              {row.values.map((v: number, i: number) => <td key={i}>{v}%</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (type === 'pie') {
    return (
      <table className="chart-data-table">
        <thead>
          <tr><th>Device</th><th>Share</th></tr>
        </thead>
        <tbody>
          {pieData.map((d: PieDataSlice) => (
            <tr key={d.label}><td className="row-label">{d.label}</td><td>{d.value}%</td></tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <table className="chart-data-table">
      <thead>
        <tr>
          <th>Quarter</th>
          {lineSeries.map((s: string) => <th key={s}>{s}</th>)}
        </tr>
      </thead>
      <tbody>
        {lineData.map((row: LineDataPoint) => (
          <tr key={row.label}>
            <td className="row-label">{row.label}</td>
            {row.values.map((v: number, i: number) => <td key={i}>{v}%</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ChartDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const chart: ChartInfo = chartData[id ?? 'new'] || chartData['new'];
  const [chartType, setChartType] = useState<ChartType>(chart.type);
  const [activeView, setActiveView] = useState<'chart' | 'table' | 'summary'>('chart');
  const [selectedAudience, setSelectedAudience] = useState<string>('All Adults 16+');
  const [selectedSource, setSelectedSource] = useState<string>(chart.dataset);
  const [chartName, setChartName] = useState<string>(chart.name);

  const ChartComponent = chartComponents[chartType] || BarChart;

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
          <button className="icon-btn"><MoreHorizontal size={18} /></button>
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
        <p className="chart-subtitle">Last updated {chart.updated}</p>
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
                <ChartComponent />
                <ChartLegend type={chartType} />
              </>
            )}
            {activeView === 'table' && (
              <div className="chart-table-wrapper">
                <DataTable type={chartType} />
              </div>
            )}
            {activeView === 'summary' && (
              <div className="chart-summary">
                <div className="summary-stat">
                  <span className="summary-label">Sample Size</span>
                  <span className="summary-value">743,219</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Universe</span>
                  <span className="summary-value">1,245,890,000</span>
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
                  <span className="summary-label">Wave</span>
                  <span className="summary-value">Q4 2024</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Markets</span>
                  <span className="summary-value">48 countries</span>
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
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie / Donut</option>
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
              <select className="config-select" defaultValue="Q4 2024">
                <option>Q4 2024</option>
                <option>Q3 2024</option>
                <option>Q2 2024</option>
                <option>Q1 2024</option>
              </select>
            </div>
            <div className="config-group">
              <label>Display</label>
              <select className="config-select" defaultValue="percentage">
                <option value="percentage">Percentage</option>
                <option value="index">Index</option>
                <option value="count">Sample Count</option>
              </select>
            </div>
            <div className="config-divider" />
            <button className="config-apply-btn">Apply Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
