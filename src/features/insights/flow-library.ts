import type { InsightFilterSet, InsightQuerySpec, InsightStudioDraft, InsightViewConfig, MetricType } from '@/api/types'

export interface InsightFlowTemplate {
  id: string
  name: string
  category: string
  description: string
  objective: string
  question_ids: string[]
  metrics: MetricType[]
  view_mode: InsightViewConfig['mode']
  chart_type: InsightViewConfig['chart_type']
  filters?: Array<Omit<InsightFilterSet, 'id' | 'source'>>
  time?: Partial<InsightQuerySpec['time']>
  rebase_mode?: InsightQuerySpec['rebase']['mode']
  dataset?: Partial<InsightQuerySpec['dataset']>
}

export const insightFlowTemplates: InsightFlowTemplate[] = [
  {
    id: 'ins_flow_social_platform_shift',
    name: 'Platform Shift Tracker',
    category: 'Social',
    description: 'Track platform usage and social actions to spot where attention is shifting.',
    objective: 'Identify fast-rising social platforms and participation behaviors.',
    question_ids: ['q_social_platforms', 'q_social_actions'],
    metrics: ['audience_percentage', 'audience_index'],
    view_mode: 'chart',
    chart_type: 'line',
    time: { range_preset: 'last_4_waves', trend_mode: 'monthly' },
  },
  {
    id: 'ins_flow_brand_discovery_genz',
    name: 'Brand Discovery by Age',
    category: 'Brand',
    description: 'Understand discovery channels by age cohorts for campaign planning.',
    objective: 'Compare how each age group discovers brands and where to prioritize spend.',
    question_ids: ['q_brand_discovery', 'q_age_group'],
    metrics: ['audience_percentage', 'column_percentage'],
    view_mode: 'crosstab',
    chart_type: 'table',
    rebase_mode: 'column',
  },
  {
    id: 'ins_flow_streaming_stack',
    name: 'Streaming Stack Comparison',
    category: 'Media',
    description: 'Benchmark streaming platform usage and news-source overlap in one flow.',
    objective: 'Find service overlap and audience composition across media ecosystems.',
    question_ids: ['q_tv_platforms', 'q_news_sources'],
    metrics: ['audience_percentage', 'audience_size'],
    view_mode: 'chart',
    chart_type: 'bar',
  },
  {
    id: 'ins_flow_social_commerce',
    name: 'Social Commerce Opportunity',
    category: 'Commerce',
    description: 'Measure social commerce propensity and payment preferences.',
    objective: 'Quantify who buys through social channels and how they prefer to pay.',
    question_ids: ['q_social_commerce', 'q_payment_methods'],
    metrics: ['audience_percentage', 'audience_index'],
    view_mode: 'chart',
    chart_type: 'bar',
    filters: [
      {
        question_id: 'q_social_commerce',
        datapoint_ids: ['dp_scom_yes_reg', 'dp_scom_yes_occ'],
        operator: 'include',
      },
    ],
  },
  {
    id: 'ins_flow_privacy_vs_ads',
    name: 'Privacy vs Ad Receptivity',
    category: 'Attitudes',
    description: 'Compare ad sentiment against privacy concern to shape messaging strategy.',
    objective: 'Locate receptive segments where trust and ad performance can coexist.',
    question_ids: ['q_privacy_concern', 'q_ad_attitudes'],
    metrics: ['audience_percentage', 'row_percentage'],
    view_mode: 'crosstab',
    chart_type: 'table',
    rebase_mode: 'row',
  },
  {
    id: 'ins_flow_tech_affinity',
    name: 'Tech Affinity Segment',
    category: 'Technology',
    description: 'Combine AI tool usage with device ownership for targetable tech cohorts.',
    objective: 'Build a high-affinity tech audience and compare segment composition.',
    question_ids: ['q_ai_usage', 'q_device_ownership'],
    metrics: ['audience_percentage', 'audience_size'],
    view_mode: 'chart',
    chart_type: 'bar',
  },
]

export function createFlowDraftPatch(flow: InsightFlowTemplate, draft: InsightStudioDraft): Partial<InsightStudioDraft> {
  return {
    name: flow.name,
    objective: flow.objective,
    step: 'define',
    selected_question_ids: flow.question_ids,
    query_spec: {
      ...draft.query_spec,
      question_ids: flow.question_ids,
      row_question_ids: flow.question_ids,
      metrics: flow.metrics,
      filters: (flow.filters ?? []).map((filter, idx) => ({
        id: `flow_${flow.id}_filter_${idx + 1}`,
        source: 'view',
        ...filter,
      })),
      time: {
        ...draft.query_spec.time,
        ...(flow.time ?? {}),
      },
      rebase: {
        ...draft.query_spec.rebase,
        mode: flow.rebase_mode ?? draft.query_spec.rebase.mode,
      },
      dataset: {
        ...draft.query_spec.dataset,
        ...(flow.dataset ?? {}),
      },
    },
    view_config: {
      ...draft.view_config,
      mode: flow.view_mode,
      chart_type: flow.chart_type,
    },
  }
}
