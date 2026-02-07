import { Plus } from 'lucide-react'
import { Dropdown } from '@/components/shared'
import ConfigPill from './ConfigPill'
import type { CrosstabConfig, CrosstabDimension, MetricType, WaveId, Question, Audience, Wave, Study } from '@/api/types'
import './CrosstabConfigPanel.css'

const metricLabels: Record<string, string> = {
  audience_percentage: '%',
  audience_index: 'Idx',
  audience_size: 'Size',
  positive_size: 'Sample',
}

const allMetrics: MetricType[] = ['audience_percentage', 'audience_index', 'audience_size', 'positive_size']

const highlightOptions = [
  { label: 'None', value: 'none' },
  { label: 'Heatmap', value: 'heatmap' },
  { label: 'Index coloring', value: 'index' },
]

interface CrosstabConfigPanelProps {
  config: CrosstabConfig
  questions?: Question[]
  audiences?: Audience[]
  waves?: Wave[]
  studies?: Study[]
  highlightMode: string
  onRemoveRow: (index: number) => void
  onRemoveColumn: (index: number) => void
  onToggleMetric: (metric: MetricType) => void
  onRemoveWave: (index: number) => void
  onHighlightChange: (mode: string) => void
  onOpenRowPicker: () => void
  onOpenColumnPicker: () => void
  onOpenBasePicker: () => void
  onOpenDataSetPicker: () => void
  onOpenWavePicker: () => void
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
  return 'Unknown'
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

function baseLabel(config: CrosstabConfig, questions?: Question[]): string {
  if (!config.base_audience) return 'All Adults'
  const expr = config.base_audience as unknown as Record<string, unknown>
  if ('question' in expr && typeof expr.question === 'object' && expr.question !== null) {
    const qExpr = expr.question as { question_id: string; datapoint_ids: string[] }
    const q = questions?.find((q) => q.id === qExpr.question_id)
    const name = q?.name ?? qExpr.question_id
    const dpCount = qExpr.datapoint_ids.length
    return `Question: ${name} (${dpCount} datapoint${dpCount !== 1 ? 's' : ''})`
  }
  return 'Custom filter'
}

export default function CrosstabConfigPanel({
  config,
  questions,
  audiences,
  waves,
  studies,
  highlightMode,
  onRemoveRow,
  onRemoveColumn,
  onToggleMetric,
  onRemoveWave,
  onHighlightChange,
  onOpenRowPicker,
  onOpenColumnPicker,
  onOpenBasePicker,
  onOpenDataSetPicker,
  onOpenWavePicker,
}: CrosstabConfigPanelProps) {
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
                <ConfigPill key={`r-${i}`} label={dimLabel(dim, questions, audiences)} removable onRemove={() => onRemoveRow(i)} />
              ))
            )}
          </div>
          <button className="config-panel__dim-add" onClick={onOpenRowPicker}><Plus size={10} /> Add</button>
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
                <ConfigPill key={`c-${i}`} label={dimLabel(dim, questions, audiences)} removable onRemove={() => onRemoveColumn(i)} />
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

        {/* Base */}
        <div className="config-panel__control">
          <span className="config-panel__control-label">Base</span>
          <span className="config-panel__control-value">{baseLabel(config, questions)}</span>
          <button className="config-panel__control-btn" onClick={onOpenBasePicker}>Change</button>
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
              <button className="config-panel__control-btn">
                {highlightOptions.find((h) => h.value === highlightMode)?.label ?? 'None'}
              </button>
            }
            items={highlightOptions}
            onSelect={(value) => onHighlightChange(value)}
          />
        </div>
      </div>
    </div>
  )
}
