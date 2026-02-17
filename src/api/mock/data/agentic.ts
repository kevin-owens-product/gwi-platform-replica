import type { AgenticCapability, AgenticFlow, AgenticPlatformLinkage, AgenticRun } from '../../types/agentic'

export const agenticCapabilities: AgenticCapability[] = [
  {
    id: 'cap-brief-interpreter',
    name: 'Brief Interpreter',
    type: 'agent',
    category: 'Orchestration',
    description: 'Classifies the brief, extracts objectives, audiences, markets, and desired outputs.',
    inputs: ['brief_text', 'audience_context', 'market_context'],
    outputs: ['structured_brief', 'intent_tags'],
  },
  {
    id: 'cap-workflow-orchestrator',
    name: 'Workflow Orchestrator',
    type: 'agent',
    category: 'Orchestration',
    description: 'Creates a project workspace and sequences the right tools and agents.',
    inputs: ['structured_brief', 'capability_inventory'],
    outputs: ['workflow_plan', 'workspace_id'],
    dependencies: ['cap-brief-interpreter'],
  },
  {
    id: 'cap-data-harmonizer',
    name: 'Data Harmonizer',
    type: 'agent',
    category: 'Data Harmonization',
    description: 'Merges GWI, first-party, and external data with provenance tracking.',
    inputs: ['gwi_data', 'first_party_data', 'external_data'],
    outputs: ['harmonized_dataset', 'provenance_log'],
  },
  {
    id: 'cap-audience-profiler',
    name: 'Audience Profiler',
    type: 'agent',
    category: 'Audience & Profiling',
    description: 'Builds and validates audiences, sizes segments, and surfaces personas.',
    inputs: ['harmonized_dataset', 'audience_rules'],
    outputs: ['audience_id', 'persona_summary'],
    dependencies: ['cap-data-harmonizer'],
  },
  {
    id: 'cap-crosstab-analyst',
    name: 'Crosstab Analyst',
    type: 'tool',
    category: 'Analysis & Crosstab',
    description: 'Runs statistical comparisons, significance checks, and lifts.',
    inputs: ['audience_id', 'variables', 'metrics'],
    outputs: ['crosstab_table', 'significance_report'],
    dependencies: ['cap-audience-profiler'],
  },
  {
    id: 'cap-narrative-agent',
    name: 'Narrative Agent',
    type: 'agent',
    category: 'Narrative & Knowledge',
    description: 'Transforms analysis into insight narratives with tone-of-voice controls.',
    inputs: ['crosstab_table', 'knowledge_base', 'brand_tone'],
    outputs: ['insight_summary', 'story_beats'],
    dependencies: ['cap-crosstab-analyst'],
  },
  {
    id: 'cap-visualization-agent',
    name: 'Visualization Agent',
    type: 'agent',
    category: 'Visualization & Packaging',
    description: 'Builds charts, dashboards, and slide-ready assets.',
    inputs: ['insight_summary', 'chart_specs'],
    outputs: ['charts', 'dashboard', 'deck'],
    dependencies: ['cap-narrative-agent'],
  },
  {
    id: 'cap-governance-agent',
    name: 'Governance Agent',
    type: 'agent',
    category: 'Governance & Compliance',
    description: 'Validates insights against source data and compliance rules.',
    inputs: ['insight_summary', 'provenance_log'],
    outputs: ['validation_report', 'citation_bundle'],
    dependencies: ['cap-narrative-agent'],
  },
  {
    id: 'cap-connector-agent',
    name: 'Connector Agent',
    type: 'agent',
    category: 'Delivery & Connectors',
    description: 'Pushes outputs to client systems and MCP endpoints.',
    inputs: ['deck', 'dashboard', 'exports'],
    outputs: ['delivery_receipts'],
    dependencies: ['cap-visualization-agent'],
  },
  {
    id: 'cap-advisor-agent',
    name: 'Advisor Agent',
    type: 'agent',
    category: 'Proactivity & ROI',
    description: 'Monitors change and suggests next steps with ROI feedback loops.',
    inputs: ['campaign_results', 'alerts'],
    outputs: ['recommendations', 'learning_updates'],
  },
]

