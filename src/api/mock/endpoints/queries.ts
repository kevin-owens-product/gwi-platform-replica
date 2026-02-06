import type { StatsQueryRequest, StatsQueryResponse, CrosstabQueryRequest, CrosstabQueryResult, IntersectionQueryRequest, IntersectionResult } from '../../types'
import { generateStatsResponse, generateCrosstabResult, generateIntersectionResult } from '../data/queries'
import { delay } from '../helpers'

export const queriesApi = {
  async stats(data: StatsQueryRequest): Promise<StatsQueryResponse> {
    await delay(120)
    return generateStatsResponse(data.question_ids)
  },

  async statsStream(data: StatsQueryRequest): Promise<StatsQueryResponse['results'][0][]> {
    await delay(150)
    const resp = generateStatsResponse(data.question_ids)
    return resp.results
  },

  async crosstab(data: CrosstabQueryRequest): Promise<CrosstabQueryResult> {
    await delay(120)
    const rowCount = data.row_question_ids.length * 4
    const colCount = (data.column_question_ids?.length ?? 0) * 4 + (data.column_audience_ids?.length ?? 0)
    return generateCrosstabResult(Math.max(rowCount, 3), Math.max(colCount, 3))
  },

  async intersection(data: IntersectionQueryRequest): Promise<IntersectionResult> {
    await delay(100)
    return generateIntersectionResult(data.audience_ids)
  },
}
