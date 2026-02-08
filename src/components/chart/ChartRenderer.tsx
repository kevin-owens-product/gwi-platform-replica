import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, FunnelChart, Funnel, LabelList,
  RadialBarChart, RadialBar,
  ComposedChart, ReferenceLine, ReferenceArea,
} from 'recharts'
import { getChartColors, getHeatmapColor } from '@/utils/chart-colors'
import type { ChartType, ChartAnnotation } from '@/api/types'
import './ChartRenderer.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

interface ReferenceLineConfig {
  value: number
  label: string
  style: 'solid' | 'dashed' | 'dotted'
  color?: string
}

interface ChartRendererProps {
  type: ChartType
  data: ChartDataPoint[]
  series: string[]
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  showLabels?: boolean
  // --- new optional props ---
  annotations?: ChartAnnotation[]
  referenceLines?: ReferenceLineConfig[]
  showTrendLine?: boolean
  enableAnimation?: boolean
  enableKeyboardNav?: boolean
  accessibilityLabel?: string
  tooltipFormat?: 'compact' | 'detailed'
  comparisonData?: ChartDataPoint[]
  comparisonLabel?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STROKE_DASH: Record<string, string> = {
  solid: '0',
  dashed: '6 4',
  dotted: '2 2',
}

const TOOLTIP_STYLE_COMPACT = {
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  fontSize: 13,
}

const TOOLTIP_STYLE_DETAILED = {
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: 13,
  padding: '10px 14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

const MARGIN = { top: 20, right: 30, left: 20, bottom: 5 }

/** Simple linear regression for trend line */
function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return null
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
  for (const p of points) {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumXX += p.x * p.x
  }
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

/** Compute trend-line data points matching the original data indices. */
function computeTrendLine(data: ChartDataPoint[], seriesKey: string): ChartDataPoint[] {
  const points = data
    .map((d, i) => ({ x: i, y: typeof d[seriesKey] === 'number' ? (d[seriesKey] as number) : NaN }))
    .filter((p) => !isNaN(p.y))
  const reg = linearRegression(points)
  if (!reg) return []
  return data.map((d, i) => ({
    ...d,
    __trend: Math.round((reg.slope * i + reg.intercept) * 100) / 100,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DetailedTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-renderer__tooltip-detailed">
      <p className="chart-renderer__tooltip-label">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="chart-renderer__tooltip-row">
          <span
            className="chart-renderer__tooltip-swatch"
            style={{ backgroundColor: entry.color }}
          />
          <span className="chart-renderer__tooltip-name">{entry.name}:</span>
          <span className="chart-renderer__tooltip-value">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChartRenderer({
  type,
  data,
  series,
  height = 400,
  showLegend = true,
  showGrid = true,
  showLabels = false,
  annotations,
  referenceLines,
  showTrendLine = false,
  enableAnimation = true,
  enableKeyboardNav = false,
  accessibilityLabel,
  tooltipFormat = 'compact',
  comparisonData,
  comparisonLabel = 'Comparison',
}: ChartRendererProps) {
  const colors = getChartColors(Math.max(series.length, data.length))
  const containerRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const animate = enableAnimation && !prefersReducedMotion

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enableKeyboardNav) return
      const container = containerRef.current
      if (!container) return
      const focusable = container.querySelectorAll<HTMLElement>(
        '.recharts-bar-rectangle, .recharts-dot, .recharts-sector, [tabindex]'
      )
      const arr = Array.from(focusable)
      const currentIdx = arr.indexOf(document.activeElement as HTMLElement)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = arr[(currentIdx + 1) % arr.length]
        next?.focus()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = arr[(currentIdx - 1 + arr.length) % arr.length]
        prev?.focus()
      }
    },
    [enableKeyboardNav]
  )

  const tooltipStyle = tooltipFormat === 'detailed' ? TOOLTIP_STYLE_DETAILED : TOOLTIP_STYLE_COMPACT
  const tooltipContent =
    tooltipFormat === 'detailed' ? <DetailedTooltipContent /> : undefined

  // Merge comparison data into main data by matching on `name`
  const mergedData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return data
    return data.map((d) => {
      const match = comparisonData.find((c) => c.name === d.name)
      if (!match) return d
      const merged: ChartDataPoint = { ...d }
      for (const s of series) {
        if (match[s] !== undefined) {
          merged[`${comparisonLabel}_${s}`] = match[s]
        }
      }
      return merged
    })
  }, [data, comparisonData, comparisonLabel, series])

