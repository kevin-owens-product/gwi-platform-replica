import { useState } from 'react'
import { ChevronRight, ChevronDown, Search, Folder, Hash } from 'lucide-react'
import { useCategories, useQuestions } from '@/hooks/useTaxonomy'
import type { Category, Question, Datapoint } from '@/api/types'
import './QuestionBrowser.css'

interface QuestionBrowserProps {
  onSelectQuestion?: (question: Question) => void
  onSelectDatapoints?: (questionId: string, datapoints: Datapoint[]) => void
  selectedQuestionIds?: string[]
}

export default function QuestionBrowser({
  onSelectQuestion,
  onSelectDatapoints,
  selectedQuestionIds = [],
}: QuestionBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: questions, isLoading: questionsLoading } = useQuestions(
    searchQuery ? { search: searchQuery } : selectedCategory ? { category_id: selectedCategory } : undefined
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
    setSelectedCategory(categoryId)
  }

  const renderCategory = (category: Category, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.id} className="qb__category-item">
        <button
          className={`qb__category-btn ${selectedCategory === category.id ? 'qb__category-btn--active' : ''}`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
          onClick={() => toggleCategory(category.id)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span style={{ width: 14 }} />
          )}
          <Folder size={14} />
          <span className="qb__category-name">{category.name}</span>
          <span className="qb__category-count">{category.question_count}</span>
        </button>
        {isExpanded && hasChildren && (
          <div className="qb__category-children">
            {category.children!.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderQuestion = (question: Question) => {
    const isSelected = selectedQuestionIds.includes(question.id)

    return (
      <div
        key={question.id}
        className={`qb__question ${isSelected ? 'qb__question--selected' : ''}`}
        onClick={() => onSelectQuestion?.(question)}
      >
        <div className="qb__question-header">
          <Hash size={14} />
          <span className="qb__question-name">{question.name}</span>
          <span className="qb__question-type">{question.type}</span>
        </div>
        {question.description && (
          <p className="qb__question-desc">{question.description}</p>
        )}
        {question.datapoints.length > 0 && (
          <div className="qb__datapoints">
            {question.datapoints.slice(0, 8).map((dp) => (
              <button
                key={dp.id}
                className="qb__datapoint"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectDatapoints?.(question.id, [dp])
                }}
              >
                {dp.name}
              </button>
            ))}
            {question.datapoints.length > 8 && (
              <span className="qb__datapoints-more">
                +{question.datapoints.length - 8} more
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="qb">
      <div className="qb__search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="qb__content">
        <div className="qb__categories">
          <h3 className="qb__section-title">Categories</h3>
          {categoriesLoading ? (
            <div className="qb__loading">Loading categories...</div>
          ) : (
            categories?.map((cat) => renderCategory(cat))
          )}
        </div>

        <div className="qb__questions">
          <h3 className="qb__section-title">
            Questions
            {questions?.meta && (
              <span className="qb__total-count">({questions.meta.total})</span>
            )}
          </h3>
          {questionsLoading ? (
            <div className="qb__loading">Loading questions...</div>
          ) : questions?.data.length === 0 ? (
            <div className="qb__empty">
              {searchQuery ? 'No questions match your search' : 'Select a category to browse questions'}
            </div>
          ) : (
            questions?.data.map((q) => renderQuestion(q))
          )}
        </div>
      </div>
    </div>
  )
}
