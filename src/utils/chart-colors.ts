// Chart color palette matching GWI design system
// Reads from CSS custom properties defined in /styles/index.css
// Supports multiple accessible palettes, dark mode, patterns, and semantic colors

import type { PaletteMode } from '../api/types/common'

// ---------------------------------------------------------------------------
// CSS variable helper
// ---------------------------------------------------------------------------

function getCSSVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

// ---------------------------------------------------------------------------
// Palette definitions
// ---------------------------------------------------------------------------

/** Default GWI brand palette (light mode). */
export const CHART_COLORS: string[] = [
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

/**
 * Okabe-Ito palette -- optimised for colour-vision deficiency.
 * Reference: https://jfly.uni-koeln.de/color/
 */
export const COLORBLIND_SAFE_COLORS: string[] = [
  '#E69F00', // orange
  '#56B4E9', // sky blue
  '#009E73', // bluish green
  '#F0E442', // yellow
  '#0072B2', // blue
  '#D55E00', // vermilion
  '#CC79A7', // reddish purple
  '#000000', // black
  '#E69F00', // repeat cycle starts
  '#56B4E9',
  '#009E73',
  '#F0E442',
]

/** High-contrast palette for projector / low-fidelity displays. */
export const HIGH_CONTRAST_COLORS: string[] = [
  '#000000', // black
  '#FF0000', // red
  '#0000FF', // blue
  '#008000', // green
  '#FF8C00', // dark orange
  '#800080', // purple
  '#00CED1', // dark turquoise
  '#DC143C', // crimson
  '#FFD700', // gold
  '#1E90FF', // dodger blue
  '#32CD32', // lime green
  '#FF69B4', // hot pink
]

/** Monochrome palette -- shades of the GWI primary blue-black. */
export const MONOCHROME_COLORS: string[] = [
  '#1a1a2e',
  '#2d2d4a',
  '#414166',
  '#565682',
  '#6c6c9e',
  '#8383b3',
  '#9b9bc6',
  '#b3b3d7',
  '#cbcbe6',
  '#e3e3f3',
  '#f0f0f9',
  '#f8f8fc',
]

// ---------------------------------------------------------------------------
// Dark mode variants
// ---------------------------------------------------------------------------

/** Default palette adjusted for dark backgrounds. */
export const CHART_COLORS_DARK: string[] = [
  '#FF3D94', // brighter magenta
  '#5C6FFF', // brighter blue
  '#2EDBA0', // brighter green
  '#FFB84D', // brighter amber
  '#A78BFA', // brighter violet
  '#38BDF8', // brighter sky
  '#FB7185', // brighter rose
  '#2DD4BF', // brighter teal
  '#818CF8', // brighter indigo
  '#F472B6', // brighter pink
  '#A3E635', // brighter lime
  '#22D3EE', // brighter cyan
]

/** Colorblind-safe palette adjusted for dark backgrounds. */
export const COLORBLIND_SAFE_COLORS_DARK: string[] = [
  '#FFB833', // brighter orange
  '#7CC8F2', // brighter sky blue
  '#33C29A', // brighter green
  '#F5EC6E', // brighter yellow
  '#3399CC', // brighter blue
  '#FF7A26', // brighter vermilion
  '#E09DC0', // brighter reddish purple
  '#CCCCCC', // light grey (replaces black)
  '#FFB833',
  '#7CC8F2',
  '#33C29A',
  '#F5EC6E',
]

/** High-contrast palette for dark mode. */
export const HIGH_CONTRAST_COLORS_DARK: string[] = [
  '#FFFFFF', // white
  '#FF4444', // bright red
  '#4D94FF', // bright blue
  '#44DD44', // bright green
  '#FFB347', // bright orange
  '#CC66FF', // bright purple
  '#33FFFF', // bright cyan
  '#FF6680', // bright crimson
  '#FFEE44', // bright gold
  '#44AAFF', // bright dodger blue
  '#66FF66', // bright lime
  '#FF88CC', // bright pink
]

/** Monochrome palette for dark mode -- light shades on dark backgrounds. */
export const MONOCHROME_COLORS_DARK: string[] = [
  '#f8f8fc',
  '#f0f0f9',
  '#e3e3f3',
  '#cbcbe6',
  '#b3b3d7',
  '#9b9bc6',
  '#8383b3',
  '#6c6c9e',
  '#565682',
  '#414166',
  '#2d2d4a',
  '#1a1a2e',
]

// ---------------------------------------------------------------------------
// Palette map lookup
// ---------------------------------------------------------------------------

const PALETTES: Record<PaletteMode, string[]> = {
  default: CHART_COLORS,
  colorblind_safe: COLORBLIND_SAFE_COLORS,
  high_contrast: HIGH_CONTRAST_COLORS,
  monochrome: MONOCHROME_COLORS,
}

const PALETTES_DARK: Record<PaletteMode, string[]> = {
  default: CHART_COLORS_DARK,
  colorblind_safe: COLORBLIND_SAFE_COLORS_DARK,
  high_contrast: HIGH_CONTRAST_COLORS_DARK,
  monochrome: MONOCHROME_COLORS_DARK,
}

/**
 * Return the colour array for a given palette mode and optional dark flag.
 *
 * ```ts
 * const colors = getPaletteByMode('colorblind_safe', true)
 * ```
 */
export function getPaletteByMode(mode: PaletteMode, dark = false): string[] {
  const map = dark ? PALETTES_DARK : PALETTES
  return map[mode] ?? CHART_COLORS
}

// ---------------------------------------------------------------------------
// Original helper exports (unchanged API)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sequential & diverging palette generators
// ---------------------------------------------------------------------------

/**
 * Interpolate between two hex colours.
 * `t` is in the range [0, 1].
 */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ] as [number, number, number]
  }
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const r = clamp(r1 + (r2 - r1) * t)
  const g = clamp(g1 + (g2 - g1) * t)
  const bl = clamp(b1 + (b2 - b1) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

/**
 * Generate a sequential (single-hue) palette of `steps` colours going from
 * `startColor` to `endColor`.
 *
 * ```ts
 * const blues = generateSequentialPalette(7, '#e0f0ff', '#003366')
 * ```
 */
export function generateSequentialPalette(
  steps: number,
  startColor = '#f0f0f9',
  endColor = '#1a1a2e',
): string[] {
  if (steps <= 0) return []
  if (steps === 1) return [endColor]
  return Array.from({ length: steps }, (_, i) =>
    lerpColor(startColor, endColor, i / (steps - 1)),
  )
}

/**
 * Generate a diverging palette that transitions from `lowColor` through
 * `midColor` to `highColor`.
 *
 * Useful for crosstab heat-maps that have a meaningful centre value (e.g. 100
 * for audience indices).
 *
 * ```ts
 * const diverging = generateDivergingPalette(9)
 * ```
 */
export function generateDivergingPalette(
  steps: number,
  lowColor = '#e53e3e',
  midColor = '#f8f8fc',
  highColor = '#006644',
): string[] {
  if (steps <= 0) return []
  if (steps === 1) return [midColor]
  if (steps === 2) return [lowColor, highColor]

  const half = Math.floor(steps / 2)
  const lower = Array.from({ length: half }, (_, i) =>
    lerpColor(lowColor, midColor, i / half),
  )
  const upper = Array.from({ length: steps - half }, (_, i) =>
    lerpColor(midColor, highColor, i / (steps - half - 1 || 1)),
  )
  return [...lower, ...upper]
}

// ---------------------------------------------------------------------------
// Semantic colors
// ---------------------------------------------------------------------------

export interface SemanticColors {
  success: string
  successLight: string
  warning: string
  warningLight: string
  error: string
  errorLight: string
  info: string
  infoLight: string
}

export const SEMANTIC_COLORS: SemanticColors = {
  success: '#00b37a',
  successLight: '#e6f9f3',
  warning: '#f5a623',
  warningLight: '#fff8eb',
  error: '#e53e3e',
  errorLight: '#fef2f2',
  info: '#3182ce',
  infoLight: '#ebf8ff',
}

export const SEMANTIC_COLORS_DARK: SemanticColors = {
  success: '#2EDBA0',
  successLight: '#0a3d2c',
  warning: '#FFB84D',
  warningLight: '#3d2e0a',
  error: '#FB7185',
  errorLight: '#3d0a0a',
  info: '#63B3ED',
  infoLight: '#0a2a3d',
}

/**
 * Return semantic colours, optionally for dark mode.
 */
export function getSemanticColors(dark = false): SemanticColors {
  return dark ? SEMANTIC_COLORS_DARK : SEMANTIC_COLORS
}

// ---------------------------------------------------------------------------
// Accessibility pattern definitions (SVG data-URI)
// ---------------------------------------------------------------------------

/**
 * SVG pattern data URIs that can be used as CSS `background-image` values
 * or passed to chart libraries that support pattern fills.
 *
 * These give colour-blind users an additional visual channel beyond hue.
 */
export interface ChartPattern {
  /** Human-readable name. */
  name: string
  /** SVG data URI string, usable directly as `background-image: url(...)`. */
  dataUri: string
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\n\s*/g, ''))}`
}

/**
 * Create a stripe pattern.
 *
 * @param color  - Line colour (hex).
 * @param angle  - Rotation angle in degrees (default 45).
 * @param width  - Stripe width in px (default 4).
 * @param gap    - Gap between stripes in px (default 4).
 */
export function createStripePattern(
  color: string,
  angle = 45,
  width = 4,
  gap = 4,
): ChartPattern {
  const size = width + gap
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <pattern id="p" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="rotate(${angle})">
        <rect width="${width}" height="${size}" fill="${color}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#p)"/>
  </svg>`
  return { name: `stripe-${angle}`, dataUri: svgDataUri(svg) }
}

