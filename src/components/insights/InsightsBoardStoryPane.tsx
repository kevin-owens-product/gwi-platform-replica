import { ArrowRightLeft, GitBranch, Save } from 'lucide-react'
import type { InsightAsset, InsightLineage, InsightStoryStep } from '@/api/types'

interface InsightsBoardStoryPaneProps {
  availableViews: InsightAsset[]
  boardViewIds: string[]
  onBoardViewIdsChange: (ids: string[]) => void
  storySteps: InsightStoryStep[]
  onStoryStepsChange: (steps: InsightStoryStep[]) => void
  onSaveBoard: () => void
  onSaveStory: () => void
  onConvertToBoard: () => void
  onConvertToStory: () => void
  lineage?: InsightLineage
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
  boardViewIds,
  onBoardViewIdsChange,
  storySteps,
  onStoryStepsChange,
  onSaveBoard,
  onSaveStory,
  onConvertToBoard,
  onConvertToStory,
  lineage,
}: InsightsBoardStoryPaneProps): React.JSX.Element {
  const toggleBoardView = (viewId: string) => {
    const next = boardViewIds.includes(viewId)
      ? boardViewIds.filter((id) => id !== viewId)
      : [...boardViewIds, viewId]
    onBoardViewIdsChange(next)
  }

  const addStoryStep = () => {
    onStoryStepsChange([...storySteps, newStep(storySteps.length)])
  }

  const updateStep = (stepId: string, patch: Partial<InsightStoryStep>) => {
    onStoryStepsChange(storySteps.map((step) => (step.id === stepId ? { ...step, ...patch } : step)))
  }

  const removeStep = (stepId: string) => {
    onStoryStepsChange(storySteps.filter((step) => step.id !== stepId))
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
          <div className="ins-story-list">
            {storySteps.map((step) => (
              <div key={step.id} className="ins-story-step">
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
                <button type="button" className="ins-danger" onClick={() => removeStep(step.id)}>Remove</button>
              </div>
            ))}

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
