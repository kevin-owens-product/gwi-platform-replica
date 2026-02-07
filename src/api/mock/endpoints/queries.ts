import type { StatsQueryRequest, StatsQueryResponse, CrosstabQueryRequest, CrosstabQueryResult, IntersectionQueryRequest, IntersectionResult } from '../../types'
import { generateStatsResponse, generateCrosstabResult, generateIntersectionResult } from '../data/queries'
import { mockCrosstabs } from '../data/crosstabs'
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

    // Look up matching crosstab config by comparing row question IDs
    const matchingCrosstab = mockCrosstabs.find((ct) => {
      const configRowIds = ct.config.rows
        ?.filter((d) => d.type === 'question' && d.question_id)
        .map((d) => d.question_id!) ?? []
      return (
        configRowIds.length === data.row_question_ids.length &&
        configRowIds.every((id) => data.row_question_ids.includes(id))
      )
    })

    if (matchingCrosstab) {
      return generateCrosstabResult(0, 0, {
        rows: matchingCrosstab.config.rows,
        columns: matchingCrosstab.config.columns,
      })
    }

    // Fallback for unmatched requests
    const rowCount = data.row_question_ids.length * 4
    const colCount = (data.column_question_ids?.length ?? 0) * 4 + (data.column_audience_ids?.length ?? 0)
    return generateCrosstabResult(Math.max(rowCount, 3), Math.max(colCount, 3))
  },

  async intersection(data: IntersectionQueryRequest): Promise<IntersectionResult> {
    await delay(100)
    return generateIntersectionResult(data.audience_ids)
  },
}
