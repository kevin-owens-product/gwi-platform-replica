import { trackInsightsTelemetry } from '@/utils/insights-telemetry'
import { apiClient } from '../client'
import type {
  InsightAsset,
  InsightAssetListParams,
  PaginatedResponse,
  CreateInsightAssetRequest,
  UpdateInsightAssetRequest,
  RunInsightQueryRequest,
  RunInsightQueryResponse,
  ConvertInsightAssetRequest,
  ConvertInsightAssetResponse,
  InsightLineage,
  InsightFilterSet,
  InsightQuerySpec,
  InsightCompatibilityResult,
} from '../types'

interface CompatibleErrorShape {
  response?: {
    status?: number
    clone?: () => {
      json: () => Promise<unknown>
    }
    json?: () => Promise<unknown>
  }
  compatibility?: RunInsightQueryResponse['compatibility']
}

interface UnsupportedResponseBody {
  code?: string
  reason?: string
  unsupported?: boolean
}

const FALLBACK_STATUSES = new Set([404, 405, 501, 503])
const FALLBACK_ERROR_CODES = new Set([
  'endpoint_not_found',
  'endpoint_unavailable',
  'endpoint_unsupported',
  'unsupported',
  'not_supported',
])

const DEFAULT_COMPATIBILITY: InsightCompatibilityResult = {
  blocking: false,
  issues: [],
  suggestions: [],
}

function normalizeFilters(filters: InsightFilterSet[] | undefined, source: InsightFilterSet['source']): InsightFilterSet[] {
  return (filters ?? []).map((filter, index) => ({
    ...filter,
    id: filter.id || `${source}_filter_${index}`,
    question_id: filter.question_id || `${source}_question_${index}`,
    datapoint_ids: filter.datapoint_ids ?? [],
    operator: filter.operator === 'exclude' ? 'exclude' : 'include',
    source: filter.source ?? source,
  }))
}

function normalizeQuerySpec(querySpec?: InsightQuerySpec): InsightQuerySpec | undefined {
  if (!querySpec) return undefined

  return {
    ...querySpec,
    question_ids: querySpec.question_ids ?? [],
    row_question_ids: querySpec.row_question_ids ?? [],
    column_question_ids: querySpec.column_question_ids ?? [],
    column_audience_ids: querySpec.column_audience_ids ?? [],
    metrics: querySpec.metrics.length > 0 ? querySpec.metrics : ['audience_percentage'],
    filters: normalizeFilters(querySpec.filters, 'view'),
    time: {
      wave_ids: querySpec.time?.wave_ids ?? [],
      comparison_wave_ids: querySpec.time?.comparison_wave_ids ?? [],
      range_preset: querySpec.time?.range_preset,
      trend_mode: querySpec.time?.trend_mode,
    },
    rebase: {
      mode: querySpec.rebase?.mode ?? 'respondent_base',
      custom_base_filter: querySpec.rebase?.custom_base_filter,
    },
    dataset: {
      primary_study_id: querySpec.dataset?.primary_study_id,
      allowed_study_ids: querySpec.dataset?.allowed_study_ids ?? (querySpec.dataset?.primary_study_id ? [querySpec.dataset.primary_study_id] : []),
      enforce_compatibility: querySpec.dataset?.enforce_compatibility ?? true,
    },
  }
}

function normalizeCompatibility(
  compatibility: RunInsightQueryResponse['compatibility'] | undefined,
): RunInsightQueryResponse['compatibility'] {
  if (!compatibility) return DEFAULT_COMPATIBILITY

  return {
    blocking: compatibility.blocking ?? false,
    issues: compatibility.issues ?? [],
    suggestions: compatibility.suggestions ?? [],
  }
}

function normalizeAsset(asset: InsightAsset): InsightAsset {
  return {
    ...asset,
    query_spec: normalizeQuerySpec(asset.query_spec),
    board_config: asset.board_config
      ? {
          ...asset.board_config,
          layout: asset.board_config.layout ?? { columns: 12, row_height: 80 },
          view_asset_ids: asset.board_config.view_asset_ids ?? [],
          filter_overrides: normalizeFilters(asset.board_config.filter_overrides, 'board'),
        }
      : undefined,
    story_config: asset.story_config
      ? {
          ...asset.story_config,
          steps: (asset.story_config.steps ?? []).map((step, index) => ({
            ...step,
            id: step.id || `story_step_${index}`,
            title: step.title || `Step ${index + 1}`,
            filter_overrides: normalizeFilters(step.filter_overrides, 'story'),
          })),
        }
      : undefined,
    legacy_links: asset.legacy_links ?? [],
    tags: asset.tags ?? [],
  }
}

function normalizeAssetList(response: PaginatedResponse<InsightAsset>): PaginatedResponse<InsightAsset> {
  return {
    ...response,
    data: (response.data ?? []).map(normalizeAsset),
  }
}