const coreFlows: AgenticFlow[] = [
  {
    id: 'flow-brief-interpretation',
    name: 'Brief Interpretation Flow',
    description: 'Transforms an unstructured brief into a guided workflow and outputs.',
    triggers: ['incoming_brief', 'agent_spark_prompt'],
    steps: [
      {
        id: 'step-brief',
        name: 'Brief Interpreter',
        capability_id: 'cap-brief-interpreter',
        description: 'Extract objectives, audiences, markets, and outputs.',
        output_artifacts: ['structured_brief', 'intent_tags'],
      },
      {
        id: 'step-workflow',
        name: 'Workflow Orchestrator',
        capability_id: 'cap-workflow-orchestrator',
        description: 'Create workspace, assign owners, and route downstream tasks.',
        depends_on: ['step-brief'],
        output_artifacts: ['workflow_plan', 'workspace_id'],
      },
      {
        id: 'step-data',
        name: 'Data Harmonization',
        capability_id: 'cap-data-harmonizer',
        description: 'Prepare analysis-ready source data with lineage.',
        depends_on: ['step-workflow'],
        output_artifacts: ['harmonized_dataset', 'provenance_log'],
      },
      {
        id: 'step-analysis',
        name: 'Audience + Crosstab Analysis',
        capability_id: 'cap-crosstab-analyst',
        description: 'Generate key comparisons, lifts, and significance checks.',
        depends_on: ['step-data'],
        output_artifacts: ['crosstab_table', 'significance_report'],
      },
      {
        id: 'step-story',
        name: 'Narrative + Packaging',
        capability_id: 'cap-visualization-agent',
        description: 'Create narrative-backed charts and delivery-ready outputs.',
        depends_on: ['step-analysis'],
        output_artifacts: ['insight_summary', 'dashboard', 'deck'],
      },
      {
        id: 'step-govern',
        name: 'Governance + Delivery',
        capability_id: 'cap-connector-agent',
        description: 'Validate claims and deliver approved assets.',
        depends_on: ['step-story'],
        output_artifacts: ['validation_report', 'delivery_receipts'],
      },
    ],
  },
  {
    id: 'flow-campaign-lifecycle',
    name: 'End-to-End Campaign Flow',
    description: 'Automates the full campaign lifecycle from audience to ROI.',
    triggers: ['campaign_brief', 'post_campaign_data'],
    steps: [
      {
        id: 'step-audience',
        name: 'Audience Profiling',
        capability_id: 'cap-audience-profiler',
        description: 'Identify and size target segments.',
        output_artifacts: ['audience_id', 'persona_summary'],
      },
      {
        id: 'step-crosstab',
        name: 'Analysis (Crosstab)',
        capability_id: 'cap-crosstab-analyst',
        description: 'Analyze opportunities and behaviors.',
        depends_on: ['step-audience'],
        output_artifacts: ['crosstab_table', 'significance_report'],
      },
      {
        id: 'step-narrative',
        name: 'Narrative',
        capability_id: 'cap-narrative-agent',
        description: 'Produce actionable recommendations.',
        depends_on: ['step-crosstab'],
        output_artifacts: ['insight_summary', 'story_beats'],
      },
      {
        id: 'step-visualization',
        name: 'Visualization',
        capability_id: 'cap-visualization-agent',
        description: 'Generate chart pack and dashboard.',
        depends_on: ['step-narrative'],
        output_artifacts: ['charts', 'dashboard'],
      },
      {
        id: 'step-delivery',
        name: 'Delivery',
        capability_id: 'cap-connector-agent',
        description: 'Deliver outputs and track distribution status.',
        depends_on: ['step-visualization'],
        output_artifacts: ['delivery_receipts'],
      },
      {
        id: 'step-advisor',
        name: 'Advisor',
        capability_id: 'cap-advisor-agent',
        description: 'Track ROI and learning loops.',
        depends_on: ['step-delivery'],
        output_artifacts: ['recommendations', 'learning_updates'],
      },
    ],
  },
]

interface SpecialistFlowDefinition {
  agentId: string
  name: string
  description: string
  primaryCapabilityId: string
  trigger: string
  artifacts: string[]
  handoffCapabilityId?: string
}

