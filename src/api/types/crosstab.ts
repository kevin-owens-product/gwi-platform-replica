// Crosstab types for the GWI Platform API

import type { MetricType, WaveId } from './common'
import type { AudienceExpression } from './audience'

export interface Crosstab {
  id: string
  name: string
  description?: string
  config: CrosstabConfig
  created_at: string
  updated_at: string
  user_id: string
  project_id?: string
  is_shared: boolean
}

export interface CrosstabConfig {
  rows: CrosstabDimension[]
  columns: CrosstabDimension[]
  metrics: MetricType[]
  base_audience?: AudienceExpression
  wave_ids: WaveId[]
  location_ids: string[]
  highlight?: CrosstabHighlight
}

export interface CrosstabDimension {
  type: 'question' | 'audience'
  question_id?: string
  datapoint_ids?: string[]
  audience_id?: string
}

export interface CrosstabHighlight {
  type: 'heatmap' | 'above_average' | 'significance'
  threshold?: number
}

export interface CrosstabQueryResult {
  rows: CrosstabRow[]
  columns: CrosstabColumn[]
  cells: CrosstabCell[][]
  meta: {
    base_size: number
    wave_name: string
    location_name: string
  }
}

export interface CrosstabRow {
  id: string
  label: string
  parent_id?: string
}

export interface CrosstabColumn {
  id: string
  label: string
}

export interface CrosstabCell {
  values: Record<MetricType, number>
  significant?: boolean
  sample_size: number
}

export interface CreateCrosstabRequest {
  name: string
  description?: string
  config: CrosstabConfig
  project_id?: string
  is_shared?: boolean
}

export interface UpdateCrosstabRequest {
  name?: string
  description?: string
  config?: Partial<CrosstabConfig>
  is_shared?: boolean
}