/**
 * Create a dot pattern.
 *
 * @param color   - Dot colour (hex).
 * @param radius  - Dot radius in px (default 2).
 * @param spacing - Centre-to-centre distance in px (default 8).
 */
export function createDotPattern(
  color: string,
  radius = 2,
  spacing = 8,
): ChartPattern {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}">
    <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${radius}" fill="${color}"/>
  </svg>`
  return { name: 'dot', dataUri: svgDataUri(svg) }
}

/**
 * Create a crosshatch pattern.
 *
 * @param color       - Line colour (hex).
 * @param strokeWidth - Line thickness in px (default 1).
 * @param spacing     - Distance between lines in px (default 8).
 */
export function createCrosshatchPattern(
  color: string,
  strokeWidth = 1,
  spacing = 8,
): ChartPattern {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}">
    <line x1="0" y1="0" x2="${spacing}" y2="${spacing}" stroke="${color}" stroke-width="${strokeWidth}"/>
    <line x1="${spacing}" y1="0" x2="0" y2="${spacing}" stroke="${color}" stroke-width="${strokeWidth}"/>
  </svg>`
  return { name: 'crosshatch', dataUri: svgDataUri(svg) }
}

/**
 * Pre-built set of chart patterns paired with the default palette, so each
 * series can be distinguished by pattern as well as colour.
 */
export const CHART_PATTERNS: ChartPattern[] = [
  createStripePattern(CHART_COLORS[0], 45),
  createDotPattern(CHART_COLORS[1]),
  createCrosshatchPattern(CHART_COLORS[2]),
  createStripePattern(CHART_COLORS[3], 135),
  createDotPattern(CHART_COLORS[4], 3, 10),
  createStripePattern(CHART_COLORS[5], 0, 3, 5),
  createCrosshatchPattern(CHART_COLORS[6], 2, 10),
  createDotPattern(CHART_COLORS[7], 1.5, 6),
  createStripePattern(CHART_COLORS[8], 90),
  createCrosshatchPattern(CHART_COLORS[9], 1, 6),
  createStripePattern(CHART_COLORS[10], 60),
  createDotPattern(CHART_COLORS[11], 2.5, 9),
]

/**
 * Convenience: get the pattern for a given series index, cycling if needed.
 */
export function getChartPattern(index: number): ChartPattern {
  return CHART_PATTERNS[index % CHART_PATTERNS.length]
}
