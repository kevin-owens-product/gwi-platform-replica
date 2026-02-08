import { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown, Play, Plus, Trash2, Loader2, X, BookmarkPlus, GitCompare,
  FileText, BarChart3, Grid3x3, UserCircle, Zap, Monitor, DollarSign,
  Target, Eye, TrendingUp, Layers, Users
} from 'lucide-react';
import { useLocations } from '@/hooks/useTaxonomy';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button, Input, Tabs, Modal } from '@/components/shared';
import ChartRenderer from '@/components/chart/ChartRenderer';
import type { Location, ChartType } from '@/api/types';
import './PrintRF.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicationDef {
  name: string;
  type: string;
  circulation: string;
  circulationNum: number;
  cpm: number;
  readership000: number;
  hasDigital: boolean;
  digitalReadership000: number;
}

interface InsertionRow {
  publication: string;
  insertions: number;
  period: string;
}

interface PrintKPIs {
  universe: number;
  netReach: number;
  netReachPct: number;
  grossReach: number;
  grossReachPct: number;
  avgFrequency: number;
  ots: number;
  coverageIndex: number;
  totalCost: number;
  costPerReachPoint: number;
  cpm: number;
}

interface FreqDistPoint {
  exposures: number;
  audiencePct: number;
  cumulativePct: number;
}

interface PubContrib {
  publication: string;
  exclusiveReachPct: number;
  incrementalReach: number;
  affinityIndex: number;
  costPerReachPoint: number;
}

interface DuplicationEntry {
  pubA: string;
  pubB: string;
  overlapPct: number;
}

interface PubProfile {
  publication: string;
  demographics: Array<{ attribute: string; composition: number; index: number }>;
  affinityWithTarget: number;
}

interface PrintScenario {
  id: string;
  name: string;
  publications: string[];
  audience: string;
  market: string;
  insertionRows: InsertionRow[];
  includeDigital: boolean;
  kpis: PrintKPIs;
  createdAt: string;
}

// ─── Fallback Data ────────────────────────────────────────────────────────────

const fallbackPublications: PublicationDef[] = [
  { name: 'The Times', type: 'Daily Newspaper', circulation: '365,880', circulationNum: 365880, cpm: 22.50, readership000: 1280, hasDigital: true, digitalReadership000: 890 },
  { name: 'The Guardian', type: 'Daily Newspaper', circulation: '105,134', circulationNum: 105134, cpm: 18.75, readership000: 980, hasDigital: true, digitalReadership000: 1450 },
  { name: 'Daily Mail', type: 'Daily Newspaper', circulation: '1,134,184', circulationNum: 1134184, cpm: 14.20, readership000: 3200, hasDigital: true, digitalReadership000: 2100 },
  { name: 'The Sunday Times', type: 'Sunday Newspaper', circulation: '647,622', circulationNum: 647622, cpm: 28.40, readership000: 1850, hasDigital: true, digitalReadership000: 720 },
  { name: 'Financial Times', type: 'Daily Newspaper', circulation: '162,472', circulationNum: 162472, cpm: 35.60, readership000: 680, hasDigital: true, digitalReadership000: 1120 },
  { name: 'Vogue UK', type: 'Monthly Magazine', circulation: '186,519', circulationNum: 186519, cpm: 42.80, readership000: 1150, hasDigital: true, digitalReadership000: 650 },
  { name: 'GQ', type: 'Monthly Magazine', circulation: '108,234', circulationNum: 108234, cpm: 38.50, readership000: 780, hasDigital: true, digitalReadership000: 480 },
  { name: 'The Economist', type: 'Weekly Magazine', circulation: '208,128', circulationNum: 208128, cpm: 45.20, readership000: 920, hasDigital: true, digitalReadership000: 1380 },
  { name: 'Time Out', type: 'Weekly Magazine', circulation: '305,741', circulationNum: 305741, cpm: 16.90, readership000: 1420, hasDigital: true, digitalReadership000: 980 },
  { name: 'Cosmopolitan', type: 'Monthly Magazine', circulation: '390,128', circulationNum: 390128, cpm: 24.30, readership000: 1680, hasDigital: true, digitalReadership000: 720 },
];

const audiences: string[] = [
  'Adults 16-64', 'Adults 18-34', 'Adults 25-54', 'Adults 35-64', 'All Adults 16+',
];

const fallbackMarkets: string[] = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain',
  'Italy', 'Australia', 'Japan', 'Brazil', 'Canada',
];

const periods: string[] = ['Daily', 'Weekly', 'Monthly'];

