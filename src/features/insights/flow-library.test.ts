import { describe, expect, it } from 'vitest'
import { createEmptyDraft } from './defaults'
import { createFlowDraftPatch, insightFlowTemplates } from './flow-library'

describe('insight flow library', () => {
  it('has unique flow ids', () => {
    const ids = insightFlowTemplates.map((flow) => flow.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('creates a draft patch from a flow template', () => {
    const flow = insightFlowTemplates[0]
    const draft = createEmptyDraft('ins_draft_test', {
      studyId: 'study_core',
      waveId: 'wave_2024q4',
      metric: 'audience_percentage',
      step: 'define',
    })

    const patch = createFlowDraftPatch(flow, draft)

    expect(patch.name).toBe(flow.name)
    expect(patch.objective).toBe(flow.objective)
    expect(patch.selected_question_ids).toEqual(flow.question_ids)
    expect(patch.query_spec?.question_ids).toEqual(flow.question_ids)
    expect(patch.query_spec?.row_question_ids).toEqual(flow.question_ids)
    expect(patch.query_spec?.metrics).toEqual(flow.metrics)
    expect(patch.view_config?.mode).toBe(flow.view_mode)
    expect(patch.view_config?.chart_type).toBe(flow.chart_type)
  })
})