const specialistFlowDefinitions: SpecialistFlowDefinition[] = [
  {
    agentId: 'brief-interpreter',
    name: 'Brief Interpreter Specialist Flow',
    description: 'Demonstrates end-to-end brief decomposition and scope control.',
    primaryCapabilityId: 'cap-brief-interpreter',
    trigger: 'agent_brief_interpreter',
    artifacts: ['structured_brief', 'intent_tags', 'workflow_plan'],
    handoffCapabilityId: 'cap-workflow-orchestrator',
  },
  {
    agentId: 'workflow-orchestrator',
    name: 'Workflow Orchestrator Specialist Flow',
    description: 'Demonstrates execution graph creation, gating, and orchestration.',
    primaryCapabilityId: 'cap-workflow-orchestrator',
    trigger: 'agent_workflow_orchestrator',
    artifacts: ['workflow_plan', 'workspace_id', 'approval_queue'],
    handoffCapabilityId: 'cap-governance-agent',
  },
  {
    agentId: 'data-harmonizer',
    name: 'Data Harmonizer Specialist Flow',
    description: 'Demonstrates schema mapping, deduplication, and lineage packaging.',
    primaryCapabilityId: 'cap-data-harmonizer',
    trigger: 'agent_data_harmonizer',
    artifacts: ['harmonized_dataset', 'provenance_log', 'quality_scorecard'],
    handoffCapabilityId: 'cap-audience-profiler',
  },
  {
    agentId: 'audience-profiler',
    name: 'Audience Profiler Specialist Flow',
    description: 'Demonstrates audience design, sizing, and persona construction.',
    primaryCapabilityId: 'cap-audience-profiler',
    trigger: 'agent_audience_profiler',
    artifacts: ['audience_id', 'persona_summary', 'reach_report'],
    handoffCapabilityId: 'cap-crosstab-analyst',
  },
  {
    agentId: 'crosstab-analyst',
    name: 'Crosstab Analyst Specialist Flow',
    description: 'Demonstrates matrix setup, significance filtering, and lift identification.',
    primaryCapabilityId: 'cap-crosstab-analyst',
    trigger: 'agent_crosstab_analyst',
    artifacts: ['crosstab_table', 'significance_report', 'lift_matrix'],
    handoffCapabilityId: 'cap-narrative-agent',
  },
  {
    agentId: 'narrative-agent',
    name: 'Narrative Agent Specialist Flow',
    description: 'Demonstrates storybeat generation and stakeholder-specific tone adaptation.',
    primaryCapabilityId: 'cap-narrative-agent',
    trigger: 'agent_narrative_agent',
    artifacts: ['insight_summary', 'story_beats', 'citation_map'],
    handoffCapabilityId: 'cap-visualization-agent',
  },
  {
    agentId: 'visualization-agent',
    name: 'Visualization Agent Specialist Flow',
    description: 'Demonstrates chart pack generation, dashboard assembly, and deck prep.',
    primaryCapabilityId: 'cap-visualization-agent',
    trigger: 'agent_visualization_agent',
    artifacts: ['charts', 'dashboard', 'deck'],
    handoffCapabilityId: 'cap-connector-agent',
  },
  {
    agentId: 'governance-agent',
    name: 'Governance Agent Specialist Flow',
    description: 'Demonstrates evidence checks, confidence scoring, and compliance gating.',
    primaryCapabilityId: 'cap-governance-agent',
    trigger: 'agent_governance_agent',
    artifacts: ['validation_report', 'citation_bundle', 'audit_trail'],
    handoffCapabilityId: 'cap-connector-agent',
  },
  {
    agentId: 'connector-agent',
    name: 'Connector Agent Specialist Flow',
    description: 'Demonstrates payload packaging and multi-destination delivery.',
    primaryCapabilityId: 'cap-connector-agent',
    trigger: 'agent_connector_agent',
    artifacts: ['delivery_bundle', 'delivery_receipts', 'destination_status'],
    handoffCapabilityId: 'cap-advisor-agent',
  },
  {
    agentId: 'advisor-agent',
    name: 'Advisor Agent Specialist Flow',
    description: 'Demonstrates KPI monitoring, anomaly triage, and ROI guidance.',
    primaryCapabilityId: 'cap-advisor-agent',
    trigger: 'agent_advisor_agent',
    artifacts: ['alert_feed', 'recommendations', 'learning_updates'],
  },
]

