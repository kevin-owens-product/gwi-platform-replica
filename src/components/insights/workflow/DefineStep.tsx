import { Compass, Search } from 'lucide-react'
import { SearchInput } from '@/components/shared'
import type { Audience, Question } from '@/api/types'
import type { InsightDraftRecord } from '@/features/insights/draft-store'

interface DefineStepProps {
  draft: InsightDraftRecord
  query: string
  onQueryChange: (value: string) => void
  questions: Question[]
  audiences: Audience[]
  onObjectiveChange: (value: string) => void
  onNameChange: (value: string) => void
  onAudienceChange: (audienceId: string) => void
  onToggleQuestion: (questionId: string) => void
}

const intentHints = [
  'High-income gamers in US',
  'Streaming users by age',
  'Social commerce behavior',
  'Eco-conscious shoppers',
]

export default function DefineStep({
  draft,
  query,
  onQueryChange,
  questions,
  audiences,
  onObjectiveChange,
  onNameChange,
  onAudienceChange,
  onToggleQuestion,
}: DefineStepProps): React.JSX.Element {
  return (
    <section className="ins-step-pane">
      <header className="ins-step-pane__header">
        <h2>Define your analysis</h2>
        <p>Set the objective, choose an audience, and pick variables.</p>
      </header>

      <div className="ins-form-grid">
        <label className="ins-field">
          <span>Insight name</span>
          <input type="text" value={draft.name} onChange={(event) => onNameChange(event.target.value)} />
        </label>

        <label className="ins-field">
          <span>Base audience</span>
          <select value={draft.base_audience_id ?? ''} onChange={(event) => onAudienceChange(event.target.value)}>
            <option value="">All adults</option>
            {audiences.map((audience) => (
              <option key={audience.id} value={audience.id}>{audience.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="ins-field">
        <span>Objective</span>
        <textarea
          value={draft.objective}
          onChange={(event) => onObjectiveChange(event.target.value)}
          placeholder="What business question are you trying to answer?"
        />
      </label>

      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="Search variables, topics, or business intents..."
      />

      <div className="ins-intents">
        {intentHints.map((hint) => (
          <button
            key={hint}
            type="button"
            className="ins-intent-chip"
            onClick={() => onQueryChange(hint)}
          >
            <Compass size={12} />
            <span>{hint}</span>
          </button>
        ))}
      </div>

      <div className="ins-list" role="listbox" aria-label="Available questions">
        {questions.map((question) => {
          const selected = draft.selected_question_ids.includes(question.id)
          return (
            <button
              key={question.id}
              type="button"
              className={`ins-list-item ${selected ? 'selected' : ''}`}
              onClick={() => onToggleQuestion(question.id)}
            >
              <div>
                <strong>{question.name}</strong>
                <p>{question.category_name}</p>
              </div>
              <span className="ins-list-item__meta">{selected ? 'Selected' : 'Add'}</span>
            </button>
          )
        })}

        {questions.length === 0 && (
          <div className="ins-empty">
            <Search size={16} />
            <span>No variables found.</span>
          </div>
        )}
      </div>
    </section>
  )
}
