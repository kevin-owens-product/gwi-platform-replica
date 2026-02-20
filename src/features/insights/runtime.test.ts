import { describe, expect, it } from 'vitest'
import type { InsightAsset, InsightFilterSet, InsightQuerySpec, InsightStoryStep } from '@/api/types'
import { mergeFilterLayers, resolveInsightExecutionContext, workspaceFiltersFromPresets } from './runtime'

function buildFilter(
  id: string,
  questionId: string,
  datapointIds: string[],
  source: InsightFilterSet['source'],
): InsightFilterSet {
  return {
    id,
    question_id: questionId,
    datapoint_ids: datapointIds,
    operator: 'include',
    source,
  }
}

function baseQuerySpec(filters: InsightFilterSet[] = []): InsightQuerySpec {
  return {
    question_ids: ['q_social_platforms'],
    row_question_ids: ['q_social_platforms'],
    column_question_ids: [],
    column_audience_ids: [],
    metrics: ['audience_percentage'],
    filters,
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
  }
}

describe('insights runtime', () => {
  it('applies filter precedence story > board > view > workspace', () => {
    const workspace = workspaceFiltersFromPresets(['dp_workspace'])
    const view = [buildFilter('view_1', 'q_age', ['dp_age_16_24'], 'view')]
    const board = [buildFilter('board_1', 'q_age', ['dp_age_25_34'], 'board')]
    const story = [buildFilter('story_1', 'q_age', ['dp_age_35_44'], 'story')]

    const merged = mergeFilterLayers([workspace, view, board, story])

    expect(merged).toContainEqual(expect.objectContaining({
      question_id: 'workspace_preset',
      datapoint_ids: ['dp_workspace'],
      source: 'workspace',
    }))
    expect(merged).toContainEqual(expect.objectContaining({
      question_id: 'q_age',
      datapoint_ids: ['dp_age_35_44'],
      source: 'story',
    }))
    expect(merged).toHaveLength(2)
  })

  it('resolves linked board/view query context for story review', () => {
    const linkedView: InsightAsset = {
      id: 'ins_view_linked',
      type: 'view',
      name: 'Linked View',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      user_id: 'u1',
      query_spec: baseQuerySpec([buildFilter('view_filter', 'q_age', ['dp_age_16_24'], 'view')]),
      view_config: {
        mode: 'crosstab',
        chart_type: 'line',
        crosstab_highlight: 'heatmap',
        show_grid: true,
        show_labels: true,
        show_legend: true,
      },
    }

    const linkedBoard: InsightAsset = {
      id: 'ins_board_linked',
      type: 'board',
      name: 'Linked Board',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      user_id: 'u1',
      board_config: {
        view_asset_ids: [linkedView.id],
        layout: { columns: 12, row_height: 80 },
        filter_overrides: [buildFilter('board_filter', 'q_age', ['dp_age_25_34'], 'board')],
      },
    }

    const steps: InsightStoryStep[] = [
      {
        id: 'story_step_1',
        title: 'Review Step',
        board_asset_id: linkedBoard.id,
        filter_overrides: [buildFilter('story_filter', 'q_age', ['dp_age_35_44'], 'story')],
      },
    ]

    const context = resolveInsightExecutionContext({
      querySpec: baseQuerySpec(),
      viewMode: 'chart',
      chartType: 'bar',
      workspaceFilterPresets: ['dp_workspace'],
      boardFilterOverrides: [],
      storySteps: steps,
      activeStoryStepId: 'story_step_1',
      assets: [linkedView, linkedBoard],
    })

    expect(context.baseQuerySpec.question_ids).toEqual(['q_social_platforms'])
    expect(context.viewMode).toBe('crosstab')
    expect(context.chartType).toBe('line')
    expect(context.effectiveFilters).toContainEqual(expect.objectContaining({
      question_id: 'q_age',
      datapoint_ids: ['dp_age_35_44'],
      source: 'story',
    }))
  })
})
