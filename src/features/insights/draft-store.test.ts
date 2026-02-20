import { beforeEach, describe, expect, it } from 'vitest'
import { useInsightDraftStore } from './draft-store'

describe('insight draft store', () => {
  beforeEach(() => {
    useInsightDraftStore.setState({
      activeDraftId: null,
      drafts: {},
    })
  })

  it('creates and updates a draft while tracking change token', () => {
    const draftId = useInsightDraftStore.getState().createDraft({
      studyId: 'study_core',
      waveId: 'wave_2024q4',
      metric: 'audience_percentage',
      step: 'define',
    })

    useInsightDraftStore.getState().updateDraft(draftId, {
      name: 'Q1 Consumer Insight',
      selected_question_ids: ['q_social_platforms'],
      query_spec: {
        ...useInsightDraftStore.getState().drafts[draftId].query_spec,
        question_ids: ['q_social_platforms'],
        row_question_ids: ['q_social_platforms'],
      },
    })

    const draft = useInsightDraftStore.getState().drafts[draftId]
    expect(draft.name).toBe('Q1 Consumer Insight')
    expect(draft.selected_question_ids).toEqual(['q_social_platforms'])
    expect(draft.change_token).toBe(1)
    expect(draft.requires_rerun).toBe(true)
  })

  it('marks run success and flips rerun requirement back after query run', () => {
    const draftId = useInsightDraftStore.getState().createDraft({
      studyId: 'study_core',
      waveId: 'wave_2024q4',
      metric: 'audience_percentage',
      step: 'query',
    })

    useInsightDraftStore.getState().markRunSuccess(draftId, '2026-02-20T00:00:00.000Z')
    let draft = useInsightDraftStore.getState().drafts[draftId]
    expect(draft.last_run_at).toBe('2026-02-20T00:00:00.000Z')
    expect(draft.requires_rerun).toBe(false)

    useInsightDraftStore.getState().updateDraft(draftId, {
      query_spec: {
        ...draft.query_spec,
        metrics: ['audience_index'],
      },
    })

    draft = useInsightDraftStore.getState().drafts[draftId]
    expect(draft.requires_rerun).toBe(true)
  })

  it('hydrates from existing asset id for deep links', () => {
    const draftId = useInsightDraftStore.getState().hydrateFromAsset({
      id: 'ins_existing',
      type: 'view',
      name: 'Existing Insight',
      created_at: '2026-02-01T00:00:00.000Z',
      updated_at: '2026-02-02T00:00:00.000Z',
      user_id: 'user_1',
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
        rebase: { mode: 'respondent_base' },
        dataset: {
          primary_study_id: 'study_core',
          allowed_study_ids: ['study_core'],
          enforce_compatibility: true,
        },
      },
      tags: ['insights'],
    }, {
      studyId: 'study_core',
      waveId: 'wave_2024q4',
      metric: 'audience_percentage',
    })

    const draft = useInsightDraftStore.getState().drafts[draftId]
    expect(draft.id).toBe('ins_existing')
    expect(draft.asset_id).toBe('ins_existing')
    expect(draft.step).toBe('publish')
  })
})
