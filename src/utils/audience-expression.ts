// Audience expression builder utilities
import type { AudienceExpression } from '@/api/types'

export function createAndExpression(expressions: AudienceExpression[]): AudienceExpression {
  if (expressions.length === 1) return expressions[0]
  return { and: expressions }
}

export function createOrExpression(expressions: AudienceExpression[]): AudienceExpression {
  if (expressions.length === 1) return expressions[0]
  return { or: expressions }
}

export function createNotExpression(expression: AudienceExpression): AudienceExpression {
  return { not: expression }
}

export function createQuestionExpression(
  questionId: string,
  datapointIds: string[]
): AudienceExpression {
  return {
    question: {
      question_id: questionId,
      datapoint_ids: datapointIds,
    },
  }
}

export function createDatapointExpression(datapointId: string): AudienceExpression {
  return {
    datapoint: {
      datapoint_id: datapointId,
    },
  }
}

// Get human-readable description of an expression
export function describeExpression(expr: AudienceExpression, depth = 0): string {
  if ('and' in expr) {
    const parts = expr.and.map((e) => describeExpression(e, depth + 1))
    const joined = parts.join(' AND ')
    return depth > 0 ? `(${joined})` : joined
  }
  if ('or' in expr) {
    const parts = expr.or.map((e) => describeExpression(e, depth + 1))
    const joined = parts.join(' OR ')
    return depth > 0 ? `(${joined})` : joined
  }
  if ('not' in expr) {
    return `NOT ${describeExpression(expr.not, depth + 1)}`
  }
  if ('question' in expr) {
    return `Q:${expr.question.question_id} [${expr.question.datapoint_ids.length} answers]`
  }
  if ('datapoint' in expr) {
    return `DP:${expr.datapoint.datapoint_id}`
  }
  return 'Unknown'
}

// Count the number of conditions in an expression
export function countConditions(expr: AudienceExpression): number {
  if ('and' in expr) return expr.and.reduce((sum, e) => sum + countConditions(e), 0)
  if ('or' in expr) return expr.or.reduce((sum, e) => sum + countConditions(e), 0)
  if ('not' in expr) return countConditions(expr.not)
  return 1
}
