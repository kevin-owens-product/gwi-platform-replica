import type {
  SparkChatRequest,
  SparkChatResponse,
  SparkContext,
  SparkConversation,
  SparkDataTable,
  SparkMessage,
  SparkVisualization,
} from '../../types'
import { mockConversations } from '../data/spark'
import { delay, findById, newId, now } from '../helpers'

const conversations = [...mockConversations]

interface AgentChatBlueprint {
  response: string
  narrativeSummary: string
  thinkingSteps: string[]
  followUps: string[]
  visualization?: SparkVisualization
  dataTable?: SparkDataTable
  confidence?: 'high' | 'medium' | 'low'
}

const AGENT_CHAT_BLUEPRINTS: Record<string, AgentChatBlueprint> = {
  'brief-interpreter': {
    response:
      'I translated the brief into a structured plan with objective, target audience, markets, KPIs, and required outputs. I also generated assumptions for missing constraints and an approval checklist for scope lock.',
    narrativeSummary:
      'Brief interpreted successfully with scope assumptions and workflow-ready outputs.',
    thinkingSteps: [
      'Classified the brief intent and primary business question.',
      'Extracted target audience, market scope, and KPI definitions.',
      'Mapped required outputs to downstream specialist agents.',
      'Created an approval checklist for unresolved constraints.',
    ],
    followUps: [
      'Confirm objective and KPI wording?',
      'Add market exclusions before launch?',
      'Convert this into a runnable workflow?',
    ],
    dataTable: {
      columns: [
        { key: 'field', label: 'Brief Field', format: 'text' },
        { key: 'status', label: 'Status', format: 'text' },
        { key: 'detail', label: 'Detail', format: 'text' },
      ],
      rows: [
        { field: 'Objective', status: 'Captured', detail: 'Grow streaming subscription intent in Q2' },
        { field: 'Audience', status: 'Captured', detail: 'Gen Z creators + hybrid workers' },
        { field: 'Markets', status: 'Captured', detail: 'US, UK, Germany' },
        { field: 'Outputs', status: 'Captured', detail: 'Crosstab, narrative, dashboard, deck' },
        { field: 'Budget cap', status: 'Needs input', detail: 'No spend cap provided in brief' },
      ],
    },
  },
  'workflow-orchestrator': {
    response:
      'I created a staged workflow with dependency ordering, validation gates, and delivery handoffs. The run is configured to produce draft outputs after each stage for stakeholder review.',
    narrativeSummary:
      'Execution workflow assembled with clear owners, gates, and artifact handoffs.',
    thinkingSteps: [
      'Provisioned workspace and permissions from the brief context.',
      'Built the step dependency graph across specialist agents.',
      'Inserted governance checks after analysis and before delivery.',
      'Configured delivery and advisor feedback loops.',
    ],
    followUps: [
      'Review step owners and SLAs?',
      'Add a compliance gate before delivery?',
      'Run the full workflow now?',
    ],
    dataTable: {
      columns: [
        { key: 'stage', label: 'Stage', format: 'text' },
        { key: 'owner', label: 'Owner', format: 'text' },
        { key: 'artifact', label: 'Primary Artifact', format: 'text' },
      ],
      rows: [
        { stage: 'Intake', owner: 'Brief Interpreter', artifact: 'Structured brief' },
        { stage: 'Data Prep', owner: 'Data Harmonizer', artifact: 'Harmonized dataset' },
        { stage: 'Analysis', owner: 'Crosstab Analyst', artifact: 'Significance table' },
        { stage: 'Story', owner: 'Narrative Agent', artifact: 'Executive summary' },
        { stage: 'Delivery', owner: 'Connector Agent', artifact: 'Destination receipts' },
      ],
    },
  },
  'data-harmonizer': {
    response:
      'I normalized first-party and external schemas to GWI taxonomy, resolved duplicate records, and generated provenance for each merged metric. The harmonized dataset is ready for audience and crosstab analysis.',
    narrativeSummary:
      'Data sources harmonized with lineage and quality checks ready for analysis.',
    thinkingSteps: [
      'Profiled source schemas and key overlap dimensions.',
      'Mapped fields into unified taxonomy definitions.',
      'Applied deduplication and source weighting strategy.',
      'Published harmonized dataset with provenance log.',
    ],
    followUps: [
      'Inspect the field mapping dictionary?',
      'Adjust source weighting rules?',
      'Push dataset to audience profiling?',
    ],
    dataTable: {
      columns: [
        { key: 'source', label: 'Source', format: 'text' },
        { key: 'records', label: 'Records', format: 'number' },
        { key: 'match_rate', label: 'Match Rate', format: 'percent' },
        { key: 'quality', label: 'Quality', format: 'text' },
      ],
      rows: [
        { source: 'GWI Core', records: 45200, match_rate: 100, quality: 'High' },
        { source: 'CRM', records: 19340, match_rate: 86.2, quality: 'High' },
        { source: 'Ad Platform', records: 88210, match_rate: 78.9, quality: 'Medium' },
        { source: 'Web Analytics', records: 112430, match_rate: 74.1, quality: 'Medium' },
      ],
      highlight_column: 'match_rate',
    },
  },
  'audience-profiler': {
    response:
      'I built a validated audience definition, sized it by market, and generated top indexed persona traits. This segment is now ready for crosstab comparison and chart packaging.',
    narrativeSummary:
      'Audience defined, sized, and profiled with benchmark comparisons.',
    thinkingSteps: [
      'Converted brief intent into audience logic.',
      'Estimated segment reach by market and demographic slice.',
      'Compared the segment against all internet users.',
      'Generated persona traits from over-indexing behaviors.',
    ],
    followUps: [
      'Compare this audience to last quarter?',
      'Save this as a reusable persona?',
      'Run a crosstab for top behaviors?',
    ],
    visualization: {
      chart_type: 'grouped_bar',
      title: 'Audience Reach by Market',
      subtitle: 'Target segment vs all internet users',
      series: ['Target Segment', 'All Users'],
      data: [
        { market: 'US', 'Target Segment': 24, 'All Users': 16 },
        { market: 'UK', 'Target Segment': 21, 'All Users': 14 },
        { market: 'Germany', 'Target Segment': 18, 'All Users': 12 },
        { market: 'France', 'Target Segment': 17, 'All Users': 11 },
      ],
      x_axis_label: 'Market',
      y_axis_label: 'Population %',
    },
  },
  'crosstab-analyst': {
    response:
      'I ran a crosstab with significance filtering and lift detection. The strongest lift appears in ad-supported streaming adoption among the target audience versus baseline.',
    narrativeSummary:
      'Crosstab completed with significance and lift highlights.',
    thinkingSteps: [
      'Built matrix with target audience and baseline comparison.',
      'Computed percentages, indices, and confidence markers.',
      'Filtered to statistically meaningful differences.',
      'Prepared export-ready table with analyst notes.',
    ],
    followUps: [
      'Show only significant lifts?',
      'Switch to a market-only cut?',
      'Convert this table to chart pack?',
    ],
    dataTable: {
      columns: [
        { key: 'metric', label: 'Metric', format: 'text' },
        { key: 'target', label: 'Target %', format: 'percent' },
        { key: 'baseline', label: 'Baseline %', format: 'percent' },
        { key: 'index', label: 'Index', format: 'index' },
      ],
      rows: [
        { metric: 'Ad-supported streaming', target: 48.5, baseline: 31.9, index: 152 },
        { metric: 'Bundle subscription', target: 41.2, baseline: 26.1, index: 158 },
        { metric: 'Daily short-form video', target: 67.8, baseline: 44.6, index: 152 },
        { metric: 'Weekly podcast listening', target: 39.4, baseline: 28.7, index: 137 },
      ],
      highlight_column: 'index',
      sort_by: 'index',
    },
  },
  'narrative-agent': {
    response:
      'I converted the analysis into a client-ready story with an executive summary, key evidence points, and recommended actions. The narrative now aligns data confidence with business impact.',
    narrativeSummary:
      'Narrative generated with stakeholder-specific tone and evidence mapping.',
    thinkingSteps: [
      'Grouped findings into strategic themes.',
      'Ordered claims from context to recommendation.',
      'Adjusted tone for executive readability.',
      'Attached evidence references to key claims.',
    ],
    followUps: [
      'Shorten this to a one-minute readout?',
      'Reframe for sales pitch tone?',
      'Add stronger call-to-action language?',
    ],
  },
  'visualization-agent': {
    response:
      'I prepared a chart-first package with dashboard and deck storyboard recommendations. Each visual is mapped to a specific narrative claim to keep the final presentation coherent.',
    narrativeSummary:
      'Visualization package prepared across chart, dashboard, and deck outputs.',
    thinkingSteps: [
      'Mapped each insight to the best chart form.',
      'Organized visuals into dashboard sections.',
      'Sequenced charts into slide narrative order.',
      'Prepared export-ready packaging guidance.',
    ],
    followUps: [
      'Generate the dashboard layout next?',
      'Export charts as PNGs?',
      'Build a six-slide client deck?',
    ],
    visualization: {
      chart_type: 'line',
      title: 'Campaign KPI Trend (Indexed)',
      subtitle: 'Awareness, intent, and conversion over 8 weeks',
      series: ['Awareness', 'Intent', 'Conversion'],
      data: [
        { week: 'W1', Awareness: 100, Intent: 100, Conversion: 100 },
        { week: 'W2', Awareness: 104, Intent: 102, Conversion: 101 },
        { week: 'W3', Awareness: 109, Intent: 105, Conversion: 103 },
        { week: 'W4', Awareness: 113, Intent: 109, Conversion: 106 },
        { week: 'W5', Awareness: 117, Intent: 112, Conversion: 108 },
      ],
      x_axis_label: 'Week',
      y_axis_label: 'Index',
    },
  },
  'governance-agent': {
    response:
      'I validated each claim against source evidence, scored confidence, and flagged low-confidence statements for caveat language. The package is ready for approval once flagged items are addressed.',
    narrativeSummary:
      'Governance checks complete with confidence scoring and citation traceability.',
    thinkingSteps: [
      'Matched every insight claim to source rows and waves.',
      'Applied confidence thresholds and methodology checks.',
      'Flagged unsupported or weakly supported statements.',
      'Generated validation-ready audit notes.',
    ],
    followUps: [
      'Review low-confidence claims?',
      'Attach caveat language automatically?',
      'Export governance report?',
    ],
    dataTable: {
      columns: [
        { key: 'claim', label: 'Claim', format: 'text' },
        { key: 'confidence', label: 'Confidence', format: 'text' },
        { key: 'status', label: 'Status', format: 'text' },
      ],
      rows: [
        { claim: 'Gen Z bundle adoption is 1.58x baseline', confidence: 'High', status: 'Approved' },
        { claim: 'UK will outgrow US by next quarter', confidence: 'Medium', status: 'Needs caveat' },
        { claim: 'Campaign ROI will exceed 20%', confidence: 'Low', status: 'Needs evidence' },
      ],
    },
    confidence: 'medium',
  },
  'connector-agent': {
    response:
      'I packaged the outputs for delivery across configured destinations and prepared receipts for each handoff. Failed destinations can be retried with the same payload.',
    narrativeSummary:
      'Delivery payload prepared with per-destination status tracking.',
    thinkingSteps: [
      'Resolved destination capabilities and auth mode.',
      'Bundled summary, links, and attachments.',
      'Executed delivery requests by channel.',
      'Captured receipts and retry-ready failure payloads.',
    ],
    followUps: [
      'Retry failed destinations?',
      'Add email delivery target?',
      'Post a compact summary to Slack?',
    ],
    dataTable: {
      columns: [
        { key: 'destination', label: 'Destination', format: 'text' },
        { key: 'status', label: 'Status', format: 'text' },
        { key: 'latency', label: 'Latency (ms)', format: 'number' },
      ],
      rows: [
        { destination: 'Slack - Insights Channel', status: 'Delivered', latency: 422 },
        { destination: 'Snowflake - Marketing Schema', status: 'Delivered', latency: 811 },
        { destination: 'Client MCP Endpoint', status: 'Retry queued', latency: 1630 },
      ],
    },
  },
  'advisor-agent': {
    response:
      'I monitored KPI movement, detected significant shifts, and generated ranked recommendations with expected ROI impact. Alert thresholds are now active for ongoing tracking.',
    narrativeSummary:
      'Monitoring configured with anomaly detection and ROI-oriented recommendations.',
    thinkingSteps: [
      'Ingested KPI trend history and baseline bands.',
      'Detected threshold breaches and unusual movements.',
      'Estimated business impact and urgency.',
      'Issued ranked action recommendations.',
    ],
    followUps: [
      'Tighten anomaly thresholds?',
      'Compare against last year?',
      'Schedule weekly recommendation digest?',
    ],
    visualization: {
      chart_type: 'line',
      title: 'KPI Alert Trend',
      subtitle: 'Current period versus alert threshold',
      series: ['Current', 'Alert Threshold'],
      data: [
        { period: 'Jan', Current: 4.1, 'Alert Threshold': 5.0 },
        { period: 'Feb', Current: 4.8, 'Alert Threshold': 5.0 },
        { period: 'Mar', Current: 5.7, 'Alert Threshold': 5.0 },
        { period: 'Apr', Current: 6.1, 'Alert Threshold': 5.0 },
      ],
      x_axis_label: 'Month',
      y_axis_label: 'Change %',
    },
  },
}

