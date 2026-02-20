interface InsightsRuntimeConfig {
  VITE_ENABLE_INSIGHTS_STUDIO?: string
  VITE_ENABLE_INSIGHTS_STUDIO_V2?: string
}

export function isInsightsStudioEnabled(config: InsightsRuntimeConfig = import.meta.env): boolean {
  return config.VITE_ENABLE_INSIGHTS_STUDIO !== 'false'
}

export const insightsStudioEnabled = isInsightsStudioEnabled()

export function isInsightsStudioV2Enabled(config: InsightsRuntimeConfig = import.meta.env): boolean {
  return config.VITE_ENABLE_INSIGHTS_STUDIO_V2 !== 'false'
}

export const insightsStudioV2Enabled = isInsightsStudioV2Enabled()
