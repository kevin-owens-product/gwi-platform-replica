import { Compass, Search } from 'lucide-react'
import { SearchInput } from '@/components/shared'
import type { Question } from '@/api/types'

interface InsightsDataPaneProps {
  query: string
  onQueryChange: (value: string) => void
  questions: Question[]
  selectedQuestionIds: string[]
  onToggleQuestion: (questionId: string) => void
}

const intentHints = [
  'High-income gamers in US',
  'Streaming users by age',
  'Social commerce behavior',
  'Eco-conscious shoppers',
]

export default function InsightsDataPane({
  query,
  onQueryChange,
  questions,
  selectedQuestionIds,
  onToggleQuestion,
}: InsightsDataPaneProps): React.JSX.Element {
  return (
    <section className="ins-pane">
      <header className="ins-pane__header">
        <h2>Data Explorer</h2>
        <span>{questions.length} variables</span>
      </header>

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
          const selected = selectedQuestionIds.includes(question.id)
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
