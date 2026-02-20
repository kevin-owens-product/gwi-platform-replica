import { useMemo } from 'react'
import type { Study, Wave } from '@/api/types'
import type { InsightDraftRecord } from '@/features/insights/draft-store'

interface CompareStepProps {
  draft: InsightDraftRecord
  studies: Study[]
  waves: Wave[]
  onChangeDraft: (patch: Partial<InsightDraftRecord['query_spec']>) => void
  onApplySuggestion: (suggestionId: string) => void
}

export default function CompareStep({
  draft,
  studies,
  waves,
  onChangeDraft,
  onApplySuggestion,
}: CompareStepProps): React.JSX.Element {
  const compatibility = draft.compatibility
  const selectedStudyId = draft.query_spec.dataset.primary_study_id
  const selectedPrimaryWaveIds = new Set(draft.query_spec.time.wave_ids.map((wave) => wave.wave_id))
  const selectedComparisonWaveId = draft.query_spec.time.comparison_wave_ids?.[0]?.wave_id ?? ''

  const availableWaves = useMemo(() => {
    const scoped = selectedStudyId ? waves.filter((wave) => wave.study_id === selectedStudyId) : waves
    return [...scoped].sort((left, right) => new Date(right.end_date).getTime() - new Date(left.end_date).getTime())
  }, [selectedStudyId, waves])

  const togglePrimaryWave = (wave: Wave) => {
    const nextWaveIds = selectedPrimaryWaveIds.has(wave.id)
      ? draft.query_spec.time.wave_ids.filter((entry) => entry.wave_id !== wave.id)
      : [...draft.query_spec.time.wave_ids, { study_id: wave.study_id, wave_id: wave.id }]

    onChangeDraft({
      time: {
        ...draft.query_spec.time,
        wave_ids: nextWaveIds,
      },
    })
  }

  return (
    <section className="ins-step-pane">
      <header className="ins-step-pane__header">
        <h2>Compare and validate</h2>
        <p>Configure datasets, waves, trend mode, rebasing, and resolve compatibility.</p>
      </header>

      <div className="ins-form-grid">
        <label className="ins-field">
          <span>Dataset / study</span>
          <select
            value={draft.query_spec.dataset.primary_study_id ?? ''}
            onChange={(event) => {
              const nextStudyId = event.target.value || undefined
              onChangeDraft({
                dataset: {
                  ...draft.query_spec.dataset,
                  primary_study_id: nextStudyId,
                  allowed_study_ids: nextStudyId ? [nextStudyId] : undefined,
                },
              })
            }}
          >
            <option value="">All studies</option>
            {studies.map((study) => (
              <option key={study.id} value={study.id}>{study.name}</option>
            ))}
          </select>
        </label>

        <label className="ins-field">
          <span>Trend mode</span>
          <select
            value={draft.query_spec.time.trend_mode ?? 'off'}
            onChange={(event) => {
              onChangeDraft({
                time: {
                  ...draft.query_spec.time,
                  trend_mode: event.target.value as InsightDraftRecord['query_spec']['time']['trend_mode'],
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
      </div>

      <div className="ins-form-grid">
        <div className="ins-field">
          <span>Primary waves</span>
          <div className="ins-wave-grid">
            {availableWaves.length === 0 && (
              <p className="ins-empty">No waves available for the selected study.</p>
            )}
            {availableWaves.map((wave) => (
              <label key={wave.id} className={`ins-wave-option ${selectedPrimaryWaveIds.has(wave.id) ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedPrimaryWaveIds.has(wave.id)}
                  onChange={() => togglePrimaryWave(wave)}
                />
                <span>{wave.name}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="ins-field">
          <span>Comparison wave</span>
          <select
            value={selectedComparisonWaveId}
            onChange={(event) => {
              const selected = event.target.value
              onChangeDraft({
                time: {
                  ...draft.query_spec.time,
                  comparison_wave_ids: selected
                    ? [{ study_id: selectedStudyId ?? 'study_core', wave_id: selected }]
                    : [],
                },
              })
            }}
          >
            <option value="">None</option>
            {availableWaves.map((wave) => (
              <option key={wave.id} value={wave.id}>{wave.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="ins-field">
        <span>Rebasing mode</span>
        <select
          value={draft.query_spec.rebase.mode}
          onChange={(event) => {
            onChangeDraft({
              rebase: {
                ...draft.query_spec.rebase,
                mode: event.target.value as InsightDraftRecord['query_spec']['rebase']['mode'],
              },
            })
          }}
        >
          <option value="column">Column</option>
          <option value="row">Row</option>
          <option value="total">Total</option>
          <option value="respondent_base">Respondent Base</option>
          <option value="custom_base_filter">Custom Base Filter</option>
        </select>
      </label>

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
