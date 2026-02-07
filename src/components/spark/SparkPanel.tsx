import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronDown, Maximize2 } from 'lucide-react'
import SparkChat from './SparkChat'
import type { SparkAction, SparkContext } from '@/api/types'
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

  const handleExpandToSpark = (e: React.MouseEvent) => {
    e.stopPropagation()
    const path = lastUserMessage
      ? `/app/agent-spark?prompt=${encodeURIComponent(lastUserMessage)}`
      : '/app/agent-spark'
    navigate(path)
  }

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt)
    if (!isOpen) setIsOpen(true)
  }

  return (
    <div className={`spark-panel ${isOpen ? 'spark-panel--open' : ''}`}>
      <button
        className="spark-panel__header"
        onClick={() => setIsOpen(!isOpen)}
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
      </button>

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
              context={context}
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
