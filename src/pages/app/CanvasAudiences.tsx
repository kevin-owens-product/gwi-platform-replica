import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ArrowLeft, ArrowRight, Plus, Check, Loader2, Globe, Clock,
  Layers, Eye, Lightbulb, Target, CheckCircle2, Sparkles,
  BarChart2, Grid3X3, TrendingUp, Table2,
} from 'lucide-react';
import { useAudiences } from '@/hooks/useAudiences';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button, SearchInput, EmptyState } from '@/components/shared';
import { formatCompactNumber } from '@/utils/format';
import type { Audience } from '@/api/types';
import toast from 'react-hot-toast';
import './Canvas.css';

// Fallback audiences used when the API returns no data
const fallbackAudiences = [
  { id: 'fallback-1', name: 'Gen Z (18-24)', population_size: 245000000, description: 'Digital natives, social-first generation' },
  { id: 'fallback-2', name: 'Millennials (25-34)', population_size: 312000000, description: 'Experience-driven, brand-conscious consumers' },
  { id: 'fallback-3', name: 'Gen X (35-44)', population_size: 298000000, description: 'Established professionals with spending power' },
  { id: 'fallback-4', name: 'Heavy Social Media Users', population_size: 156000000, description: '3+ hours daily on social platforms' },
  { id: 'fallback-5', name: 'Online Shoppers', population_size: 428000000, description: 'Made 5+ online purchases in past month' },
  { id: 'fallback-6', name: 'Health-Conscious Consumers', population_size: 189000000, description: 'Prioritize wellness in purchase decisions' },
];

// Available markets for step 2 (markets)
const availableMarkets = [
  { id: 'us', name: 'United States', region: 'North America' },
  { id: 'uk', name: 'United Kingdom', region: 'Europe' },
  { id: 'de', name: 'Germany', region: 'Europe' },
  { id: 'fr', name: 'France', region: 'Europe' },
  { id: 'jp', name: 'Japan', region: 'Asia Pacific' },
  { id: 'au', name: 'Australia', region: 'Asia Pacific' },
  { id: 'br', name: 'Brazil', region: 'Latin America' },
  { id: 'in', name: 'India', region: 'Asia Pacific' },
  { id: 'cn', name: 'China', region: 'Asia Pacific' },
  { id: 'mx', name: 'Mexico', region: 'Latin America' },
];

// Available waves for step 4 (time_period)
const availableWaves = [
  { id: 'q4-2025', label: 'Q4 2025', study_id: 'gwi-core' },
  { id: 'q3-2025', label: 'Q3 2025', study_id: 'gwi-core' },
  { id: 'q2-2025', label: 'Q2 2025', study_id: 'gwi-core' },
  { id: 'q1-2025', label: 'Q1 2025', study_id: 'gwi-core' },
  { id: 'q4-2024', label: 'Q4 2024', study_id: 'gwi-core' },
  { id: 'q3-2024', label: 'Q3 2024', study_id: 'gwi-core' },
];

// Analysis framework options
const chartTypeOptions = [
  { id: 'bar', label: 'Bar Chart', icon: <BarChart2 size={16} /> },
  { id: 'stacked_bar', label: 'Stacked Bar', icon: <BarChart2 size={16} /> },
  { id: 'line', label: 'Line Chart', icon: <TrendingUp size={16} /> },
  { id: 'pie', label: 'Pie Chart', icon: <Target size={16} /> },
  { id: 'crosstab', label: 'Crosstab', icon: <Grid3X3 size={16} /> },
  { id: 'table', label: 'Data Table', icon: <Table2 size={16} /> },
];

// 7-step wizard config
const STEP_META: Array<{ type: string; label: string; desc: string; icon: React.ComponentType<{ size?: number }> }> = [
  { type: 'objectives', label: 'Objectives', desc: 'Define goals', icon: Target },
  { type: 'markets', label: 'Markets', desc: 'Select regions', icon: Globe },
  { type: 'audiences', label: 'Audiences', desc: 'Target groups', icon: Users },
  { type: 'time_period', label: 'Time Period', desc: 'Select waves', icon: Clock },
  { type: 'analysis_framework', label: 'Framework', desc: 'Configure analysis', icon: Layers },
  { type: 'review', label: 'Review', desc: 'Confirm setup', icon: Eye },
  { type: 'results', label: 'Results', desc: 'View insights', icon: Lightbulb },
];

