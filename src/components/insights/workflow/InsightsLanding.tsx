import { Clock3, Pin, PinOff, Play, Plus } from 'lucide-react'
import { Badge } from '@/components/shared'
import type { InsightDraftRecord } from '@/features/insights/draft-store'
import type { InsightFlowTemplate } from '@/features/insights/flow-library'
import { formatRelativeDate } from '@/utils/format'

interface InsightsLandingProps {
  flows: InsightFlowTemplate[]
  pinnedFlowIds: Set<string>
  drafts: InsightDraftRecord[]
  onTogglePin: (flow: InsightFlowTemplate) => void
  onStartFlow: (flow: InsightFlowTemplate) => void
  onResumeDraft: (draftId: string) => void
  onStartBlank: () => void
}

export default function InsightsLanding({
  flows,
  pinnedFlowIds,
  drafts,
  onTogglePin,
  onStartFlow,
  onResumeDraft,
  onStartBlank,
}: InsightsLandingProps): React.JSX.Element {
  const pinnedFlows = flows.filter((flow) => pinnedFlowIds.has(flow.id))
  const draftList = [...drafts]
    .sort((a, b) => new Date(b.updated_at_local).getTime() - new Date(a.updated_at_local).getTime())
    .slice(0, 6)

  return (
    <section className="insights-landing">
      <div className="ins-step-pane">
        <header className="ins-step-pane__header">
          <h2>Insights Flow Library</h2>
          <p>Launch a pre-built analyst workflow or resume an in-progress draft.</p>
        </header>
        <div className="ins-inline-actions">
          <button type="button" className="ins-run-btn" onClick={onStartBlank}>
            <Plus size={14} />
            <span>Start blank draft</span>
          </button>
        </div>
      </div>

      <div className="ins-step-pane">
        <header className="ins-step-pane__header">
          <h3>Recent drafts</h3>
          <p>Continue where you left off.</p>
        </header>
        {draftList.length === 0 ? (
          <p className="ins-empty">No local drafts yet. Start from a flow or create a blank draft.</p>
        ) : (
          <div className="ins-flow-drafts">
            {draftList.map((draft) => (
              <button
                key={draft.id}
                type="button"
                className="ins-flow-draft-card"
                onClick={() => onResumeDraft(draft.id)}
              >
                <div className="ins-flow-draft-card__top">
                  <strong>{draft.name}</strong>
                  <Badge variant="default">{draft.step}</Badge>
                </div>
                <p>{draft.objective || 'No objective yet'}</p>
                <span>
                  <Clock3 size={12} />
                  Updated {formatRelativeDate(draft.updated_at_local)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {pinnedFlows.length > 0 && (
        <div className="ins-step-pane">
          <header className="ins-step-pane__header">
            <h3>Pinned flows</h3>
            <p>Your most-used workflows.</p>
          </header>
          <div className="ins-flow-grid">
            {pinnedFlows.map((flow) => (
              <article key={flow.id} className="ins-flow-card pinned">
                <div className="ins-flow-card__header">
                  <Badge variant="default">{flow.category}</Badge>
                  <button type="button" className="ins-pin-btn" onClick={() => onTogglePin(flow)} title="Unpin flow">
                    <PinOff size={14} />
                  </button>
                </div>
                <h4>{flow.name}</h4>
                <p>{flow.description}</p>
                <div className="ins-flow-card__meta">
                  <span>{flow.question_ids.length} questions</span>
                  <span>{flow.metrics.length} metrics</span>
                </div>
                <button type="button" className="ins-run-btn" onClick={() => onStartFlow(flow)}>
                  <Play size={14} />
                  <span>Start flow</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="ins-step-pane">
        <header className="ins-step-pane__header">
          <h3>Pre-built insights flows</h3>
          <p>Template workflows optimized for common analyst jobs.</p>
        </header>
        <div className="ins-flow-grid">
          {flows.map((flow) => {
            const pinned = pinnedFlowIds.has(flow.id)
            return (
              <article key={flow.id} className="ins-flow-card">
                <div className="ins-flow-card__header">
                  <Badge variant="default">{flow.category}</Badge>
                  <button
                    type="button"
                    className="ins-pin-btn"
                    onClick={() => onTogglePin(flow)}
                    title={pinned ? 'Unpin flow' : 'Pin flow'}
                  >
                    {pinned ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
                </div>
                <h4>{flow.name}</h4>
                <p>{flow.description}</p>
                <div className="ins-flow-card__meta">
                  <span>{flow.question_ids.length} questions</span>
                  <span>{flow.metrics.length} metrics</span>
                </div>
                <button type="button" className="ins-run-btn" onClick={() => onStartFlow(flow)}>
                  <Play size={14} />
                  <span>Start flow</span>
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
