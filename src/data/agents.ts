import type { LucideIcon } from 'lucide-react'
import type { StarterTemplateCategory } from './agent-templates'
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

export interface AgentDemoWorkflowStep {
  id: string
  name: string
  description: string
  deliverable: string
}

export interface AgentDemoDeliverable {
  id: string
  name: string
  type: string
  description: string
}

export interface AgentDemoChatPrompt {
  id: string
  title: string
  prompt: string
  expectedOutcome: string
}

export interface AgentDemoBlueprint {
  workflowName: string
  workflowSummary: string
  steps: AgentDemoWorkflowStep[]
  deliverables: AgentDemoDeliverable[]
  chatPrompts: AgentDemoChatPrompt[]
}

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
  starterTemplateIds?: string[]
  defaultStarterCategory?: StarterTemplateCategory
  demo: AgentDemoBlueprint
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
    demo: {
      workflowName: 'Brief-to-Plan Workflow',
      workflowSummary: 'Turns raw client language into a precise research and delivery plan.',
      steps: [
        {
          id: 'bi-step-1',
          name: 'Parse Brief',
          description: 'Identify objective, audience, market, timeline, and required outputs.',
          deliverable: 'Structured brief JSON',
        },
        {
          id: 'bi-step-2',
          name: 'Resolve Ambiguities',
          description: 'Flag missing constraints and propose default assumptions.',
          deliverable: 'Clarification checklist',
        },
        {
          id: 'bi-step-3',
          name: 'Map Workstreams',
          description: 'Route analysis, audience, narrative, and delivery tasks to agents.',
          deliverable: 'Agent routing map',
        },
        {
          id: 'bi-step-4',
          name: 'Confirm Scope',
          description: 'Lock acceptance criteria and output formats for execution.',
          deliverable: 'Signed-off scope note',
        },
      ],
      deliverables: [
        {
          id: 'bi-del-1',
          name: 'Structured Brief',
          type: 'report',
          description: 'Normalized objective, target segments, markets, and KPI definitions.',
        },
        {
          id: 'bi-del-2',
          name: 'Execution Checklist',
          type: 'insight',
          description: 'Step-by-step sequence with dependencies and owner handoffs.',
        },
        {
          id: 'bi-del-3',
          name: 'Output Plan',
          type: 'dashboard',
          description: 'Final output targets including narrative, charts, and distribution.',
        },
      ],
      chatPrompts: [
        {
          id: 'bi-chat-1',
          title: 'Parse a brief',
          prompt: 'Interpret this campaign brief and extract objective, audience, markets, and outputs.',
          expectedOutcome: 'Clear brief schema and unresolved questions list.',
        },
        {
          id: 'bi-chat-2',
          title: 'Show workflow',
          prompt: 'Build a workflow with step owners and expected artifacts.',
          expectedOutcome: 'Ordered execution plan with handoffs.',
        },
        {
          id: 'bi-chat-3',
          title: 'Approve scope',
          prompt: 'Summarize final scope in one approval-ready note.',
          expectedOutcome: 'Concise scope summary for sign-off.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Execution Orchestration',
      workflowSummary: 'Builds a runnable workflow from approved scope.',
      steps: [
        {
          id: 'wo-step-1',
          name: 'Create Workspace',
          description: 'Provision project, data context, and permissions.',
          deliverable: 'Workspace ID and access policy',
        },
        {
          id: 'wo-step-2',
          name: 'Sequence Agents',
          description: 'Define dependency graph and execution order.',
          deliverable: 'Flow DAG',
        },
        {
          id: 'wo-step-3',
          name: 'Set Gates',
          description: 'Insert governance and quality checkpoints.',
          deliverable: 'Approval gate matrix',
        },
        {
          id: 'wo-step-4',
          name: 'Launch Run',
          description: 'Trigger run and monitor step completion.',
          deliverable: 'Run timeline',
        },
      ],
      deliverables: [
        {
          id: 'wo-del-1',
          name: 'Workflow Plan',
          type: 'report',
          description: 'Complete orchestration graph with dependencies and SLAs.',
        },
        {
          id: 'wo-del-2',
          name: 'Execution Log',
          type: 'dataset',
          description: 'Run-level tracking events for each workflow stage.',
        },
        {
          id: 'wo-del-3',
          name: 'Handoff Packet',
          type: 'insight',
          description: 'Next-step prompts and destinations for downstream teams.',
        },
      ],
      chatPrompts: [
        {
          id: 'wo-chat-1',
          title: 'Setup workspace',
          prompt: 'Create a project workspace and route each phase to the right agent.',
          expectedOutcome: 'Provisioned workspace plan with owners.',
        },
        {
          id: 'wo-chat-2',
          title: 'Gate controls',
          prompt: 'Add governance checkpoints after analysis and before delivery.',
          expectedOutcome: 'Explicit approval and compliance controls.',
        },
        {
          id: 'wo-chat-3',
          title: 'Run workflow',
          prompt: 'Run the workflow and summarize completion status by step.',
          expectedOutcome: 'Execution summary with statuses and blockers.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Unified Data Preparation',
      workflowSummary: 'Builds a trustable, analysis-ready dataset with lineage.',
      steps: [
        {
          id: 'dh-step-1',
          name: 'Profile Sources',
          description: 'Inspect schemas, freshness, and quality across all sources.',
          deliverable: 'Source profile report',
        },
        {
          id: 'dh-step-2',
          name: 'Normalize Dimensions',
          description: 'Map first-party and external fields to GWI taxonomy.',
          deliverable: 'Field mapping dictionary',
        },
        {
          id: 'dh-step-3',
          name: 'Resolve Conflicts',
          description: 'Apply deduplication and weighting logic for collisions.',
          deliverable: 'Conflict resolution log',
        },
        {
          id: 'dh-step-4',
          name: 'Publish Dataset',
          description: 'Generate harmonized dataset and lineage documentation.',
          deliverable: 'Harmonized dataset package',
        },
      ],
      deliverables: [
        {
          id: 'dh-del-1',
          name: 'Harmonized Dataset',
          type: 'dataset',
          description: 'Unified analysis table keyed to normalized definitions.',
        },
        {
          id: 'dh-del-2',
          name: 'Provenance Log',
          type: 'report',
          description: 'Traceability for each metric back to source datasets.',
        },
        {
          id: 'dh-del-3',
          name: 'Quality Scorecard',
          type: 'insight',
          description: 'Completeness, consistency, and confidence diagnostics.',
        },
      ],
      chatPrompts: [
        {
          id: 'dh-chat-1',
          title: 'Map schemas',
          prompt: 'Map CRM and campaign fields to the GWI taxonomy and flag conflicts.',
          expectedOutcome: 'Schema map with mismatch list.',
        },
        {
          id: 'dh-chat-2',
          title: 'Set rules',
          prompt: 'Apply dedupe and source weighting rules for overlapping records.',
          expectedOutcome: 'Documented harmonization logic.',
        },
        {
          id: 'dh-chat-3',
          title: 'Publish data',
          prompt: 'Publish the harmonized dataset with provenance notes.',
          expectedOutcome: 'Ready dataset and lineage artifact.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Audience Discovery Workflow',
      workflowSummary: 'Designs and validates addressable segments with personas.',
      steps: [
        {
          id: 'ap-step-1',
          name: 'Draft Segment Logic',
          description: 'Convert brief goals into audience criteria and filters.',
          deliverable: 'Audience expression',
        },
        {
          id: 'ap-step-2',
          name: 'Estimate Reach',
          description: 'Size segment by market, age, and confidence boundaries.',
          deliverable: 'Reach estimate table',
        },
        {
          id: 'ap-step-3',
          name: 'Build Personas',
          description: 'Create persona narratives from top indexed behaviors.',
          deliverable: 'Persona cards',
        },
        {
          id: 'ap-step-4',
          name: 'Validate Against Baseline',
          description: 'Compare audience fit versus benchmark audiences.',
          deliverable: 'Validation snapshot',
        },
      ],
      deliverables: [
        {
          id: 'ap-del-1',
          name: 'Audience Definition',
          type: 'dataset',
          description: 'Reusable audience expression with filter metadata.',
        },
        {
          id: 'ap-del-2',
          name: 'Persona Summary',
          type: 'insight',
          description: 'Top traits, motivations, and media behaviors.',
        },
        {
          id: 'ap-del-3',
          name: 'Reach & Fit Report',
          type: 'report',
          description: 'Market-level size and quality diagnostics.',
        },
      ],
      chatPrompts: [
        {
          id: 'ap-chat-1',
          title: 'Build segment',
          prompt: 'Build a Gen Z creator audience in US and UK with streaming affinity.',
          expectedOutcome: 'Audience expression and initial size.',
        },
        {
          id: 'ap-chat-2',
          title: 'Compare baseline',
          prompt: 'Compare this segment to all internet users and show top lifts.',
          expectedOutcome: 'Lift table and significance notes.',
        },
        {
          id: 'ap-chat-3',
          title: 'Save persona',
          prompt: 'Generate a persona summary and save this audience for re-use.',
          expectedOutcome: 'Persona card and saved audience reference.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Comparative Analysis Workflow',
      workflowSummary: 'Delivers statistically sound comparison tables and lifts.',
      steps: [
        {
          id: 'ct-step-1',
          name: 'Define Matrix',
          description: 'Set rows, columns, metrics, and comparison groups.',
          deliverable: 'Crosstab specification',
        },
        {
          id: 'ct-step-2',
          name: 'Run Significance',
          description: 'Compute confidence intervals and significance markers.',
          deliverable: 'Significance report',
        },
        {
          id: 'ct-step-3',
          name: 'Detect Lifts',
          description: 'Highlight over-indexing and under-indexing segments.',
          deliverable: 'Lift matrix',
        },
        {
          id: 'ct-step-4',
          name: 'Package Findings',
          description: 'Generate export-ready crosstab narrative and notes.',
          deliverable: 'Analyst summary',
        },
      ],
      deliverables: [
        {
          id: 'ct-del-1',
          name: 'Crosstab Table',
          type: 'crosstab',
          description: 'Comparison matrix with indices and percentages.',
        },
        {
          id: 'ct-del-2',
          name: 'Significance Overlay',
          type: 'report',
          description: 'Confidence labels and methodology annotations.',
        },
        {
          id: 'ct-del-3',
          name: 'Lift Highlights',
          type: 'insight',
          description: 'Top positive and negative deviations from baseline.',
        },
      ],
      chatPrompts: [
        {
          id: 'ct-chat-1',
          title: 'Set matrix',
          prompt: 'Run a crosstab of streaming bundle adoption by age and market.',
          expectedOutcome: 'Computed crosstab with comparison groups.',
        },
        {
          id: 'ct-chat-2',
          title: 'Add significance',
          prompt: 'Apply significance markers and call out meaningful lifts only.',
          expectedOutcome: 'Filtered insights with confidence guidance.',
        },
        {
          id: 'ct-chat-3',
          title: 'Export table',
          prompt: 'Prepare an export-ready table with an analyst summary.',
          expectedOutcome: 'Polished output for handoff.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Insight Storytelling Workflow',
      workflowSummary: 'Turns outputs into narrative arcs tailored to audience and tone.',
      steps: [
        {
          id: 'na-step-1',
          name: 'Ingest Findings',
          description: 'Read key metrics, crosstabs, and confidence flags.',
          deliverable: 'Narrative input digest',
        },
        {
          id: 'na-step-2',
          name: 'Draft Story Arc',
          description: 'Create beginning, tension, insight, and recommendation beats.',
          deliverable: 'Storybeat outline',
        },
        {
          id: 'na-step-3',
          name: 'Calibrate Tone',
          description: 'Adjust voice for CMO, analyst, or sales stakeholder.',
          deliverable: 'Audience-specific narrative',
        },
        {
          id: 'na-step-4',
          name: 'Attach Evidence',
          description: 'Bind each claim to a supporting metric and citation.',
          deliverable: 'Citation-backed narrative',
        },
      ],
      deliverables: [
        {
          id: 'na-del-1',
          name: 'Executive Summary',
          type: 'report',
          description: 'Concise strategic readout with recommended actions.',
        },
        {
          id: 'na-del-2',
          name: 'Story Beats',
          type: 'insight',
          description: 'Slide-by-slide messaging points.',
        },
        {
          id: 'na-del-3',
          name: 'Citation Map',
          type: 'dataset',
          description: 'Evidence references linked to each narrative claim.',
        },
      ],
      chatPrompts: [
        {
          id: 'na-chat-1',
          title: 'Write summary',
          prompt: 'Write a concise narrative for senior leadership using this analysis.',
          expectedOutcome: 'Leadership-ready summary with key recommendations.',
        },
        {
          id: 'na-chat-2',
          title: 'Adjust tone',
          prompt: 'Reframe the summary for a client-facing sales pitch.',
          expectedOutcome: 'Tone-shifted story without losing evidence.',
        },
        {
          id: 'na-chat-3',
          title: 'Add citations',
          prompt: 'Attach confidence and citations to each key claim.',
          expectedOutcome: 'Governed narrative with traceability.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Output Packaging Workflow',
      workflowSummary: 'Converts validated insights into chart, dashboard, and deck assets.',
      steps: [
        {
          id: 'va-step-1',
          name: 'Select Visual Grammar',
          description: 'Map each insight to the best chart type and layout.',
          deliverable: 'Visualization plan',
        },
        {
          id: 'va-step-2',
          name: 'Build Chart Pack',
          description: 'Generate reusable charts with annotated highlights.',
          deliverable: 'Chart bundle',
        },
        {
          id: 'va-step-3',
          name: 'Assemble Dashboard',
          description: 'Compose interactive dashboard views for exploration.',
          deliverable: 'Dashboard draft',
        },
        {
          id: 'va-step-4',
          name: 'Create Deck Storyboard',
          description: 'Lay out slide flow and speaker notes for delivery.',
          deliverable: 'Deck storyboard',
        },
      ],
      deliverables: [
        {
          id: 'va-del-1',
          name: 'Chart Pack',
          type: 'chart',
          description: 'Exportable chart set across key insights.',
        },
        {
          id: 'va-del-2',
          name: 'Dashboard',
          type: 'dashboard',
          description: 'Interactive dashboard with linked filters.',
        },
        {
          id: 'va-del-3',
          name: 'Client Deck',
          type: 'deck',
          description: 'Presentation-ready slides with narrative alignment.',
        },
      ],
      chatPrompts: [
        {
          id: 'va-chat-1',
          title: 'Create chart pack',
          prompt: 'Generate a chart pack from the latest audience and crosstab findings.',
          expectedOutcome: 'Chart recommendations and generated visuals.',
        },
        {
          id: 'va-chat-2',
          title: 'Build dashboard',
          prompt: 'Assemble a dashboard with summary KPIs and drill-down views.',
          expectedOutcome: 'Dashboard draft with widget plan.',
        },
        {
          id: 'va-chat-3',
          title: 'Prepare deck',
          prompt: 'Create a six-slide storyboard for a client pitch.',
          expectedOutcome: 'Deck outline with slide-by-slide objective.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Trust & Compliance Workflow',
      workflowSummary: 'Validates outputs before client-facing delivery.',
      steps: [
        {
          id: 'ga-step-1',
          name: 'Trace Claims',
          description: 'Map each statement back to a source metric and wave.',
          deliverable: 'Claim-to-source ledger',
        },
        {
          id: 'ga-step-2',
          name: 'Score Confidence',
          description: 'Apply confidence thresholds and flag weak evidence.',
          deliverable: 'Confidence scorecard',
        },
        {
          id: 'ga-step-3',
          name: 'Run Policy Checks',
          description: 'Check for policy, compliance, and disclosure requirements.',
          deliverable: 'Compliance check report',
        },
        {
          id: 'ga-step-4',
          name: 'Issue Validation',
          description: 'Produce final pass/fail recommendation and audit trail.',
          deliverable: 'Validation certificate',
        },
      ],
      deliverables: [
        {
          id: 'ga-del-1',
          name: 'Citation Bundle',
          type: 'report',
          description: 'Structured references for every claim.',
        },
        {
          id: 'ga-del-2',
          name: 'Validation Report',
          type: 'insight',
          description: 'Confidence distribution and risk notes.',
        },
        {
          id: 'ga-del-3',
          name: 'Audit Trail',
          type: 'dataset',
          description: 'Time-stamped approvals and checks.',
        },
      ],
      chatPrompts: [
        {
          id: 'ga-chat-1',
          title: 'Validate report',
          prompt: 'Validate this report and attach citations to every claim.',
          expectedOutcome: 'Traceability matrix and unresolved claims.',
        },
        {
          id: 'ga-chat-2',
          title: 'Flag risks',
          prompt: 'Highlight low-confidence insights and compliance risks.',
          expectedOutcome: 'Risk list with severity levels.',
        },
        {
          id: 'ga-chat-3',
          title: 'Approve package',
          prompt: 'Generate a final validation summary for approval.',
          expectedOutcome: 'Approval-ready governance summary.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Distribution Workflow',
      workflowSummary: 'Routes outputs to downstream systems and teams.',
      steps: [
        {
          id: 'ca-step-1',
          name: 'Select Destinations',
          description: 'Resolve connector targets and delivery policies.',
          deliverable: 'Destination routing plan',
        },
        {
          id: 'ca-step-2',
          name: 'Package Artifacts',
          description: 'Bundle deck, dashboard links, summaries, and metadata.',
          deliverable: 'Delivery payload',
        },
        {
          id: 'ca-step-3',
          name: 'Execute Delivery',
          description: 'Push payload to MCP, Slack, BI, and storage endpoints.',
          deliverable: 'Delivery receipts',
        },
        {
          id: 'ca-step-4',
          name: 'Confirm Consumption',
          description: 'Track opens, failures, and acknowledgements.',
          deliverable: 'Delivery status report',
        },
      ],
      deliverables: [
        {
          id: 'ca-del-1',
          name: 'Delivery Receipt',
          type: 'report',
          description: 'Per-destination status including retries and latency.',
        },
        {
          id: 'ca-del-2',
          name: 'Shared Output Bundle',
          type: 'dataset',
          description: 'Packaged links and artifacts for external tools.',
        },
        {
          id: 'ca-del-3',
          name: 'Notification Summary',
          type: 'insight',
          description: 'Final delivery confirmation and follow-up actions.',
        },
      ],
      chatPrompts: [
        {
          id: 'ca-chat-1',
          title: 'Prepare distribution',
          prompt: 'Prepare this dashboard and summary for Slack and BI delivery.',
          expectedOutcome: 'Delivery payload preview.',
        },
        {
          id: 'ca-chat-2',
          title: 'Run delivery',
          prompt: 'Deliver outputs to configured destinations and report status.',
          expectedOutcome: 'Execution receipts and failures.',
        },
        {
          id: 'ca-chat-3',
          title: 'Confirm receipt',
          prompt: 'Summarize destination acknowledgements and next follow-ups.',
          expectedOutcome: 'Consumption confirmation report.',
        },
      ],
    },
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
    demo: {
      workflowName: 'Monitoring & Recommendation Workflow',
      workflowSummary: 'Continuously watches KPI movement and proposes actions.',
      steps: [
        {
          id: 'aa-step-1',
          name: 'Define KPI Watchlist',
          description: 'Select KPIs, thresholds, and cadence for monitoring.',
          deliverable: 'Alert configuration',
        },
        {
          id: 'aa-step-2',
          name: 'Detect Movement',
          description: 'Monitor KPI changes and detect anomalies or drifts.',
          deliverable: 'Anomaly detections',
        },
        {
          id: 'aa-step-3',
          name: 'Estimate Impact',
          description: 'Quantify potential impact on campaign performance.',
          deliverable: 'Impact projection',
        },
        {
          id: 'aa-step-4',
          name: 'Recommend Action',
          description: 'Issue prioritized recommendations with expected ROI.',
          deliverable: 'Action plan',
        },
      ],
      deliverables: [
        {
          id: 'aa-del-1',
          name: 'Alert Feed',
          type: 'alert',
          description: 'Ranked list of threshold breaches and anomalies.',
        },
        {
          id: 'aa-del-2',
          name: 'ROI Guidance',
          type: 'insight',
          description: 'Recommended actions with impact ranges.',
        },
        {
          id: 'aa-del-3',
          name: 'Learning Update',
          type: 'report',
          description: 'What changed and how to adapt strategy next cycle.',
        },
      ],
      chatPrompts: [
        {
          id: 'aa-chat-1',
          title: 'Configure alerts',
          prompt: 'Set KPI alerts for awareness, intent, and conversion shifts above 5%.',
          expectedOutcome: 'Saved threshold and cadence plan.',
        },
        {
          id: 'aa-chat-2',
          title: 'Review anomalies',
          prompt: 'Show the latest anomalies and estimate likely drivers.',
          expectedOutcome: 'Prioritized anomaly readout.',
        },
        {
          id: 'aa-chat-3',
          title: 'Recommend next steps',
          prompt: 'Recommend next actions with expected ROI impact.',
          expectedOutcome: 'Action roadmap with confidence levels.',
        },
      ],
    },
  },
]

export function getFeaturedAgents(count: number): Agent[] {
  return agents.slice(0, count)
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find((agent) => agent.id === id)
}

export const AGENT_STARTER_TEMPLATE_IDS: Record<string, string[]> = {
  'brief-interpreter': ['tmpl-brief-interpret-structured', 'tmpl-brief-clarification-checklist'],
  'workflow-orchestrator': ['tmpl-workflow-build-execution', 'tmpl-workflow-run-status'],
  'data-harmonizer': ['tmpl-data-map-taxonomy', 'tmpl-data-dedupe-weighting'],
  'audience-profiler': ['tmpl-audience-build-from-objective', 'tmpl-audience-compare-and-save'],
  'crosstab-analyst': ['tmpl-crosstab-run-significance', 'tmpl-crosstab-highlight-meaningful'],
  'narrative-agent': ['tmpl-narrative-write-exec', 'tmpl-narrative-reframe-client'],
  'visualization-agent': ['tmpl-visualization-chart-pack', 'tmpl-visualization-slide-story'],
  'governance-agent': ['tmpl-governance-citations-all-claims', 'tmpl-governance-flag-low-confidence'],
  'connector-agent': ['tmpl-connector-package-slack-bi', 'tmpl-connector-deliver-and-receipts'],
  'advisor-agent': ['tmpl-advisor-configure-alerts', 'tmpl-advisor-next-actions-roi'],
}
