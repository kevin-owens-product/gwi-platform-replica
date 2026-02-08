// Number formatting utilities

import type { MetricType } from '../api/types/common'

// ---------------------------------------------------------------------------
// Core number formatters
// ---------------------------------------------------------------------------

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatIndex(value: number): string {
  return value.toFixed(0)
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// ---------------------------------------------------------------------------
// Statistical formatters
// ---------------------------------------------------------------------------

/**
 * Format a statistical measure (mean, median, std deviation, etc.) with
 * appropriate decimal precision.
 */
function formatStatistic(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a base size (effective_base, weighted_base, unweighted_base).
 * Rounds to the nearest integer and adds comma separators.
 */
function formatBase(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// ---------------------------------------------------------------------------
// Metric formatting -- expanded for all MetricType values
// ---------------------------------------------------------------------------

export function formatMetricValue(type: MetricType | string, value: number): string {
  switch (type) {
    // Percentage metrics
    case 'audience_percentage':
    case 'datapoint_percentage':
    case 'column_percentage':
    case 'row_percentage':
    case 'total_percentage':
    case 'cumulative_percentage':
      return formatPercentage(value)

    // Index
    case 'audience_index':
      return formatIndex(value)

    // Absolute sizes (compact notation)
    case 'audience_size':
    case 'positive_size':
    case 'datapoint_size':
      return formatCompactNumber(value)

    // Sample counts (plain integer)
    case 'positive_sample':
    case 'audience_sample':
    case 'datapoint_sample':
      return formatNumber(value)

    // Statistical measures (2 decimal places)
    case 'mean':
    case 'median':
    case 'std_deviation':
    case 'std_error':
    case 'variance':
    case 'confidence_interval_lower':
    case 'confidence_interval_upper':
      return formatStatistic(value)

    // Base sizes (integer with comma separators)
    case 'effective_base':
    case 'weighted_base':
    case 'unweighted_base':
      return formatBase(value)

    default:
      return formatNumber(value)
  }
}

// ---------------------------------------------------------------------------
// Confidence interval formatting
// ---------------------------------------------------------------------------

export interface ConfidenceIntervalFormatOptions {
  /** Number of decimal places (default 2). */
  decimals?: number
  /** Confidence level label, e.g. "95%" (default "95%"). */
  level?: string
  /** When true, include the level label in the output. */
  showLevel?: boolean
}

/**
 * Format a confidence interval as a readable string.
 *
 * ```ts
 * formatConfidenceInterval(12.3, 15.7)          // "[12.30, 15.70]"
 * formatConfidenceInterval(12.3, 15.7, { showLevel: true })
 *                                                // "95% CI [12.30, 15.70]"
 * ```
 */
export function formatConfidenceInterval(
  lower: number,
  upper: number,
  options: ConfidenceIntervalFormatOptions = {},
): string {
  const { decimals = 2, level = '95%', showLevel = false } = options
  const lo = lower.toFixed(decimals)
  const hi = upper.toFixed(decimals)
  const interval = `[${lo}, ${hi}]`
  return showLevel ? `${level} CI ${interval}` : interval
}

// ---------------------------------------------------------------------------
// Delta formatting (period-over-period changes)
// ---------------------------------------------------------------------------

export type DeltaColorIndicator = 'positive' | 'negative' | 'neutral'

export interface DeltaFormatResult {
  /** Formatted string, e.g. "+3.2pp" or "-1.5%". */
  text: string
  /** Semantic direction for colouring (green / red / grey). */
  color: DeltaColorIndicator
}

export interface DeltaFormatOptions {
  /** Number of decimal places (default 1). */
  decimals?: number
  /**
   * Unit suffix appended after the number.
   * Common values: "pp" (percentage points), "%" (relative change), "pts" (index points).
   * Default: "pp".
   */
  unit?: string
  /**
   * Threshold below which the change is considered neutral (coloured grey).
   * Applies to the absolute value. Default: 0.
   */
  neutralThreshold?: number
  /**
   * When true, a *decrease* is treated as positive (green).
   * Useful for metrics like "churn rate" where going down is good.
   * Default: false.
   */
  invertDirection?: boolean
}

/**
 * Format a period-over-period delta value with a +/- prefix and a colour
 * indicator.
 *
 * ```ts
 * formatDelta(3.2)            // { text: "+3.2pp", color: "positive" }
 * formatDelta(-1.5)           // { text: "-1.5pp", color: "negative" }
 * formatDelta(0.02, { neutralThreshold: 0.1 })
 *                             // { text: "+0.0pp", color: "neutral" }
 * ```
 */
export function formatDelta(
  value: number,
  options: DeltaFormatOptions = {},
): DeltaFormatResult {
  const {
    decimals = 1,
    unit = 'pp',
    neutralThreshold = 0,
    invertDirection = false,
  } = options

  const prefix = value > 0 ? '+' : ''
  const text = `${prefix}${value.toFixed(decimals)}${unit}`

  let color: DeltaColorIndicator
  if (Math.abs(value) <= neutralThreshold) {
    color = 'neutral'
  } else if (invertDirection) {
    color = value < 0 ? 'positive' : 'negative'
  } else {
    color = value > 0 ? 'positive' : 'negative'
  }

  return { text, color }
}

// ---------------------------------------------------------------------------
// Sample size formatting (with low-base warnings)
// ---------------------------------------------------------------------------

export type SampleSizeWarning = 'none' | 'low' | 'very_low'

export interface SampleSizeFormatResult {
  /** Formatted string, e.g. "1,234" or "87*". */
  text: string
  /** Warning level. */
  warning: SampleSizeWarning
  /** Human-readable warning message, or null when there is no warning. */
  warningMessage: string | null
}

export interface SampleSizeFormatOptions {
  /**
   * Sample size at or below which the "low" warning fires.
   * Default: 100.
   */
  lowThreshold?: number
  /**
   * Sample size at or below which the "very_low" warning fires.
   * Default: 30.
   */
  veryLowThreshold?: number
}

/**
 * Format a sample / base size and attach a warning indicator when the sample
 * is too small for reliable analysis.
 *
 * ```ts
 * formatSampleSize(1500)    // { text: "1,500",  warning: "none", ... }
 * formatSampleSize(85)      // { text: "85*",    warning: "low", ... }
 * formatSampleSize(20)      // { text: "20**",   warning: "very_low", ... }
 * ```
 */
export function formatSampleSize(
  value: number,
  options: SampleSizeFormatOptions = {},
): SampleSizeFormatResult {
  const { lowThreshold = 100, veryLowThreshold = 30 } = options
  const formatted = formatNumber(value)

  if (value <= veryLowThreshold) {
    return {
      text: `${formatted}**`,
      warning: 'very_low',
      warningMessage: `Very low base (n=${formatted}). Results are indicative only and should not be used for decision-making.`,
    }
  }

  if (value <= lowThreshold) {
    return {
      text: `${formatted}*`,
      warning: 'low',
      warningMessage: `Low base (n=${formatted}). Results should be interpreted with caution.`,
    }
  }

  return {
    text: formatted,
    warning: 'none',
    warningMessage: null,
  }
}

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

export interface CurrencyFormatOptions {
  /** ISO 4217 currency code (default "USD"). */
  currency?: string
  /** Locale for number formatting (default "en-US"). */
  locale?: string
  /** Number of decimal places (default 2). */
  decimals?: number
  /** Use compact notation for large values (e.g. "$1.2M"). Default false. */
  compact?: boolean
}

/**
 * Format a monetary value.
 *
 * ```ts
 * formatCurrency(1234.5)                          // "$1,234.50"
 * formatCurrency(1234.5, { currency: 'GBP' })     // "£1,234.50"
 * formatCurrency(2_500_000, { compact: true })     // "$2.5M"
 * ```
 */
export function formatCurrency(
  value: number,
  options: CurrencyFormatOptions = {},
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    decimals = 2,
    compact = false,
  } = options

  if (compact) {
    // Use Intl compact notation with currency style
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    } catch {
      // Fallback: manual compact
      const symbol = getCurrencySymbol(currency, locale)
      return `${symbol}${formatCompactNumber(value)}`
    }
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Resolve the currency symbol for a given code and locale.
 */
function getCurrencySymbol(currency: string, locale: string): string {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0)
    return parts.find((p) => p.type === 'currency')?.value ?? currency
  } catch {
    return currency
  }
}

// ---------------------------------------------------------------------------
// Statistical significance letter formatting
// ---------------------------------------------------------------------------

export interface SignificanceLetterOptions {
  /**
   * Confidence level expressed as a fraction (e.g. 0.95 for 95%).
   * Controls the visual weight of the output.
   */
  confidenceLevel?: number
  /**
   * When true, wraps the letter in parentheses for lower confidence levels
   * (below 0.95) to indicate marginal significance.
   */
  showMarginal?: boolean
}

/**
 * Format a statistical significance letter as used in GWI crosstab outputs.
 *
 * In cross-tabulation results, a column is assigned a letter (A, B, C, ...).
 * When a cell is statistically significantly higher than the corresponding
 * cell in column X, the letter X appears in the cell.
 *
 * ```ts
 * formatSignificanceLetter('A')                         // "A"
 * formatSignificanceLetter('B', { confidenceLevel: 0.90, showMarginal: true })
 *                                                       // "(B)"
 * formatSignificanceLetter('C', { confidenceLevel: 0.99 })
 *                                                       // "C"
 * ```
 */
export function formatSignificanceLetter(
  letter: string,
  options: SignificanceLetterOptions = {},
): string {
  const { confidenceLevel = 0.95, showMarginal = false } = options
  const normalised = letter.toUpperCase().trim()

  if (!normalised) return ''

  // Marginal significance (below 95% but still noteworthy)
  if (showMarginal && confidenceLevel < 0.95) {
    return `(${normalised})`
  }

  return normalised
}

/**
 * Format multiple significance letters for a single cell.
 *
 * ```ts
 * formatSignificanceLetters(['A', 'C'])   // "AC"
 * formatSignificanceLetters(['B'], { confidenceLevel: 0.90, showMarginal: true })
 *                                         // "(B)"
 * ```
 */
export function formatSignificanceLetters(
  letters: string[],
  options: SignificanceLetterOptions = {},
): string {
  if (letters.length === 0) return ''

  const formatted = letters
    .map((l) => l.toUpperCase().trim())
    .filter(Boolean)
    .sort()
    .join('')

  if (!formatted) return ''

  const { confidenceLevel = 0.95, showMarginal = false } = options
  if (showMarginal && confidenceLevel < 0.95) {
    return `(${formatted})`
  }

  return formatted
}
