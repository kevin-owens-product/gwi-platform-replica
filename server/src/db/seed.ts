import { getDb, closeDb } from './index.js'

// ── Seed data (mirrors the frontend mock data) ─────────────────────

const waves = [
  { id: 'wave_2024q4', name: 'Q4 2024', study_id: 'study_core', study_name: 'GWI Core', year: 2024, quarter: 4, start_date: '2024-10-01', end_date: '2024-12-31', location_ids: ['loc_us','loc_uk','loc_de','loc_fr','loc_jp','loc_br','loc_in','loc_au','loc_ca','loc_mx','loc_es','loc_it','loc_kr','loc_cn','loc_id','loc_ng','loc_za','loc_se','loc_pl','loc_ar'], sample_size: 45200 },
  { id: 'wave_2024q3', name: 'Q3 2024', study_id: 'study_core', study_name: 'GWI Core', year: 2024, quarter: 3, start_date: '2024-07-01', end_date: '2024-09-30', location_ids: ['loc_us','loc_uk','loc_de','loc_fr','loc_jp','loc_br','loc_in','loc_au','loc_ca','loc_mx','loc_es','loc_it','loc_kr','loc_cn','loc_id','loc_ng','loc_za','loc_se','loc_pl','loc_ar'], sample_size: 42800 },
  { id: 'wave_2024q2', name: 'Q2 2024', study_id: 'study_core', study_name: 'GWI Core', year: 2024, quarter: 2, start_date: '2024-04-01', end_date: '2024-06-30', location_ids: ['loc_us','loc_uk','loc_de','loc_fr','loc_jp','loc_br','loc_in','loc_au','loc_ca','loc_mx','loc_es','loc_it','loc_kr','loc_cn','loc_id'], sample_size: 38500 },
  { id: 'wave_usa_2024', name: 'USA 2024', study_id: 'study_usa', study_name: 'GWI USA', year: 2024, quarter: null, start_date: '2024-01-01', end_date: '2024-12-31', location_ids: ['loc_us'], sample_size: 25000 },
  { id: 'wave_kids_2024', name: 'Kids 2024', study_id: 'study_kids', study_name: 'GWI Kids', year: 2024, quarter: null, start_date: '2024-06-01', end_date: '2024-08-31', location_ids: ['loc_us','loc_uk','loc_de','loc_fr'], sample_size: 12000 },
  { id: 'wave_biz_2024q4', name: 'B2B Q4 2024', study_id: 'study_b2b', study_name: 'GWI Work', year: 2024, quarter: 4, start_date: '2024-10-01', end_date: '2024-12-31', location_ids: ['loc_us','loc_uk','loc_de','loc_jp'], sample_size: 15000 },
  { id: 'wave_gaming_2024', name: 'Gaming 2024', study_id: 'study_gaming', study_name: 'GWI Gaming', year: 2024, quarter: null, start_date: '2024-01-01', end_date: '2024-06-30', location_ids: ['loc_us','loc_uk','loc_de','loc_jp','loc_kr'], sample_size: 18000 },
  { id: 'wave_zeitgeist_dec', name: 'Zeitgeist Dec 2024', study_id: 'study_zeitgeist', study_name: 'GWI Zeitgeist', year: 2024, quarter: null, start_date: '2024-12-01', end_date: '2024-12-31', location_ids: ['loc_us','loc_uk','loc_de','loc_fr','loc_jp','loc_br','loc_in','loc_au','loc_ca','loc_mx'], sample_size: 8500 },
]

