import { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown, Play, X, Loader2, Tv, BarChart3, Layers, Swords,
  BookmarkPlus, GitCompare, Zap, Monitor, TrendingUp, DollarSign,
  Users, Target, Radio, Eye
} from 'lucide-react';
import { useWaves, useLocations } from '@/hooks/useTaxonomy';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button, Input, Tabs, Modal } from '@/components/shared';
import ChartRenderer from '@/components/chart/ChartRenderer';
import type { Wave, Location, ChartType } from '@/api/types';
import './TvStudy.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DaypartDef {
  name: string;
  key: string;
  time: string;
}

interface DaypartSlot {
  weekday: number;
  weekend: number;
}

interface Scenario {
  id: string;
  name: string;
  channels: string[];
  audience: string;
  country: string;
  daypartSlots: DaypartSlot[];
  includeCTV: boolean;
  streamingPlatforms: string[];
  kpis: KPIResult;
  createdAt: string;
}

interface KPIResult {
  universe: number;
  reach: number;
  reachPct: number;
  avgFrequency: number;
  grp: number;
  effectiveReach: number;
  estimatedSpend: number;
  cpm: number;
}

interface ChannelContrib {
  channel: string;
  incrementalReach: number;
  overlapPct: number;
  exclusiveReach: number;
  costPerReachPoint: number;
}

interface CompetitorData {
  brand: string;
  channels: string[];
  spend: number;
  sov: number;
  grp: number;
  dayparts: Record<string, number>;
}

// ─── Fallback Data ────────────────────────────────────────────────────────────

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

const dayparts: DaypartDef[] = [
  { name: 'Early Morning', key: 'early_morning', time: '06:00 - 09:00' },
  { name: 'Daytime', key: 'daytime', time: '09:00 - 12:00' },
  { name: 'Afternoon', key: 'afternoon', time: '12:00 - 15:00' },
  { name: 'Early Peak', key: 'early_peak', time: '15:00 - 18:00' },
  { name: 'Peak', key: 'peak', time: '18:00 - 21:00' },
  { name: 'Late Peak', key: 'late_peak', time: '21:00 - 00:00' },
  { name: 'Nighttime', key: 'nighttime', time: '00:00 - 06:00' },
];

const streamingPlatformsList: string[] = [
  'Netflix', 'YouTube', 'Disney+', 'Amazon Prime', 'Hulu', 'Apple TV+',
];

const competitorBrands: string[] = [
  'Unilever', 'Procter & Gamble', 'Coca-Cola', 'PepsiCo', 'Nestle',
  'Samsung', 'Apple', 'Amazon', 'Toyota', 'Nike',
  'Adidas', "McDonald's", 'Google', 'Meta', 'Microsoft',
];

// ─── Seeded Random ────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// ─── Mock Data Generators ─────────────────────────────────────────────────────

function generateKPIs(
  channels: string[],
  daypartSlots: DaypartSlot[],
  audience: string,
  country: string,
  includeCTV: boolean,
  streamingPlatforms: string[],
): KPIResult {
  const seed = hashString(channels.join(',') + audience + country + includeCTV.toString());
  const rand = seededRandom(seed);

  const channelFactor = Math.min(channels.length / 10, 1);
  const totalSlots = daypartSlots.reduce((sum, s) => sum + s.weekday + s.weekend, 0);
  const slotFactor = Math.min(totalSlots / 30, 1);
  const ctvBoost = includeCTV ? (1 + streamingPlatforms.length * 0.04) : 1;

  const baseUniverse = 40000000 + rand() * 20000000;
  const universe = Math.round(baseUniverse);
  const reachPct = Math.min(95, (30 + channelFactor * 35 + slotFactor * 20 + rand() * 10) * ctvBoost);
  const reach = Math.round(universe * reachPct / 100);
  const avgFrequency = Math.round((2.5 + channelFactor * 3 + slotFactor * 2 + rand() * 1.5) * 10) / 10;
  const grp = Math.round(reachPct * avgFrequency * 10) / 10;
  const effectiveReach = Math.round(reachPct * (0.55 + channelFactor * 0.2 + rand() * 0.1) * 10) / 10;
  const estimatedSpend = Math.round((channels.length * 120000 + totalSlots * 8000) * ctvBoost);
  const cpm = Math.round((estimatedSpend / (reach / 1000)) * 100) / 100;

  return { universe, reach, reachPct: Math.round(reachPct * 10) / 10, avgFrequency, grp, effectiveReach, estimatedSpend, cpm };
}

function generateReachCurve(kpis: KPIResult): Array<{ name: string; 'Reach %': number; 'Cumulative Reach': number }> {
  const maxReach = kpis.reachPct;
  const curve: Array<{ name: string; 'Reach %': number; 'Cumulative Reach': number }> = [];
  for (let freq = 1; freq <= 12; freq++) {
    const reachAtFreq = maxReach * (1 - Math.exp(-0.35 * freq));
    const cumulative = Math.round(kpis.universe * reachAtFreq / 100);
    curve.push({
      name: `${freq}+`,
      'Reach %': Math.round(reachAtFreq * 10) / 10,
      'Cumulative Reach': cumulative,
    });
  }
  return curve;
}