export default function CanvasAudiences(): React.JSX.Element {
  const navigate = useNavigate();
  const canvasWorkflow = useWorkspaceStore((state) => state.canvasWorkflow);
  const setCanvasStep = useWorkspaceStore((state) => state.setCanvasStep);
  const completeCanvasStep = useWorkspaceStore((state) => state.completeCanvasStep);
  const canvasMarkets = useWorkspaceStore((state) => state.canvasWorkflow.selectedMarkets);
  const setCanvasMarkets = useWorkspaceStore((state) => state.setCanvasMarkets);

  // Step tracking - starts at step 2 (audiences) when coming from Canvas
  const [currentSubStep, setCurrentSubStep] = useState(2); // 0=obj, 1=markets, 2=audiences, 3=time, 4=framework, 5=review, 6=results

  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Markets state
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(canvasMarkets);

  // Time period state
  const [selectedWaves, setSelectedWaves] = useState<string[]>(['q4-2025']);
  const [trendingEnabled, setTrendingEnabled] = useState(false);

  // Framework state
  const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>(['bar', 'line']);
  const [benchmarkEnabled, setBenchmarkEnabled] = useState(false);
  const [statTestEnabled, setStatTestEnabled] = useState(false);

  // Review state
  const [reviewerNotes, setReviewerNotes] = useState('');

  const { data: audiencesData, isLoading, isError } = useAudiences({ search: searchQuery || undefined });

  const apiAudiences = audiencesData?.data ?? [];
  const hasApiData = apiAudiences.length > 0;

  const displayAudiences = useMemo(() => {
    if (hasApiData) {
      return apiAudiences.map((a: Audience) => ({
        id: a.id,
        name: a.name,
        population_size: a.population_size ?? 0,
        description: a.description ?? '',
      }));
    }
    if (searchQuery) {
      return fallbackAudiences.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return fallbackAudiences;
  }, [apiAudiences, hasApiData, searchQuery]);

  const toggleAudience = (id: string): void => {
    setSelectedAudiences((prev: string[]) =>
      prev.includes(id) ? prev.filter((a: string) => a !== id) : [...prev, id]
    );
  };

  const toggleMarket = (id: string): void => {
    const next = selectedMarkets.includes(id)
      ? selectedMarkets.filter((m) => m !== id)
      : [...selectedMarkets, id];
    setSelectedMarkets(next);
    setCanvasMarkets(next);
  };

  const toggleWave = (id: string): void => {
    setSelectedWaves((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const toggleChartType = (id: string): void => {
    setSelectedChartTypes((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    completeCanvasStep(currentSubStep);
    if (currentSubStep < 6) {
      setCurrentSubStep(currentSubStep + 1);
      setCanvasStep(currentSubStep + 1);
    }
  };

  const handleBack = () => {
    if (currentSubStep > 1) {
      setCurrentSubStep(currentSubStep - 1);
      setCanvasStep(currentSubStep - 1);
    } else {
      navigate('/app/canvas');
    }
  };

  const handleGenerate = (): void => {
    setGenerating(true);
    toast.success('Generating insights for selected audiences...');
    completeCanvasStep(currentSubStep);
    setTimeout(() => {
      setGenerating(false);
      setCurrentSubStep(6);
      setCanvasStep(6);
    }, 2000);
  };

  const canContinue = (): boolean => {
    switch (currentSubStep) {
      case 1: return selectedMarkets.length > 0;
      case 2: return selectedAudiences.length > 0;
      case 3: return selectedWaves.length > 0;
      case 4: return selectedChartTypes.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  // Group markets by region
  const marketsByRegion = useMemo(() => {
    const grouped: Record<string, typeof availableMarkets> = {};
    for (const m of availableMarkets) {
      if (!grouped[m.region]) grouped[m.region] = [];
      grouped[m.region].push(m);
    }
    return grouped;
  }, []);

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <h1 className="page-title">Canvas</h1>
        <p className="page-subtitle">Define your research objectives and target audiences</p>
      </div>

      {/* 7-Step Wizard */}
      <div className="canvas-steps">
        {STEP_META.map((step, idx) => {
          const isCompleted = canvasWorkflow.completedSteps.includes(idx);
          const isActive = idx === currentSubStep;
          const StepIcon = step.icon;
          return (
            <React.Fragment key={step.type}>
              {idx > 0 && <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />}
              <button
                className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (isCompleted || idx <= currentSubStep) {
                    setCurrentSubStep(idx);
                    setCanvasStep(idx);
                  }
                }}
                disabled={!isCompleted && idx > currentSubStep}
                style={{
                  cursor: isCompleted || idx <= currentSubStep ? 'pointer' : 'not-allowed',
                  opacity: !isCompleted && idx > currentSubStep ? 0.5 : 1,
                  minWidth: 0,
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                }}
              >
                <div className="step-number">
                  {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
                <div className="step-info">
                  <h3 style={{ fontSize: 'var(--font-size-body-sm)' }}>{step.label}</h3>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div className="canvas-content">
        {/* Step 1: Markets */}
        {currentSubStep === 1 && (
          <div className="audiences-section">
            <h2>Select your target markets</h2>
            <p>Choose the regions you want to analyze ({selectedMarkets.length} selected)</p>

            {Object.entries(marketsByRegion).map(([region, markets]) => (
              <div key={region} style={{ marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{region}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                  {markets.map((m) => (
                    <button
                      key={m.id}
                      className={`canvas-market-chip ${selectedMarkets.includes(m.id) ? 'selected' : ''}`}
                      onClick={() => toggleMarket(m.id)}
                    >
                      {selectedMarkets.includes(m.id) && <Check size={12} />}
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="canvas-actions" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={handleBack}>
                Back
              </Button>
              <Button variant="primary" iconRight={<ArrowRight size={18} />} disabled={!canContinue()} onClick={handleNext}>
                Continue to Audiences
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Audiences */}
        {currentSubStep === 2 && (
          <div className="audiences-section">
            <h2>Select your target audiences</h2>
            <p>Choose the audiences you want to analyze ({selectedAudiences.length} selected)</p>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search audiences..."
              />
            </div>

            {isLoading ? (
              <div className="dashboards-empty">
                <Loader2 size={32} className="spin" />
                <p>Loading audiences...</p>
              </div>
            ) : isError && !hasApiData ? (
              <AudienceList
                audiences={fallbackAudiences}
                selectedAudiences={selectedAudiences}
                onToggle={toggleAudience}
              />
            ) : displayAudiences.length === 0 ? (
              <EmptyState
                icon={<Users size={40} />}
                title="No audiences found"
                description={searchQuery ? 'No audiences match your search' : 'Create a custom audience to get started'}
              />
            ) : (
              <AudienceList
                audiences={displayAudiences}
                selectedAudiences={selectedAudiences}
                onToggle={toggleAudience}
              />
            )}

            <Button variant="ghost" icon={<Plus size={16} />} className="add-custom-btn">
              Create custom audience
            </Button>

            <div className="canvas-actions" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={handleBack}>
                Back to Markets
              </Button>
              <Button variant="primary" iconRight={<ArrowRight size={18} />} disabled={!canContinue()} onClick={handleNext}>
                Continue to Time Period
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Time Period */}
        {currentSubStep === 3 && (
          <div className="audiences-section">
            <h2>Select time period</h2>
            <p>Choose the waves you want to include ({selectedWaves.length} selected)</p>

            <div className="canvas-waves-grid">
              {availableWaves.map((w) => (
                <button
                  key={w.id}
                  className={`canvas-wave-card ${selectedWaves.includes(w.id) ? 'selected' : ''}`}
                  onClick={() => toggleWave(w.id)}
                >
                  <Clock size={16} />
                  <span>{w.label}</span>
                  {selectedWaves.includes(w.id) && <Check size={14} className="canvas-wave-check" />}
                </button>
              ))}
            </div>

            <label className="canvas-toggle-row">
              <input type="checkbox" checked={trendingEnabled} onChange={(e) => setTrendingEnabled(e.target.checked)} />
              <span>Enable trending analysis (compare across waves)</span>
            </label>

            <div className="canvas-actions" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={handleBack}>
                Back to Audiences
              </Button>
              <Button variant="primary" iconRight={<ArrowRight size={18} />} disabled={!canContinue()} onClick={handleNext}>
                Continue to Framework
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Analysis Framework */}
        {currentSubStep === 4 && (
          <div className="audiences-section">
            <h2>Configure analysis framework</h2>
            <p>Choose chart types and analysis options</p>

            <h3 style={{ fontSize: 'var(--font-size-body)', marginBottom: 'var(--spacing-sm)' }}>Chart Types</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
              {chartTypeOptions.map((ct) => (
                <button
                  key={ct.id}
                  className={`canvas-chart-type-btn ${selectedChartTypes.includes(ct.id) ? 'selected' : ''}`}
                  onClick={() => toggleChartType(ct.id)}
                >
                  {ct.icon}
                  <span>{ct.label}</span>
                  {selectedChartTypes.includes(ct.id) && <Check size={12} />}
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 'var(--font-size-body)', marginBottom: 'var(--spacing-sm)' }}>Analysis Options</h3>
            <label className="canvas-toggle-row">
              <input type="checkbox" checked={benchmarkEnabled} onChange={(e) => setBenchmarkEnabled(e.target.checked)} />
              <span>Enable benchmarking (compare against population averages)</span>
            </label>
            <label className="canvas-toggle-row">
              <input type="checkbox" checked={statTestEnabled} onChange={(e) => setStatTestEnabled(e.target.checked)} />
              <span>Enable statistical significance testing</span>
            </label>

            <div className="canvas-actions" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={handleBack}>
                Back to Time Period
              </Button>
              <Button variant="primary" iconRight={<ArrowRight size={18} />} disabled={!canContinue()} onClick={handleNext}>
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentSubStep === 5 && (
          <div className="audiences-section">
            <h2>Review your research setup</h2>
            <p>Confirm your configuration before generating insights</p>

            <div className="canvas-review-summary">
              <div className="canvas-review-item">
                <h4><Globe size={14} /> Markets</h4>
                <p>{selectedMarkets.length > 0 ? selectedMarkets.map((m) => availableMarkets.find((am) => am.id === m)?.name).join(', ') : 'None selected'}</p>
              </div>
              <div className="canvas-review-item">
                <h4><Users size={14} /> Audiences</h4>
                <p>{selectedAudiences.length} audience{selectedAudiences.length !== 1 ? 's' : ''} selected</p>
              </div>
              <div className="canvas-review-item">
                <h4><Clock size={14} /> Time Period</h4>
                <p>{selectedWaves.map((w) => availableWaves.find((aw) => aw.id === w)?.label).join(', ')}{trendingEnabled ? ' (trending)' : ''}</p>
              </div>
              <div className="canvas-review-item">
                <h4><Layers size={14} /> Framework</h4>
                <p>{selectedChartTypes.length} chart type{selectedChartTypes.length !== 1 ? 's' : ''}{benchmarkEnabled ? ', benchmarking' : ''}{statTestEnabled ? ', stat testing' : ''}</p>
              </div>
            </div>

            <div className="canvas-field-group">
              <label className="canvas-field-label">Reviewer Notes (optional)</label>
              <textarea
                className="canvas-field-input"
                rows={3}
                placeholder="Add any notes for reviewers..."
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
              />
            </div>

            <div className="canvas-actions" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={handleBack}>
                Back to Framework
              </Button>
              <Button
                variant="primary"
                disabled={generating}
                loading={generating}
                onClick={handleGenerate}
              >
                <Sparkles size={16} />
                {generating ? 'Generating...' : 'Generate Insights'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Results */}
        {currentSubStep === 6 && (
          <div className="audiences-section">
            <h2>Research Results</h2>
            <p>Your insights have been generated</p>

            <div className="canvas-results-summary">
              <div className="canvas-result-card">
                <BarChart2 size={24} />
                <div>
                  <h4>{selectedChartTypes.length * selectedAudiences.length || 6} Charts Generated</h4>
                  <p>Based on your selected chart types and audiences</p>
                </div>
              </div>
              <div className="canvas-result-card">
                <Grid3X3 size={24} />
                <div>
                  <h4>{Math.max(2, selectedAudiences.length)} Crosstabs Created</h4>
                  <p>Detailed breakdowns of your research questions</p>
                </div>
              </div>
              <div className="canvas-result-card">
                <Lightbulb size={24} />
                <div>
                  <h4>Key Findings</h4>
                  <p>AI-generated executive summary available</p>
                </div>
              </div>
            </div>

            <div className="canvas-actions" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" onClick={() => navigate('/app/canvas')}>
                Start New Research
              </Button>
              <Button variant="primary" onClick={() => navigate('/app/dashboards')}>
                View Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-component for the audience list ---

interface AudienceDisplayItem {
  id: string;
  name: string;
  population_size: number;
  description: string;
}

interface AudienceListProps {
  audiences: AudienceDisplayItem[];
  selectedAudiences: string[];
  onToggle: (id: string) => void;
}

function AudienceList({ audiences, selectedAudiences, onToggle }: AudienceListProps): React.JSX.Element {
  return (
    <div className="audiences-list">
      {audiences.map((audience) => {
        const isSelected: boolean = selectedAudiences.includes(audience.id);
        return (
          <button
            key={audience.id}
            className={`audience-option ${isSelected ? 'selected' : ''}`}
            onClick={() => onToggle(audience.id)}
          >
            <div className="audience-checkbox">
              {isSelected && <Check size={14} />}
            </div>
            <div className="audience-info">
              <span className="audience-name">{audience.name}</span>
              <span className="audience-size">
                {audience.population_size > 0 ? `${formatCompactNumber(audience.population_size)} people` : ''}{audience.population_size > 0 && audience.description ? ' \u00B7 ' : ''}{audience.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