const demographicAttributes: string[] = [
  'Male 16-34', 'Male 35-54', 'Male 55+', 'Female 16-34', 'Female 35-54', 'Female 55+',
  'ABC1', 'C2DE', 'Urban', 'Suburban', 'Graduate+', 'HH Income Top 25%',
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

function generatePrintKPIs(
  insertionRows: InsertionRow[],
  publications: PublicationDef[],
  audience: string,
  market: string,
  includeDigital: boolean,
): PrintKPIs {
  const seed = hashString(insertionRows.map(r => r.publication + r.insertions).join(',') + audience + market + includeDigital.toString());
  const rand = seededRandom(seed);

  const totalInsertions = insertionRows.reduce((sum, r) => sum + r.insertions, 0);
  const uniquePubs = new Set(insertionRows.map(r => r.publication)).size;
  const insertionFactor = Math.min(totalInsertions / 20, 1);
  const pubFactor = Math.min(uniquePubs / 8, 1);
  const digitalBoost = includeDigital ? 1.15 : 1;

  const baseUniverse = 35000000 + rand() * 15000000;
  const universe = Math.round(baseUniverse);

  const netReachPct = Math.min(65, (10 + pubFactor * 25 + insertionFactor * 20 + rand() * 8) * digitalBoost);
  const netReach = Math.round(universe * netReachPct / 100);
  const avgFrequency = Math.round((1.5 + insertionFactor * 2.5 + pubFactor * 1 + rand() * 1) * 10) / 10;
  const grossReachPct = Math.round(netReachPct * avgFrequency * 10) / 10;
  const grossReach = Math.round(universe * grossReachPct / 100);
  const ots = Math.round(netReach * avgFrequency);
  const coverageIndex = Math.round(90 + pubFactor * 30 + rand() * 15);

  // Cost calculation from publications
  let totalCost = 0;
  insertionRows.forEach(row => {
    const pub = publications.find(p => p.name === row.publication);
    if (pub) {
      const costPerInsertion = pub.cpm * (pub.readership000);
      totalCost += costPerInsertion * row.insertions;
    }
  });
  totalCost = Math.round(totalCost);
  const costPerReachPoint = netReachPct > 0 ? Math.round(totalCost / netReachPct) : 0;
  const cpm = netReach > 0 ? Math.round((totalCost / (netReach / 1000)) * 100) / 100 : 0;

  return {
    universe,
    netReach,
    netReachPct: Math.round(netReachPct * 10) / 10,
    grossReach,
    grossReachPct,
    avgFrequency,
    ots,
    coverageIndex,
    totalCost,
    costPerReachPoint,
    cpm,
  };
}

function generateFrequencyDistribution(kpis: PrintKPIs): FreqDistPoint[] {
  const maxFreq = Math.ceil(kpis.avgFrequency * 2.5);
  const points: FreqDistPoint[] = [];
  let cumulative = 100;

  for (let exp = 0; exp <= Math.min(maxFreq, 10); exp++) {
    let audiencePct: number;
    if (exp === 0) {
      audiencePct = Math.round((100 - kpis.netReachPct) * 10) / 10;
    } else {
      const lambda = kpis.avgFrequency;
      const poisson = Math.exp(-lambda) * Math.pow(lambda, exp) / factorial(exp);
      audiencePct = Math.round(kpis.netReachPct * poisson * 100) / 100;
      audiencePct = Math.max(0.1, Math.min(audiencePct, cumulative));
    }
    cumulative -= audiencePct;
    points.push({
      exposures: exp,
      audiencePct,
      cumulativePct: Math.round((100 - cumulative) * 10) / 10,
    });
  }
  return points;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function generatePubContributions(insertionRows: InsertionRow[], publications: PublicationDef[], kpis: PrintKPIs): PubContrib[] {
  const seed = hashString(insertionRows.map(r => r.publication).join(','));
  const rand = seededRandom(seed);
  const uniquePubs = [...new Set(insertionRows.map(r => r.publication))];

  return uniquePubs.map((pubName, idx) => {
    const pub = publications.find(p => p.name === pubName);
    const weight = 1 / (idx + 1) + rand() * 0.3;
    const exclusiveReachPct = Math.round((kpis.netReachPct * weight / uniquePubs.length * (0.3 + rand() * 0.4)) * 10) / 10;
    const incrementalReach = Math.round((kpis.netReachPct * weight / uniquePubs.length) * 10) / 10;
    const affinityIndex = Math.round(80 + rand() * 60);
    const costPerReachPoint = pub ? Math.round(pub.cpm * (pub.readership000 / Math.max(incrementalReach, 0.1))) : 0;

    return { publication: pubName, exclusiveReachPct, incrementalReach, affinityIndex, costPerReachPoint };
  });
}

function generateDuplicationMatrix(pubs: string[]): DuplicationEntry[] {
  const seed = hashString(pubs.join(',') + 'dup');
  const rand = seededRandom(seed);
  const matrix: DuplicationEntry[] = [];
  for (let i = 0; i < pubs.length; i++) {
    for (let j = 0; j < pubs.length; j++) {
      if (i === j) {
        matrix.push({ pubA: pubs[i], pubB: pubs[j], overlapPct: 100 });
      } else {
        const overlap = Math.round((5 + rand() * 25) * 10) / 10;
        matrix.push({ pubA: pubs[i], pubB: pubs[j], overlapPct: overlap });
      }
    }
  }
  return matrix;
}

function generatePublicationProfiles(pubs: string[]): PubProfile[] {
  return pubs.map(pubName => {
    const seed = hashString(pubName + 'profile');
    const rand = seededRandom(seed);

    const demographics = demographicAttributes.map(attr => {
      const composition = Math.round((3 + rand() * 20) * 10) / 10;
      const index = Math.round(60 + rand() * 100);
      return { attribute: attr, composition, index };
    });

    const affinityWithTarget = Math.round((70 + rand() * 60) * 10) / 10;
    return { publication: pubName, demographics, affinityWithTarget };
  });
}

function generateDigitalResults(kpis: PrintKPIs) {
  const printOnlyReachPct = Math.round(kpis.netReachPct * 0.65 * 10) / 10;
  const digitalOnlyReachPct = Math.round(kpis.netReachPct * 0.2 * 10) / 10;
  const overlapPct = Math.round((kpis.netReachPct - printOnlyReachPct - digitalOnlyReachPct) * 10) / 10;
  const combinedReachPct = Math.round(Math.min(85, kpis.netReachPct * 1.15) * 10) / 10;
  return {
    printOnlyReachPct,
    digitalOnlyReachPct,
    overlapPct: Math.max(0, overlapPct),
    combinedReachPct,
    dedupSavings: Math.round(Math.max(0, overlapPct) * 0.5 * 10) / 10,
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
  if (ratio > 0.7) return '#fde8e8';
  if (ratio > 0.4) return '#fef3cd';
  return '#d4edda';
}

function indexColor(index: number): string {
  if (index >= 120) return '#d4edda';
  if (index >= 80) return '#fff3cd';
  return '#f8d7da';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrintRF(): React.JSX.Element {
  // API hooks
  const { data: apiLocations, isLoading: locationsLoading } = useLocations();
  const { selectedLocationIds } = useWorkspaceStore();

  const marketNames = useMemo(() => {
    if (apiLocations && apiLocations.length > 0) return apiLocations.map((loc: Location) => loc.name);
    return fallbackMarkets;
  }, [apiLocations]);

  const publications = fallbackPublications;

  // ─── State ──────────────────────────────────────────────────────────
  const [selectedPublications, setSelectedPublications] = useState<string[]>(['The Times', 'Vogue UK']);
  const [pubsOpen, setPubsOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState('Adults 16-64');
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(
    selectedLocationIds.length > 0 ? selectedLocationIds[0] : 'United Kingdom'
  );
  const [marketOpen, setMarketOpen] = useState(false);
  const [insertionRows, setInsertionRows] = useState<InsertionRow[]>([
    { publication: 'The Times', insertions: 3, period: 'Weekly' },
    { publication: 'Vogue UK', insertions: 1, period: 'Monthly' },
  ]);
  const [showResults, setShowResults] = useState(false);

  // Digital extension
  const [includeDigital, setIncludeDigital] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('plan');

  // Scenarios
  const [scenarios, setScenarios] = useState<PrintScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);

  // Budget optimization
  const [budgetTarget, setBudgetTarget] = useState('');
  const [optimizedRows, setOptimizedRows] = useState<InsertionRow[] | null>(null);

  // ─── Handlers ───────────────────────────────────────────────────────

  const togglePublication = (name: string): void => {
    setSelectedPublications(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };

  const addRow = (): void => {
    setInsertionRows(prev => [
      ...prev,
      { publication: publications[0].name, insertions: 1, period: 'Weekly' },
    ]);
  };

  const removeRow = (idx: number): void => {
    setInsertionRows(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof InsertionRow, value: string): void => {
    setInsertionRows(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: field === 'insertions' ? Math.max(1, parseInt(value) || 1) : value };
      return next;
    });
  };

  const runAnalysis = useCallback(() => {
    setShowResults(true);
    setActiveTab('results');
    setOptimizedRows(null);
  }, []);

  // ─── Computed Results ───────────────────────────────────────────────

  const kpis = useMemo(() => {
    if (!showResults) return null;
    return generatePrintKPIs(insertionRows, publications, selectedAudience, selectedMarket, includeDigital);
  }, [showResults, insertionRows, publications, selectedAudience, selectedMarket, includeDigital]);

  const freqDistribution = useMemo(() => {
    if (!kpis) return [];
    return generateFrequencyDistribution(kpis);
  }, [kpis]);

  const freqChartData = useMemo(() => {
    return freqDistribution
      .filter(p => p.exposures > 0)
      .map(p => ({
        name: `${p.exposures}x`,
        'Audience %': p.audiencePct,
        'Cumulative %': p.cumulativePct,
      }));
  }, [freqDistribution]);

  const pubContribs = useMemo(() => {
    if (!kpis) return [];
    return generatePubContributions(insertionRows, publications, kpis);
  }, [kpis, insertionRows, publications]);

  const uniquePubNames = useMemo(() => {
    return [...new Set(insertionRows.map(r => r.publication))];
  }, [insertionRows]);

  const duplicationMatrix = useMemo(() => {
    if (!showResults) return [];
    return generateDuplicationMatrix(uniquePubNames);
  }, [showResults, uniquePubNames]);

  const pubProfiles = useMemo(() => {
    if (!showResults) return [];
    return generatePublicationProfiles(uniquePubNames);
  }, [showResults, uniquePubNames]);

  const digitalResults = useMemo(() => {
    if (!kpis || !includeDigital) return null;
    return generateDigitalResults(kpis);
  }, [kpis, includeDigital]);

  // Effective frequency band
  const effectiveFreqThreshold = 3;
  const effectiveFreqData = useMemo(() => {
    if (!kpis || freqDistribution.length === 0) return null;
    const atThreshold = freqDistribution.find(p => p.exposures === effectiveFreqThreshold);
    const underExposed = freqDistribution
      .filter(p => p.exposures > 0 && p.exposures < effectiveFreqThreshold)
      .reduce((sum, p) => sum + p.audiencePct, 0);
    const effectivelyReached = freqDistribution
      .filter(p => p.exposures >= effectiveFreqThreshold)
      .reduce((sum, p) => sum + p.audiencePct, 0);
    return {
      threshold: effectiveFreqThreshold,
      reachAtThreshold: atThreshold?.cumulativePct ?? 0,
      underExposedPct: Math.round(underExposed * 10) / 10,
      effectivelyReachedPct: Math.round(effectivelyReached * 10) / 10,
    };
  }, [kpis, freqDistribution]);

  // ─── Budget Optimization ────────────────────────────────────────────

  const optimizeForBudget = () => {
    const budget = parseFloat(budgetTarget);
    if (!budget || budget <= 0) return;

    // Sort publications by cost efficiency (lower CPM = better)
    const pubsByCpm = [...publications].sort((a, b) => a.cpm - b.cpm);
    const optimized: InsertionRow[] = [];
    let remainingBudget = budget;

    for (const pub of pubsByCpm) {
      const costPerInsertion = pub.cpm * pub.readership000;
      if (costPerInsertion > remainingBudget) continue;
      const maxInsertions = Math.floor(remainingBudget / costPerInsertion);
      if (maxInsertions > 0) {
        optimized.push({
          publication: pub.name,
          insertions: Math.min(maxInsertions, 6),
          period: pub.type.includes('Daily') ? 'Weekly' : pub.type.includes('Weekly') ? 'Weekly' : 'Monthly',
        });
        remainingBudget -= costPerInsertion * Math.min(maxInsertions, 6);
      }
      if (optimized.length >= 5) break;
    }
    setOptimizedRows(optimized);
  };

  const applyOptimizedRows = () => {
    if (optimizedRows) {
      setInsertionRows(optimizedRows);
      setOptimizedRows(null);
    }
  };

  // ─── Scenario Methods ───────────────────────────────────────────────

  const saveScenario = (): void => {
    if (!kpis || !scenarioName.trim()) return;
    const newScenario: PrintScenario = {
      id: Date.now().toString(),
      name: scenarioName.trim(),
      publications: [...selectedPublications],
      audience: selectedAudience,
      market: selectedMarket,
      insertionRows: [...insertionRows],
      includeDigital,
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

  // ─── Tab Config ─────────────────────────────────────────────────────

  const tabItems = useMemo(() => {
    const base: Array<{ id: string; label: string; icon: React.ReactNode; count?: number }> = [
      { id: 'plan', label: 'Plan', icon: <FileText size={15} /> },
    ];
    if (showResults) {
      base.push(
        { id: 'results', label: 'Results', icon: <BarChart3 size={15} /> },
        { id: 'duplication', label: 'Duplication', icon: <Grid3x3 size={15} /> },
        { id: 'profiling', label: 'Profiling', icon: <UserCircle size={15} /> },
        { id: 'scenarios', label: 'Scenarios', count: scenarios.length, icon: <GitCompare size={15} /> },
      );
    }
    return base;
  }, [showResults, scenarios.length]);

  // ─── Render ─────────────────────────────────────────────────────────

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

      <div className="printrf-tabs-bar">
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="printrf-content">
        {/* ────────── PLAN TAB ────────── */}
        {activeTab === 'plan' && (
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
                      {publications.map((pub: PublicationDef) => (
                        <label key={pub.name} className="printrf-dropdown-option">
                          <input type="checkbox" checked={selectedPublications.includes(pub.name)}
                            onChange={() => togglePublication(pub.name)} />
                          <div className="printrf-pub-info">
                            <span className="printrf-pub-name">{pub.name}</span>
                            <span className="printrf-pub-meta">{pub.type} &middot; Circ: {pub.circulation} &middot; CPM: ${pub.cpm}</span>
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
                        <button key={a}
                          className={`printrf-dropdown-item ${a === selectedAudience ? 'selected' : ''}`}
                          onClick={() => { setSelectedAudience(a); setAudienceOpen(false); }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Market */}
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
                        <button key={m}
                          className={`printrf-dropdown-item ${m === selectedMarket ? 'selected' : ''}`}
                          onClick={() => { setSelectedMarket(m); setMarketOpen(false); }}>
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Extension Toggle */}
              <div className="printrf-field printrf-field-full">
                <label className="printrf-label">
                  <Monitor size={16} />
                  Include Digital Editions
                </label>
                <div className="printrf-digital-toggle">
                  <button
                    className={`printrf-digital-switch ${includeDigital ? 'active' : ''}`}
                    onClick={() => setIncludeDigital(!includeDigital)}
                    role="switch"
                    aria-checked={includeDigital}
                  >
                    <span className="printrf-digital-switch-thumb" />
                  </button>
                  <span className="printrf-digital-label">{includeDigital ? 'Print + Digital' : 'Print Only'}</span>
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
                    <th>Est. Cost</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {insertionRows.map((row: InsertionRow, idx: number) => {
                    const pub = publications.find(p => p.name === row.publication);
                    const estCost = pub ? Math.round(pub.cpm * pub.readership000 * row.insertions) : 0;
                    return (
                      <tr key={idx}>
                        <td>
                          <select className="printrf-table-select" value={row.publication}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRow(idx, 'publication', e.target.value)}>
                            {publications.map((pub: PublicationDef) => (
                              <option key={pub.name} value={pub.name}>{pub.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <Input type="number" className="printrf-table-input" value={row.insertions}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRow(idx, 'insertions', e.target.value)}
                            min={1} />
                        </td>
                        <td>
                          <select className="printrf-table-select printrf-table-select-sm" value={row.period}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRow(idx, 'period', e.target.value)}>
                            {periods.map((p: string) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                        <td className="printrf-est-cost">{formatCurrency(estCost)}</td>
                        <td>
                          <Button variant="ghost" size="sm" className="printrf-remove-btn"
                            onClick={() => removeRow(idx)} disabled={insertionRows.length <= 1}
                            icon={<Trash2 size={14} />} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Button variant="ghost" size="sm" className="printrf-add-row-btn" onClick={addRow}
                icon={<Plus size={14} />}>
                Add row
              </Button>
            </div>

            {/* Budget Optimization */}
            <div className="printrf-budget-section">
              <h3 className="printrf-section-title">
                <DollarSign size={18} />
                Budget Optimization
              </h3>
              <div className="printrf-budget-row">
                <Input
                  type="number"
                  className="printrf-budget-input"
                  value={budgetTarget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudgetTarget(e.target.value)}
                  placeholder="Enter budget target ($)"
                  min={0}
                />
                <Button variant="ghost" size="sm" icon={<Zap size={14} />}
                  onClick={optimizeForBudget} disabled={!budgetTarget}>
                  Optimize for Budget
                </Button>
              </div>
              {optimizedRows && (
                <div className="printrf-optimized-preview">
                  <div className="printrf-optimized-header">
                    <span>Recommended schedule for ${parseInt(budgetTarget).toLocaleString()} budget:</span>
                    <Button variant="primary" size="sm" onClick={applyOptimizedRows}>Apply</Button>
                  </div>
                  <table className="printrf-data-table">
                    <thead>
                      <tr>
                        <th>Publication</th>
                        <th>Insertions</th>
                        <th>Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimizedRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="printrf-pub-name-cell">{row.publication}</td>
                          <td>{row.insertions}</td>
                          <td>{row.period}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="printrf-actions">
              <Button variant="primary" icon={<Play size={16} />} className="printrf-run-btn"
                onClick={runAnalysis} disabled={insertionRows.length === 0}>
                Run Analysis
              </Button>
              {showResults && kpis && (
                <Button variant="ghost" icon={<BookmarkPlus size={16} />} className="printrf-save-btn"
                  onClick={() => setShowSaveModal(true)}>
                  Save Scenario
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ────────── RESULTS TAB ────────── */}
        {activeTab === 'results' && showResults && kpis && (
          <div className="printrf-results-tab">
            {/* KPI Summary Cards */}
            <div className="printrf-kpi-grid">
              <div className="printrf-kpi-card printrf-kpi-primary">
                <div className="printrf-kpi-icon"><Target size={20} /></div>
                <div className="printrf-kpi-content">
                  <div className="printrf-kpi-label">Net Reach</div>
                  <div className="printrf-kpi-value">{formatNumber(kpis.netReach)}</div>
                  <div className="printrf-kpi-sub">{kpis.netReachPct}%</div>
                </div>
              </div>
              <div className="printrf-kpi-card">
                <div className="printrf-kpi-icon"><Layers size={20} /></div>
                <div className="printrf-kpi-content">
                  <div className="printrf-kpi-label">Gross Reach</div>
                  <div className="printrf-kpi-value">{formatNumber(kpis.grossReach)}</div>
                  <div className="printrf-kpi-sub">{kpis.grossReachPct}%</div>
                </div>
              </div>
              <div className="printrf-kpi-card">
                <div className="printrf-kpi-icon"><TrendingUp size={20} /></div>
                <div className="printrf-kpi-content">
                  <div className="printrf-kpi-label">Avg Frequency</div>
                  <div className="printrf-kpi-value">{kpis.avgFrequency}</div>
                </div>
              </div>
              <div className="printrf-kpi-card">
                <div className="printrf-kpi-icon"><Eye size={20} /></div>
                <div className="printrf-kpi-content">
                  <div className="printrf-kpi-label">OTS</div>
                  <div className="printrf-kpi-value">{formatNumber(kpis.ots)}</div>
                </div>
              </div>
              <div className="printrf-kpi-card">
                <div className="printrf-kpi-icon"><BarChart3 size={20} /></div>
                <div className="printrf-kpi-content">
                  <div className="printrf-kpi-label">Coverage Index</div>
                  <div className="printrf-kpi-value">{kpis.coverageIndex}</div>
                </div>
              </div>
              <div className="printrf-kpi-card">
                <div className="printrf-kpi-icon"><DollarSign size={20} /></div>
                <div className="printrf-kpi-content">
                  <div className="printrf-kpi-label">Total Cost</div>
                  <div className="printrf-kpi-value">{formatCurrency(kpis.totalCost)}</div>
                  <div className="printrf-kpi-sub">CPM: ${kpis.cpm}</div>
                </div>
              </div>
            </div>

            {/* Net vs Gross Reach Highlight */}
            <div className="printrf-reach-comparison">
              <h3 className="printrf-section-title">Net vs Gross Reach</h3>
              <div className="printrf-reach-bars">
                <div className="printrf-reach-bar-row">
                  <span className="printrf-reach-bar-label">Net (De-duplicated)</span>
                  <div className="printrf-reach-bar-track">
                    <div className="printrf-reach-bar-fill printrf-reach-bar-net"
                      style={{ width: `${Math.min(kpis.netReachPct, 100)}%` }}>
                      {kpis.netReachPct}%
                    </div>
                  </div>
                </div>
                <div className="printrf-reach-bar-row">
                  <span className="printrf-reach-bar-label">Gross (With overlap)</span>
                  <div className="printrf-reach-bar-track">
                    <div className="printrf-reach-bar-fill printrf-reach-bar-gross"
                      style={{ width: `${Math.min(kpis.grossReachPct / Math.max(kpis.grossReachPct, kpis.netReachPct) * 100, 100)}%` }}>
                      {kpis.grossReachPct}%
                    </div>
                  </div>
                </div>
                <div className="printrf-reach-difference">
                  Duplication factor: {(kpis.grossReachPct / Math.max(kpis.netReachPct, 0.1)).toFixed(1)}x
                  &mdash; {Math.round(kpis.grossReachPct - kpis.netReachPct)}pp overlap
                </div>
              </div>
            </div>

            {/* Frequency Distribution Histogram */}
            <div className="printrf-chart-section">
              <h3 className="printrf-section-title">
                <BarChart3 size={18} />
                Frequency Distribution
              </h3>
              {effectiveFreqData && (
                <div className="printrf-effective-freq-banner">
                  <Zap size={16} />
                  <span>
                    Effective frequency ({effectiveFreqData.threshold}+): <strong>{effectiveFreqData.effectivelyReachedPct}%</strong> of audience effectively reached,
                    <strong> {effectiveFreqData.underExposedPct}%</strong> under-exposed
                  </span>
                </div>
              )}
              <div className="printrf-chart-wrapper">
                <ChartRenderer
                  type={'bar' as ChartType}
                  data={freqChartData}
                  series={['Audience %']}
                  height={320}
                  showLegend={true}
                  showGrid={true}
                />
              </div>
            </div>

            {/* Digital Extension Results */}
            {includeDigital && digitalResults && (
              <div className="printrf-digital-results">
                <h3 className="printrf-section-title">
                  <Monitor size={18} />
                  Print + Digital Combined Results
                </h3>
                <div className="printrf-digital-grid">
                  <div className="printrf-digital-stat">
                    <div className="printrf-digital-stat-label">Print Only</div>
                    <div className="printrf-digital-stat-value">{digitalResults.printOnlyReachPct}%</div>
                  </div>
                  <div className="printrf-digital-stat">
                    <div className="printrf-digital-stat-label">Digital Only</div>
                    <div className="printrf-digital-stat-value">{digitalResults.digitalOnlyReachPct}%</div>
                  </div>
                  <div className="printrf-digital-stat">
                    <div className="printrf-digital-stat-label">Overlap</div>
                    <div className="printrf-digital-stat-value">{digitalResults.overlapPct}%</div>
                  </div>
                  <div className="printrf-digital-stat printrf-digital-stat-highlight">
                    <div className="printrf-digital-stat-label">Combined Reach</div>
                    <div className="printrf-digital-stat-value">{digitalResults.combinedReachPct}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Publication Contribution Table */}
            <div className="printrf-pub-contrib">
              <h3 className="printrf-section-title">Publication Contribution</h3>
              <table className="printrf-data-table">
                <thead>
                  <tr>
                    <th>Publication</th>
                    <th>Exclusive Reach %</th>
                    <th>Incremental Reach %</th>
                    <th>Affinity Index</th>
                    <th>Cost per Reach Point</th>
                  </tr>
                </thead>
                <tbody>
                  {pubContribs.map(c => (
                    <tr key={c.publication}>
                      <td className="printrf-pub-name-cell">{c.publication}</td>
                      <td>{c.exclusiveReachPct}%</td>
                      <td>{c.incrementalReach}%</td>
                      <td>
                        <span className="printrf-index-badge" style={{ backgroundColor: indexColor(c.affinityIndex) }}>
                          {c.affinityIndex}
                        </span>
                      </td>
                      <td>{formatCurrency(c.costPerReachPoint)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────── DUPLICATION TAB ────────── */}
        {activeTab === 'duplication' && showResults && (
          <div className="printrf-duplication-tab">
            <h3 className="printrf-section-title">
              <Grid3x3 size={18} />
              Reader Duplication Matrix
            </h3>
            <p className="printrf-section-desc">
              Percentage of reader overlap between each pair of publications. Higher values indicate greater reader duplication.
            </p>
            <div className="printrf-matrix-wrapper">
              <table className="printrf-matrix-table">
                <thead>
                  <tr>
                    <th></th>
                    {uniquePubNames.map(p => (
                      <th key={p} className="printrf-matrix-header">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniquePubNames.map(pubA => (
                    <tr key={pubA}>
                      <td className="printrf-matrix-row-header">{pubA}</td>
                      {uniquePubNames.map(pubB => {
                        const cell = duplicationMatrix.find(m => m.pubA === pubA && m.pubB === pubB);
                        const val = cell?.overlapPct ?? 0;
                        const isDiag = pubA === pubB;
                        return (
                          <td key={pubB}
                            className={`printrf-matrix-cell ${isDiag ? 'printrf-matrix-diag' : ''}`}
                            style={!isDiag ? { backgroundColor: heatmapColor(val, 30) } : undefined}
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

        {/* ────────── PROFILING TAB ────────── */}
        {activeTab === 'profiling' && showResults && (
          <div className="printrf-profiling-tab">
            <h3 className="printrf-section-title">
              <UserCircle size={18} />
              Publication Audience Profiles
            </h3>
            <p className="printrf-section-desc">
              Demographic composition of each publication's readership with affinity index relative to target audience ({selectedAudience}).
              Index values above 100 indicate over-representation; below 100 indicates under-representation.
            </p>

            {pubProfiles.map(profile => (
              <div key={profile.publication} className="printrf-profile-card">
                <div className="printrf-profile-header">
                  <h4 className="printrf-profile-name">{profile.publication}</h4>
                  <span className="printrf-profile-affinity" style={{ backgroundColor: indexColor(Math.round(profile.affinityWithTarget)) }}>
                    Affinity: {profile.affinityWithTarget}
                  </span>
                </div>
                <table className="printrf-data-table">
                  <thead>
                    <tr>
                      <th>Demographic</th>
                      <th>Composition %</th>
                      <th>Affinity Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.demographics.map(d => (
                      <tr key={d.attribute}>
                        <td className="printrf-pub-name-cell">{d.attribute}</td>
                        <td>{d.composition}%</td>
                        <td>
                          <span className="printrf-index-badge" style={{ backgroundColor: indexColor(d.index) }}>
                            {d.index}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* ────────── SCENARIOS TAB ────────── */}
        {activeTab === 'scenarios' && showResults && (
          <div className="printrf-scenarios-tab">
            <div className="printrf-scenarios-header">
              <h3 className="printrf-section-title">
                <GitCompare size={18} />
                Saved Scenarios
              </h3>
              <div className="printrf-scenarios-actions">
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
              <div className="printrf-empty-state">
                <BookmarkPlus size={48} />
                <p>No saved scenarios yet. Run an analysis and save it to start comparing configurations.</p>
              </div>
            ) : (
              <>
                <div className="printrf-scenario-list">
                  {scenarios.map(s => (
                    <div key={s.id} className={`printrf-scenario-card ${selectedScenarioIds.includes(s.id) ? 'selected' : ''}`}>
                      {compareMode && (
                        <input type="checkbox" checked={selectedScenarioIds.includes(s.id)}
                          onChange={() => toggleScenarioCompare(s.id)} />
                      )}
                      <div className="printrf-scenario-info">
                        <div className="printrf-scenario-name">{s.name}</div>
                        <div className="printrf-scenario-meta">
                          {s.publications.length} pubs | {s.audience} | {s.market}
                          {s.includeDigital && ' | +Digital'}
                        </div>
                        <div className="printrf-scenario-meta">
                          Created {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="printrf-scenario-kpis-mini">
                        <span>Net: {s.kpis.netReachPct}%</span>
                        <span>Freq: {s.kpis.avgFrequency}</span>
                        <span>Cost: {formatCurrency(s.kpis.totalCost)}</span>
                      </div>
                      <button className="printrf-scenario-remove" onClick={() => removeScenario(s.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {compareMode && selectedScenarioIds.length >= 2 && (
                  <div className="printrf-comparison-section">
                    <h4 className="printrf-section-subtitle">Side-by-Side Comparison</h4>
                    <table className="printrf-data-table printrf-comparison-table">
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
                          { label: 'Publications', key: 'publications' },
                          { label: 'Universe', key: 'universe' },
                          { label: 'Net Reach', key: 'netReach' },
                          { label: 'Net Reach %', key: 'netReachPct' },
                          { label: 'Gross Reach %', key: 'grossReachPct' },
                          { label: 'Avg Frequency', key: 'avgFrequency' },
                          { label: 'OTS', key: 'ots' },
                          { label: 'Coverage Index', key: 'coverageIndex' },
                          { label: 'Total Cost', key: 'totalCost' },
                          { label: 'CPM', key: 'cpm' },
                          { label: 'Digital Included', key: 'includeDigital' },
                        ].map(metric => (
                          <tr key={metric.key}>
                            <td className="printrf-pub-name-cell">{metric.label}</td>
                            {selectedScenarioIds.map(id => {
                              const sc = scenarios.find(s => s.id === id);
                              if (!sc) return <td key={id}>-</td>;
                              let val: string;
                              switch (metric.key) {
                                case 'publications': val = sc.publications.join(', '); break;
                                case 'universe': val = formatNumber(sc.kpis.universe); break;
                                case 'netReach': val = formatNumber(sc.kpis.netReach); break;
                                case 'netReachPct': val = `${sc.kpis.netReachPct}%`; break;
                                case 'grossReachPct': val = `${sc.kpis.grossReachPct}%`; break;
                                case 'avgFrequency': val = `${sc.kpis.avgFrequency}`; break;
                                case 'ots': val = formatNumber(sc.kpis.ots); break;
                                case 'coverageIndex': val = `${sc.kpis.coverageIndex}`; break;
                                case 'totalCost': val = formatCurrency(sc.kpis.totalCost); break;
                                case 'cpm': val = `$${sc.kpis.cpm}`; break;
                                case 'includeDigital': val = sc.includeDigital ? 'Yes' : 'No'; break;
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
          <div className="printrf-modal-footer">
            <Button variant="ghost" onClick={() => setShowSaveModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveScenario} disabled={!scenarioName.trim()}>Save</Button>
          </div>
        }>
        <div className="printrf-modal-body">
          <label className="printrf-label">Scenario Name</label>
          <Input
            value={scenarioName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScenarioName(e.target.value)}
            placeholder="e.g. High coverage print plan"
            autoFocus
          />
          {kpis && (
            <div className="printrf-modal-preview">
              <div className="printrf-modal-preview-row">
                <span>Publications:</span>
                <span>{uniquePubNames.join(', ')}</span>
              </div>
              <div className="printrf-modal-preview-row">
                <span>Net Reach:</span>
                <span>{kpis.netReachPct}%</span>
              </div>
              <div className="printrf-modal-preview-row">
                <span>Avg Frequency:</span>
                <span>{kpis.avgFrequency}</span>
              </div>
              <div className="printrf-modal-preview-row">
                <span>Total Cost:</span>
                <span>{formatCurrency(kpis.totalCost)}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
