// Chart color palette matching GWI design system

export const CHART_COLORS = [
  '#FF0077', // GWI pink (primary)
  '#334BFA', // accent blue
  '#00b37a', // success green
  '#f5a623', // warning amber
  '#8b5cf6', // violet
  '#0ea5e9', // sky blue
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#ec4899', // pink
  '#84cc16', // lime
  '#06b6d4', // cyan
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

  if (normalized < 0.2) return '#fef2f2' // very low
  if (normalized < 0.4) return '#fecaca' // low
  if (normalized < 0.6) return '#fde68a' // medium
  if (normalized < 0.8) return '#bbf7d0' // high
  return '#86efac' // very high
}

// Index color (above/below 100)
export function getIndexColor(value: number): string {
  if (value >= 120) return '#006644' // strong over-index
  if (value >= 110) return '#00b37a' // over-index
  if (value >= 90) return '#5c5c70'  // neutral
  if (value >= 80) return '#f5a623'  // under-index
  return '#e53e3e' // strong under-index
}
