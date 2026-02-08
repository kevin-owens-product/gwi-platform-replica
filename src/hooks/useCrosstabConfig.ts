import { useState, useCallback, useRef } from 'react'
import type {
  CrosstabConfig,
  CrosstabDimension,
  CrosstabHighlight,
  MetricType,
  WaveId,
  AudienceExpression,
  StatisticalTestConfig,
  SuppressionConfig,
  WeightingConfig,
  RebasingConfig,
  SortConfig,
  WaveComparisonConfig,
  BannerConfig,
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

  const addRowNet = useCallback((label: string, datapointIds: string[]) => {
    setConfig((prev) => {
      const dim: CrosstabDimension = { type: 'net', label, datapoint_ids: datapointIds }
      return { ...prev, rows: [...prev.rows, dim] }
    })
  }, [])

  const addRowCalculated = useCallback((label: string, formula?: string) => {
    setConfig((prev) => {
      const dim: CrosstabDimension = { type: 'calculated', label, formula: formula as any }
      return { ...prev, rows: [...prev.rows, dim] }
    })
  }, [])

  const removeRow = useCallback((index: number) => {
    setConfig((prev) => ({ ...prev, rows: prev.rows.filter((_, i) => i !== index) }))
  }, [])

  const reorderRows = useCallback((fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      const rows = [...prev.rows]
      const [moved] = rows.splice(fromIndex, 1)
      rows.splice(toIndex, 0, moved)
      return { ...prev, rows }
    })
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

  const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      const columns = [...prev.columns]
      const [moved] = columns.splice(fromIndex, 1)
      columns.splice(toIndex, 0, moved)
      return { ...prev, columns }
    })
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

  // --- Timeframe ---
  const setTimeframe = useCallback((timeframe: 'daily' | 'weekly' | 'monthly' | undefined) => {
    setConfig((prev) => ({ ...prev, timeframe }))
  }, [])

  // --- Statistical testing ---
  const setStatTest = useCallback((statTest: StatisticalTestConfig | undefined) => {
    setConfig((prev) => ({ ...prev, stat_test: statTest }))
  }, [])

  const setStatTestType = useCallback((testType: string) => {
    setConfig((prev) => {
      if (testType === 'none') {
        return { ...prev, stat_test: undefined }
      }
      return {
        ...prev,
        stat_test: {
          ...prev.stat_test,
          test_type: testType as StatisticalTestConfig['test_type'],
          confidence_levels: prev.stat_test?.confidence_levels ?? { primary: 95 },
          notation: prev.stat_test?.notation ?? 'letter',
          overlap_handling: prev.stat_test?.overlap_handling ?? 'effective_base',
        },
      }
    })
  }, [])

  const setConfidenceLevel = useCallback((level: number) => {
    setConfig((prev) => ({
      ...prev,
      stat_test: prev.stat_test ? {
        ...prev.stat_test,
        confidence_levels: { ...prev.stat_test.confidence_levels, primary: level },
      } : undefined,
    }))
  }, [])

  // --- Suppression ---
  const setSuppression = useCallback((suppression: SuppressionConfig | undefined) => {
    setConfig((prev) => ({ ...prev, suppression }))
  }, [])

  const setSuppressionAction = useCallback((action: string) => {
    setConfig((prev) => {
      if (action === 'off') {
        return { ...prev, suppression: undefined }
      }
      return {
        ...prev,
        suppression: {
          enabled: true,
          minimum_base_size: prev.suppression?.minimum_base_size ?? 30,
          suppression_action: action as SuppressionConfig['suppression_action'],
          apply_to: prev.suppression?.apply_to ?? 'cells',
          suppress_significance: true,
          complementary_suppression: false,
          footnote_on_suppression: true,
        },
      }
    })
  }, [])

  const setSuppressionThreshold = useCallback((threshold: number) => {
    setConfig((prev) => ({
      ...prev,
      suppression: prev.suppression ? {
        ...prev.suppression,
        minimum_base_size: threshold,
      } : undefined,
    }))
  }, [])

  // --- Weighting ---
  const setWeighting = useCallback((weighting: WeightingConfig | undefined) => {
    setConfig((prev) => ({ ...prev, weighting }))
  }, [])

  // --- Rebasing ---
  const setRebasing = useCallback((rebasing: RebasingConfig | undefined) => {
    setConfig((prev) => ({ ...prev, rebasing }))
  }, [])

  const setRebasingBase = useCallback((base: string) => {
    setConfig((prev) => ({
      ...prev,
      rebasing: {
        enabled: true,
        percentage_base: base as RebasingConfig['percentage_base'],
        exclude_no_answer: prev.rebasing?.exclude_no_answer ?? false,
      },
    }))
  }, [])

  // --- Sort ---
  const setSort = useCallback((sort: SortConfig | undefined) => {
    setConfig((prev) => ({ ...prev, sort }))
  }, [])

  const setSortBy = useCallback((sortBy: string) => {
    setConfig((prev) => ({
      ...prev,
      sort: {
        ...prev.sort,
        sort_by: sortBy as SortConfig['sort_by'],
        sort_direction: prev.sort?.sort_direction ?? 'descending',
      },
    }))
  }, [])

  // --- Wave comparison ---
  const setWaveComparison = useCallback((waveComparison: WaveComparisonConfig | undefined) => {
    setConfig((prev) => ({ ...prev, wave_comparison: waveComparison }))
  }, [])

  const setWaveComparisonMode = useCallback((mode: string) => {
    setConfig((prev) => {
      if (mode === 'single_wave') {
        return { ...prev, wave_comparison: undefined }
      }
      return {
        ...prev,
        wave_comparison: {
          mode: mode as WaveComparisonConfig['mode'],
          wave_ids: prev.wave_comparison?.wave_ids ?? [],
          show_delta: prev.wave_comparison?.show_delta ?? true,
          delta_format: prev.wave_comparison?.delta_format ?? 'absolute',
          significance_between_waves: prev.wave_comparison?.significance_between_waves ?? false,
          trend_indicators: prev.wave_comparison?.trend_indicators ?? true,
          sparkline: prev.wave_comparison?.sparkline ?? (mode === 'trended'),
        },
      }
    })
  }, [])

  // --- Banner ---
  const setBanner = useCallback((banner: BannerConfig | undefined) => {
    setConfig((prev) => ({ ...prev, banner }))
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
    addRowNet,
    addRowCalculated,
    removeRow,
    reorderRows,
    addColumnQuestion,
    addColumnAudience,
    removeColumn,
    reorderColumns,
    toggleMetric,
    setMetrics,
    setBaseAudience,
    addWave,
    removeWave,
    setWaveIds,
    setLocationIds,
    setHighlight,
    setTimeframe,
    setStatTest,
    setStatTestType,
    setConfidenceLevel,
    setSuppression,
    setSuppressionAction,
    setSuppressionThreshold,
    setWeighting,
    setRebasing,
    setRebasingBase,
    setSort,
    setSortBy,
    setWaveComparison,
    setWaveComparisonMode,
    setBanner,
    isDirty,
    markSaved,
  }
}
