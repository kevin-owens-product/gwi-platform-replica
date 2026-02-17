export type StarterTemplateCategory = 'Discover' | 'Build' | 'Validate' | 'Deliver'

export type StarterContextType =
  | 'general'
  | 'chart'
  | 'crosstab'
  | 'audience'
  | 'dashboard'
  | 'report'
  | 'canvas'

export interface StarterTemplatePlaceholder {
  key: string
  label: string
  defaultValue: string
}

export interface AgentStarterTemplate {
  id: string
  agentId?: string
  title: string
  prompt: string
  expectedOutcome: string
  category: StarterTemplateCategory
  tags: string[]
  contextTypes: StarterContextType[]
  placeholders: StarterTemplatePlaceholder[]
}

export const AGENT_STARTER_TEMPLATE_CATEGORIES: StarterTemplateCategory[] = [
  'Discover',
  'Build',
  'Validate',
  'Deliver',
]

export const agentStarterTemplates: AgentStarterTemplate[] = [
  {
    id: 'tmpl-brief-interpret-structured',
    agentId: 'brief-interpreter',
    title: 'Interpret campaign brief',
    prompt:
      'Interpret this campaign brief for {{industry}} in {{markets}} and extract objective, target audience, KPIs, and required outputs.',
    expectedOutcome: 'Structured brief, assumptions list, and unresolved questions.',
    category: 'Discover',
    tags: ['brief', 'scope', 'planning'],
    contextTypes: ['general', 'canvas', 'report'],
    placeholders: [
      { key: 'industry', label: 'Industry', defaultValue: 'streaming media' },
      { key: 'markets', label: 'Markets', defaultValue: 'US and UK' },
    ],
  },
  {
    id: 'tmpl-brief-clarification-checklist',
    agentId: 'brief-interpreter',
    title: 'Generate clarification checklist',
    prompt:
      'Generate a clarification checklist for this brief and rank each missing input by risk to execution quality.',
    expectedOutcome: 'Prioritized checklist with recommended defaults and approvals.',
    category: 'Validate',
    tags: ['brief', 'risk', 'checklist'],
    contextTypes: ['general', 'canvas'],
    placeholders: [],
  },
  {
    id: 'tmpl-workflow-build-execution',
    agentId: 'workflow-orchestrator',
    title: 'Build execution workflow',
    prompt:
      'Build an execution workflow for {{initiative}} with step owners, dependencies, quality gates, and output handoffs.',
    expectedOutcome: 'Runnable flow map with clear ownership and gating points.',
    category: 'Build',
    tags: ['workflow', 'orchestration', 'owners'],
    contextTypes: ['general', 'canvas', 'report'],
    placeholders: [
      { key: 'initiative', label: 'Initiative', defaultValue: 'Q2 acquisition campaign' },
    ],
  },
  {
    id: 'tmpl-workflow-run-status',
    agentId: 'workflow-orchestrator',
    title: 'Run and summarize statuses',
    prompt:
      'Run the configured workflow and summarize status by step, including blockers, retries, and next actions.',
    expectedOutcome: 'Execution timeline and blocker summary.',
    category: 'Deliver',
    tags: ['workflow', 'run', 'status'],
    contextTypes: ['general', 'canvas'],
    placeholders: [],
  },
  {
    id: 'tmpl-data-map-taxonomy',
    agentId: 'data-harmonizer',
    title: 'Map schemas to GWI taxonomy',
    prompt:
      'Map CRM, analytics, and ad-platform fields to GWI taxonomy, then flag field conflicts and normalization gaps.',
    expectedOutcome: 'Field mapping dictionary and conflict log.',
    category: 'Build',
    tags: ['data', 'taxonomy', 'normalization'],
    contextTypes: ['general', 'audience', 'crosstab'],
    placeholders: [],
  },
  {
    id: 'tmpl-data-dedupe-weighting',
    agentId: 'data-harmonizer',
    title: 'Resolve dedupe and weighting',
    prompt:
      'Apply deduplication and source weighting rules for overlapping records, then publish a provenance-ready harmonized dataset.',
    expectedOutcome: 'Harmonized dataset with quality and lineage notes.',
    category: 'Validate',
    tags: ['data', 'dedupe', 'provenance'],
    contextTypes: ['general', 'crosstab', 'audience'],
    placeholders: [],
  },
  {
    id: 'tmpl-audience-build-from-objective',
    agentId: 'audience-profiler',
    title: 'Build segment from objective',
    prompt:
      'Build an audience for {{target_group}} in {{markets}} aligned to {{business_goal}}, then estimate reach by market.',
    expectedOutcome: 'Audience expression and size estimates.',
    category: 'Build',
    tags: ['audience', 'segment', 'reach'],
    contextTypes: ['general', 'audience', 'chart'],
    placeholders: [
      { key: 'target_group', label: 'Target group', defaultValue: 'Gen Z creators' },
      { key: 'markets', label: 'Markets', defaultValue: 'US, UK, Germany' },
      { key: 'business_goal', label: 'Business goal', defaultValue: 'subscription growth' },
    ],
  },
  {
    id: 'tmpl-audience-compare-and-save',
    agentId: 'audience-profiler',
    title: 'Compare against baseline',
    prompt:
      'Compare this audience to all internet users, highlight top lifts, and save a reusable persona summary.',
    expectedOutcome: 'Lift highlights and saved persona profile.',
    category: 'Validate',
    tags: ['audience', 'baseline', 'persona'],
    contextTypes: ['audience', 'crosstab', 'chart'],
    placeholders: [],
  },
  {
    id: 'tmpl-crosstab-run-significance',
    agentId: 'crosstab-analyst',
    title: 'Run crosstab with significance',
    prompt:
      'Run a crosstab for {{metric_focus}} by age and market, then annotate significance and index movement.',
    expectedOutcome: 'Significance-aware crosstab with top lifts.',
    category: 'Build',
    tags: ['crosstab', 'significance', 'index'],
    contextTypes: ['general', 'crosstab', 'audience'],
    placeholders: [
      { key: 'metric_focus', label: 'Metric focus', defaultValue: 'streaming bundle adoption' },
    ],
  },
  {
    id: 'tmpl-crosstab-highlight-meaningful',
    agentId: 'crosstab-analyst',
    title: 'Highlight meaningful lifts only',
    prompt:
      'Filter this crosstab to statistically meaningful lifts only and explain which findings should be ignored as noise.',
    expectedOutcome: 'Reduced insight set with confidence notes.',
    category: 'Validate',
    tags: ['crosstab', 'confidence', 'analysis'],
    contextTypes: ['crosstab', 'chart', 'dashboard'],
    placeholders: [],
  },
  {
    id: 'tmpl-narrative-write-exec',
    agentId: 'narrative-agent',
    title: 'Write executive summary',
    prompt:
      'Write an executive summary from these findings for {{stakeholder}}, with three key takeaways and clear next actions.',
    expectedOutcome: 'Concise stakeholder-ready narrative.',
    category: 'Discover',
    tags: ['narrative', 'summary', 'stakeholder'],
    contextTypes: ['general', 'report', 'dashboard', 'chart'],
    placeholders: [
      { key: 'stakeholder', label: 'Stakeholder', defaultValue: 'senior leadership' },
    ],
  },
  {
    id: 'tmpl-narrative-reframe-client',
    agentId: 'narrative-agent',
    title: 'Reframe for client pitch',
    prompt:
      'Reframe this narrative for a client-facing pitch, keep confidence/citation language, and tighten it to six slide beats.',
    expectedOutcome: 'Client pitch storyline with evidence alignment.',
    category: 'Deliver',
    tags: ['narrative', 'pitch', 'slides'],
    contextTypes: ['report', 'dashboard', 'chart'],
    placeholders: [],
  },
  {
    id: 'tmpl-visualization-chart-pack',
    agentId: 'visualization-agent',
    title: 'Create chart pack',
    prompt:
      'Create a chart pack from the current insights with recommended chart types, annotations, and export priorities.',
    expectedOutcome: 'Chart pack plan ready for export.',
    category: 'Build',
    tags: ['visualization', 'charts', 'export'],
    contextTypes: ['general', 'chart', 'crosstab', 'dashboard'],
    placeholders: [],
  },
  {
    id: 'tmpl-visualization-slide-story',
    agentId: 'visualization-agent',
    title: 'Draft six-slide storyline',
    prompt:
      'Draft a six-slide storyline with one key chart per slide and speaker notes for a {{audience_type}} audience.',
    expectedOutcome: 'Storyboard with chart-to-message mapping.',
    category: 'Deliver',
    tags: ['visualization', 'deck', 'storyboard'],
    contextTypes: ['dashboard', 'report', 'chart'],
    placeholders: [
      { key: 'audience_type', label: 'Audience type', defaultValue: 'client executive' },
    ],
  },
  {
    id: 'tmpl-governance-citations-all-claims',
    agentId: 'governance-agent',
    title: 'Attach citations to all claims',
    prompt:
      'Attach source citations and confidence labels to every claim in this output, and list any unsupported statements.',
    expectedOutcome: 'Citation bundle and unsupported-claim list.',
    category: 'Validate',
    tags: ['governance', 'citations', 'confidence'],
    contextTypes: ['report', 'dashboard', 'chart', 'crosstab'],
    placeholders: [],
  },
  {
    id: 'tmpl-governance-flag-low-confidence',
    agentId: 'governance-agent',
    title: 'Flag low-confidence insights',
    prompt:
      'Review insights below {{confidence_threshold}} confidence and propose caveat language or removal recommendations.',
    expectedOutcome: 'Governance report with action recommendations.',
    category: 'Validate',
    tags: ['governance', 'risk', 'compliance'],
    contextTypes: ['report', 'dashboard', 'crosstab'],
    placeholders: [
      { key: 'confidence_threshold', label: 'Confidence threshold', defaultValue: 'medium' },
    ],
  },
  {
    id: 'tmpl-connector-package-slack-bi',
    agentId: 'connector-agent',
    title: 'Package for Slack + BI',
    prompt:
      'Package this output for Slack and BI delivery, including summary, links, and attachment metadata.',
    expectedOutcome: 'Delivery payload preview for connected destinations.',
    category: 'Deliver',
    tags: ['connector', 'delivery', 'slack', 'bi'],
    contextTypes: ['dashboard', 'report', 'chart', 'general'],
    placeholders: [],
  },
  {
    id: 'tmpl-connector-deliver-and-receipts',
    agentId: 'connector-agent',
    title: 'Deliver and summarize receipts',
    prompt:
      'Deliver this output to configured destinations and summarize delivery receipts, failures, and retries.',
    expectedOutcome: 'Delivery status summary with retry actions.',
    category: 'Deliver',
    tags: ['connector', 'receipts', 'retry'],
    contextTypes: ['dashboard', 'report', 'chart', 'general'],
    placeholders: [],
  },
  {
    id: 'tmpl-advisor-configure-alerts',
    agentId: 'advisor-agent',
    title: 'Configure KPI alerts',
    prompt:
      'Configure alerts for {{kpi_set}} with a {{threshold}} movement threshold and weekly digest cadence.',
    expectedOutcome: 'Saved alert policy and monitoring cadence.',
    category: 'Build',
    tags: ['advisor', 'alerts', 'kpi'],
    contextTypes: ['dashboard', 'report', 'general'],
    placeholders: [
      { key: 'kpi_set', label: 'KPI set', defaultValue: 'awareness, consideration, conversion' },
      { key: 'threshold', label: 'Threshold', defaultValue: '5%' },
    ],
  },
  {
    id: 'tmpl-advisor-next-actions-roi',
    agentId: 'advisor-agent',
    title: 'Recommend next actions',
    prompt:
      'Analyze recent KPI shifts and recommend top next actions with expected ROI impact and confidence levels.',
    expectedOutcome: 'Prioritized action plan with expected impact.',
    category: 'Discover',
    tags: ['advisor', 'roi', 'recommendations'],
    contextTypes: ['dashboard', 'report', 'chart', 'general'],
    placeholders: [],
  },
]

export const CROSS_ROLE_TEMPLATE_IDS: string[] = [
  'tmpl-brief-interpret-structured',
  'tmpl-audience-build-from-objective',
  'tmpl-crosstab-run-significance',
  'tmpl-narrative-write-exec',
  'tmpl-governance-citations-all-claims',
  'tmpl-advisor-next-actions-roi',
]

export function getStarterTemplateById(id: string): AgentStarterTemplate | undefined {
  return agentStarterTemplates.find((template) => template.id === id)
}