  // Trend line data
  const trendData = useMemo(() => {
    if (!showTrendLine || series.length === 0) return null
    return computeTrendLine(data, series[0])
  }, [showTrendLine, data, series])

  // Waterfall data (precomputed to avoid hooks inside render functions)
  const waterfallData = useMemo(() => {
    if (type !== 'waterfall' || series.length === 0) return []
    let cumulative = 0
    return data.map((d) => {
      const val = typeof d[series[0]] === 'number' ? (d[series[0]] as number) : 0
      const offset = cumulative
      cumulative += val
      return {
        name: d.name,
        offset: val >= 0 ? offset : offset + val,
        value: Math.abs(val),
        rawValue: val,
        total: cumulative,
      }
    })
  }, [type, data, series])

  // ------ helper to render reference lines inside a Cartesian chart ------
  const renderReferenceLines = () => {
    if (!referenceLines?.length) return null
    return referenceLines.map((rl, i) => (
      <ReferenceLine
        key={`ref-${i}`}
        y={rl.value}
        label={{ value: rl.label, position: 'right', fontSize: 11 }}
        stroke={rl.color || '#6b7280'}
        strokeDasharray={STROKE_DASH[rl.style] || '0'}
        strokeWidth={1.5}
      />
    ))
  }

  // ------ helper to render annotations as ReferenceArea / labels ------
  const renderAnnotations = () => {
    if (!annotations?.length) return null
    return annotations.map((ann) => {
      if (ann.type === 'highlight_region') {
        const x1 = ann.anchor.x_value
        const x2 = ann.anchor.x_value // single-point region fallback
        return (
          <ReferenceArea
            key={ann.id}
            x1={x1}
            x2={x2}
            fill={ann.style?.background || 'rgba(255,0,119,0.08)'}
            label={{ value: ann.content, fontSize: ann.style?.font_size || 11, fill: ann.style?.color || '#333' }}
          />
        )
      }
      if (ann.type === 'reference_marker' || ann.type === 'text' || ann.type === 'callout') {
        return (
          <ReferenceLine
            key={ann.id}
            y={ann.anchor.y_value}
            label={{
              value: ann.content,
              position: ann.anchor.position === 'left' ? 'insideLeft' : 'right',
              fontSize: ann.style?.font_size || 11,
              fill: ann.style?.color || '#6b7280',
            }}
            stroke={ann.style?.color || '#d1d5db'}
            strokeDasharray="4 3"
          />
        )
      }
      return null
    })
  }

