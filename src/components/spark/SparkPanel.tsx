import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronDown, Maximize2 } from 'lucide-react'
import SparkChat from './SparkChat'
import type { SparkAction, SparkContext } from '@/api/types'
import { useWorkspaceStore } from '@/stores/workspace'
import './SparkPanel.css'

interface SuggestedPrompt {
  label: string
}

interface SparkPanelProps {
  context: SparkContext
  suggestedPrompts?: SuggestedPrompt[]
  defaultOpen?: boolean
  onAction?: (action: SparkAction) => void
}

export default function SparkPanel({
  context,
  suggestedPrompts = [],
  defaultOpen = false,
  onAction,
}: SparkPanelProps) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(undefined)
  const [lastUserMessage, setLastUserMessage] = useState<string | undefined>(undefined)
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId)
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId)

  const mergedContext: SparkContext = {
    ...context,
    project_id: activeProjectId ?? context.project_id,
    team_id: activeTeamId ?? context.team_id,
  }

  const handleExpandToSpark = (e: React.MouseEvent) => {
    e.stopPropagation()
    const params = new URLSearchParams()
    if (lastUserMessage) params.set('prompt', lastUserMessage)

    // Serialize context into query params
    const contextType = mergedContext.chart_id
      ? 'chart'
      : mergedContext.crosstab_id
        ? 'crosstab'
        : mergedContext.dashboard_id
          ? 'dashboard'
          : mergedContext.audience_id
            ? 'audience'
            : undefined
    const contextId = mergedContext.chart_id ?? mergedContext.crosstab_id ?? mergedContext.dashboard_id ?? mergedContext.audience_id

    if (contextType && contextId) {
      params.set('context_type', contextType)
      params.set('context_id', contextId)
    }
    if (mergedContext.wave_ids?.length) params.set('wave_ids', mergedContext.wave_ids.join(','))
    if (mergedContext.location_ids?.length) params.set('location_ids', mergedContext.location_ids.join(','))
    if (mergedContext.project_id) params.set('project_id', mergedContext.project_id)
    if (mergedContext.team_id) params.set('team_id', mergedContext.team_id)

    const qs = params.toString()
    navigate(qs ? `/app/agent-spark?${qs}` : '/app/agent-spark')
  }

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt)
    if (!isOpen) setIsOpen(true)
  }

  return (
    <div className={`spark-panel ${isOpen ? 'spark-panel--open' : ''}`}>
      <div
        className="spark-panel__header"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <div className="spark-panel__header-left">
          <Sparkles size={16} />
          <span>Ask Spark</span>
        </div>
        <div className="spark-panel__header-right">
          <button
            className="spark-panel__expand-btn"
            onClick={handleExpandToSpark}
            title="Expand to full Spark"
          >
            <Maximize2 size={14} />
          </button>
          <ChevronDown size={16} className={`spark-panel__chevron ${isOpen ? 'spark-panel__chevron--open' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="spark-panel__body">
          {suggestedPrompts.length > 0 && (
            <div className="spark-panel__prompts">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  className="spark-panel__prompt-pill"
                  onClick={() => handlePromptClick(prompt.label)}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}

          <div className="spark-panel__chat">
            <SparkChat
              compact
              context={mergedContext}
              initialInput={selectedPrompt}
              onAction={onAction}
              onMessageSent={setLastUserMessage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
