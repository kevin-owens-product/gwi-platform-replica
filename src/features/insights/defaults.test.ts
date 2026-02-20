import { describe, expect, it } from 'vitest'
import { createEmptyDraft, resolveInsightRoute } from './defaults'

describe('insights defaults', () => {
  it('creates a draft with publish defaults enabled for segment and view', () => {
    const draft = createEmptyDraft('d1', {
      studyId: 'study_core',
      waveId: 'wave_2024q4',
      metric: 'audience_percentage',
    })

    expect(draft.publish_plan.publish_segment).toBe(true)
    expect(draft.publish_plan.publish_view).toBe(true)
    expect(draft.publish_plan.publish_board).toBe(false)
    expect(draft.publish_plan.publish_story).toBe(false)
  })

  it('resolves legacy /insights/:id route to publish step deep link', () => {
    const resolved = resolveInsightRoute('ins_123', undefined)
    expect(resolved).toEqual({
      step: 'publish',
      draftId: 'ins_123',
    })
  })

  it('preserves explicit step + draft route shape', () => {
    const resolved = resolveInsightRoute('compare', 'draft_42')
    expect(resolved).toEqual({
      step: 'compare',
      draftId: 'draft_42',
    })
  })
})
