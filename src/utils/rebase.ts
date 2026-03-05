import type { MetricType, RebaseMode } from '@/api/types'

export const REBASE_OPTIONS: Array<{ label: string; value: RebaseMode }> = [
  { label: 'Column %', value: 'column' },
  { label: 'Row %', value: 'row' },
  { label: 'Total %', value: 'total' },
  { label: 'Respondent base', value: 'respondent_base' },
]

export function getEffectiveMetric(metric: MetricType, rebaseMode: RebaseMode): MetricType {
  if (metric !== 'audience_percentage') return metric

  switch (rebaseMode) {
    case 'column':
      return 'column_percentage'
    case 'row':
      return 'row_percentage'
    case 'total':
      return 'total_percentage'
    case 'respondent_base':
    default:
      return 'audience_percentage'
  }
}
