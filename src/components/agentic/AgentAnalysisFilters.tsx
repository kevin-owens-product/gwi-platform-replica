import { ChevronDown, TrendingUp, Layers, Scale, GitCompareArrows, X, Calendar } from 'lucide-react'
import { Dropdown } from '@/components/shared'
import type { AgentAnalysisConfig, AgentTimeframe, AgentGranularity, AgentRebaseMode } from '@/api/types'
import './AgentAnalysisFilters.css'

const timeframeOptions = [
  { label: 'None', value: 'none' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
]

const granularityOptions = [
  { label: 'None', value: 'none' },
  { label: 'Dataset level', value: 'dataset' },
  { label: 'Question level', value: 'question' },
  { label: 'Datapoint level', value: 'datapoint' },
]

const rebaseOptions = [
  { label: 'None', value: 'none' },
  { label: 'Column %', value: 'column' },
  { label: 'Row %', value: 'row' },
  { label: 'Total %', value: 'total' },
  { label: 'Respondent base', value: 'respondent_base' },
]

const AVAILABLE_WAVES = [
  { id: 'wave_2024q4', label: 'Q4 2024' },
  { id: 'wave_2024q3', label: 'Q3 2024' },
  { id: 'wave_2024q2', label: 'Q2 2024' },
  { id: 'wave_usa_2024', label: 'USA 2024' },
  { id: 'wave_biz_2024q4', label: 'B2B Q4 2024' },
  { id: 'wave_zeitgeist_dec', label: 'Zeitgeist Dec 2024' },
]

interface AgentAnalysisFiltersProps {
  config: AgentAnalysisConfig
  onTimeframeChange: (value: AgentTimeframe | undefined) => void
  onGranularityChange: (value: AgentGranularity | undefined) => void
  onRebaseModeChange: (value: AgentRebaseMode | undefined) => void
  onAddWave: (waveId: string) => void
  onRemoveWave: (waveId: string) => void
  onCompareWavesChange: (value: boolean) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export default function AgentAnalysisFilters({
  config,
  onTimeframeChange,
  onGranularityChange,
  onRebaseModeChange,
  onAddWave,
  onRemoveWave,
  onCompareWavesChange,
  onReset,
  hasActiveFilters,
}: AgentAnalysisFiltersProps) {
  const handleTimeframeSelect = (value: string) => {
    onTimeframeChange(value === 'none' ? undefined : (value as AgentTimeframe))
  }

  const handleGranularitySelect = (value: string) => {
    onGranularityChange(value === 'none' ? undefined : (value as AgentGranularity))
  }

  const handleRebaseSelect = (value: string) => {
    onRebaseModeChange(value === 'none' ? undefined : (value as AgentRebaseMode))
  }

  const selectedWaveIds = config.wave_ids ?? []
  const availableToAdd = AVAILABLE_WAVES.filter((w) => !selectedWaveIds.includes(w.id))

  const waveDropdownItems = availableToAdd.map((w) => ({ label: w.label, value: w.id }))

  return (
    <div className="agent-filters" data-testid="agent-analysis-filters">
      <div className="agent-filters__header">
        <span className="agent-filters__title">Analysis Filters</span>
        {hasActiveFilters && (
          <button
            className="agent-filters__reset"
            onClick={onReset}
            title="Reset all filters"
            data-testid="agent-filters-reset"
          >
            Reset
          </button>
        )}
      </div>
      <div className="agent-filters__subtitle">
        Configure timeframe, granularity, and rebasing for your analysis.
      </div>

      <div className="agent-filters__controls">
        {/* Timeframe */}
        <div className="agent-filters__control" data-testid="agent-filter-timeframe">
          <span className="agent-filters__control-label">
            <TrendingUp size={12} />
            Timeframe
          </span>
          <Dropdown
            trigger={
              <button className="agent-filters__control-select">
                {timeframeOptions.find((t) => t.value === (config.timeframe ?? 'none'))?.label ?? 'None'}
                <ChevronDown size={12} />
              </button>
            }
            items={timeframeOptions}
            onSelect={handleTimeframeSelect}
          />
        </div>

        {/* Granularity */}
        <div className="agent-filters__control" data-testid="agent-filter-granularity">
          <span className="agent-filters__control-label">
            <Layers size={12} />
            Granularity
          </span>
          <Dropdown
            trigger={
              <button className="agent-filters__control-select">
                {granularityOptions.find((g) => g.value === (config.granularity ?? 'none'))?.label ?? 'None'}
                <ChevronDown size={12} />
              </button>
            }
            items={granularityOptions}
            onSelect={handleGranularitySelect}
          />
        </div>

        {/* Rebase */}
        <div className="agent-filters__control" data-testid="agent-filter-rebase">
          <span className="agent-filters__control-label">
            <Scale size={12} />
            Rebase
          </span>
          <Dropdown
            trigger={
              <button className="agent-filters__control-select">
                {rebaseOptions.find((r) => r.value === (config.rebase_mode ?? 'none'))?.label ?? 'None'}
                <ChevronDown size={12} />
              </button>
            }
            items={rebaseOptions}
            onSelect={handleRebaseSelect}
          />
        </div>

        {/* Wave Selection */}
        <div className="agent-filters__control agent-filters__control--vertical" data-testid="agent-filter-waves">
          <span className="agent-filters__control-label">
            <Calendar size={12} />
            Waves
          </span>
          <div className="agent-filters__wave-pills">
            {selectedWaveIds.length === 0 && (
              <span className="agent-filters__wave-empty">No waves selected</span>
            )}
            {selectedWaveIds.map((waveId) => {
              const wave = AVAILABLE_WAVES.find((w) => w.id === waveId)
              return (
                <span key={waveId} className="agent-filters__wave-pill">
                  {wave?.label ?? waveId}
                  <button
                    className="agent-filters__wave-remove"
                    onClick={() => onRemoveWave(waveId)}
                    aria-label={`Remove ${wave?.label ?? waveId}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              )
            })}
            {availableToAdd.length > 0 && (
              <Dropdown
                trigger={
                  <button className="agent-filters__wave-add">+ Add wave</button>
                }
                items={waveDropdownItems}
                onSelect={(waveId) => onAddWave(waveId)}
              />
            )}
          </div>
        </div>

        {/* Compare Waves Toggle */}
        {selectedWaveIds.length > 1 && (
          <div className="agent-filters__control" data-testid="agent-filter-compare-waves">
            <span className="agent-filters__control-label">
              <GitCompareArrows size={12} />
              Compare waves
            </span>
            <label className="agent-filters__toggle">
              <input
                type="checkbox"
                checked={config.compare_waves ?? false}
                onChange={(e) => onCompareWavesChange(e.target.checked)}
              />
              <span className="agent-filters__toggle-label">
                {config.compare_waves ? 'On' : 'Off'}
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
