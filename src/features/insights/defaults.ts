import type {
  InsightBoardConfig,
  InsightPublishPlan,
  InsightQuerySpec,
  InsightStoryConfig,
  InsightStudioDraft,
  InsightStudioStep,
  InsightViewConfig,
  WaveId,
} from '@/api/types'

export const INSIGHT_STUDIO_STEPS: InsightStudioStep[] = ['define', 'query', 'compare', 'publish']

export function isInsightStudioStep(value: string | undefined): value is InsightStudioStep {
  if (!value) return false
  return INSIGHT_STUDIO_STEPS.includes(value as InsightStudioStep)
}

export function resolveInsightRoute(stepParam?: string, draftIdParam?: string): { step: InsightStudioStep; draftId?: string } {
  if (!stepParam) {
    return {
      step: 'define',
      draftId: draftIdParam,
    }
  }

  if (isInsightStudioStep(stepParam)) {
    return {
      step: stepParam,
      draftId: draftIdParam,
    }
  }

  return {
    step: 'publish',
    draftId: stepParam,
  }
}

export function getNextStep(step: InsightStudioStep): InsightStudioStep {
  const idx = INSIGHT_STUDIO_STEPS.indexOf(step)
  if (idx === -1 || idx === INSIGHT_STUDIO_STEPS.length - 1) return step
  return INSIGHT_STUDIO_STEPS[idx + 1]
}

export function getPreviousStep(step: InsightStudioStep): InsightStudioStep {
  const idx = INSIGHT_STUDIO_STEPS.indexOf(step)
  if (idx <= 0) return step
  return INSIGHT_STUDIO_STEPS[idx - 1]
}

export function createInitialQuerySpec(defaultStudyId: string | null, defaultWaveId: string | null, defaultMetric: string): InsightQuerySpec {
  const waveIds: WaveId[] = defaultWaveId
    ? [{ study_id: defaultStudyId ?? 'study_core', wave_id: defaultWaveId }]
    : [{ study_id: defaultStudyId ?? 'study_core', wave_id: 'wave_2024q4' }]

  return {
    question_ids: [],
    row_question_ids: [],
    column_question_ids: [],
    column_audience_ids: [],
    metrics: defaultMetric ? [defaultMetric as InsightQuerySpec['metrics'][number]] : ['audience_percentage'],
    filters: [],
    time: {
      wave_ids: waveIds,
      comparison_wave_ids: [],
      range_preset: 'latest',
      trend_mode: 'off',
    },
    rebase: {
      mode: 'respondent_base',
    },
    dataset: {
      primary_study_id: defaultStudyId ?? 'study_core',
      allowed_study_ids: defaultStudyId ? [defaultStudyId] : ['study_core'],
      enforce_compatibility: true,
    },
  }
}

export function createDefaultViewConfig(): InsightViewConfig {
  return {
    mode: 'chart',
    chart_type: 'bar',
    crosstab_highlight: 'heatmap',
    show_legend: true,
    show_grid: true,
    show_labels: true,
  }
}

export function createDefaultBoardConfig(): InsightBoardConfig {
  return {
    view_asset_ids: [],
    layout: {
      columns: 12,
      row_height: 80,
    },
    filter_overrides: [],
  }
}

export function createDefaultStoryConfig(): InsightStoryConfig {
  return {
    steps: [],
  }
}

export function createDefaultPublishPlan(): InsightPublishPlan {
  return {
    publish_segment: true,
    publish_view: true,
    publish_board: false,
    publish_story: false,
  }
}

export function createEmptyDraft(
  id: string,
  params: {
    studyId: string | null
    waveId: string | null
    metric: string
    step?: InsightStudioStep
  },
): InsightStudioDraft {
  return {
    id,
    name: 'Untitled insight',
    objective: '',
    step: params.step ?? 'define',
    query_spec: createInitialQuerySpec(params.studyId, params.waveId, params.metric),
    view_config: createDefaultViewConfig(),
    board_config: createDefaultBoardConfig(),
    story_config: createDefaultStoryConfig(),
    selected_question_ids: [],
    publish_plan: createDefaultPublishPlan(),
  }
}
