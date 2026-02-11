// Agent Spark (AI) types for the GWI Platform API -- fully enhanced

import type { ChartType } from './chart'

export interface SparkMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  citations?: SparkCitation[]
  suggested_actions?: SparkAction[]
  // New fields
  visualization?: SparkVisualization
  data_table?: SparkDataTable
  narrative_summary?: string
  follow_up_questions?: string[]
  recommended_chart_type?: ChartType
  chart_alternatives?: ChartType[]
  confidence_level?: 'high' | 'medium' | 'low'
  thinking_steps?: string[]
}

export interface SparkCitation {
  text: string
  source: string
  url?: string
  // New provenance fields
  dataset_id?: string
  wave_id?: string
  sample_size?: number
  confidence_level?: 'high' | 'medium' | 'low'
  methodology_note?: string
}

export interface SparkAction {
  type: 'create_chart' | 'create_audience' | 'show_data' | 'navigate' | 'create_crosstab' | 'create_dashboard' | 'export_report' | 'compare_audiences' | 'analyze_overlap' | 'deliver_output'
  label: string
  payload: Record<string, unknown> & {
    destination_ids?: string[]
    connection_ids?: string[]
  }
}

// Inline visualization in chat
export interface SparkVisualization {
  chart_type: ChartType
  data: Record<string, unknown>[]
  series: string[]
  title?: string
  subtitle?: string
  x_axis_label?: string
  y_axis_label?: string
  color_scheme?: string
}

// Inline data table in chat
export interface SparkDataTable {
  columns: Array<{
    key: string
    label: string
    format?: 'number' | 'percent' | 'currency' | 'text' | 'index'
  }>
  rows: Record<string, unknown>[]
  highlight_column?: string
  sort_by?: string
  summary_row?: Record<string, unknown>
}

export interface SparkConversation {
  id: string
  title: string
  messages: SparkMessage[]
  created_at: string
  updated_at: string
  // New fields
  context?: SparkContext
  pinned?: boolean
  tags?: string[]
  summary?: string
}

export interface SparkChatRequest {
  message: string
  conversation_id?: string
  context?: SparkContext
  // New fields
  stream?: boolean
  include_visualization?: boolean
  include_data_table?: boolean
  preferred_chart_type?: ChartType
}

export interface SparkContext {
  audience_id?: string
  chart_id?: string
  dashboard_id?: string
  crosstab_id?: string
  agent_id?: string
  agent_name?: string
  agent_category?: string
  wave_ids?: string[]
  location_ids?: string[]
  question_ids?: string[]
  report_id?: string
  canvas_id?: string
  tv_study_id?: string
  print_rf_id?: string
  project_id?: string
  team_id?: string
  active_filters?: Record<string, unknown>
}

export interface SparkChatResponse {
  conversation_id: string
  message: SparkMessage
}

// Proactive insights
export interface SparkInsight {
  id: string
  type: 'anomaly' | 'trend' | 'opportunity' | 'alert' | 'recommendation'
  title: string
  description: string
  severity: 'info' | 'notable' | 'important' | 'critical'
  metric_name?: string
  current_value?: number
  previous_value?: number
  change_pct?: number
  related_entity?: {
    type: 'audience' | 'chart' | 'crosstab' | 'dashboard'
    id: string
    name: string
  }
  suggested_action?: SparkAction
  created_at: string
  dismissed?: boolean
}

// Streaming response for SSE
export interface SparkStreamChunk {
  type: 'token' | 'citation' | 'action' | 'visualization' | 'data_table' | 'follow_up' | 'done'
  content?: string
  citation?: SparkCitation
  action?: SparkAction
  visualization?: SparkVisualization
  data_table?: SparkDataTable
  follow_up_questions?: string[]
}