function generateChannelContributions(channels: string[], kpis: KPIResult): ChannelContrib[] {
  const seed = hashString(channels.join(','));
  const rand = seededRandom(seed);
  const totalReach = kpis.reachPct;

  return channels.map((ch, idx) => {
    const weight = 1 / (idx + 1) + rand() * 0.3;
    const incrementalReach = Math.round((totalReach * weight / channels.length) * 10) / 10;
    const overlapPct = Math.round((5 + rand() * 25) * 10) / 10;
    const exclusiveReach = Math.round((incrementalReach * (1 - overlapPct / 100)) * 10) / 10;
    const costPerReachPoint = Math.round((8000 + rand() * 15000) * 100) / 100;
    return { channel: ch, incrementalReach, overlapPct, exclusiveReach, costPerReachPoint };
  });
}

function generateOverlapMatrix(channels: string[]): Array<{ chA: string; chB: string; overlap: number }> {
  const seed = hashString(channels.join(',') + 'overlap');
  const rand = seededRandom(seed);
  const matrix: Array<{ chA: string; chB: string; overlap: number }> = [];
  for (let i = 0; i < channels.length; i++) {
    for (let j = 0; j < channels.length; j++) {
      if (i === j) {
        matrix.push({ chA: channels[i], chB: channels[j], overlap: 100 });
      } else {
        const overlap = Math.round((8 + rand() * 30) * 10) / 10;
        matrix.push({ chA: channels[i], chB: channels[j], overlap });
      }
    }
  }
  return matrix;
}

function generateDaypartEfficiency(
  daypartSlots: DaypartSlot[],
  channels: string[],
): Array<{ daypart: string; time: string; reachPct: number; grp: number; cpm: number; attention: number; rating: 'high' | 'medium' | 'low' }> {
  const seed = hashString(channels.join(',') + 'dayparts');
  const rand = seededRandom(seed);

  return dayparts.map((dp, idx) => {
    const slots = daypartSlots[idx];
    const totalSlots = slots.weekday + slots.weekend;
    const isPeak = dp.key === 'peak' || dp.key === 'late_peak';
    const baseReach = isPeak ? 12 + rand() * 8 : 4 + rand() * 6;
    const reachPct = Math.round(baseReach * Math.min(totalSlots, 5) / 3 * 10) / 10;
    const grp = Math.round(reachPct * (2 + rand() * 3) * 10) / 10;
    const cpm = Math.round((isPeak ? 18 + rand() * 12 : 6 + rand() * 8) * 100) / 100;
    const attention = Math.round((isPeak ? 65 + rand() * 25 : 30 + rand() * 35) * 10) / 10;
    const efficiency = reachPct / Math.max(cpm, 1);
    const rating: 'high' | 'medium' | 'low' = efficiency > 1.2 ? 'high' : efficiency > 0.6 ? 'medium' : 'low';
    return { daypart: dp.name, time: dp.time, reachPct, grp, cpm, attention, rating };
  });
}

function generateCompetitorData(brands: string[], channels: string[]): CompetitorData[] {
  return brands.map(brand => {
    const seed = hashString(brand);
    const rand = seededRandom(seed);
    const numChannels = 2 + Math.floor(rand() * 5);
    const brandChannels: string[] = [];
    for (let i = 0; i < numChannels; i++) {
      const ch = channels[Math.floor(rand() * channels.length)];
      if (!brandChannels.includes(ch)) brandChannels.push(ch);
    }
    const spend = Math.round(200000 + rand() * 1800000);
    const sov = Math.round((5 + rand() * 20) * 10) / 10;
    const grp = Math.round((100 + rand() * 400) * 10) / 10;

    const daypartAlloc: Record<string, number> = {};
    let remaining = 100;
    dayparts.forEach((dp, idx) => {
      const val = idx < dayparts.length - 1 ? Math.round(rand() * Math.min(remaining, 30)) : remaining;
      daypartAlloc[dp.key] = val;
      remaining -= val;
    });

    return { brand, channels: brandChannels, spend, sov, grp, dayparts: daypartAlloc };
  });
}

