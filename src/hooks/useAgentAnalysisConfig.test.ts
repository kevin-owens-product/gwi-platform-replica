import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAgentAnalysisConfig } from './useAgentAnalysisConfig'

describe('useAgentAnalysisConfig', () => {
  it('starts with empty default config', () => {
    const { result } = renderHook(() => useAgentAnalysisConfig())
    expect(result.current.config).toEqual({})
    expect(result.current.hasActiveFilters).toBe(false)
  })

  describe('setTimeframe', () => {
    it('sets timeframe to quarterly', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setTimeframe('quarterly'))
      expect(result.current.config.timeframe).toBe('quarterly')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('sets timeframe to monthly', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setTimeframe('monthly'))
      expect(result.current.config.timeframe).toBe('monthly')
    })

    it('sets timeframe to weekly', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setTimeframe('weekly'))
      expect(result.current.config.timeframe).toBe('weekly')
    })

    it('clears timeframe when set to undefined', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setTimeframe('monthly'))
      expect(result.current.config.timeframe).toBe('monthly')
      act(() => result.current.setTimeframe(undefined))
      expect(result.current.config.timeframe).toBeUndefined()
    })
  })

  describe('setGranularity', () => {
    it('sets granularity to dataset', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setGranularity('dataset'))
      expect(result.current.config.granularity).toBe('dataset')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('sets granularity to question', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setGranularity('question'))
      expect(result.current.config.granularity).toBe('question')
    })

    it('sets granularity to datapoint', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setGranularity('datapoint'))
      expect(result.current.config.granularity).toBe('datapoint')
    })

    it('clears granularity when set to undefined', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setGranularity('question'))
      act(() => result.current.setGranularity(undefined))
      expect(result.current.config.granularity).toBeUndefined()
    })
  })

  describe('setRebaseMode', () => {
    it('sets rebase mode to column', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setRebaseMode('column'))
      expect(result.current.config.rebase_mode).toBe('column')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('sets rebase mode to row', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setRebaseMode('row'))
      expect(result.current.config.rebase_mode).toBe('row')
    })

    it('sets rebase mode to total', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setRebaseMode('total'))
      expect(result.current.config.rebase_mode).toBe('total')
    })

    it('sets rebase mode to respondent_base', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setRebaseMode('respondent_base'))
      expect(result.current.config.rebase_mode).toBe('respondent_base')
    })

    it('clears rebase mode when set to undefined', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setRebaseMode('column'))
      act(() => result.current.setRebaseMode(undefined))
      expect(result.current.config.rebase_mode).toBeUndefined()
    })
  })

  describe('wave management', () => {
    it('adds a wave id', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.addWaveId('wave_2024q4'))
      expect(result.current.config.wave_ids).toEqual(['wave_2024q4'])
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('does not add duplicate wave id', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.addWaveId('wave_2024q4'))
      act(() => result.current.addWaveId('wave_2024q4'))
      expect(result.current.config.wave_ids).toEqual(['wave_2024q4'])
    })

    it('adds multiple distinct wave ids', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.addWaveId('wave_2024q4'))
      act(() => result.current.addWaveId('wave_2024q3'))
      expect(result.current.config.wave_ids).toEqual(['wave_2024q4', 'wave_2024q3'])
    })

    it('removes a wave id', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.addWaveId('wave_2024q4'))
      act(() => result.current.addWaveId('wave_2024q3'))
      act(() => result.current.removeWaveId('wave_2024q4'))
      expect(result.current.config.wave_ids).toEqual(['wave_2024q3'])
    })

    it('sets wave ids directly', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setWaveIds(['wave_2024q4', 'wave_2024q3', 'wave_2024q2']))
      expect(result.current.config.wave_ids).toEqual(['wave_2024q4', 'wave_2024q3', 'wave_2024q2'])
    })
  })

  describe('setCompareWaves', () => {
    it('enables wave comparison', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setCompareWaves(true))
      expect(result.current.config.compare_waves).toBe(true)
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('disables wave comparison', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setCompareWaves(true))
      act(() => result.current.setCompareWaves(false))
      expect(result.current.config.compare_waves).toBe(false)
    })
  })

  describe('resetConfig', () => {
    it('resets all values back to defaults', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => {
        result.current.setTimeframe('monthly')
        result.current.setGranularity('question')
        result.current.setRebaseMode('row')
        result.current.addWaveId('wave_2024q4')
        result.current.setCompareWaves(true)
      })
      expect(result.current.hasActiveFilters).toBe(true)

      act(() => result.current.resetConfig())
      expect(result.current.config).toEqual({})
      expect(result.current.hasActiveFilters).toBe(false)
    })
  })

  describe('hasActiveFilters', () => {
    it('is false with empty config', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('is true with only timeframe set', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setTimeframe('weekly'))
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('is true with only granularity set', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setGranularity('dataset'))
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('is true with only rebase mode set', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setRebaseMode('total'))
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('is true with only wave ids set', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.addWaveId('wave_2024q4'))
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('is false with empty wave ids array', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setWaveIds([]))
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('is true with compare_waves set', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setCompareWaves(true))
      expect(result.current.hasActiveFilters).toBe(true)
    })
  })

  describe('multiple filters combined', () => {
    it('preserves other values when setting one filter', () => {
      const { result } = renderHook(() => useAgentAnalysisConfig())
      act(() => result.current.setTimeframe('monthly'))
      act(() => result.current.setGranularity('question'))
      act(() => result.current.setRebaseMode('row'))

      expect(result.current.config).toEqual({
        timeframe: 'monthly',
        granularity: 'question',
        rebase_mode: 'row',
      })
    })
  })
})
