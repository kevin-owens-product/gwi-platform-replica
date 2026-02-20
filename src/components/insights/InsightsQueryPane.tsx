import type { MetricType, Study, Wave, WaveId } from '@/api/types'
import type { InsightCompatibilityResult, InsightQuerySpec, InsightRebaseConfig } from '@/api/types'

interface InsightsQueryPaneProps {
  querySpec: InsightQuerySpec
  onQuerySpecChange: (next: InsightQuerySpec) => void
  studies: Study[]
  waves: Wave[]
  compatibility?: InsightCompatibilityResult
  onApplySuggestion: (suggestionId: string) => void
}

const metricOptions: Array<{ label: string; value: MetricType }> = [
  { label: 'Audience %', value: 'audience_percentage' },
  { label: 'Audience Index', value: 'audience_index' },
  { label: 'Audience Size', value: 'audience_size' },
  { label: 'Column %', value: 'column_percentage' },
  { label: 'Row %', value: 'row_percentage' },
]

const rebaseModes: Array<{ label: string; value: InsightRebaseConfig['mode'] }> = [
  { label: 'Column', value: 'column' },
  { label: 'Row', value: 'row' },
  { label: 'Total', value: 'total' },
  { label: 'Respondent Base', value: 'respondent_base' },
  { label: 'Custom Base Filter', value: 'custom_base_filter' },
]

function toWaveIds(csv: string): WaveId[] {
  if (!csv.trim()) return []

  return csv
    .split(',')
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((value) => ({ study_id: value.split(':')[0] || 'study_core', wave_id: value.split(':')[1] || value }))
}

function waveIdsToCsv(waveIds: WaveId[]): string {
  return waveIds.map((wave) => `${wave.study_id}:${wave.wave_id}`).join(', ')
}

export default function InsightsQueryPane({
  querySpec,
  onQuerySpecChange,
  studies,
  waves,
  compatibility,
  onApplySuggestion,
}: InsightsQueryPaneProps): React.JSX.Element {
  const update = (patch: Partial<InsightQuerySpec>) => {
    onQuerySpecChange({
      ...querySpec,
      ...patch,
    })
  }

  const toggleMetric = (metric: MetricType) => {
    const hasMetric = querySpec.metrics.includes(metric)
    const nextMetrics = hasMetric
      ? querySpec.metrics.filter((item) => item !== metric)
      : [...querySpec.metrics, metric]

    update({ metrics: nextMetrics.length > 0 ? nextMetrics : ['audience_percentage'] })
  }

  return (
    <section className="ins-pane">
      <header className="ins-pane__header">
        <h2>Query & Filters</h2>
        <span>Time, rebasing, dataset</span>
      </header>

      <label className="ins-field">
        <span>Dataset / study</span>
        <select
          value={querySpec.dataset.primary_study_id ?? ''}
          onChange={(event) => {
            const nextStudyId = event.target.value || undefined
            update({
              dataset: {
                ...querySpec.dataset,
                primary_study_id: nextStudyId,
                allowed_study_ids: nextStudyId ? [nextStudyId] : undefined,
              },
            })
          }}
        >
          <option value="">All studies</option>
          {studies.map((study) => (
            <option key={study.id} value={study.id}>
              {study.name}
            </option>
          ))}
        </select>
      </label>

      <label className="ins-field">
        <span>Waves (study:wave comma-separated)</span>
        <input
          type="text"
          value={waveIdsToCsv(querySpec.time.wave_ids)}
          onChange={(event) => {
            update({
              time: {
                ...querySpec.time,
                wave_ids: toWaveIds(event.target.value),
              },
            })
          }}
          placeholder="study_core:wave_2024q4"
        />
      </label>

      <label className="ins-field">
        <span>Comparison waves</span>
        <select
          value={querySpec.time.comparison_wave_ids?.[0]?.wave_id ?? ''}
          onChange={(event) => {
            const selected = event.target.value
            update({
              time: {
                ...querySpec.time,
                comparison_wave_ids: selected
                  ? [{ study_id: querySpec.dataset.primary_study_id ?? 'study_core', wave_id: selected }]
                  : [],
              },
            })
          }}
        >
          <option value="">None</option>
          {waves.map((wave) => (
            <option key={wave.id} value={wave.id}>
              {wave.name}
            </option>
          ))}
        </select>
      </label>

      <label className="ins-field">
        <span>Trend mode</span>
        <select
          value={querySpec.time.trend_mode ?? 'off'}
          onChange={(event) => {
            update({
              time: {
                ...querySpec.time,
                trend_mode: event.target.value as InsightQuerySpec['time']['trend_mode'],
              },
            })
          }}
        >
          <option value="off">Off</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      <label className="ins-field">
        <span>Rebasing</span>
        <select
          value={querySpec.rebase.mode}
          onChange={(event) => {
            update({
              rebase: {
                ...querySpec.rebase,
                mode: event.target.value as InsightRebaseConfig['mode'],
              },
            })
          }}
        >
          {rebaseModes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>

      <div className="ins-field">
        <span>Metrics</span>
        <div className="ins-metrics-grid">
          {metricOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`ins-metric-chip ${querySpec.metrics.includes(option.value) ? 'active' : ''}`}
              onClick={() => toggleMetric(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {compatibility && compatibility.issues.length > 0 && (
        <div className="ins-compatibility">
          <h3>Compatibility checks</h3>
          {compatibility.issues.map((issue) => (
            <div key={`${issue.code}_${issue.message}`} className={`ins-compatibility__issue ${issue.level}`}>
              <strong>{issue.level === 'error' ? 'Blocked' : 'Warning'}</strong>
              <span>{issue.message}</span>
            </div>
          ))}

          {compatibility.suggestions.length > 0 && (
            <div className="ins-compatibility__actions">
              {compatibility.suggestions.map((suggestion) => (
                <button key={suggestion.id} type="button" onClick={() => onApplySuggestion(suggestion.id)}>
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
