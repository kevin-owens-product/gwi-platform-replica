// TV Study & Print Reach/Frequency types for the GWI Platform API

import type { WaveId } from './common'

// ============== TV Study ==============

export interface TvChannel {
  id: string
  name: string
  network?: string
  type: 'broadcast' | 'cable' | 'streaming' | 'ctv'
  country: string
  logo_url?: string
}

export type Daypart =
  | 'early_morning'
  | 'daytime'
  | 'afternoon'
  | 'early_peak'
  | 'peak'
  | 'late_peak'
  | 'nighttime'

export interface DaypartSchedule {
  daypart: Daypart
  label: string
  time_range: string
  weekday: boolean
  weekend: boolean
  cpm?: number
  attention_score?: number
}

export interface TvStudyConfig {
  id?: string
  name?: string
  channels: string[]
  audience_id?: string
  audience_label?: string
  location_ids: string[]
  wave_ids: WaveId[]
  daypart_schedule: DaypartSchedule[]
  timezone: 'local' | 'standardized'
  // CTV extension
  streaming_platforms?: string[]
  include_ctv?: boolean
  cross_platform_dedup?: boolean
  // Budget
  budget?: number
  budget_allocation?: Record<string, number> // channel_id -> budget
}

export interface TvStudyResults {
  summary: {
    universe: number
    sample_size: number
    reach: number
    reach_pct: number
    avg_frequency: number
    impacts: number
    grp: number
    effective_reach_pct?: number
    effective_frequency_threshold?: number
    estimated_spend?: number
    cpm?: number
  }
  reach_curve: Array<{
    frequency: number
    reach_pct: number
    cumulative_reach: number
  }>
  daypart_breakdown: Array<{
    daypart: Daypart
    label: string
    reach_pct: number
    grp: number
    cpm: number
    attention_score: number
    efficiency_rating: 'high' | 'medium' | 'low'
  }>
  channel_contribution: Array<{
    channel_id: string
    channel_name: string
    incremental_reach: number
    overlap_pct: number
    exclusive_reach: number
    cost_per_reach_point?: number
  }>
  // Cross-channel overlap matrix
  overlap_matrix?: Array<{
    channel_a: string
    channel_b: string
    overlap_pct: number
  }>
  // CTV results
  ctv_results?: {
    ctv_reach_pct: number
    linear_only_pct: number
    ctv_only_pct: number
    combined_reach_pct: number
    dedup_savings_pct: number
  }
}

// Competitive analysis
export interface TvCompetitorAnalysis {
  competitors: Array<{
    brand_name: string
    channels: string[]
    daypart_distribution: Record<Daypart, number>
    estimated_spend: number
    share_of_voice: number
    grp: number
  }>
  gaps: Array<{
    daypart: Daypart
    channel: string
    opportunity_score: number
    description: string
  }>
}

// Scenario planning
export interface TvScenario {
  id: string
  name: string
  config: TvStudyConfig
  results?: TvStudyResults
  created_at: string
}

// ============== Print R&F ==============

export interface Publication {
  id: string
  name: string
  type: 'newspaper' | 'magazine' | 'trade' | 'digital'
  circulation: number
  rate_card_cpm?: number
  readership_000?: number
  avg_issue_readership?: number
  demographic_profile?: Record<string, number>
  country: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  has_digital_edition?: boolean
  digital_readership_000?: number
}

export interface InsertionSchedule {
  publication_id: string
  publication_name: string
  insertions: number
  period: 'daily' | 'weekly' | 'monthly'
  cost_per_insertion?: number
}

export interface PrintRFConfig {
  id?: string
  name?: string
  publications: string[]
  audience_id?: string
  audience_label?: string
  location_ids: string[]
  wave_ids: WaveId[]
  insertion_schedule: InsertionSchedule[]
  include_digital?: boolean
  cross_platform_dedup?: boolean
  budget?: number
}

export interface PrintRFResults {
  summary: {
    universe: number
    sample_size: number
    net_reach: number
    net_reach_pct: number
    gross_reach: number
    avg_frequency: number
    ots: number
    coverage_index: number
    total_cost?: number
    cost_per_reach_point?: number
    cpm?: number
  }
  frequency_distribution: Array<{
    exposures: number
    audience_pct: number
    cumulative_pct: number
  }>
  publication_contribution: Array<{
    publication_id: string
    publication_name: string
    exclusive_reach_pct: number
    incremental_reach: number
    affinity_index: number
    cost_per_reach_point?: number
  }>
  // Duplication matrix
  duplication_matrix: Array<{
    pub_a: string
    pub_b: string
    overlap_pct: number
  }>
  // Effective frequency
  effective_frequency?: {
    threshold: number
    reach_at_threshold: number
    under_exposed_pct: number
    over_exposed_pct: number
    effectively_reached_pct: number
  }
  // Digital extension
  digital_results?: {
    print_only_reach_pct: number
    digital_only_reach_pct: number
    combined_reach_pct: number
    dedup_savings_pct: number
  }
}

// Publication audience profile
export interface PublicationProfile {
  publication_id: string
  publication_name: string
  demographics: Array<{
    attribute: string
    value: number
    index: number
  }>
  affinity_with_target: number
  rank: number
}

// Print scenario
export interface PrintScenario {
  id: string
  name: string
  config: PrintRFConfig
  results?: PrintRFResults
  created_at: string
}
