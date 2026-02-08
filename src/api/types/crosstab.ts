// Crosstab types for the GWI Platform API -- fully enhanced

import type { MetricType, WaveId, ExportOptions, SharingConfig, VersionEntry } from './common'
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
  // New fields
  tags?: string[]
  folder_id?: string
  sharing?: SharingConfig
  versions?: VersionEntry[]
  template_id?: string
}

export interface CrosstabConfig {
  rows: CrosstabDimension[]
  columns: CrosstabDimension[]
  metrics: MetricType[]
  base_audience?: AudienceExpression
  wave_ids: WaveId[]
  location_ids: string[]
  highlight?: CrosstabHighlight
  // New config sections
  banner?: BannerConfig
  stat_test?: StatisticalTestConfig
  weighting?: WeightingConfig
  rebasing?: RebasingConfig
  suppression?: SuppressionConfig
  sort?: SortConfig
  wave_comparison?: WaveComparisonConfig
  statistical_measures?: StatisticalMeasuresConfig
  drill_down?: CellDrillDownConfig
  layout?: CrosstabLayoutConfig
  default_export?: CrosstabExportConfig
}

// Enhanced dimensions supporting NETs, calculated rows, and nesting
export type CrosstabDimensionType = 'question' | 'audience' | 'net' | 'calculated' | 'wave' | 'location'

export interface CrosstabDimension {
  type: CrosstabDimensionType
  id?: string
  label?: string
  question_id?: string
  datapoint_ids?: string[]
  audience_id?: string
  children?: CrosstabDimension[]
  is_collapsed?: boolean
  header_group?: string
  // NET dimension fields
  net_operator?: 'or' | 'and'
  net_member_ids?: string[]
  net_position?: 'above' | 'below' | 'replace'
  net_show_members?: boolean
  net_style?: 'bold' | 'shaded' | 'normal'
  // Calculated dimension fields
  formula?: CalculatedFormula
  format?: 'percentage' | 'number' | 'index' | 'currency'
  decimal_places?: number
}

export interface CalculatedFormula {
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'percentage_of' | 'custom'
  operands: Array<{
    type: 'row_ref' | 'column_ref' | 'constant'
    ref_id?: string
    value?: number
  }>
  custom_expression?: string
}

// Enhanced highlight with conditional formatting rules
export interface CrosstabHighlight {
  type: 'heatmap' | 'above_average' | 'significance' | 'threshold' | 'custom_rules'
  threshold?: number
  metric_target?: MetricType
  color_scale?: {
    type: 'sequential' | 'diverging'
    low_color: string
    mid_color?: string
    high_color: string
    low_value?: number
    high_value?: number
  }
  significance_colors?: {
    higher_primary: string
    higher_secondary: string
    lower_primary: string
    lower_secondary: string
    neutral: string
  }
  custom_rules?: ConditionalRule[]
}

export interface ConditionalRule {
  condition: 'greater_than' | 'less_than' | 'between' | 'equals' | 'top_n' | 'bottom_n'
  value: number
  value2?: number
  style: {
    background_color?: string
    text_color?: string
    font_weight?: 'normal' | 'bold'
    border?: string
    icon?: 'arrow_up' | 'arrow_down' | 'star' | 'flag' | 'check' | 'x'
  }
}

// Statistical testing
export interface StatisticalTestConfig {
  test_type: 'chi_square' | 'z_test' | 'z_test_bonferroni' | 't_test'
  confidence_levels: {
    primary: number
    secondary?: number
  }
  notation: 'letter' | 'asterisk' | 'arrow'
  overlap_handling: 'independent' | 'effective_base'
  multiple_comparison_correction?: 'none' | 'bonferroni' | 'fdr'
}

// Banner configuration
export interface BannerConfig {
  id: string
  name: string
  banner_groups: BannerGroup[]
  include_total_column: boolean
}

export interface BannerGroup {
  id: string
  label: string
  type: 'question' | 'audience' | 'wave' | 'location' | 'custom'
  question_id?: string
  datapoint_ids?: string[]
  audience_ids?: string[]
  stat_test_group: string
  separator_after?: boolean
}

// Weighting
export interface WeightingConfig {
  scheme_id?: string
  weight_variable?: string
  effective_base_display: boolean
  trim_weights?: { min: number; max: number }
}

// Rebasing
export interface RebasingConfig {
  percentage_base: 'column' | 'row' | 'total' | 'respondent_base' | 'custom'
  custom_base_filter?: AudienceExpression
  exclude_no_answer: boolean
}

// Suppression
export interface SuppressionConfig {
  enabled: boolean
  minimum_base_size: number
  suppression_action: 'hide' | 'grey_out' | 'asterisk' | 'warning_icon' | 'replace_text'
  replacement_text?: string
  apply_to: 'cells' | 'columns' | 'rows' | 'both'
  suppress_significance: boolean
  complementary_suppression: boolean
  warning_threshold?: number
  warning_text?: string
  footnote_on_suppression: boolean
}

