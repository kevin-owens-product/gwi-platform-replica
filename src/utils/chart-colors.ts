// Chart color palette matching GWI design system
// Reads from CSS custom properties defined in /styles/index.css

function getCSSVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

export const CHART_COLORS = [
  '#FF0077', // --color-chart-1
  '#334BFA', // --color-chart-2
  '#00b37a', // --color-chart-3
  '#f5a623', // --color-chart-4
  '#8b5cf6', // --color-chart-5
  '#0ea5e9', // --color-chart-6
  '#f43f5e', // --color-chart-7
  '#14b8a6', // --color-chart-8
  '#6366f1', // --color-chart-9
  '#ec4899', // --color-chart-10
  '#84cc16', // lime
  '#06b6d4', // cyan
]

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function getChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getChartColor(i))
}

// Heatmap color scale - uses CSS design tokens
export function getHeatmapColor(value: number, min: number, max: number): string {
  const normalized = max === min ? 0.5 : (value - min) / (max - min)

  if (normalized < 0.2) return getCSSVar('--color-heatmap-1', '#fef2f2') // very low
  if (normalized < 0.4) return getCSSVar('--color-heatmap-2', '#fecaca') // low
  if (normalized < 0.6) return getCSSVar('--color-heatmap-3', '#fde68a') // medium
  if (normalized < 0.8) return getCSSVar('--color-heatmap-4', '#bbf7d0') // high
  return getCSSVar('--color-heatmap-5', '#86efac') // very high
}

// Index color (above/below 100) - uses CSS design tokens
export function getIndexColor(value: number): string {
  if (value >= 120) return getCSSVar('--color-index-strong-over', '#006644') // strong over-index
  if (value >= 110) return getCSSVar('--color-index-over', '#00b37a') // over-index
  if (value >= 90) return getCSSVar('--color-index-neutral', '#5c5c70')  // neutral
  if (value >= 80) return getCSSVar('--color-index-under', '#f5a623')  // under-index
  return getCSSVar('--color-index-strong-under', '#e53e3e') // strong under-index
}
