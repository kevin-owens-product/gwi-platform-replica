import type { InsightCompatibilityResult, InsightStudioStep } from '@/api/types'
import type { InsightDraftRecord } from './draft-store'
import { INSIGHT_STUDIO_STEPS } from './defaults'

export interface InsightStepValidation {
  valid: boolean
  issues: string[]
}

export type InsightStepValidationMap = Record<InsightStudioStep, InsightStepValidation>

export function buildInsightStepValidation(
  draft: InsightDraftRecord,
  compatibility?: InsightCompatibilityResult,
): InsightStepValidationMap {
  const blockingCompatibility = compatibility?.blocking || draft.compatibility?.blocking

  const defineIssues: string[] = []
  if (draft.selected_question_ids.length === 0) {
    defineIssues.push('Select at least one variable.')
  }

  const queryIssues: string[] = []
  if (draft.query_spec.metrics.length === 0) {
    queryIssues.push('Select at least one metric.')
  }

  const compareIssues: string[] = []
  if (draft.query_spec.time.wave_ids.length === 0) {
    compareIssues.push('Select at least one primary wave.')
  }
  if (blockingCompatibility) {
    compareIssues.push('Resolve blocking compatibility issues.')
  }

  const publishIssues: string[] = []
  if (!draft.last_run_at) {
    publishIssues.push('Run the query before publishing.')
  }
  if (draft.requires_rerun) {
    publishIssues.push('Run query again after structural changes.')
  }
  if (blockingCompatibility) {
    publishIssues.push('Blocking compatibility issues must be fixed before publish.')
  }
  if (!Object.values(draft.publish_plan).some(Boolean)) {
    publishIssues.push('Select at least one output to publish.')
  }

  return {
    define: { valid: defineIssues.length === 0, issues: defineIssues },
    query: { valid: queryIssues.length === 0, issues: queryIssues },
    compare: { valid: compareIssues.length === 0, issues: compareIssues },
    publish: { valid: publishIssues.length === 0, issues: publishIssues },
  }
}

export function isStepReachable(validations: InsightStepValidationMap, step: InsightStudioStep): boolean {
  const targetIndex = INSIGHT_STUDIO_STEPS.indexOf(step)
  if (targetIndex <= 0) return true

  for (let idx = 0; idx < targetIndex; idx += 1) {
    if (!validations[INSIGHT_STUDIO_STEPS[idx]].valid) {
      return false
    }
  }

  return true
}
