import type {
  ChartType,
  InsightAsset,
  InsightFilterSet,
  InsightQuerySpec,
  InsightStoryStep,
  InsightViewMode,
} from '@/api/types'

export interface InsightExecutionContext {
  baseQuerySpec: InsightQuerySpec
  viewMode: InsightViewMode
  chartType: ChartType
  effectiveFilters: InsightFilterSet[]
  activeStoryStep?: InsightStoryStep
}

interface ResolveInsightExecutionContextParams {
  querySpec: InsightQuerySpec
  viewMode: InsightViewMode
  chartType: ChartType
  workspaceFilterPresets?: string[]
  boardFilterOverrides?: InsightFilterSet[]
  storySteps?: InsightStoryStep[]
  activeStoryStepId?: string | null
  assets?: InsightAsset[]
}

export function workspaceFiltersFromPresets(filterPresets: string[] = []): InsightFilterSet[] {
  return filterPresets.map<InsightFilterSet>((filterPreset, index) => ({
    id: `workspace_${filterPreset}_${index}`,
    question_id: 'workspace_preset',
    datapoint_ids: [filterPreset],
    operator: 'include',
    source: 'workspace',
  }))
}

function normalizeFilters(filters: InsightFilterSet[] = [], source: InsightFilterSet['source']): InsightFilterSet[] {
  return filters.map((filter, index) => ({
    ...filter,
    id: filter.id || `${source}_filter_${index}`,
    source,
  }))
}

function filterKey(filter: InsightFilterSet): string {
  return filter.question_id
}

export function mergeFilterLayers(layers: InsightFilterSet[][]): InsightFilterSet[] {
  const merged = new Map<string, InsightFilterSet>()

  for (const layer of layers) {
    for (const filter of layer) {
      merged.set(filterKey(filter), filter)
    }
  }

  return [...merged.values()]
}

function resolveLinkedView(
  viewId: string,
  assetsById: Map<string, InsightAsset>,
  fallbackQuerySpec: InsightQuerySpec,
  fallbackViewMode: InsightViewMode,
  fallbackChartType: ChartType,
): { querySpec: InsightQuerySpec; viewMode: InsightViewMode; chartType: ChartType; viewFilters: InsightFilterSet[] } {
  const view = assetsById.get(viewId)
  if (!view || view.type !== 'view') {
    return {
      querySpec: fallbackQuerySpec,
      viewMode: fallbackViewMode,
      chartType: fallbackChartType,
      viewFilters: normalizeFilters(fallbackQuerySpec.filters, 'view'),
    }
  }

  const linkedQuerySpec = view.query_spec ?? fallbackQuerySpec

  return {
    querySpec: linkedQuerySpec,
    viewMode: view.view_config?.mode ?? fallbackViewMode,
    chartType: view.view_config?.chart_type ?? fallbackChartType,
    viewFilters: normalizeFilters(linkedQuerySpec.filters, 'view'),
  }
}

export function resolveInsightExecutionContext({
  querySpec,
  viewMode,
  chartType,
  workspaceFilterPresets = [],
  boardFilterOverrides = [],
  storySteps = [],
  activeStoryStepId,
  assets = [],
}: ResolveInsightExecutionContextParams): InsightExecutionContext {
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]))
  const activeStoryStep = storySteps.find((step) => step.id === activeStoryStepId)

  let resolvedQuerySpec = querySpec
  let resolvedViewMode = viewMode
  let resolvedChartType = chartType
  let viewFilters = normalizeFilters(querySpec.filters, 'view')
  let boardFilters = normalizeFilters(boardFilterOverrides, 'board')

  if (activeStoryStep?.view_asset_id) {
    const linked = resolveLinkedView(
      activeStoryStep.view_asset_id,
      assetsById,
      resolvedQuerySpec,
      resolvedViewMode,
      resolvedChartType,
    )

    resolvedQuerySpec = linked.querySpec
    resolvedViewMode = linked.viewMode
    resolvedChartType = linked.chartType
    viewFilters = linked.viewFilters
  }

  if (activeStoryStep?.board_asset_id) {
    const linkedBoard = assetsById.get(activeStoryStep.board_asset_id)
    if (linkedBoard?.type === 'board') {
      boardFilters = normalizeFilters(linkedBoard.board_config?.filter_overrides ?? [], 'board')
      const firstLinkedViewId = linkedBoard.board_config?.view_asset_ids[0]
      if (firstLinkedViewId) {
        const linked = resolveLinkedView(
          firstLinkedViewId,
          assetsById,
          resolvedQuerySpec,
          resolvedViewMode,
          resolvedChartType,
        )

        resolvedQuerySpec = linked.querySpec
        resolvedViewMode = linked.viewMode
        resolvedChartType = linked.chartType
        viewFilters = linked.viewFilters
      }
    }
  }

  const storyFilters = normalizeFilters(activeStoryStep?.filter_overrides ?? [], 'story')
  const workspaceFilters = workspaceFiltersFromPresets(workspaceFilterPresets)

  return {
    baseQuerySpec: resolvedQuerySpec,
    viewMode: resolvedViewMode,
    chartType: resolvedChartType,
    effectiveFilters: mergeFilterLayers([workspaceFilters, viewFilters, boardFilters, storyFilters]),
    activeStoryStep,
  }
}
