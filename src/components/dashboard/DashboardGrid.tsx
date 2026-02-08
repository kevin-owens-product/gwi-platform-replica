import { useState, useMemo, useCallback } from 'react'
import {
  GripVertical,
  Maximize2,
  Minimize2,
  Trash2,
  Settings,
  Lock,
  Filter,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  X,
  Calendar,
  ChevronDown,
  Target,
  AlertTriangle,
  Check,
} from 'lucide-react'
import type {
  DashboardWidget,
  DashboardFilter,
  MetricType,
  StatsQueryRequest,
  StatsDatapoint,
  AudienceExpression,
  WidgetConditionalFormatting,
} from '@/api/types'
import { useChart } from '@/hooks/useCharts'
import { useStatsQuery } from '@/hooks/useQueries'
import ChartRenderer from '@/components/chart/ChartRenderer'
import './DashboardGrid.css'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

function formatValue(value: number, format?: string): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
    case 'compact':
      return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

function evaluateConditionalFormatting(
  value: number,
  formatting?: WidgetConditionalFormatting,
): { backgroundColor?: string; textColor?: string; icon?: string } | null {
  if (!formatting?.rules?.length) return null
  for (const rule of formatting.rules) {
    let matches = false
    switch (rule.condition) {
      case 'greater_than':
        matches = value > rule.value
        break
      case 'less_than':
        matches = value < rule.value
        break
      case 'between':
        matches = value >= rule.value && value <= (rule.value2 ?? rule.value)
        break
      case 'equals':
        matches = value === rule.value
        break
    }
    if (matches) {
      return {
        backgroundColor: rule.style.background_color,
        textColor: rule.style.text_color,
        icon: rule.style.icon,
      }
    }
  }
  return null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function ConditionalIcon({ icon }: { icon?: string }) {
  switch (icon) {
    case 'arrow_up':
      return <ArrowUp size={12} />
    case 'arrow_down':
      return <ArrowDown size={12} />
    case 'check':
      return <Check size={12} />
    case 'x':
      return <X size={12} />
    case 'warning':
      return <AlertTriangle size={12} />
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function WidgetSkeleton() {
  return (
    <div className="dashboard-grid__skeleton">
      <div className="dashboard-grid__skeleton-bar dashboard-grid__skeleton-bar--wide" />
      <div className="dashboard-grid__skeleton-bar dashboard-grid__skeleton-bar--medium" />
      <div className="dashboard-grid__skeleton-bar dashboard-grid__skeleton-bar--narrow" />
      <div className="dashboard-grid__skeleton-bar dashboard-grid__skeleton-bar--wide" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// WidgetChart (existing, unchanged)
// ---------------------------------------------------------------------------

export function WidgetChart({ widget, height }: { widget: DashboardWidget; height?: number }) {
  const { data: chart, isLoading: chartLoading } = useChart(widget.chart_id ?? '')

  const statsRequest: StatsQueryRequest | null = useMemo(() => {
    if (!chart?.config) return null
    const questionIds = chart.config.rows
      ?.filter((d) => d.type === 'question' && d.question_id)
      .map((d) => d.question_id!) ?? []
    if (questionIds.length === 0) return null
    return {
      question_ids: questionIds,
      metrics: chart.config.metrics ?? ['audience_percentage' as MetricType],
      wave_ids: chart.config.wave_ids ?? [],
      location_ids: chart.config.location_ids ?? [],
      base_audience: chart.config.base_audience,
    }
  }, [chart?.config])

  const { data: statsData, isLoading: statsLoading } = useStatsQuery(statsRequest)

  const { chartData, series } = useMemo((): { chartData: ChartDataPoint[]; series: string[] } => {
    if (!statsData?.results?.length) return { chartData: [], series: [] }
    const metric: MetricType = chart?.config?.metrics?.[0] ?? 'audience_percentage'
    const metricLabel = metric === 'audience_percentage' ? 'Percentage'
      : metric === 'audience_index' ? 'Index'
      : metric === 'audience_size' ? 'Audience Size'
      : metric
    const result = statsData.results[0]
    if (!result) return { chartData: [], series: [] }
    const data: ChartDataPoint[] = result.datapoints.map((dp: StatsDatapoint) => ({
      name: dp.datapoint_name,
      [metricLabel]: dp.metrics[metric] ?? 0,
    }))
    return { chartData: data, series: [metricLabel] }
  }, [statsData, chart?.config?.metrics])

  if (chartLoading || statsLoading) {
    return <WidgetSkeleton />
  }

  return (
    <ChartRenderer
      type={chart?.chart_type ?? widget.chart_type ?? 'bar'}
      data={chartData}
      series={series}
      height={height ?? (widget.position.h * 80 - 60)}
    />
  )
}

// ---------------------------------------------------------------------------
// Enhanced Stat widget
// ---------------------------------------------------------------------------

function WidgetStat({ widget }: { widget: DashboardWidget }) {
  const cfg = widget.stat_config
  const cfmt = widget.conditional_formatting

  // Determine the displayed value
  const displayValue = cfg ? formatValue(cfg.value, cfg.format) : (widget.text_content ?? '--')
  const rawValue = cfg?.value ?? 0

  // Conditional formatting on the stat value
  const conditionalStyle = evaluateConditionalFormatting(rawValue, cfmt)
  const valueStyle: React.CSSProperties = {}
  if (conditionalStyle?.textColor) valueStyle.color = conditionalStyle.textColor
  if (conditionalStyle?.backgroundColor) {
    valueStyle.backgroundColor = conditionalStyle.backgroundColor
    valueStyle.borderRadius = '6px'
    valueStyle.padding = '2px 8px'
  }
  if (cfg?.color && !conditionalStyle?.textColor) valueStyle.color = cfg.color

  // Comparison arrow
  const comparisonArrow = cfg?.comparison?.direction === 'up'
    ? <ArrowUp size={14} className="dashboard-grid__stat-arrow dashboard-grid__stat-arrow--up" />
    : cfg?.comparison?.direction === 'down'
    ? <ArrowDown size={14} className="dashboard-grid__stat-arrow dashboard-grid__stat-arrow--down" />
    : cfg?.comparison?.direction === 'flat'
    ? <Minus size={14} className="dashboard-grid__stat-arrow dashboard-grid__stat-arrow--flat" />
    : null

  // Mini sparkline
  const sparkData = cfg?.sparkline_data
  const sparkSvg = sparkData && sparkData.length > 1 ? (
    <SparklineSvg data={sparkData} color={cfg?.color ?? 'var(--color-primary)'} fill width={80} height={24} />
  ) : null

  // Target indicator
  const targetPct = cfg?.target && cfg.target > 0 ? Math.min((cfg.value / cfg.target) * 100, 100) : null

  return (
    <div className="dashboard-grid__stat">
      <span className="dashboard-grid__stat-value" style={valueStyle}>
        {conditionalStyle?.icon && <ConditionalIcon icon={conditionalStyle.icon} />}
        {displayValue}
      </span>
      <span className="dashboard-grid__stat-label">{cfg?.label ?? widget.title ?? 'Statistic'}</span>
      {cfg?.comparison && (
        <span
          className={`dashboard-grid__stat-comparison dashboard-grid__stat-comparison--${cfg.comparison.direction}`}
        >
          {comparisonArrow}
          {formatValue(Math.abs(cfg.comparison.value), 'percentage')}
          <span className="dashboard-grid__stat-period">{cfg.comparison.period_label}</span>
        </span>
      )}
      {sparkSvg && <div className="dashboard-grid__stat-spark">{sparkSvg}</div>}
      {targetPct !== null && (
        <div className="dashboard-grid__stat-target">
          <div className="dashboard-grid__stat-target-bar">
            <div
              className="dashboard-grid__stat-target-fill"
              style={{ width: `${targetPct}%` }}
            />
          </div>
          <span className="dashboard-grid__stat-target-label">
            <Target size={10} /> {targetPct.toFixed(0)}% of target
          </span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sparkline SVG helper
// ---------------------------------------------------------------------------

function SparklineSvg({
  data,
  color = 'var(--color-primary)',
  fill = false,
  width = 120,
  height = 40,
  showMinMax = false,
}: {
  data: number[]
  color?: string
  fill?: boolean
  width?: number
  height?: number
  showMinMax?: boolean
}) {
  if (!data.length) return null

  const pad = showMinMax ? 8 : 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = (width - pad * 2) / Math.max(data.length - 1, 1)

  const points = data.map((v, i) => {
    const x = pad + i * stepX
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x},${y}`
  })

  const linePath = `M${points.join(' L')}`
  const areaPath = fill
    ? `${linePath} L${pad + (data.length - 1) * stepX},${height - pad} L${pad},${height - pad} Z`
    : undefined

  const minIdx = data.indexOf(min)
  const maxIdx = data.indexOf(max)

  return (
    <svg width={width} height={height} className="dashboard-grid__sparkline-svg" viewBox={`0 0 ${width} ${height}`}>
      {areaPath && (
        <path d={areaPath} fill={color} opacity={0.15} />
      )}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {showMinMax && (
        <>
          <circle cx={pad + minIdx * stepX} cy={height - pad - ((min - min) / range) * (height - pad * 2)} r={2.5} fill={color} />
          <circle cx={pad + maxIdx * stepX} cy={height - pad - ((max - min) / range) * (height - pad * 2)} r={2.5} fill={color} />
        </>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Sparkline widget (full)
// ---------------------------------------------------------------------------

function WidgetSparkline({ widget }: { widget: DashboardWidget }) {
  const cfg = widget.sparkline_config
  if (!cfg?.data?.length) {
    return <div className="dashboard-grid__image-placeholder">No sparkline data</div>
  }
  return (
    <div className="dashboard-grid__sparkline">
      <SparklineSvg
        data={cfg.data}
        color={cfg.color}
        fill={cfg.fill}
        width={260}
        height={60}
        showMinMax={cfg.show_min_max}
      />
      {cfg.labels && cfg.labels.length >= 2 && (
        <div className="dashboard-grid__sparkline-labels">
          <span>{cfg.labels[0]}</span>
          <span>{cfg.labels[cfg.labels.length - 1]}</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Gauge widget
// ---------------------------------------------------------------------------

function WidgetGauge({ widget }: { widget: DashboardWidget }) {
  const cfg = widget.gauge_config
  if (!cfg) return <div className="dashboard-grid__image-placeholder">No gauge config</div>

  const { value, min, max, thresholds, format, label } = cfg
  const range = max - min || 1
  const pct = Math.max(0, Math.min(((value - min) / range) * 100, 100))

  // Build conic-gradient from thresholds
  const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value)
  const gradientStops: string[] = []
  let prevPct = 0
  for (const t of sortedThresholds) {
    const tPct = ((t.value - min) / range) * 100
    gradientStops.push(`${t.color} ${prevPct}% ${tPct}%`)
    prevPct = tPct
  }
  if (prevPct < 100) {
    const lastColor = sortedThresholds[sortedThresholds.length - 1]?.color ?? '#e5e7eb'
    gradientStops.push(`${lastColor} ${prevPct}% 100%`)
  }
  // The gauge is a half-circle (180deg). We use conic-gradient from 180deg.
  const conicGradient = `conic-gradient(from 180deg, ${gradientStops.join(', ')}, transparent 0)`

  const displayVal = format === 'percentage' ? `${value.toFixed(1)}%` : formatValue(value, 'number')

  // Needle rotation: 0deg = left (180deg absolute), 180deg = right (360deg absolute)
  const needleDeg = (pct / 100) * 180

  return (
    <div className="dashboard-grid__gauge">
      <div className="dashboard-grid__gauge-ring" style={{ background: conicGradient }}>
        <div className="dashboard-grid__gauge-mask" />
        <div
          className="dashboard-grid__gauge-needle"
          style={{ transform: `rotate(${needleDeg}deg)` }}
        />
      </div>
      <div className="dashboard-grid__gauge-value">{displayVal}</div>
      <div className="dashboard-grid__gauge-label">{label}</div>
      <div className="dashboard-grid__gauge-bounds">
        <span>{format === 'percentage' ? `${min}%` : min}</span>
        <span>{format === 'percentage' ? `${max}%` : max}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Table widget
// ---------------------------------------------------------------------------

function WidgetTable({ widget }: { widget: DashboardWidget }) {
  const cfg = widget.table_config
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  if (!cfg) return <div className="dashboard-grid__image-placeholder">No table config</div>

  const pageSize = cfg.page_size ?? 10
  const columns = cfg.columns ?? []
  const allRows = cfg.rows ?? []

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return allRows
    return [...allRows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null || bv == null) return 0
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [allRows, sortKey, sortDir])

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  const formatCell = (value: unknown, format?: string) => {
    if (value == null) return '--'
    if (typeof value === 'number') return formatValue(value, format)
    return String(value)
  }

  return (
    <div className="dashboard-grid__table-wrapper">
      <table className={`dashboard-grid__table ${cfg.striped ? 'dashboard-grid__table--striped' : ''}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={col.sortable !== false && cfg.sortable !== false ? 'dashboard-grid__table-sortable' : ''}
                onClick={() => col.sortable !== false && cfg.sortable !== false && handleSort(col.key)}
              >
                <span>{col.label}</span>
                {col.sortable !== false && cfg.sortable !== false && (
                  <ArrowUpDown size={10} className={`dashboard-grid__table-sort-icon ${sortKey === col.key ? 'dashboard-grid__table-sort-icon--active' : ''}`} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, ri) => (
            <tr key={ri}>
              {columns.map((col) => {
                const cellVal = row[col.key]
                const numVal = typeof cellVal === 'number' ? cellVal : undefined
                const cellFmt = numVal !== undefined
                  ? evaluateConditionalFormatting(numVal, col.conditional_formatting)
                  : null
                const style: React.CSSProperties = {}
                if (cellFmt?.backgroundColor) style.backgroundColor = cellFmt.backgroundColor
                if (cellFmt?.textColor) style.color = cellFmt.textColor
                return (
                  <td key={col.key} style={style}>
                    {cellFmt?.icon && <ConditionalIcon icon={cellFmt.icon} />}
                    {formatCell(cellVal, col.format)}
                  </td>
                )
              })}
            </tr>
          ))}
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="dashboard-grid__table-empty">No data</td>
            </tr>
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="dashboard-grid__table-pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} />
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Funnel widget
// ---------------------------------------------------------------------------

function WidgetFunnel({ widget }: { widget: DashboardWidget }) {
  // Funnel data lives in list_config.items reused for simplicity (rank = step order)
  const items = widget.list_config?.items
  if (!items?.length) return <div className="dashboard-grid__image-placeholder">No funnel data</div>

  const maxVal = items[0]?.value ?? 1

  return (
    <div className="dashboard-grid__funnel">
      {items.map((item, i) => {
        const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0
        const conversionPct = i > 0 && items[i - 1].value > 0
          ? ((item.value / items[i - 1].value) * 100).toFixed(1)
          : null
        return (
          <div key={i} className="dashboard-grid__funnel-step">
            <div className="dashboard-grid__funnel-label">
              <span className="dashboard-grid__funnel-step-name">{item.label}</span>
              <span className="dashboard-grid__funnel-step-value">
                {formatValue(item.value, item.format)}
                {conversionPct && (
                  <span className="dashboard-grid__funnel-conversion"> ({conversionPct}%)</span>
                )}
              </span>
            </div>
            <div className="dashboard-grid__funnel-bar-track">
              <div
                className="dashboard-grid__funnel-bar-fill"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.bar_color ?? 'var(--color-primary)',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// List / Leaderboard widget
// ---------------------------------------------------------------------------

function WidgetList({ widget }: { widget: DashboardWidget }) {
  const cfg = widget.list_config
  if (!cfg?.items?.length) return <div className="dashboard-grid__image-placeholder">No list data</div>

  const visibleItems = cfg.max_items ? cfg.items.slice(0, cfg.max_items) : cfg.items
  const maxVal = Math.max(...visibleItems.map((i) => i.value), 1)

  return (
    <div className="dashboard-grid__list">
      {visibleItems.map((item, i) => (
        <div key={i} className="dashboard-grid__list-item">
          <span className="dashboard-grid__list-rank">{item.rank ?? i + 1}</span>
          <div className="dashboard-grid__list-content">
            <div className="dashboard-grid__list-label-row">
              <span className="dashboard-grid__list-label">{item.label}</span>
              <span className="dashboard-grid__list-value">{formatValue(item.value, item.format)}</span>
            </div>
            {cfg.show_bars !== false && (
              <div className="dashboard-grid__list-bar-track">
                <div
                  className="dashboard-grid__list-bar-fill"
                  style={{
                    width: `${(item.value / maxVal) * 100}%`,
                    backgroundColor: item.bar_color ?? 'var(--color-primary)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Map placeholder widget
// ---------------------------------------------------------------------------

function WidgetMap({ widget }: { widget: DashboardWidget }) {
  const cfg = widget.map_config
  return (
    <div className="dashboard-grid__map">
      <div className="dashboard-grid__map-globe">
        <Globe size={48} strokeWidth={1} />
      </div>
      <span className="dashboard-grid__map-label">Map visualization</span>
      {cfg?.data && cfg.data.length > 0 && (
        <div className="dashboard-grid__map-locations">
          {cfg.data.slice(0, 6).map((loc, i) => (
            <div key={i} className="dashboard-grid__map-location">
              <span className="dashboard-grid__map-location-name">{loc.location_name}</span>
              <span className="dashboard-grid__map-location-value">{formatValue(loc.value, 'compact')}</span>
            </div>
          ))}
          {cfg.data.length > 6 && (
            <div className="dashboard-grid__map-location dashboard-grid__map-location--more">
              +{cfg.data.length - 6} more
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Embed widget
// ---------------------------------------------------------------------------

function WidgetEmbed({ widget }: { widget: DashboardWidget }) {
  const url = widget.embed_url
  if (!url) return <div className="dashboard-grid__image-placeholder">No embed URL</div>
  return (
    <iframe
      src={url}
      className="dashboard-grid__embed"
      title={widget.title ?? 'Embedded content'}
      sandbox="allow-scripts allow-same-origin allow-popups"
      loading="lazy"
    />
  )
}

// ---------------------------------------------------------------------------
// Divider widget
// ---------------------------------------------------------------------------

function WidgetDivider({ widget }: { widget: DashboardWidget }) {
  return (
    <div className="dashboard-grid__divider">
      <hr className="dashboard-grid__divider-line" />
      {widget.text_content && (
        <span className="dashboard-grid__divider-label">{widget.text_content}</span>
      )}
      <hr className="dashboard-grid__divider-line" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard-level filter bar
// ---------------------------------------------------------------------------

function DashboardFilterBar({
  filters,
  filterState,
  onFilterChange,
}: {
  filters: DashboardFilter[]
  filterState?: Record<string, unknown>
  onFilterChange?: (filterId: string, value: unknown) => void
}) {
  return (
    <div className="dashboard-grid__filter-bar">
      <div className="dashboard-grid__filter-bar-label">
        <Filter size={14} />
        <span>Filters</span>
      </div>
      <div className="dashboard-grid__filter-bar-controls">
        {filters.map((f) => {
          const currentValue = filterState?.[f.id] ?? f.default_value
          switch (f.type) {
            case 'dropdown':
            case 'multi_select':
              return (
                <div key={f.id} className="dashboard-grid__filter-control">
                  <label className="dashboard-grid__filter-control-label">{f.label}</label>
                  <div className="dashboard-grid__filter-select-wrapper">
                    <select
                      className="dashboard-grid__filter-select"
                      value={String(currentValue ?? '')}
                      onChange={(e) => onFilterChange?.(f.id, e.target.value)}
                    >
                      <option value="">All</option>
                      {f.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="dashboard-grid__filter-select-icon" />
                  </div>
                </div>
              )
            case 'search':
              return (
                <div key={f.id} className="dashboard-grid__filter-control">
                  <label className="dashboard-grid__filter-control-label">{f.label}</label>
                  <div className="dashboard-grid__filter-search-wrapper">
                    <Search size={12} className="dashboard-grid__filter-search-icon" />
                    <input
                      type="text"
                      className="dashboard-grid__filter-search"
                      placeholder={`Search ${f.label.toLowerCase()}...`}
                      value={String(currentValue ?? '')}
                      onChange={(e) => onFilterChange?.(f.id, e.target.value)}
                    />
                  </div>
                </div>
              )
            case 'date_range':
              return (
                <div key={f.id} className="dashboard-grid__filter-control">
                  <label className="dashboard-grid__filter-control-label">{f.label}</label>
                  <div className="dashboard-grid__filter-date-wrapper">
                    <Calendar size={12} className="dashboard-grid__filter-date-icon" />
                    <input
                      type="date"
                      className="dashboard-grid__filter-date"
                      value={String(currentValue ?? '')}
                      onChange={(e) => onFilterChange?.(f.id, e.target.value)}
                    />
                  </div>
                </div>
              )
            case 'toggle':
              return (
                <div key={f.id} className="dashboard-grid__filter-control dashboard-grid__filter-control--toggle">
                  <label className="dashboard-grid__filter-toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(currentValue)}
                      onChange={(e) => onFilterChange?.(f.id, e.target.checked)}
                    />
                    <span className="dashboard-grid__filter-toggle-track" />
                    <span className="dashboard-grid__filter-control-label">{f.label}</span>
                  </label>
                </div>
              )
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Refresh indicator
// ---------------------------------------------------------------------------

function RefreshIndicator({ lastRefreshedAt, live }: { lastRefreshedAt?: string; live?: boolean }) {
  if (!lastRefreshedAt) return null
  return (
    <div className="dashboard-grid__refresh-indicator">
      {live && <span className="dashboard-grid__refresh-dot" />}
      <RefreshCw size={11} />
      <span>Last updated: {timeAgo(lastRefreshedAt)}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Maximized overlay
// ---------------------------------------------------------------------------

function MaximizedOverlay({
  widget,
  onClose,
}: {
  widget: DashboardWidget
  onClose: () => void
}) {
  return (
    <div className="dashboard-grid__maximized-overlay" onClick={onClose}>
      <div className="dashboard-grid__maximized-content" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-grid__maximized-header">
          <span className="dashboard-grid__widget-title">{widget.title ?? 'Widget'}</span>
          <button className="dashboard-grid__maximized-close" onClick={onClose} title="Close">
            <Minimize2 size={18} />
          </button>
        </div>
        <div className="dashboard-grid__maximized-body">
          <WidgetContentRenderer widget={widget} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Content renderer (shared between normal + maximized views)
// ---------------------------------------------------------------------------

function WidgetContentRenderer({ widget }: { widget: DashboardWidget }) {
  switch (widget.type) {
    case 'chart':
      return <WidgetChart widget={widget} />
    case 'stat':
      return <WidgetStat widget={widget} />
    case 'text':
      return (
        <div className="dashboard-grid__text">
          {widget.text_content || 'Text widget'}
        </div>
      )
    case 'image':
      return widget.image_url ? (
        <img src={widget.image_url} alt={widget.title || ''} className="dashboard-grid__image" />
      ) : (
        <div className="dashboard-grid__image-placeholder">No image</div>
      )
    case 'gauge':
      return <WidgetGauge widget={widget} />
    case 'sparkline':
      return <WidgetSparkline widget={widget} />
    case 'table':
      return <WidgetTable widget={widget} />
    case 'funnel':
      return <WidgetFunnel widget={widget} />
    case 'list':
      return <WidgetList widget={widget} />
    case 'map':
      return <WidgetMap widget={widget} />
    case 'embed':
      return <WidgetEmbed widget={widget} />
    case 'divider':
      return <WidgetDivider widget={widget} />
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// DashboardGrid (main component)
// ---------------------------------------------------------------------------

interface DashboardGridProps {
  widgets: DashboardWidget[]
  columns?: number
  editable?: boolean
  onWidgetUpdate?: (widget: DashboardWidget) => void
  onWidgetRemove?: (widgetId: string) => void
  onWidgetSettings?: (widgetId: string) => void
  onWidgetMaximize?: (widgetId: string) => void
  baseAudience?: AudienceExpression
  // New props
  filters?: DashboardFilter[]
  filterState?: Record<string, unknown>
  onFilterChange?: (filterId: string, value: unknown) => void
  crossFilterSource?: string | null
  onCrossFilter?: (widgetId: string, value: unknown) => void
  presentationMode?: boolean
  showRefreshIndicator?: boolean
  lastRefreshedAt?: string
}

export default function DashboardGrid({
  widgets,
  columns = 12,
  editable = false,
  onWidgetRemove,
  onWidgetSettings,
  onWidgetMaximize,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  baseAudience,
  filters,
  filterState,
  onFilterChange,
  crossFilterSource,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCrossFilter,
  presentationMode = false,
  showRefreshIndicator = false,
  lastRefreshedAt,
}: DashboardGridProps) {
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null)
  const [maximizedWidgetId, setMaximizedWidgetId] = useState<string | null>(null)

  const showEditControls = editable && !presentationMode

  const getGridStyles = (widget: DashboardWidget): React.CSSProperties => ({
    gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
    gridRow: `${widget.position.y + 1} / span ${widget.position.h}`,
  })

  const handleMaximize = useCallback(
    (widgetId: string) => {
      setMaximizedWidgetId(widgetId)
      onWidgetMaximize?.(widgetId)
    },
    [onWidgetMaximize],
  )

  const maximizedWidget = maximizedWidgetId ? widgets.find((w) => w.id === maximizedWidgetId) : null

  const isCrossFiltered = useCallback(
    (widget: DashboardWidget) => {
      return crossFilterSource != null && crossFilterSource !== widget.id && widget.cross_filter_enabled
    },
    [crossFilterSource],
  )

  return (
    <div className={`dashboard-grid__container ${presentationMode ? 'dashboard-grid__container--presentation' : ''}`}>
      {/* Dashboard-level filter bar */}
      {filters && filters.length > 0 && !presentationMode && (
        <DashboardFilterBar
          filters={filters}
          filterState={filterState}
          onFilterChange={onFilterChange}
        />
      )}

      {/* Refresh indicator */}
      {showRefreshIndicator && lastRefreshedAt && (
        <RefreshIndicator
          lastRefreshedAt={lastRefreshedAt}
          live={widgets.some((w) => w.refresh_interval_ms && w.refresh_interval_ms > 0)}
        />
      )}

      {/* Grid */}
      <div
        className={`dashboard-grid ${presentationMode ? 'dashboard-grid--presentation' : ''}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {widgets.map((widget) => {
          const isLocked = widget.locked === true
          const isDivider = widget.type === 'divider'
          const crossFiltered = isCrossFiltered(widget)

          return (
            <div
              key={widget.id}
              className={[
                'dashboard-grid__widget',
                showEditControls && !isLocked ? 'dashboard-grid__widget--editable' : '',
                isLocked && showEditControls ? 'dashboard-grid__widget--locked' : '',
                isDivider ? 'dashboard-grid__widget--divider' : '',
                presentationMode ? 'dashboard-grid__widget--presentation' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={getGridStyles(widget)}
              onMouseEnter={() => setHoveredWidget(widget.id)}
              onMouseLeave={() => setHoveredWidget(null)}
            >
              {/* Widget header */}
              {widget.title && !isDivider && (
                <div className="dashboard-grid__widget-header">
                  {showEditControls && !isLocked && (
                    <GripVertical size={14} className="dashboard-grid__drag-handle" />
                  )}
                  {isLocked && showEditControls && (
                    <Lock size={12} className="dashboard-grid__lock-icon" />
                  )}
                  <span className="dashboard-grid__widget-title">{widget.title}</span>

                  {/* Cross-filter badge */}
                  {crossFiltered && (
                    <span className="dashboard-grid__cross-filter-badge" title="Affected by cross-filter">
                      <Filter size={10} />
                    </span>
                  )}

                  {/* Edit controls (hidden in presentation mode and on locked widgets during hover) */}
                  {showEditControls && hoveredWidget === widget.id && (
                    <div className="dashboard-grid__widget-actions">
                      <button title="Settings" onClick={() => onWidgetSettings?.(widget.id)}>
                        <Settings size={14} />
                      </button>
                      <button title="Maximize" onClick={() => handleMaximize(widget.id)}>
                        <Maximize2 size={14} />
                      </button>
                      {!isLocked && (
                        <button title="Remove" onClick={() => onWidgetRemove?.(widget.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Maximize button always available in non-edit mode */}
                  {!showEditControls && !presentationMode && hoveredWidget === widget.id && (
                    <div className="dashboard-grid__widget-actions">
                      <button title="Maximize" onClick={() => handleMaximize(widget.id)}>
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Widget body */}
              <div className={`dashboard-grid__widget-body ${isDivider ? 'dashboard-grid__widget-body--divider' : ''}`}>
                <WidgetContentRenderer widget={widget} />
              </div>
            </div>
          )
        })}

        {widgets.length === 0 && (
          <div className="dashboard-grid__empty">
            <p>No widgets added yet. Click &ldquo;Add Widget&rdquo; to get started.</p>
          </div>
        )}
      </div>

      {/* Maximized widget overlay */}
      {maximizedWidget && (
        <MaximizedOverlay
          widget={maximizedWidget}
          onClose={() => setMaximizedWidgetId(null)}
        />
      )}
    </div>
  )
}
