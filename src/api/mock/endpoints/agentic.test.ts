import { describe, it, expect } from 'vitest'
import { agenticApi } from './agentic'
import type { AgentAnalysisConfig } from '../../types/agentic'

// The mock data uses 'flow-brief-interpretation' as the flow id (not 'brief-interpretation')
const VALID_FLOW_ID = 'flow-brief-interpretation'
const ALL_IN_ONE_FLOW_ID = 'flow-all-in-one-agent'

describe('mock agenticApi', () => {
  describe('listFlows', () => {
    it('returns an array of flows', async () => {
      const flows = await agenticApi.listFlows()
      expect(Array.isArray(flows)).toBe(true)
      expect(flows.length).toBeGreaterThan(0)
    })

    it('includes flow-brief-interpretation flow', async () => {
      const flows = await agenticApi.listFlows()
      const flow = flows.find((f) => f.id === VALID_FLOW_ID)
      expect(flow).toBeDefined()
      expect(flow!.name).toBe('Brief Interpretation Flow')
      expect(flow!.steps.length).toBe(6)
    })

    it('includes all-in-one flow with 10 lifecycle steps', async () => {
      const flows = await agenticApi.listFlows()
      const flow = flows.find((f) => f.id === ALL_IN_ONE_FLOW_ID)
      expect(flow).toBeDefined()
      expect(flow!.name).toBe('All In One Agent Flow')
      expect(flow!.steps.length).toBe(10)
      expect(flow!.steps[0].capability_id).toBe('cap-brief-interpreter')
      expect(flow!.steps[9].capability_id).toBe('cap-advisor-agent')
    })
  })

  describe('getFlow', () => {
    it('returns a flow by id', async () => {
      const flow = await agenticApi.getFlow(VALID_FLOW_ID)
      expect(flow).toBeDefined()
      expect(flow!.name).toBe('Brief Interpretation Flow')
    })

    it('returns undefined for unknown flow', async () => {
      const flow = await agenticApi.getFlow('nonexistent')
      expect(flow).toBeUndefined()
    })

    it('returns all-in-one flow by id', async () => {
      const flow = await agenticApi.getFlow(ALL_IN_ONE_FLOW_ID)
      expect(flow).toBeDefined()
      expect(flow!.steps.length).toBe(10)
    })
  })

  describe('runFlow', () => {
    it('returns a completed run for valid flow', async () => {
      const run = await agenticApi.runFlow(VALID_FLOW_ID, 'Test brief')
      expect(run.status).toBe('completed')
      expect(run.flow_id).toBe(VALID_FLOW_ID)
      expect(run.brief).toBe('Test brief')
      expect(run.outputs.length).toBeGreaterThan(0)
    })

    it('returns a failed run for unknown flow', async () => {
      const run = await agenticApi.runFlow('unknown-flow', 'Test brief')
      expect(run.status).toBe('failed')
      expect(run.outputs[0].type).toBe('alert')
    })

    it('stores analysis_config on the run', async () => {
      const config: AgentAnalysisConfig = {
        timeframe: 'monthly',
        granularity: 'question',
        rebase_mode: 'row',
      }
      const run = await agenticApi.runFlow(VALID_FLOW_ID, 'Test brief', config)
      expect(run.analysis_config).toEqual(config)
    })

    it('includes filter summary in output when config is provided', async () => {
      const config: AgentAnalysisConfig = {
        timeframe: 'weekly',
        granularity: 'datapoint',
        rebase_mode: 'total',
        wave_ids: ['wave_2024q4', 'wave_2024q3'],
        compare_waves: true,
      }
      const run = await agenticApi.runFlow(VALID_FLOW_ID, 'Test brief', config)
      const hasSummary = run.outputs.some((o) => o.summary.includes('[Filters:'))
      expect(hasSummary).toBe(true)

      const hasTimeframe = run.outputs.some((o) => o.summary.includes('timeframe: weekly'))
      expect(hasTimeframe).toBe(true)

      const hasGranularity = run.outputs.some((o) => o.summary.includes('granularity: datapoint'))
      expect(hasGranularity).toBe(true)

      const hasRebase = run.outputs.some((o) => o.summary.includes('rebase: total'))
      expect(hasRebase).toBe(true)

      const hasWaves = run.outputs.some((o) => o.summary.includes('waves: 2'))
      expect(hasWaves).toBe(true)

      const hasCompare = run.outputs.some((o) => o.summary.includes('wave comparison enabled'))
      expect(hasCompare).toBe(true)
    })

    it('does not include filter summary when no config', async () => {
      const run = await agenticApi.runFlow(VALID_FLOW_ID, 'Test brief')
      const hasSummary = run.outputs.some((o) => o.summary.includes('[Filters:'))
      expect(hasSummary).toBe(false)
    })

    it('does not include filter summary for empty config', async () => {
      const run = await agenticApi.runFlow(VALID_FLOW_ID, 'Test brief', {})
      const hasSummary = run.outputs.some((o) => o.summary.includes('[Filters:'))
      expect(hasSummary).toBe(false)
    })

    it('stores analysis_config on failed runs too', async () => {
      const config: AgentAnalysisConfig = { timeframe: 'quarterly' }
      const run = await agenticApi.runFlow('nonexistent', 'Test brief', config)
      expect(run.status).toBe('failed')
      expect(run.analysis_config).toEqual(config)
    })

    it('persists runs to the runs store', async () => {
      const runsBefore = await agenticApi.listRuns()
      const countBefore = runsBefore.length
      await agenticApi.runFlow(VALID_FLOW_ID, 'Persistence test')
      const runsAfter = await agenticApi.listRuns()
      expect(runsAfter.length).toBe(countBefore + 1)
    })

    it('runs all-in-one flow and returns outputs across lifecycle stages', async () => {
      const run = await agenticApi.runFlow(ALL_IN_ONE_FLOW_ID, 'End-to-end lifecycle test')
      expect(run.status).toBe('completed')
      expect(run.flow_id).toBe(ALL_IN_ONE_FLOW_ID)
      expect(run.outputs.length).toBeGreaterThanOrEqual(10)

      const outputLabels = run.outputs.map((output) => output.label)
      expect(outputLabels).toContain('Structured Brief')
      expect(outputLabels).toContain('Dashboard')
      expect(outputLabels).toContain('Delivery Receipts')
      expect(outputLabels).toContain('Recommendations')
    })
  })

  describe('getInventory', () => {
    it('returns capabilities, flows, and linkages', async () => {
      const inventory = await agenticApi.getInventory()
      expect(inventory.capabilities.length).toBeGreaterThan(0)
      expect(inventory.flows.length).toBeGreaterThan(0)
      expect(inventory.linkages.length).toBeGreaterThan(0)
    })
  })
})