function getAgentBlueprint(context?: SparkContext): AgentChatBlueprint | undefined {
  if (!context?.agent_id) return undefined
  return AGENT_CHAT_BLUEPRINTS[context.agent_id]
}

export const sparkApi = {
  async chat(data: SparkChatRequest): Promise<SparkChatResponse> {
    await delay(200)

    let conversation = data.conversation_id ? findById(conversations, data.conversation_id) : undefined

    if (!conversation) {
      conversation = {
        id: newId('conv'),
        title: data.message.slice(0, 50),
        messages: [],
        created_at: now(),
        updated_at: now(),
      }
      conversations.unshift(conversation)
    }

    const userMsg: SparkMessage = {
      id: newId('msg'),
      role: 'user' as const,
      content: data.message,
      created_at: now(),
    }
    conversation.messages.push(userMsg)

    const agentBlueprint = getAgentBlueprint(data.context)

    const assistantMsg: SparkMessage = {
      id: newId('msg'),
      role: 'assistant' as const,
      content: generateResponse(data.message, data.context),
      created_at: now(),
      citations: buildCitations(data.context),
      suggested_actions: buildSuggestedActions(data.context),
      narrative_summary: buildNarrativeSummary(data.message, data.context),
      confidence_level: agentBlueprint?.confidence ?? 'high',
      follow_up_questions: buildFollowUps(data.context),
      thinking_steps: buildThinkingSteps(data.context),
      visualization: buildVisualization(data.context),
      data_table: buildDataTable(data.context),
    }
    conversation.messages.push(assistantMsg)
    conversation.updated_at = now()

    return {
      conversation_id: conversation.id,
      message: assistantMsg,
    }
  },

  async getConversations(): Promise<SparkConversation[]> {
    await delay()
    return conversations.map((c) => ({ ...c }))
  },

  async getConversation(id: string): Promise<SparkConversation> {
    await delay()
    const c = findById(conversations, id)
    if (!c) throw new Error(`Conversation ${id} not found`)
    return { ...c }
  },

  async deleteConversation(id: string): Promise<void> {
    await delay()
    const idx = conversations.findIndex((c) => c.id === id)
    if (idx !== -1) conversations.splice(idx, 1)
  },

  async renameConversation(id: string, title: string): Promise<SparkConversation> {
    await delay()
    const c = findById(conversations, id)
    if (!c) throw new Error(`Conversation ${id} not found`)
    c.title = title
    c.updated_at = now()
    return { ...c }
  },

  async getInsights(): Promise<Array<{ id: string; title: string; summary: string; category: string; created_at: string }>> {
    await delay()
    return [
      { id: 'ins-1', title: 'Social Media Shift', summary: 'TikTok surpassed Instagram among 16-24s in Q4 2024', category: 'media', created_at: '2025-01-15T10:00:00Z' },
      { id: 'ins-2', title: 'E-commerce Growth', summary: 'Online purchase frequency increased 12% YoY', category: 'commerce', created_at: '2025-01-14T10:00:00Z' },
      { id: 'ins-3', title: 'Streaming Consolidation', summary: 'Average streaming subscriptions decreased from 3.2 to 2.8', category: 'media', created_at: '2025-01-13T10:00:00Z' },
      { id: 'ins-4', title: 'AI Adoption Surge', summary: 'AI tool usage grew 50% among professionals aged 25-44', category: 'technology', created_at: '2025-01-12T10:00:00Z' },
    ]
  },
}

