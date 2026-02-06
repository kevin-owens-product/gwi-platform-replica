import { apiClient, streamJsonLines } from '../client'
import type {
  StatsQueryRequest,
  StatsQueryResponse,
  CrosstabQueryRequest,
  CrosstabQueryResult,
  IntersectionQueryRequest,
  IntersectionResult,
} from '../types'

export const queriesApi = {
  stats: (data: StatsQueryRequest) =>
    apiClient.post('v3/data/stats', { json: data }).json<StatsQueryResponse>(),

  statsStream: (data: StatsQueryRequest) =>
    streamJsonLines<StatsQueryResponse['results'][0]>('v3/data/stats', {
      method: 'post',
      json: data,
    }),

  crosstab: (data: CrosstabQueryRequest) =>
    apiClient.post('v3/data/crosstab', { json: data }).json<CrosstabQueryResult>(),

  intersection: (data: IntersectionQueryRequest) =>
    apiClient.post('v3/data/intersection', { json: data }).json<IntersectionResult>(),
}
