import { useState, useMemo } from 'react';
import { ChevronDown, Play, X, Loader2, Save, Trash2, DollarSign, TrendingUp, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWaves, useLocations } from '@/hooks/useTaxonomy';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button, Input } from '@/components/shared';
import type { Wave, Location } from '@/api/types';
import './TvStudy.css';

interface Daypart {
  name: string;
  time: string;
}

interface DaypartSlot {
  weekday: number;
  weekend: number;
}

interface ResultItem {
  label: string;
  value: string;
}

interface Scenario {
  id: number;
  name: string;
  channels: string[];
  audience: string;
  country: string;
  effectiveFreq: number;
  results: ResultItem[];
  budget: { cpm: number; totalCost: string; impressions: string };
}

// Fallback data for when API is unavailable
const fallbackChannels: string[] = [
  'BBC One', 'BBC Two', 'ITV', 'Channel 4', 'Channel 5',
  'Sky One', 'Sky Sports', 'Sky News', 'Dave', 'E4',
];

const fallbackAudiences: string[] = [
  'Adults 16-64', 'Adults 18-34', 'Adults 25-54', 'Adults 35-64', 'All Adults 16+',
];

const fallbackCountries: string[] = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain',
  'Italy', 'Netherlands', 'Belgium', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Austria',
  'Switzerland', 'Ireland', 'Portugal', 'Greece', 'Romania',
  'Hungary', 'Turkey', 'Russia', 'Ukraine', 'Brazil',
  'Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru',
  'Japan', 'South Korea', 'China', 'India', 'Australia',
  'New Zealand', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines',
  'Malaysia', 'Singapore', 'Saudi Arabia', 'UAE', 'Egypt',
  'South Africa', 'Nigeria', 'Kenya',
];

const generateFallbackWaves = (): string[] => {
  const waves: string[] = [];
  for (let y = 2025; y >= 2017; y--) {
    for (let q = 4; q >= 1; q--) {
      waves.push(`Q${q} ${y}`);
    }
  }
  return waves;
};
const fallbackWaveNames: string[] = generateFallbackWaves();

const dayparts: Daypart[] = [
  { name: 'Early Morning', time: '06:00 - 09:00' },
  { name: 'Daytime', time: '09:00 - 12:00' },
  { name: 'Afternoon', time: '12:00 - 15:00' },
  { name: 'Early Peak', time: '15:00 - 18:00' },
  { name: 'Peak', time: '18:00 - 21:00' },
  { name: 'Late Peak', time: '21:00 - 00:00' },
  { name: 'Nighttime', time: '00:00 - 06:00' },
];

// Mock reach curve data points (S-curve shape)
const reachCurveData = [
  { freq: 1, reach: 12 },
  { freq: 2, reach: 28 },
  { freq: 3, reach: 42 },
  { freq: 4, reach: 53 },
  { freq: 5, reach: 60 },
  { freq: 6, reach: 64 },
  { freq: 7, reach: 67 },
  { freq: 8, reach: 69 },
  { freq: 9, reach: 70.5 },
  { freq: 10, reach: 71.5 },
  { freq: 11, reach: 72 },
  { freq: 12, reach: 72.3 },
];

function buildReachCurvePath(data: { freq: number; reach: number }[], width: number, height: number, padding: number): string {
  const xScale = (v: number) => padding + ((v - 1) / 11) * (width - 2 * padding);
  const yScale = (v: number) => height - padding - (v / 80) * (height - 2 * padding);

  let path = `M ${xScale(data[0].freq)} ${yScale(data[0].reach)}`;
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const cpx = (xScale(prev.freq) + xScale(curr.freq)) / 2;
    path += ` C ${cpx} ${yScale(prev.reach)}, ${cpx} ${yScale(curr.reach)}, ${xScale(curr.freq)} ${yScale(curr.reach)}`;
  }
  return path;
}

