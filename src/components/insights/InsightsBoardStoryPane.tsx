import { useMemo, useState } from 'react'
import { ArrowRightLeft, GitBranch, Save } from 'lucide-react'
import type { InsightAsset, InsightFilterSet, InsightLineage, InsightStoryStep } from '@/api/types'

interface InsightsBoardStoryPaneProps {
  availableViews: InsightAsset[]
  availableBoards: InsightAsset[]
  boardViewIds: string[]
  onBoardViewIdsChange: (ids: string[]) => void
  boardFilterOverrides: InsightFilterSet[]
  onBoardFilterOverridesChange: (filters: InsightFilterSet[]) => void
  storySteps: InsightStoryStep[]
  onStoryStepsChange: (steps: InsightStoryStep[]) => void
  reviewMode: boolean
  onReviewModeChange: (enabled: boolean) => void
  activeStoryStepId: string | null
  onActiveStoryStepIdChange: (stepId: string | null) => void
  onRunStoryStep: (stepId: string) => void
  onSaveBoard: () => void
  onSaveStory: () => void
  onConvertToBoard: () => void
  onConvertToStory: () => void
  lineage?: InsightLineage
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

function renderFilterLabel(filter: InsightFilterSet): string {
  const operator = filter.operator === 'include' ? 'Include' : 'Exclude'
  const datapoints = filter.datapoint_ids.join(', ') || 'No datapoints'
  return `${operator} ${filter.question_id}: ${datapoints}`
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

export default function InsightsBoardStoryPane({
  availableViews,
  availableBoards,
  boardViewIds,
  onBoardViewIdsChange,
  boardFilterOverrides,
  onBoardFilterOverridesChange,
  storySteps,
  onStoryStepsChange,
  reviewMode,
  onReviewModeChange,
  activeStoryStepId,
  onActiveStoryStepIdChange,
  onRunStoryStep,
  onSaveBoard,
  onSaveStory,
  onConvertToBoard,
  onConvertToStory,
  lineage,
}: InsightsBoardStoryPaneProps): React.JSX.Element {
  const [boardFilterDraft, setBoardFilterDraft] = useState<FilterDraft>(EMPTY_FILTER_DRAFT)
  const [stepFilterDrafts, setStepFilterDrafts] = useState<Record<string, FilterDraft>>({})

  const stepFilterDraftById = useMemo(() => {
    const next: Record<string, FilterDraft> = {}
    for (const step of storySteps) {
      next[step.id] = stepFilterDrafts[step.id] ?? EMPTY_FILTER_DRAFT
    }
    return next
  }, [stepFilterDrafts, storySteps])

  const toggleBoardView = (viewId: string) => {
    const next = boardViewIds.includes(viewId)
      ? boardViewIds.filter((id) => id !== viewId)
      : [...boardViewIds, viewId]
    onBoardViewIdsChange(next)
  }

  const addBoardFilter = () => {
    if (!boardFilterDraft.questionId.trim() || parseDatapoints(boardFilterDraft.datapointsCsv).length === 0) return

    onBoardFilterOverridesChange([
      ...boardFilterOverrides,
      {
        id: newFilterId('board_filter'),
        question_id: boardFilterDraft.questionId.trim(),
        datapoint_ids: parseDatapoints(boardFilterDraft.datapointsCsv),
        operator: boardFilterDraft.operator,
        source: 'board',
      },
    ])

    setBoardFilterDraft(EMPTY_FILTER_DRAFT)
  }

  const removeBoardFilter = (filterId: string) => {
    onBoardFilterOverridesChange(boardFilterOverrides.filter((filter) => filter.id !== filterId))
  }

  const addStoryStep = () => {
    const step = newStep(storySteps.length)
    onStoryStepsChange([...storySteps, step])
    onActiveStoryStepIdChange(step.id)
  }

  const updateStep = (stepId: string, patch: Partial<InsightStoryStep>) => {
    onStoryStepsChange(storySteps.map((step) => (step.id === stepId ? { ...step, ...patch } : step)))
  }

  const removeStep = (stepId: string) => {
    onStoryStepsChange(storySteps.filter((step) => step.id !== stepId))
    if (activeStoryStepId === stepId) {
      onActiveStoryStepIdChange(storySteps.find((step) => step.id !== stepId)?.id ?? null)
    }
  }

  const updateStepFilterDraft = (stepId: string, patch: Partial<FilterDraft>) => {
    setStepFilterDrafts((prev) => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] ?? EMPTY_FILTER_DRAFT),
        ...patch,
      },
    }))
  }

  const addStepFilter = (stepId: string) => {
    const draft = stepFilterDraftById[stepId] ?? EMPTY_FILTER_DRAFT
    if (!draft.questionId.trim() || parseDatapoints(draft.datapointsCsv).length === 0) return

    const step = storySteps.find((item) => item.id === stepId)
    if (!step) return

    updateStep(stepId, {
      filter_overrides: [
        ...(step.filter_overrides ?? []),
        {
          id: newFilterId('story_filter'),
          question_id: draft.questionId.trim(),
          datapoint_ids: parseDatapoints(draft.datapointsCsv),
          operator: draft.operator,
          source: 'story',
        },
      ],
    })

    updateStepFilterDraft(stepId, EMPTY_FILTER_DRAFT)
  }

  const removeStepFilter = (stepId: string, filterId: string) => {
    const step = storySteps.find((item) => item.id === stepId)
    if (!step) return

    updateStep(stepId, {
      filter_overrides: (step.filter_overrides ?? []).filter((filter) => filter.id !== filterId),
    })
  }

  return (
    <section className="ins-pane">
      <header className="ins-pane__header">
        <h2>Board & Story</h2>
        <span>Compose narratives</span>
      </header>

      <div className="ins-two-col">
        <div>
          <h3>Board composer</h3>
          <div className="ins-selectable-list">
            {availableViews.map((view) => (
              <button
                key={view.id}
                type="button"
                className={`ins-selectable-list__item ${boardViewIds.includes(view.id) ? 'active' : ''}`}
                onClick={() => toggleBoardView(view.id)}
              >
                <span>{view.name}</span>
                <small>{boardViewIds.includes(view.id) ? 'Included' : 'Add'}</small>
              </button>
            ))}
          </div>

          <div className="ins-filter-block">
            <strong>Board filter overrides</strong>
            <div className="ins-filter-list">
              {boardFilterOverrides.length === 0 && <p className="ins-empty">No board-level filter overrides yet.</p>}
              {boardFilterOverrides.map((filter) => (
                <div key={filter.id} className="ins-filter-row">
                  <span>{renderFilterLabel(filter)}</span>
                  <button type="button" className="ins-danger" onClick={() => removeBoardFilter(filter.id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="ins-filter-form">
              <input
                type="text"
                value={boardFilterDraft.questionId}
                placeholder="Question id"
                onChange={(event) => setBoardFilterDraft((prev) => ({ ...prev, questionId: event.target.value }))}
              />
              <input
                type="text"
                value={boardFilterDraft.datapointsCsv}
                placeholder="Datapoint ids (comma separated)"
                onChange={(event) => setBoardFilterDraft((prev) => ({ ...prev, datapointsCsv: event.target.value }))}
              />
              <select
                value={boardFilterDraft.operator}
                onChange={(event) => setBoardFilterDraft((prev) => ({
                  ...prev,
                  operator: event.target.value as InsightFilterSet['operator'],
                }))}
              >
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
              </select>
              <button type="button" onClick={addBoardFilter}>Add board filter</button>
            </div>
          </div>

          <div className="ins-inline-actions">
            <button type="button" onClick={onSaveBoard}>
              <Save size={14} />
              Save Board
            </button>
            <button type="button" onClick={onConvertToBoard}>
              <ArrowRightLeft size={14} />
              Convert Current Asset
            </button>
          </div>
        </div>

        <div>
          <h3>Story workflow</h3>
          <label className="ins-review-toggle">
            <input
              type="checkbox"
              checked={reviewMode}
              onChange={(event) => onReviewModeChange(event.target.checked)}
            />
            <span>Enable review mode (step overrides)</span>
          </label>

          <div className="ins-story-list">
            {storySteps.map((step) => {
              const stepDraft = stepFilterDraftById[step.id] ?? EMPTY_FILTER_DRAFT
              return (
                <div key={step.id} className={`ins-story-step ${activeStoryStepId === step.id ? 'active' : ''}`}>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(event) => updateStep(step.id, { title: event.target.value })}
                    placeholder="Step title"
                  />
                  <textarea
                    value={step.description ?? ''}
                    onChange={(event) => updateStep(step.id, { description: event.target.value })}
                    placeholder="Step description"
                  />
                  <select
                    value={step.view_asset_id ?? ''}
                    onChange={(event) => updateStep(step.id, { view_asset_id: event.target.value || undefined })}
                  >
                    <option value="">No linked view</option>
                    {availableViews.map((view) => (
                      <option key={view.id} value={view.id}>{view.name}</option>
                    ))}
                  </select>
                  <select
                    value={step.board_asset_id ?? ''}
                    onChange={(event) => updateStep(step.id, { board_asset_id: event.target.value || undefined })}
                  >
                    <option value="">No linked board</option>
                    {availableBoards.map((board) => (
                      <option key={board.id} value={board.id}>{board.name}</option>
                    ))}
                  </select>

                  <div className="ins-filter-block">
                    <strong>Step overrides</strong>
                    <div className="ins-filter-list">
                      {(step.filter_overrides ?? []).length === 0 && <p className="ins-empty">No step-level filters yet.</p>}
                      {(step.filter_overrides ?? []).map((filter) => (
                        <div key={filter.id} className="ins-filter-row">
                          <span>{renderFilterLabel(filter)}</span>
                          <button type="button" className="ins-danger" onClick={() => removeStepFilter(step.id, filter.id)}>Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="ins-filter-form">
                      <input
                        type="text"
                        value={stepDraft.questionId}
                        placeholder="Question id"
                        onChange={(event) => updateStepFilterDraft(step.id, { questionId: event.target.value })}
                      />
                      <input
                        type="text"
                        value={stepDraft.datapointsCsv}
                        placeholder="Datapoint ids (comma separated)"
                        onChange={(event) => updateStepFilterDraft(step.id, { datapointsCsv: event.target.value })}
                      />
                      <select
                        value={stepDraft.operator}
                        onChange={(event) => updateStepFilterDraft(step.id, {
                          operator: event.target.value as InsightFilterSet['operator'],
                        })}
                      >
                        <option value="include">Include</option>
                        <option value="exclude">Exclude</option>
                      </select>
                      <button type="button" onClick={() => addStepFilter(step.id)}>Add step filter</button>
                    </div>
                  </div>

                  <div className="ins-inline-actions">
                    <button
                      type="button"
                      onClick={() => {
                        onActiveStoryStepIdChange(step.id)
                        onRunStoryStep(step.id)
                      }}
                    >
                      Run step
                    </button>
                    <button type="button" onClick={() => onActiveStoryStepIdChange(step.id)}>
                      {activeStoryStepId === step.id ? 'Selected step' : 'Select step'}
                    </button>
                    <button type="button" className="ins-danger" onClick={() => removeStep(step.id)}>Remove</button>
                  </div>
                </div>
              )
            })}

            <button type="button" className="ins-add-step" onClick={addStoryStep}>+ Add step</button>
          </div>

          <div className="ins-inline-actions">
            <button type="button" onClick={onSaveStory}>
              <Save size={14} />
              Save Story
            </button>
            <button type="button" onClick={onConvertToStory}>
              <ArrowRightLeft size={14} />
              Convert Current Asset
            </button>
          </div>
        </div>
      </div>

      {lineage && (
        <div className="ins-lineage">
          <h3>
            <GitBranch size={14} />
            Lineage
          </h3>
          <p>Upstream: {lineage.upstream.length} | Downstream: {lineage.downstream.length}</p>
        </div>
      )}
    </section>
  )
}
