import type { AudienceExpression } from './audience'
import type { MetricType, WaveId } from './common'
import type { ChartType } from './chart'
import type { CrosstabQueryResult } from './crosstab'
import type { StatsQueryResponse } from './query'

export type InsightAssetType = 'segment' | 'view' | 'board' | 'story'
export type InsightViewMode = 'chart' | 'crosstab'

export interface InsightFilterSet {
  id: string
  question_id: string
  datapoint_ids: string[]
  operator: 'include' | 'exclude'
  source: 'workspace' | 'view' | 'board' | 'story'
}

export interface InsightTimeConfig {
  wave_ids: WaveId[]
  comparison_wave_ids?: WaveId[]
  range_preset?: 'latest' | 'last_2_waves' | 'last_4_waves' | 'custom'
  trend_mode?: 'off' | 'daily' | 'weekly' | 'monthly'
}

export interface InsightRebaseConfig {
  mode: 'column' | 'row' | 'total' | 'respondent_base' | 'custom_base_filter'
  custom_base_filter?: AudienceExpression
}

export interface InsightDatasetConfig {
  primary_study_id?: string
  allowed_study_ids?: string[]
  enforce_compatibility: boolean
}

export interface InsightQuerySpec {
  question_ids: string[]
  row_question_ids: string[]
  column_question_ids: string[]
  column_audience_ids: string[]
  metrics: MetricType[]
  base_audience?: AudienceExpression
  filters: InsightFilterSet[]
  time: InsightTimeConfig
  rebase: InsightRebaseConfig
  dataset: InsightDatasetConfig
}

export interface InsightViewConfig {
  mode: InsightViewMode
  chart_type: ChartType
  crosstab_highlight: 'none' | 'heatmap' | 'index'
  show_legend: boolean
  show_grid: boolean
  show_labels: boolean
}

export interface InsightBoardConfig {
  view_asset_ids: string[]
  layout: {
    columns: number
    row_height: number
  }
  filter_overrides: InsightFilterSet[]
}

export interface InsightStoryStep {
  id: string
  title: string
  description?: string
  view_asset_id?: string
  board_asset_id?: string
  filter_overrides: InsightFilterSet[]
}

export interface InsightStoryConfig {
  steps: InsightStoryStep[]
  review_notes?: string
}

export interface InsightLegacyLink {
  type: 'audience' | 'chart' | 'crosstab' | 'dashboard' | 'canvas'
  id: string
  path: string
}

export interface InsightAsset {
  id: string
  type: InsightAssetType
  name: string
  description?: string
  created_at: string
  updated_at: string
  user_id: string
  project_id?: string
  query_spec?: InsightQuerySpec
  view_config?: InsightViewConfig
  board_config?: InsightBoardConfig
  story_config?: InsightStoryConfig
  legacy_links?: InsightLegacyLink[]
  tags?: string[]
}

export interface InsightCompatibilityIssue {
  code: 'wave_dataset_mismatch' | 'question_dataset_mismatch' | 'missing_questions' | 'missing_waves'
  level: 'error' | 'warning'
  message: string
}

export interface InsightFixSuggestion {
  id: string
  label: string
  patch: Partial<InsightQuerySpec>
}

export interface InsightCompatibilityResult {
  blocking: boolean
  issues: InsightCompatibilityIssue[]
  suggestions: InsightFixSuggestion[]
}

export interface RunInsightQueryRequest {
  query_spec: InsightQuerySpec
  view_mode: InsightViewMode
}

export interface RunInsightQueryResponse {
  view_mode: InsightViewMode
  chart?: StatsQueryResponse
  crosstab?: CrosstabQueryResult
  compatibility: InsightCompatibilityResult
}

export interface InsightLineageNode {
  asset_id: string
  type: InsightAssetType
  name: string
}

export interface InsightLineage {
  asset_id: string
  upstream: InsightLineageNode[]
  downstream: InsightLineageNode[]
}

export interface InsightAssetListParams {
  page?: number
  per_page?: number
  search?: string
  type?: InsightAssetType
  project_id?: string
}

export interface CreateInsightAssetRequest {
  type: InsightAssetType
  name: string
  description?: string
  project_id?: string
  query_spec?: InsightQuerySpec
  view_config?: InsightViewConfig
  board_config?: InsightBoardConfig
  story_config?: InsightStoryConfig
  legacy_links?: InsightLegacyLink[]
  tags?: string[]
}

export interface UpdateInsightAssetRequest {
  name?: string
  description?: string
  query_spec?: InsightQuerySpec
  view_config?: InsightViewConfig
  board_config?: InsightBoardConfig
  story_config?: InsightStoryConfig
  legacy_links?: InsightLegacyLink[]
  tags?: string[]
}

export interface ConvertInsightAssetRequest {
  target_type: InsightAssetType
}

export interface ConvertInsightAssetResponse {
  source_asset_id: string
  converted_asset: InsightAsset
}
