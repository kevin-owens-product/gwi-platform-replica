// Data query types for the GWI Platform API

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
  metrics: Record<MetricType, number>
  audience_metrics?: Record<string, Record<MetricType, number>>
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
    metrics: Record<MetricType, number>
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
}