const questions = [
  { id: 'q_social_platforms', name: 'Social Media Platforms Used', category: 'Social Media', wave_ids: ['wave_2024q4','wave_2024q3'], datapoints: [
    { id: 'dp_facebook', name: 'Facebook' }, { id: 'dp_instagram', name: 'Instagram' }, { id: 'dp_tiktok', name: 'TikTok' },
    { id: 'dp_twitter', name: 'X / Twitter' }, { id: 'dp_linkedin', name: 'LinkedIn' }, { id: 'dp_youtube', name: 'YouTube' },
    { id: 'dp_snapchat', name: 'Snapchat' }, { id: 'dp_pinterest', name: 'Pinterest' },
  ]},
  { id: 'q_social_time', name: 'Daily Social Media Time', category: 'Social Media', wave_ids: ['wave_2024q4'], datapoints: [
    { id: 'dp_time_none', name: 'None' }, { id: 'dp_time_30m', name: 'Less than 30 minutes' }, { id: 'dp_time_1h', name: '30 minutes - 1 hour' },
    { id: 'dp_time_2h', name: '1 - 2 hours' }, { id: 'dp_time_3h', name: '2 - 3 hours' }, { id: 'dp_time_3plus', name: '3+ hours' },
  ]},
  { id: 'q_tv_platforms', name: 'TV/Streaming Platforms', category: 'Media Consumption', wave_ids: ['wave_2024q4','wave_2024q3'], datapoints: [
    { id: 'dp_netflix', name: 'Netflix' }, { id: 'dp_disney', name: 'Disney+' }, { id: 'dp_prime', name: 'Amazon Prime Video' },
    { id: 'dp_hbo', name: 'HBO Max' }, { id: 'dp_hulu', name: 'Hulu' }, { id: 'dp_apple_tv', name: 'Apple TV+' },
  ]},
  { id: 'q_device_ownership', name: 'Device Ownership', category: 'Technology', wave_ids: ['wave_2024q4'], datapoints: [
    { id: 'dp_smartphone', name: 'Smartphone' }, { id: 'dp_laptop', name: 'Laptop' }, { id: 'dp_tablet', name: 'Tablet' },
    { id: 'dp_smartwatch', name: 'Smartwatch' }, { id: 'dp_desktop', name: 'Desktop PC' }, { id: 'dp_smart_speaker', name: 'Smart Speaker' },
  ]},
  { id: 'q_age_group', name: 'Age Group', category: 'Demographics', wave_ids: ['wave_2024q4','wave_2024q3','wave_2024q2'], datapoints: [
    { id: 'dp_age_16_24', name: '16-24' }, { id: 'dp_age_25_34', name: '25-34' }, { id: 'dp_age_35_44', name: '35-44' },
    { id: 'dp_age_45_54', name: '45-54' }, { id: 'dp_age_55_64', name: '55-64' },
  ]},
  { id: 'q_purchase_online', name: 'Online Purchase Categories', category: 'E-Commerce', wave_ids: ['wave_2024q4','wave_2024q3'], datapoints: [
    { id: 'dp_clothing', name: 'Clothing & Accessories' }, { id: 'dp_electronics', name: 'Electronics' },
    { id: 'dp_food_delivery', name: 'Food Delivery' }, { id: 'dp_beauty', name: 'Beauty & Personal Care' },
    { id: 'dp_home_garden', name: 'Home & Garden' },
  ]},
  { id: 'q_fitness', name: 'Fitness Activities', category: 'Lifestyle', wave_ids: ['wave_2024q4','wave_2024q3'], datapoints: [
    { id: 'dp_gym', name: 'Gym / Weight Training' }, { id: 'dp_running', name: 'Running / Jogging' },
    { id: 'dp_yoga', name: 'Yoga / Pilates' }, { id: 'dp_swimming', name: 'Swimming' }, { id: 'dp_cycling', name: 'Cycling' },
  ]},
  { id: 'q_brand_discovery', name: 'Brand Discovery Channels', category: 'Brand Engagement', wave_ids: ['wave_2024q4'], datapoints: [
    { id: 'dp_social_ads', name: 'Social Media Ads' }, { id: 'dp_influencer', name: 'Influencer Recommendations' },
    { id: 'dp_search', name: 'Search Engines' }, { id: 'dp_word_of_mouth', name: 'Word of Mouth' }, { id: 'dp_tv_ads', name: 'TV Advertisements' },
  ]},
  { id: 'q_ai_usage', name: 'AI Tool Usage', category: 'Technology', wave_ids: ['wave_2024q4'], datapoints: [
    { id: 'dp_ai_chatgpt', name: 'ChatGPT' }, { id: 'dp_ai_copilot', name: 'Microsoft Copilot' },
    { id: 'dp_ai_gemini', name: 'Google Gemini' }, { id: 'dp_ai_midjourney', name: 'Midjourney' }, { id: 'dp_ai_claude', name: 'Claude' },
  ]},
  { id: 'q_work_setup', name: 'Work Setup', category: 'Lifestyle', wave_ids: ['wave_2024q4','wave_2024q3'], datapoints: [
    { id: 'dp_work_office', name: 'Fully in-office' }, { id: 'dp_work_hybrid', name: 'Hybrid' },
    { id: 'dp_work_remote', name: 'Fully remote' }, { id: 'dp_work_self', name: 'Self-employed' },
  ]},
]

