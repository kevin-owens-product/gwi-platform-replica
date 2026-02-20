import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'
import type { Audience, InsightStudioStep } from '@/api/types'
import type { InsightDraftRecord } from '@/features/insights/draft-store'
import type { InsightStepValidationMap } from '@/features/insights/validation'

interface InsightsContextRailProps {
  draft: InsightDraftRecord
  selectedAudience?: Audience
  currentStep: InsightStudioStep
  validations: InsightStepValidationMap
}

function formatSavedTime(timestamp?: string): string {
  if (!timestamp) return 'Not saved yet'
  const date = new Date(timestamp)
  return `Saved ${date.toLocaleTimeString()}`
}

function statusLabel(status: InsightDraftRecord['status']): string {
  switch (status) {
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'Saved'
    case 'error':
      return 'Save failed'
    default:
      return 'Idle'
  }
}

export default function InsightsContextRail({ draft, selectedAudience, currentStep, validations }: InsightsContextRailProps): React.JSX.Element {
  return (
    <aside className="ins-context-rail">
      <section className="ins-context-card">
        <h3>Analysis Context</h3>
        <p className="ins-context-card__subtitle">Current step: {currentStep}</p>
        <ul className="ins-summary-list">
          <li>Variables: {draft.selected_question_ids.length}</li>
          <li>Audience: {selectedAudience?.name ?? 'All adults'}</li>
          <li>Dataset: {draft.query_spec.dataset.primary_study_id ?? 'All studies'}</li>
          <li>Waves: {draft.query_spec.time.wave_ids.length}</li>
        </ul>
      </section>

      <section className="ins-context-card">
        <h3>Draft State</h3>
        <div className={`ins-status-chip ${draft.status}`}>
          <Clock3 size={12} />
          <span>{statusLabel(draft.status)}</span>
        </div>
        <p className="ins-context-card__subtitle">{formatSavedTime(draft.last_saved_at)}</p>
        {draft.error_message && <p className="ins-error-text">{draft.error_message}</p>}
      </section>

      <section className="ins-context-card">
        <h3>Readiness</h3>
        <div className="ins-readiness-list">
          {Object.entries(validations).map(([step, validation]) => (
            <div key={step} className={`ins-readiness-item ${validation.valid ? 'ok' : 'warn'}`}>
              {validation.valid ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              <span>{step}</span>
            </div>
          ))}
        </div>
      </section>

      {draft.compatibility && (
        <section className="ins-context-card">
          <h3>Compatibility</h3>
          {draft.compatibility.issues.length === 0 ? (
            <p className="ins-context-card__subtitle">No issues detected.</p>
          ) : (
            <ul className="ins-issue-list">
              {draft.compatibility.issues.map((issue) => (
                <li key={`${issue.code}_${issue.message}`} className={issue.level}>
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </aside>
  )
}
