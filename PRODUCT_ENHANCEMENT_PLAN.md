# GWI Platform Product Enhancement Plan

> A comprehensive, research-backed plan to elevate every product tool from basic functionality to industry-leading capability. Each section identifies the current state, industry best practices, and specific enhancements organized into prioritized phases.

---

## Table of Contents

1. [Charts & Data Visualization](#1-charts--data-visualization)
2. [Dashboards](#2-dashboards)
3. [Crosstabs](#3-crosstabs)
4. [Audiences](#4-audiences)
5. [Agent Spark (AI Analytics)](#5-agent-spark-ai-analytics)
6. [Canvas (Guided Research)](#6-canvas-guided-research)
7. [TV Study](#7-tv-study)
8. [Print Reach & Frequency](#8-print-reach--frequency)
9. [Reports & Export](#9-reports--export)
10. [Cross-Cutting Enhancements](#10-cross-cutting-enhancements)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Charts & Data Visualization

**Current state:** 7 chart types (bar, stacked bar, line, pie, donut, scatter, table), basic Recharts rendering, minimal display options (labels, legend, grid, color scheme, sorting). No interactivity beyond tooltip hover. No statistical overlays, annotations, export, or accessibility support.

### Phase 1 -- New Chart Types

| Chart Type | Use Case | Recharts Support |
|---|---|---|
| **Funnel** | Conversion funnels, brand awareness-to-loyalty paths | `FunnelChart` native |
| **Radar / Spider** | Multi-attribute audience profile comparison | `RadarChart` native |
| **Treemap** | Hierarchical part-to-whole (market share, segment breakdown) | `Treemap` native |
| **Combo / Dual-axis** | Overlay % and absolute values, or bars with trend lines | `ComposedChart` native |
| **Waterfall** | Sequential gain/loss breakdown (audience size build-up) | Custom via `BarChart` with offset bars |
| **Bullet** | KPI against target with qualitative ranges | Custom via `BarChart` with layered bars |
| **Horizontal Bar** | Better for long category labels | Orientation prop on `BarChart` |
| **Area / Stacked Area** | Time-series volume and composition | `AreaChart` native |
| **Gauge / Radial Bar** | Single KPI progress for dashboards | `RadialBarChart` native |

**Medium-priority additions:** Sankey diagrams (audience flow, media consumption journeys -- requires `d3-sankey`), Geographic/Choropleth maps (market penetration by region -- requires `react-simple-maps`), Heatmap matrix (cross-tab intensity visualization).

**Extended `ChartType`:**
```typescript
export type ChartType =
  | 'bar' | 'stacked_bar' | 'grouped_bar' | 'horizontal_bar'
  | 'line' | 'area' | 'stacked_area'
  | 'pie' | 'donut'
  | 'scatter' | 'table'
  | 'combo' | 'waterfall' | 'funnel' | 'radar' | 'treemap'
  | 'bullet' | 'heatmap' | 'gauge' | 'sankey' | 'geo_map'
```

### Phase 2 -- Interactivity

| Feature | Description |
|---|---|
| **Drill-down** | Click a bar/slice to navigate deeper (e.g., All Markets -> US -> US Midwest). Show breadcrumbs for context. |
| **Cross-filtering** | Clicking a data point in one dashboard chart filters all other charts on shared dimensions. |
| **Brushing & linking** | Click-drag range selection on scatter/time-series charts; linked views highlight corresponding points in other charts. Uses Recharts `<Brush>` component. |
| **Zoom & pan** | Mouse-wheel zoom on scatter/time-series. Pinch-to-zoom on mobile. "Reset zoom" button. |
| **Rich tooltips** | Multi-line tooltips showing metric name, formatted value, sample size, confidence indicator, and optional sparkline. |
| **Animation** | Entry animations on first render, smooth transitions on data change. Respect `prefers-reduced-motion`. Keep under 300ms. |

**Extended `ChartOptions`:**
```typescript
export interface ChartOptions {
  // Existing
  show_labels?: boolean
  show_legend?: boolean
  show_grid?: boolean
  color_scheme?: string
  sort_by?: 'value' | 'label'
  sort_order?: 'asc' | 'desc'
  limit?: number
  // New
  enable_drill_down?: boolean
  drill_down_hierarchy?: string[]
  enable_cross_filter?: boolean
  enable_brushing?: boolean
  enable_zoom?: boolean
  enable_animation?: boolean
  animation_duration_ms?: number
  tooltip_format?: 'compact' | 'detailed'
}
```

### Phase 3 -- Statistical Overlays

| Feature | Description |
|---|---|
| **Trend lines** | Linear, logarithmic, exponential, polynomial regression with optional R-squared display. Use `simple-statistics` or `regression` library. |
| **Confidence intervals** | Shaded `<Area>` bands behind line charts (95% CI). Critical for survey-based data reliability. |
| **Forecasting** | Extend trend lines beyond last data point with dashed style and widening confidence bands. |
| **Anomaly detection** | Flag data points > 2 standard deviations from trend. Red marker with tooltip explanation. |
| **Reference lines** | Mean, median, percentile, benchmark lines (index = 100). Uses Recharts `<ReferenceLine>` and `<ReferenceArea>`. |

```typescript
export interface StatisticalOverlays {
  trend_line?: {
    enabled: boolean
    type: 'linear' | 'logarithmic' | 'exponential' | 'polynomial'
    show_equation?: boolean
    show_r_squared?: boolean
  }
  confidence_interval?: { enabled: boolean; level: 0.90 | 0.95 | 0.99 }
  forecast?: { enabled: boolean; periods_ahead: number; show_confidence_band?: boolean }
  anomaly_detection?: { enabled: boolean; sensitivity: 'low' | 'medium' | 'high' }
  reference_lines?: Array<{
    type: 'mean' | 'median' | 'percentile' | 'custom'
    value?: number
    label: string
    style: 'solid' | 'dashed' | 'dotted'
  }>
}
```

### Phase 4 -- Annotations & Storytelling

- **Inline annotations**: Text callouts anchored to specific data points with connector lines. Persisted in chart config.
- **Insight-driven titles**: Encourage titles that state the insight (e.g., "TikTok surpassed Instagram for 16-24s this quarter") instead of generic labels.
- **Direct labeling**: Labels on/near data points, reducing legend dependency. End-of-line labels for line charts, in-bar labels for bar charts.
- **Data source citations**: Unobtrusive footer with data source, wave/survey period, sample size, and date.

```typescript
export interface ChartAnnotation {
  id: string
  type: 'text' | 'callout' | 'highlight_region' | 'reference_marker'
  content: string
  anchor: {
    data_point_index?: number
    x_value?: string | number
    y_value?: number
    position?: 'top' | 'bottom' | 'left' | 'right'
  }
  style?: { font_size?: number; color?: string; background?: string; arrow?: boolean }
}
```

### Phase 5 -- Accessibility (WCAG 2.1)

| Requirement | Implementation |
|---|---|
| **Color contrast** (SC 1.4.11) | 3:1 minimum for graphical elements, 4.5:1 for text. Audit current palette. |
| **Don't rely on color alone** (SC 1.4.1) | Add patterns/textures to bars/slices. Use distinct shapes in scatter plots (circle, square, triangle, diamond). |
| **Color-blind palettes** | Provide Okabe-Ito palette alternative. Simulate against protanopia, deuteranopia, tritanopia. |
| **Screen reader support** | `role="img"` + `aria-label` on chart containers. Hidden data table (`sr-only`) for every chart. `aria-live="polite"` for dynamic updates. |
| **Keyboard navigation** | Tab to enter chart, arrow keys between data points, Enter/Space for drill-down, Escape to close tooltips. |

```typescript
export const ACCESSIBLE_PALETTES = {
  default: ['#FF0077', '#334BFA', '#00b37a', '#f5a623', '#8b5cf6', ...],
  colorblind_safe: ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#56B4E9', '#D55E00', '#F0E442'],
  high_contrast: ['#000000', '#0000FF', '#FF0000', '#00AA00', '#FF8800', '#8800FF'],
  monochrome: ['#1a1a2e', '#3d3d5c', '#6666a3', '#9999cc', '#ccccee'],
}
```

### Phase 6 -- Export & Theming

**Export capabilities:**
- **PNG** (2x resolution / 144 DPI) via `html-to-image`
- **SVG** (vector, infinitely scalable) -- extract Recharts SVG DOM directly
- **PDF** (print-ready) via `jsPDF` + `svg2pdf.js`
- **CSV / Excel** (underlying data) via `SheetJS`
- **PowerPoint** (editable chart slide) via `pptxgenjs`
- **Interactive embed** (iframe embed code with configurable dimensions)

**Theming:**
- Token-based color system (`--chart-color-categorical-1`, etc.) with light/dark mode values
- Categorical, sequential, diverging, and semantic palette types
- Brand customization: organization-level custom palettes from 1-2 brand colors
- Dark mode support: increase luminance 10-15% on dark backgrounds

### Phase 7 -- Comparison Features

- **Period-over-period**: Select comparison period; display solid (current) vs. dashed (comparison) with absolute and percentage change
- **Benchmark overlays**: Horizontal reference lines for industry averages, targets (e.g., "Industry Average: 42%")
- **Index baseline visualization**: Reference line at index=100 with color-coded above/below intensity
- **Audience comparison**: Side-by-side or overlaid comparison of two audience segments on the same chart

```typescript
export interface ComparisonConfig {
  mode: 'none' | 'period_over_period' | 'audience_comparison' | 'benchmark'
  comparison_wave_ids?: string[]
  comparison_audience_id?: string
  benchmarks?: Array<{ label: string; value: number; style: 'solid' | 'dashed' | 'dotted' }>
  show_absolute_change?: boolean
  show_percentage_change?: boolean
  index_baseline?: number
}
```

---

## 2. Dashboards

**Current state:** Widget types (chart, stat, text, image), configurable grid layout, widget positioning (x, y, width, height), embedded charts with full config, KPI cards with sparklines. No drag-and-drop, no cross-widget filtering, no real-time refresh, no presentation mode, no versioning.

### Phase 1 -- Drag-and-Drop Layout Builder

- Integrate `react-grid-layout` for snap-to-grid drag-and-drop with resizing
- 12 or 24 column grid with configurable row heights (small/medium/large presets)
- Widget locking to prevent accidental moves
- Undo/redo stack (20 steps minimum)
- Minimum widget size constraints
- Grid overlay toggle during edit mode
- Auto-arrange button to collapse whitespace gaps
- Keyboard-accessible arrangement (tab to select, arrows to move)

### Phase 2 -- Dashboard-Level Filters & Cross-Widget Interactivity

**Global filter bar:**
- Horizontal strip at dashboard top with dropdowns, date range pickers, multi-select fields
- Date range presets (Today, Last 7 Days, MTD, QTD, YTD, Custom)
- "Compare to previous period" toggle
- Filter persistence per user
- URL-encoded filter state for sharing bookmarkable filtered views
- Active filter chips with "Clear All" button
- Cascading filters (selecting Country narrows City dropdown)
- Saved filter sets (e.g., "My Region", "Enterprise Accounts Only")

**Cross-widget filtering:**
- Click a data point in one chart to filter all related widgets by that dimension
- Multi-select via Shift+click or Ctrl+click
- Filter indicator badge on each affected widget
- Per-widget clear and "clear all cross-filters" button
- Dashboard authors control which widgets respond to which source widgets
- Drill-through navigation: click opens a detail view pre-filtered to that context

### Phase 3 -- Extended Widget Library

| Widget Type | Key Features |
|---|---|
| **KPI Card** | Value, % change vs. prior period, sparkline, conditional color, target indicator |
| **Sparkline** | Compact inline trend, no axes, tooltip on hover |
| **Gauge / Dial** | Full/half circle with color zones (red/yellow/green) |
| **Data Table** | Sortable columns, pagination, inline sparklines, conditional formatting |
| **Map (Choropleth)** | Country/region shading, tooltips, drill-down by geography |
| **Map (Point/Bubble)** | Lat/long markers, clustering, size-encoded bubbles |
| **Funnel** | Conversion stages with drop-off rates |
| **List / Leaderboard** | Top-N with rank numbers, values, bar indicators |
| **Embed / iFrame** | External URLs, videos, third-party widgets |

### Phase 4 -- Conditional Formatting & Alerting

- Per-widget conditional formatting rules editor (field, operator, value, style)
- Color scales, icon sets (arrows, checks), data bars, threshold rules
- Dynamic thresholds that adjust based on historical averages
- Alert configuration: metric, condition, threshold, notification channel, recipients, cooldown period
- Alert history log with timestamps
- Snooze/acknowledge actions on alerts
- Anomaly detection flagging values that deviate from trailing average

### Phase 5 -- Responsive & Mobile Design

- Separate layout configurations for desktop, tablet, and mobile breakpoints
- Widget visibility toggles per breakpoint (hide secondary widgets on mobile)
- Vertical stacking single-column layout on narrow screens
- Swipe gestures for navigating dashboard sections on mobile
- Pull-to-refresh, pinch-to-zoom on charts
- Collapsible filter panel on mobile
- 48x48px minimum touch targets

### Phase 6 -- Sharing, Collaboration & Embedding

- **Sharing**: Direct link with optional password and expiration, role-based access (Admin/Editor/Viewer/Commenter)
- **Comments**: Inline threads anchored to specific widgets, @mention with notifications
- **Embedding**: React component, Web Component, and iframe with postMessage API; SSO and row-level security for multi-tenant
- **Duplicate**: One-click duplicate for personal modification
- **Activity feed**: Who viewed, edited, or commented

### Phase 7 -- Presentation & Kiosk Mode

- Full-screen toggle hiding all navigation chrome
- Dashboard playlist: ordered list of dashboards with configurable dwell time (30s/60s/120s)
- Smooth fade/slide transitions between playlist items
- Dark mode / light mode toggle
- Presenter notes (hidden from audience)
- TV/kiosk mode URL parameter (`?mode=tv`)
- Disable interactivity in presentation mode
- Loop toggle (continuous vs. single cycle)

### Phase 8 -- Versioning & Scheduled Snapshots

**Version history:**
- Every save creates an immutable version (who, when, what changed)
- Named versions (e.g., "v2.0 - Added Q4 metrics")
- Side-by-side diff view
- One-click restore to any previous version
- Audit trail export for compliance

**Scheduled snapshots & email digests:**
- Subscription management: preferred cadence (daily/weekly/monthly) and format (PDF/PNG/inline HTML)
- Recipient groups and per-recipient customization
- Conditional delivery: only send when threshold breached or data changed
- Timezone-aware scheduling
- Digest builder: pick which widgets to include
- "Send now" for ad-hoc sharing
- Delivery history and open tracking

### Phase 9 -- Templates & Performance

**Templates:**
- Template gallery with preview thumbnails, categorized by industry and function
- "Use this template" flow cloning and connecting data
- Pre-configured widget bundles (e.g., "SaaS Metrics Pack")
- Save own dashboards as reusable templates
- 5-10 starter templates: Executive Summary, Sales Pipeline, Marketing Performance, etc.

**Performance optimization:**
- Widget-level loading skeletons (shimmer placeholders)
- Staggered priority loading (KPIs first, then charts, then tables)
- Virtualization for below-the-fold widgets (`IntersectionObserver`)
- Code splitting per widget type
- `React.memo` / `useMemo` / `useCallback` to prevent unnecessary re-renders
- Web Workers for expensive data transformations
- Query result caching with configurable TTL
- Maximum 15-20 widgets per dashboard
- Performance insights panel showing per-widget query and render times

---

## 3. Crosstabs

**Current state:** Rows and columns from survey questions/audiences, three metrics (audience %, index, size), three highlight modes (heatmap, above_average, significance), hover tooltips, basic cell structure with single `significant` boolean. No statistical testing configuration, no NETs, no calculated rows, no weighting, no export, no sorting options, no suppression rules.

### Phase 1 -- Statistical Testing (Foundation)

**This is the single most critical gap.** Every market research crosstab tool provides automated significance testing.

| Test | Purpose | Display |
|---|---|---|
| **Chi-square** | Tests overall relationship between two categorical variables | p-value in table footer |
| **Z-test (pairwise column proportions)** | Identifies which specific columns differ significantly | Letter notation in cells |
| **T-test (means)** | Compares numeric means across columns | Letter notation in cells |

**Letter notation convention:**
- Uppercase letters (A, B, C) = significance at **95% confidence**
- Lowercase letters (a, b, c) = significance at **90% confidence**
- Each column receives a letter key; when a cell is significantly higher, the letter of the lower column appears in the higher cell

```typescript
export interface StatisticalTestConfig {
  test_type: 'chi_square' | 'z_test' | 'z_test_bonferroni' | 't_test'
  confidence_levels: { primary: number; secondary?: number }
  notation: 'letter' | 'asterisk' | 'arrow'
  overlap_handling: 'independent' | 'effective_base'
  multiple_comparison_correction?: 'none' | 'bonferroni' | 'fdr'
}

export interface CrosstabCell {
  values: Record<MetricType, number>
  significance?: {
    letters: string[]           // e.g., ['B', 'c']
    p_value?: number
    test_statistic?: number
    direction?: 'higher' | 'lower'
  }
  sample_size: number
}
```

### Phase 2 -- NET Rows/Columns & Expanded Metrics

**NETs (sub-totals):** Combine multiple response options into a single row.
- **Top-2-Box / Bottom-2-Box**: "Strongly Agree" + "Agree" -> NET Agreement
- **Age consolidation**: 18-24 + 25-34 -> 18-34 NET
- **Any category**: OR-combine Facebook, Instagram, TikTok -> "Any Social Media" NET
- Position options: above, below, or replace component items
- Visual differentiation: bold, shaded, or normal style

```typescript
export interface NetDimension {
  type: 'net'
  id: string
  label: string
  operator: 'or' | 'and'
  member_ids: string[]
  position: 'above' | 'below' | 'replace'
  show_members?: boolean
  style?: 'bold' | 'shaded' | 'normal'
}
```

**Expanded metrics:**
```typescript
export type MetricType =
  // Existing
  | 'audience_percentage' | 'audience_size' | 'audience_index'
  | 'positive_sample' | 'positive_size'
  | 'datapoint_sample' | 'datapoint_size' | 'datapoint_percentage'
  // New
  | 'column_percentage' | 'row_percentage' | 'total_percentage'
  | 'cumulative_percentage'
  | 'mean' | 'median' | 'std_deviation' | 'std_error' | 'variance'
  | 'confidence_interval_lower' | 'confidence_interval_upper'
  | 'effective_base' | 'weighted_base' | 'unweighted_base'
```

### Phase 3 -- Response Suppression & Weighting

**Suppression rules** (critical for data reliability):
- Configurable minimum base size threshold (default: n < 30)
- Action options: hide, grey out, replace with asterisk, show warning icon
- Complementary suppression: if one cell suppressed, suppress next-smallest to prevent back-calculation
- Warning threshold (e.g., n < 100 shows caution, n < 30 fully suppressed)
- Suppress significance testing for low-base cells
- Explanatory footnotes when suppression is applied

```typescript
export interface SuppressionConfig {
  enabled: boolean
  minimum_base_size: number
  suppression_action: 'hide' | 'grey_out' | 'asterisk' | 'warning_icon' | 'replace_text'
  replacement_text?: string
  suppress_significance: boolean
  complementary_suppression: boolean
  warning_threshold?: number
  footnote_on_suppression: boolean
}
```

**Weighting & rebasing:**
- Weight variable/scheme selection
- Effective sample size display
- Weight trimming (floor/cap for extreme weights)
- Percentage base options: column %, row %, total %, respondent base, custom filter
- Exclude non-respondents from base option

### Phase 4 -- Multi-Level Headers & Banners

**Nested/hierarchical dimensions:**
- Multi-level row and column headers (e.g., Gender nested within Age)
- Collapsible header groups
- Banner tables: standard demographic banner containing Age, Gender, Region, Income as sub-groups
- Each banner group gets its own letter key range for significance testing
- Visual separator between banner groups
- "Total" column always present as first column

```typescript
export interface BannerConfig {
  id: string
  name: string
  banner_groups: BannerGroup[]
  include_total_column: boolean
}

export interface BannerGroup {
  id: string
  label: string
  type: 'question' | 'audience' | 'wave' | 'location' | 'custom'
  question_id?: string
  datapoint_ids?: string[]
  stat_test_group: string   // e.g., "A-E"
  separator_after?: boolean
}
```

### Phase 5 -- Calculated Rows, Sorting & Pivot

**Calculated rows/columns:**
- Ratio of two rows (e.g., Consideration / Awareness = Conversion Rate)
- Difference (Wave 2 - Wave 1 = Change)
- Custom index: (Cell % / Total %) * 100
- Custom formula expressions

**Sorting:**
- Sort by value (ascending/descending), alphabetical, custom order, significance
- Pin rows excluded from sorting (NET, Total) at top or bottom
- Secondary sort for tiebreakers

**Pivot/transpose:**
- One-click swap rows and columns
- Move dimensions between row/column positions
- Display metrics as rows, columns, or within cells
- Flatten or re-nest hierarchical headers

### Phase 6 -- Wave Comparison & Drill-Down

**Side-by-side wave comparison:**
- Place multiple waves as column groups
- Auto-calculated delta columns (absolute, percentage point, or percentage change)
- Trend arrows showing direction of change
- Significance testing between time periods
- Mini sparklines within cells

**Cell-level drill-down:**
- Click cell to see underlying respondent profiles (anonymized)
- Click NET to expand into component rows
- Click significance letter to see full test details (p-value, test statistic, sample sizes)
- Right-click context menu: filter to cell, save as audience, create chart, copy value

### Phase 7 -- Export & Templates

**Export with formatting preserved:**
- **Excel**: Full formatting (colors, fonts, merged headers, significance letters), optional formulas, freeze headers, auto-column-width
- **PowerPoint**: Slide-per-table, brand template support, editable native tables (not images), optional chart accompaniment
- **PDF**: Print-ready with pagination, headers/footers
- **CSV**: Raw data for further analysis

**Table templates:**
- Saved configurations for banner setup, stat test settings, highlighting, export settings
- Categories: Standard Banner, Demographics, Brand Health, Tracking, Custom
- Organization-wide default templates
- Share templates with team or organization

### Phase 8 -- Advanced Conditional Formatting

Extend beyond current heatmap/above_average/significance:
- Sequential and diverging color scales with custom value ranges
- Threshold-based rules (greater than, less than, between, top-N, bottom-N)
- Style outputs: background color, text color, font weight, border, icons (arrows, stars, flags)
- Configurable significance colors for both confidence levels
- Custom rule chains (multiple conditions per cell)

---

## 4. Audiences

**Current state:** Boolean expression builder with AND/OR groups, NOT support, question and datapoint conditions, CRUD operations with duplicate, sorting by name/date/frequency, filtering by project. Hardcoded "AND" between groups. No live sizing, no overlap analysis, no templates, no versioning, no activation, no health scoring.

### Phase 1 -- Builder UX Improvements

- **Configurable inter-group connectors**: Toggle between AND/OR between groups (currently hardcoded AND)
- **Exclude mode per group**: Include/Exclude toggle on each group header, wrapping in NOT when Exclude selected
- **Live audience sizing**: Debounced calls to estimation endpoint (300ms) as expression changes. Show horizontal bar/gauge with population percentage. Color coding: green (healthy), yellow (marginal), red (too small). Sample size warnings below threshold.
- **Breakdown preview**: Mini demographic breakdown (age/gender split) updating with estimate
- **Per-market sizing**: Size breakdown per selected market with insufficient sample warnings

### Phase 2 -- Organization & Discovery

**Tagging and folders:**
- `tags: string[]` on Audience model with free-form labels
- Tag filter on listing page alongside search/sort
- Full folder hierarchy replacing flat `project_id`
- Favorites/pinning for frequently-used audiences
- Bulk operations: multi-select for bulk tagging, moving, sharing, deleting
- Color coding for tags/folders

**Health scoring:**
- Composite 0-100 health score based on: sample sufficiency (40%), recency (20%), specificity (15%), complexity (10%), cross-market coverage (15%)
- Green/yellow/red badge on audience cards
- Actionable warnings: "Sample of 47 in Germany may be unreliable", "Represents 78% of population -- consider narrowing", "Built on Wave 28; Wave 32 now available"
- Staleness alerts for audiences not refreshed against new data

### Phase 3 -- Overlap & Comparison

**Overlap analysis:**
- Select 2-4 saved audiences, see Venn diagram with shared/unique counts and overlap percentages
- Overlap matrix/heatmap for 3+ audiences
- Click Venn region to create new audience from intersection (A AND B), exclusive set (A AND NOT B), or union (A OR B)
- API: `POST /v3/audiences/overlap`

**Side-by-side comparison:**
- Select 2-5 audiences for profile comparison table
- Demographic breakdown, top over-indexing attributes (with index scores), behavioral highlights, attitudinal differences
- Auto-surface top 10 attributes where audiences diverge most
- Exportable comparison report (PDF/PPTX)

### Phase 4 -- Templates & Dynamic Audiences

**Pre-built templates:**
- Browsable library by category: Demographics (Gen Z, Millennials, Parents, High-Income), Psychographics (Eco-Conscious, Tech Enthusiasts), Industry Verticals (CPG, Auto, Financial Services), Media Behaviors (Cord-Cutters, Podcast Listeners, Mobile-First)
- "Start from template" pre-fills expression for customization
- Template metadata: description, estimated size per market, use cases, underlying expression
- Users can mark own audiences as shareable templates

**Dynamic vs. static:**
- Dynamic (rule-based): Re-evaluated against each new data wave automatically
- Static (snapshot): Frozen at creation time for longitudinal studies
- Refresh indicators: "Last refreshed: Feb 7, 2026" / "Next refresh: Feb 14, 2026 (Wave 32)"
- "Freeze" action to snapshot a dynamic audience
- Type badges ("Dynamic" / "Static") on audience list

### Phase 5 -- AI-Powered Discovery

- **"Discover Audiences" tab**: Trending segments, high-index clusters, under-explored combinations
- **Natural language creation**: Integrate with Agent Spark -- "Find people aged 25-34 interested in sustainability who shop online frequently" generates the expression
- **"Did you know?" insights**: AI-generated on audience detail page -- "This audience is 3.2x more likely to use TikTok than the general population"
- **Recommended refinements**: "Adding 'Eco-conscious attitudes' would increase your index on sustainable brands from 145 to 210"

### Phase 6 -- Advanced Features

**Nested sub-groups in UI:**
- Drag groups inside other groups for nested boolean logic
- Visual depth indicator with indentation and color coding
- Cap at 5-10 levels with depth warning
- Expression editor toggle for power users (raw JSON with syntax highlighting)

**Audience versioning:**
- Every save creates an immutable version (expression, name, sample size at save, change summary)
- Diff view between any two versions
- One-click restore to previous version
- Size trend plot showing audience size over time and data waves

**Sharing permissions:**
- Replace `is_shared: boolean` with granular model: visibility (private/team/org/public), per-user and per-team permissions (view/edit/admin)
- Published audience library for organization-wide curated audiences
- Activity log: who created, edited, shared, used each audience
- Comment/annotation support for methodology notes

**Multi-market building:**
- Market selector within the builder (not just at chart level)
- Per-market sizing in mini-table
- Cross-market comparison tab showing how audience profiles differ by market
- Global vs. local attribute indicators
- Market groupings (EMEA, APAC, LATAM) for quick selection

### Phase 7 -- Activation & Lookalikes

**Audience activation:**
- "Activate" panel with supported destinations: Meta Ads, Google Ads, TikTok, The Trade Desk, LiveRamp, Salesforce, HubSpot, CSV/JSON export
- Workflow: Select destination -> Map fields -> Review -> Activate -> Monitor
- Status tracking: Pending, Syncing, Active, Paused, Error with match rates
- Privacy compliance checklist (GDPR, CCPA) before activation

**Lookalike generation:**
- "Find Similar" button on saved audiences
- Similarity slider: Top 1%, 5%, 10% of population most similar to seed
- Explainable factors: top 5-10 attributes driving the lookalike
- Preview before saving: estimated size, demographic breakdown, key differences from seed

---

## 5. Agent Spark (AI Analytics)

**Current state:** Multi-turn chat, basic citations (text + source + URL), suggested actions (create_chart, create_audience, show_data, navigate), conversation history sidebar, example prompts, copy/feedback/regenerate buttons. No streaming, no inline visualizations, no follow-up suggestions, no rich provenance.

### Phase 1 -- Inline Visualizations & Follow-ups

**Inline chart rendering:**
- Extend `SparkMessage` with `visualization` and `data_table` fields
- Render charts inline using existing `ChartRenderer` component
- "Try as..." dropdown to switch chart type without re-querying
- Mini data tables rendered directly in conversation

```typescript
export interface SparkVisualization {
  chart_type: ChartType
  data: Record<string, unknown>[]
  series: string[]
  title?: string
  subtitle?: string
}

export interface SparkDataTable {
  columns: { key: string; label: string; format?: 'number' | 'percent' | 'currency' }[]
  rows: Record<string, unknown>[]
}
```

**Follow-up question suggestions:**
- `follow_up_questions: string[]` on `SparkMessage`
- Rendered as clickable chips below assistant responses
- Contextual to the conversation (e.g., "How does this compare across age groups?", "Show me the trend over time")

**AI chart recommendations:**
- `recommended_chart_type` and `chart_alternatives` in responses
- Auto-select based on data shape (cardinality, time-series, numeric vs. categorical)

### Phase 2 -- Rich Citations & Streaming

**Enhanced citations:**
```typescript
export interface SparkCitation {
  text: string
  source: string
  url?: string
  dataset_id?: string
  wave_id?: string
  sample_size?: number
  confidence_level?: 'high' | 'medium' | 'low'
  methodology_note?: string
}
```

**Streaming responses:**
- Server-sent events (SSE) for typewriter-style token rendering
- Dramatically improves perceived responsiveness
- Cancel button during generation

### Phase 3 -- Context Grounding & Narrative Generation

**Extended context:**
```typescript
export interface SparkContext {
  audience_id?: string
  chart_id?: string
  crosstab_id?: string      // NEW
  dashboard_id?: string     // NEW
  question_ids?: string[]   // NEW
  report_id?: string        // NEW
  wave_ids?: string[]
  location_ids?: string[]
}
```

- "Attach data" button to pin context (similar to Power BI Copilot's "+" icon)
- Spark answers grounded to specific datasets, audiences, or reports

**AI-generated narratives:**
- `narrative_summary` field for TL;DR extraction for reports/dashboards
- "Summarize this" button on any chart or crosstab
- Structured responses: executive summary, detailed findings, actionable takeaways

### Phase 4 -- Proactive Insights & Platform Integration

**Proactive insights panel:**
- Surface on home page and within Spark
- Significant period-over-period changes in key metrics
- Unusual audience behavior patterns
- Trending topics with acceleration signals
- Statistical outliers in survey data

**Embedded AI throughout platform:**
- Spark button on every chart: "Explain this chart"
- Spark button on every crosstab: "What stands out here?"
- Spark button on Canvas: "Suggest next research steps"
- Spark button on TV Study/Print R&F: "Optimize this media plan"
- Mirrors Power BI Copilot's omnipresent accessibility

---

## 6. Canvas (Guided Research)

**Current state:** 2-step wizard -- (1) select research goals from 6 categories, (2) select audiences. Goals are labels with no downstream impact. Navigates to dashboards on completion.

### Phase 1 -- Expanded Multi-Step Wizard

Expand to a 7-step research workflow:

| Step | Purpose | Implementation |
|---|---|---|
| 1. Define Objectives | Select research goals (expand from 6 to 15+) | Existing, enhanced |
| 2. Select Markets | Choose countries/regions from taxonomy | New, leverage location taxonomy |
| 3. Define Audiences | Select/create target audiences | Existing, enhanced |
| 4. Select Time Period | Choose waves for analysis | New, leverage wave taxonomy |
| 5. Analysis Framework | Pick data dimensions and metrics | New |
| 6. Review & Configure | Preview setup and adjust outputs | New |
| 7. Generate & Review | Auto-generated insights and reports | New |

### Phase 2 -- Research Templates

Pre-built templates that configure entire Canvas workflows:
- "Brand Health Tracker" -- awareness, consideration, preference, usage metrics
- "Competitive Landscape Analysis" -- brand comparison across attributes
- "Media Consumption Deep Dive" -- channel usage, time spent, device breakdown
- "Purchase Journey Mapping" -- awareness -> consideration -> purchase -> loyalty funnel
- "Gen Z Profiling" -- demographic and psychographic deep dive
- "Market Entry Assessment" -- market sizing, competitive context, consumer readiness

Each template pre-configures: goals, question IDs, chart types, benchmark metrics, AI prompt templates.

### Phase 3 -- Goal-Driven Analysis & Auto-Report Generation

- Map each goal to specific taxonomy questions, recommended visualizations, and Spark AI prompts
- "Generate Insights" actually produces a structured report with findings per goal
- AI-generated executive summary
- Charts pre-configured based on goals and audiences
- Exportable as PDF/PPTX

### Phase 4 -- Collaboration & Progress Tracking

- Assign research steps to team members
- Comment/annotation per step
- Approval workflows (draft -> review -> approved)
- Progress dashboard: completion %, time per phase, data coverage gaps, quality indicators
- Shared research projects with role-based access

---

## 7. TV Study

**Current state:** Channel multi-select (10 hardcoded UK channels), audience selector (5 segments), location selector, wave selector, daypart schedule (7 dayparts, weekday/weekend), static hardcoded results. No dynamic calculations, no reach curves, no overlap analysis, no scenario planning.

### Phase 1 -- Dynamic Calculations & Reach Curves

- Replace hardcoded results with calculation engine (or realistic mock computations that vary with inputs)
- Interactive reach curve chart (x-axis: frequency, y-axis: reach %)
- Effective reach band highlighting (e.g., 3+ frequency zone)
- Diminishing returns visualization
- Budget-to-reach optimizer slider

```typescript
interface TvStudyResults {
  summary: { universe: number; sample_size: number; reach: number; reach_pct: number; avg_frequency: number; impacts: number; grp: number }
  reach_curve: { frequency: number; reach_pct: number; cumulative_reach: number }[]
  daypart_breakdown: { daypart: string; reach_pct: number; grp: number; cpm: number }[]
  channel_contribution: { channel: string; incremental_reach: number; overlap_pct: number }[]
}
```

### Phase 2 -- Cross-Channel Overlap & Daypart Optimization

**Overlap analysis:**
- Venn/upset diagram showing audience overlap between channels
- Exclusive reach per channel and duplication matrix
- Recommendation to cut redundant channels

**Daypart optimization:**
- CPM by daypart (cost efficiency)
- Attention/viewability score by daypart
- Color-coded heatmap view (green = high efficiency, red = low)
- "Optimize" button that auto-distributes budget across dayparts for maximum reach

### Phase 3 -- Competitive & Scenario Planning

**Competitive media analysis:**
- Select competitor brands
- Show competitor channel/daypart distribution
- Share of voice comparison, spend estimation
- Gap analysis (where you're absent but competitors are heavy)

**Scenario planning:**
- Save multiple plan scenarios
- Side-by-side comparison table
- Budget reallocation simulator
- "What if I add/remove this channel?" instant recalculation

### Phase 4 -- CTV/Streaming Extension

- Add streaming platform selection (Netflix, YouTube, Disney+, etc.)
- CTV impression estimates
- Cross-platform de-duplication between linear TV and CTV
- Digital video reach extension estimates
- Combined linear + CTV reach curve

---

## 8. Print Reach & Frequency

**Current state:** Publication multi-select (10 hardcoded UK publications with type and circulation), audience selector (5 segments), market selector, insertion schedule table, static hardcoded results. No duplication analysis, no frequency distribution, no cost optimization.

### Phase 1 -- Dynamic Calculations & Duplication Analysis

- Replace hardcoded results with computation that varies with inputs
- Duplication matrix: heatmap grid showing % audience overlap between publication pairs
- "Net reach" vs. "gross reach" with clear labeling
- De-duplicated reach calculation adjusting for multi-title reading
- Venn diagram for 2-3 publications, upset plot for 4+

### Phase 2 -- Frequency Distribution & Cost Optimization

**Frequency distribution:**
- Histogram (x-axis: exposure count, y-axis: % of audience)
- Effective frequency band highlighting (configurable, e.g., 3-10)
- Under-exposed and over-exposed segment identification
- Curve comparison when adding/removing publications

**Cost optimization:**
- Rate card CPM by publication
- Cost-per-reach-point calculation
- Budget optimizer: allocate insertions across publications to maximize reach given a budget
- Marginal cost of next insertion (diminishing returns)

### Phase 3 -- Publication Profiling & Scenarios

**Publication audience profiles:**
- Demographic composition of each publication's readership
- Affinity index between readership and target audience
- Best-fit publications ranked by index
- Digital vs. print readership breakdown

**Scenario comparison:**
- Save multiple print plans
- Side-by-side comparison
- "Swap publication" analysis
- Cross-platform de-duplication (print + digital editions)

---

## 9. Reports & Export

**Current state:** Static file browser listing pre-existing PDF reports, search/category filtering, download simulation, pagination. Report types defined (PDF/XLSX/CSV/PPTX) but only PDF used.

### Phase 1 -- Report Builder (WYSIWYG)

- Drag-and-drop report builder with sections: charts, tables, text blocks, images, dividers
- Pull in existing charts/crosstabs from the platform
- Add AI-generated narrative text via Spark integration
- Real-time preview
- Export to PDF, PPTX, DOCX

### Phase 2 -- Branded Templates

```typescript
interface ReportTemplate {
  id: string
  name: string
  format: 'PDF' | 'PPTX' | 'DOCX'
  category: 'executive_summary' | 'deep_dive' | 'competitive' | 'media_plan' | 'custom'
  brand_config: { logo_url: string; primary_color: string; secondary_color: string; font_family: string; footer_text: string }
  sections: ReportSection[]
}
```

- 5-10 starter templates: Executive Summary, Deep Dive Analysis, Competitive Report, Media Plan, Audience Profile
- Custom brand config: logo, colors, fonts, footer
- Reusable section library

### Phase 3 -- Automated Generation & Scheduling

**From Canvas:**
- "Generate Report" at end of Canvas workflow
- AI auto-populates sections based on goals, audiences, findings
- Executive summary, key findings, charts, methodology, appendix
- User reviews and edits before finalizing

**Scheduling:**
- Frequency: daily, weekly, monthly, quarterly
- Recipients and format per schedule
- Auto-update data from latest wave
- Last sent / next send tracking
- Conditional delivery (only when data changes)

### Phase 4 -- Data Stories & Interactive Sharing

**Data Story Creator:**
- Sequence of "slides" telling a narrative
- Each slide: narrative text + chart/data table
- AI-generated transition text between slides
- Present in slideshow mode or export as PPTX/PDF

```typescript
interface DataStory {
  id: string
  title: string
  slides: DataStorySlide[]
  status: 'draft' | 'published'
  share_url?: string
}

interface DataStorySlide {
  type: 'title' | 'insight' | 'chart' | 'comparison' | 'callout' | 'conclusion'
  title?: string
  narrative: string
  visualization?: SparkVisualization
  transition_text?: string
}
```

**Interactive sharing:**
- Shareable report links with interactive charts (hoverable, sortable tables)
- Commenting and annotation by recipients
- Password protection, expiry dates
- Usage analytics (views, time spent)
- Embed widget for external platforms

---

## 10. Cross-Cutting Enhancements

### A. Unified AI Layer
Embed Agent Spark assistance throughout the entire platform rather than as a separate page:
- "Explain this chart" button on every chart
- "What stands out?" button on every crosstab
- "Suggest next steps" on Canvas
- "Optimize this plan" on TV Study / Print R&F
- "Generate summary" on dashboards and reports

### B. Dark Mode
- Token-based color system with light/dark mode values for all UI elements and chart colors
- System preference detection (`prefers-color-scheme`)
- User override toggle in settings
- All charts, tables, and widgets dark-mode aware

### C. Keyboard Shortcuts & Power User Features
- Global shortcuts: Cmd+K for search, Cmd+N for new, Cmd+S for save
- Chart shortcuts: arrow keys for navigation, Enter for drill-down, Escape to close
- Expression editor with syntax highlighting for advanced audience building
- Bulk operations across all entity types

### D. Governance & Audit Trail
- Log all user actions across the platform (create, edit, delete, share, export, activate)
- AI interaction audit trail
- Data access pattern tracking
- Compliance report export (GDPR, SOX, HIPAA)
- "Approved for AI" designation on datasets

### E. Performance Standards
- Initial page load under 3 seconds
- Individual widget render under 1 second
- Search results under 500ms
- Real-time estimation (audience sizing) under 2 seconds
- Export generation under 10 seconds for standard reports

---

## 11. Implementation Roadmap

### Quarter 1 -- Foundations

**Charts:** New chart types (funnel, radar, treemap, combo, waterfall, bullet, area), extended `ChartType` enum and `ChartRenderer`
**Crosstabs:** Statistical testing with letter notation, NET rows/columns, response suppression, expanded metrics
**Audiences:** Live audience sizing, configurable inter-group connectors, NOT/Exclude per group, tagging and folders
**Agent Spark:** Inline chart rendering in responses, follow-up question suggestions, enhanced citations
**Dashboards:** `react-grid-layout` drag-and-drop integration, dashboard-level filter bar

### Quarter 2 -- Competitive Parity

**Charts:** Interactivity (drill-down, cross-filtering, brushing, zoom), statistical overlays (trend lines, confidence intervals, reference lines)
**Crosstabs:** Multi-level headers and banners, weighting and rebasing, Excel export with formatting
**Audiences:** Overlap analysis with Venn diagrams, side-by-side comparison, pre-built templates, dynamic vs. static types
**Agent Spark:** Streaming responses, context grounding with "Attach data" button
**Dashboards:** Cross-widget filtering, extended widget library, conditional formatting and alerting
**Canvas:** Expanded 7-step wizard, research templates
**TV Study:** Dynamic calculations, reach curves, cross-channel overlap analysis
**Print R&F:** Dynamic calculations, duplication matrix, frequency distribution

### Quarter 3 -- Differentiation

**Charts:** Annotations and storytelling, accessibility (WCAG 2.1), export (PNG, SVG, PDF, CSV, PPTX), theming with dark mode
**Crosstabs:** Calculated rows/columns, sorting with pinning, pivot/transpose, wave comparison with deltas, PowerPoint export, table templates
**Audiences:** AI-powered discovery ("Discover Audiences" tab, NLP creation via Spark), health scoring, nested sub-groups, versioning
**Agent Spark:** Proactive insights, embedded AI throughout platform, narrative generation
**Dashboards:** Responsive/mobile layouts, sharing/collaboration/embedding, presentation/kiosk mode
**Canvas:** Goal-driven auto-generated reports, collaboration workflows
**Reports:** Report builder (WYSIWYG), branded templates, PDF/PPTX export

### Quarter 4 -- Advanced & Ecosystem

**Charts:** Comparison features (period-over-period, benchmarks, audience comparison), geographic maps, Sankey diagrams, real-time streaming
**Crosstabs:** Cell-level drill-down, advanced conditional formatting, confidence intervals
**Audiences:** Multi-market building, sharing permissions, activation to ad platforms, lookalike generation
**Agent Spark:** Mobile-first chat, voice input
**Dashboards:** Versioning and change history, scheduled email digests, templates gallery, performance optimization
**Canvas:** Progress tracking, quality indicators
**TV Study:** Competitive analysis, scenario planning, CTV/streaming extension
**Print R&F:** Cost optimization, publication profiling, scenario comparison, digital extension
**Reports:** Automated generation from Canvas, scheduled delivery, Data Story Creator, interactive sharing

---

## Suggested Library Additions

| Library | Purpose | Size |
|---|---|---|
| `react-grid-layout` | Dashboard drag-and-drop grid | ~30KB |
| `simple-statistics` | Trend lines, regression, statistical tests | ~15KB |
| `html-to-image` | PNG/SVG chart export | ~5KB |
| `jspdf` + `svg2pdf.js` | PDF export | ~80KB |
| `sheetjs` (xlsx) | Excel export | ~90KB |
| `pptxgenjs` | PowerPoint export | ~50KB |
| `react-simple-maps` | Geographic/choropleth maps | ~40KB |
| `d3-sankey` | Sankey diagrams | ~10KB |
| `socket.io-client` | Real-time WebSocket streaming | ~25KB |

---

## Key Principles

1. **Research-first**: Every enhancement is grounded in industry best practices from leading platforms (Tableau, Power BI, GWI, Q Research, Displayr, ThoughtSpot, Adobe CDP, etc.)
2. **Incremental delivery**: Each phase builds on the previous, delivering value at every step
3. **Data reliability**: Statistical testing, suppression, weighting, and confidence intervals ensure trustworthy analysis
4. **Accessibility**: WCAG 2.1 compliance is not optional -- color-blind palettes, keyboard navigation, and screen reader support are built-in
5. **AI-augmented**: Agent Spark becomes the intelligence layer throughout the platform, not just a chat interface
6. **Export-ready**: Every analysis tool produces presentation-quality outputs (PPTX, PDF, branded reports)
7. **Performance-conscious**: Lazy loading, virtualization, caching, and performance budgets prevent degradation as features scale
