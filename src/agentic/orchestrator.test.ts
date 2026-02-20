import { describe, it, expect } from 'vitest'
import { runAgenticFlow, getAgenticFlow } from './orchestrator'
import type { AgentAnalysisConfig } from '@/api/types/agentic'

describe('runAgenticFlow', () => {
  it('returns a completed run for a valid flow', () => {
    const run = runAgenticFlow('brief-interpretation', 'Test brief')
    expect(run.status).toBe('completed')
    expect(run.flow_id).toBe('brief-interpretation')
    expect(run.brief).toBe('Test brief')
    expect(run.outputs.length).toBeGreaterThan(0)
  })

  it('returns a failed run for an unknown flow', () => {
    const run = runAgenticFlow('nonexistent-flow', 'Test brief')
    expect(run.status).toBe('failed')
    expect(run.outputs[0].label).toBe('Flow Error')
    expect(run.outputs[0].type).toBe('alert')
  })

  it('stores analysis_config on a completed run', () => {
    const config: AgentAnalysisConfig = {
      timeframe: 'monthly',
      granularity: 'question',
      rebase_mode: 'column',
    }
    const run = runAgenticFlow('brief-interpretation', 'Test brief', config)
    expect(run.analysis_config).toEqual(config)
    expect(run.status).toBe('completed')
  })

  it('stores analysis_config on a failed run', () => {
    const config: AgentAnalysisConfig = { timeframe: 'weekly' }
    const run = runAgenticFlow('nonexistent', 'Test brief', config)
    expect(run.analysis_config).toEqual(config)
    expect(run.status).toBe('failed')
  })

  it('includes timeframe in output summaries when provided', () => {
    const config: AgentAnalysisConfig = { timeframe: 'quarterly' }
    const run = runAgenticFlow('brief-interpretation', 'My brief', config)
    const hasFilterInfo = run.outputs.some((o) => o.summary.includes('quarterly'))
    expect(hasFilterInfo).toBe(true)
  })

  it('includes granularity in output summaries when provided', () => {
    const config: AgentAnalysisConfig = { granularity: 'datapoint' }
    const run = runAgenticFlow('brief-interpretation', 'My brief', config)
    const hasFilterInfo = run.outputs.some((o) => o.summary.includes('datapoint-level'))
    expect(hasFilterInfo).toBe(true)
  })

  it('does not include filter info in summaries when no config is provided', () => {
    const run = runAgenticFlow('brief-interpretation', 'My brief')
    const hasParens = run.outputs.some((o) => o.summary.includes('('))
    expect(hasParens).toBe(false)
  })

  it('generates unique run and output ids', () => {
    const run1 = runAgenticFlow('brief-interpretation', 'Brief 1')
    const run2 = runAgenticFlow('brief-interpretation', 'Brief 2')
    expect(run1.id).not.toBe(run2.id)
    expect(run1.outputs[0].id).not.toBe(run2.outputs[0].id)
  })

  it('sets completed_at for successful runs', () => {
    const run = runAgenticFlow('brief-interpretation', 'Brief')
    expect(run.completed_at).toBeDefined()
    expect(new Date(run.completed_at!).getTime()).toBeGreaterThan(new Date(run.started_at).getTime())
  })

  it('handles analysis_config with wave_ids', () => {
    const config: AgentAnalysisConfig = {
      wave_ids: ['wave_2024q4', 'wave_2024q3'],
      compare_waves: true,
    }
    const run = runAgenticFlow('campaign-lifecycle', 'Campaign brief', config)
    expect(run.analysis_config?.wave_ids).toEqual(['wave_2024q4', 'wave_2024q3'])
    expect(run.analysis_config?.compare_waves).toBe(true)
  })

  it('handles empty analysis_config gracefully', () => {
    const config: AgentAnalysisConfig = {}
    const run = runAgenticFlow('brief-interpretation', 'Brief', config)
    expect(run.analysis_config).toEqual({})
    // No filter label should be appended
    const hasParens = run.outputs.some((o) => o.summary.includes('('))
    expect(hasParens).toBe(false)
  })
})

describe('getAgenticFlow', () => {
  it('returns a flow by id', () => {
    const flow = getAgenticFlow('brief-interpretation')
    expect(flow).toBeDefined()
    expect(flow!.name).toBe('Brief Interpretation Flow')
  })

  it('returns undefined for unknown flow id', () => {
    const flow = getAgenticFlow('unknown')
    expect(flow).toBeUndefined()
  })

  it('returns specialist flows', () => {
    const flow = getAgenticFlow('flow-crosstab-analyst')
    expect(flow).toBeDefined()
    expect(flow!.steps.length).toBe(4)
  })
})