export default function TvStudy(): React.JSX.Element {
  // API hooks
  const { data: apiWaves, isLoading: wavesLoading } = useWaves();
  const { data: apiLocations, isLoading: locationsLoading } = useLocations();
  const { selectedLocationIds } = useWorkspaceStore();

  // Derive wave names from API data, falling back to hardcoded list
  const waveNames = useMemo(() => {
    if (apiWaves && apiWaves.length > 0) {
      return apiWaves.map((w: Wave) => w.name);
    }
    return fallbackWaveNames;
  }, [apiWaves]);

  // Derive country names from API data, falling back to hardcoded list
  const countryNames = useMemo(() => {
    if (apiLocations && apiLocations.length > 0) {
      return apiLocations.map((loc: Location) => loc.name);
    }
    return fallbackCountries;
  }, [apiLocations]);

  // Channels remain client-side (TV-specific, not in taxonomy API)
  const channels = fallbackChannels;
  const audiences = fallbackAudiences;

  const [selectedChannels, setSelectedChannels] = useState<string[]>(['BBC One', 'ITV']);
  const [channelsOpen, setChannelsOpen] = useState<boolean>(false);
  const [selectedAudience, setSelectedAudience] = useState<string>('Adults 16-64');
  const [audienceOpen, setAudienceOpen] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    selectedLocationIds.length > 0 ? selectedLocationIds[0] : 'United Kingdom'
  );
  const [countryOpen, setCountryOpen] = useState<boolean>(false);
  const [timezone, setTimezone] = useState<string>('local');
  const [selectedWaves, setSelectedWaves] = useState<string[]>(() => {
    // Default to first 4 waves from the list
    return waveNames.slice(0, 4);
  });
  const [wavesOpen, setWavesOpen] = useState<boolean>(false);
  const [daypartSlots, setDaypartSlots] = useState<DaypartSlot[]>(
    dayparts.map(() => ({ weekday: 1, weekend: 1 }))
  );
  const [showResults, setShowResults] = useState<boolean>(false);
  const [effectiveFrequency, setEffectiveFrequency] = useState<number>(3);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const toggleChannel = (ch: string): void => {
    setSelectedChannels((prev: string[]) =>
      prev.includes(ch) ? prev.filter((c: string) => c !== ch) : [...prev, ch]
    );
  };

  const toggleWave = (w: string): void => {
    setSelectedWaves((prev: string[]) =>
      prev.includes(w) ? prev.filter((x: string) => x !== w) : [...prev, w]
    );
  };

  const updateSlot = (idx: number, field: keyof DaypartSlot, value: string): void => {
    setDaypartSlots((prev: DaypartSlot[]) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: Math.max(0, parseInt(value) || 0) };
      return next;
    });
  };

  // Generate results that adjust slightly based on effective frequency
  const getResults = (effFreq: number): ResultItem[] => {
    const baseReachPct = 65.3;
    const adjustedReachPct = Math.max(20, baseReachPct - (effFreq - 1) * 5.2);
    const universe = 52431000;
    const adjustedReach = Math.round(universe * (adjustedReachPct / 100));
    return [
      { label: 'Universe', value: '52,431,000' },
      { label: 'Sample Size', value: '12,847' },
      { label: `Reach (${effFreq}+)`, value: adjustedReach.toLocaleString() },
      { label: 'Avg Frequency', value: (4.7 + (effFreq - 3) * 0.3).toFixed(1) },
      { label: 'Impacts', value: '160,829,300' },
      { label: `Reach % (${effFreq}+)`, value: `${adjustedReachPct.toFixed(1)}%` },
      { label: 'GRP', value: '306.8' },
    ];
  };

  const results = getResults(effectiveFrequency);

  // Budget estimator mock calculations
  const budgetEstimate = useMemo(() => {
    const totalSlots = daypartSlots.reduce((sum, dp) => sum + dp.weekday * 5 + dp.weekend * 2, 0);
    const baseCpm = selectedCountry === 'United Kingdom' ? 12.50 : selectedCountry === 'United States' ? 18.75 : 9.80;
    const channelMultiplier = 1 + (selectedChannels.length - 1) * 0.15;
    const cpm = baseCpm * channelMultiplier;
    const impressions = 160829300;
    const totalCost = (impressions / 1000) * cpm * (totalSlots / 14);
    return {
      cpm: Math.round(cpm * 100) / 100,
      totalCost: `£${(totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      impressions: (impressions * totalSlots / 14).toLocaleString(undefined, { maximumFractionDigits: 0 }),
      costPerReachPoint: `£${Math.round(totalCost / 65.3).toLocaleString()}`,
      totalSlots,
    };
  }, [daypartSlots, selectedChannels, selectedCountry]);

  const saveScenario = () => {
    if (scenarios.length >= 3) {
      toast.error('Maximum 3 scenarios allowed. Remove one to add another.');
      return;
    }
    const newScenario: Scenario = {
      id: Date.now(),
      name: `Scenario ${scenarios.length + 1}`,
      channels: [...selectedChannels],
      audience: selectedAudience,
      country: selectedCountry,
      effectiveFreq: effectiveFrequency,
      results: getResults(effectiveFrequency),
      budget: {
        cpm: budgetEstimate.cpm,
        totalCost: budgetEstimate.totalCost,
        impressions: budgetEstimate.impressions,
      },
    };
    setScenarios((prev) => [...prev, newScenario]);
    toast.success(`Scenario ${scenarios.length + 1} saved`);
  };

  const removeScenario = (id: number) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    toast.success('Scenario removed');
  };

  const isDataLoading = wavesLoading || locationsLoading;

  // SVG dimensions for reach curve
  const svgWidth = 560;
  const svgHeight = 300;
  const svgPadding = 50;
  const curvePath = buildReachCurvePath(reachCurveData, svgWidth, svgHeight, svgPadding);

  return (
    <div className="tv-study-page">
      <div className="tv-study-header">
        <h1 className="page-title">TV Reach & Frequency</h1>
        {isDataLoading && (
          <div className="tv-study-loading-indicator">
            <Loader2 size={16} className="tv-study-spinner" />
            <span>Loading data...</span>
          </div>
        )}
      </div>

      <div className="tv-study-content">
        <div className="tv-study-config">
          <div className="tv-study-config-grid">
            {/* Channels */}
            <div className="tv-study-field">
              <label className="tv-study-label">Channels</label>
              <div className="tv-study-multiselect-wrapper">
                <button className="tv-study-select-btn" onClick={() => setChannelsOpen(!channelsOpen)}>
                  <span>{selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected</span>
                  <ChevronDown size={16} />
                </button>
                {channelsOpen && (
                  <div className="tv-study-dropdown">
                    {channels.map((ch: string) => (
                      <label key={ch} className="tv-study-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(ch)}
                          onChange={() => toggleChannel(ch)}
                        />
                        <span>{ch}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="tv-study-tags">
                {selectedChannels.map((ch: string) => (
                  <span key={ch} className="tv-study-tag">
                    {ch}
                    <button className="tv-study-tag-remove" onClick={() => toggleChannel(ch)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="tv-study-field">
              <label className="tv-study-label">Audience</label>
              <div className="tv-study-select-wrapper">
                <button className="tv-study-select-btn" onClick={() => setAudienceOpen(!audienceOpen)}>
                  <span>{selectedAudience}</span>
                  <ChevronDown size={16} />
                </button>
                {audienceOpen && (
                  <div className="tv-study-dropdown">
                    {audiences.map((a: string) => (
                      <button
                        key={a}
                        className={`tv-study-dropdown-item ${a === selectedAudience ? 'selected' : ''}`}
                        onClick={() => { setSelectedAudience(a); setAudienceOpen(false); }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location - populated from API */}
            <div className="tv-study-field">
              <label className="tv-study-label">Location</label>
              <div className="tv-study-select-wrapper">
                <button className="tv-study-select-btn" onClick={() => setCountryOpen(!countryOpen)}>
                  <span>{selectedCountry}</span>
                  <ChevronDown size={16} />
                </button>
                {countryOpen && (
                  <div className="tv-study-dropdown tv-study-dropdown-tall">
                    {locationsLoading && (
                      <div className="tv-study-dropdown-loading">
                        <Loader2 size={14} className="tv-study-spinner" />
                        <span>Loading locations...</span>
                      </div>
                    )}
                    {countryNames.map((c: string) => (
                      <button
                        key={c}
                        className={`tv-study-dropdown-item ${c === selectedCountry ? 'selected' : ''}`}
                        onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div className="tv-study-field">
              <label className="tv-study-label">Timezone</label>
              <div className="tv-study-toggle">
                <Button
                  variant={timezone === 'local' ? 'primary' : 'ghost'}
                  size="sm"
                  className={`tv-study-toggle-btn ${timezone === 'local' ? 'active' : ''}`}
                  onClick={() => setTimezone('local')}
                >
                  Local
                </Button>
                <Button
                  variant={timezone === 'standardized' ? 'primary' : 'ghost'}
                  size="sm"
                  className={`tv-study-toggle-btn ${timezone === 'standardized' ? 'active' : ''}`}
                  onClick={() => setTimezone('standardized')}
                >
                  Standardized
                </Button>
              </div>
            </div>

            {/* Effective Frequency */}
            <div className="tv-study-field">
              <label className="tv-study-label">Effective Frequency</label>
              <div className="tv-study-eff-freq-wrapper">
                <Input
                  type="number"
                  className="tv-study-eff-freq-input"
                  value={effectiveFrequency}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEffectiveFrequency(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
                  }
                  min={1}
                  max={10}
                />
                <span className="tv-study-eff-freq-suffix">+</span>
              </div>
              <span className="tv-study-label-hint">Minimum exposures for effective reach (1-10)</span>
            </div>

            {/* Waves - populated from API */}
            <div className="tv-study-field tv-study-field-full">
              <label className="tv-study-label">
                Waves
                <span className="tv-study-label-hint">(min 4 required)</span>
              </label>
              <div className="tv-study-multiselect-wrapper">
                <button className="tv-study-select-btn" onClick={() => setWavesOpen(!wavesOpen)}>
                  <span>{selectedWaves.length} wave{selectedWaves.length !== 1 ? 's' : ''} selected</span>
                  <ChevronDown size={16} />
                </button>
                {wavesOpen && (
                  <div className="tv-study-dropdown tv-study-dropdown-tall">
                    {wavesLoading && (
                      <div className="tv-study-dropdown-loading">
                        <Loader2 size={14} className="tv-study-spinner" />
                        <span>Loading waves...</span>
                      </div>
                    )}
                    {waveNames.map((w: string) => (
                      <label key={w} className="tv-study-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedWaves.includes(w)}
                          onChange={() => toggleWave(w)}
                        />
                        <span>{w}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="tv-study-tags">
                {selectedWaves.map((w: string) => (
                  <span key={w} className="tv-study-tag">
                    {w}
                    <button className="tv-study-tag-remove" onClick={() => toggleWave(w)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Daypart Schedule */}
          <div className="tv-study-dayparts">
            <h3 className="tv-study-section-title">Daypart Schedule</h3>
            <table className="tv-study-daypart-table">
              <thead>
                <tr>
                  <th>Daypart</th>
                  <th>Time</th>
                  <th>Weekday Slots</th>
                  <th>Weekend Slots</th>
                </tr>
              </thead>
              <tbody>
                {dayparts.map((dp: Daypart, idx: number) => (
                  <tr key={dp.name}>
                    <td className="tv-study-dp-name">{dp.name}</td>
                    <td className="tv-study-dp-time">{dp.time}</td>
                    <td>
                      <Input
                        type="number"
                        className="tv-study-slot-input"
                        value={daypartSlots[idx].weekday}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlot(idx, 'weekday', e.target.value)}
                        min={0}
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        className="tv-study-slot-input"
                        value={daypartSlots[idx].weekend}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlot(idx, 'weekend', e.target.value)}
                        min={0}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tv-study-actions">
            <Button
              variant="primary"
              icon={<Play size={16} />}
              className="tv-study-run-btn"
              onClick={() => setShowResults(true)}
              disabled={selectedWaves.length < 4 || selectedChannels.length === 0}
            >
              Run Study
            </Button>
          </div>
        </div>

        {showResults && (
          <>
            {/* Results */}
            <div className="tv-study-results">
              <div className="tv-study-results-header">
                <h3 className="tv-study-section-title">Results</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Save size={14} />}
                  onClick={saveScenario}
                  disabled={scenarios.length >= 3}
                >
                  Save as Scenario ({scenarios.length}/3)
                </Button>
              </div>
              <div className="tv-study-results-grid">
                {results.map((r: ResultItem) => (
                  <div key={r.label} className="tv-study-result-card">
                    <div className="tv-study-result-label">{r.label}</div>
                    <div className="tv-study-result-value">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reach Curve */}
            <div className="tv-study-reach-curve">
              <h3 className="tv-study-section-title">
                <TrendingUp size={18} />
                Reach Curve
              </h3>
              <div className="tv-study-chart-container">
                <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="tv-study-svg-chart">
                  {/* Grid lines */}
                  {[0, 20, 40, 60, 80].map((val) => {
                    const y = svgHeight - svgPadding - (val / 80) * (svgHeight - 2 * svgPadding);
                    return (
                      <g key={val}>
                        <line x1={svgPadding} y1={y} x2={svgWidth - svgPadding} y2={y} stroke="var(--color-border-light)" strokeWidth="1" />
                        <text x={svgPadding - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--color-text-muted)">{val}%</text>
                      </g>
                    );
                  })}
                  {/* X-axis labels */}
                  {reachCurveData.filter((_, i) => i % 2 === 0 || i === reachCurveData.length - 1).map((d) => {
                    const x = svgPadding + ((d.freq - 1) / 11) * (svgWidth - 2 * svgPadding);
                    return (
                      <text key={d.freq} x={x} y={svgHeight - svgPadding + 20} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">{d.freq}x</text>
                    );
                  })}
                  {/* Axes */}
                  <line x1={svgPadding} y1={svgPadding} x2={svgPadding} y2={svgHeight - svgPadding} stroke="var(--color-border)" strokeWidth="1.5" />
                  <line x1={svgPadding} y1={svgHeight - svgPadding} x2={svgWidth - svgPadding} y2={svgHeight - svgPadding} stroke="var(--color-border)" strokeWidth="1.5" />
                  {/* Curve */}
                  <path d={curvePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Area fill */}
                  <path
                    d={`${curvePath} L ${svgWidth - svgPadding} ${svgHeight - svgPadding} L ${svgPadding} ${svgHeight - svgPadding} Z`}
                    fill="var(--color-primary)"
                    opacity="0.08"
                  />
                  {/* Data points */}
                  {reachCurveData.map((d) => {
                    const cx = svgPadding + ((d.freq - 1) / 11) * (svgWidth - 2 * svgPadding);
                    const cy = svgHeight - svgPadding - (d.reach / 80) * (svgHeight - 2 * svgPadding);
                    return (
                      <circle key={d.freq} cx={cx} cy={cy} r="4" fill="var(--color-white)" stroke="var(--color-primary)" strokeWidth="2" />
                    );
                  })}
                  {/* Effective frequency line */}
                  {(() => {
                    const efX = svgPadding + ((effectiveFrequency - 1) / 11) * (svgWidth - 2 * svgPadding);
                    return (
                      <g>
                        <line x1={efX} y1={svgPadding} x2={efX} y2={svgHeight - svgPadding} stroke="var(--color-error)" strokeWidth="1.5" strokeDasharray="6 3" />
                        <text x={efX} y={svgPadding - 8} textAnchor="middle" fontSize="11" fill="var(--color-error)" fontWeight="600">Eff. Freq {effectiveFrequency}+</text>
                      </g>
                    );
                  })()}
                  {/* Axis labels */}
                  <text x={svgWidth / 2} y={svgHeight - 5} textAnchor="middle" fontSize="12" fill="var(--color-text-secondary)" fontWeight="500">Frequency</text>
                  <text x={14} y={svgHeight / 2} textAnchor="middle" fontSize="12" fill="var(--color-text-secondary)" fontWeight="500" transform={`rotate(-90, 14, ${svgHeight / 2})`}>Reach %</text>
                </svg>
              </div>
            </div>

            {/* Budget Estimator */}
            <div className="tv-study-budget">
              <h3 className="tv-study-section-title">
                <DollarSign size={18} />
                Budget Estimator
              </h3>
              <div className="tv-study-budget-grid">
                <div className="tv-study-budget-card">
                  <div className="tv-study-budget-label">Estimated CPM</div>
                  <div className="tv-study-budget-value">&pound;{budgetEstimate.cpm.toFixed(2)}</div>
                </div>
                <div className="tv-study-budget-card">
                  <div className="tv-study-budget-label">Total Estimated Cost</div>
                  <div className="tv-study-budget-value tv-study-budget-value-primary">{budgetEstimate.totalCost}</div>
                </div>
                <div className="tv-study-budget-card">
                  <div className="tv-study-budget-label">Estimated Impressions</div>
                  <div className="tv-study-budget-value">{budgetEstimate.impressions}</div>
                </div>
                <div className="tv-study-budget-card">
                  <div className="tv-study-budget-label">Cost per Reach Point</div>
                  <div className="tv-study-budget-value">{budgetEstimate.costPerReachPoint}</div>
                </div>
                <div className="tv-study-budget-card">
                  <div className="tv-study-budget-label">Total Weekly Slots</div>
                  <div className="tv-study-budget-value">{budgetEstimate.totalSlots}</div>
                </div>
              </div>
              <p className="tv-study-budget-disclaimer">Estimates based on average market rates. Actual costs may vary by broadcaster and booking terms.</p>
            </div>

            {/* Campaign Summary */}
            <div className="tv-study-campaign-summary">
              <h3 className="tv-study-section-title">
                <FileText size={18} />
                Campaign Summary
              </h3>
              <div className="tv-study-summary-card">
                <div className="tv-study-summary-row">
                  <span className="tv-study-summary-label">Market</span>
                  <span className="tv-study-summary-value">{selectedCountry}</span>
                </div>
                <div className="tv-study-summary-row">
                  <span className="tv-study-summary-label">Target Audience</span>
                  <span className="tv-study-summary-value">{selectedAudience}</span>
                </div>
                <div className="tv-study-summary-row">
                  <span className="tv-study-summary-label">Channels</span>
                  <span className="tv-study-summary-value">{selectedChannels.join(', ')}</span>
                </div>
                <div className="tv-study-summary-row">
                  <span className="tv-study-summary-label">Waves</span>
                  <span className="tv-study-summary-value">{selectedWaves.length} waves ({selectedWaves[0]} - {selectedWaves[selectedWaves.length - 1]})</span>
                </div>
                <div className="tv-study-summary-row">
                  <span className="tv-study-summary-label">Effective Frequency</span>
                  <span className="tv-study-summary-value">{effectiveFrequency}+</span>
                </div>
                <div className="tv-study-summary-row">
                  <span className="tv-study-summary-label">Timezone</span>
                  <span className="tv-study-summary-value">{timezone === 'local' ? 'Local' : 'Standardized'}</span>
                </div>
                <div className="tv-study-summary-divider" />
                <div className="tv-study-summary-row tv-study-summary-row-highlight">
                  <span className="tv-study-summary-label">Projected Reach</span>
                  <span className="tv-study-summary-value">{results.find((r) => r.label.startsWith('Reach %'))?.value}</span>
                </div>
                <div className="tv-study-summary-row tv-study-summary-row-highlight">
                  <span className="tv-study-summary-label">Estimated Budget</span>
                  <span className="tv-study-summary-value">{budgetEstimate.totalCost}</span>
                </div>
              </div>
            </div>

            {/* Scenario Comparison */}
            {scenarios.length > 0 && (
              <div className="tv-study-scenarios">
                <h3 className="tv-study-section-title">Scenario Comparison</h3>
                <div className="tv-study-scenario-table-wrapper">
                  <table className="tv-study-scenario-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        {scenarios.map((s) => (
                          <th key={s.id}>
                            <div className="tv-study-scenario-th">
                              <span>{s.name}</span>
                              <button className="tv-study-scenario-remove" onClick={() => removeScenario(s.id)} title="Remove scenario">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="tv-study-scenario-metric">Channels</td>
                        {scenarios.map((s) => (
                          <td key={s.id}>{s.channels.join(', ')}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="tv-study-scenario-metric">Audience</td>
                        {scenarios.map((s) => (
                          <td key={s.id}>{s.audience}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="tv-study-scenario-metric">Market</td>
                        {scenarios.map((s) => (
                          <td key={s.id}>{s.country}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="tv-study-scenario-metric">Eff. Frequency</td>
                        {scenarios.map((s) => (
                          <td key={s.id}>{s.effectiveFreq}+</td>
                        ))}
                      </tr>
                      {results.map((r) => (
                        <tr key={r.label}>
                          <td className="tv-study-scenario-metric">{r.label}</td>
                          {scenarios.map((s) => {
                            const match = s.results.find((sr) => sr.label === r.label);
                            return <td key={s.id}>{match?.value || '-'}</td>;
                          })}
                        </tr>
                      ))}
                      <tr>
                        <td className="tv-study-scenario-metric">Est. CPM</td>
                        {scenarios.map((s) => (
                          <td key={s.id}>&pound;{s.budget.cpm.toFixed(2)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="tv-study-scenario-metric">Est. Total Cost</td>
                        {scenarios.map((s) => (
                          <td key={s.id}>{s.budget.totalCost}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