function generateCTVResults(kpis: KPIResult, streamingPlatforms: string[]) {
  const platformCount = streamingPlatforms.length;
  const linearReach = kpis.reachPct;
  const ctvOnlyPct = Math.round((3 + platformCount * 2.5) * 10) / 10;
  const linearOnlyPct = Math.round((linearReach * 0.7) * 10) / 10;
  const overlapPct = Math.round((linearReach - linearOnlyPct) * 10) / 10;
  const combinedReach = Math.round(Math.min(95, linearOnlyPct + ctvOnlyPct + overlapPct) * 10) / 10;
  return {
    linearOnlyPct,
    ctvOnlyPct,
    overlapPct,
    combinedReach,
    dedupSavings: Math.round(overlapPct * 0.6 * 10) / 10,
    platformBreakdown: streamingPlatforms.map(p => ({
      platform: p,
      reachPct: Math.round((2 + Math.random() * 8) * 10) / 10,
      incrementalReach: Math.round((0.5 + Math.random() * 3) * 10) / 10,
    })),
  };
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function heatmapColor(value: number, max: number): string {
  const ratio = value / Math.max(max, 1);
  if (ratio > 0.7) return 'var(--color-error-light, #fde8e8)';
  if (ratio > 0.4) return 'var(--color-warning-light, #fef3cd)';
  return 'var(--color-success-light, #d4edda)';
}

function efficiencyColor(rating: 'high' | 'medium' | 'low'): string {
  switch (rating) {
    case 'high': return '#d4edda';
    case 'medium': return '#fff3cd';
    case 'low': return '#f8d7da';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TvStudy(): React.JSX.Element {
  // API hooks
  const { data: apiWaves, isLoading: wavesLoading } = useWaves();
  const { data: apiLocations, isLoading: locationsLoading } = useLocations();
  const { selectedLocationIds } = useWorkspaceStore();

  const waveNames = useMemo(() => {
    if (apiWaves && apiWaves.length > 0) return apiWaves.map((w: Wave) => w.name);
    return fallbackWaveNames;
  }, [apiWaves]);

  const countryNames = useMemo(() => {
    if (apiLocations && apiLocations.length > 0) return apiLocations.map((loc: Location) => loc.name);
    return fallbackCountries;
  }, [apiLocations]);

  const channels = fallbackChannels;
  const audiences = fallbackAudiences;

  // ─── State ──────────────────────────────────────────────────────────
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['BBC One', 'ITV']);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState('Adults 16-64');
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    selectedLocationIds.length > 0 ? selectedLocationIds[0] : 'United Kingdom'
  );
  const [countryOpen, setCountryOpen] = useState(false);
  const [timezone, setTimezone] = useState<'local' | 'standardized'>('local');
  const [selectedWaves, setSelectedWaves] = useState<string[]>(() => waveNames.slice(0, 4));
  const [wavesOpen, setWavesOpen] = useState(false);
  const [daypartSlots, setDaypartSlots] = useState<DaypartSlot[]>(
    dayparts.map(() => ({ weekday: 1, weekend: 1 }))
  );
  const [showResults, setShowResults] = useState(false);

  // CTV state
  const [includeCTV, setIncludeCTV] = useState(false);
  const [selectedStreaming, setSelectedStreaming] = useState<string[]>([]);
  const [streamingOpen, setStreamingOpen] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('plan');

  // Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);

  // Competitive
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [competitorsOpen, setCompetitorsOpen] = useState(false);

  // Daypart optimization
  const [optimizedDayparts, setOptimizedDayparts] = useState<Set<number>>(new Set());

  // ─── Handlers ───────────────────────────────────────────────────────

  const toggleChannel = (ch: string): void => {
    setSelectedChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const toggleWave = (w: string): void => {
    setSelectedWaves(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };

  const toggleStreaming = (p: string): void => {
    setSelectedStreaming(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleCompetitor = (b: string): void => {
    setSelectedCompetitors(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const updateSlot = (idx: number, field: keyof DaypartSlot, value: string): void => {
    setDaypartSlots(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: Math.max(0, parseInt(value) || 0) };
      return next;
    });
  };

  const runStudy = useCallback(() => {
    setShowResults(true);
    setActiveTab('results');
    setOptimizedDayparts(new Set());
  }, []);

  // ─── Computed Results ───────────────────────────────────────────────

  const kpis = useMemo(() => {
    if (!showResults) return null;
    return generateKPIs(selectedChannels, daypartSlots, selectedAudience, selectedCountry, includeCTV, selectedStreaming);
  }, [showResults, selectedChannels, daypartSlots, selectedAudience, selectedCountry, includeCTV, selectedStreaming]);

  const reachCurveData = useMemo(() => {
    if (!kpis) return [];
    return generateReachCurve(kpis);
  }, [kpis]);

  const channelContribData = useMemo(() => {
    if (!kpis) return [];
    return generateChannelContributions(selectedChannels, kpis);
  }, [kpis, selectedChannels]);

  const overlapMatrix = useMemo(() => {
    if (!showResults) return [];
    return generateOverlapMatrix(selectedChannels);
  }, [showResults, selectedChannels]);

  const daypartEfficiency = useMemo(() => {
    if (!showResults) return [];
    return generateDaypartEfficiency(daypartSlots, selectedChannels);
  }, [showResults, daypartSlots, selectedChannels]);

  const competitorData = useMemo(() => {
    if (selectedCompetitors.length === 0) return [];
    return generateCompetitorData(selectedCompetitors, channels);
  }, [selectedCompetitors, channels]);

  const ctvResults = useMemo(() => {
    if (!kpis || !includeCTV || selectedStreaming.length === 0) return null;
    return generateCTVResults(kpis, selectedStreaming);
  }, [kpis, includeCTV, selectedStreaming]);

  // ─── Scenario Methods ───────────────────────────────────────────────

  const saveScenario = (): void => {
    if (!kpis || !scenarioName.trim()) return;
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: scenarioName.trim(),
      channels: [...selectedChannels],
      audience: selectedAudience,
      country: selectedCountry,
      daypartSlots: [...daypartSlots],
      includeCTV,
      streamingPlatforms: [...selectedStreaming],
      kpis,
      createdAt: new Date().toISOString(),
    };
    setScenarios(prev => [...prev, newScenario]);
    setScenarioName('');
    setShowSaveModal(false);
  };

  const toggleScenarioCompare = (id: string) => {
    setSelectedScenarioIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const removeScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    setSelectedScenarioIds(prev => prev.filter(x => x !== id));
  };

  // Daypart optimize
  const optimizeDayparts = () => {
    const recommended = new Set<number>();
    daypartEfficiency.forEach((dp, idx) => {
      if (dp.rating === 'high') recommended.add(idx);
    });
    setOptimizedDayparts(recommended);
  };

  // ─── Tab Config ─────────────────────────────────────────────────────

  const tabItems = useMemo(() => {
    const base: Array<{ id: string; label: string; icon: React.ReactNode; count?: number }> = [
      { id: 'plan', label: 'Plan', icon: <Tv size={15} /> },
    ];
    if (showResults) {
      base.push(
        { id: 'results', label: 'Results', icon: <BarChart3 size={15} /> },
        { id: 'overlap', label: 'Overlap', icon: <Layers size={15} /> },
        { id: 'competitive', label: 'Competitive', icon: <Swords size={15} /> },
        { id: 'scenarios', label: 'Scenarios', count: scenarios.length, icon: <GitCompare size={15} /> },
      );
    }
    return base;
  }, [showResults, scenarios.length]);

  const isDataLoading = wavesLoading || locationsLoading;

  // ─── Render ─────────────────────────────────────────────────────────

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

      <div className="tv-study-tabs-bar">
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="tv-study-content">
        {/* ────────── PLAN TAB ────────── */}
        {activeTab === 'plan' && (
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
                          <input type="checkbox" checked={selectedChannels.includes(ch)} onChange={() => toggleChannel(ch)} />
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
                      <button className="tv-study-tag-remove" onClick={() => toggleChannel(ch)}><X size={12} /></button>
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
                        <button key={a} className={`tv-study-dropdown-item ${a === selectedAudience ? 'selected' : ''}`}
                          onClick={() => { setSelectedAudience(a); setAudienceOpen(false); }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
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
                        <button key={c} className={`tv-study-dropdown-item ${c === selectedCountry ? 'selected' : ''}`}
                          onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}>
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
                  <Button variant={timezone === 'local' ? 'primary' : 'ghost'} size="sm"
                    className={`tv-study-toggle-btn ${timezone === 'local' ? 'active' : ''}`}
                    onClick={() => setTimezone('local')}>
                    Local
                  </Button>
                  <Button variant={timezone === 'standardized' ? 'primary' : 'ghost'} size="sm"
                    className={`tv-study-toggle-btn ${timezone === 'standardized' ? 'active' : ''}`}
                    onClick={() => setTimezone('standardized')}>
                    Standardized
                  </Button>
                </div>
              </div>

              {/* Waves */}
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
                          <input type="checkbox" checked={selectedWaves.includes(w)} onChange={() => toggleWave(w)} />
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
                      <button className="tv-study-tag-remove" onClick={() => toggleWave(w)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* CTV/Streaming Toggle */}
              <div className="tv-study-field tv-study-field-full">
                <label className="tv-study-label">
                  <Monitor size={16} />
                  Include CTV/Streaming
                </label>
                <div className="tv-study-ctv-toggle">
                  <button
                    className={`tv-study-ctv-switch ${includeCTV ? 'active' : ''}`}
                    onClick={() => setIncludeCTV(!includeCTV)}
                    role="switch"
                    aria-checked={includeCTV}
                  >
                    <span className="tv-study-ctv-switch-thumb" />
                  </button>
                  <span className="tv-study-ctv-label">{includeCTV ? 'Enabled' : 'Disabled'}</span>
                </div>
                {includeCTV && (
                  <div className="tv-study-streaming-section">
                    <div className="tv-study-multiselect-wrapper">
                      <button className="tv-study-select-btn" onClick={() => setStreamingOpen(!streamingOpen)}>
                        <span>{selectedStreaming.length} platform{selectedStreaming.length !== 1 ? 's' : ''} selected</span>
                        <ChevronDown size={16} />
                      </button>
                      {streamingOpen && (
                        <div className="tv-study-dropdown">
                          {streamingPlatformsList.map((p: string) => (
                            <label key={p} className="tv-study-dropdown-option">
                              <input type="checkbox" checked={selectedStreaming.includes(p)} onChange={() => toggleStreaming(p)} />
                              <span>{p}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedStreaming.length > 0 && (
                      <div className="tv-study-tags">
                        {selectedStreaming.map((p: string) => (
                          <span key={p} className="tv-study-tag tv-study-tag-streaming">
                            {p}
                            <button className="tv-study-tag-remove" onClick={() => toggleStreaming(p)}><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Daypart Schedule */}
            <div className="tv-study-dayparts">
              <div className="tv-study-dayparts-header">
                <h3 className="tv-study-section-title">Daypart Schedule</h3>
                {showResults && (
                  <Button variant="ghost" size="sm" onClick={optimizeDayparts} icon={<Zap size={14} />}>
                    Optimize
                  </Button>
                )}
              </div>
              <table className="tv-study-daypart-table">
                <thead>
                  <tr>
                    <th>Daypart</th>
                    <th>Time</th>
                    <th>Weekday Slots</th>
                    <th>Weekend Slots</th>
                    {showResults && <th>Efficiency</th>}
                  </tr>
                </thead>
                <tbody>
                  {dayparts.map((dp: DaypartDef, idx: number) => {
                    const eff = daypartEfficiency[idx];
                    const isOptimized = optimizedDayparts.has(idx);
                    return (
                      <tr key={dp.name}
                        style={eff ? { backgroundColor: efficiencyColor(eff.rating) } : undefined}
                        className={isOptimized ? 'tv-study-optimized-row' : ''}
                      >
                        <td className="tv-study-dp-name">
                          {isOptimized && <Zap size={12} className="tv-study-optimize-icon" />}
                          {dp.name}
                        </td>
                        <td className="tv-study-dp-time">{dp.time}</td>
                        <td>
                          <Input type="number" className="tv-study-slot-input" value={daypartSlots[idx].weekday}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlot(idx, 'weekday', e.target.value)}
                            min={0} />
                        </td>
                        <td>
                          <Input type="number" className="tv-study-slot-input" value={daypartSlots[idx].weekend}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlot(idx, 'weekend', e.target.value)}
                            min={0} />
                        </td>
                        {showResults && eff && (
                          <td>
                            <span className={`tv-study-efficiency-badge tv-study-efficiency-${eff.rating}`}>
                              {eff.rating}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="tv-study-actions">
              <Button variant="primary" icon={<Play size={16} />} className="tv-study-run-btn"
                onClick={runStudy}
                disabled={selectedWaves.length < 4 || selectedChannels.length === 0}>
                Run Study
              </Button>
              {showResults && kpis && (
                <Button variant="ghost" icon={<BookmarkPlus size={16} />} className="tv-study-save-btn"
                  onClick={() => setShowSaveModal(true)}>
                  Save Scenario
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ────────── RESULTS TAB ────────── */}
        {activeTab === 'results' && showResults && kpis && (
          <div className="tv-study-results-tab">
            {/* KPI Summary Cards */}
            <div className="tv-study-kpi-grid">
              <div className="tv-study-kpi-card">
                <div className="tv-study-kpi-icon"><Users size={20} /></div>
                <div className="tv-study-kpi-content">
                  <div className="tv-study-kpi-label">Universe</div>
                  <div className="tv-study-kpi-value">{formatNumber(kpis.universe)}</div>
                </div>
              </div>
              <div className="tv-study-kpi-card tv-study-kpi-primary">
                <div className="tv-study-kpi-icon"><Target size={20} /></div>
                <div className="tv-study-kpi-content">
                  <div className="tv-study-kpi-label">Reach</div>
                  <div className="tv-study-kpi-value">{formatNumber(kpis.reach)}</div>
                  <div className="tv-study-kpi-sub">{kpis.reachPct}%</div>
                </div>
              </div>
              <div className="tv-study-kpi-card">
                <div className="tv-study-kpi-icon"><Radio size={20} /></div>
                <div className="tv-study-kpi-content">
                  <div className="tv-study-kpi-label">Avg Frequency</div>
                  <div className="tv-study-kpi-value">{kpis.avgFrequency}</div>
                </div>
              </div>
              <div className="tv-study-kpi-card">
                <div className="tv-study-kpi-icon"><BarChart3 size={20} /></div>
                <div className="tv-study-kpi-content">
                  <div className="tv-study-kpi-label">GRP</div>
                  <div className="tv-study-kpi-value">{kpis.grp}</div>
                </div>
              </div>
              <div className="tv-study-kpi-card">
                <div className="tv-study-kpi-icon"><Eye size={20} /></div>
                <div className="tv-study-kpi-content">
                  <div className="tv-study-kpi-label">Effective Reach</div>
                  <div className="tv-study-kpi-value">{kpis.effectiveReach}%</div>
                </div>
              </div>
              <div className="tv-study-kpi-card">
                <div className="tv-study-kpi-icon"><DollarSign size={20} /></div>
                <div className="tv-study-kpi-content">
                  <div className="tv-study-kpi-label">Estimated Spend</div>
                  <div className="tv-study-kpi-value">{formatCurrency(kpis.estimatedSpend)}</div>
                  <div className="tv-study-kpi-sub">CPM: ${kpis.cpm}</div>
                </div>
              </div>
            </div>

            {/* Reach Curve Chart */}
            <div className="tv-study-chart-section">
              <h3 className="tv-study-section-title">
                <TrendingUp size={18} />
                Reach Curve
              </h3>
              <div className="tv-study-chart-wrapper">
                <ChartRenderer
                  type={'line' as ChartType}
                  data={reachCurveData}
                  series={['Reach %']}
                  height={350}
                  showLegend={true}
                  showGrid={true}
                />
              </div>
            </div>

            {/* CTV Combined Results */}
            {includeCTV && ctvResults && (
              <div className="tv-study-ctv-results">
                <h3 className="tv-study-section-title">
                  <Monitor size={18} />
                  Linear + CTV Combined Results
                </h3>
                <div className="tv-study-ctv-grid">
                  <div className="tv-study-ctv-stat">
                    <div className="tv-study-ctv-stat-label">Linear Only</div>
                    <div className="tv-study-ctv-stat-value">{ctvResults.linearOnlyPct}%</div>
                  </div>
                  <div className="tv-study-ctv-stat">
                    <div className="tv-study-ctv-stat-label">CTV Only</div>
                    <div className="tv-study-ctv-stat-value">{ctvResults.ctvOnlyPct}%</div>
                  </div>
                  <div className="tv-study-ctv-stat">
                    <div className="tv-study-ctv-stat-label">Overlap</div>
                    <div className="tv-study-ctv-stat-value">{ctvResults.overlapPct}%</div>
                  </div>
                  <div className="tv-study-ctv-stat tv-study-ctv-stat-highlight">
                    <div className="tv-study-ctv-stat-label">Combined Reach</div>
                    <div className="tv-study-ctv-stat-value">{ctvResults.combinedReach}%</div>
                  </div>
                  <div className="tv-study-ctv-stat">
                    <div className="tv-study-ctv-stat-label">Dedup Savings</div>
                    <div className="tv-study-ctv-stat-value">{ctvResults.dedupSavings}%</div>
                  </div>
                </div>
                <table className="tv-study-data-table">
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Reach %</th>
                      <th>Incremental Reach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ctvResults.platformBreakdown.map(p => (
                      <tr key={p.platform}>
                        <td className="tv-study-dp-name">{p.platform}</td>
                        <td>{p.reachPct}%</td>
                        <td>{p.incrementalReach}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Channel Contribution Table */}
            <div className="tv-study-channel-contrib">
              <h3 className="tv-study-section-title">Channel Contribution</h3>
              <table className="tv-study-data-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Incremental Reach %</th>
                    <th>Overlap %</th>
                    <th>Exclusive Reach %</th>
                    <th>Cost per Reach Point</th>
                  </tr>
                </thead>
                <tbody>
                  {channelContribData.map(c => (
                    <tr key={c.channel}>
                      <td className="tv-study-dp-name">{c.channel}</td>
                      <td>{c.incrementalReach}%</td>
                      <td>{c.overlapPct}%</td>
                      <td>{c.exclusiveReach}%</td>
                      <td>{formatCurrency(c.costPerReachPoint)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Daypart Heatmap Table */}
            <div className="tv-study-daypart-results">
              <div className="tv-study-dayparts-header">
                <h3 className="tv-study-section-title">Daypart Performance</h3>
                <Button variant="ghost" size="sm" onClick={optimizeDayparts} icon={<Zap size={14} />}>
                  Optimize
                </Button>
              </div>
              <table className="tv-study-data-table">
                <thead>
                  <tr>
                    <th>Daypart</th>
                    <th>Time</th>
                    <th>Reach %</th>
                    <th>GRP</th>
                    <th>CPM</th>
                    <th>Attention Score</th>
                    <th>Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {daypartEfficiency.map((dp, idx) => (
                    <tr key={dp.daypart} style={{ backgroundColor: efficiencyColor(dp.rating) }}
                      className={optimizedDayparts.has(idx) ? 'tv-study-optimized-row' : ''}>
                      <td className="tv-study-dp-name">
                        {optimizedDayparts.has(idx) && <Zap size={12} className="tv-study-optimize-icon" />}
                        {dp.daypart}
                      </td>
                      <td className="tv-study-dp-time">{dp.time}</td>
                      <td>{dp.reachPct}%</td>
                      <td>{dp.grp}</td>
                      <td>${dp.cpm}</td>
                      <td>{dp.attention}</td>
                      <td>
                        <span className={`tv-study-efficiency-badge tv-study-efficiency-${dp.rating}`}>
                          {dp.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────── OVERLAP TAB ────────── */}
        {activeTab === 'overlap' && showResults && (
          <div className="tv-study-overlap-tab">
            <h3 className="tv-study-section-title">
              <Layers size={18} />
              Channel Overlap Matrix
            </h3>
            <p className="tv-study-section-desc">
              Percentage of audience overlap between each pair of channels. Higher values (darker cells) indicate greater audience duplication.
            </p>
            <div className="tv-study-matrix-wrapper">
              <table className="tv-study-matrix-table">
                <thead>
                  <tr>
                    <th></th>
                    {selectedChannels.map(ch => (
                      <th key={ch} className="tv-study-matrix-header">{ch}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedChannels.map(chA => (
                    <tr key={chA}>
                      <td className="tv-study-matrix-row-header">{chA}</td>
                      {selectedChannels.map(chB => {
                        const cell = overlapMatrix.find(m => m.chA === chA && m.chB === chB);
                        const val = cell?.overlap ?? 0;
                        const isDiag = chA === chB;
                        return (
                          <td key={chB}
                            className={`tv-study-matrix-cell ${isDiag ? 'tv-study-matrix-diag' : ''}`}
                            style={!isDiag ? { backgroundColor: heatmapColor(val, 40) } : undefined}
                          >
                            {val}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────── COMPETITIVE TAB ────────── */}
        {activeTab === 'competitive' && showResults && (
          <div className="tv-study-competitive-tab">
            <h3 className="tv-study-section-title">
              <Swords size={18} />
              Competitive Analysis
            </h3>

            <div className="tv-study-field" style={{ maxWidth: 400, marginBottom: 24 }}>
              <label className="tv-study-label">Select Competitors</label>
              <div className="tv-study-multiselect-wrapper">
                <button className="tv-study-select-btn" onClick={() => setCompetitorsOpen(!competitorsOpen)}>
                  <span>{selectedCompetitors.length} brand{selectedCompetitors.length !== 1 ? 's' : ''} selected</span>
                  <ChevronDown size={16} />
                </button>
                {competitorsOpen && (
                  <div className="tv-study-dropdown tv-study-dropdown-tall">
                    {competitorBrands.map(b => (
                      <label key={b} className="tv-study-dropdown-option">
                        <input type="checkbox" checked={selectedCompetitors.includes(b)} onChange={() => toggleCompetitor(b)} />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedCompetitors.length > 0 && (
                <div className="tv-study-tags">
                  {selectedCompetitors.map(b => (
                    <span key={b} className="tv-study-tag">
                      {b}
                      <button className="tv-study-tag-remove" onClick={() => toggleCompetitor(b)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {competitorData.length > 0 && (
              <>
                <div className="tv-study-competitive-summary">
                  <table className="tv-study-data-table">
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Channels</th>
                        <th>Estimated Spend</th>
                        <th>Share of Voice</th>
                        <th>GRP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorData.map(comp => (
                        <tr key={comp.brand}>
                          <td className="tv-study-dp-name">{comp.brand}</td>
                          <td>
                            <div className="tv-study-tags" style={{ gap: 4 }}>
                              {comp.channels.map(ch => (
                                <span key={ch} className="tv-study-tag" style={{ fontSize: 11, padding: '1px 6px' }}>{ch}</span>
                              ))}
                            </div>
                          </td>
                          <td>{formatCurrency(comp.spend)}</td>
                          <td>{comp.sov}%</td>
                          <td>{comp.grp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4 className="tv-study-section-subtitle">Daypart Distribution (%)</h4>
                <div className="tv-study-competitive-dayparts">
                  <table className="tv-study-data-table">
                    <thead>
                      <tr>
                        <th>Brand</th>
                        {dayparts.map(dp => <th key={dp.key}>{dp.name}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {competitorData.map(comp => (
                        <tr key={comp.brand}>
                          <td className="tv-study-dp-name">{comp.brand}</td>
                          {dayparts.map(dp => {
                            const val = comp.dayparts[dp.key] || 0;
                            return (
                              <td key={dp.key} style={{ backgroundColor: heatmapColor(val, 35), textAlign: 'center' }}>
                                {val}%
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {competitorData.length === 0 && (
              <div className="tv-study-empty-state">
                <Swords size={48} />
                <p>Select competitor brands above to view their media distribution analysis.</p>
              </div>
            )}
          </div>
        )}

        {/* ────────── SCENARIOS TAB ────────── */}
        {activeTab === 'scenarios' && showResults && (
          <div className="tv-study-scenarios-tab">
            <div className="tv-study-scenarios-header">
              <h3 className="tv-study-section-title">
                <GitCompare size={18} />
                Saved Scenarios
              </h3>
              <div className="tv-study-scenarios-actions">
                {kpis && (
                  <Button variant="primary" size="sm" icon={<BookmarkPlus size={14} />}
                    onClick={() => setShowSaveModal(true)}>
                    Save Current
                  </Button>
                )}
                {scenarios.length >= 2 && (
                  <Button variant={compareMode ? 'primary' : 'ghost'} size="sm" icon={<GitCompare size={14} />}
                    onClick={() => { setCompareMode(!compareMode); setSelectedScenarioIds([]); }}>
                    {compareMode ? 'Exit Compare' : 'Compare'}
                  </Button>
                )}
              </div>
            </div>

            {scenarios.length === 0 ? (
              <div className="tv-study-empty-state">
                <BookmarkPlus size={48} />
                <p>No saved scenarios yet. Run a study and save it to start comparing configurations.</p>
              </div>
            ) : (
              <>
                <div className="tv-study-scenario-list">
                  {scenarios.map(s => (
                    <div key={s.id} className={`tv-study-scenario-card ${selectedScenarioIds.includes(s.id) ? 'selected' : ''}`}>
                      {compareMode && (
                        <input type="checkbox" checked={selectedScenarioIds.includes(s.id)}
                          onChange={() => toggleScenarioCompare(s.id)} />
                      )}
                      <div className="tv-study-scenario-info">
                        <div className="tv-study-scenario-name">{s.name}</div>
                        <div className="tv-study-scenario-meta">
                          {s.channels.length} channels | {s.audience} | {s.country}
                          {s.includeCTV && ` | +CTV (${s.streamingPlatforms.length})`}
                        </div>
                        <div className="tv-study-scenario-meta">
                          Created {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="tv-study-scenario-kpis-mini">
                        <span>Reach: {s.kpis.reachPct}%</span>
                        <span>GRP: {s.kpis.grp}</span>
                        <span>Freq: {s.kpis.avgFrequency}</span>
                      </div>
                      <button className="tv-study-scenario-remove" onClick={() => removeScenario(s.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {compareMode && selectedScenarioIds.length >= 2 && (
                  <div className="tv-study-comparison-section">
                    <h4 className="tv-study-section-subtitle">Side-by-Side Comparison</h4>
                    <table className="tv-study-data-table tv-study-comparison-table">
                      <thead>
                        <tr>
                          <th>Metric</th>
                          {selectedScenarioIds.map(id => {
                            const sc = scenarios.find(s => s.id === id);
                            return <th key={id}>{sc?.name}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Channels', key: 'channels' },
                          { label: 'Universe', key: 'universe' },
                          { label: 'Reach', key: 'reach' },
                          { label: 'Reach %', key: 'reachPct' },
                          { label: 'Avg Frequency', key: 'avgFrequency' },
                          { label: 'GRP', key: 'grp' },
                          { label: 'Effective Reach', key: 'effectiveReach' },
                          { label: 'Estimated Spend', key: 'estimatedSpend' },
                          { label: 'CPM', key: 'cpm' },
                          { label: 'CTV Included', key: 'includeCTV' },
                        ].map(metric => (
                          <tr key={metric.key}>
                            <td className="tv-study-dp-name">{metric.label}</td>
                            {selectedScenarioIds.map(id => {
                              const sc = scenarios.find(s => s.id === id);
                              if (!sc) return <td key={id}>-</td>;
                              let val: string;
                              switch (metric.key) {
                                case 'channels': val = sc.channels.join(', '); break;
                                case 'universe': val = formatNumber(sc.kpis.universe); break;
                                case 'reach': val = formatNumber(sc.kpis.reach); break;
                                case 'reachPct': val = `${sc.kpis.reachPct}%`; break;
                                case 'avgFrequency': val = `${sc.kpis.avgFrequency}`; break;
                                case 'grp': val = `${sc.kpis.grp}`; break;
                                case 'effectiveReach': val = `${sc.kpis.effectiveReach}%`; break;
                                case 'estimatedSpend': val = formatCurrency(sc.kpis.estimatedSpend); break;
                                case 'cpm': val = `$${sc.kpis.cpm}`; break;
                                case 'includeCTV': val = sc.includeCTV ? `Yes (${sc.streamingPlatforms.join(', ')})` : 'No'; break;
                                default: val = '-';
                              }
                              return <td key={id}>{val}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Save Scenario Modal */}
      <Modal open={showSaveModal} onClose={() => setShowSaveModal(false)} title="Save Scenario" size="sm"
        footer={
          <div className="tv-study-modal-footer">
            <Button variant="ghost" onClick={() => setShowSaveModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveScenario} disabled={!scenarioName.trim()}>Save</Button>
          </div>
        }>
        <div className="tv-study-modal-body">
          <label className="tv-study-label">Scenario Name</label>
          <Input
            value={scenarioName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScenarioName(e.target.value)}
            placeholder="e.g. High reach primetime plan"
            autoFocus
          />
          {kpis && (
            <div className="tv-study-modal-preview">
              <div className="tv-study-modal-preview-row">
                <span>Channels:</span>
                <span>{selectedChannels.join(', ')}</span>
              </div>
              <div className="tv-study-modal-preview-row">
                <span>Reach:</span>
                <span>{kpis.reachPct}%</span>
              </div>
              <div className="tv-study-modal-preview-row">
                <span>GRP:</span>
                <span>{kpis.grp}</span>
              </div>
              <div className="tv-study-modal-preview-row">
                <span>Spend:</span>
                <span>{formatCurrency(kpis.estimatedSpend)}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
