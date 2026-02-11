import type { SparkChatRequest, SparkChatResponse, SparkConversation } from '../../types'
import { mockConversations } from '../data/spark'
import { delay, findById, newId, now } from '../helpers'

const conversations = [...mockConversations]

export const sparkApi = {
  async chat(data: SparkChatRequest): Promise<SparkChatResponse> {
    await delay(200)

    let conversation = data.conversation_id ? findById(conversations, data.conversation_id) : undefined

    if (!conversation) {
      conversation = {
        id: newId('conv'),
        title: data.message.slice(0, 50),
        messages: [],
        created_at: now(),
        updated_at: now(),
      }
      conversations.unshift(conversation)
    }

    const userMsg = {
      id: newId('msg'),
      role: 'user' as const,
      content: data.message,
      created_at: now(),
    }
    conversation.messages.push(userMsg)

    const assistantMsg = {
      id: newId('msg'),
      role: 'assistant' as const,
      content: generateResponse(data.message, data.context),
      created_at: now(),
      citations: buildCitations(data.context),
      suggested_actions: buildSuggestedActions(data.context),
      narrative_summary: buildNarrativeSummary(data.message, data.context),
      confidence_level: 'high',
      follow_up_questions: buildFollowUps(data.context),
    }
    conversation.messages.push(assistantMsg)
    conversation.updated_at = now()

    return {
      conversation_id: conversation.id,
      message: assistantMsg,
    }
  },

  async getConversations(): Promise<SparkConversation[]> {
    await delay()
    return conversations.map((c) => ({ ...c }))
  },

  async getConversation(id: string): Promise<SparkConversation> {
    await delay()
    const c = findById(conversations, id)
    if (!c) throw new Error(`Conversation ${id} not found`)
    return { ...c }
  },

  async deleteConversation(id: string): Promise<void> {
    await delay()
    const idx = conversations.findIndex((c) => c.id === id)
    if (idx !== -1) conversations.splice(idx, 1)
  },

  async renameConversation(id: string, title: string): Promise<SparkConversation> {
    await delay()
    const c = findById(conversations, id)
    if (!c) throw new Error(`Conversation ${id} not found`)
    c.title = title
    c.updated_at = now()
    return { ...c }
  },

  async getInsights(): Promise<Array<{ id: string; title: string; summary: string; category: string; created_at: string }>> {
    await delay()
    return [
      { id: 'ins-1', title: 'Social Media Shift', summary: 'TikTok surpassed Instagram among 16-24s in Q4 2024', category: 'media', created_at: '2025-01-15T10:00:00Z' },
      { id: 'ins-2', title: 'E-commerce Growth', summary: 'Online purchase frequency increased 12% YoY', category: 'commerce', created_at: '2025-01-14T10:00:00Z' },
      { id: 'ins-3', title: 'Streaming Consolidation', summary: 'Average streaming subscriptions decreased from 3.2 to 2.8', category: 'media', created_at: '2025-01-13T10:00:00Z' },
      { id: 'ins-4', title: 'AI Adoption Surge', summary: 'AI tool usage grew 50% among professionals aged 25-44', category: 'technology', created_at: '2025-01-12T10:00:00Z' },
    ]
  },
}

function buildCitations(context?: SparkChatRequest['context']) {
  const dataset = context?.agent_id ? `Agent ${context.agent_name ?? context.agent_id}` : 'GWI Core Q4 2024'
  return [
    {
      text: 'Based on GWI core data and validated comparisons.',
      source: dataset,
      confidence_level: 'high' as const,
      dataset_id: context?.audience_id,
      wave_id: context?.wave_ids?.[0],
      sample_size: 45200,
    },
  ]
}

function buildNarrativeSummary(message: string, context?: SparkChatRequest['context']) {
  if (context?.agent_id === 'brief-interpreter') {
    return 'Interpreted the brief into objectives, audiences, markets, and outputs.'
  }
  if (context?.agent_id === 'audience-profiler') {
    return 'Defined a target audience with clear behavioral and demographic traits.'
  }
  if (context?.agent_id === 'crosstab-analyst') {
    return 'Generated a crosstab with lift, index, and significance markers.'
  }
  if (context?.agent_id === 'narrative-agent') {
    return 'Converted data points into a concise, client-ready narrative.'
  }
  if (context?.agent_id === 'visualization-agent') {
    return 'Prepared charts and storyboard assets for delivery.'
  }
  if (context?.agent_id === 'governance-agent') {
    return 'Validated claims with citations and compliance checks.'
  }
  if (context?.agent_id === 'connector-agent') {
    return 'Queued delivery to MCP and external systems.'
  }
  if (context?.agent_id === 'advisor-agent') {
    return 'Identified next steps and set monitoring alerts.'
  }
  return `Summary: ${message.slice(0, 80)}${message.length > 80 ? '…' : ''}`
}

