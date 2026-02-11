import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  Workflow,
  Database,
  Users,
  Table2,
  BookOpen,
  LayoutGrid,
  Shield,
  Plug,
  Bell,
  TrendingUp,
  Lightbulb,
  Sliders,
} from 'lucide-react'

export type AgentCategory =
  | 'Orchestration'
  | 'Data Harmonization'
  | 'Audience & Profiling'
  | 'Analysis & Crosstab'
  | 'Narrative & Knowledge'
  | 'Visualization & Packaging'
  | 'Governance & Compliance'
  | 'Delivery & Connectors'
  | 'Proactivity & ROI'

export interface Agent {
  id: string
  name: string
  description: string
  category: AgentCategory
  icon: LucideIcon
  iconColor: string
  iconBg: string
  capabilities: string[]
  status?: 'popular' | 'new'
  examplePrompt: string
  suggestedPrompts: { icon: LucideIcon; text: string }[]
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  'Orchestration',
  'Data Harmonization',
  'Audience & Profiling',
  'Analysis & Crosstab',
  'Narrative & Knowledge',
  'Visualization & Packaging',
  'Governance & Compliance',
  'Delivery & Connectors',
  'Proactivity & ROI',
]

export const agents: Agent[] = [
  {
    id: 'brief-interpreter',
    name: 'Brief Interpreter',
    description: 'Translates loose briefs into structured objectives and outputs.',
    category: 'Orchestration',
    icon: Sparkles,
    iconColor: '#ff0077',
    iconBg: '#fff0f7',
    capabilities: ['Intent classification', 'Objective extraction', 'Output routing'],
    status: 'popular',
    examplePrompt: 'Turn this brief into a guided workflow and outline the outputs.',
    suggestedPrompts: [
      { icon: Sparkles, text: 'Classify this brief and extract audience + market targets.' },
      { icon: Workflow, text: 'Recommend a workflow for a Q2 streaming campaign brief.' },
    ],
  },
  {
    id: 'workflow-orchestrator',
    name: 'Workflow Orchestrator',
    description: 'Creates a workspace and sequences the right tools and agents.',
    category: 'Orchestration',
    icon: Workflow,
    iconColor: '#7c3aed',
    iconBg: '#ede9fe',
    capabilities: ['Flow orchestration', 'Workspace creation', 'Tool sequencing'],
    status: 'new',
    examplePrompt: 'Spin up a project workspace and orchestrate analysis steps.',
    suggestedPrompts: [
      { icon: Workflow, text: 'Create a workflow for an ad sales pitch with outputs.' },
      { icon: LayoutGrid, text: 'Route outputs to dashboards and reports.' },
    ],
  },
  {
    id: 'data-harmonizer',
    name: 'Data Harmonizer',
    description: 'Merges GWI, first-party, and external data with provenance.',
    category: 'Data Harmonization',
    icon: Database,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    capabilities: ['Data linking', 'Provenance', 'Normalization'],
    examplePrompt: 'Combine GWI and customer data for a unified analysis context.',
    suggestedPrompts: [
      { icon: Database, text: 'Normalize first-party segments against GWI taxonomy.' },
      { icon: Sliders, text: 'Configure source weighting and deduplication rules.' },
    ],
  },
  {
    id: 'audience-profiler',
    name: 'Audience Profiler',
    description: 'Builds, validates, and sizes target audiences.',
    category: 'Audience & Profiling',
    icon: Users,
    iconColor: '#0891b2',
    iconBg: '#ecfeff',
    capabilities: ['Audience builder', 'Persona mapping', 'Validation'],
    examplePrompt: 'Profile Gen Z creators in US/UK and surface key behaviors.',
    suggestedPrompts: [
      { icon: Users, text: 'Build an audience for hybrid workers with high streaming usage.' },
      { icon: Users, text: 'Validate a premium tech buyers segment.' },
    ],
  },
  {
    id: 'crosstab-analyst',
    name: 'Crosstab Analyst',
    description: 'Runs advanced crosstabs, comparisons, and significance checks.',
    category: 'Analysis & Crosstab',
    icon: Table2,
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    capabilities: ['Crosstab builder', 'Statistical significance', 'Comparison'],
    examplePrompt: 'Compare streaming bundle adoption by age and market.',
    suggestedPrompts: [
      { icon: Table2, text: 'Run a crosstab for AI productivity adoption by industry.' },
      { icon: TrendingUp, text: 'Identify lifts between Gen Z and Millennials for subscriptions.' },
    ],
  },
  {
    id: 'narrative-agent',
    name: 'Narrative Agent',
    description: 'Translates complex data into readable, client-ready narratives.',
    category: 'Narrative & Knowledge',
    icon: BookOpen,
    iconColor: '#9333ea',
    iconBg: '#faf5ff',
    capabilities: ['Insight narration', 'Tone of voice', 'Contextual framing'],
    examplePrompt: 'Summarize findings into a 3-slide narrative for senior leadership.',
    suggestedPrompts: [
      { icon: BookOpen, text: 'Write a narrative summary with confidence and citations.' },
      { icon: Lightbulb, text: 'Suggest the key takeaways for a client pitch.' },
    ],
  },
  {
    id: 'visualization-agent',
    name: 'Visualization Agent',
    description: 'Builds charts, dashboards, and decks for delivery.',
    category: 'Visualization & Packaging',
    icon: LayoutGrid,
    iconColor: '#0f172a',
    iconBg: '#e2e8f0',
    capabilities: ['Charts', 'Dashboards', 'Canvas decks'],
    examplePrompt: 'Create a dashboard and deck from this insight summary.',
    suggestedPrompts: [
      { icon: LayoutGrid, text: 'Generate a chart pack for this audience analysis.' },
      { icon: LayoutGrid, text: 'Build a 6-slide deck for a sales pitch.' },
    ],
  },
  {
    id: 'governance-agent',
    name: 'Governance Agent',
    description: 'Validates insights with traceable sources and compliance checks.',
    category: 'Governance & Compliance',
    icon: Shield,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    capabilities: ['Citations', 'Compliance', 'Audit trail'],
    examplePrompt: 'Verify that this insight is traceable to source data.',
    suggestedPrompts: [
      { icon: Shield, text: 'Add citations to all claims in the report.' },
      { icon: Shield, text: 'Flag insights that fall below confidence thresholds.' },
    ],
  },
  {
    id: 'connector-agent',
    name: 'Connector Agent',
    description: 'Delivers outputs to MCP, BI tools, and client systems.',
    category: 'Delivery & Connectors',
    icon: Plug,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    capabilities: ['MCP delivery', 'Webhook export', 'BI integrations'],
    examplePrompt: 'Push this dashboard to Snowflake and Slack.',
    suggestedPrompts: [
      { icon: Plug, text: 'Send the report to the client workspace.' },
      { icon: Plug, text: 'Publish a summary to Slack with attachments.' },
    ],
  },
  {
    id: 'advisor-agent',
    name: 'Advisor Agent',
    description: 'Monitors change and recommends next steps.',
    category: 'Proactivity & ROI',
    icon: Bell,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    capabilities: ['Anomaly alerts', 'Trend tracking', 'ROI feedback'],
    examplePrompt: 'Notify me when campaign KPIs shift by more than 5%.',
    suggestedPrompts: [
      { icon: TrendingUp, text: 'Track changes in audience sentiment over time.' },
      { icon: Bell, text: 'Set alerts for significant movement in brand awareness.' },
    ],
  },
]

export function getFeaturedAgents(count: number): Agent[] {
  return agents.slice(0, count)
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find((agent) => agent.id === id)
}