const specialistFlows: AgenticFlow[] = specialistFlowDefinitions.map((def) => {
  const intakeCapability = def.primaryCapabilityId === 'cap-workflow-orchestrator'
    ? 'cap-workflow-orchestrator'
    : 'cap-brief-interpreter'
  const validationCapability = 'cap-governance-agent'
  const handoffCapability = def.handoffCapabilityId ?? 'cap-connector-agent'

  return {
    id: `flow-${def.agentId}`,
    name: def.name,
    description: def.description,
    triggers: [def.trigger, 'agent_spark_prompt'],
    steps: [
      {
        id: `step-${def.agentId}-intake`,
        name: 'Context Intake',
        capability_id: intakeCapability,
        description: 'Capture constraints, goals, and output requirements.',
        output_artifacts: ['context_packet'],
      },
      {
        id: `step-${def.agentId}-execute`,
        name: 'Specialist Execution',
        capability_id: def.primaryCapabilityId,
        description: `Execute specialist actions for ${def.name.replace(' Specialist Flow', '')}.`,
        depends_on: [`step-${def.agentId}-intake`],
        output_artifacts: def.artifacts,
      },
      {
        id: `step-${def.agentId}-validate`,
        name: 'Validation Gate',
        capability_id: validationCapability,
        description: 'Attach evidence, confidence, and compliance notes.',
        depends_on: [`step-${def.agentId}-execute`],
        output_artifacts: ['validation_report'],
      },
      {
        id: `step-${def.agentId}-handoff`,
        name: 'Handoff',
        capability_id: handoffCapability,
        description: 'Prepare downstream handoff and next-step recommendations.',
        depends_on: [`step-${def.agentId}-validate`],
        output_artifacts: ['handoff_note'],
      },
    ],
  }
})

export const agenticFlows: AgenticFlow[] = [...coreFlows, ...specialistFlows]

export const agenticLinkages: AgenticPlatformLinkage[] = [
  {
    id: 'link-platform-api',
    name: 'GWI Platform API',
    description: 'Analysis, audience, variables, exports and dashboards.',
    endpoints: ['GET /platform/api/v1/analysis', 'GET /platform/api/v1/audiences', 'POST /platform/api/v1/exports'],
    auth: 'token',
  },
  {
    id: 'link-spark-api',
    name: 'Spark API',
    description: 'Natural-language insights and chat responses.',
    endpoints: ['POST /spark/api/v1/chat', 'GET /spark/api/v1/insights'],
    auth: 'token',
  },
  {
    id: 'link-spark-mcp',
    name: 'Spark MCP',
    description: 'MCP server for agent-to-agent collaboration and tool calls.',
    endpoints: ['POST /spark-api/mcp', 'GET /spark-api/mcp/health'],
    auth: 'oauth',
  },
]

export const agenticRuns: AgenticRun[] = [
  {
    id: 'run-001',
    flow_id: 'flow-brief-interpretation',
    status: 'completed',
    started_at: '2026-02-10T18:10:00Z',
    completed_at: '2026-02-10T18:12:30Z',
    brief: 'Summarize streaming bundle adoption for Gen Z creators in US/UK with a client-ready narrative.',
    outputs: [
      {
        id: 'out-001',
        label: 'Structured Brief',
        type: 'insight',
        summary: 'Objective, audience, markets, KPIs, and output spec confirmed.',
      },
      {
        id: 'out-002',
        label: 'Audience + Crosstab Snapshot',
        type: 'crosstab',
        summary: 'Gen Z creators index 1.58x for bundle adoption with significance tags.',
      },
      {
        id: 'out-003',
        label: 'Client Deck Storyboard',
        type: 'deck',
        summary: 'Six-slide storyline with citations, chart frames, and recommendations.',
      },
    ],
  },
  {
    id: 'run-002',
    flow_id: 'flow-campaign-lifecycle',
    status: 'running',
    started_at: '2026-02-10T18:20:00Z',
    brief: 'Plan and measure a Q2 streaming campaign targeting hybrid workers globally.',
    outputs: [
      {
        id: 'out-004',
        label: 'Audience Definition',
        type: 'dataset',
        summary: 'Hybrid workers segment assembled across five key markets.',
      },
      {
        id: 'out-005',
        label: 'Early Lift Snapshot',
        type: 'crosstab',
        summary: '1.32x lift in ad-supported streaming intent among target segment.',
      },
    ],
  },
  {
    id: 'run-003',
    flow_id: 'flow-governance-agent',
    status: 'completed',
    started_at: '2026-02-11T09:05:00Z',
    completed_at: '2026-02-11T09:07:45Z',
    brief: 'Validate claims in the Q1 category report before client distribution.',
    outputs: [
      {
        id: 'out-006',
        label: 'Citation Bundle',
        type: 'report',
        summary: 'Attached source references and wave metadata for all claims.',
      },
      {
        id: 'out-007',
        label: 'Validation Report',
        type: 'insight',
        summary: 'Flagged two medium-confidence claims requiring caveat language.',
      },
    ],
  },
]