function buildFollowUps(context?: SparkChatRequest['context']) {
  if (!context?.agent_id) return ['Compare to last quarter?', 'Create a chart?', 'Export a brief?']
  if (context.agent_id === 'brief-interpreter') return ['Confirm objectives?', 'Add markets?', 'Choose outputs?']
  if (context.agent_id === 'audience-profiler') return ['Validate this audience?', 'Compare to baseline?', 'Save as persona?']
  if (context.agent_id === 'crosstab-analyst') return ['Add significance?', 'Switch metric?', 'Export table?']
  if (context.agent_id === 'narrative-agent') return ['Adjust tone?', 'Shorten summary?', 'Add citations?']
  if (context.agent_id === 'visualization-agent') return ['Build a dashboard?', 'Generate a deck?', 'Export PNGs?']
  if (context.agent_id === 'governance-agent') return ['Approve output?', 'Flag low confidence?', 'Add compliance note?']
  if (context.agent_id === 'connector-agent') return ['Deliver to Slack?', 'Send to BI?', 'Publish to workspace?']
  if (context.agent_id === 'advisor-agent') return ['Set alert thresholds?', 'Compare to last year?', 'Track ROI?']
  return ['Next steps?']
}

function buildSuggestedActions(context?: SparkChatRequest['context']) {
  if (context?.agent_id === 'brief-interpreter') {
    return [
      { type: 'navigate' as const, label: 'Open Workflow', payload: { path: '/app/canvas' } },
      { type: 'create_audience' as const, label: 'Start Audience Builder', payload: { audience_id: '' } },
    ]
  }
  if (context?.agent_id === 'audience-profiler') {
    return [
      { type: 'create_audience' as const, label: 'Open Audience', payload: { audience_id: '' } },
      { type: 'create_chart' as const, label: 'Chart Audience', payload: { chart_id: '' } },
    ]
  }
  if (context?.agent_id === 'crosstab-analyst') {
    return [
      { type: 'show_data' as const, label: 'Open Crosstab', payload: { crosstab_id: '' } },
      { type: 'create_chart' as const, label: 'Visualize Crosstab', payload: { chart_id: '' } },
    ]
  }
  if (context?.agent_id === 'visualization-agent') {
    return [
      { type: 'create_dashboard' as const, label: 'Create Dashboard', payload: {} },
      { type: 'export_report' as const, label: 'Export Deck', payload: {} },
    ]
  }
  if (context?.agent_id === 'governance-agent') {
    return [
      { type: 'navigate' as const, label: 'Open Audit Log', payload: { path: '/app/account-settings' } },
      { type: 'export_report' as const, label: 'Export Validation', payload: {} },
    ]
  }
  if (context?.agent_id === 'advisor-agent') {
    return [
      { type: 'navigate' as const, label: 'Set Alerts', payload: { path: '/app/dashboards' } },
      { type: 'show_data' as const, label: 'Review Insights', payload: { crosstab_id: '' } },
    ]
  }
  if (context?.chart_id) {
    return [
      { type: 'create_chart' as const, label: 'Open This Chart', payload: { chart_id: context.chart_id } },
      { type: 'show_data' as const, label: 'View Chart as Crosstab', payload: { crosstab_id: context.crosstab_id ?? '' } },
    ]
  }
  if (context?.crosstab_id) {
    return [
      { type: 'show_data' as const, label: 'Open This Crosstab', payload: { crosstab_id: context.crosstab_id } },
      { type: 'create_chart' as const, label: 'Chart This Data', payload: { chart_id: '' } },
    ]
  }
  if (context?.audience_id) {
    return [
      { type: 'create_audience' as const, label: 'Edit This Audience', payload: { audience_id: context.audience_id } },
      { type: 'create_chart' as const, label: 'Chart This Audience', payload: { chart_id: '' } },
    ]
  }
  if (context?.dashboard_id) {
    return [
      { type: 'navigate' as const, label: 'Back to Dashboard', payload: { path: `/app/dashboards/${context.dashboard_id}` } },
      { type: 'create_chart' as const, label: 'Add a Chart', payload: { chart_id: '' } },
    ]
  }
  // No context — generic actions
  return [
    { type: 'create_chart' as const, label: 'Create a Chart', payload: {} },
    { type: 'show_data' as const, label: 'Explore Data', payload: {} },
  ]
}