function normalizeRunResponse(response: RunInsightQueryResponse): RunInsightQueryResponse {
  return {
    ...response,
    compatibility: normalizeCompatibility(response.compatibility),
  }
}

function normalizeConvertResponse(response: ConvertInsightAssetResponse): ConvertInsightAssetResponse {
  return {
    ...response,
    converted_asset: normalizeAsset(response.converted_asset),
  }
}

function normalizeLineage(lineage: InsightLineage): InsightLineage {
  return {
    ...lineage,
    upstream: lineage.upstream ?? [],
    downstream: lineage.downstream ?? [],
  }
}

async function readUnsupportedResponse(error: unknown): Promise<UnsupportedResponseBody | null> {
  const response = (error as CompatibleErrorShape)?.response
  if (!response) return null

  try {
    if (response.clone) {
      return await response.clone().json() as UnsupportedResponseBody
    }

    if (response.json) {
      return await response.json() as UnsupportedResponseBody
    }
  } catch {
    return null
  }

  return null
}

async function shouldFallback(error: unknown): Promise<{ enabled: boolean; reason: string }> {
  const status = (error as CompatibleErrorShape)?.response?.status
  if (status && FALLBACK_STATUSES.has(status)) {
    return {
      enabled: true,
      reason: `status_${status}`,
    }
  }

  const body = await readUnsupportedResponse(error)
  if (!body) {
    return {
      enabled: false,
      reason: 'not_supported',
    }
  }

  if (body.unsupported) {
    return {
      enabled: true,
      reason: 'explicit_unsupported',
    }
  }

  if (body.code && FALLBACK_ERROR_CODES.has(body.code)) {
    return {
      enabled: true,
      reason: `error_code_${body.code}`,
    }
  }

  return {
    enabled: false,
    reason: 'not_supported',
  }
}

async function getMockInsightsApi() {
  const module = await import('../mock/endpoints/insights')
  return module.insightsApi
}

async function withFallback<T>(event: string, realCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> {
  try {
    return await realCall()
  } catch (error) {
    const fallback = await shouldFallback(error)
    if (!fallback.enabled) {
      throw error
    }

    trackInsightsTelemetry('insights.fallback', {
      operation: event,
      reason: fallback.reason,
    })

    return mockCall()
  }
}

export const insightsApi = {
  listAssets: async (params?: InsightAssetListParams) => {
    const response = await withFallback(
      'listAssets',
      () => apiClient.get('v4/insights/assets', { searchParams: params as Record<string, string> }).json<PaginatedResponse<InsightAsset>>(),
      async () => (await getMockInsightsApi()).listAssets(params),
    )

    return normalizeAssetList(response)
  },

  getAsset: async (id: string) => {
    const response = await withFallback(
      'getAsset',
      () => apiClient.get(`v4/insights/assets/${id}`).json<InsightAsset>(),
      async () => (await getMockInsightsApi()).getAsset(id),
    )

    return normalizeAsset(response)
  },

  createAsset: async (data: CreateInsightAssetRequest) => {
    const response = await withFallback(
      'createAsset',
      () => apiClient.post('v4/insights/assets', { json: data }).json<InsightAsset>(),
      async () => (await getMockInsightsApi()).createAsset(data),
    )

    return normalizeAsset(response)
  },

  updateAsset: async (id: string, data: UpdateInsightAssetRequest) => {
    const response = await withFallback(
      'updateAsset',
      () => apiClient.patch(`v4/insights/assets/${id}`, { json: data }).json<InsightAsset>(),
      async () => (await getMockInsightsApi()).updateAsset(id, data),
    )

    return normalizeAsset(response)
  },

  deleteAsset: async (id: string) =>
    withFallback(
      'deleteAsset',
      () => apiClient.delete(`v4/insights/assets/${id}`).json<void>(),
      async () => (await getMockInsightsApi()).deleteAsset(id),
    ),

  runQuery: async (data: RunInsightQueryRequest) => {
    const response = await withFallback(
      'runQuery',
      () => apiClient.post('v4/insights/query:run', { json: data }).json<RunInsightQueryResponse>(),
      async () => (await getMockInsightsApi()).runQuery(data),
    )

    return normalizeRunResponse(response)
  },

  convertAsset: async (id: string, data: ConvertInsightAssetRequest) => {
    const response = await withFallback(
      'convertAsset',
      () => apiClient.post(`v4/insights/assets/${id}:convert`, { json: data }).json<ConvertInsightAssetResponse>(),
      async () => (await getMockInsightsApi()).convertAsset(id, data),
    )

    return normalizeConvertResponse(response)
  },

  getLineage: async (id: string) => {
    const response = await withFallback(
      'getLineage',
      () => apiClient.get(`v4/insights/lineage/${id}`).json<InsightLineage>(),
      async () => (await getMockInsightsApi()).getLineage(id),
    )

    return normalizeLineage(response)
  },
}
