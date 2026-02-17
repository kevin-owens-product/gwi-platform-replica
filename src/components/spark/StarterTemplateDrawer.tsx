import { useEffect, useMemo, useState } from 'react'
import { Search, Sparkles, ChevronDown, Lightbulb } from 'lucide-react'
import type {
  AgentStarterTemplate,
  StarterContextType,
  StarterTemplateCategory,
} from '@/data/agent-templates'
import { AGENT_STARTER_TEMPLATE_CATEGORIES } from '@/data/agent-templates'
import { buildTemplatePrompt, resolveStarterTemplates, trackStarterEvent } from '@/utils/template-resolver'
import './StarterTemplateDrawer.css'

interface StarterTemplateDrawerProps {
  selectedAgentId?: string
  contextType?: StarterContextType
  selectedTemplateId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: AgentStarterTemplate, prompt: string) => void
  onDismiss?: () => void
  entryPoint?: 'agent_spark' | 'home' | 'catalog' | 'spark_panel'
  limit?: number
}

type CategoryFilter = 'All' | StarterTemplateCategory

export default function StarterTemplateDrawer({
  selectedAgentId,
  contextType = 'general',
  selectedTemplateId,
  open,
  onOpenChange,
  onSelectTemplate,
  onDismiss,
  entryPoint = 'agent_spark',
  limit = 12,
}: StarterTemplateDrawerProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('All')

  const templates = useMemo(
    () =>
      resolveStarterTemplates({
        agentId: selectedAgentId,
        contextType,
        limit,
      }),
    [selectedAgentId, contextType, limit]
  )

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase()
    return templates.filter((template) => {
      const matchesCategory = category === 'All' || template.category === category
      if (!matchesCategory) return false
      if (!q) return true
      return (
        template.title.toLowerCase().includes(q) ||
        template.prompt.toLowerCase().includes(q) ||
        template.expectedOutcome.toLowerCase().includes(q) ||
        template.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [templates, query, category])

  useEffect(() => {
    if (open) {
      trackStarterEvent('starter_drawer_opened', {
        entry_point: entryPoint,
        agent_id: selectedAgentId,
        context_type: contextType,
      })
    }
  }, [open, entryPoint, selectedAgentId, contextType])

  const handleTemplateClick = (template: AgentStarterTemplate) => {
    const prompt = buildTemplatePrompt(template)
    trackStarterEvent('starter_template_selected', {
      entry_point: entryPoint,
      template_id: template.id,
      agent_id: template.agentId,
      context_type: contextType,
    })
    trackStarterEvent('starter_template_prefilled', {
      entry_point: entryPoint,
      template_id: template.id,
      agent_id: template.agentId,
    })
    onSelectTemplate(template, prompt)
  }

  const toggleOpen = () => {
    onOpenChange(!open)
    if (open) onDismiss?.()
  }

  return (
    <div className={`starter-template-drawer ${open ? 'starter-template-drawer--open' : ''}`}>
      <div className="starter-template-drawer__header">
        <div className="starter-template-drawer__title-wrap">
          <Sparkles size={16} />
          <div>
            <div className="starter-template-drawer__title">Starter Templates</div>
            <div className="starter-template-drawer__subtitle">
              Pick a guided starting prompt and edit before sending.
            </div>
          </div>
        </div>
        <button className="starter-template-drawer__toggle" onClick={toggleOpen}>
          {open ? 'Hide' : 'Show'}
          <ChevronDown size={14} className={open ? 'is-open' : ''} />
        </button>
      </div>

      {open && (
        <div className="starter-template-drawer__body">
          <div className="starter-template-drawer__search">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search starter templates..."
            />
          </div>

          <div className="starter-template-drawer__categories">
            <button
              className={`starter-template-drawer__category ${category === 'All' ? 'is-active' : ''}`}
              onClick={() => setCategory('All')}
            >
              All
            </button>
            {AGENT_STARTER_TEMPLATE_CATEGORIES.map((item) => (
              <button
                key={item}
                className={`starter-template-drawer__category ${category === item ? 'is-active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="starter-template-drawer__list">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                className={`starter-template-drawer__item ${selectedTemplateId === template.id ? 'is-selected' : ''}`}
                onClick={() => handleTemplateClick(template)}
              >
                <div className="starter-template-drawer__item-title-row">
                  <span className="starter-template-drawer__item-title">{template.title}</span>
                  <span className="starter-template-drawer__item-category">{template.category}</span>
                </div>
                <div className="starter-template-drawer__item-prompt">{buildTemplatePrompt(template)}</div>
                <div className="starter-template-drawer__item-outcome">
                  <Lightbulb size={12} />
                  <span>What you&apos;ll get: {template.expectedOutcome}</span>
                </div>
              </button>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="starter-template-drawer__empty">
                No templates match this filter. Try another category or search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
