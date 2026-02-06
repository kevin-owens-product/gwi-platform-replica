// Agent Spark (AI) types for the GWI Platform API

export interface SparkMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  citations?: SparkCitation[]
  suggested_actions?: SparkAction[]
}

export interface SparkCitation {
  text: string
  source: string
  url?: string
}

export interface SparkAction {
  type: 'create_chart' | 'create_audience' | 'show_data' | 'navigate'
  label: string
  payload: Record<string, unknown>
}

export interface SparkConversation {
  id: string
  title: string
  messages: SparkMessage[]
  created_at: string
  updated_at: string
}

export interface SparkChatRequest {
  message: string
  conversation_id?: string
  context?: SparkContext
}

export interface SparkContext {
  audience_id?: string
  chart_id?: string
  wave_ids?: string[]
  location_ids?: string[]
}

export interface SparkChatResponse {
  conversation_id: string
  message: SparkMessage
}