function buildCitations(context?: SparkChatRequest['context']) {
  const dataset = context?.agent_id ? `Agent ${context.agent_name ?? context.agent_id}` : 'GWI Core Q4 2024'
  return [
    {
      text: 'Based on GWI core data and validated comparisons.',
      source: dataset,
      confidence_level: 'high' as const,
      dataset_id: context?.audience_id ?? 'ds_core',
      wave_id: context?.wave_ids?.[0],
      sample_size: 45200,
      methodology_note: 'Weighted to internet population with significance filtering at 95% confidence.',
    },
  ]
}

function buildNarrativeSummary(message: string, context?: SparkChatRequest['context']) {
  const blueprint = getAgentBlueprint(context)
  if (blueprint) return blueprint.narrativeSummary
  return `Summary: ${message.slice(0, 80)}${message.length > 80 ? '…' : ''}`
}

function buildFollowUps(context?: SparkChatRequest['context']) {
  const blueprint = getAgentBlueprint(context)
  if (blueprint) return blueprint.followUps
  if (!context?.agent_id) return ['Compare to last quarter?', 'Create a chart?', 'Export a brief?']
  return ['Next steps?']
}

function buildThinkingSteps(context?: SparkChatRequest['context']) {
  return getAgentBlueprint(context)?.thinkingSteps
}

