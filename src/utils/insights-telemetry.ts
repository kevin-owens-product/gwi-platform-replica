export type InsightsTelemetryEvent =
  | 'insights.fallback'
  | 'insights.query.run'
  | 'insights.query.compatibility_blocked'
  | 'insights.step.entered'
  | 'insights.step.completed'
  | 'insights.autosave.succeeded'
  | 'insights.autosave.failed'
  | 'insights.publish.started'
  | 'insights.publish.completed'
  | 'insights.publish.failed'

export function trackInsightsTelemetry(event: InsightsTelemetryEvent, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return

  const detail = {
    event,
    at: new Date().toISOString(),
    ...payload,
  }

  window.dispatchEvent(new CustomEvent('gwi:insights-telemetry', { detail }))

  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    // eslint-disable-next-line no-console
    console.debug('[insights-telemetry]', detail)
  }
}
