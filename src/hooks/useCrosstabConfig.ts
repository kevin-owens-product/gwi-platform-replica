import { useState, useCallback, useRef } from 'react'
import type {
  CrosstabConfig,
  CrosstabDimension,
  CrosstabHighlight,
  MetricType,
  WaveId,
  AudienceExpression,
} from '@/api/types'

const defaultConfig: CrosstabConfig = {
  rows: [],
  columns: [],
  metrics: ['audience_percentage'],
  wave_ids: [],
  location_ids: [],
}

export function useCrosstabConfig() {
  const [config, setConfig] = useState<CrosstabConfig>(defaultConfig)
  const savedRef = useRef<CrosstabConfig>(defaultConfig)

  const initializeFrom = useCallback((source: CrosstabConfig) => {
    setConfig(source)
    savedRef.current = source
  }, [])

  // --- Row mutations ---
  const addRowQuestion = useCallback((questionId: string, datapointIds?: string[]) => {
    setConfig((prev) => {
      if (prev.rows.some((r) => r.type === 'question' && r.question_id === questionId)) return prev
      const dim: CrosstabDimension = { type: 'question', question_id: questionId, datapoint_ids: datapointIds }
      return { ...prev, rows: [...prev.rows, dim] }
    })
  }, [])

  const removeRow = useCallback((index: number) => {
    setConfig((prev) => ({ ...prev, rows: prev.rows.filter((_, i) => i !== index) }))
  }, [])

  // --- Column mutations ---
  const addColumnQuestion = useCallback((questionId: string, datapointIds?: string[]) => {
    setConfig((prev) => {
      if (prev.columns.some((c) => c.type === 'question' && c.question_id === questionId)) return prev
      const dim: CrosstabDimension = { type: 'question', question_id: questionId, datapoint_ids: datapointIds }
      return { ...prev, columns: [...prev.columns, dim] }
    })
  }, [])

  const addColumnAudience = useCallback((audienceId: string) => {
    setConfig((prev) => {
      if (prev.columns.some((c) => c.type === 'audience' && c.audience_id === audienceId)) return prev
      const dim: CrosstabDimension = { type: 'audience', audience_id: audienceId }
      return { ...prev, columns: [...prev.columns, dim] }
    })
  }, [])

  const removeColumn = useCallback((index: number) => {
    setConfig((prev) => ({ ...prev, columns: prev.columns.filter((_, i) => i !== index) }))
  }, [])

  // --- Metric mutations ---
  const toggleMetric = useCallback((metric: MetricType) => {
    setConfig((prev) => {
      const has = prev.metrics.includes(metric)
      if (has) {
        if (prev.metrics.length <= 1) return prev // min 1
        return { ...prev, metrics: prev.metrics.filter((m) => m !== metric) }
      }
      return { ...prev, metrics: [...prev.metrics, metric] }
    })
  }, [])

  const setMetrics = useCallback((metrics: MetricType[]) => {
    if (metrics.length === 0) return
    setConfig((prev) => ({ ...prev, metrics }))
  }, [])

  // --- Base audience ---
  const setBaseAudience = useCallback((expr: AudienceExpression | undefined) => {
    setConfig((prev) => ({ ...prev, base_audience: expr }))
  }, [])

  // --- Waves ---
  const addWave = useCallback((waveId: WaveId) => {
    setConfig((prev) => {
      if (prev.wave_ids.some((w) => w.study_id === waveId.study_id && w.wave_id === waveId.wave_id)) return prev
      return { ...prev, wave_ids: [...prev.wave_ids, waveId] }
    })
  }, [])

  const removeWave = useCallback((index: number) => {
    setConfig((prev) => ({ ...prev, wave_ids: prev.wave_ids.filter((_, i) => i !== index) }))
  }, [])

  const setWaveIds = useCallback((waveIds: WaveId[]) => {
    setConfig((prev) => ({ ...prev, wave_ids: waveIds }))
  }, [])

  // --- Location ---
  const setLocationIds = useCallback((ids: string[]) => {
    setConfig((prev) => ({ ...prev, location_ids: ids }))
  }, [])

  // --- Highlight ---
  const setHighlight = useCallback((highlight: CrosstabHighlight | undefined) => {
    setConfig((prev) => ({ ...prev, highlight }))
  }, [])

  // --- Dirty tracking ---
  const isDirty = JSON.stringify(config) !== JSON.stringify(savedRef.current)

  const markSaved = useCallback(() => {
    savedRef.current = config
  }, [config])

  return {
    config,
    initializeFrom,
    addRowQuestion,
    removeRow,
    addColumnQuestion,
    addColumnAudience,
    removeColumn,
    toggleMetric,
    setMetrics,
    setBaseAudience,
    addWave,
    removeWave,
    setWaveIds,
    setLocationIds,
    setHighlight,
    isDirty,
    markSaved,
  }
}
