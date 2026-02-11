// Chart types for the GWI Platform API -- fully enhanced

import type { MetricType, WaveId, ExportOptions, SharingConfig, VersionEntry, PaletteMode } from './common'
import type { AudienceExpression } from './audience'

export type ChartType =
  | 'bar'
  | 'stacked_bar'
  | 'grouped_bar'
  | 'horizontal_bar'
  | 'line'
  | 'area'
  | 'stacked_area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'table'
  | 'combo'
  | 'waterfall'
  | 'funnel'
  | 'radar'
  | 'treemap'
  | 'bullet'
  | 'heatmap'
  | 'gauge'
  | 'sankey'
  | 'geo_map'

export interface Chart {
  id: string
  name: string
  description?: string
  chart_type: ChartType
  config: ChartConfig
  created_at: string
  updated_at: string
  user_id: string
  project_id?: string
  team_id?: string
  is_shared: boolean
  thumbnail_url?: string
  // New fields
  tags?: string[]
  folder_id?: string
  sharing?: SharingConfig
  versions?: VersionEntry[]
  data_source_label?: string
}

export interface ChartConfig {
  rows: ChartDimension[]
  columns: ChartDimension[]
  metrics: MetricType[]
  base_audience?: AudienceExpression
  wave_ids: WaveId[]
  location_ids: string[]
  options?: ChartOptions
  // New config sections
  annotations?: ChartAnnotation[]
  statistical_overlays?: StatisticalOverlays
  comparison?: ComparisonConfig
  accessibility?: AccessibilityOptions
  responsive?: ResponsiveChartConfig
  export_defaults?: ExportOptions
}

export interface ChartDimension {
  type: 'question' | 'audience' | 'wave' | 'location'
  question_id?: string
  datapoint_ids?: string[]
  audience_ids?: string[]
}

export interface ChartOptions {
  // Existing
  show_labels?: boolean
  show_legend?: boolean
  show_grid?: boolean
  color_scheme?: string
  sort_by?: 'value' | 'label'
  sort_order?: 'asc' | 'desc'
  limit?: number
  // Interactivity
  enable_drill_down?: boolean
  drill_down_hierarchy?: string[]
  enable_cross_filter?: boolean
  enable_brushing?: boolean
  enable_zoom?: boolean
  enable_animation?: boolean
  animation_duration_ms?: number
  tooltip_format?: 'compact' | 'detailed'
  // Display
  orientation?: 'vertical' | 'horizontal'
  stacking_mode?: 'none' | 'stacked' | 'percent'
  show_data_table?: boolean
  show_values_on_chart?: boolean
  color_by?: 'series' | 'value' | 'threshold'
  // Combo chart specific
  secondary_axis_metrics?: MetricType[]
  secondary_chart_type?: ChartType
  // Bullet chart specific
  target_value?: number
  qualitative_ranges?: Array<{ label: string; min: number; max: number; color: string }>
  // Gauge specific
  gauge_min?: number
  gauge_max?: number
  gauge_thresholds?: Array<{ value: number; color: string; label: string }>
}

// Statistical overlays
export interface StatisticalOverlays {
  trend_line?: {
    enabled: boolean
    type: 'linear' | 'logarithmic' | 'exponential' | 'polynomial'
    show_equation?: boolean
    show_r_squared?: boolean
    color?: string
  }
  confidence_interval?: {
    enabled: boolean
    level: 0.90 | 0.95 | 0.99
    color?: string
  }
  forecast?: {
    enabled: boolean
    periods_ahead: number
    show_confidence_band?: boolean
  }
  anomaly_detection?: {
    enabled: boolean
    sensitivity: 'low' | 'medium' | 'high'
    marker_color?: string
  }
  reference_lines?: Array<{
    type: 'mean' | 'median' | 'percentile' | 'custom'
    value?: number
    percentile?: number
    label: string
    style: 'solid' | 'dashed' | 'dotted'
    color?: string
  }>
}

// Annotations
export interface ChartAnnotation {
  id: string
  type: 'text' | 'callout' | 'highlight_region' | 'reference_marker'
  content: string
  anchor: {
    data_point_index?: number
    x_value?: string | number
    y_value?: number
    position?: 'top' | 'bottom' | 'left' | 'right'
  }
  style?: {
    font_size?: number
    color?: string
    background?: string
    arrow?: boolean
  }
}

// Comparison features
export interface ComparisonConfig {
  mode: 'none' | 'period_over_period' | 'audience_comparison' | 'benchmark'
  comparison_wave_ids?: WaveId[]
  comparison_audience_id?: string
  benchmarks?: Array<{
    label: string
    value: number
    style: 'solid' | 'dashed' | 'dotted'
    color?: string
  }>
  show_absolute_change?: boolean
  show_percentage_change?: boolean
  index_baseline?: number
  comparison_visual_style?: 'grouped' | 'overlaid' | 'side_by_side'
}

// Accessibility
export interface AccessibilityOptions {
  palette_mode: PaletteMode
  use_patterns: boolean
  show_data_table: boolean
  enable_keyboard_nav: boolean
  reduce_motion: boolean
}

// Responsive configuration
export interface ResponsiveChartConfig {
  breakpoints?: {
    sm?: Partial<ChartOptions>
    md?: Partial<ChartOptions>
    lg?: Partial<ChartOptions>
  }
  aspect_ratio?: number
  min_height?: number
  max_height?: number
  mobile_fallback_type?: ChartType
}

export interface CreateChartRequest {
  name: string
  description?: string
  chart_type: ChartType
  config: ChartConfig
  project_id?: string
  is_shared?: boolean
  tags?: string[]
  folder_id?: string
}

export interface UpdateChartRequest {
  name?: string
  description?: string
  chart_type?: ChartType
  config?: Partial<ChartConfig>
  is_shared?: boolean
  tags?: string[]
  folder_id?: string
}

export interface ChartListParams {
  page?: number
  per_page?: number
  search?: string
  project_id?: string
  sort_by?: 'name' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
  tags?: string[]
  folder_id?: string
  chart_type?: ChartType
}
