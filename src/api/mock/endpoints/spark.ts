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
      citations: [{ text: 'Based on GWI Q4 2024 data', source: 'GWI Core Q4 2024' }],
      suggested_actions: buildSuggestedActions(data.context),
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

function buildSuggestedActions(context?: SparkChatRequest['context']) {
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

  if (lower.includes('social media') || lower.includes('social platform')) {
    return contextPrefix + 'Based on Q4 2024 data, social media usage continues to grow across all demographics. YouTube leads with 88% penetration, followed by Facebook (62%), Instagram (51%), and TikTok (38%). The most notable trend is TikTok\'s rapid growth among 16-24 year olds, reaching 52% in that age group.\n\nWould you like me to create a chart showing platform usage by age group?'
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

  return `Great question! Based on the GWI Q4 2024 dataset covering 45,200 respondents across 20 markets, I can provide detailed insights on this topic.\n\nHere are the key findings related to your query:\n\n1. **Primary Trend**: The data shows significant shifts in consumer behavior across digital platforms\n2. **Age Differences**: Younger demographics (16-34) show markedly different patterns from 35+\n3. **Market Variation**: US and UK markets lead in adoption, while emerging markets show fastest growth\n\nWould you like me to create a visualization, build an audience segment, or explore specific data points?`
}
