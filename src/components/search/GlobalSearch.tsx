import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, BarChart2, Users, Tv, Globe, Tag, Loader2, type LucideIcon } from 'lucide-react'
import { useQuestions, useStudies } from '@/hooks/useTaxonomy'
import type { Question } from '@/api/types'
import './GlobalSearch.css'

const fallbackDatasets = ['All Datasets', 'GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Kids', 'GWI Work']

// Map category names to icons for display
const categoryIcons: Record<string, LucideIcon> = {
  Demographics: Users,
  'Media Consumption': Tv,
  'Brand Perceptions': Tag,
  'Attitudes & Lifestyle': Globe,
  Technology: BarChart2,
  'Purchase Journey': Tag,
}

const fallbackResults: Array<{ id: string; name: string; category_name: string; study_name: string }> = [
  { id: 'fallback-1', name: 'Age of respondent', category_name: 'Demographics', study_name: 'GWI Core' },
  { id: 'fallback-2', name: 'Gender identity', category_name: 'Demographics', study_name: 'GWI Core' },
  { id: 'fallback-3', name: 'Social media platforms used in the past month', category_name: 'Media Consumption', study_name: 'GWI Core' },
  { id: 'fallback-4', name: 'Time spent watching online TV per day', category_name: 'Media Consumption', study_name: 'GWI Core' },
  { id: 'fallback-5', name: 'Brands purchased in the last 3 months', category_name: 'Brand Perceptions', study_name: 'GWI Core' },
  { id: 'fallback-6', name: 'Household income bracket', category_name: 'Demographics', study_name: 'GWI Core' },
  { id: 'fallback-7', name: 'Attitudes toward sustainability', category_name: 'Attitudes & Lifestyle', study_name: 'GWI Zeitgeist' },
  { id: 'fallback-8', name: 'Devices used to access the internet', category_name: 'Technology', study_name: 'GWI Core' },
  { id: 'fallback-9', name: 'Online purchase frequency', category_name: 'Purchase Journey', study_name: 'GWI Core' },
  { id: 'fallback-10', name: 'Preferred news sources', category_name: 'Media Consumption', study_name: 'GWI USA' },
]

interface GlobalSearchProps {
  onClose: () => void
}

export default function GlobalSearch({ onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [dataset, setDataset] = useState('All Datasets')
  const [datasetOpen, setDatasetOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const navigate = useNavigate()

  // Fetch studies for the dataset selector
  const { data: studies } = useStudies()

  // Build dataset list from API studies, falling back to hardcoded list
  const datasetList = studies && studies.length > 0
    ? ['All Datasets', ...studies.map((s) => s.name)]
    : fallbackDatasets

  // Search questions using the taxonomy API with debounced query
  const {
    data: questionResults,
    isLoading: isSearching,
    error: searchError,
  } = useQuestions(
    debouncedQuery ? { search: debouncedQuery } : undefined
  )

  // Debounce the query input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Determine which results to show
  const getDisplayResults = useCallback(() => {
    // If we have API results, use them
    if (debouncedQuery && questionResults?.data) {
      return questionResults.data.map((q: Question) => ({
        id: q.id,
        name: q.name,
        category_name: q.category_name,
        study_name: '', // Questions don't carry study_name directly
      }))
    }

    // If searching but API failed, or no query yet, use fallback with client-side filter
    if (searchError || !debouncedQuery) {
      return fallbackResults.filter((r) => {
        const matchesQuery = !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.category_name.toLowerCase().includes(query.toLowerCase())
        return matchesQuery
      })
    }

    return []
  }, [debouncedQuery, questionResults, searchError, query])

  const displayResults = getDisplayResults()

  // Filter by dataset (client-side for fallback results)
  const filteredResults = dataset === 'All Datasets'
    ? displayResults
    : displayResults.filter((r) => !r.study_name || r.study_name === dataset)

  // Group results by category_name
  const grouped = filteredResults.reduce<Record<string, typeof filteredResults>>((acc, item) => {
    const cat = item.category_name || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const handleResultClick = (questionId: string) => {
    onClose()
    navigate(`/app/chart-builder/chart/new?question=${questionId}`)
  }

  const getIconForCategory = (categoryName: string): LucideIcon => {
    return categoryIcons[categoryName] || BarChart2
  }

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-input-row">
          <Search size={20} className="global-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Search attributes, audiences, charts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="global-search-dataset-wrapper">
            <button
              className="global-search-dataset-btn"
              onClick={() => setDatasetOpen(!datasetOpen)}
            >
              <span>{dataset}</span>
              <ChevronDown size={14} />
            </button>
            {datasetOpen && (
              <div className="global-search-dataset-dropdown">
                {datasetList.map((d) => (
                  <button
                    key={d}
                    className={`global-search-dataset-option ${d === dataset ? 'selected' : ''}`}
                    onClick={() => { setDataset(d); setDatasetOpen(false) }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="global-search-results">
          {/* Loading spinner */}
          {isSearching && debouncedQuery && (
            <div className="global-search-loading">
              <Loader2 size={20} className="global-search-spinner" />
              <span>Searching...</span>
            </div>
          )}

          {/* No results */}
          {!isSearching && debouncedQuery && Object.keys(grouped).length === 0 && (
            <div className="global-search-empty">No results found</div>
          )}

          {/* No query yet - show hint or fallback results */}
          {!debouncedQuery && Object.keys(grouped).length === 0 && (
            <div className="global-search-empty">Start typing to search questions and attributes</div>
          )}

          {/* Grouped results */}
          {Object.entries(grouped).map(([category, items]) => {
            const IconComponent = getIconForCategory(category)
            return (
              <div key={category} className="global-search-group">
                <div className="global-search-group-label">{category}</div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    className="global-search-result"
                    onClick={() => handleResultClick(item.id)}
                  >
                    <IconComponent size={16} className="global-search-result-icon" />
                    <span className="global-search-result-text">{item.name}</span>
                    <span className="global-search-result-badge">{item.category_name}</span>
                    {item.study_name && (
                      <span className="global-search-result-dataset">{item.study_name}</span>
                    )}
                  </button>
                ))}
              </div>
            )
          })}
        </div>

        <div className="global-search-footer">
          <span className="global-search-hint">Press <kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  )
}
