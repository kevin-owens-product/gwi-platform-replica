import { describe, expect, it } from 'vitest'
import type { InsightCompatibilityResult } from '@/api/types'
import { createEmptyDraft } from './defaults'
import { buildInsightStepValidation } from './validation'
import type { InsightDraftRecord } from './draft-store'

function makeDraft(overrides: Partial<InsightDraftRecord> = {}): InsightDraftRecord {
  const base = createEmptyDraft('d1', {
    studyId: 'study_core',
    waveId: 'wave_2024q4',
    metric: 'audience_percentage',
  })

  return {
    ...base,
    selected_question_ids: ['q_social_platforms'],
    query_spec: {
      ...base.query_spec,
      question_ids: ['q_social_platforms'],
      row_question_ids: ['q_social_platforms'],
      metrics: ['audience_percentage'],
      time: {
        ...base.query_spec.time,
        wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }],
      },
    },
    status: 'idle',
    change_token: 1,
    requires_rerun: false,
    updated_at_local: new Date().toISOString(),
    ...overrides,
  }
}

describe('insights validation', () => {
  it('blocks define when no questions selected', () => {
    const validation = buildInsightStepValidation(makeDraft({ selected_question_ids: [] }))
    expect(validation.define.valid).toBe(false)
  })

  it('blocks publish when structural rerun is required', () => {
    const validation = buildInsightStepValidation(makeDraft({ requires_rerun: true, last_run_at: '2026-02-20T00:00:00.000Z' }))
    expect(validation.publish.valid).toBe(false)
    expect(validation.publish.issues.some((issue) => issue.includes('Run query again'))).toBe(true)
  })

  it('blocks compare and publish when compatibility is blocking', () => {
    const compatibility: InsightCompatibilityResult = {
      blocking: true,
      issues: [{ code: 'wave_dataset_mismatch', level: 'error', message: 'blocked' }],
      suggestions: [],
    }

    const validation = buildInsightStepValidation(makeDraft(), compatibility)
    expect(validation.compare.valid).toBe(false)
    expect(validation.publish.valid).toBe(false)
  })
})
