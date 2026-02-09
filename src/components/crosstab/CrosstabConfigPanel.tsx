import { useState } from 'react'
import { Plus, ChevronDown, FlaskConical, Scale, Layers, BarChart3, TrendingUp } from 'lucide-react'
import { Dropdown } from '@/components/shared'
import ConfigPill from './ConfigPill'
import type { CrosstabConfig, CrosstabDimension, MetricType, WaveId, Question, Audience, Wave, Study } from '@/api/types'
import './CrosstabConfigPanel.css'

const metricLabels: Record<string, string> = {
  audience_percentage: '%',
  audience_index: 'Idx',
  audience_size: 'Size',
  positive_size: 'Sample',
  column_percentage: 'Col%',
  row_percentage: 'Row%',
  total_percentage: 'Tot%',
  mean: 'Mean',
  median: 'Median',
  effective_base: 'Eff. Base',
  weighted_base: 'Wtd Base',
}

const allMetrics: MetricType[] = [
  'audience_percentage', 'audience_index', 'audience_size', 'positive_size',
  'column_percentage', 'row_percentage', 'mean', 'median',
  'effective_base', 'weighted_base',
]

const highlightOptions = [
  { label: 'None', value: 'none' },
  { label: 'Heatmap', value: 'heatmap' },
  { label: 'Index coloring', value: 'index' },
  { label: 'Significance', value: 'significance' },
  { label: 'Threshold', value: 'threshold' },
]

const statTestOptions = [
  { label: 'None', value: 'none' },
  { label: 'Z-test', value: 'z_test' },
  { label: 'Z-test (Bonferroni)', value: 'z_test_bonferroni' },
  { label: 'Chi-square', value: 'chi_square' },
  { label: 'T-test', value: 't_test' },
]

const confidenceLevelOptions = [
  { label: '90%', value: '90' },
  { label: '95%', value: '95' },
  { label: '99%', value: '99' },
]

const waveComparisonOptions = [
  { label: 'Single wave', value: 'single_wave' },
  { label: 'Side by side', value: 'side_by_side' },
  { label: 'Trended', value: 'trended' },
]

const suppressionOptions = [
  { label: 'Off', value: 'off' },
  { label: 'Hide cells', value: 'hide' },
  { label: 'Grey out', value: 'grey_out' },
  { label: 'Asterisk (*)', value: 'asterisk' },
  { label: 'Warning icon', value: 'warning_icon' },
]

const rebaseOptions = [
  { label: 'Column %', value: 'column' },
  { label: 'Row %', value: 'row' },
  { label: 'Total %', value: 'total' },
  { label: 'Respondent base', value: 'respondent_base' },
]

const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'By value', value: 'value' },
  { label: 'A-Z', value: 'alphabetical' },
  { label: 'Custom', value: 'custom' },
  { label: 'Significance', value: 'significance' },
]

