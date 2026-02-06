// Chart types for the GWI Platform API

import type { MetricType, WaveId } from './common'
import type { AudienceExpression } from './audience'

export type ChartType = 'bar' | 'stacked_bar' | 'line' | 'pie' | 'donut' | 'table' | 'scatter'

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
  is_shared: boolean
  thumbnail_url?: string
}

export interface ChartConfig {
  rows: ChartDimension[]
  columns: ChartDimension[]
  metrics: MetricType[]
  base_audience?: AudienceExpression
  wave_ids: WaveId[]
  location_ids: string[]
  options?: ChartOptions
}

export interface ChartDimension {
  type: 'question' | 'audience' | 'wave' | 'location'
  question_id?: string
  datapoint_ids?: string[]
  audience_ids?: string[]
}

export interface ChartOptions {
  show_labels?: boolean
  show_legend?: boolean
  show_grid?: boolean
  color_scheme?: string
  sort_by?: 'value' | 'label'
  sort_order?: 'asc' | 'desc'
  limit?: number
}

export interface CreateChartRequest {
  name: string
  description?: string
  chart_type: ChartType
  config: ChartConfig
  project_id?: string
  is_shared?: boolean
}

export interface UpdateChartRequest {
  name?: string
  description?: string
  chart_type?: ChartType
  config?: Partial<ChartConfig>
  is_shared?: boolean
}

export interface ChartListParams {
  page?: number
  per_page?: number
  search?: string
  project_id?: string
  sort_by?: 'name' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
}
