import { describe, expect, it } from 'vitest'
import { createEmptyDraft } from './defaults'
import { INSIGHT_DRAFT_TAG, toDraftCreateRequest, toDraftUpdateRequest } from './autosave'

describe('insights autosave payloads', () => {
  it('adds draft tag and keeps draft shape in create payload', () => {
    const draft = createEmptyDraft('draft_1', {
      studyId: 'study_core',
      waveId: 'wave_2024q4',
      metric: 'audience_percentage',
    })

    const payload = toDraftCreateRequest(draft, 'proj_1')

    expect(payload.project_id).toBe('proj_1')
    expect(payload.tags).toContain(INSIGHT_DRAFT_TAG)
    expect(payload.query_spec).toEqual(draft.query_spec)
  })

  it('builds update payload with draft tag', () => {
    const draft = createEmptyDraft('draft_2', {
      studyId: 'study_core',
      waveId: 'wave_2024q4',
      metric: 'audience_percentage',
    })

    const payload = toDraftUpdateRequest(draft)
    expect(payload.tags).toContain(INSIGHT_DRAFT_TAG)
    expect(payload.story_config).toEqual(draft.story_config)
  })
})
