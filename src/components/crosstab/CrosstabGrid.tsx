import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import type { MetricType } from '@/api/types'
import type { ConditionalRule } from '@/api/types/crosstab'
import { formatMetricValue } from '@/utils/format'
import { getHeatmapColor, getIndexColor } from '@/utils/chart-colors'
import {
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Flag,
  Check,
  X,
  Copy,
  Users,
  BarChart2,
  Info,
} from 'lucide-react'
import './CrosstabGrid.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GridRow {
  id: string
  label: string
  parent_id?: string
  depth?: number
  row_type?: 'data' | 'header' | 'net' | 'total' | 'calculated' | 'spacer'
  is_collapsed?: boolean
  net_members?: string[]
}

interface GridColumn {
  id: string
  label: string
  parent_id?: string
  header_group?: string
  stat_test_letter?: string
  depth?: number
  wave_id?: string
  is_delta?: boolean
  delta_format?: 'absolute' | 'percentage_point' | 'percentage_change'
}

interface GridCell {
  values: Partial<Record<MetricType, number>>
  significant?: boolean
  sample_size: number
  significance?: {
    letters: string[]
    p_value?: number
    test_statistic?: number
    direction?: 'higher' | 'lower' | 'neutral'
  }
  suppressed?: boolean
  suppression_reason?: 'low_base' | 'complementary'
  trend_data?: number[]
  trend_direction?: 'up' | 'down' | 'flat'
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  rowId: string
  colId: string
}