  // ------ Screen-reader accessible data table ------
  const srDataTable = (
    <table className="sr-only">
      <caption>{accessibilityLabel || `${type} chart data`}</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          {series.map((s) => (
            <th key={s} scope="col">{s}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i}>
            <td>{d.name}</td>
            {series.map((s) => (
              <td key={s}>{d[s]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------
  if (data.length === 0) {
    return (
      <div className="chart-renderer__empty" role="img" aria-label="No chart data available">
        <p>No data to display</p>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Chart renderers
  // -----------------------------------------------------------------------

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={mergedData} margin={MARGIN}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
        {showLegend && <Legend />}
        {renderReferenceLines()}
        {renderAnnotations()}
        {series.map((s, i) => (
          <Bar key={s} dataKey={s} fill={colors[i]} radius={[4, 4, 0, 0]} isAnimationActive={animate}>
            {showLabels && <LabelList dataKey={s} position="top" fontSize={11} />}
          </Bar>
        ))}
        {comparisonData && series.map((s, i) => (
          <Bar
            key={`${comparisonLabel}_${s}`}
            dataKey={`${comparisonLabel}_${s}`}
            fill={colors[i]}
            fillOpacity={0.35}
            radius={[4, 4, 0, 0]}
            isAnimationActive={animate}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderStackedBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={mergedData} margin={MARGIN}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
        {showLegend && <Legend />}
        {renderReferenceLines()}
        {renderAnnotations()}
        {series.map((s, i) => (
          <Bar key={s} dataKey={s} stackId="stack" fill={colors[i]} isAnimationActive={animate}>
            {showLabels && <LabelList dataKey={s} position="center" fontSize={10} fill="#fff" />}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderGroupedBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={mergedData} margin={MARGIN}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
        {showLegend && <Legend />}
        {renderReferenceLines()}
        {renderAnnotations()}
        {series.map((s, i) => (
          <Bar key={s} dataKey={s} fill={colors[i]} radius={[4, 4, 0, 0]} isAnimationActive={animate}>
            {showLabels && <LabelList dataKey={s} position="top" fontSize={11} />}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderHorizontalBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={mergedData} layout="vertical" margin={MARGIN}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />}
        <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} width={100} />
        <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
        {showLegend && <Legend />}
        {series.map((s, i) => (
          <Bar key={s} dataKey={s} fill={colors[i]} radius={[0, 4, 4, 0]} isAnimationActive={animate}>
            {showLabels && <LabelList dataKey={s} position="right" fontSize={11} />}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderLineChart = () => {
    const chartData = trendData || mergedData
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={MARGIN}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis dataKey="name" fontSize={12} tickLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
          {showLegend && <Legend />}
          {renderReferenceLines()}
          {renderAnnotations()}
          {series.map((s, i) => (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              stroke={colors[i]}
              strokeWidth={2}
              dot={{ fill: colors[i], r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={animate}
            />
          ))}
          {showTrendLine && trendData && (
            <Line
              type="monotone"
              dataKey="__trend"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              name="Trend"
              isAnimationActive={animate}
            />
          )}
          {comparisonData && series.map((s, i) => (
            <Line
              key={`${comparisonLabel}_${s}`}
              type="monotone"
              dataKey={`${comparisonLabel}_${s}`}
              stroke={colors[i]}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              name={`${comparisonLabel} ${s}`}
              isAnimationActive={animate}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={mergedData} margin={MARGIN}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
        {showLegend && <Legend />}
        {renderReferenceLines()}
        {renderAnnotations()}
        {series.map((s, i) => (
          <Area
            key={s}
            type="monotone"
            dataKey={s}
            stroke={colors[i]}
            fill={colors[i]}
            fillOpacity={0.2}
            strokeWidth={2}
            isAnimationActive={animate}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )

  const renderStackedAreaChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={mergedData} margin={MARGIN}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
        {showLegend && <Legend />}
        {renderReferenceLines()}
        {renderAnnotations()}
        {series.map((s, i) => (
          <Area
            key={s}
            type="monotone"
            dataKey={s}
            stackId="stack"
            stroke={colors[i]}
            fill={colors[i]}
            fillOpacity={0.5}
            strokeWidth={1.5}
            isAnimationActive={animate}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )

  const renderPieChart = (isDonut = false) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={height / 3}
          innerRadius={isDonut ? height / 5 : 0}
          dataKey={series[0] || 'value'}
          nameKey="name"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={true}
          isAnimationActive={animate}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )

  const renderScatterChart = () => {
    const chartData = trendData || data
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={MARGIN}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis dataKey={series[0]} fontSize={12} name={series[0]} />
          <YAxis dataKey={series[1]} fontSize={12} name={series[1]} />
          <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
          {renderReferenceLines()}
          <Scatter data={chartData} fill={colors[0]} isAnimationActive={animate} />
          {showTrendLine && trendData && (
            <Scatter data={trendData} fill="none" line={{ stroke: '#9ca3af', strokeDasharray: '6 3', strokeWidth: 1.5 }} />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  const renderTable = () => {
    if (data.length === 0) return <div className="chart-renderer__empty"><p>No data to display</p></div>
    return (
      <div className="chart-renderer__data-table-wrapper" style={{ maxHeight: height, overflow: 'auto' }}>
        <table className="chart-renderer__data-table" role="table">
          <thead>
            <tr>
              <th scope="col" className="chart-renderer__th">Name</th>
              {series.map((s) => (
                <th key={s} scope="col" className="chart-renderer__th">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'chart-renderer__tr-even' : 'chart-renderer__tr-odd'}>
                <td className="chart-renderer__td chart-renderer__td-name">{row.name}</td>
                {series.map((s) => (
                  <td key={s} className="chart-renderer__td">
                    {typeof row[s] === 'number' ? (row[s] as number).toLocaleString() : row[s]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderComboChart = () => {
    // First half of series rendered as bars, second half as lines.
    // If only one series, it renders as a bar.
    const mid = Math.max(1, Math.ceil(series.length / 2))
    const barSeries = series.slice(0, mid)
    const lineSeries = series.slice(mid)
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={mergedData} margin={MARGIN}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis dataKey="name" fontSize={12} tickLine={false} />
          <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} />
          {lineSeries.length > 0 && (
            <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
          )}
          <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
          {showLegend && <Legend />}
          {renderReferenceLines()}
          {renderAnnotations()}
          {barSeries.map((s, i) => (
            <Bar key={s} yAxisId="left" dataKey={s} fill={colors[i]} radius={[4, 4, 0, 0]} isAnimationActive={animate}>
              {showLabels && <LabelList dataKey={s} position="top" fontSize={11} />}
            </Bar>
          ))}
          {lineSeries.map((s, i) => (
            <Line
              key={s}
              yAxisId="right"
              type="monotone"
              dataKey={s}
              stroke={colors[mid + i]}
              strokeWidth={2}
              dot={{ fill: colors[mid + i], r: 4 }}
              isAnimationActive={animate}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  const renderWaterfallChart = () => {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={waterfallData} margin={MARGIN}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis dataKey="name" fontSize={12} tickLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(_: any, __: any, props: any) => {
              const raw = props.payload?.rawValue
              return [typeof raw === 'number' ? raw.toLocaleString() : raw, series[0]]
            }}
          />
          {showLegend && <Legend />}
          {renderReferenceLines()}
          {/* Invisible offset bar */}
          <Bar dataKey="offset" stackId="waterfall" fill="transparent" isAnimationActive={false} />
          {/* Visible value bar */}
          <Bar dataKey="value" stackId="waterfall" isAnimationActive={animate} name={series[0]}>
            {waterfallData.map((entry, index) => (
              <Cell key={index} fill={entry.rawValue >= 0 ? '#00b37a' : '#f43f5e'} />
            ))}
            {showLabels && <LabelList dataKey="rawValue" position="top" fontSize={11} />}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderFunnelChart = () => {
    // Funnel expects data with `name` and `value` fields
    const funnelData = data.map((d, i) => ({
      name: d.name,
      value: typeof d[series[0]] === 'number' ? (d[series[0]] as number) : 0,
      fill: colors[i],
    }))
    return (
      <ResponsiveContainer width="100%" height={height}>
        <FunnelChart>
          <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
          <Funnel
            dataKey="value"
            data={funnelData}
            isAnimationActive={animate}
          >
            <LabelList position="right" fill="#333" fontSize={12} dataKey="name" />
            <LabelList position="center" fill="#fff" fontSize={12} dataKey="value" />
          </Funnel>
          {showLegend && <Legend />}
        </FunnelChart>
      </ResponsiveContainer>
    )
  }

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="name" fontSize={12} />
        <PolarRadiusAxis fontSize={10} />
        <Tooltip contentStyle={tooltipStyle} content={tooltipContent} />
        {showLegend && <Legend />}
        {series.map((s, i) => (
          <Radar
            key={s}
            name={s}
            dataKey={s}
            stroke={colors[i]}
            fill={colors[i]}
            fillOpacity={0.25}
            isAnimationActive={animate}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  )

  const renderTreemap = () => {
    const treemapData = data.map((d, i) => ({
      name: d.name,
      size: typeof d[series[0]] === 'number' ? (d[series[0]] as number) : 0,
      fill: colors[i],
    }))
    return (
      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={treemapData}
          dataKey="size"
          nameKey="name"
          stroke="#fff"
          isAnimationActive={animate}
          content={({ x, y, width, height: h, name, fill }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any) => {
            const w = width as number
            const cellH = h as number
            if (w < 30 || cellH < 20) return <g />
            return (
              <g>
                <rect x={x} y={y} width={w} height={cellH} fill={fill} stroke="#fff" strokeWidth={2} rx={3} />
                {w > 50 && cellH > 30 && (
                  <text
                    x={(x as number) + w / 2}
                    y={(y as number) + cellH / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fill="#fff"
                    fontWeight={600}
                  >
                    {name}
                  </text>
                )}
              </g>
            )
          }}
        />
      </ResponsiveContainer>
    )
  }

  const renderBulletChart = () => {
    // Bullet chart: layered bars with target reference lines.
    // Each data point is a separate bullet row rendered in a horizontal BarChart.
    // We assume series[0] = actual value, series[1] = target (optional).
    const actualKey = series[0] || 'value'
    const targetKey = series[1]
    // Determine max value for domain
    const allValues = data.map((d) => {
      const vals = [typeof d[actualKey] === 'number' ? (d[actualKey] as number) : 0]
      if (targetKey && typeof d[targetKey] === 'number') vals.push(d[targetKey] as number)
      return Math.max(...vals)
    })
    const maxVal = Math.max(...allValues, 1)
    // Build qualitative ranges as background bars
    const bulletData = data.map((d) => ({
      name: d.name,
      actual: typeof d[actualKey] === 'number' ? (d[actualKey] as number) : 0,
      target: targetKey && typeof d[targetKey] === 'number' ? (d[targetKey] as number) : undefined,
      range3: maxVal,
      range2: maxVal * 0.75,
      range1: maxVal * 0.5,
    }))

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={bulletData} layout="vertical" margin={{ ...MARGIN, left: 80 }}>
          <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} domain={[0, maxVal * 1.1]} />
          <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} width={80} />
          <Tooltip contentStyle={tooltipStyle} />
          {/* Qualitative range bars (background) */}
          <Bar dataKey="range3" fill="#e5e7eb" barSize={32} isAnimationActive={false} name="Range (high)" />
          <Bar dataKey="range2" fill="#d1d5db" barSize={32} isAnimationActive={false} name="Range (mid)" />
          <Bar dataKey="range1" fill="#9ca3af" barSize={32} isAnimationActive={false} name="Range (low)" />
          {/* Actual bar */}
          <Bar dataKey="actual" fill={colors[0]} barSize={14} isAnimationActive={animate} name={actualKey} />
          {/* Target reference lines */}
          {bulletData.map((d, i) =>
            d.target !== undefined ? (
              <ReferenceLine key={i} x={d.target} stroke="#1f2937" strokeWidth={2.5} />
            ) : null
          )}
          {showLegend && <Legend />}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderHeatmap = () => {
    // Custom grid-based heatmap.
    // Rows = data items (name), Columns = series keys, Cell = value.
    const allValues = data.flatMap((d) => series.map((s) => (typeof d[s] === 'number' ? (d[s] as number) : 0)))
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const cellW = Math.max(60, Math.floor(700 / series.length))
    const cellH = 36
    const labelColW = 120

    return (
      <div className="chart-renderer__heatmap-wrapper" style={{ maxHeight: height, overflow: 'auto' }} role="table" aria-label={accessibilityLabel || 'Heatmap'}>
        <div className="chart-renderer__heatmap">
          {/* Header row */}
          <div className="chart-renderer__heatmap-row chart-renderer__heatmap-header">
            <div className="chart-renderer__heatmap-label" style={{ width: labelColW, minWidth: labelColW }} />
            {series.map((s) => (
              <div
                key={s}
                className="chart-renderer__heatmap-col-header"
                style={{ width: cellW, minWidth: cellW }}
              >
                {s}
              </div>
            ))}
          </div>
          {/* Data rows */}
          {data.map((d, ri) => (
            <div key={ri} className="chart-renderer__heatmap-row">
              <div className="chart-renderer__heatmap-label" style={{ width: labelColW, minWidth: labelColW }}>
                {d.name}
              </div>
              {series.map((s) => {
                const v = typeof d[s] === 'number' ? (d[s] as number) : 0
                return (
                  <div
                    key={s}
                    className="chart-renderer__heatmap-cell"
                    style={{
                      width: cellW,
                      minWidth: cellW,
                      height: cellH,
                      backgroundColor: getHeatmapColor(v, minVal, maxVal),
                    }}
                    title={`${d.name} / ${s}: ${v}`}
                  >
                    {v.toLocaleString()}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderGaugeChart = () => {
    // Gauge using RadialBarChart.
    // Uses first data point's first series value as the gauge value.
    const value = typeof data[0]?.[series[0]] === 'number' ? (data[0][series[0]] as number) : 0
    const maxValue = 100 // default 0-100 scale
    const gaugeData = [{ name: series[0] || 'Value', value, fill: colors[0] }]

    return (
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          startAngle={180}
          endAngle={0}
          barSize={20}
          data={gaugeData}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            isAnimationActive={animate}
          />
          <Tooltip contentStyle={tooltipStyle} />
          {showLegend && <Legend />}
          {/* Center label */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={28}
            fontWeight={700}
            fill="#1f2937"
          >
            {value}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#6b7280"
          >
            / {maxValue}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    )
  }

  const renderSankeyPlaceholder = () => (
    <div className="chart-renderer__placeholder" style={{ height }}>
      <div className="chart-renderer__placeholder-inner">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="2" y="8" width="12" height="14" rx="2" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
          <rect x="2" y="26" width="12" height="14" rx="2" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
          <rect x="34" y="6" width="12" height="10" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
          <rect x="34" y="20" width="12" height="10" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
          <rect x="34" y="34" width="12" height="8" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
          <path d="M14 14 C24 14, 24 11, 34 11" stroke="#a5b4fc" strokeWidth="2" fill="none" />
          <path d="M14 18 C24 18, 24 25, 34 25" stroke="#a5b4fc" strokeWidth="2" fill="none" />
          <path d="M14 32 C24 32, 24 38, 34 38" stroke="#93c5fd" strokeWidth="2" fill="none" />
        </svg>
        <p className="chart-renderer__placeholder-title">Sankey Diagram</p>
        <p className="chart-renderer__placeholder-text">
          Sankey diagrams require the <code>d3-sankey</code> library.
          Install it and integrate with the chart system to visualise flows between nodes.
        </p>
      </div>
    </div>
  )

  const renderGeoMapPlaceholder = () => (
    <div className="chart-renderer__placeholder" style={{ height }}>
      <div className="chart-renderer__placeholder-inner">
        <svg width="56" height="40" viewBox="0 0 56 40" fill="none" aria-hidden="true">
          <ellipse cx="28" cy="20" rx="26" ry="18" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
          <path d="M16 10 L22 8 L26 14 L20 18 L14 16 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="1" />
          <path d="M30 12 L38 10 L40 18 L34 22 L28 18 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="1" />
          <path d="M20 24 L28 22 L32 28 L24 32 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="1" />
        </svg>
        <p className="chart-renderer__placeholder-title">Geographic Map</p>
        <p className="chart-renderer__placeholder-text">
          Geographic maps require <code>react-simple-maps</code>.
          Install it and configure map projections and data bindings to render choropleth or point maps.
        </p>
      </div>
    </div>
  )

  // -----------------------------------------------------------------------
  // Chart type switch
  // -----------------------------------------------------------------------

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart()
      case 'stacked_bar':
        return renderStackedBarChart()
      case 'grouped_bar':
        return renderGroupedBarChart()
      case 'horizontal_bar':
        return renderHorizontalBarChart()
      case 'line':
        return renderLineChart()
      case 'area':
        return renderAreaChart()
      case 'stacked_area':
        return renderStackedAreaChart()
      case 'pie':
        return renderPieChart(false)
      case 'donut':
        return renderPieChart(true)
      case 'scatter':
        return renderScatterChart()
      case 'table':
        return renderTable()
      case 'combo':
        return renderComboChart()
      case 'waterfall':
        return renderWaterfallChart()
      case 'funnel':
        return renderFunnelChart()
      case 'radar':
        return renderRadarChart()
      case 'treemap':
        return renderTreemap()
      case 'bullet':
        return renderBulletChart()
      case 'heatmap':
        return renderHeatmap()
      case 'gauge':
        return renderGaugeChart()
      case 'sankey':
        return renderSankeyPlaceholder()
      case 'geo_map':
        return renderGeoMapPlaceholder()
      default:
        return renderBarChart()
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className="chart-renderer"
      role="img"
      aria-label={accessibilityLabel || `${type} chart`}
      tabIndex={enableKeyboardNav ? 0 : undefined}
      onKeyDown={enableKeyboardNav ? handleKeyDown : undefined}
    >
      {renderChart()}
      {/* Screen-reader only data table for accessibility */}
      {srDataTable}
    </div>
  )
}