// Deterministic pseudo-random based on string hash
function hashSeed(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const capabilities = [
  { id: 'cap-brief-interpreter', name: 'Brief Interpreter', type: 'agent', category: 'Orchestration', description: 'Classifies the brief, extracts objectives, audiences, markets, and desired outputs.', inputs: ['brief_text','audience_context','market_context'], outputs: ['structured_brief','intent_tags'], dependencies: [], confidence: null },
  { id: 'cap-workflow-orchestrator', name: 'Workflow Orchestrator', type: 'agent', category: 'Orchestration', description: 'Creates a project workspace and sequences the right tools and agents.', inputs: ['structured_brief','capability_inventory'], outputs: ['workflow_plan','workspace_id'], dependencies: ['cap-brief-interpreter'], confidence: null },
  { id: 'cap-data-harmonizer', name: 'Data Harmonizer', type: 'agent', category: 'Data Harmonization', description: 'Merges GWI, first-party, and external data with provenance tracking.', inputs: ['gwi_data','first_party_data','external_data'], outputs: ['harmonized_dataset','provenance_log'], dependencies: [], confidence: null },
  { id: 'cap-audience-profiler', name: 'Audience Profiler', type: 'agent', category: 'Audience & Profiling', description: 'Builds and validates audiences, sizes segments, and surfaces personas.', inputs: ['harmonized_dataset','audience_rules'], outputs: ['audience_id','persona_summary'], dependencies: ['cap-data-harmonizer'], confidence: null },
  { id: 'cap-crosstab-analyst', name: 'Crosstab Analyst', type: 'tool', category: 'Analysis & Crosstab', description: 'Runs statistical comparisons, significance checks, and lifts.', inputs: ['audience_id','variables','metrics'], outputs: ['crosstab_table','significance_report'], dependencies: ['cap-audience-profiler'], confidence: null },
  { id: 'cap-narrative-agent', name: 'Narrative Agent', type: 'agent', category: 'Narrative & Knowledge', description: 'Transforms analysis into insight narratives with tone-of-voice controls.', inputs: ['crosstab_table','knowledge_base','brand_tone'], outputs: ['insight_summary','story_beats'], dependencies: ['cap-crosstab-analyst'], confidence: null },
  { id: 'cap-visualization-agent', name: 'Visualization Agent', type: 'agent', category: 'Visualization & Packaging', description: 'Builds charts, dashboards, and slide-ready assets.', inputs: ['insight_summary','chart_specs'], outputs: ['charts','dashboard','deck'], dependencies: ['cap-narrative-agent'], confidence: null },
  { id: 'cap-governance-agent', name: 'Governance Agent', type: 'agent', category: 'Governance & Compliance', description: 'Validates insights against source data and compliance rules.', inputs: ['insight_summary','provenance_log'], outputs: ['validation_report','citation_bundle'], dependencies: ['cap-narrative-agent'], confidence: null },
  { id: 'cap-connector-agent', name: 'Connector Agent', type: 'agent', category: 'Delivery & Connectors', description: 'Pushes outputs to client systems and MCP endpoints.', inputs: ['deck','dashboard','exports'], outputs: ['delivery_receipts'], dependencies: ['cap-visualization-agent'], confidence: null },
  { id: 'cap-advisor-agent', name: 'Advisor Agent', type: 'agent', category: 'Proactivity & ROI', description: 'Monitors change and suggests next steps with ROI feedback loops.', inputs: ['campaign_results','alerts'], outputs: ['recommendations','learning_updates'], dependencies: [], confidence: null },
]

const linkages = [
  { id: 'link-platform-api', name: 'GWI Platform API', description: 'Analysis, audience, variables, exports and dashboards.', endpoints: ['GET /platform/api/v1/analysis','GET /platform/api/v1/audiences','POST /platform/api/v1/exports'], auth: 'token' },
  { id: 'link-spark-api', name: 'Spark API', description: 'Natural-language insights and chat responses.', endpoints: ['POST /spark/api/v1/chat','GET /spark/api/v1/insights'], auth: 'token' },
  { id: 'link-spark-mcp', name: 'Spark MCP', description: 'MCP server for agent-to-agent collaboration and tool calls.', endpoints: ['POST /spark-api/mcp','GET /spark-api/mcp/health'], auth: 'oauth' },
]

// Flows: 2 core + 10 specialist (matching the frontend mock data)
const specialistDefs = [
  { agentId: 'brief-interpreter', name: 'Brief Interpreter Specialist Flow', description: 'Demonstrates end-to-end brief decomposition and scope control.', primaryCapabilityId: 'cap-brief-interpreter', trigger: 'agent_brief_interpreter', artifacts: ['structured_brief','intent_tags','workflow_plan'], handoffCapabilityId: 'cap-workflow-orchestrator' },
  { agentId: 'workflow-orchestrator', name: 'Workflow Orchestrator Specialist Flow', description: 'Demonstrates execution graph creation, gating, and orchestration.', primaryCapabilityId: 'cap-workflow-orchestrator', trigger: 'agent_workflow_orchestrator', artifacts: ['workflow_plan','workspace_id','approval_queue'], handoffCapabilityId: 'cap-governance-agent' },
  { agentId: 'data-harmonizer', name: 'Data Harmonizer Specialist Flow', description: 'Demonstrates schema mapping, deduplication, and lineage packaging.', primaryCapabilityId: 'cap-data-harmonizer', trigger: 'agent_data_harmonizer', artifacts: ['harmonized_dataset','provenance_log','quality_scorecard'], handoffCapabilityId: 'cap-audience-profiler' },
  { agentId: 'audience-profiler', name: 'Audience Profiler Specialist Flow', description: 'Demonstrates audience design, sizing, and persona construction.', primaryCapabilityId: 'cap-audience-profiler', trigger: 'agent_audience_profiler', artifacts: ['audience_id','persona_summary','reach_report'], handoffCapabilityId: 'cap-crosstab-analyst' },
  { agentId: 'crosstab-analyst', name: 'Crosstab Analyst Specialist Flow', description: 'Demonstrates matrix setup, significance filtering, and lift identification.', primaryCapabilityId: 'cap-crosstab-analyst', trigger: 'agent_crosstab_analyst', artifacts: ['crosstab_table','significance_report','lift_matrix'], handoffCapabilityId: 'cap-narrative-agent' },
  { agentId: 'narrative-agent', name: 'Narrative Agent Specialist Flow', description: 'Demonstrates storybeat generation and stakeholder-specific tone adaptation.', primaryCapabilityId: 'cap-narrative-agent', trigger: 'agent_narrative_agent', artifacts: ['insight_summary','story_beats','citation_map'], handoffCapabilityId: 'cap-visualization-agent' },
  { agentId: 'visualization-agent', name: 'Visualization Agent Specialist Flow', description: 'Demonstrates chart pack generation, dashboard assembly, and deck prep.', primaryCapabilityId: 'cap-visualization-agent', trigger: 'agent_visualization_agent', artifacts: ['charts','dashboard','deck'], handoffCapabilityId: 'cap-connector-agent' },
  { agentId: 'governance-agent', name: 'Governance Agent Specialist Flow', description: 'Demonstrates evidence checks, confidence scoring, and compliance gating.', primaryCapabilityId: 'cap-governance-agent', trigger: 'agent_governance_agent', artifacts: ['validation_report','citation_bundle','audit_trail'], handoffCapabilityId: 'cap-connector-agent' },
  { agentId: 'connector-agent', name: 'Connector Agent Specialist Flow', description: 'Demonstrates payload packaging and multi-destination delivery.', primaryCapabilityId: 'cap-connector-agent', trigger: 'agent_connector_agent', artifacts: ['delivery_bundle','delivery_receipts','destination_status'], handoffCapabilityId: 'cap-advisor-agent' },
  { agentId: 'advisor-agent', name: 'Advisor Agent Specialist Flow', description: 'Demonstrates KPI monitoring, anomaly triage, and ROI guidance.', primaryCapabilityId: 'cap-advisor-agent', trigger: 'agent_advisor_agent', artifacts: ['alert_feed','recommendations','learning_updates'] },
]

function buildFlows() {
  const coreFlows = [
    {
      id: 'flow-brief-interpretation', name: 'Brief Interpretation Flow',
      description: 'Transforms an unstructured brief into a guided workflow and outputs.',
      triggers: ['incoming_brief','agent_spark_prompt'],
      steps: [
        { id: 'step-brief', name: 'Brief Interpreter', capability_id: 'cap-brief-interpreter', description: 'Extract objectives, audiences, markets, and outputs.', output_artifacts: ['structured_brief','intent_tags'] },
        { id: 'step-workflow', name: 'Workflow Orchestrator', capability_id: 'cap-workflow-orchestrator', description: 'Create workspace, assign owners, and route downstream tasks.', depends_on: ['step-brief'], output_artifacts: ['workflow_plan','workspace_id'] },
        { id: 'step-data', name: 'Data Harmonization', capability_id: 'cap-data-harmonizer', description: 'Prepare analysis-ready source data with lineage.', depends_on: ['step-workflow'], output_artifacts: ['harmonized_dataset','provenance_log'] },
        { id: 'step-analysis', name: 'Audience + Crosstab Analysis', capability_id: 'cap-crosstab-analyst', description: 'Generate key comparisons, lifts, and significance checks.', depends_on: ['step-data'], output_artifacts: ['crosstab_table','significance_report'] },
        { id: 'step-story', name: 'Narrative + Packaging', capability_id: 'cap-visualization-agent', description: 'Create narrative-backed charts and delivery-ready outputs.', depends_on: ['step-analysis'], output_artifacts: ['insight_summary','dashboard','deck'] },
        { id: 'step-govern', name: 'Governance + Delivery', capability_id: 'cap-connector-agent', description: 'Validate claims and deliver approved assets.', depends_on: ['step-story'], output_artifacts: ['validation_report','delivery_receipts'] },
      ],
    },
    {
      id: 'flow-campaign-lifecycle', name: 'End-to-End Campaign Flow',
      description: 'Automates the full campaign lifecycle from audience to ROI.',
      triggers: ['campaign_brief','post_campaign_data'],
      steps: [
        { id: 'step-audience', name: 'Audience Profiling', capability_id: 'cap-audience-profiler', description: 'Identify and size target segments.', output_artifacts: ['audience_id','persona_summary'] },
        { id: 'step-crosstab', name: 'Analysis (Crosstab)', capability_id: 'cap-crosstab-analyst', description: 'Analyze opportunities and behaviors.', depends_on: ['step-audience'], output_artifacts: ['crosstab_table','significance_report'] },
        { id: 'step-narrative', name: 'Narrative', capability_id: 'cap-narrative-agent', description: 'Produce actionable recommendations.', depends_on: ['step-crosstab'], output_artifacts: ['insight_summary','story_beats'] },
        { id: 'step-visualization', name: 'Visualization', capability_id: 'cap-visualization-agent', description: 'Generate chart pack and dashboard.', depends_on: ['step-narrative'], output_artifacts: ['charts','dashboard'] },
        { id: 'step-delivery', name: 'Delivery', capability_id: 'cap-connector-agent', description: 'Deliver outputs and track distribution status.', depends_on: ['step-visualization'], output_artifacts: ['delivery_receipts'] },
        { id: 'step-advisor', name: 'Advisor', capability_id: 'cap-advisor-agent', description: 'Track ROI and learning loops.', depends_on: ['step-delivery'], output_artifacts: ['recommendations','learning_updates'] },
      ],
    },
  ]

  const specialistFlows = specialistDefs.map(def => {
    const intakeCapability = def.primaryCapabilityId === 'cap-workflow-orchestrator' ? 'cap-workflow-orchestrator' : 'cap-brief-interpreter'
    const handoff = def.handoffCapabilityId ?? 'cap-connector-agent'
    return {
      id: `flow-${def.agentId}`, name: def.name, description: def.description,
      triggers: [def.trigger, 'agent_spark_prompt'],
      steps: [
        { id: `step-${def.agentId}-intake`, name: 'Context Intake', capability_id: intakeCapability, description: 'Capture constraints, goals, and output requirements.', output_artifacts: ['context_packet'] },
        { id: `step-${def.agentId}-execute`, name: 'Specialist Execution', capability_id: def.primaryCapabilityId, description: `Execute specialist actions for ${def.name.replace(' Specialist Flow', '')}.`, depends_on: [`step-${def.agentId}-intake`], output_artifacts: def.artifacts },
        { id: `step-${def.agentId}-validate`, name: 'Validation Gate', capability_id: 'cap-governance-agent', description: 'Attach evidence, confidence, and compliance notes.', depends_on: [`step-${def.agentId}-execute`], output_artifacts: ['validation_report'] },
        { id: `step-${def.agentId}-handoff`, name: 'Handoff', capability_id: handoff, description: 'Prepare downstream handoff and next-step recommendations.', depends_on: [`step-${def.agentId}-validate`], output_artifacts: ['handoff_note'] },
      ],
    }
  })

  return [...coreFlows, ...specialistFlows]
}

const seedRuns = [
  {
    id: 'run-001', flow_id: 'flow-brief-interpretation', status: 'completed',
    started_at: '2026-02-10T18:10:00Z', completed_at: '2026-02-10T18:12:30Z',
    brief: 'Summarize streaming bundle adoption for Gen Z creators in US/UK with a client-ready narrative.',
    analysis_config: null,
    outputs: [
      { id: 'out-001', label: 'Structured Brief', type: 'insight', summary: 'Objective, audience, markets, KPIs, and output spec confirmed.' },
      { id: 'out-002', label: 'Audience + Crosstab Snapshot', type: 'crosstab', summary: 'Gen Z creators index 1.58x for bundle adoption with significance tags.' },
      { id: 'out-003', label: 'Client Deck Storyboard', type: 'deck', summary: 'Six-slide storyline with citations, chart frames, and recommendations.' },
    ],
  },
  {
    id: 'run-002', flow_id: 'flow-campaign-lifecycle', status: 'running',
    started_at: '2026-02-10T18:20:00Z', completed_at: null,
    brief: 'Plan and measure a Q2 streaming campaign targeting hybrid workers globally.',
    analysis_config: null,
    outputs: [
      { id: 'out-004', label: 'Audience Definition', type: 'dataset', summary: 'Hybrid workers segment assembled across five key markets.' },
      { id: 'out-005', label: 'Early Lift Snapshot', type: 'crosstab', summary: '1.32x lift in ad-supported streaming intent among target segment.' },
    ],
  },
  {
    id: 'run-003', flow_id: 'flow-governance-agent', status: 'completed',
    started_at: '2026-02-11T09:05:00Z', completed_at: '2026-02-11T09:07:45Z',
    brief: 'Validate claims in the Q1 category report before client distribution.',
    analysis_config: null,
    outputs: [
      { id: 'out-006', label: 'Citation Bundle', type: 'report', summary: 'Attached source references and wave metadata for all claims.' },
      { id: 'out-007', label: 'Validation Report', type: 'insight', summary: 'Flagged two medium-confidence claims requiring caveat language.' },
    ],
  },
]

// ── Main seed function ──────────────────────────────────────────────

export function seed() {
  const db = getDb()

  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as cnt FROM waves').get() as { cnt: number }
  if (count.cnt > 0) {
    console.log('Database already seeded, skipping.')
    return
  }

  console.log('Seeding database...')

  const insertWave = db.prepare(`INSERT INTO waves (id, name, study_id, study_name, year, quarter, start_date, end_date, location_ids, sample_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insertSurveyData = db.prepare(`INSERT INTO survey_data (wave_id, question_id, datapoint_id, category, question_name, datapoint_name, respondent_count, percentage, index_vs_avg, sample_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insertCapability = db.prepare(`INSERT INTO capabilities (id, name, type, category, description, inputs, outputs, dependencies, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insertFlow = db.prepare(`INSERT INTO flows (id, name, description, triggers, steps) VALUES (?, ?, ?, ?, ?)`)
  const insertLinkage = db.prepare(`INSERT INTO linkages (id, name, description, endpoints, auth) VALUES (?, ?, ?, ?, ?)`)
  const insertRun = db.prepare(`INSERT INTO runs (id, flow_id, status, brief, analysis_config, started_at, completed_at, outputs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)

  const seedAll = db.transaction(() => {
    // Waves
    for (const w of waves) {
      insertWave.run(w.id, w.name, w.study_id, w.study_name, w.year, w.quarter, w.start_date, w.end_date, JSON.stringify(w.location_ids), w.sample_size)
    }
    console.log(`  Seeded ${waves.length} waves`)

    // Survey data: generate rows for each wave×question×datapoint with realistic numbers
    let surveyRows = 0
    for (const q of questions) {
      for (const waveId of q.wave_ids) {
        const wave = waves.find(w => w.id === waveId)
        if (!wave) continue

        // Generate percentages that sum to roughly 100 for single-select, or realistic for multi-select
        const dpCount = q.datapoints.length
        for (let i = 0; i < dpCount; i++) {
          const dp = q.datapoints[i]
          const seed = hashSeed(`${waveId}:${q.id}:${dp.id}`)
          const basePct = seededRandom(seed) * 40 + 5 // 5% to 45%
          const pct = Math.round(basePct * 10) / 10
          const respondents = Math.round(wave.sample_size * pct / 100)
          const indexVsAvg = Math.round((80 + seededRandom(seed + 1) * 60) * 100) / 100 // 80 to 140

          insertSurveyData.run(waveId, q.id, dp.id, q.category, q.name, dp.name, respondents, pct, indexVsAvg, wave.sample_size)
          surveyRows++
        }
      }
    }
    console.log(`  Seeded ${surveyRows} survey data rows`)

    // Capabilities
    for (const c of capabilities) {
      insertCapability.run(c.id, c.name, c.type, c.category, c.description, JSON.stringify(c.inputs), JSON.stringify(c.outputs), JSON.stringify(c.dependencies), c.confidence)
    }
    console.log(`  Seeded ${capabilities.length} capabilities`)

    // Flows
    const flows = buildFlows()
    for (const f of flows) {
      insertFlow.run(f.id, f.name, f.description, JSON.stringify(f.triggers), JSON.stringify(f.steps))
    }
    console.log(`  Seeded ${flows.length} flows`)

    // Linkages
    for (const l of linkages) {
      insertLinkage.run(l.id, l.name, l.description, JSON.stringify(l.endpoints), l.auth)
    }
    console.log(`  Seeded ${linkages.length} linkages`)

    // Seed runs
    for (const r of seedRuns) {
      insertRun.run(r.id, r.flow_id, r.status, r.brief, r.analysis_config ? JSON.stringify(r.analysis_config) : null, r.started_at, r.completed_at, JSON.stringify(r.outputs))
    }
    console.log(`  Seeded ${seedRuns.length} runs`)
  })

  seedAll()
  console.log('Seeding complete.')
}

// Run directly: npx tsx src/db/seed.ts
if (process.argv[1]?.includes('seed')) {
  seed()
  closeDb()
}
