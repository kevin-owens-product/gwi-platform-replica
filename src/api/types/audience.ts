// Audience types for the GWI Platform API -- fully enhanced

import type { SharingConfig, VersionEntry, WaveId } from './common'

export interface Audience {
  id: string
  name: string
  description?: string
  expression: AudienceExpression
  created_at: string
  updated_at: string
  user_id: string
  project_id?: string
  team_id?: string
  is_shared: boolean
  sample_size?: number
  population_size?: number
  // New fields
  tags?: string[]
  folder_id?: string
  sharing?: SharingConfig
  versions?: VersionEntry[]
  audience_type?: 'dynamic' | 'static'
  last_refreshed_at?: string
  next_refresh_at?: string
  refresh_wave_id?: string
  health_score?: AudienceHealthScore
  market_ids?: string[]
  market_sizes?: Record<string, { sample_size: number; population_size: number }>
  is_template?: boolean
  template_category?: AudienceTemplateCategory
  activation_status?: ActivationStatus
  activated_destinations?: ActivationDestination[]
}

export type AudienceExpression =
  | AudienceAnd
  | AudienceOr
  | AudienceNot
  | AudienceQuestion
  | AudienceDatapoint
  | AudienceAtLeast

export interface AudienceAnd {
  and: AudienceExpression[]
}

export interface AudienceOr {
  or: AudienceExpression[]
}

export interface AudienceNot {
  not: AudienceExpression
}

export interface AudienceQuestion {
  question: {
    question_id: string
    datapoint_ids: string[]
  }
}

export interface AudienceDatapoint {
  datapoint: {
    datapoint_id: string
  }
}

// Count coding / "At least N" quantifier
export interface AudienceAtLeast {
  at_least: {
    count: number
    expressions: AudienceExpression[]
  }
}

// Health scoring
export interface AudienceHealthScore {
  overall: number // 0-100
  sample_sufficiency: number
  recency: number
  specificity: number
  complexity: number
  cross_market_coverage: number
  warnings: AudienceWarning[]
}

export interface AudienceWarning {
  type: 'low_sample' | 'too_broad' | 'too_narrow' | 'stale_data' | 'missing_market' | 'high_complexity'
  message: string
  severity: 'info' | 'warning' | 'error'
  market_id?: string
}

// Templates
export type AudienceTemplateCategory =
  | 'demographics'
  | 'psychographics'
  | 'industry_verticals'
  | 'media_behaviors'
  | 'purchase_intent'
  | 'brand_audiences'
  | 'custom'

export interface AudienceTemplate {
  id: string
  name: string
  description: string
  category: AudienceTemplateCategory
  expression: AudienceExpression
  estimated_sizes: Record<string, number> // market_id -> estimated size
  use_cases: string[]
  created_by: string
  is_org_template: boolean
}

// Overlap analysis
export interface AudienceOverlapRequest {
  audience_ids: string[]
  wave_ids: WaveId[]
  location_ids: string[]
}

export interface AudienceOverlapResult {
  pairs: Array<{
    audience_a: string
    audience_b: string
    overlap_count: number
    overlap_pct: number
    unique_a: number
    unique_b: number
    union_count: number
  }>
  total_universe: number
}

// Comparison
export interface AudienceComparisonResult {
  audiences: Array<{
    audience_id: string
    audience_name: string
    attributes: Array<{
      attribute_name: string
      category: 'demographics' | 'behaviors' | 'psychographics' | 'attitudes'
      percentage: number
      index: number
    }>
  }>
  top_differentiators: Array<{
    attribute_name: string
    max_index_diff: number
    audience_ids: string[]
  }>
}

// Lookalike
export interface LookalikeRequest {
  seed_audience_id: string
  similarity_threshold: number // 0.01 to 0.10
  max_size?: number
  market_ids?: string[]
}

export interface LookalikeResult {
  expression: AudienceExpression
  estimated_size: number
  driving_factors: Array<{
    attribute_name: string
    importance: number
    seed_pct: number
    lookalike_pct: number
  }>
  demographic_preview: Record<string, number>
}

// Activation
export type ActivationDestinationType =
  | 'meta_ads'
  | 'google_ads'
  | 'tiktok_ads'
  | 'amazon_dsp'
  | 'the_trade_desk'
  | 'dv360'
  | 'liveramp'
  | 'salesforce'
  | 'hubspot'
  | 'csv_export'
  | 'json_export'

export type ActivationStatus = 'none' | 'pending' | 'syncing' | 'active' | 'paused' | 'error'

export interface ActivationDestination {
  destination_type: ActivationDestinationType
  status: ActivationStatus
  match_rate?: number
  last_synced_at?: string
  error_message?: string
}

export interface ActivateAudienceRequest {
  audience_id: string
  destination_type: ActivationDestinationType
  field_mapping?: Record<string, string>
}

// Estimation
export interface AudienceEstimateRequest {
  expression: AudienceExpression
  wave_ids: WaveId[]
  location_ids: string[]
}

export interface AudienceEstimateResult {
  sample_size: number
  population_size: number
  percentage_of_universe: number
  confidence_interval: { lower: number; upper: number }
  market_breakdown?: Record<string, { sample_size: number; population_size: number }>
  demographic_preview?: {
    age_groups: Record<string, number>
    gender: Record<string, number>
  }
}

// AI discovery
export interface AudienceDiscoveryResult {
  trending_segments: Array<{
    name: string
    description: string
    expression: AudienceExpression
    growth_pct: number
    sample_size: number
  }>
  high_index_clusters: Array<{
    name: string
    description: string
    expression: AudienceExpression
    top_attributes: Array<{ name: string; index: number }>
    sample_size: number
  }>
  recommended_refinements: Array<{
    suggestion: string
    expression_addition: AudienceExpression
    impact: { current_index: number; projected_index: number; metric_name: string }
  }>
}

export interface CreateAudienceRequest {
  name: string
  description?: string
  expression: AudienceExpression
  project_id?: string
  is_shared?: boolean
  tags?: string[]
  folder_id?: string
  audience_type?: 'dynamic' | 'static'
  market_ids?: string[]
}

export interface UpdateAudienceRequest {
  name?: string
  description?: string
  expression?: AudienceExpression
  is_shared?: boolean
  tags?: string[]
  folder_id?: string
  audience_type?: 'dynamic' | 'static'
  market_ids?: string[]
}

export interface AudienceListParams {
  page?: number
  per_page?: number
  search?: string
  project_id?: string
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'sample_size' | 'health_score'
  sort_order?: 'asc' | 'desc'
  tags?: string[]
  folder_id?: string
  audience_type?: 'dynamic' | 'static'
  template_category?: AudienceTemplateCategory
}
