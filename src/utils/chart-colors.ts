// Chart color palette matching GWI brand

export const CHART_COLORS = [
  '#0ea5e9', // sky blue
  '#22c55e', // green
  '#E31C79', // GWI pink
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#ec4899', // pink
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#a855f7', // purple
]

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function getChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getChartColor(i))
}

// Heatmap color scale
export function getHeatmapColor(value: number, min: number, max: number): string {
  const normalized = max === min ? 0.5 : (value - min) / (max - min)

  if (normalized < 0.2) return '#fee2e2' // very low
  if (normalized < 0.4) return '#fecaca' // low
  if (normalized < 0.6) return '#fde68a' // medium
  if (normalized < 0.8) return '#bbf7d0' // high
  return '#86efac' // very high
}

// Index color (above/below 100)
export function getIndexColor(value: number): string {
  if (value >= 120) return '#059669' // strong over-index
  if (value >= 110) return '#10b981' // over-index
  if (value >= 90) return '#6b7280'  // neutral
  if (value >= 80) return '#f59e0b'  // under-index
  return '#ef4444' // strong under-index
}