interface CrosstabGridProps {
  rows: GridRow[]
  columns: GridColumn[]
  cells: GridCell[][]
  activeMetric: MetricType
  highlightMode?: 'none' | 'heatmap' | 'index' | 'significance' | 'custom_rules'
  maxHeight?: number
  statTestActive?: boolean
  suppressionConfig?: { enabled: boolean; replacement_text?: string }
  customRules?: ConditionalRule[]
  showRowNumbers?: boolean
  showTrendSparklines?: boolean
  showTrendArrows?: boolean
  sortColumn?: string
  sortDirection?: 'ascending' | 'descending'
  onSort?: (columnId: string) => void
  onCellAction?: (action: string, rowId: string, colId: string) => void
  onRowCollapse?: (rowId: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COLUMN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function getColumnLetter(index: number): string {
  if (index < 26) return COLUMN_LETTERS[index]
  return COLUMN_LETTERS[Math.floor(index / 26) - 1] + COLUMN_LETTERS[index % 26]
}

/** Build a tiny sparkline SVG path from an array of numbers. */
function buildSparklinePath(data: number[], width: number, height: number): string {
  if (!data || data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const padding = 2

  return data
    .map((v, i) => {
      const x = i * stepX
      const y = padding + (height - 2 * padding) * (1 - (v - min) / range)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

/** Resolve a ConditionalRule icon name to a lucide-react component. */
function RuleIcon({ icon, size = 12 }: { icon: string; size?: number }) {
  switch (icon) {
    case 'arrow_up':
      return <ArrowUp size={size} />
    case 'arrow_down':
      return <ArrowDown size={size} />
    case 'star':
      return <Star size={size} />
    case 'flag':
      return <Flag size={size} />
    case 'check':
      return <Check size={size} />
    case 'x':
      return <X size={size} />
    default:
      return null
  }
}

function matchesRule(value: number, rule: ConditionalRule): boolean {
  switch (rule.condition) {
    case 'greater_than':
      return value > rule.value
    case 'less_than':
      return value < rule.value
    case 'between':
      return value >= rule.value && value <= (rule.value2 ?? rule.value)
    case 'equals':
      return value === rule.value
    // top_n / bottom_n need full-column context; handled externally if needed
    default:
      return false
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CrosstabGrid({
  rows,
  columns,
  cells,
  activeMetric,
  highlightMode = 'none',
  maxHeight,
  statTestActive = false,
  suppressionConfig,
  customRules,
  showRowNumbers = false,
  showTrendSparklines = false,
  showTrendArrows = false,
  sortColumn,
  sortDirection,
  onSort,
  onCellAction,
  onRowCollapse,
}: CrosstabGridProps) {
  // ---- value range for heatmap -------------------------------------------
  const allValues = useMemo(
    () => cells.flat().map((c) => c.values[activeMetric] ?? 0),
    [cells, activeMetric],
  )
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)

  // ---- context menu state ------------------------------------------------
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    rowId: '',
    colId: '',
  })
  const ctxRef = useRef<HTMLDivElement>(null)

  // Close context menu on outside click or scroll
  useEffect(() => {
    if (!ctxMenu.visible) return
    const close = () => setCtxMenu((p) => ({ ...p, visible: false }))
    document.addEventListener('click', close)
    document.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('scroll', close, true)
    }
  }, [ctxMenu.visible])

  // ---- context menu handler ----------------------------------------------
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, rowId: string, colId: string) => {
      e.preventDefault()
      setCtxMenu({ visible: true, x: e.clientX, y: e.clientY, rowId, colId })
    },
    [],
  )

  const handleCtxAction = useCallback(
    (action: string) => {
      onCellAction?.(action, ctxMenu.rowId, ctxMenu.colId)
      setCtxMenu((p) => ({ ...p, visible: false }))
    },
    [onCellAction, ctxMenu.rowId, ctxMenu.colId],
  )

  // ---- cell style helper -------------------------------------------------
  const getCellStyle = useCallback(
    (value: number, cell: GridCell): React.CSSProperties => {
      if (highlightMode === 'heatmap') {
        return { backgroundColor: getHeatmapColor(value, minVal, maxVal) }
      }
      if (highlightMode === 'index' && activeMetric === 'audience_index') {
        return { color: getIndexColor(value) }
      }
      if (highlightMode === 'significance' && cell.significance) {
        const dir = cell.significance.direction
        if (dir === 'higher') return { backgroundColor: 'rgba(0, 179, 122, 0.10)', color: '#006644' }
        if (dir === 'lower') return { backgroundColor: 'rgba(229, 62, 62, 0.10)', color: '#e53e3e' }
      }
      if (highlightMode === 'custom_rules' && customRules) {
        for (const rule of customRules) {
          if (matchesRule(value, rule)) {
            const s: React.CSSProperties = {}
            if (rule.style.background_color) s.backgroundColor = rule.style.background_color
            if (rule.style.text_color) s.color = rule.style.text_color
            if (rule.style.font_weight) s.fontWeight = rule.style.font_weight
            if (rule.style.border) s.border = rule.style.border
            return s
          }
        }
      }
      return {}
    },
    [highlightMode, minVal, maxVal, activeMetric, customRules],
  )

  // ---- Find the matching custom rule for a cell for icon rendering -------
  const getMatchingRule = useCallback(
    (value: number): ConditionalRule | null => {
      if (highlightMode !== 'custom_rules' || !customRules) return null
      for (const rule of customRules) {
        if (matchesRule(value, rule)) return rule
      }
      return null
    },
    [highlightMode, customRules],
  )

  // ---- header groups -----------------------------------------------------
  const headerGroups = useMemo(() => {
    const groups: Array<{ label: string; colSpan: number }> = []
    let currentGroup: string | undefined
    let span = 0

    columns.forEach((col, i) => {
      if (col.header_group !== currentGroup) {
        if (span > 0) {
          groups.push({ label: currentGroup ?? '', colSpan: span })
        }
        currentGroup = col.header_group
        span = 1
      } else {
        span++
      }
      if (i === columns.length - 1) {
        groups.push({ label: currentGroup ?? '', colSpan: span })
      }
    })

    // Only render the group row if at least one column has a header_group
    const hasGroups = columns.some((c) => c.header_group)
    return hasGroups ? groups : null
  }, [columns])

  // ---- build row entries (preserving existing group logic) ----------------
  const rowEntries = useMemo(() => {
    const entries: Array<
      | { type: 'group'; label: string }
      | { type: 'data'; row: GridRow; index: number }
    > = []
    let lastParent: string | undefined | null = null

    // Build a set of collapsed parent IDs for fast filtering
    const collapsedIds = new Set<string>()
    rows.forEach((r) => {
      if (r.is_collapsed) collapsedIds.add(r.id)
    })

    rows.forEach((row, i) => {
      // Skip children of collapsed parents
      if (row.parent_id && collapsedIds.has(row.parent_id)) return

      if (row.parent_id && row.parent_id !== lastParent) {
        entries.push({ type: 'group', label: row.parent_id })
        lastParent = row.parent_id
      } else if (!row.parent_id && lastParent !== null && lastParent !== undefined) {
        lastParent = null
      }
      entries.push({ type: 'data', row, index: i })
    })

    return entries
  }, [rows])

  // ---- number of leading fixed columns -----------------------------------
  const leadingCols = showRowNumbers ? 2 : 1

  // ---- format a delta value with +/- prefix ------------------------------
  const formatDelta = (value: number, col: GridColumn): string => {
    const formatted = formatMetricValue(activeMetric, Math.abs(value))
    const prefix = value > 0 ? '+' : value < 0 ? '\u2212' : ''
    if (col.delta_format === 'percentage_point') return `${prefix}${formatted} pp`
    if (col.delta_format === 'percentage_change') return `${prefix}${formatted}`
    return `${prefix}${formatted}`
  }

  // ===================== RENDER =====================

  return (
    <div className="crosstab-grid__wrapper" style={maxHeight ? { maxHeight } : undefined}>
      <table className="crosstab-grid">
        {/* ===== THEAD ===== */}
        <thead>
          {/* Header group row (if any) */}
          {headerGroups && (
            <tr className="crosstab-grid__header-group-row">
              <th
                className="crosstab-grid__corner crosstab-grid__corner--group"
                colSpan={leadingCols}
              />
              {headerGroups.map((g, gi) => (
                <th
                  key={gi}
                  className="crosstab-grid__header-group-cell"
                  colSpan={g.colSpan}
                >
                  {g.label}
                </th>
              ))}
            </tr>
          )}

          {/* Main column header row */}
          <tr>
            {showRowNumbers && (
              <th className="crosstab-grid__corner crosstab-grid__corner--row-num">#</th>
            )}
            <th className="crosstab-grid__corner" />
            {columns.map((col, ci) => {
              const isSorted = sortColumn === col.id
              return (
                <th
                  key={col.id}
                  className={[
                    'crosstab-grid__col-header',
                    col.is_delta ? 'crosstab-grid__col-header--delta' : '',
                    onSort ? 'crosstab-grid__col-header--sortable' : '',
                    isSorted ? 'crosstab-grid__col-header--sorted' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={onSort ? () => onSort(col.id) : undefined}
                >
                  <span className="crosstab-grid__col-header-content">
                    {col.label}
                    {statTestActive && (
                      <span className="crosstab-grid__stat-letter">
                        {col.stat_test_letter ?? getColumnLetter(ci)}
                      </span>
                    )}
                  </span>
                  {isSorted && (
                    <span className="crosstab-grid__sort-indicator">
                      {sortDirection === 'ascending' ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                    </span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        {/* ===== TBODY ===== */}
        <tbody>
          {rowEntries.map((entry, ei) => {
            if (entry.type === 'group') {
              return (
                <tr key={`group-${ei}`} className="crosstab-grid__group-row">
                  <th
                    className="crosstab-grid__group-header"
                    colSpan={columns.length + leadingCols}
                  >
                    {entry.label}
                  </th>
                </tr>
              )
            }

            const { row, index: ri } = entry

            // Row type classes
            const rowClasses = [
              'crosstab-grid__data-row',
              row.row_type === 'net' ? 'crosstab-grid__data-row--net' : '',
              row.row_type === 'total' ? 'crosstab-grid__data-row--total' : '',
              row.row_type === 'calculated' ? 'crosstab-grid__data-row--calculated' : '',
              row.row_type === 'spacer' ? 'crosstab-grid__data-row--spacer' : '',
            ]
              .filter(Boolean)
              .join(' ')

            // Depth indentation
            const depthPadding = (row.depth ?? 0) * 16

            // Determine if this row has children (collapsible)
            const hasChildren = rows.some((r) => r.parent_id === row.id)
            const isCollapsed = row.is_collapsed ?? false

            return (
              <tr key={row.id} className={rowClasses}>
                {/* Optional row number */}
                {showRowNumbers && (
                  <td className="crosstab-grid__row-number">{ri + 1}</td>
                )}

                {/* Row header */}
                <th
                  className="crosstab-grid__row-header"
                  style={depthPadding > 0 ? { paddingLeft: 16 + depthPadding } : undefined}
                >
                  <span className="crosstab-grid__row-header-content">
                    {hasChildren && onRowCollapse && (
                      <button
                        className="crosstab-grid__collapse-btn"
                        onClick={() => onRowCollapse(row.id)}
                        aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
                      >
                        {isCollapsed ? (
                          <ChevronRight size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    )}
                    {row.label}
                  </span>
                </th>

                {/* Data cells */}
                {columns.map((col, ci) => {
                  const cell = cells[ri]?.[ci]
                  if (!cell) {
                    return <td key={col.id} className="crosstab-grid__cell" />
                  }

                  const value = cell.values[activeMetric] ?? 0
                  const isSuppressed =
                    cell.suppressed && suppressionConfig?.enabled !== false

                  // Build cell class list
                  const cellClasses = [
                    'crosstab-grid__cell',
                    cell.significant ? 'crosstab-grid__cell--significant' : '',
                    isSuppressed ? 'crosstab-grid__cell--suppressed' : '',
                    col.is_delta ? 'crosstab-grid__cell--delta' : '',
                    col.is_delta && value > 0 ? 'crosstab-grid__cell--delta-positive' : '',
                    col.is_delta && value < 0 ? 'crosstab-grid__cell--delta-negative' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  const cellStyle = isSuppressed ? {} : getCellStyle(value, cell)

                  // Matching custom rule (for icon)
                  const matchedRule = isSuppressed ? null : getMatchingRule(value)

                  // Format the display value
                  let displayValue: string
                  if (isSuppressed) {
                    displayValue = suppressionConfig?.replacement_text ?? '*'
                  } else if (col.is_delta) {
                    displayValue = formatDelta(value, col)
                  } else {
                    displayValue = formatMetricValue(activeMetric, value)
                  }

                  return (
                    <td
                      key={col.id}
                      className={cellClasses}
                      style={cellStyle}
                      title={`Sample: ${cell.sample_size ?? 0}`}
                      onContextMenu={(e) => handleContextMenu(e, row.id, col.id)}
                    >
                      <span className="crosstab-grid__cell-content">
                        {/* Conditional formatting icon */}
                        {matchedRule?.style.icon && (
                          <span className="crosstab-grid__cell-icon">
                            <RuleIcon icon={matchedRule.style.icon} />
                          </span>
                        )}

                        {/* Main value */}
                        <span className="crosstab-grid__cell-value">{displayValue}</span>

                        {/* Significance letters */}
                        {!isSuppressed &&
                          statTestActive &&
                          cell.significance?.letters &&
                          cell.significance.letters.length > 0 && (
                            <span className="crosstab-grid__sig-letters">
                              {cell.significance.letters.join('')}
                            </span>
                          )}

                        {/* Trend direction arrow */}
                        {!isSuppressed && showTrendArrows && cell.trend_direction && (
                          <span
                            className={`crosstab-grid__trend-arrow crosstab-grid__trend-arrow--${cell.trend_direction}`}
                          >
                            {cell.trend_direction === 'up' && <ArrowUp size={12} />}
                            {cell.trend_direction === 'down' && <ArrowDown size={12} />}
                            {cell.trend_direction === 'flat' && <Minus size={12} />}
                          </span>
                        )}

                        {/* Sparkline */}
                        {!isSuppressed &&
                          showTrendSparklines &&
                          cell.trend_data &&
                          cell.trend_data.length >= 2 && (
                            <svg
                              className="crosstab-grid__sparkline"
                              width={40}
                              height={16}
                              viewBox="0 0 40 16"
                            >
                              <path
                                d={buildSparklinePath(cell.trend_data, 40, 16)}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* ===== CONTEXT MENU ===== */}
      {ctxMenu.visible && (
        <div
          ref={ctxRef}
          className="crosstab-grid__context-menu"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
        >
          <button
            className="crosstab-grid__context-menu-item"
            onClick={() => handleCtxAction('copy_value')}
          >
            <Copy size={14} />
            <span>Copy Value</span>
          </button>
          <button
            className="crosstab-grid__context-menu-item"
            onClick={() => handleCtxAction('save_as_audience')}
          >
            <Users size={14} />
            <span>Save as Audience</span>
          </button>
          <button
            className="crosstab-grid__context-menu-item"
            onClick={() => handleCtxAction('create_chart')}
          >
            <BarChart2 size={14} />
            <span>Create Chart</span>
          </button>
          <button
            className="crosstab-grid__context-menu-item"
            onClick={() => handleCtxAction('view_details')}
          >
            <Info size={14} />
            <span>View Details</span>
          </button>
        </div>
      )}
    </div>
  )
}
