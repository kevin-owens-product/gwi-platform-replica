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
      content: generateResponse(data.message),
      created_at: now(),
      citations: [{ text: 'Based on GWI Q4 2024 data', source: 'GWI Core Q4 2024' }],
      suggested_actions: [
        { type: 'create_chart' as const, label: 'Visualize This Data', payload: {} },
        { type: 'show_data' as const, label: 'View Raw Data', payload: {} },
      ],
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
}

function generateResponse(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('social media') || lower.includes('social platform')) {
    return 'Based on Q4 2024 data, social media usage continues to grow across all demographics. YouTube leads with 88% penetration, followed by Facebook (62%), Instagram (51%), and TikTok (38%). The most notable trend is TikTok\'s rapid growth among 16-24 year olds, reaching 52% in that age group.\n\nWould you like me to create a chart showing platform usage by age group?'
  }
  if (lower.includes('audience') || lower.includes('segment')) {
    return 'I can help you build an audience segment. Our data covers 45,200 respondents across 20 markets in Q4 2024. You can combine demographic filters (age, gender, income) with behavioral data (media usage, purchase behavior, attitudes) to create precise audience definitions.\n\nWhat criteria would you like to use for your audience?'
  }
  if (lower.includes('trend') || lower.includes('change')) {
    return 'Looking at quarterly trends in our data:\n\n- **Social media time** has increased 8% YoY\n- **Streaming subscriptions** average 2.8 per household (up from 2.4)\n- **AI tool adoption** has grown from 28% to 42% in the past year\n- **E-commerce** now accounts for 31% of retail purchases\n\nWould you like me to dive deeper into any of these trends?'
  }

  return `Great question! Based on the GWI Q4 2024 dataset covering 45,200 respondents across 20 markets, I can provide detailed insights on this topic.\n\nHere are the key findings related to your query:\n\n1. **Primary Trend**: The data shows significant shifts in consumer behavior across digital platforms\n2. **Age Differences**: Younger demographics (16-34) show markedly different patterns from 35+\n3. **Market Variation**: US and UK markets lead in adoption, while emerging markets show fastest growth\n\nWould you like me to create a visualization, build an audience segment, or explore specific data points?`
}
