import { describe, it, expect } from 'vitest'
import type {
  AgentTimeframe,
  AgentGranularity,
  AgentRebaseMode,
  AgentAnalysisConfig,
  AgenticRun,
} from './agentic'

describe('AgentAnalysisConfig type contracts', () => {
  it('accepts valid timeframe values', () => {
    const timeframes: AgentTimeframe[] = ['quarterly', 'monthly', 'weekly']
    expect(timeframes).toHaveLength(3)
  })

  it('accepts valid granularity values', () => {
    const granularities: AgentGranularity[] = ['dataset', 'question', 'datapoint']
    expect(granularities).toHaveLength(3)
  })

  it('accepts valid rebase mode values', () => {
    const modes: AgentRebaseMode[] = ['column', 'row', 'total', 'respondent_base']
    expect(modes).toHaveLength(4)
  })

  it('allows empty config', () => {
    const config: AgentAnalysisConfig = {}
    expect(config).toEqual({})
  })

  it('allows full config', () => {
    const config: AgentAnalysisConfig = {
      timeframe: 'monthly',
      granularity: 'question',
      rebase_mode: 'column',
      wave_ids: ['wave_2024q4'],
      compare_waves: true,
    }
    expect(config.timeframe).toBe('monthly')
    expect(config.granularity).toBe('question')
    expect(config.rebase_mode).toBe('column')
    expect(config.wave_ids).toEqual(['wave_2024q4'])
    expect(config.compare_waves).toBe(true)
  })

  it('allows partial config', () => {
    const config: AgentAnalysisConfig = { timeframe: 'weekly' }
    expect(config.timeframe).toBe('weekly')
    expect(config.granularity).toBeUndefined()
  })

  it('allows AgenticRun with analysis_config', () => {
    const run: AgenticRun = {
      id: 'run-test',
      flow_id: 'brief-interpretation',
      status: 'completed',
      started_at: '2024-01-01T00:00:00Z',
      completed_at: '2024-01-01T00:02:00Z',
      brief: 'Test brief',
      analysis_config: {
        timeframe: 'quarterly',
        granularity: 'dataset',
      },
      outputs: [],
    }
    expect(run.analysis_config?.timeframe).toBe('quarterly')
    expect(run.analysis_config?.granularity).toBe('dataset')
  })

  it('allows AgenticRun without analysis_config', () => {
    const run: AgenticRun = {
      id: 'run-test',
      flow_id: 'brief-interpretation',
      status: 'completed',
      started_at: '2024-01-01T00:00:00Z',
      brief: 'Test brief',
      outputs: [],
    }
    expect(run.analysis_config).toBeUndefined()
  })
})
