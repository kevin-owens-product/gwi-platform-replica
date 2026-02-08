import { useState, useMemo } from 'react';
import { ChevronDown, Play, Plus, Trash2, Loader2, TrendingUp, DollarSign, BarChart3, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocations } from '@/hooks/useTaxonomy';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button, Input } from '@/components/shared';
import type { Location } from '@/api/types';
import './PrintRF.css';

interface Publication {
  name: string;
  type: string;
  circulation: string;
}

interface InsertionRow {
  publication: string;
  insertions: number;
  period: string;
}

interface ResultItem {
  label: string;
  value: string;
}

interface FrequencyRow {
  level: string;
  reach: string;
  reachPct: string;
  cumReach: string;
}

interface MixRecommendation {
  publication: string;
  allocPct: number;
  insertions: number;
  rationale: string;
}

const fallbackPublications: Publication[] = [
  { name: 'The Times', type: 'Daily Newspaper', circulation: '365,880' },
  { name: 'The Guardian', type: 'Daily Newspaper', circulation: '105,134' },
  { name: 'Daily Mail', type: 'Daily Newspaper', circulation: '1,134,184' },
  { name: 'The Sunday Times', type: 'Sunday Newspaper', circulation: '647,622' },
  { name: 'Financial Times', type: 'Daily Newspaper', circulation: '162,472' },
  { name: 'Vogue UK', type: 'Monthly Magazine', circulation: '186,519' },
  { name: 'GQ', type: 'Monthly Magazine', circulation: '108,234' },
  { name: 'The Economist', type: 'Weekly Magazine', circulation: '208,128' },
  { name: 'Time Out', type: 'Weekly Magazine', circulation: '305,741' },
  { name: 'Cosmopolitan', type: 'Monthly Magazine', circulation: '390,128' },
];

const audiences: string[] = [
  'Adults 16-64', 'Adults 18-34', 'Adults 25-54', 'Adults 35-64', 'All Adults 16+',
];

const fallbackMarkets: string[] = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain',
  'Italy', 'Australia', 'Japan', 'Brazil', 'Canada',
];

const periods: string[] = ['Daily', 'Weekly', 'Monthly'];

const adFormats = ['Full Page', 'Half Page', 'Quarter Page', 'Double Page Spread'] as const;
type AdFormat = typeof adFormats[number];

const adFormatMultipliers: Record<AdFormat, number> = {
  'Full Page': 1.0,
  'Half Page': 0.6,
  'Quarter Page': 0.35,
  'Double Page Spread': 1.8,
};

// Mock coverage curve data (diminishing returns)
const coverageCurveData = [
  { insertions: 1, reach: 8.2 },
  { insertions: 2, reach: 14.5 },
  { insertions: 3, reach: 19.8 },
  { insertions: 4, reach: 23.6 },
  { insertions: 5, reach: 26.4 },
  { insertions: 6, reach: 28.3 },
  { insertions: 7, reach: 29.6 },
  { insertions: 8, reach: 30.5 },
  { insertions: 9, reach: 31.1 },
  { insertions: 10, reach: 31.5 },
  { insertions: 11, reach: 31.8 },
  { insertions: 12, reach: 32.0 },
];

function buildCoveragePath(data: { insertions: number; reach: number }[], width: number, height: number, padding: number): string {
  const xScale = (v: number) => padding + ((v - 1) / 11) * (width - 2 * padding);
  const yScale = (v: number) => height - padding - (v / 40) * (height - 2 * padding);

  let path = `M ${xScale(data[0].insertions)} ${yScale(data[0].reach)}`;
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const cpx = (xScale(prev.insertions) + xScale(curr.insertions)) / 2;
    path += ` C ${cpx} ${yScale(prev.reach)}, ${cpx} ${yScale(curr.reach)}, ${xScale(curr.insertions)} ${yScale(curr.reach)}`;
  }
  return path;
}

// Mock frequency distribution data
const frequencyDistribution: FrequencyRow[] = [
  { level: '1+', reach: '12,695,400', reachPct: '30.0%', cumReach: '12,695,400' },
  { level: '2+', reach: '8,463,600', reachPct: '20.0%', cumReach: '8,463,600' },
  { level: '3+', reach: '5,509,740', reachPct: '13.0%', cumReach: '5,509,740' },
  { level: '4+', reach: '3,385,440', reachPct: '8.0%', cumReach: '3,385,440' },
  { level: '5+', reach: '2,116,000', reachPct: '5.0%', cumReach: '2,116,000' },
];

