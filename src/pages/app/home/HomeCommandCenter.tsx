import { ChevronRight, Loader2, Send, Sparkles, Users } from 'lucide-react'
import type { Agent } from '@/data/agents'
import type { AgentStarterTemplate } from '@/data/agent-templates'
import type { CommandCenterModel, WorkspaceTotals } from './types'

interface HomeCommandCenterProps {
  model: CommandCenterModel
  question: string
  isSubmitting: boolean
  featuredAgents: Agent[]
  selectedAgentId: string
  templates: AgentStarterTemplate[]
  totals: WorkspaceTotals
  onQuestionChange: (value: string) => void
  onSubmit: () => void
  onSelectAgent: (agentId: string) => void
  onTemplateLaunch: (template: AgentStarterTemplate) => void
  onFeaturedAgentLaunch: (agentId: string) => void
  onAddAudience: () => void
}

export default function HomeCommandCenter({
  model,
  question,
  isSubmitting,
  featuredAgents,
  selectedAgentId,
  templates,
  totals,
  onQuestionChange,
  onSubmit,
  onSelectAgent,
  onTemplateLaunch,
  onFeaturedAgentLaunch,
  onAddAudience,
}: HomeCommandCenterProps): React.JSX.Element {
  return (
    <section className="home-v2-command" aria-labelledby="home-command-title">
      <div className="home-v2-command__badge">
        <Sparkles size={14} />
        <span>AI Command Center</span>
      </div>

      <h1 id="home-command-title" className="home-v2-command__title">
        {model.title}
      </h1>
      <p className="home-v2-command__subtitle">{model.subtitle}</p>

      <div className="home-v2-command__input-shell">
        <label htmlFor="home-command-input" className="home-v2-command__label">
          Launch an operational workflow
        </label>
        <textarea
          id="home-command-input"
          className="home-v2-command__input"
          placeholder={model.promptPlaceholder}
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          rows={3}
        />

        <div className="home-v2-command__input-footer">
          <button
            type="button"
            className="home-v2-chip-btn"
            onClick={onAddAudience}
          >
            <Users size={14} />
            <span>Add audience context</span>
          </button>

          <div className="home-v2-command__submit-wrap">
            <span className="home-v2-dataset">Dataset: {model.datasetLabel}</span>
            <button
              type="button"
              className="home-v2-submit"
              onClick={onSubmit}
              disabled={!question.trim() || isSubmitting}
              aria-label="Submit workflow command"
            >
              {isSubmitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              <span>{isSubmitting ? 'Submitting' : 'Submit'}</span>
            </button>
          </div>
        </div>
      </div>

      <p className="home-v2-helper">{model.helperText}</p>

      <div className="home-v2-kpis" role="list" aria-label="Workspace totals">
        <div className="home-v2-kpi" role="listitem">
          <span className="home-v2-kpi__value">{totals.audiences}</span>
          <span className="home-v2-kpi__label">Audiences</span>
        </div>
        <div className="home-v2-kpi" role="listitem">
          <span className="home-v2-kpi__value">{totals.charts}</span>
          <span className="home-v2-kpi__label">Charts</span>
        </div>
        <div className="home-v2-kpi" role="listitem">
          <span className="home-v2-kpi__value">{totals.crosstabs}</span>
          <span className="home-v2-kpi__label">Crosstabs</span>
        </div>
        <div className="home-v2-kpi" role="listitem">
          <span className="home-v2-kpi__value">{totals.dashboards}</span>
          <span className="home-v2-kpi__label">Dashboards</span>
        </div>
        <div className="home-v2-kpi" role="listitem">
          <span className="home-v2-kpi__value">{totals.reports}</span>
          <span className="home-v2-kpi__label">Reports</span>
        </div>
      </div>

      <div className="home-v2-command__template-block">
        <div className="home-v2-command__template-header">
          <h2>Agent Templates</h2>
          <p>Start from a structured prompt to reduce setup time.</p>
        </div>

        <div className="home-v2-agent-chips" role="tablist" aria-label="Choose starter agent">
          {featuredAgents.map((agent) => (
            <button
              key={agent.id}
              type="button"
              role="tab"
              aria-selected={selectedAgentId === agent.id}
              className={`home-v2-agent-chip ${selectedAgentId === agent.id ? 'is-active' : ''}`}
              onClick={() => onSelectAgent(agent.id)}
            >
              {agent.name}
            </button>
          ))}
        </div>

        <div className="home-v2-template-grid">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="home-v2-template-card"
              onClick={() => onTemplateLaunch(template)}
            >
              <span className="home-v2-template-card__title">{template.title}</span>
              <span className="home-v2-template-card__meta">{template.expectedOutcome}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="home-v2-featured-agents" aria-label="Featured agents">
        {featuredAgents.map((agent) => {
          const Icon = agent.icon
          return (
            <button
              key={agent.id}
              type="button"
              className="home-v2-featured-agent"
              onClick={() => onFeaturedAgentLaunch(agent.id)}
            >
              <span className="home-v2-featured-agent__icon" style={{ background: agent.iconBg, color: agent.iconColor }}>
                <Icon size={16} />
              </span>
              <span className="home-v2-featured-agent__text">
                <span className="home-v2-featured-agent__name">{agent.name}</span>
                <span className="home-v2-featured-agent__desc">{agent.examplePrompt}</span>
              </span>
              <ChevronRight size={14} />
            </button>
          )
        })}
      </div>
    </section>
  )
}
