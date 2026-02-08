// Dashboard types for the GWI Platform API -- fully enhanced

import type { ChartConfig, ChartType } from './chart'
import type { AudienceExpression } from './audience'
import type { SharingConfig, VersionEntry, ExportOptions, MetricType } from './common'

export interface Dashboard {
  id: string
  name: string
  description?: string
  widgets: DashboardWidget[]
  layout: DashboardLayout
  created_at: string
  updated_at: string
  user_id: string
  project_id?: string
  is_shared: boolean
  thumbnail_url?: string
  base_audience?: AudienceExpression
  // New fields
  tags?: string[]
  folder_id?: string
  sharing?: SharingConfig
  versions?: VersionEntry[]
  filters?: DashboardFilter[]
  filter_state?: Record<string, unknown>
  refresh_config?: DashboardRefreshConfig
  presentation_config?: PresentationConfig
  template_id?: string
  comments?: DashboardComment[]
}

// Enhanced widget types
export type DashboardWidgetType =
  | 'chart'
  | 'stat'
  | 'text'
  | 'image'
  | 'gauge'
  | 'sparkline'
  | 'table'
  | 'funnel'
  | 'map'
  | 'list'
  | 'embed'
  | 'divider'

export interface DashboardWidget {
  id: string
  type: DashboardWidgetType
  title?: string
  chart_id?: string
  chart_type?: ChartType
  chart_config?: ChartConfig
  text_content?: string
  image_url?: string
  position: WidgetPosition
  // New widget fields
  locked?: boolean
  visible_breakpoints?: ('sm' | 'md' | 'lg')[]
  cross_filter_enabled?: boolean
  cross_filter_source?: boolean
  conditional_formatting?: WidgetConditionalFormatting
  refresh_interval_ms?: number
  // KPI/Stat specific
  stat_config?: StatWidgetConfig
  // Gauge specific
  gauge_config?: GaugeWidgetConfig
  // Sparkline specific
  sparkline_config?: SparklineWidgetConfig
  // Table specific
  table_config?: TableWidgetConfig
  // List/Leaderboard specific
  list_config?: ListWidgetConfig
  // Map specific
  map_config?: MapWidgetConfig
  // Embed specific
  embed_url?: string
}

export interface StatWidgetConfig {
  value: number
  label: string
  format: 'number' | 'percentage' | 'currency' | 'compact'
  comparison?: {
    value: number
    period_label: string
    direction: 'up' | 'down' | 'flat'
  }
  sparkline_data?: number[]
  target?: number
  metric_type?: MetricType
  color?: string
}

export interface GaugeWidgetConfig {
  value: number
  min: number
  max: number
  thresholds: Array<{ value: number; color: string; label: string }>
  format: 'number' | 'percentage'
  label: string
}

export interface SparklineWidgetConfig {
  data: number[]
  labels?: string[]
  color: string
  fill?: boolean
  show_min_max?: boolean
}

export interface TableWidgetConfig {
  columns: Array<{
    key: string
    label: string
    format?: 'number' | 'percentage' | 'text' | 'currency'
    sortable?: boolean
    width?: number
    conditional_formatting?: WidgetConditionalFormatting
  }>
  rows: Record<string, unknown>[]
  page_size?: number
  sortable?: boolean
  striped?: boolean
}

export interface ListWidgetConfig {
  items: Array<{
    rank: number
    label: string
    value: number
    format?: 'number' | 'percentage'
    bar_color?: string
    icon?: string
  }>
  show_bars?: boolean
  max_items?: number
}

export interface MapWidgetConfig {
  map_type: 'choropleth' | 'bubble' | 'point'
  data: Array<{
    location_id: string
    location_name: string
    value: number
    lat?: number
    lng?: number
  }>
  color_scale?: { min_color: string; max_color: string }
  zoom_level?: number
  center?: { lat: number; lng: number }
}

export interface WidgetConditionalFormatting {
  rules: Array<{
    condition: 'greater_than' | 'less_than' | 'between' | 'equals'
    value: number
    value2?: number
    style: {
      background_color?: string
      text_color?: string
      icon?: 'arrow_up' | 'arrow_down' | 'check' | 'x' | 'warning'
    }
  }>
}

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
  min_w?: number
  min_h?: number
  max_w?: number
  max_h?: number
}

export interface DashboardLayout {
  columns: number
  row_height: number
  // New layout fields
  breakpoints?: {
    sm?: { columns: number; row_height: number }
    md?: { columns: number; row_height: number }
    lg?: { columns: number; row_height: number }
  }
  gap?: number
  padding?: number
}

// Dashboard-level filters
export interface DashboardFilter {
  id: string
  type: 'date_range' | 'dropdown' | 'multi_select' | 'search' | 'toggle'
  label: string
  field: string
  options?: Array<{ label: string; value: string }>
  default_value?: unknown
  cascading_parent_id?: string
  affects_widgets?: string[] // empty = all widgets
}

export interface DashboardFilterPreset {
  id: string
  name: string
  values: Record<string, unknown>
}

// Refresh configuration
export interface DashboardRefreshConfig {
  mode: 'manual' | 'polling' | 'websocket'
  polling_interval_ms?: number
  show_last_updated: boolean
  auto_reconnect?: boolean
}

// Presentation / kiosk mode
export interface PresentationConfig {
  enabled: boolean
  playlist?: Array<{
    dashboard_id: string
    dwell_time_seconds: number
  }>
  transition: 'fade' | 'slide' | 'none'
  loop: boolean
  dark_mode: boolean
  hide_filters: boolean
  auto_refresh: boolean
  presenter_notes?: string
}

// Comments
export interface DashboardComment {
  id: string
  widget_id?: string
  user_id: string
  user_name: string
  content: string
  created_at: string
  replies?: DashboardComment[]
  mentions?: string[]
}

// Scheduled snapshots
export interface DashboardSchedule {
  id: string
  dashboard_id: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  day_of_week?: number
  day_of_month?: number
  time: string // HH:mm
  timezone: string
  recipients: string[]
  format: 'pdf' | 'png' | 'inline_html'
  include_widgets?: string[]
  conditional_delivery: boolean
  condition?: { metric: string; operator: 'above' | 'below'; threshold: number }
  last_sent_at?: string
  next_send_at?: string
  enabled: boolean
}

// Templates
export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: 'executive' | 'sales' | 'marketing' | 'product' | 'operations' | 'financial' | 'custom'
  thumbnail_url: string
  widgets: DashboardWidget[]
  layout: DashboardLayout
  filters?: DashboardFilter[]
}

// Alert configuration
export interface DashboardAlert {
  id: string
  widget_id: string
  metric: string
  condition: 'above' | 'below' | 'change_by'
  threshold: number
  notification_channels: ('in_app' | 'email' | 'slack')[]
  recipients: string[]
  cooldown_minutes: number
  enabled: boolean
  last_triggered_at?: string
}

export interface CreateDashboardRequest {
  name: string
  description?: string
  widgets?: DashboardWidget[]
  layout?: DashboardLayout
  project_id?: string
  is_shared?: boolean
  tags?: string[]
  folder_id?: string
  filters?: DashboardFilter[]
  template_id?: string
}

export interface UpdateDashboardRequest {
  name?: string
  description?: string
  widgets?: DashboardWidget[]
  layout?: DashboardLayout
  is_shared?: boolean
  base_audience?: AudienceExpression
  tags?: string[]
  folder_id?: string
  filters?: DashboardFilter[]
  filter_state?: Record<string, unknown>
  refresh_config?: DashboardRefreshConfig
  presentation_config?: PresentationConfig
}
