import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Send,
  Sparkles,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  BarChart2,
  BarChart3,
  Table,
  Table2,
  X,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Bell,
  FileText,
  Users,
  Grid3X3,
  LayoutDashboard,
  Download,
  Eye,
  EyeOff,
  Shield,
  ChevronUp,
  Link2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ChartRenderer from '@/components/chart/ChartRenderer'
import { useSparkChat } from '@/hooks/useSpark'
import type {
  SparkMessage,
  SparkAction,
  SparkContext,
  SparkVisualization,
  SparkDataTable,
  SparkInsight,
  ChartType,
} from '@/api/types'
import './SparkChat.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'stacked_bar', label: 'Stacked Bar' },
  { value: 'line', label: 'Line' },
  { value: 'pie', label: 'Pie' },
  { value: 'donut', label: 'Donut' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'horizontal_bar', label: 'Horizontal Bar' },
  { value: 'area', label: 'Area' },
  { value: 'table', label: 'Table' },
]

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create_chart: <BarChart2 size={14} />,
  create_audience: <Users size={14} />,
  show_data: <Table size={14} />,
  navigate: <Eye size={14} />,
  create_crosstab: <Grid3X3 size={14} />,
  create_dashboard: <LayoutDashboard size={14} />,
  export_report: <Download size={14} />,
  compare_audiences: <Users size={14} />,
  analyze_overlap: <TrendingUp size={14} />,
}

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  anomaly: <AlertTriangle size={16} />,
  trend: <TrendingUp size={16} />,
  opportunity: <Lightbulb size={16} />,
  alert: <Bell size={16} />,
  recommendation: <Sparkles size={16} />,
}

const CONTEXT_LABELS: Record<string, string> = {
  audience_id: 'Audience',
  chart_id: 'Chart',
  crosstab_id: 'Crosstab',
  dashboard_id: 'Dashboard',
  report_id: 'Report',
  canvas_id: 'Canvas',
  tv_study_id: 'TV Study',
  print_rf_id: 'Print R&F',
}

function formatCellValue(
  value: unknown,
  format?: 'number' | 'percent' | 'currency' | 'text' | 'index'
): string {
  if (value == null) return '-'
  switch (format) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value)
    case 'percent':
      return typeof value === 'number' ? `${value.toFixed(1)}%` : String(value)
    case 'currency':
      return typeof value === 'number'
        ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : String(value)
    case 'index':
      return typeof value === 'number' ? value.toFixed(0) : String(value)
    default:
      return String(value)
  }
}

function confidenceColor(level?: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'var(--color-success, #16a34a)'
    case 'medium':
      return 'var(--color-warning, #ca8a04)'
    case 'low':
      return 'var(--color-error, #dc2626)'
    default:
      return 'var(--color-text-muted, #9ca3af)'
  }
}

