import { useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import type {
  InsightAsset,
  InsightFilterSet,
  InsightPublishResult,
  InsightStudioDraft,
  InsightStoryStep,
} from '@/api/types'
import type { InsightDraftRecord } from '@/features/insights/draft-store'

interface PublishStepProps {
  draft: InsightDraftRecord
  availableViews: InsightAsset[]
  availableBoards: InsightAsset[]
  publishResult: InsightPublishResult | null
  isPublishing: boolean
  onDraftUpdate: (patch: Partial<InsightStudioDraft>, options?: { structural?: boolean }) => void
  onRunStoryStep: (stepId: string) => void
  onPublish: () => void
}

interface FilterDraft {
  questionId: string
  datapointsCsv: string
  operator: InsightFilterSet['operator']
}

const EMPTY_FILTER_DRAFT: FilterDraft = {
  questionId: '',
  datapointsCsv: '',
  operator: 'include',
}

function parseDatapoints(csv: string): string[] {
  return csv
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function newFilterId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function newStep(index: number): InsightStoryStep {
  return {
    id: `story_step_${Date.now()}_${index}`,
    title: `Step ${index + 1}`,
    description: '',
    filter_overrides: [],
  }
}

export default function PublishStep({
  draft,
  availableViews,
  availableBoards,
  publishResult,
  isPublishing,
  onDraftUpdate,
  onRunStoryStep,
  onPublish,
}: PublishStepProps): React.JSX.Element {
  const [activeStoryStepId, setActiveStoryStepId] = useState<string | null>(draft.story_config.steps[0]?.id ?? null)
  const [boardFilterDraft, setBoardFilterDraft] = useState<FilterDraft>(EMPTY_FILTER_DRAFT)

  const activeStep = useMemo(
    () => draft.story_config.steps.find((step) => step.id === activeStoryStepId),
    [activeStoryStepId, draft.story_config.steps],
  )

  const toggleBoardView = (viewId: string) => {
    const nextViewIds = draft.board_config.view_asset_ids.includes(viewId)
      ? draft.board_config.view_asset_ids.filter((id) => id !== viewId)
      : [...draft.board_config.view_asset_ids, viewId]

    onDraftUpdate({
      board_config: {
        ...draft.board_config,
        view_asset_ids: nextViewIds,
      },
    })
  }

  const addBoardFilter = () => {
    if (!boardFilterDraft.questionId.trim() || parseDatapoints(boardFilterDraft.datapointsCsv).length === 0) return

    onDraftUpdate({
      board_config: {
        ...draft.board_config,
        filter_overrides: [
          ...draft.board_config.filter_overrides,
          {
            id: newFilterId('board_filter'),
            question_id: boardFilterDraft.questionId.trim(),
            datapoint_ids: parseDatapoints(boardFilterDraft.datapointsCsv),
            operator: boardFilterDraft.operator,
            source: 'board',
          },
        ],
      },
    })

    setBoardFilterDraft(EMPTY_FILTER_DRAFT)
  }

  const removeBoardFilter = (filterId: string) => {
    onDraftUpdate({
      board_config: {
        ...draft.board_config,
        filter_overrides: draft.board_config.filter_overrides.filter((filter) => filter.id !== filterId),
      },
    })
  }

  const addStoryStep = () => {
    const nextSteps = [...draft.story_config.steps, newStep(draft.story_config.steps.length)]
    onDraftUpdate({
      story_config: {
        ...draft.story_config,
        steps: nextSteps,
      },
    })
    setActiveStoryStepId(nextSteps[nextSteps.length - 1].id)
  }

  const updateStoryStep = (stepId: string, patch: Partial<InsightStoryStep>) => {
    onDraftUpdate({
      story_config: {
        ...draft.story_config,
        steps: draft.story_config.steps.map((step) => (step.id === stepId ? { ...step, ...patch } : step)),
      },
    })
  }

  const removeStoryStep = (stepId: string) => {
    const nextSteps = draft.story_config.steps.filter((step) => step.id !== stepId)
    onDraftUpdate({
      story_config: {
        ...draft.story_config,
        steps: nextSteps,
      },
    })
    if (activeStoryStepId === stepId) {
      setActiveStoryStepId(nextSteps[0]?.id ?? null)
    }
  }

  return (
    <section className="ins-step-pane">
      <header className="ins-step-pane__header">
        <h2>Publish outputs</h2>
        <p>Tune view + compose board/story + publish selected outputs.</p>
      </header>

      <div className="ins-form-grid">
        <label className="ins-field">
          <span>View mode</span>
          <select
            value={draft.view_config.mode}
            onChange={(event) => onDraftUpdate({
              view_config: {
                ...draft.view_config,
                mode: event.target.value as InsightDraftRecord['view_config']['mode'],
              },
            })}
          >
            <option value="chart">Chart</option>
            <option value="crosstab">Crosstab</option>
          </select>
        </label>

        <label className="ins-field">
          <span>Chart type</span>
          <select
            value={draft.view_config.chart_type}
            onChange={(event) => onDraftUpdate({
              view_config: {
                ...draft.view_config,
                chart_type: event.target.value as InsightDraftRecord['view_config']['chart_type'],
              },
            })}
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="pie">Pie</option>
            <option value="donut">Donut</option>
            <option value="table">Table</option>
          </select>
        </label>
      </div>

      <div className="ins-two-col">
        <div>
          <h3>Board composer</h3>
          <div className="ins-selectable-list">
            {availableViews.map((view) => (
              <button
                key={view.id}
                type="button"
                className={`ins-selectable-list__item ${draft.board_config.view_asset_ids.includes(view.id) ? 'active' : ''}`}
                onClick={() => toggleBoardView(view.id)}
              >
                <span>{view.name}</span>
                <small>{draft.board_config.view_asset_ids.includes(view.id) ? 'Included' : 'Add'}</small>
              </button>
            ))}
          </div>

          <div className="ins-filter-block">
            <strong>Board filter overrides</strong>
            <div className="ins-filter-list">
              {draft.board_config.filter_overrides.length === 0 && <p className="ins-empty">No board overrides.</p>}
              {draft.board_config.filter_overrides.map((filter) => (
                <div key={filter.id} className="ins-filter-row">
                  <span>{filter.operator} {filter.question_id}: {filter.datapoint_ids.join(', ')}</span>
                  <button type="button" className="ins-danger" onClick={() => removeBoardFilter(filter.id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="ins-inline-form">
              <input
                type="text"
                value={boardFilterDraft.questionId}
                placeholder="Question id"
                onChange={(event) => setBoardFilterDraft((prev) => ({ ...prev, questionId: event.target.value }))}
              />
              <input
                type="text"
                value={boardFilterDraft.datapointsCsv}
                placeholder="Datapoints"
                onChange={(event) => setBoardFilterDraft((prev) => ({ ...prev, datapointsCsv: event.target.value }))}
              />
              <select
                value={boardFilterDraft.operator}
                onChange={(event) => setBoardFilterDraft((prev) => ({ ...prev, operator: event.target.value as InsightFilterSet['operator'] }))}
              >
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
              </select>
              <button type="button" onClick={addBoardFilter}>Add board filter</button>
            </div>
          </div>
        </div>

        <div>
          <h3>Story workflow</h3>
          <div className="ins-story-list">
            {draft.story_config.steps.map((step) => (
              <div key={step.id} className={`ins-story-step ${activeStoryStepId === step.id ? 'active' : ''}`}>
                <input
                  type="text"
                  value={step.title}
                  onChange={(event) => updateStoryStep(step.id, { title: event.target.value })}
                />
                <textarea
                  value={step.description ?? ''}
                  onChange={(event) => updateStoryStep(step.id, { description: event.target.value })}
                />
                <select
                  value={step.view_asset_id ?? ''}
                  onChange={(event) => updateStoryStep(step.id, { view_asset_id: event.target.value || undefined })}
                >
                  <option value="">No linked view</option>
                  {availableViews.map((view) => (
                    <option key={view.id} value={view.id}>{view.name}</option>
                  ))}
                </select>
                <select
                  value={step.board_asset_id ?? ''}
                  onChange={(event) => updateStoryStep(step.id, { board_asset_id: event.target.value || undefined })}
                >
                  <option value="">No linked board</option>
                  {availableBoards.map((board) => (
                    <option key={board.id} value={board.id}>{board.name}</option>
                  ))}
                </select>

                <div className="ins-inline-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStoryStepId(step.id)
                      onRunStoryStep(step.id)
                    }}
                  >
                    <Play size={14} />
                    Run step
                  </button>
                  <button type="button" className="ins-danger" onClick={() => removeStoryStep(step.id)}>Remove</button>
                </div>
              </div>
            ))}

            <button type="button" className="ins-add-step" onClick={addStoryStep}>+ Add step</button>
          </div>

          {activeStep && (
            <div className="ins-note">
              <strong>Review mode</strong>
              <p>Active story step: {activeStep.title}</p>
            </div>
          )}
        </div>
      </div>

      <section className="ins-publish-panel">
        <h3>Publish outputs</h3>
        <div className="ins-publish-toggles">
          <label><input type="checkbox" checked={draft.publish_plan.publish_segment} onChange={(event) => onDraftUpdate({ publish_plan: { ...draft.publish_plan, publish_segment: event.target.checked } }, { structural: false })} /> Publish Segment</label>
          <label><input type="checkbox" checked={draft.publish_plan.publish_view} onChange={(event) => onDraftUpdate({ publish_plan: { ...draft.publish_plan, publish_view: event.target.checked } }, { structural: false })} /> Publish View</label>
          <label><input type="checkbox" checked={draft.publish_plan.publish_board} onChange={(event) => onDraftUpdate({ publish_plan: { ...draft.publish_plan, publish_board: event.target.checked } }, { structural: false })} /> Publish Board</label>
          <label><input type="checkbox" checked={draft.publish_plan.publish_story} onChange={(event) => onDraftUpdate({ publish_plan: { ...draft.publish_plan, publish_story: event.target.checked } }, { structural: false })} /> Publish Story</label>
        </div>

        <div className="ins-inline-actions">
          <button type="button" className="ins-run-btn" onClick={onPublish} disabled={isPublishing}>
            {isPublishing ? 'Publishing...' : 'Publish selected outputs'}
          </button>
        </div>

        {publishResult && (
          <div className="ins-publish-result">
            <strong>Published assets</strong>
            <ul>
              {Object.values(publishResult).map((item) => (
                <li key={item.asset_id}>
                  <a href={item.insights_path}>{item.type}: {item.asset_id}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </section>
  )
}