// Sorting
export interface SortConfig {
  sort_by: 'default' | 'value' | 'alphabetical' | 'custom' | 'significance'
  sort_metric?: MetricType
  sort_column_id?: string
  sort_direction: 'ascending' | 'descending'
  pin_rows?: string[]
  pin_position: 'top' | 'bottom'
  custom_order?: string[]
  secondary_sort?: {
    sort_by: 'value' | 'alphabetical'
    sort_metric?: MetricType
    sort_direction: 'ascending' | 'descending'
  }
}

// Wave comparison
export interface WaveComparisonConfig {
  mode: 'single_wave' | 'side_by_side' | 'trended'
  wave_ids: WaveId[]
  show_delta: boolean
  delta_format: 'absolute' | 'percentage_point' | 'percentage_change'
  delta_base_wave?: WaveId
  significance_between_waves: boolean
  trend_indicators: boolean
  sparkline: boolean
}

// Statistical measures
export interface StatisticalMeasuresConfig {
  show_mean: boolean
  show_median: boolean
  show_std_deviation: boolean
  show_confidence_intervals: boolean
  confidence_level: number
  ci_method: 'normal' | 'agresti_coull' | 't_distribution' | 'wilson' | 'bootstrap'
  decimal_places: number
  show_effective_base: boolean
}

// Cell drill-down
export type CellAction =
  | 'view_respondents'
  | 'expand_net'
  | 'view_stat_details'
  | 'filter_to_cell'
  | 'save_as_audience'
  | 'create_chart'
  | 'view_question'
  | 'copy_value'

export interface CellDrillDownConfig {
  enabled: boolean
  available_actions: CellAction[]
}

// Layout
export interface CrosstabLayoutConfig {
  transposed: boolean
  metrics_position: 'in_cell' | 'as_rows' | 'as_columns'
  flatten_row_headers: boolean
  flatten_column_headers: boolean
  show_row_numbers: boolean
}

// Export
export interface CrosstabExportConfig extends ExportOptions {
  include_formatting?: boolean
  include_significance_letters?: boolean
  include_base_row?: boolean
  include_metadata?: boolean
  decimal_places?: number
  page_layout?: {
    orientation: 'portrait' | 'landscape'
    tables_per_page: number
    include_header: boolean
    include_footer: boolean
    header_text?: string
    footer_text?: string
  }
  excel_options?: {
    freeze_headers: boolean
    auto_column_width: boolean
    include_formulas: boolean
    sheet_per_table: boolean
  }
  powerpoint_options?: {
    slide_layout: 'one_table' | 'two_tables' | 'summary_and_table'
    chart_type?: 'bar' | 'stacked_bar' | 'line' | 'none'
    include_chart: boolean
  }
}

// Template
export interface CrosstabTemplate {
  id: string
  name: string
  description?: string
  category: 'standard_banner' | 'demographics' | 'brand_health' | 'tracking' | 'custom'
  config: Partial<CrosstabConfig>
  is_org_default: boolean
  created_by: string
  shared_with: 'self' | 'team' | 'organization'
}

// Enhanced query result
export interface CrosstabQueryResult {
  rows: CrosstabRow[]
  columns: CrosstabColumn[]
  cells: CrosstabCell[][]
  meta: {
    base_size: number
    wave_name: string
    location_name: string
    effective_base?: number
    weighted_base?: number
  }
  stat_test_summary?: {
    test_type: string
    primary_confidence: number
    secondary_confidence?: number
  }
}

export interface CrosstabRow {
  id: string
  label: string
  parent_id?: string
  depth?: number
  row_type?: 'data' | 'header' | 'net' | 'total' | 'calculated' | 'spacer'
  is_collapsed?: boolean
  net_members?: string[]
}

export interface CrosstabColumn {
  id: string
  label: string
  parent_id?: string
  header_group?: string
  stat_test_letter?: string
  depth?: number
  wave_id?: string
  is_delta?: boolean
  delta_format?: 'absolute' | 'percentage_point' | 'percentage_change'
}

export interface CrosstabCell {
  values: Record<string, number>
  significant?: boolean
  sample_size: number
  // Enhanced significance
  significance?: {
    letters: string[]
    p_value?: number
    test_statistic?: number
    direction?: 'higher' | 'lower' | 'neutral'
  }
  suppressed?: boolean
  suppression_reason?: 'low_base' | 'complementary'
  // Sparkline data for wave trends
  trend_data?: number[]
  trend_direction?: 'up' | 'down' | 'flat'
}

export interface CreateCrosstabRequest {
  name: string
  description?: string
  config: CrosstabConfig
  project_id?: string
  is_shared?: boolean
  tags?: string[]
  folder_id?: string
}

export interface UpdateCrosstabRequest {
  name?: string
  description?: string
  config?: Partial<CrosstabConfig>
  is_shared?: boolean
  tags?: string[]
  folder_id?: string
}
