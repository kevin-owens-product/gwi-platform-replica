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

// GWI Core metric types -- expanded for crosstab statistical measures
export type MetricType =
  // Original metrics
  | 'positive_sample'
  | 'positive_size'
  | 'audience_sample'
  | 'audience_size'
  | 'audience_percentage'
  | 'audience_index'
  | 'datapoint_sample'
  | 'datapoint_size'
  | 'datapoint_percentage'
  // Percentage bases
  | 'column_percentage'
  | 'row_percentage'
  | 'total_percentage'
  | 'cumulative_percentage'
  // Statistical measures
  | 'mean'
  | 'median'
  | 'std_deviation'
  | 'std_error'
  | 'variance'
  | 'confidence_interval_lower'
  | 'confidence_interval_upper'
  // Base sizes
  | 'effective_base'
  | 'weighted_base'
  | 'unweighted_base'

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

// Sharing permissions model
export type SharingVisibility = 'private' | 'team' | 'project' | 'organization' | 'public'
export type SharingPermission = 'view' | 'edit' | 'admin'

export interface SharingConfig {
  visibility: SharingVisibility
  shared_with?: Array<{ user_id: string; permission: SharingPermission }>
  shared_with_teams?: Array<{ team_id: string; permission: SharingPermission }>
}

// Version history
export interface VersionEntry {
  version_id: string
  entity_id: string
  saved_at: string
  saved_by: string
  change_summary: string
}

// Audit trail
export interface AuditLogEntry {
  id: string
  entity_type: 'chart' | 'crosstab' | 'dashboard' | 'audience' | 'report' | 'spark' | 'canvas'
  entity_id: string
  action: 'created' | 'updated' | 'deleted' | 'shared' | 'exported' | 'activated' | 'duplicated' | 'viewed'
  user_id: string
  user_name: string
  timestamp: string
  details?: Record<string, unknown>
}

// Export configuration -- shared across charts, crosstabs, dashboards, reports
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'csv' | 'xlsx' | 'json' | 'html_embed' | 'pptx' | 'docx'

export interface ExportOptions {
  format: ExportFormat
  resolution?: '1x' | '2x' | '3x'
  include_title?: boolean
  include_legend?: boolean
  include_annotations?: boolean
  include_data_source?: boolean
  filename?: string
  dimensions?: { width: number; height: number }
  background_color?: string
}

// Theme configuration
export type ThemeMode = 'light' | 'dark' | 'system'
export type PaletteMode = 'default' | 'colorblind_safe' | 'high_contrast' | 'monochrome'

export interface ThemeConfig {
  mode: ThemeMode
  palette_mode: PaletteMode
  custom_brand_colors?: string[]
}

// Tag for organizational metadata
export interface Tag {
  id: string
  name: string
  color?: string
}

// Folder hierarchy
export interface Folder {
  id: string
  name: string
  parent_id?: string
  color?: string
  created_by: string
}