// Mock publication mix recommendations
const mockMixRecommendations: MixRecommendation[] = [
  { publication: 'Daily Mail', allocPct: 35, insertions: 4, rationale: 'Highest circulation, broad audience reach' },
  { publication: 'The Times', allocPct: 25, insertions: 3, rationale: 'Premium audience, strong AB demographic' },
  { publication: 'Cosmopolitan', allocPct: 20, insertions: 2, rationale: 'Strong female 18-34 segment coverage' },
  { publication: 'The Economist', allocPct: 20, insertions: 2, rationale: 'High-value decision-maker audience' },
];

export default function PrintRF(): React.JSX.Element {
  // API hooks
  const { data: apiLocations, isLoading: locationsLoading } = useLocations();
  const { selectedLocationIds } = useWorkspaceStore();

  // Derive market names from API locations, falling back to hardcoded list
  const marketNames = useMemo(() => {
    if (apiLocations && apiLocations.length > 0) {
      return apiLocations.map((loc: Location) => loc.name);
    }
    return fallbackMarkets;
  }, [apiLocations]);

  // Publications remain client-side (print-specific, not in taxonomy API)
  const publications = fallbackPublications;

  const [selectedPublications, setSelectedPublications] = useState<string[]>(['The Times', 'Vogue UK']);
  const [pubsOpen, setPubsOpen] = useState<boolean>(false);
  const [selectedAudience, setSelectedAudience] = useState<string>('Adults 16-64');
  const [audienceOpen, setAudienceOpen] = useState<boolean>(false);
  const [selectedMarket, setSelectedMarket] = useState<string>(
    selectedLocationIds.length > 0 ? selectedLocationIds[0] : 'United Kingdom'
  );
  const [marketOpen, setMarketOpen] = useState<boolean>(false);
  const [selectedAdFormat, setSelectedAdFormat] = useState<AdFormat>('Full Page');
  const [adFormatOpen, setAdFormatOpen] = useState<boolean>(false);
  const [insertionRows, setInsertionRows] = useState<InsertionRow[]>([
    { publication: 'The Times', insertions: 3, period: 'Weekly' },
    { publication: 'Vogue UK', insertions: 1, period: 'Monthly' },
  ]);
  const [showResults, setShowResults] = useState<boolean>(false);

  const togglePublication = (name: string): void => {
    setSelectedPublications((prev: string[]) =>
      prev.includes(name) ? prev.filter((p: string) => p !== name) : [...prev, name]
    );
  };

  const addRow = (): void => {
    setInsertionRows((prev: InsertionRow[]) => [
      ...prev,
      { publication: publications[0].name, insertions: 1, period: 'Weekly' },
    ]);
  };

  const removeRow = (idx: number): void => {
    setInsertionRows((prev: InsertionRow[]) => prev.filter((_: InsertionRow, i: number) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof InsertionRow, value: string): void => {
    setInsertionRows((prev: InsertionRow[]) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: field === 'insertions' ? Math.max(1, parseInt(value) || 1) : value };
      return next;
    });
  };

  const results: ResultItem[] = [
    { label: 'Universe', value: '42,318,000' },
    { label: 'Sample Size', value: '8,421' },
    { label: 'Reach', value: '12,695,400' },
    { label: 'Avg Frequency', value: '3.2' },
    { label: 'Reach %', value: '30.0%' },
    { label: 'OTS', value: '40,625,280' },
    { label: 'Coverage Index', value: '118' },
  ];

  // Cost efficiency calculations
  const costEfficiency = useMemo(() => {
    const formatMult = adFormatMultipliers[selectedAdFormat];
    const totalInsertions = insertionRows.reduce((sum, r) => sum + r.insertions, 0);
    const baseCostPerInsertion = 28500; // base cost
    const totalCost = totalInsertions * baseCostPerInsertion * formatMult;
    const reach = 12695400;
    const cpm = (totalCost / (reach / 1000));
    const costPerReachPoint = totalCost / 30.0;
    const roiIndex = Math.round(118 * (1 / formatMult) * (totalInsertions > 3 ? 1.1 : 1.0));

    return {
      cpm: `£${cpm.toFixed(2)}`,
      costPerReachPoint: `£${Math.round(costPerReachPoint).toLocaleString()}`,
      roiIndex,
      totalCost: `£${totalCost.toLocaleString()}`,
      costPerInsertion: `£${Math.round(baseCostPerInsertion * formatMult).toLocaleString()}`,
    };
  }, [selectedAdFormat, insertionRows]);

  const handleRunAnalysis = () => {
    setShowResults(true);
    toast.success('Analysis complete');
  };

  // SVG dimensions for coverage curve
  const svgWidth = 560;
  const svgHeight = 280;
  const svgPadding = 50;
  const coveragePath = buildCoveragePath(coverageCurveData, svgWidth, svgHeight, svgPadding);

  return (
    <div className="printrf-page">
      <div className="printrf-header">
        <h1 className="page-title">Print Reach & Frequency</h1>
        {locationsLoading && (
          <div className="printrf-loading-indicator">
            <Loader2 size={16} className="printrf-spinner" />
            <span>Loading data...</span>
          </div>
        )}
      </div>

      <div className="printrf-content">
        <div className="printrf-config">
          <div className="printrf-config-grid">
            {/* Publications */}
            <div className="printrf-field printrf-field-full">
              <label className="printrf-label">Publications</label>
              <div className="printrf-multiselect-wrapper">
                <button className="printrf-select-btn" onClick={() => setPubsOpen(!pubsOpen)}>
                  <span>{selectedPublications.length} publication{selectedPublications.length !== 1 ? 's' : ''} selected</span>
                  <ChevronDown size={16} />
                </button>
                {pubsOpen && (
                  <div className="printrf-dropdown printrf-dropdown-wide">
                    {publications.map((pub: Publication) => (
                      <label key={pub.name} className="printrf-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedPublications.includes(pub.name)}
                          onChange={() => togglePublication(pub.name)}
                        />
                        <div className="printrf-pub-info">
                          <span className="printrf-pub-name">{pub.name}</span>
                          <span className="printrf-pub-meta">{pub.type} &middot; Circ: {pub.circulation}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audience */}
            <div className="printrf-field">
              <label className="printrf-label">Audience</label>
              <div className="printrf-select-wrapper">
                <button className="printrf-select-btn" onClick={() => setAudienceOpen(!audienceOpen)}>
                  <span>{selectedAudience}</span>
                  <ChevronDown size={16} />
                </button>
                {audienceOpen && (
                  <div className="printrf-dropdown">
                    {audiences.map((a: string) => (
                      <button
                        key={a}
                        className={`printrf-dropdown-item ${a === selectedAudience ? 'selected' : ''}`}
                        onClick={() => { setSelectedAudience(a); setAudienceOpen(false); }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Market - populated from API locations */}
            <div className="printrf-field">
              <label className="printrf-label">Market</label>
              <div className="printrf-select-wrapper">
                <button className="printrf-select-btn" onClick={() => setMarketOpen(!marketOpen)}>
                  <span>{selectedMarket}</span>
                  <ChevronDown size={16} />
                </button>
                {marketOpen && (
                  <div className="printrf-dropdown">
                    {locationsLoading && (
                      <div className="printrf-dropdown-loading">
                        <Loader2 size={14} className="printrf-spinner" />
                        <span>Loading markets...</span>
                      </div>
                    )}
                    {marketNames.map((m: string) => (
                      <button
                        key={m}
                        className={`printrf-dropdown-item ${m === selectedMarket ? 'selected' : ''}`}
                        onClick={() => { setSelectedMarket(m); setMarketOpen(false); }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ad Format */}
            <div className="printrf-field">
              <label className="printrf-label">Ad Format</label>
              <div className="printrf-select-wrapper">
                <button className="printrf-select-btn" onClick={() => setAdFormatOpen(!adFormatOpen)}>
                  <span>{selectedAdFormat}</span>
                  <ChevronDown size={16} />
                </button>
                {adFormatOpen && (
                  <div className="printrf-dropdown">
                    {adFormats.map((fmt) => (
                      <button
                        key={fmt}
                        className={`printrf-dropdown-item ${fmt === selectedAdFormat ? 'selected' : ''}`}
                        onClick={() => { setSelectedAdFormat(fmt); setAdFormatOpen(false); }}
                      >
                        <div className="printrf-format-option">
                          <span>{fmt}</span>
                          <span className="printrf-format-mult">{adFormatMultipliers[fmt]}x rate</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insertion Schedule */}
          <div className="printrf-insertions">
            <h3 className="printrf-section-title">Insertion Schedule</h3>
            <table className="printrf-insertion-table">
              <thead>
                <tr>
                  <th>Publication</th>
                  <th>Insertions</th>
                  <th>Period</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {insertionRows.map((row: InsertionRow, idx: number) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="printrf-table-select"
                        value={row.publication}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRow(idx, 'publication', e.target.value)}
                      >
                        {publications.map((pub: Publication) => (
                          <option key={pub.name} value={pub.name}>{pub.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Input
                        type="number"
                        className="printrf-table-input"
                        value={row.insertions}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRow(idx, 'insertions', e.target.value)}
                        min={1}
                      />
                    </td>
                    <td>
                      <select
                        className="printrf-table-select printrf-table-select-sm"
                        value={row.period}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRow(idx, 'period', e.target.value)}
                      >
                        {periods.map((p: string) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="printrf-remove-btn"
                        onClick={() => removeRow(idx)}
                        disabled={insertionRows.length <= 1}
                        icon={<Trash2 size={14} />}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              variant="ghost"
              size="sm"
              className="printrf-add-row-btn"
              onClick={addRow}
              icon={<Plus size={14} />}
            >
              Add row
            </Button>
          </div>

          <div className="printrf-actions">
            <Button
              variant="primary"
              icon={<Play size={16} />}
              className="printrf-run-btn"
              onClick={handleRunAnalysis}
              disabled={insertionRows.length === 0}
            >
              Run Analysis
            </Button>
          </div>
        </div>

        {showResults && (
          <>
            {/* Results */}
            <div className="printrf-results">
              <h3 className="printrf-section-title">Results</h3>
              <div className="printrf-results-grid">
                {results.map((r: ResultItem) => (
                  <div key={r.label} className="printrf-result-card">
                    <div className="printrf-result-label">{r.label}</div>
                    <div className="printrf-result-value">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Curve */}
            <div className="printrf-coverage-curve">
              <h3 className="printrf-section-title">
                <TrendingUp size={18} />
                Coverage Curve
              </h3>
              <div className="printrf-chart-container">
                <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="printrf-svg-chart">
                  {/* Grid lines */}
                  {[0, 10, 20, 30, 40].map((val) => {
                    const y = svgHeight - svgPadding - (val / 40) * (svgHeight - 2 * svgPadding);
                    return (
                      <g key={val}>
                        <line x1={svgPadding} y1={y} x2={svgWidth - svgPadding} y2={y} stroke="var(--color-border-light)" strokeWidth="1" />
                        <text x={svgPadding - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--color-text-muted)">{val}%</text>
                      </g>
                    );
                  })}
                  {/* X-axis labels */}
                  {coverageCurveData.filter((_, i) => i % 2 === 0 || i === coverageCurveData.length - 1).map((d) => {
                    const x = svgPadding + ((d.insertions - 1) / 11) * (svgWidth - 2 * svgPadding);
                    return (
                      <text key={d.insertions} x={x} y={svgHeight - svgPadding + 20} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">{d.insertions}</text>
                    );
                  })}
                  {/* Axes */}
                  <line x1={svgPadding} y1={svgPadding} x2={svgPadding} y2={svgHeight - svgPadding} stroke="var(--color-border)" strokeWidth="1.5" />
                  <line x1={svgPadding} y1={svgHeight - svgPadding} x2={svgWidth - svgPadding} y2={svgHeight - svgPadding} stroke="var(--color-border)" strokeWidth="1.5" />
                  {/* Curve */}
                  <path d={coveragePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Area fill */}
                  <path
                    d={`${coveragePath} L ${svgWidth - svgPadding} ${svgHeight - svgPadding} L ${svgPadding} ${svgHeight - svgPadding} Z`}
                    fill="var(--color-primary)"
                    opacity="0.08"
                  />
                  {/* Data points */}
                  {coverageCurveData.map((d) => {
                    const cx = svgPadding + ((d.insertions - 1) / 11) * (svgWidth - 2 * svgPadding);
                    const cy = svgHeight - svgPadding - (d.reach / 40) * (svgHeight - 2 * svgPadding);
                    return (
                      <circle key={d.insertions} cx={cx} cy={cy} r="4" fill="var(--color-white)" stroke="var(--color-primary)" strokeWidth="2" />
                    );
                  })}
                  {/* Axis labels */}
                  <text x={svgWidth / 2} y={svgHeight - 5} textAnchor="middle" fontSize="12" fill="var(--color-text-secondary)" fontWeight="500">Insertions</text>
                  <text x={14} y={svgHeight / 2} textAnchor="middle" fontSize="12" fill="var(--color-text-secondary)" fontWeight="500" transform={`rotate(-90, 14, ${svgHeight / 2})`}>Reach %</text>
                </svg>
              </div>
            </div>

            {/* Cost Efficiency */}
            <div className="printrf-cost-efficiency">
              <h3 className="printrf-section-title">
                <DollarSign size={18} />
                Cost Efficiency Metrics
              </h3>
              <div className="printrf-cost-grid">
                <div className="printrf-cost-card">
                  <div className="printrf-cost-label">CPM</div>
                  <div className="printrf-cost-value">{costEfficiency.cpm}</div>
                  <div className="printrf-cost-desc">Cost per thousand</div>
                </div>
                <div className="printrf-cost-card">
                  <div className="printrf-cost-label">Cost per Reach Point</div>
                  <div className="printrf-cost-value">{costEfficiency.costPerReachPoint}</div>
                  <div className="printrf-cost-desc">Per 1% reach</div>
                </div>
                <div className="printrf-cost-card">
                  <div className="printrf-cost-label">ROI Index</div>
                  <div className="printrf-cost-value printrf-cost-value-highlight">{costEfficiency.roiIndex}</div>
                  <div className="printrf-cost-desc">vs. benchmark (100)</div>
                </div>
                <div className="printrf-cost-card">
                  <div className="printrf-cost-label">Total Campaign Cost</div>
                  <div className="printrf-cost-value">{costEfficiency.totalCost}</div>
                  <div className="printrf-cost-desc">{selectedAdFormat} format</div>
                </div>
                <div className="printrf-cost-card">
                  <div className="printrf-cost-label">Cost per Insertion</div>
                  <div className="printrf-cost-value">{costEfficiency.costPerInsertion}</div>
                  <div className="printrf-cost-desc">Average across publications</div>
                </div>
              </div>
            </div>

            {/* Frequency Distribution */}
            <div className="printrf-freq-dist">
              <h3 className="printrf-section-title">
                <BarChart3 size={18} />
                Frequency Distribution
              </h3>
              <div className="printrf-freq-table-wrapper">
                <table className="printrf-freq-table">
                  <thead>
                    <tr>
                      <th>Frequency Level</th>
                      <th>Reach</th>
                      <th>Reach %</th>
                      <th>Cumulative Reach</th>
                      <th>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {frequencyDistribution.map((row: FrequencyRow) => {
                      const pct = parseFloat(row.reachPct);
                      return (
                        <tr key={row.level}>
                          <td className="printrf-freq-level">{row.level}</td>
                          <td>{row.reach}</td>
                          <td>{row.reachPct}</td>
                          <td>{row.cumReach}</td>
                          <td>
                            <div className="printrf-freq-bar-wrapper">
                              <div className="printrf-freq-bar" style={{ width: `${(pct / 30) * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Publication Mix Optimizer */}
            <div className="printrf-mix-optimizer">
              <h3 className="printrf-section-title">
                <Lightbulb size={18} />
                Publication Mix Optimizer
              </h3>
              <p className="printrf-mix-description">
                Recommended optimal publication mix based on your target audience and budget allocation.
              </p>
              <div className="printrf-mix-cards">
                {mockMixRecommendations.map((rec: MixRecommendation) => (
                  <div key={rec.publication} className="printrf-mix-card">
                    <div className="printrf-mix-card-header">
                      <span className="printrf-mix-pub-name">{rec.publication}</span>
                      <span className="printrf-mix-alloc">{rec.allocPct}%</span>
                    </div>
                    <div className="printrf-mix-bar-wrapper">
                      <div className="printrf-mix-bar" style={{ width: `${rec.allocPct}%` }} />
                    </div>
                    <div className="printrf-mix-details">
                      <span className="printrf-mix-insertions">{rec.insertions} insertions recommended</span>
                      <span className="printrf-mix-rationale">{rec.rationale}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
