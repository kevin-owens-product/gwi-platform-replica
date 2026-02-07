import { Plus, RefreshCw } from 'lucide-react'
import { Button, Dropdown } from '@/components/shared'
import ConfigPill from './ConfigPill'
import type { CrosstabConfig, CrosstabDimension, MetricType, WaveId, Question, Audience, Wave, Study } from '@/api/types'
import './CrosstabConfigPanel.css'

const metricLabels: Record<string, string> = {
  audience_percentage: 'Percentage',
  audience_index: 'Index',
  audience_size: 'Audience Size',
  positive_size: 'Sample Count',
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

function resolveDimensionLabel(dim: CrosstabDimension, questions?: Question[], audiences?: Audience[]): string {
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

function resolveWaveLabel(waveId: WaveId, waves?: Wave[]): string {
  const w = waves?.find((w) => w.id === waveId.wave_id)
  return w ? w.name : waveId.wave_id
}

function resolveStudyLabel(config: CrosstabConfig, waves?: Wave[], studies?: Study[]): string {
  if (config.wave_ids.length === 0) return 'No data set selected'
  const firstWave = waves?.find((w) => w.id === config.wave_ids[0].wave_id)
  if (firstWave) {
    const study = studies?.find((s) => s.id === firstWave.study_id)
    return study ? `${study.name} · ${firstWave.name}` : firstWave.name
  }
  return config.wave_ids[0].study_id
}

function resolveBaseLabel(config: CrosstabConfig): string {
  return config.base_audience ? 'Custom audience filter' : 'All Adults (no filter)'
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
      {/* ROWS */}
      <div className="crosstab-config-section">
        <div className="crosstab-config-section__label">Rows</div>
        <div className="crosstab-config-section__content">
          {config.rows.length === 0 ? (
            <span className="crosstab-config-section__empty">No row questions added</span>
          ) : (
            config.rows.map((dim, i) => (
              <ConfigPill
                key={`row-${i}`}
                label={resolveDimensionLabel(dim, questions, audiences)}
                removable
                onRemove={() => onRemoveRow(i)}
              />
            ))
          )}
        </div>
        <div className="crosstab-config-section__action">
          <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={onOpenRowPicker}>
            Add
          </Button>
        </div>
      </div>

      {/* COLUMNS */}
      <div className="crosstab-config-section">
        <div className="crosstab-config-section__label">Columns</div>
        <div className="crosstab-config-section__content">
          {config.columns.length === 0 ? (
            <span className="crosstab-config-section__empty">No column dimensions added</span>
          ) : (
            config.columns.map((dim, i) => (
              <ConfigPill
                key={`col-${i}`}
                label={resolveDimensionLabel(dim, questions, audiences)}
                sublabel={dim.type === 'audience' ? '(audience)' : undefined}
                removable
                onRemove={() => onRemoveColumn(i)}
              />
            ))
          )}
        </div>
        <div className="crosstab-config-section__action">
          <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={onOpenColumnPicker}>
            Add
          </Button>
        </div>
      </div>

      {/* METRICS */}
      <div className="crosstab-config-section">
        <div className="crosstab-config-section__label">Metrics</div>
        <div className="crosstab-config-section__content">
          {allMetrics.map((m) => (
            <ConfigPill
              key={m}
              label={metricLabels[m] ?? m}
              active={config.metrics.includes(m)}
              onClick={() => onToggleMetric(m)}
            />
          ))}
        </div>
      </div>

      {/* BASE AUDIENCE */}
      <div className="crosstab-config-section">
        <div className="crosstab-config-section__label">Base</div>
        <div className="crosstab-config-section__content">
          <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text)' }}>
            {resolveBaseLabel(config)}
          </span>
        </div>
        <div className="crosstab-config-section__action">
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={onOpenBasePicker}>
            Change
          </Button>
        </div>
      </div>

      {/* DATA SET */}
      <div className="crosstab-config-section">
        <div className="crosstab-config-section__label">Data Set</div>
        <div className="crosstab-config-section__content">
          <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text)' }}>
            {resolveStudyLabel(config, waves, studies)}
          </span>
        </div>
        <div className="crosstab-config-section__action">
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={onOpenDataSetPicker}>
            Change
          </Button>
        </div>
      </div>

      {/* WAVES */}
      <div className="crosstab-config-section">
        <div className="crosstab-config-section__label">Waves</div>
        <div className="crosstab-config-section__content">
          {config.wave_ids.length === 0 ? (
            <span className="crosstab-config-section__empty">No waves selected</span>
          ) : (
            config.wave_ids.map((wid, i) => (
              <ConfigPill
                key={`wave-${i}`}
                label={resolveWaveLabel(wid, waves)}
                removable
                onRemove={() => onRemoveWave(i)}
              />
            ))
          )}
        </div>
        <div className="crosstab-config-section__action">
          <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={onOpenWavePicker}>
            Add
          </Button>
        </div>
      </div>

      {/* HIGHLIGHT */}
      <div className="crosstab-config-section">
        <div className="crosstab-config-section__label">Highlight</div>
        <div className="crosstab-config-section__content">
          <Dropdown
            trigger={
              <button className="crosstab-config-select" style={{ cursor: 'pointer' }}>
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