function buildVisualization(context?: SparkChatRequest['context']) {
  return getAgentBlueprint(context)?.visualization
}

function buildDataTable(context?: SparkChatRequest['context']) {
  return getAgentBlueprint(context)?.dataTable
}

function buildSuggestedActions(context?: SparkChatRequest['context']) {
  if (context?.agent_id === 'brief-interpreter') {
    return [
      { type: 'navigate' as const, label: 'Open Workflow', payload: { path: '/app/canvas' } },
      { type: 'create_audience' as const, label: 'Start Audience Builder', payload: { audience_id: '' } },
    ]
  }
  if (context?.agent_id === 'workflow-orchestrator') {
    return [
      { type: 'navigate' as const, label: 'Open Flow Runner', payload: { path: '/app/agent-spark' } },
      { type: 'navigate' as const, label: 'Open Workspace Settings', payload: { path: '/app/projects' } },
    ]
  }
  if (context?.agent_id === 'data-harmonizer') {
    return [
      { type: 'show_data' as const, label: 'Inspect Harmonized Table', payload: { crosstab_id: '' } },
      { type: 'create_audience' as const, label: 'Build From Harmonized Data', payload: { audience_id: '' } },
    ]
  }
  if (context?.agent_id === 'audience-profiler') {
    return [
      { type: 'create_audience' as const, label: 'Open Audience', payload: { audience_id: '' } },
      { type: 'create_chart' as const, label: 'Chart Audience', payload: { chart_id: '' } },
    ]
  }
  if (context?.agent_id === 'crosstab-analyst') {
    return [
      { type: 'show_data' as const, label: 'Open Crosstab', payload: { crosstab_id: '' } },
      { type: 'create_chart' as const, label: 'Visualize Crosstab', payload: { chart_id: '' } },
    ]
  }
  if (context?.agent_id === 'narrative-agent') {
    return [
      { type: 'export_report' as const, label: 'Export Narrative', payload: {} },
      { type: 'create_dashboard' as const, label: 'Build Story Dashboard', payload: {} },
    ]
  }
  if (context?.agent_id === 'visualization-agent') {
    return [
      { type: 'create_dashboard' as const, label: 'Create Dashboard', payload: {} },
      { type: 'export_report' as const, label: 'Export Deck', payload: {} },
    ]
  }
  if (context?.agent_id === 'governance-agent') {
    return [
      { type: 'navigate' as const, label: 'Open Audit Log', payload: { path: '/app/account-settings' } },
      { type: 'export_report' as const, label: 'Export Validation', payload: {} },
    ]
  }
  if (context?.agent_id === 'advisor-agent') {
    return [
      { type: 'navigate' as const, label: 'Set Alerts', payload: { path: '/app/dashboards' } },
      { type: 'show_data' as const, label: 'Review Insights', payload: { crosstab_id: '' } },
    ]
  }
  if (context?.agent_id === 'connector-agent') {
    return [
      {
        type: 'deliver_output' as const,
        label: 'Deliver Output',
        payload: {
          destination_ids: ['conn_slack_1', 'conn_zapier_1'],
        },
      },
      { type: 'export_report' as const, label: 'Export Bundle', payload: {} },
    ]
  }
  if (context?.chart_id) {
    return [
      { type: 'create_chart' as const, label: 'Open This Chart', payload: { chart_id: context.chart_id } },
      { type: 'show_data' as const, label: 'View Chart as Crosstab', payload: { crosstab_id: context.crosstab_id ?? '' } },
    ]
  }
  if (context?.crosstab_id) {
    return [
      { type: 'show_data' as const, label: 'Open This Crosstab', payload: { crosstab_id: context.crosstab_id } },
      { type: 'create_chart' as const, label: 'Chart This Data', payload: { chart_id: '' } },
    ]
  }
  if (context?.audience_id) {
    return [
      { type: 'create_audience' as const, label: 'Edit This Audience', payload: { audience_id: context.audience_id } },
      { type: 'create_chart' as const, label: 'Chart This Audience', payload: { chart_id: '' } },
    ]
  }
  if (context?.dashboard_id) {
    return [
      { type: 'navigate' as const, label: 'Back to Dashboard', payload: { path: `/app/dashboards/${context.dashboard_id}` } },
      { type: 'create_chart' as const, label: 'Add a Chart', payload: { chart_id: '' } },
    ]
  }
  // No context — generic actions
  return [
    { type: 'create_chart' as const, label: 'Create a Chart', payload: {} },
    { type: 'show_data' as const, label: 'Explore Data', payload: {} },
  ]
}

