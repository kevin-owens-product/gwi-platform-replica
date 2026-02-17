import type { SparkContext } from '@/api/types'
import {
  CROSS_ROLE_TEMPLATE_IDS,
  type AgentStarterTemplate,
  type StarterContextType,
  getStarterTemplateById,
  agentStarterTemplates,
} from '@/data/agent-templates'

interface ResolveStarterTemplatesOptions {
  agentId?: string
  contextType?: StarterContextType
  limit?: number
}

type StarterAnalyticsEvent =
  | 'starter_drawer_opened'
  | 'starter_template_selected'
  | 'starter_template_prefilled'
  | 'first_message_sent_from_template'

export function getSparkContextType(context?: SparkContext): StarterContextType | undefined {
  if (!context) return undefined
  if (context.chart_id) return 'chart'
  if (context.crosstab_id) return 'crosstab'
  if (context.audience_id) return 'audience'
  if (context.dashboard_id) return 'dashboard'
  if (context.report_id) return 'report'
  if (context.canvas_id) return 'canvas'
  return undefined
}

function scoreTemplate(
  template: AgentStarterTemplate,
  options: Required<Pick<ResolveStarterTemplatesOptions, 'contextType'>> &
    Pick<ResolveStarterTemplatesOptions, 'agentId'>
) {
  let score = 0
  if (options.agentId && template.agentId === options.agentId) {
    score += 100
  } else if (options.agentId && template.agentId !== options.agentId) {
    score -= 15
  }

  if (template.contextTypes.includes(options.contextType)) {
    score += 30
  } else if (template.contextTypes.includes('general')) {
    score += 10
  }

  if (template.category === 'Build') score += 4
  if (template.category === 'Discover') score += 3
  if (template.category === 'Validate') score += 2
  if (template.category === 'Deliver') score += 1
  return score
}

export function resolveStarterTemplates({
  agentId,
  contextType = 'general',
  limit = 6,
}: ResolveStarterTemplatesOptions): AgentStarterTemplate[] {
  const ranked = agentStarterTemplates
    .map((template) => ({
      template,
      score: scoreTemplate(template, { agentId, contextType }),
    }))
    .sort((a, b) => b.score - a.score || a.template.title.localeCompare(b.template.title))
    .map((item) => item.template)

  if (agentId) {
    return ranked.filter((template) => template.agentId === agentId).slice(0, limit)
  }

  const topCrossRole = CROSS_ROLE_TEMPLATE_IDS
    .map((id) => getStarterTemplateById(id))
    .filter((template): template is AgentStarterTemplate => Boolean(template))

  const merged = [
    ...topCrossRole,
    ...ranked.filter((template) => !CROSS_ROLE_TEMPLATE_IDS.includes(template.id)),
  ]
  return merged.slice(0, limit)
}

export function buildTemplatePrompt(
  template: AgentStarterTemplate,
  overrides: Record<string, string> = {}
): string {
  let prompt = template.prompt
  for (const placeholder of template.placeholders) {
    const value = overrides[placeholder.key] ?? placeholder.defaultValue
    prompt = prompt.replaceAll(`{{${placeholder.key}}}`, value)
  }
  return prompt
}

export function trackStarterEvent(event: StarterAnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  const detail = {
    event,
    at: new Date().toISOString(),
    ...payload,
  }
  window.dispatchEvent(new CustomEvent('gwi:starter-template-event', { detail }))
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[starter-template-event]', detail)
  }
}
