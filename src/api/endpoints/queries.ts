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
    apiClient.post('data/stats', { json: data }).json<StatsQueryResponse>(),

  statsStream: (data: StatsQueryRequest) =>
    streamJsonLines<StatsQueryResponse['results'][0]>('data/stats', {
      method: 'post',
      json: data,
    }),

  crosstab: (data: CrosstabQueryRequest) =>
    apiClient.post('data/crosstab', { json: data }).json<CrosstabQueryResult>(),

  intersection: (data: IntersectionQueryRequest) =>
    apiClient.post('data/intersection', { json: data }).json<IntersectionResult>(),
}
