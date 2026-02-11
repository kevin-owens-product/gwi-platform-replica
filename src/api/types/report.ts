// Report types for the GWI Platform API -- fully enhanced

import type { PaginationParams, SharingConfig, ExportFormat } from './common'
import type { ChartType } from './chart'
import type { SparkVisualization, SparkDataTable } from './spark'

export interface Report {
  id: string
  name: string
  type: ExportFormat
  size: string
  category: 'industry' | 'research' | 'custom' | 'automated' | 'data_story'
  tags: string[]
  download_url: string
  created_at: string
  updated_at: string
  project_id?: string
  team_id?: string
  // New fields
  author?: string
  description?: string
  sharing?: SharingConfig
  template_id?: string
  schedule_id?: string
  interactive_url?: string
  view_count?: number
  last_viewed_at?: string
}

// Report builder
export interface ReportBuilder {
  id: string
  name: string
  description?: string
  format: 'PDF' | 'PPTX' | 'DOCX'
  brand_config: BrandConfig
  sections: ReportSection[]
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  author: string
  sharing?: SharingConfig
}

export interface BrandConfig {
  logo_url?: string
  primary_color: string
  secondary_color: string
  accent_color?: string
  font_family: string
  cover_image_url?: string
  footer_text: string
  header_text?: string
}

export type ReportSectionType =
  | 'cover'
  | 'executive_summary'
  | 'chart'
  | 'table'
  | 'crosstab'
  | 'narrative'
  | 'key_findings'
  | 'methodology'
  | 'appendix'
  | 'divider'
  | 'image'
  | 'two_column'

export interface ReportSection {
  id: string
  type: ReportSectionType
  title?: string
  order: number
  chart_id?: string
  crosstab_id?: string
  dashboard_widget_id?: string
  text_content?: string
  image_url?: string
  ai_generated?: boolean
  ai_prompt?: string
  layout?: 'full_width' | 'half_width' | 'third_width'
  page_break_before?: boolean
}

// Report templates
export interface ReportTemplate {
  id: string
  name: string
  description: string
  format: 'PDF' | 'PPTX' | 'DOCX'
  category: 'executive_summary' | 'deep_dive' | 'competitive' | 'media_plan' | 'audience_profile' | 'brand_health' | 'custom'
  brand_config: BrandConfig
  sections: ReportSection[]
  thumbnail_url: string
  usage_count: number
}

// Scheduled report delivery
export interface ReportSchedule {
  id: string
  report_builder_id?: string
  template_id?: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  day_of_week?: number
  day_of_month?: number
  time: string
  timezone: string
  recipients: string[]
  format: ExportFormat
  include_narrative: boolean
  auto_update_data: boolean
  enabled: boolean
  last_sent_at?: string
  next_send_at?: string
  delivery_history?: Array<{
    sent_at: string
    recipients: string[]
    status: 'sent' | 'failed' | 'bounced'
    opened_by?: string[]
  }>
}

// Data Stories
export interface DataStory {
  id: string
  title: string
  description?: string
  author: string
  created_at: string
  updated_at: string
  slides: DataStorySlide[]
  status: 'draft' | 'published'
  share_url?: string
  sharing?: SharingConfig
  tags?: string[]
  view_count?: number
  comments?: Array<{
    id: string
    user_name: string
    content: string
    slide_id?: string
    created_at: string
  }>
}

export type DataStorySlideType = 'title' | 'insight' | 'chart' | 'comparison' | 'callout' | 'conclusion' | 'data_table' | 'quote'

export interface DataStorySlide {
  id: string
  order: number
  type: DataStorySlideType
  title?: string
  narrative: string
  visualization?: SparkVisualization
  data_table?: SparkDataTable
  chart_id?: string
  chart_type?: ChartType
  annotations?: Array<{
    text: string
    position: { x: number; y: number }
    style?: 'highlight' | 'callout' | 'arrow'
  }>
  transition_text?: string
  background_color?: string
  layout?: 'full' | 'split_left' | 'split_right' | 'centered'
}

// Interactive report sharing
export interface InteractiveReport {
  id: string
  report_id: string
  share_url: string
  password_protected: boolean
  expires_at?: string
  allow_comments: boolean
  allow_export: boolean
  created_at: string
  access_log?: Array<{
    user_identifier: string
    accessed_at: string
    duration_seconds: number
    pages_viewed: number
  }>
}

export interface ReportListParams extends PaginationParams {
  search?: string
  project_id?: string
  category?: string
  tags?: string[]
  format?: ExportFormat
  author?: string
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'view_count'
  sort_order?: 'asc' | 'desc'
}