function confidenceLabel(level?: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'High confidence'
    case 'medium':
      return 'Medium confidence'
    case 'low':
      return 'Low confidence'
    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Streaming typewriter text reveal */
function StreamingText({
  content,
  isNew,
  onComplete,
}: {
  content: string
  isNew: boolean
  onComplete?: () => void
}) {
  const [displayed, setDisplayed] = useState(isNew ? '' : content)
  const [done, setDone] = useState(!isNew)

  useEffect(() => {
    if (!isNew) {
      setDisplayed(content)
      setDone(true)
      return
    }
    let i = 0
    setDisplayed('')
    setDone(false)

    const interval = setInterval(() => {
      i += 1
      if (i >= content.length) {
        setDisplayed(content)
        setDone(true)
        clearInterval(interval)
        onComplete?.()
      } else {
        // Reveal 2-4 chars at a time for a fast but visible effect
        const step = Math.min(i, content.length)
        setDisplayed(content.slice(0, step))
      }
    }, 12)

    return () => clearInterval(interval)
  }, [content, isNew, onComplete])

  return (
    <span>
      {displayed}
      {!done && <span className="spark-chat__cursor" />}
    </span>
  )
}

/** Inline chart visualization with "Try as..." dropdown */
function InlineVisualization({ viz }: { viz: SparkVisualization }) {
  const [chartType, setChartType] = useState<ChartType>(viz.chart_type)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const chartData = useMemo(
    () =>
      viz.data.map((d) => {
        const point: { name: string; [key: string]: string | number } = {
          name: String(d.name ?? ''),
        }
        for (const [k, v] of Object.entries(d)) {
          point[k] = v as string | number
        }
        return point
      }),
    [viz.data]
  )

  return (
    <div className="spark-chat__chart-preview">
      <div className="spark-chat__chart-preview-header">
        <div>
          {viz.title && (
            <div className="spark-chat__chart-preview-title">{viz.title}</div>
          )}
          {viz.subtitle && (
            <div className="spark-chat__chart-preview-subtitle">
              {viz.subtitle}
            </div>
          )}
        </div>
        <div className="spark-chat__chart-type-switcher">
          <button
            className="spark-chat__chart-type-btn"
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <BarChart2 size={14} />
            Try as...
            <ChevronDown size={12} />
          </button>
          {dropdownOpen && (
            <div className="spark-chat__chart-type-dropdown">
              {CHART_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`spark-chat__chart-type-option ${chartType === opt.value ? 'spark-chat__chart-type-option--active' : ''}`}
                  onClick={() => {
                    setChartType(opt.value)
                    setDropdownOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="spark-chat__chart-preview-body spark-chat__chart-preview-body--rendered">
        <ChartRenderer
          type={chartType}
          data={chartData}
          series={viz.series}
          height={240}
          showLegend
          showGrid
        />
      </div>
    </div>
  )
}

/** Inline sortable data table */
function InlineDataTable({ table }: { table: SparkDataTable }) {
  const [sortKey, setSortKey] = useState<string | undefined>(table.sort_by)
  const [sortAsc, setSortAsc] = useState(true)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc((a) => !a)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return table.rows
    return [...table.rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortAsc ? av - bv : bv - av
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [table.rows, sortKey, sortAsc])

  const formatForCol = (key: string) =>
    table.columns.find((c) => c.key === key)?.format

  return (
    <div className="spark-chat__data-table-wrapper">
      <div className="spark-chat__data-table-scroll">
        <table className="spark-chat__data-table">
          <thead>
            <tr>
              {table.columns.map((col) => (
                <th
                  key={col.key}
                  className={`spark-chat__data-table-th ${table.highlight_column === col.key ? 'spark-chat__data-table-th--highlight' : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  <span>{col.label}</span>
                  {sortKey === col.key && (
                    <span className="spark-chat__data-table-sort-icon">
                      {sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, ri) => (
              <tr key={ri}>
                {table.columns.map((col) => (
                  <td
                    key={col.key}
                    className={`spark-chat__data-table-td ${table.highlight_column === col.key ? 'spark-chat__data-table-td--highlight' : ''}`}
                  >
                    {formatCellValue(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
            {table.summary_row && (
              <tr className="spark-chat__data-table-summary">
                {table.columns.map((col) => (
                  <td key={col.key} className="spark-chat__data-table-td spark-chat__data-table-td--summary">
                    {formatCellValue(table.summary_row![col.key], formatForCol(col.key))}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Expandable citation panel with provenance info */
function CitationPanel({ citations }: { citations: NonNullable<SparkMessage['citations']> }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="spark-chat__citations-panel">
      {citations.map((citation, i) => (
        <div key={i} className="spark-chat__citation-item">
          <div
            className="spark-chat__citation-header"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <span className="spark-chat__citation-number">[{i + 1}]</span>
            <span className="spark-chat__citation-text">{citation.text}</span>
            {citation.confidence_level && (
              <span
                className="spark-chat__citation-confidence-dot"
                style={{ background: confidenceColor(citation.confidence_level) }}
                title={confidenceLabel(citation.confidence_level)}
              />
            )}
            {(citation.dataset_id || citation.wave_id || citation.sample_size || citation.methodology_note) && (
              <button className="spark-chat__citation-expand-btn">
                {expanded === i ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
          </div>

          {expanded === i && (
            <div className="spark-chat__citation-details">
              {citation.dataset_id && (
                <div className="spark-chat__citation-detail">
                  <span className="spark-chat__citation-detail-label">Dataset:</span>
                  <span className="spark-chat__citation-detail-value">{citation.dataset_id}</span>
                </div>
              )}
              {citation.wave_id && (
                <div className="spark-chat__citation-detail">
                  <span className="spark-chat__citation-detail-label">Wave:</span>
                  <span className="spark-chat__citation-detail-value">{citation.wave_id}</span>
                </div>
              )}
              {citation.sample_size != null && (
                <div className="spark-chat__citation-detail">
                  <span className="spark-chat__citation-detail-label">Sample size:</span>
                  <span className="spark-chat__citation-detail-value">
                    n={citation.sample_size.toLocaleString()}
                  </span>
                </div>
              )}
              {citation.confidence_level && (
                <div className="spark-chat__citation-detail">
                  <span className="spark-chat__citation-detail-label">Confidence:</span>
                  <span
                    className="spark-chat__citation-confidence-badge"
                    style={{
                      color: confidenceColor(citation.confidence_level),
                      borderColor: confidenceColor(citation.confidence_level),
                    }}
                  >
                    <Shield size={10} />
                    {confidenceLabel(citation.confidence_level)}
                  </span>
                </div>
              )}
              {citation.methodology_note && (
                <div className="spark-chat__citation-detail">
                  <span className="spark-chat__citation-detail-label">Methodology:</span>
                  <span className="spark-chat__citation-detail-value spark-chat__citation-detail-value--note">
                    {citation.methodology_note}
                  </span>
                </div>
              )}
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spark-chat__citation-link"
                >
                  View source
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** Collapsible section used for TL;DR and Thinking Steps */
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`spark-chat__collapsible ${open ? 'spark-chat__collapsible--open' : ''}`}>
      <button
        className="spark-chat__collapsible-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span>{title}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="spark-chat__collapsible-body">{children}</div>}
    </div>
  )
}

/** Proactive insight card */
function InsightCard({
  insight,
  onDismiss,
  onAction,
}: {
  insight: SparkInsight
  onDismiss: (id: string) => void
  onAction?: (action: SparkInsight['suggested_action']) => void
}) {
  return (
    <div
      className={`spark-chat__insight-card spark-chat__insight-card--${insight.severity}`}
    >
      <div className="spark-chat__insight-card-header">
        <span className="spark-chat__insight-card-icon">
          {INSIGHT_ICONS[insight.type] || <Lightbulb size={16} />}
        </span>
        <span className="spark-chat__insight-card-title">{insight.title}</span>
        <button
          className="spark-chat__insight-card-dismiss"
          onClick={() => onDismiss(insight.id)}
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
      <div className="spark-chat__insight-card-body">{insight.description}</div>
      {insight.change_pct != null && (
        <div className="spark-chat__insight-card-metric">
          <TrendingUp size={12} />
          <span>
            {insight.change_pct > 0 ? '+' : ''}
            {insight.change_pct.toFixed(1)}%
          </span>
          {insight.metric_name && (
            <span className="spark-chat__insight-card-metric-name">
              {insight.metric_name}
            </span>
          )}
        </div>
      )}
      {insight.suggested_action && (
        <button
          className="spark-chat__insight-card-action"
          onClick={() => onAction?.(insight.suggested_action)}
        >
          {ACTION_ICONS[insight.suggested_action.type]}
          {insight.suggested_action.label}
        </button>
      )}
    </div>
  )
}

/** Context indicator bar */
function ContextBar({
  context,
  onRemoveKey,
}: {
  context: SparkContext
  onRemoveKey: (key: string) => void
}) {
  const entries = useMemo(() => {
    const items: { key: string; label: string; value: string }[] = []
    for (const [key, value] of Object.entries(context)) {
      if (value && CONTEXT_LABELS[key]) {
        items.push({
          key,
          label: CONTEXT_LABELS[key],
          value: typeof value === 'string' ? value : JSON.stringify(value),
        })
      }
    }
    return items
  }, [context])

  if (entries.length === 0) return null

  return (
    <div className="spark-chat__context-bar">
      <span className="spark-chat__context-bar-label">Context:</span>
      {entries.map((entry) => (
        <span key={entry.key} className="spark-chat__context-chip">
          {entry.label}
          <button
            className="spark-chat__context-chip-remove"
            onClick={() => onRemoveKey(entry.key)}
            title={`Remove ${entry.label}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  )
}

/** Confidence badge shown next to assistant messages */
function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  return (
    <span
      className={`spark-chat__confidence-badge spark-chat__confidence-badge--${level}`}
      style={{ borderColor: confidenceColor(level), color: confidenceColor(level) }}
    >
      <Shield size={10} />
      {level}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SparkChatProps {
  conversationId?: string
  initialMessages?: SparkMessage[]
  initialInput?: string
  autoSend?: boolean
  context?: SparkContext
  compact?: boolean
  insights?: SparkInsight[]
  onDismissInsight?: (id: string) => void
  showInsights?: boolean
  onConversationCreated?: (id: string) => void
  onAction?: (action: SparkAction) => void
  onMessageSent?: (message: string) => void
  agentName?: string
  agentDescription?: string
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SparkChat({
  conversationId,
  initialMessages = [],
  initialInput,
  autoSend = false,
  context: initialContext,
  compact = false,
  insights = [],
  onDismissInsight,
  showInsights = false,
  onConversationCreated,
  onAction,
  onMessageSent,
  agentName,
  agentDescription,
}: SparkChatProps) {
  const [messages, setMessages] = useState<SparkMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [activeConversation, setActiveConversation] = useState(conversationId)
  const [context, setContext] = useState<SparkContext | undefined>(initialContext)
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set())
  const [insightsPanelOpen, setInsightsPanelOpen] = useState(showInsights)
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set())

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sparkChat = useSparkChat()

  // Keep context in sync with prop changes
  useEffect(() => {
    setContext(initialContext)
  }, [initialContext])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-send: fire the initial prompt immediately on mount
  const didAutoSend = useRef(false)
  useEffect(() => {
    if (autoSend && initialInput?.trim() && !didAutoSend.current) {
      didAutoSend.current = true
      const text = initialInput.trim()
      const userMessage: SparkMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      onMessageSent?.(text)
      sparkChat.mutate(
        { message: text, conversation_id: activeConversation, context },
        {
          onSuccess: (response) => {
            setActiveConversation(response.conversation_id)
            setMessages((prev) => [...prev, response.message])
            if (!activeConversation) {
              onConversationCreated?.(response.conversation_id)
            }
          },
          onError: () => {
            setMessages((prev) => [
              ...prev,
              {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                created_at: new Date().toISOString(),
              },
            ])
          },
        }
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync input when initialInput changes externally (non-autoSend case)
  useEffect(() => {
    if (!autoSend && initialInput != null) {
      setInput(initialInput)
      // Auto-resize textarea to fit the new content
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
      }
    }
  }, [initialInput, autoSend])

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  const handleSend = useCallback(() => {
    if (!input.trim() || sparkChat.isPending) return

    const text = input.trim()
    const userMessage: SparkMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    onMessageSent?.(text)

    sparkChat.mutate(
      {
        message: text,
        conversation_id: activeConversation,
        context,
      },
      {
        onSuccess: (response) => {
          setActiveConversation(response.conversation_id)
          setNewMessageIds((prev) => new Set(prev).add(response.message.id))
          setMessages((prev) => [...prev, response.message])
          if (!activeConversation) {
            onConversationCreated?.(response.conversation_id)
          }
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please try again.',
              created_at: new Date().toISOString(),
            },
          ])
        },
      }
    )
  }, [input, sparkChat, activeConversation, context, onMessageSent, onConversationCreated])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleFollowUp = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const handleRemoveContextKey = (key: string) => {
    setContext((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      delete (next as Record<string, unknown>)[key]
      return next
    })
  }

  const handleDismissInsight = (id: string) => {
    setDismissedInsights((prev) => new Set(prev).add(id))
    onDismissInsight?.(id)
  }

  const handleStreamingComplete = useCallback((msgId: string) => {
    setNewMessageIds((prev) => {
      const next = new Set(prev)
      next.delete(msgId)
      return next
    })
  }, [])

  const visibleInsights = useMemo(
    () => insights.filter((ins) => !ins.dismissed && !dismissedInsights.has(ins.id)),
    [insights, dismissedInsights]
  )

  const contextLabel = context?.chart_id
    ? { icon: BarChart3, type: 'Chart', id: context.chart_id }
    : context?.crosstab_id
      ? { icon: Table2, type: 'Crosstab', id: context.crosstab_id }
      : context?.dashboard_id
        ? { icon: LayoutDashboard, type: 'Dashboard', id: context.dashboard_id }
        : context?.audience_id
          ? { icon: Users, type: 'Audience', id: context.audience_id }
          : null

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={`spark-chat ${compact ? 'spark-chat--compact' : ''} ${insightsPanelOpen && visibleInsights.length > 0 ? 'spark-chat--with-insights' : ''}`}>
      {/* Context Banner */}
      {contextLabel && (
        <div className="spark-chat__context-banner">
          <Link2 size={14} />
          <contextLabel.icon size={14} />
          <span>Connected to <strong>{contextLabel.type}:</strong> {contextLabel.id.replace(/_/g, ' ')}</span>
          {context?.wave_ids?.length ? (
            <span className="spark-chat__context-tag">Wave: {context.wave_ids.join(', ')}</span>
          ) : null}
          {context?.location_ids?.length ? (
            <span className="spark-chat__context-tag">{context.location_ids.join(', ')}</span>
          ) : null}
        </div>
      )}
      {/* Main chat area */}
      <div className="spark-chat__main">
        <div className="spark-chat__messages">
          {messages.length === 0 && (
            <div className="spark-chat__empty">
              <Sparkles size={32} />
              <h3>{agentName || 'Agent Spark'}</h3>
              <p>{contextLabel
                ? `I'm connected to your ${contextLabel.type.toLowerCase()}. Ask me anything about it.`
                : agentDescription || 'Ask me anything about your data, audiences, or consumer insights.'
              }</p>
            </div>
          )}

          {messages.map((msg) => {
            const isNew = newMessageIds.has(msg.id)

            return (
              <div
                key={msg.id}
                className={`spark-chat__message spark-chat__message--${msg.role}`}
              >
                <div className="spark-chat__message-avatar">
                  {msg.role === 'assistant' ? (
                    <Sparkles size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="spark-chat__message-content">
                  {/* Confidence badge */}
                  {msg.role === 'assistant' && msg.confidence_level && (
                    <ConfidenceBadge level={msg.confidence_level} />
                  )}

                  {/* Narrative summary / TL;DR */}
                  {msg.narrative_summary && (
                    <CollapsibleSection
                      title="TL;DR"
                      icon={<FileText size={14} />}
                      defaultOpen
                    >
                      <p className="spark-chat__tldr-text">
                        {msg.narrative_summary}
                      </p>
                    </CollapsibleSection>
                  )}

                  {/* Main message text with optional streaming */}
                  <div className="spark-chat__message-text">
                    {msg.role === 'assistant' && isNew ? (
                      <StreamingText
                        content={msg.content}
                        isNew
                        onComplete={() => handleStreamingComplete(msg.id)}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Thinking steps */}
                  {msg.thinking_steps && msg.thinking_steps.length > 0 && (
                    <CollapsibleSection
                      title="Reasoning"
                      icon={<Lightbulb size={14} />}
                    >
                      <ol className="spark-chat__thinking-steps">
                        {msg.thinking_steps.map((step, i) => (
                          <li key={i} className="spark-chat__thinking-step">
                            <span className="spark-chat__thinking-step-num">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CollapsibleSection>
                  )}

                  {/* Inline chart visualization */}
                  {msg.visualization && (
                    <InlineVisualization viz={msg.visualization} />
                  )}

                  {/* Inline data table */}
                  {msg.data_table && <InlineDataTable table={msg.data_table} />}

                  {/* Enhanced citations with provenance */}
                  {msg.citations && msg.citations.length > 0 && (
                    <CitationPanel citations={msg.citations} />
                  )}

                  {/* Enhanced suggested actions */}
                  {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div className="spark-chat__actions">
                      {msg.suggested_actions.map((action, i) => (
                        <button key={i} className="spark-chat__action-btn" onClick={() => onAction?.(action)}>
                          {ACTION_ICONS[action.type] || <Eye size={14} />}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Follow-up question chips */}
                  {msg.follow_up_questions &&
                    msg.follow_up_questions.length > 0 && (
                      <div className="spark-chat__follow-ups">
                        <span className="spark-chat__follow-ups-label">
                          Follow-up questions:
                        </span>
                        <div className="spark-chat__follow-ups-chips">
                          {msg.follow_up_questions.map((q, i) => (
                            <button
                              key={i}
                              className="spark-chat__follow-up-chip"
                              onClick={() => handleFollowUp(q)}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Message toolbar */}
                  {msg.role === 'assistant' && (
                    <div className="spark-chat__message-tools">
                      <button
                        onClick={() => copyMessage(msg.content)}
                        title="Copy"
                      >
                        <Copy size={14} />
                      </button>
                      <button title="Good response">
                        <ThumbsUp size={14} />
                      </button>
                      <button title="Bad response">
                        <ThumbsDown size={14} />
                      </button>
                      <button title="Regenerate">
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {sparkChat.isPending && (
            <div className="spark-chat__message spark-chat__message--assistant">
              <div className="spark-chat__message-avatar">
                <Sparkles size={16} />
              </div>
              <div className="spark-chat__message-content">
                <div className="spark-chat__typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Context indicator bar */}
        {context && (
          <ContextBar context={context} onRemoveKey={handleRemoveContextKey} />
        )}

        {/* Input area */}
        <div className="spark-chat__input-area">
          <textarea
            ref={inputRef}
            className="spark-chat__input"
            placeholder="Ask Agent Spark a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="spark-chat__send"
            disabled={!input.trim() || sparkChat.isPending}
            onClick={handleSend}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Proactive insights sidebar */}
      {visibleInsights.length > 0 && (
        <div
          className={`spark-chat__insights-panel ${insightsPanelOpen ? 'spark-chat__insights-panel--open' : ''}`}
        >
          <button
            className="spark-chat__insights-toggle"
            onClick={() => setInsightsPanelOpen((o) => !o)}
          >
            <Lightbulb size={14} />
            <span>Insights</span>
            <span className="spark-chat__insights-count">
              {visibleInsights.length}
            </span>
            {insightsPanelOpen ? (
              <EyeOff size={14} />
            ) : (
              <Eye size={14} />
            )}
          </button>
          {insightsPanelOpen && (
            <div className="spark-chat__insights-list">
              {visibleInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onDismiss={handleDismissInsight}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
