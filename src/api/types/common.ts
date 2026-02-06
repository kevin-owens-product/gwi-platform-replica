// Common API types used across all endpoints

export interface PaginationParams {
  page?: number
  per_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

export interface ApiError {
  error: string
  message: string
  status: number
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

// GWI Core metric types
export type MetricType =
  | 'positive_sample'
  | 'positive_size'
  | 'audience_sample'
  | 'audience_size'
  | 'audience_percentage'
  | 'audience_index'
  | 'datapoint_sample'
  | 'datapoint_size'
  | 'datapoint_percentage'

export interface Metric {
  type: MetricType
  value: number
}

// Wave/Study identifiers
export interface WaveId {
  study_id: string
  wave_id: string
}

// Location
export interface Location {
  id: string
  name: string
  iso_code?: string
  parent_id?: string
}

// Namespace
export interface Namespace {
  id: string
  name: string
  description?: string
}