function generateResponse(message: string, context?: SparkChatRequest['context']): string {
  const lower = message.toLowerCase()
  const blueprint = getAgentBlueprint(context)

  const agentPrefix = context?.agent_name
    ? `**${context.agent_name}** responding. `
    : ''

  // Context-aware prefix so the user can see Spark knows what they were looking at
  const contextPrefix = context?.chart_id
    ? `I can see you're working with chart **${context.chart_id}**${context.wave_ids?.length ? ` (wave: ${context.wave_ids.join(', ')})` : ''}${context.location_ids?.length ? ` in ${context.location_ids.join(', ')}` : ''}. `
    : context?.crosstab_id
      ? `I can see you're viewing crosstab **${context.crosstab_id}**${context.wave_ids?.length ? ` (wave: ${context.wave_ids.join(', ')})` : ''}. `
      : context?.dashboard_id
        ? `I can see you're on dashboard **${context.dashboard_id}**. `
        : context?.audience_id
          ? `I can see you're working with audience **${context.audience_id}**. `
          : ''

  if (blueprint) {
    return `${agentPrefix}${contextPrefix}${blueprint.response}`
  }

  if (lower.includes('social media') || lower.includes('social platform')) {
    return agentPrefix + contextPrefix + 'Based on Q4 2024 data, social media usage continues to grow across all demographics. YouTube leads with 88% penetration, followed by Facebook (62%), Instagram (51%), and TikTok (38%). The most notable trend is TikTok\'s rapid growth among 16-24 year olds, reaching 52% in that age group.\n\nWould you like me to create a chart showing platform usage by age group?'
  }
  if (lower.includes('audience') || lower.includes('segment')) {
    return contextPrefix + 'I can help you build an audience segment. Our data covers 45,200 respondents across 20 markets in Q4 2024. You can combine demographic filters (age, gender, income) with behavioral data (media usage, purchase behavior, attitudes) to create precise audience definitions.\n\nWhat criteria would you like to use for your audience?'
  }
  if (lower.includes('trend') || lower.includes('change')) {
    return contextPrefix + 'Looking at quarterly trends in our data:\n\n- **Social media time** has increased 8% YoY\n- **Streaming subscriptions** average 2.8 per household (up from 2.4)\n- **AI tool adoption** has grown from 28% to 42% in the past year\n- **E-commerce** now accounts for 31% of retail purchases\n\nWould you like me to dive deeper into any of these trends?'
  }

  if (contextPrefix) {
    return contextPrefix + `Here are the key findings related to your query:\n\n1. **Primary Trend**: The data shows significant shifts in consumer behavior across digital platforms\n2. **Age Differences**: Younger demographics (16-34) show markedly different patterns from 35+\n3. **Market Variation**: US and UK markets lead in adoption, while emerging markets show fastest growth\n\nWould you like me to dive deeper into this data?`
  }

  return `${agentPrefix}Great question! Based on the GWI Q4 2024 dataset covering 45,200 respondents across 20 markets, I can provide detailed insights on this topic.\n\nHere are the key findings related to your query:\n\n1. **Primary Trend**: The data shows significant shifts in consumer behavior across digital platforms\n2. **Age Differences**: Younger demographics (16-34) show markedly different patterns from 35+\n3. **Market Variation**: US and UK markets lead in adoption, while emerging markets show fastest growth\n\nWould you like me to create a visualization, build an audience segment, or explore specific data points?`
}
