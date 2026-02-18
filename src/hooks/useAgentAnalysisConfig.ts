import { useState, useCallback } from 'react'
import type { AgentAnalysisConfig, AgentTimeframe, AgentGranularity, AgentRebaseMode } from '@/api/types'

const defaultConfig: AgentAnalysisConfig = {}

export function useAgentAnalysisConfig() {
  const [config, setConfig] = useState<AgentAnalysisConfig>(defaultConfig)

  const setTimeframe = useCallback((timeframe: AgentTimeframe | undefined) => {
    setConfig((prev) => ({ ...prev, timeframe }))
  }, [])

  const setGranularity = useCallback((granularity: AgentGranularity | undefined) => {
    setConfig((prev) => ({ ...prev, granularity }))
  }, [])

  const setRebaseMode = useCallback((rebase_mode: AgentRebaseMode | undefined) => {
    setConfig((prev) => ({ ...prev, rebase_mode }))
  }, [])

  const setWaveIds = useCallback((wave_ids: string[]) => {
    setConfig((prev) => ({ ...prev, wave_ids }))
  }, [])

  const addWaveId = useCallback((waveId: string) => {
    setConfig((prev) => {
      const existing = prev.wave_ids ?? []
      if (existing.includes(waveId)) return prev
      return { ...prev, wave_ids: [...existing, waveId] }
    })
  }, [])

  const removeWaveId = useCallback((waveId: string) => {
    setConfig((prev) => ({
      ...prev,
      wave_ids: (prev.wave_ids ?? []).filter((id) => id !== waveId),
    }))
  }, [])

  const setCompareWaves = useCallback((compare_waves: boolean) => {
    setConfig((prev) => ({ ...prev, compare_waves }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig)
  }, [])

  const hasActiveFilters =
    !!config.timeframe ||
    !!config.granularity ||
    !!config.rebase_mode ||
    (config.wave_ids && config.wave_ids.length > 0) ||
    !!config.compare_waves

  return {
    config,
    setTimeframe,
    setGranularity,
    setRebaseMode,
    setWaveIds,
    addWaveId,
    removeWaveId,
    setCompareWaves,
    resetConfig,
    hasActiveFilters,
  }
}
