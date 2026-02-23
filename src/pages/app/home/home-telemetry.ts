export type HomeTelemetryEvent =
  | 'home.loaded'
  | 'home.command_submitted'
  | 'home.quick_action_clicked'
  | 'home.ops_card_opened'
  | 'home.attention_item_opened'

export function trackHomeTelemetry(event: HomeTelemetryEvent, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return

  const detail = {
    event,
    at: new Date().toISOString(),
    ...payload,
  }

  window.dispatchEvent(new CustomEvent('gwi:home-telemetry', { detail }))

  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    // eslint-disable-next-line no-console
    console.debug('[home-telemetry]', detail)
  }
}
