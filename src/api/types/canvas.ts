// Canvas (Guided Research) types for the GWI Platform API

import type { WaveId, SharingConfig } from './common'
import type { ChartType } from './chart'
import type { AudienceExpression } from './audience'

export type ResearchGoalType =
  | 'brand_awareness'
  | 'market_trends'
  | 'competitor_analysis'
  | 'consumer_behavior'
  | 'purchase_intent'
  | 'media_consumption'
  | 'audience_profiling'
  | 'campaign_effectiveness'
  | 'product_positioning'
  | 'content_strategy'
  | 'customer_journey'
  | 'market_sizing'
  | 'segmentation'
  | 'brand_perception'
  | 'innovation_tracking'

export type CanvasStepType =
  | 'objectives'
  | 'markets'
  | 'audiences'
  | 'time_period'
  | 'analysis_framework'
  | 'review'
  | 'results'

export interface CanvasProject {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  user_id: string
  sharing?: SharingConfig
  status: 'draft' | 'in_progress' | 'review' | 'completed'
  current_step: CanvasStepType
  steps: CanvasStep[]
  collaborators?: Array<{
    user_id: string
    user_name: string
    role: 'owner' | 'editor' | 'reviewer' | 'viewer'
    assigned_steps?: CanvasStepType[]
  }>
  template_id?: string
  generated_report_id?: string
  progress_pct: number
}

export interface CanvasStep {
  type: CanvasStepType
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  completed_at?: string
  completed_by?: string
  data: CanvasStepData
  comments?: Array<{
    user_name: string
    content: string
    created_at: string
  }>
}

export type CanvasStepData =
  | CanvasObjectivesData
  | CanvasMarketsData
  | CanvasAudiencesData
  | CanvasTimePeriodData
  | CanvasAnalysisFrameworkData
  | CanvasReviewData
  | CanvasResultsData

export interface CanvasObjectivesData {
  step: 'objectives'
  goals: ResearchGoalType[]
  custom_goals?: string[]
  research_question?: string
  hypothesis?: string
}

export interface CanvasMarketsData {
  step: 'markets'
  location_ids: string[]
  market_groups?: Array<{ name: string; location_ids: string[] }>
}

export interface CanvasAudiencesData {
  step: 'audiences'
  audience_ids: string[]
  create_new?: boolean
  new_audience_expression?: AudienceExpression
}

export interface CanvasTimePeriodData {
  step: 'time_period'
  wave_ids: WaveId[]
  comparison_wave_ids?: WaveId[]
  trending_enabled?: boolean
}

export interface CanvasAnalysisFrameworkData {
  step: 'analysis_framework'
  question_ids: string[]
  chart_types: ChartType[]
  metrics: string[]
  benchmark_enabled?: boolean
  cross_tab_enabled?: boolean
  statistical_testing?: boolean
}

export interface CanvasReviewData {
  step: 'review'
  approved: boolean
  reviewer_notes?: string
}

export interface CanvasResultsData {
  step: 'results'
  generated_charts: string[]
  generated_crosstabs: string[]
  executive_summary?: string
  key_findings?: string[]
  report_id?: string
}

// Research templates
export interface ResearchTemplate {
  id: string
  name: string
  description: string
  category: 'brand_health' | 'competitive' | 'media_habits' | 'purchase_journey' | 'trend_analysis' | 'audience_profiling' | 'market_entry' | 'custom'
  thumbnail_url: string
  default_goals: ResearchGoalType[]
  default_question_ids: string[]
  default_chart_types: ChartType[]
  suggested_audience_ids?: string[]
  estimated_duration: string
  steps: Partial<CanvasStep>[]
  usage_count: number
}

// Progress tracking
export interface CanvasProgressMetrics {
  total_steps: number
  completed_steps: number
  data_coverage_pct: number
  sample_quality: 'excellent' | 'good' | 'marginal' | 'insufficient'
  quality_warnings: string[]
  estimated_completion: string
}
