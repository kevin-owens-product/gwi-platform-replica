// Data query types for the GWI Platform API -- enhanced

import type { MetricType, WaveId } from './common'
import type { AudienceExpression } from './audience'

// Stats query - used for charts and simple data queries
export interface StatsQueryRequest {
  question_ids: string[]
  metrics: MetricType[]
  wave_ids: WaveId[]
  location_ids: string[]
  base_audience?: AudienceExpression
  compare_audiences?: AudienceExpression[]
  filters?: QueryFilter[]
  // New fields
  include_trend?: boolean
  include_confidence_intervals?: boolean
  comparison_wave_ids?: WaveId[]
}

export interface StatsQueryResponse {
  results: StatsResult[]
  meta: QueryMeta
}

export interface StatsResult {
  question_id: string
  question_name: string
  datapoints: StatsDatapoint[]
}

export interface StatsDatapoint {
  datapoint_id: string
  datapoint_name: string
  metrics: Record<string, number>
  audience_metrics?: Record<string, Record<string, number>>
  // New fields
  trend_data?: number[]
  confidence_interval?: { lower: number; upper: number }
  is_anomaly?: boolean
  comparison_value?: number
  comparison_change_pct?: number
}

// Crosstab query
export interface CrosstabQueryRequest {
  row_question_ids: string[]
  column_question_ids?: string[]
  column_audience_ids?: string[]
  metrics: MetricType[]
  wave_ids: WaveId[]
  location_ids: string[]
  base_audience?: AudienceExpression
  timeframe?: 'daily' | 'weekly' | 'monthly'
  // New fields
  stat_test_type?: 'chi_square' | 'z_test' | 'z_test_bonferroni' | 't_test'
  confidence_level?: number
  include_nets?: boolean
  suppression_threshold?: number
  weighting_scheme_id?: string
}

// Intersection query - audience overlap analysis
export interface IntersectionQueryRequest {
  audience_ids: string[]
  wave_ids: WaveId[]
  location_ids: string[]
  metrics: MetricType[]
}

export interface IntersectionResult {
  intersections: {
    audience_combination: string[]
    metrics: Record<string, number>
  }[]
}

// Query filter
export interface QueryFilter {
  question_id: string
  datapoint_ids: string[]
  operator: 'include' | 'exclude'
}

export interface QueryMeta {
  base_size: number
  wave_name: string
  location_name: string
  execution_time_ms: number
  // New fields
  effective_base?: number
  weighted_base?: number
  confidence_level?: number
  data_freshness?: string
}
