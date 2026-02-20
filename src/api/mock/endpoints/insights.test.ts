import { describe, expect, it } from 'vitest'
import type { RunInsightQueryRequest } from '../../types'
import { insightsApi } from './insights'

function baseRequest(viewMode: 'chart' | 'crosstab'): RunInsightQueryRequest {
  return {
    view_mode: viewMode,
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

describe('mock insightsApi', () => {
  it('returns equivalent compatibility for chart and crosstab from same query spec', async () => {
    const chartResponse = await insightsApi.runQuery(baseRequest('chart'))
    const crosstabResponse = await insightsApi.runQuery(baseRequest('crosstab'))

    expect(chartResponse.compatibility).toEqual(crosstabResponse.compatibility)
    expect(chartResponse.compatibility.blocking).toBe(false)
    expect(chartResponse.chart?.results[0]?.question_id).toBe('q_social_platforms')
    expect(crosstabResponse.view_mode).toBe('crosstab')
    expect(crosstabResponse.crosstab).toBeDefined()
  })

  it('hard-blocks incompatible dataset and wave combinations', async () => {
    await expect(insightsApi.runQuery({
      ...baseRequest('chart'),
      query_spec: {
        ...baseRequest('chart').query_spec,
        time: {
          ...baseRequest('chart').query_spec.time,
          wave_ids: [{ study_id: 'study_other', wave_id: 'wave_other_1' }],
        },
      },
    })).rejects.toMatchObject({
      compatibility: {
        blocking: true,
        issues: [expect.objectContaining({ code: 'wave_dataset_mismatch', level: 'error' })],
      },
    })
  })

  it('preserves rebasing configuration across save and load', async () => {
    const created = await insightsApi.createAsset({
      type: 'view',
      name: 'Rebase Persistence View',
      query_spec: {
        ...baseRequest('chart').query_spec,
        rebase: {
          mode: 'custom_base_filter',
          custom_base_filter: {
            question: {
              question_id: 'q_age_group',
              datapoint_ids: ['dp_age_25_34'],
            },
          },
        },
      },
      view_config: {
        mode: 'chart',
        chart_type: 'bar',
        crosstab_highlight: 'heatmap',
        show_grid: true,
        show_labels: true,
        show_legend: true,
      },
    })

    const loaded = await insightsApi.getAsset(created.id)

    expect(loaded.query_spec?.rebase.mode).toBe('custom_base_filter')
    expect(loaded.query_spec?.rebase.custom_base_filter).toEqual({
      question: {
        question_id: 'q_age_group',
        datapoint_ids: ['dp_age_25_34'],
      },
    })
  })
})
