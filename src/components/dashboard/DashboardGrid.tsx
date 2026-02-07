import { useState, useMemo } from 'react'
import { GripVertical, Maximize2, Trash2, Settings } from 'lucide-react'
import type { DashboardWidget, MetricType, StatsQueryRequest, StatsDatapoint, AudienceExpression } from '@/api/types'
import { useChart } from '@/hooks/useCharts'
import { useStatsQuery } from '@/hooks/useQueries'
import ChartRenderer from '@/components/chart/ChartRenderer'
import './DashboardGrid.css'

interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

function WidgetChart({ widget }: { widget: DashboardWidget }) {
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
    return <div className="dashboard-grid__loading"><div className="dashboard-grid__spinner" /></div>
  }

  return (
    <ChartRenderer
      type={chart?.chart_type ?? widget.chart_type ?? 'bar'}
      data={chartData}
      series={series}
      height={widget.position.h * 80 - 60}
    />
  )
}

interface DashboardGridProps {
  widgets: DashboardWidget[]
  columns?: number
  editable?: boolean
  onWidgetUpdate?: (widget: DashboardWidget) => void
  onWidgetRemove?: (widgetId: string) => void
  baseAudience?: AudienceExpression
}

export default function DashboardGrid({
  widgets,
  columns = 12,
  editable = false,
  onWidgetRemove,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  baseAudience,
}: DashboardGridProps) {
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null)

  const getGridStyles = (widget: DashboardWidget): React.CSSProperties => ({
    gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
    gridRow: `${widget.position.y + 1} / span ${widget.position.h}`,
  })

  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'chart':
        return <WidgetChart widget={widget} />
      case 'stat':
        return (
          <div className="dashboard-grid__stat">
            <span className="dashboard-grid__stat-value">{widget.text_content ?? '--'}</span>
            <span className="dashboard-grid__stat-label">{widget.title || 'Statistic'}</span>
          </div>
        )
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
      default:
        return null
    }
  }

  return (
    <div
      className="dashboard-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {widgets.map((widget) => (
        <div
          key={widget.id}
          className={`dashboard-grid__widget ${editable ? 'dashboard-grid__widget--editable' : ''}`}
          style={getGridStyles(widget)}
          onMouseEnter={() => setHoveredWidget(widget.id)}
          onMouseLeave={() => setHoveredWidget(null)}
        >
          {widget.title && (
            <div className="dashboard-grid__widget-header">
              {editable && <GripVertical size={14} className="dashboard-grid__drag-handle" />}
              <span className="dashboard-grid__widget-title">{widget.title}</span>
              {editable && hoveredWidget === widget.id && (
                <div className="dashboard-grid__widget-actions">
                  <button title="Settings"><Settings size={14} /></button>
                  <button title="Expand"><Maximize2 size={14} /></button>
                  <button title="Remove" onClick={() => onWidgetRemove?.(widget.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="dashboard-grid__widget-body">
            {renderWidgetContent(widget)}
          </div>
        </div>
      ))}

      {widgets.length === 0 && (
        <div className="dashboard-grid__empty">
          <p>No widgets added yet. Click "Add Widget" to get started.</p>
        </div>
      )}
    </div>
  )
}