const timeframeOptions = [
  { label: 'None', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

interface CrosstabConfigPanelProps {
  config: CrosstabConfig
  questions?: Question[]
  audiences?: Audience[]
  waves?: Wave[]
  studies?: Study[]
  highlightMode: string
  timeframe: string
  onRemoveRow: (index: number) => void
  onRemoveColumn: (index: number) => void
  onToggleMetric: (metric: MetricType) => void
  onRemoveWave: (index: number) => void
  onHighlightChange: (mode: string) => void
  onTimeframeChange: (value: string) => void
  onOpenRowPicker: () => void
  onOpenColumnPicker: () => void
  onOpenBasePicker: () => void
  onOpenDataSetPicker: () => void
  onOpenWavePicker: () => void
  onStatTestChange?: (testType: string) => void
  onConfidenceLevelChange?: (level: number) => void
  onSuppressionChange?: (action: string) => void
  onSuppressionThresholdChange?: (threshold: number) => void
  onWaveComparisonChange?: (mode: string) => void
  onRebaseChange?: (base: string) => void
  onSortChange?: (sort: string) => void
  onWeightingChange?: (schemeId: string) => void
  onCreateNet?: () => void
}

function dimLabel(dim: CrosstabDimension, questions?: Question[], audiences?: Audience[]): string {
  if (dim.type === 'question' && dim.question_id) {
    const q = questions?.find((q) => q.id === dim.question_id)
    return q?.name ?? dim.question_id
  }
  if (dim.type === 'audience' && dim.audience_id) {
    const a = audiences?.find((a) => a.id === dim.audience_id)
    return a?.name ?? dim.audience_id
  }
  if (dim.type === 'net') {
    return dim.label ?? 'NET'
  }
  if (dim.type === 'calculated') {
    return dim.label ?? 'Calculated'
  }
  if (dim.type === 'wave') {
    return dim.label ?? 'Wave'
  }
  if (dim.type === 'location') {
    return dim.label ?? 'Location'
  }
  return dim.label ?? 'Unknown'
}

function dimTypeIcon(dim: CrosstabDimension): string {
  switch (dim.type) {
    case 'net': return 'NET'
    case 'calculated': return 'Calc'
    case 'wave': return 'W'
    case 'location': return 'L'
    default: return ''
  }
}

function waveLabel(waveId: WaveId, waves?: Wave[]): string {
  const w = waves?.find((w) => w.id === waveId.wave_id)
  return w ? w.name : waveId.wave_id
}

function studyLabel(config: CrosstabConfig, waves?: Wave[], studies?: Study[]): string {
  if (config.wave_ids.length === 0) return 'None'
  const firstWave = waves?.find((w) => w.id === config.wave_ids[0].wave_id)
  if (firstWave) {
    const study = studies?.find((s) => s.id === firstWave.study_id)
    return study ? `${study.name} · ${firstWave.name}` : firstWave.name
  }
  return config.wave_ids[0].study_id
}

function basePillLabel(config: CrosstabConfig, questions?: Question[]): string {
  if (!config.base_audience) return 'All Adults'
  const expr = config.base_audience as unknown as Record<string, unknown>
  if ('question' in expr && typeof expr.question === 'object' && expr.question !== null) {
    const qExpr = expr.question as { question_id: string; datapoint_ids: string[] }
    const q = questions?.find((q) => q.id === qExpr.question_id)
    return q?.name ?? qExpr.question_id
  }
  return 'Custom filter'
}

function basePillSublabel(config: CrosstabConfig): string | undefined {
  if (!config.base_audience) return undefined
  const expr = config.base_audience as unknown as Record<string, unknown>
  if ('question' in expr && typeof expr.question === 'object' && expr.question !== null) {
    const qExpr = expr.question as { question_id: string; datapoint_ids: string[] }
    const dpCount = qExpr.datapoint_ids.length
    return `(${dpCount} datapoint${dpCount !== 1 ? 's' : ''})`
  }
  return undefined
}

export default function CrosstabConfigPanel({
  config,
  questions,
  audiences,
  waves,
  studies,
  highlightMode,
  timeframe,
  onRemoveRow,
  onRemoveColumn,
  onToggleMetric,
  onRemoveWave,
  onHighlightChange,
  onTimeframeChange,
  onOpenRowPicker,
  onOpenColumnPicker,
  onOpenBasePicker,
  onOpenDataSetPicker,
  onOpenWavePicker,
  onStatTestChange,
  onConfidenceLevelChange,
  onSuppressionChange,
  onSuppressionThresholdChange,
  onWaveComparisonChange,
  onRebaseChange,
  onSortChange,
  onCreateNet,
}: CrosstabConfigPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const currentStatTest = config.stat_test?.test_type ?? 'none'
  const currentConfidence = config.stat_test?.confidence_levels?.primary ?? 95
  const currentSuppression = config.suppression?.enabled ? (config.suppression.suppression_action ?? 'asterisk') : 'off'
  const currentSuppressionThreshold = config.suppression?.minimum_base_size ?? 30
  const currentWaveComparison = config.wave_comparison?.mode ?? 'single_wave'
  const currentRebase = config.rebasing?.percentage_base ?? 'column'
  const currentSort = config.sort?.sort_by ?? 'default'

  return (
    <div className="crosstab-config-panel">
      {/* Row 1: Pill-based dimensions */}
      <div className="config-panel__dimensions">
        {/* Rows */}
        <div className="config-panel__dim-group">
          <span className="config-panel__dim-label">Rows</span>
          <div className="config-panel__dim-pills">
            {config.rows.length === 0 ? (
              <span className="config-panel__dim-empty">none</span>
            ) : (
              config.rows.map((dim, i) => (
                <ConfigPill
                  key={`r-${i}`}
                  label={dimLabel(dim, questions, audiences)}
                  sublabel={dimTypeIcon(dim) || undefined}
                  removable
                  onRemove={() => onRemoveRow(i)}
                />
              ))
            )}
          </div>
          <button className="config-panel__dim-add" onClick={onOpenRowPicker}><Plus size={10} /> Add</button>
          {onCreateNet && (
            <button className="config-panel__dim-add config-panel__net-btn" onClick={onCreateNet}>
              <Layers size={10} /> NET
            </button>
          )}
        </div>

        <div className="config-panel__separator" />

        {/* Columns */}
        <div className="config-panel__dim-group">
          <span className="config-panel__dim-label">Cols</span>
          <div className="config-panel__dim-pills">
            {config.columns.length === 0 ? (
              <span className="config-panel__dim-empty">none</span>
            ) : (
              config.columns.map((dim, i) => (
                <ConfigPill
                  key={`c-${i}`}
                  label={dimLabel(dim, questions, audiences)}
                  sublabel={dimTypeIcon(dim) || undefined}
                  removable
                  onRemove={() => onRemoveColumn(i)}
                />
              ))
            )}
          </div>
          <button className="config-panel__dim-add" onClick={onOpenColumnPicker}><Plus size={10} /> Add</button>
        </div>

        <div className="config-panel__separator" />

        {/* Waves */}
        <div className="config-panel__dim-group">
          <span className="config-panel__dim-label">Waves</span>
          <div className="config-panel__dim-pills">
            {config.wave_ids.length === 0 ? (
              <span className="config-panel__dim-empty">none</span>
            ) : (
              config.wave_ids.map((wid, i) => (
                <ConfigPill key={`w-${i}`} label={waveLabel(wid, waves)} removable onRemove={() => onRemoveWave(i)} />
              ))
            )}
          </div>
          <button className="config-panel__dim-add" onClick={onOpenWavePicker}><Plus size={10} /> Add</button>
        </div>

        <div className="config-panel__separator" />

        {/* Base */}
        <div className="config-panel__dim-group">
          <span className="config-panel__dim-label">Base</span>
          <div className="config-panel__dim-pills">
            <ConfigPill
              label={basePillLabel(config, questions)}
              sublabel={basePillSublabel(config)}
              onClick={onOpenBasePicker}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Compact inline controls */}
      <div className="config-panel__controls">
        {/* Metrics */}
        <div className="config-panel__control">
          <span className="config-panel__control-label">Metrics</span>
          <div className="config-panel__metrics">
            {allMetrics.map((m) => (
              <ConfigPill key={m} label={metricLabels[m] ?? m} active={config.metrics.includes(m)} onClick={() => onToggleMetric(m)} />
            ))}
          </div>
        </div>

        {/* Data Set */}
        <div className="config-panel__control">
          <span className="config-panel__control-label">Data</span>
          <span className="config-panel__control-value">{studyLabel(config, waves, studies)}</span>
          <button className="config-panel__control-btn" onClick={onOpenDataSetPicker}>Change</button>
        </div>

        {/* Highlight */}
        <div className="config-panel__control">
          <span className="config-panel__control-label">Highlight</span>
          <Dropdown
            trigger={
              <button className="config-panel__control-select">
                {highlightOptions.find((h) => h.value === highlightMode)?.label ?? 'None'}
                <ChevronDown size={12} />
              </button>
            }
            items={highlightOptions}
            onSelect={(value) => onHighlightChange(value)}
          />
        </div>

        {/* Statistical Testing */}
        <div className="config-panel__control">
          <span className="config-panel__control-label">
            <FlaskConical size={12} /> Stat Test
          </span>
          <Dropdown
            trigger={
              <button className="config-panel__control-select">
                {statTestOptions.find((s) => s.value === currentStatTest)?.label ?? 'None'}
                <ChevronDown size={12} />
              </button>
            }
            items={statTestOptions}
            onSelect={(value) => onStatTestChange?.(value)}
          />
          {currentStatTest !== 'none' && (
            <Dropdown
              trigger={
                <button className="config-panel__control-select config-panel__confidence-btn">
                  {currentConfidence}%
                  <ChevronDown size={12} />
                </button>
              }
              items={confidenceLevelOptions}
              onSelect={(value) => onConfidenceLevelChange?.(Number(value))}
            />
          )}
        </div>

        {/* Timeframe */}
        <div className="config-panel__control">
          <span className="config-panel__control-label">
            <TrendingUp size={12} /> Timeframe
          </span>
          <Dropdown
            trigger={
              <button className="config-panel__control-select">
                {timeframeOptions.find((t) => t.value === timeframe)?.label ?? 'None'}
                <ChevronDown size={12} />
              </button>
            }
            items={timeframeOptions}
            onSelect={(value) => onTimeframeChange(value)}
          />
        </div>

        {/* Advanced toggle */}
        <button
          className="config-panel__advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide advanced' : 'Advanced options'}
        </button>
      </div>

      {/* Row 3: Advanced controls (collapsible) */}
      {showAdvanced && (
        <div className="config-panel__advanced">
          {/* Wave Comparison */}
          <div className="config-panel__control">
            <span className="config-panel__control-label">
              <BarChart3 size={12} /> Wave Mode
            </span>
            <Dropdown
              trigger={
                <button className="config-panel__control-btn">
                  {waveComparisonOptions.find((w) => w.value === currentWaveComparison)?.label ?? 'Single wave'}
                </button>
              }
              items={waveComparisonOptions}
              onSelect={(value) => onWaveComparisonChange?.(value)}
            />
          </div>

          {/* Suppression */}
          <div className="config-panel__control">
            <span className="config-panel__control-label">Suppression</span>
            <Dropdown
              trigger={
                <button className="config-panel__control-btn">
                  {suppressionOptions.find((s) => s.value === currentSuppression)?.label ?? 'Off'}
                </button>
              }
              items={suppressionOptions}
              onSelect={(value) => onSuppressionChange?.(value)}
            />
            {currentSuppression !== 'off' && (
              <span className="config-panel__threshold">
                min n=
                <input
                  type="number"
                  className="config-panel__threshold-input"
                  value={currentSuppressionThreshold}
                  onChange={(e) => onSuppressionThresholdChange?.(Number(e.target.value))}
                  min={1}
                  max={500}
                />
              </span>
            )}
          </div>

          {/* Rebasing */}
          <div className="config-panel__control">
            <span className="config-panel__control-label">
              <Scale size={12} /> Rebase
            </span>
            <Dropdown
              trigger={
                <button className="config-panel__control-btn">
                  {rebaseOptions.find((r) => r.value === currentRebase)?.label ?? 'Column %'}
                </button>
              }
              items={rebaseOptions}
              onSelect={(value) => onRebaseChange?.(value)}
            />
          </div>

          {/* Sort */}
          <div className="config-panel__control">
            <span className="config-panel__control-label">Sort</span>
            <Dropdown
              trigger={
                <button className="config-panel__control-btn">
                  {sortOptions.find((s) => s.value === currentSort)?.label ?? 'Default'}
                </button>
              }
              items={sortOptions}
              onSelect={(value) => onSortChange?.(value)}
            />
          </div>

          {/* Weighting indicator */}
          {config.weighting?.scheme_id && (
            <div className="config-panel__control">
              <span className="config-panel__control-label">Weighting</span>
              <span className="config-panel__control-value config-panel__weighted-badge">
                Weighted
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