function generateResponse(message: string, context?: SparkChatRequest['context']): string {
  const lower = message.toLowerCase()

  const agentPrefix = context?.agent_name
    ? `**${context.agent_name}** responding. `
    : ''

  // Context-aware prefix so the user can see Spark knows what they were looking at
  const contextPrefix = context?.chart_id
    ? `I can see you're working with chart **${context.chart_id}**${context.wave_ids?.length ? ` (wave: ${context.wave_ids.join(', ')})` : ''}${context.location_ids?.length ? ` in ${context.location_ids.join(', ')}` : ''}. `
    : context?.crosstab_id
      ? `I can see you're viewing crosstab **${context.crosstab_id}**${context.wave_ids?.length ? ` (wave: ${context.wave_ids.join(', ')})` : ''}. `
      : context?.dashboard_id
        ? `I can see you're on dashboard **${context.dashboard_id}**. `
        : context?.audience_id
          ? `I can see you're working with audience **${context.audience_id}**. `
          : ''

  if (context?.agent_id === 'brief-interpreter') {
    return `${agentPrefix}${contextPrefix}I parsed the brief into: objective, target audience, markets, and outputs. Next I can build the workflow and spin up a workspace.`
  }
  if (context?.agent_id === 'audience-profiler') {
    return `${agentPrefix}${contextPrefix}I can build a validated audience definition and size it against GWI Core. Provide any constraints (age, market, behaviors).`
  }
  if (context?.agent_id === 'crosstab-analyst') {
    return `${agentPrefix}${contextPrefix}I ran a preliminary crosstab with index and significance. Want to refine metrics or add comparison groups?`
  }
  if (context?.agent_id === 'narrative-agent') {
    return `${agentPrefix}${contextPrefix}Here is a concise narrative summary with key lifts and recommended next steps. I can adjust tone or expand the story.`
  }
  if (context?.agent_id === 'visualization-agent') {
    return `${agentPrefix}${contextPrefix}I can produce charts, dashboards, and a deck-ready storyboard. Which format do you want first?`
  }
  if (context?.agent_id === 'governance-agent') {
    return `${agentPrefix}${contextPrefix}I have validated the insights against source data and attached citations. Anything to recheck?`
  }
  if (context?.agent_id === 'connector-agent') {
    return `${agentPrefix}${contextPrefix}Outputs are ready for delivery. Choose destinations (MCP, Slack, BI, S3).`
  }
  if (context?.agent_id === 'advisor-agent') {
    return `${agentPrefix}${contextPrefix}I am monitoring KPI shifts and can alert on anomalies. Want thresholds or cadence changes?`
  }

  if (lower.includes('social media') || lower.includes('social platform')) {
    return agentPrefix + contextPrefix + 'Based on Q4 2024 data, social media usage continues to grow across all demographics. YouTube leads with 88% penetration, followed by Facebook (62%), Instagram (51%), and TikTok (38%). The most notable trend is TikTok\'s rapid growth among 16-24 year olds, reaching 52% in that age group.\n\nWould you like me to create a chart showing platform usage by age group?'
  }
  if (lower.includes('audience') || lower.includes('segment')) {
    return contextPrefix + 'I can help you build an audience segment. Our data covers 45,200 respondents across 20 markets in Q4 2024. You can combine demographic filters (age, gender, income) with behavioral data (media usage, purchase behavior, attitudes) to create precise audience definitions.\n\nWhat criteria would you like to use for your audience?'
  }
  if (lower.includes('trend') || lower.includes('change')) {
    return contextPrefix + 'Looking at quarterly trends in our data:\n\n- **Social media time** has increased 8% YoY\n- **Streaming subscriptions** average 2.8 per household (up from 2.4)\n- **AI tool adoption** has grown from 28% to 42% in the past year\n- **E-commerce** now accounts for 31% of retail purchases\n\nWould you like me to dive deeper into any of these trends?'
  }

  if (contextPrefix) {
    return contextPrefix + `Here are the key findings related to your query:\n\n1. **Primary Trend**: The data shows significant shifts in consumer behavior across digital platforms\n2. **Age Differences**: Younger demographics (16-34) show markedly different patterns from 35+\n3. **Market Variation**: US and UK markets lead in adoption, while emerging markets show fastest growth\n\nWould you like me to dive deeper into this data?`
  }

  return `${agentPrefix}Great question! Based on the GWI Q4 2024 dataset covering 45,200 respondents across 20 markets, I can provide detailed insights on this topic.\n\nHere are the key findings related to your query:\n\n1. **Primary Trend**: The data shows significant shifts in consumer behavior across digital platforms\n2. **Age Differences**: Younger demographics (16-34) show markedly different patterns from 35+\n3. **Market Variation**: US and UK markets lead in adoption, while emerging markets show fastest growth\n\nWould you like me to create a visualization, build an audience segment, or explore specific data points?`
}
