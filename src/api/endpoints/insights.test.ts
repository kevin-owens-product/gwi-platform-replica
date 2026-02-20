import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RunInsightQueryRequest } from '../types'

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  mockRunQuery: vi.fn(),
}))

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: mocks.post,
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../mock/endpoints/insights', () => ({
  insightsApi: {
    listAssets: vi.fn(),
    getAsset: vi.fn(),
    createAsset: vi.fn(),
    updateAsset: vi.fn(),
    deleteAsset: vi.fn(),
    runQuery: mocks.mockRunQuery,
    convertAsset: vi.fn(),
    getLineage: vi.fn(),
  },
}))

import { insightsApi } from './insights'

function baseRequest(): RunInsightQueryRequest {
  return {
    view_mode: 'chart',
    query_spec: {
      question_ids: ['q_social_platforms'],
      row_question_ids: ['q_social_platforms'],
      column_question_ids: [],
      column_audience_ids: [],
      metrics: ['audience_percentage'],
      filters: [],
      time: {
        wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }],
        comparison_wave_ids: [],
        trend_mode: 'off',
        range_preset: 'latest',
      },
      rebase: {
        mode: 'respondent_base',
      },
      dataset: {
        primary_study_id: 'study_core',
        allowed_study_ids: ['study_core'],
        enforce_compatibility: true,
      },
    },
  }
}

describe('real insightsApi fallback behavior', () => {
  beforeEach(() => {
    mocks.post.mockReset()
    mocks.mockRunQuery.mockReset()
  })

  it('falls back to mock on 404 and normalizes response', async () => {
    mocks.post.mockImplementation(() => {
      throw { response: { status: 404 } }
    })

    mocks.mockRunQuery.mockResolvedValue({
      view_mode: 'chart',
      chart: { results: [], meta: { base_size: 0, wave_name: 'N/A', location_name: 'N/A', execution_time_ms: 0 } },
    })

    const response = await insightsApi.runQuery(baseRequest())

    expect(mocks.mockRunQuery).toHaveBeenCalledTimes(1)
    expect(response.compatibility).toEqual({
      blocking: false,
      issues: [],
      suggestions: [],
    })
  })

  it('falls back to mock on explicit unsupported response payload', async () => {
    mocks.post.mockImplementation(() => {
      throw {
        response: {
          clone: () => ({
            json: async () => ({ code: 'endpoint_unsupported' }),
          }),
        },
      }
    })

    mocks.mockRunQuery.mockResolvedValue({
      view_mode: 'chart',
      compatibility: {
        blocking: false,
        issues: [],
        suggestions: [],
      },
    })

    await insightsApi.runQuery(baseRequest())

    expect(mocks.mockRunQuery).toHaveBeenCalledTimes(1)
  })

  it('does not fall back on non-supported server errors', async () => {
    mocks.post.mockImplementation(() => {
      throw { response: { status: 500 } }
    })

    await expect(insightsApi.runQuery(baseRequest())).rejects.toMatchObject({
      response: {
        status: 500,
      },
    })

    expect(mocks.mockRunQuery).not.toHaveBeenCalled()
  })
})
