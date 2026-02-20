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
} from '../types'

interface CompatibleErrorShape {
  response?: {
    status?: number
  }
  compatibility?: RunInsightQueryResponse['compatibility']
}

function logFallback(event: string, details?: Record<string, unknown>): void {
  // Placeholder telemetry event. Replace with analytics SDK when available.
  console.info('[insightsApi:fallback]', event, details ?? {})
}

function shouldFallback(error: unknown): boolean {
  const status = (error as CompatibleErrorShape)?.response?.status
  return status === 404 || status === 405 || status === 501 || status === 503
}

async function getMockInsightsApi() {
  const module = await import('../mock/endpoints/insights')
  return module.insightsApi
}

async function withFallback<T>(event: string, realCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> {
  try {
    return await realCall()
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error
    }
    logFallback(event, { reason: 'endpoint_unavailable' })
    return mockCall()
  }
}

export const insightsApi = {
  listAssets: async (params?: InsightAssetListParams) =>
    withFallback(
      'listAssets',
      () => apiClient.get('v4/insights/assets', { searchParams: params as Record<string, string> }).json<PaginatedResponse<InsightAsset>>(),
      async () => (await getMockInsightsApi()).listAssets(params),
    ),

  getAsset: async (id: string) =>
    withFallback(
      'getAsset',
      () => apiClient.get(`v4/insights/assets/${id}`).json<InsightAsset>(),
      async () => (await getMockInsightsApi()).getAsset(id),
    ),

  createAsset: async (data: CreateInsightAssetRequest) =>
    withFallback(
      'createAsset',
      () => apiClient.post('v4/insights/assets', { json: data }).json<InsightAsset>(),
      async () => (await getMockInsightsApi()).createAsset(data),
    ),

  updateAsset: async (id: string, data: UpdateInsightAssetRequest) =>
    withFallback(
      'updateAsset',
      () => apiClient.patch(`v4/insights/assets/${id}`, { json: data }).json<InsightAsset>(),
      async () => (await getMockInsightsApi()).updateAsset(id, data),
    ),

  deleteAsset: async (id: string) =>
    withFallback(
      'deleteAsset',
      () => apiClient.delete(`v4/insights/assets/${id}`).json<void>(),
      async () => (await getMockInsightsApi()).deleteAsset(id),
    ),

  runQuery: async (data: RunInsightQueryRequest) => {
    try {
      return await apiClient.post('v4/insights/query:run', { json: data }).json<RunInsightQueryResponse>()
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error
      }
      logFallback('runQuery', { reason: 'endpoint_unavailable' })
      return (await getMockInsightsApi()).runQuery(data)
    }
  },

  convertAsset: async (id: string, data: ConvertInsightAssetRequest) =>
    withFallback(
      'convertAsset',
      () => apiClient.post(`v4/insights/assets/${id}:convert`, { json: data }).json<ConvertInsightAssetResponse>(),
      async () => (await getMockInsightsApi()).convertAsset(id, data),
    ),

  getLineage: async (id: string) =>
    withFallback(
      'getLineage',
      () => apiClient.get(`v4/insights/lineage/${id}`).json<InsightLineage>(),
      async () => (await getMockInsightsApi()).getLineage(id),
    ),
}
