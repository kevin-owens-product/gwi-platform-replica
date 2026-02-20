import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  InsightsBoardStoryPane,
  InsightsDataPane,
  InsightsQueryPane,
  InsightsSegmentPane,
  InsightsViewPane,
} from '@/components/insights'
import { Button } from '@/components/shared'
import {
  useConvertInsightAsset,
  useCreateInsightAsset,
  useInsightAsset,
  useInsightAssets,
  useInsightLineage,
  useRunInsightQuery,
  useUpdateInsightAsset,
} from '@/hooks/useInsights'
import { useAudiences } from '@/hooks/useAudiences'
import { useQuestions, useStudies, useWaves } from '@/hooks/useTaxonomy'
import { useWorkspaceStore } from '@/stores/workspace'
import type {
  Audience,
  ChartType,
  InsightAsset,
  InsightAssetType,
  InsightCompatibilityResult,
  InsightFilterSet,
  InsightLegacyLink,
  InsightQuerySpec,
  InsightStoryStep,
  RunInsightQueryResponse,
  WaveId,
} from '@/api/types'
import './InsightsStudio.css'

const DEFAULT_METRICS: InsightQuerySpec['metrics'] = ['audience_percentage']

function mergeFilters(...layers: InsightFilterSet[][]): InsightFilterSet[] {
  return layers.flat()
}

function createInitialQuerySpec(defaultStudyId: string | null, defaultWaveId: string | null, defaultMetric: string): InsightQuerySpec {
  const waveIds: WaveId[] = defaultWaveId
    ? [{ study_id: defaultStudyId ?? 'study_core', wave_id: defaultWaveId }]
    : [{ study_id: defaultStudyId ?? 'study_core', wave_id: 'wave_2024q4' }]

  return {
    question_ids: [],
    row_question_ids: [],
    column_question_ids: [],
    column_audience_ids: [],
    metrics: defaultMetric ? [defaultMetric as InsightQuerySpec['metrics'][number]] : DEFAULT_METRICS,
    filters: [],
    time: {
      wave_ids: waveIds,
      comparison_wave_ids: [],
      range_preset: 'latest',
      trend_mode: 'off',
    },
    rebase: {
      mode: 'respondent_base',
    },
    dataset: {
      primary_study_id: defaultStudyId ?? 'study_core',
      allowed_study_ids: defaultStudyId ? [defaultStudyId] : ['study_core'],
      enforce_compatibility: true,
    },
  }
}

function mergeQuerySpec(base: InsightQuerySpec, patch: Partial<InsightQuerySpec>): InsightQuerySpec {
  return {
    ...base,
    ...patch,
    time: patch.time ? { ...base.time, ...patch.time } : base.time,
    dataset: patch.dataset ? { ...base.dataset, ...patch.dataset } : base.dataset,
    rebase: patch.rebase ? { ...base.rebase, ...patch.rebase } : base.rebase,
    filters: patch.filters ?? base.filters,
  }
}

function compatibilityFromError(error: unknown): InsightCompatibilityResult | undefined {
  const maybe = error as { compatibility?: InsightCompatibilityResult }
  return maybe.compatibility
}

function legacyPath(type: string, id: string): string {
  switch (type) {
    case 'audience':
      return `/app/audiences/${id}`
    case 'chart':
      return `/app/chart-builder/chart/${id}`
    case 'crosstab':
      return `/app/crosstabs/${id}`
    case 'dashboard':
      return `/app/dashboards/${id}`
    case 'canvas':
      return '/app/canvas'
    default:
      return '/app'
  }
}

export default function InsightsStudio(): React.JSX.Element {
  const { assetId = '' } = useParams<{ assetId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const legacyType = searchParams.get('legacy_type') ?? undefined
  const legacyId = searchParams.get('legacy_id') ?? undefined

  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId)
  const insightDefaults = useWorkspaceStore((state) => state.insightWorkspaceDefaults)
  const setActiveInsightId = useWorkspaceStore((state) => state.setActiveInsightId)
  const setInsightWorkspaceDefaults = useWorkspaceStore((state) => state.setInsightWorkspaceDefaults)

  const [queryText, setQueryText] = useState('')
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
  const [segmentName, setSegmentName] = useState('New Insight Segment')
  const [selectedAudienceId, setSelectedAudienceId] = useState('')
  const [querySpec, setQuerySpec] = useState<InsightQuerySpec>(() =>
    createInitialQuerySpec(insightDefaults.datasetStudyId, insightDefaults.waveId, insightDefaults.metric),
  )
  const [viewMode, setViewMode] = useState<'chart' | 'crosstab'>('chart')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [queryResult, setQueryResult] = useState<RunInsightQueryResponse | null>(null)
  const [compatibility, setCompatibility] = useState<InsightCompatibilityResult | undefined>(undefined)
  const [boardViewIds, setBoardViewIds] = useState<string[]>([])
  const [storySteps, setStorySteps] = useState<InsightStoryStep[]>([])

  const { data: questionsResponse } = useQuestions({ per_page: 200, search: queryText || undefined })
  const { data: audiencesResponse } = useAudiences({ per_page: 100, project_id: activeProjectId || undefined })
  const { data: studies } = useStudies()
  const { data: waves } = useWaves({ study_id: querySpec.dataset.primary_study_id || undefined })

  const { data: assetsResponse } = useInsightAssets({ per_page: 100, project_id: activeProjectId || undefined })
  const { data: loadedAsset } = useInsightAsset(assetId)
  const { data: lineage } = useInsightLineage(assetId)

  const createAsset = useCreateInsightAsset()
  const updateAsset = useUpdateInsightAsset()
  const runQuery = useRunInsightQuery()
  const convertAsset = useConvertInsightAsset()

  const questions = useMemo(() => questionsResponse?.data ?? [], [questionsResponse])
  const audiences = useMemo(() => audiencesResponse?.data ?? [], [audiencesResponse])
  const assets = useMemo(() => assetsResponse?.data ?? [], [assetsResponse])

  const availableViews = useMemo(
    () => assets.filter((asset) => asset.type === 'view'),
    [assets],
  )

  const selectedAudience = useMemo(
    () => audiences.find((audience) => audience.id === selectedAudienceId),
    [audiences, selectedAudienceId],
  )

  useEffect(() => {
    if (!loadedAsset) return

    setActiveInsightId(loadedAsset.id)
    setSegmentName(loadedAsset.name)

    if (loadedAsset.query_spec) {
      setQuerySpec(loadedAsset.query_spec)
      setSelectedQuestionIds(loadedAsset.query_spec.question_ids)
    }

    if (loadedAsset.view_config) {
      setViewMode(loadedAsset.view_config.mode)
      setChartType(loadedAsset.view_config.chart_type)
    }

    if (loadedAsset.board_config) {
      setBoardViewIds(loadedAsset.board_config.view_asset_ids)
    }

    if (loadedAsset.story_config) {
      setStorySteps(loadedAsset.story_config.steps)
    }
  }, [loadedAsset, setActiveInsightId])

  useEffect(() => {
    setQuerySpec((prev) => ({
      ...prev,
      question_ids: selectedQuestionIds,
      row_question_ids: selectedQuestionIds,
    }))
  }, [selectedQuestionIds])

  useEffect(() => {
    setQuerySpec((prev) => ({
      ...prev,
      base_audience: selectedAudience?.expression,
    }))
  }, [selectedAudience])

  const effectiveFilters = useMemo(() => {
    const workspaceFilters = (insightDefaults.filterPresets ?? []).map<InsightFilterSet>((filterPreset, index) => ({
      id: `workspace_${filterPreset}_${index}`,
      question_id: 'workspace_preset',
      datapoint_ids: [filterPreset],
      operator: 'include',
      source: 'workspace',
    }))

    return mergeFilters(workspaceFilters, querySpec.filters)
  }, [insightDefaults.filterPresets, querySpec.filters])

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  const handleApplySuggestion = (suggestionId: string) => {
    const suggestion = compatibility?.suggestions.find((item) => item.id === suggestionId)
    if (!suggestion) return

    setQuerySpec((prev) => mergeQuerySpec(prev, suggestion.patch))
    toast.success('Compatibility suggestion applied')
  }

  const handleRunQuery = async () => {
    try {
      const response = await runQuery.mutateAsync({
        view_mode: viewMode,
        query_spec: {
          ...querySpec,
          filters: effectiveFilters,
        },
      })
      setQueryResult(response)
      setCompatibility(response.compatibility)
      if (response.compatibility.issues.length > 0) {
        toast('Query ran with compatibility warnings')
      }
    } catch (error) {
      const nextCompatibility = compatibilityFromError(error)
      if (nextCompatibility) {
        setCompatibility(nextCompatibility)
        toast.error('Query blocked by compatibility checks')
      } else {
        toast.error('Failed to run insight query')
      }
    }
  }

  const saveAsset = async (
    type: InsightAssetType,
    payload: Partial<InsightAsset>,
  ) => {
    const legacyLinks = legacyType && legacyId
      ? [{ type: legacyType as InsightLegacyLink['type'], id: legacyId, path: legacyPath(legacyType, legacyId) }]
      : payload.legacy_links

    const createPayload = {
      type,
      name: payload.name ?? segmentName,
      description: payload.description,
      project_id: activeProjectId || undefined,
      query_spec: payload.query_spec,
      view_config: payload.view_config,
      board_config: payload.board_config,
      story_config: payload.story_config,
      legacy_links: legacyLinks,
      tags: payload.tags,
    }

    if (loadedAsset?.id && loadedAsset.type === type) {
      await updateAsset.mutateAsync({
        id: loadedAsset.id,
        data: createPayload,
      })

      setActiveInsightId(loadedAsset.id)
      return loadedAsset.id
    }

    const created = await createAsset.mutateAsync(createPayload)
    setActiveInsightId(created.id)
    return created.id
  }

  const handleSaveSegment = async () => {
    if (!segmentName.trim()) {
      toast.error('Enter a segment name')
      return
    }

    const savedId = await saveAsset('segment', {
      name: segmentName,
      query_spec: querySpec,
      tags: ['insights', 'segment'],
    })

    navigate(`/app/insights/${savedId}`)
  }

  const handleSaveView = async () => {
    const savedId = await saveAsset('view', {
      name: `${segmentName} view`,
      query_spec: querySpec,
      view_config: {
        mode: viewMode,
        chart_type: chartType,
        crosstab_highlight: 'heatmap',
        show_legend: true,
        show_grid: true,
        show_labels: true,
      },
      tags: ['insights', 'view'],
    })

    navigate(`/app/insights/${savedId}`)
  }

  const handleSaveBoard = async () => {
    const savedId = await saveAsset('board', {
      name: `${segmentName} board`,
      board_config: {
        view_asset_ids: boardViewIds,
        layout: { columns: 12, row_height: 80 },
        filter_overrides: [],
      },
      tags: ['insights', 'board'],
    })

    navigate(`/app/insights/${savedId}`)
  }

  const handleSaveStory = async () => {
    const savedId = await saveAsset('story', {
      name: `${segmentName} story`,
      story_config: {
        steps: storySteps,
      },
      tags: ['insights', 'story'],
    })

    navigate(`/app/insights/${savedId}`)
  }

  const handleConvertToBoard = async () => {
    if (!assetId) {
      toast.error('Save an asset before conversion')
      return
    }

    const converted = await convertAsset.mutateAsync({
      id: assetId,
      data: { target_type: 'board' },
    })

    navigate(`/app/insights/${converted.converted_asset.id}`)
  }

  const handleConvertToStory = async () => {
    if (!assetId) {
      toast.error('Save an asset before conversion')
      return
    }

    const converted = await convertAsset.mutateAsync({
      id: assetId,
      data: { target_type: 'story' },
    })

    navigate(`/app/insights/${converted.converted_asset.id}`)
  }

  useEffect(() => {
    setInsightWorkspaceDefaults({
      datasetStudyId: querySpec.dataset.primary_study_id ?? null,
      waveId: querySpec.time.wave_ids[0]?.wave_id ?? null,
      metric: querySpec.metrics[0] ?? 'audience_percentage',
    })
  }, [querySpec.dataset.primary_study_id, querySpec.metrics, querySpec.time.wave_ids, setInsightWorkspaceDefaults])

  return (
    <div className="insights-page">
      <div className="insights-header">
        <Link to="/app" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>

        <div className="insights-header__actions">
          <Button variant="secondary" icon={<Save size={14} />} onClick={handleSaveSegment}>
            Save Segment
          </Button>
          <Button variant="secondary" icon={<Save size={14} />} onClick={handleSaveView}>
            Save View
          </Button>
          <Button variant="secondary" icon={<Save size={14} />} onClick={handleSaveBoard}>
            Save Board
          </Button>
          <Button variant="primary" icon={<Save size={14} />} onClick={handleSaveStory}>
            Save Story
          </Button>
        </div>
      </div>

      {(legacyType && legacyId) && (
        <div className="insights-legacy-banner">
          <div>
            <strong>Opened from legacy {legacyType}</strong>
            <p>This insight is linked to `{legacyType}:{legacyId}` for interoperability.</p>
          </div>
          <Link to={legacyPath(legacyType, legacyId)} className="insights-legacy-banner__link">
            Open Legacy Asset
          </Link>
        </div>
      )}

      {loadedAsset?.legacy_links && loadedAsset.legacy_links.length > 0 && (
        <div className="insights-legacy-links">
          {loadedAsset.legacy_links.map((legacyLink) => (
            <Link key={`${legacyLink.type}_${legacyLink.id}`} to={legacyLink.path}>
              Open linked {legacyLink.type}
            </Link>
          ))}
        </div>
      )}

      <div className="insights-grid">
        <InsightsDataPane
          query={queryText}
          onQueryChange={setQueryText}
          questions={questions}
          selectedQuestionIds={selectedQuestionIds}
          onToggleQuestion={toggleQuestion}
        />

        <InsightsSegmentPane
          segmentName={segmentName}
          onSegmentNameChange={setSegmentName}
          selectedAudienceId={selectedAudienceId}
          onSelectedAudienceChange={setSelectedAudienceId}
          availableAudiences={audiences as Audience[]}
        />

        <InsightsQueryPane
          querySpec={querySpec}
          onQuerySpecChange={setQuerySpec}
          studies={studies ?? []}
          waves={waves ?? []}
          compatibility={compatibility}
          onApplySuggestion={handleApplySuggestion}
        />

        <InsightsViewPane
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          chartType={chartType}
          onChartTypeChange={setChartType}
          result={queryResult}
          isRunning={runQuery.isPending}
          onRunQuery={handleRunQuery}
        />

        <InsightsBoardStoryPane
          availableViews={availableViews}
          boardViewIds={boardViewIds}
          onBoardViewIdsChange={setBoardViewIds}
          storySteps={storySteps}
          onStoryStepsChange={setStorySteps}
          onSaveBoard={handleSaveBoard}
          onSaveStory={handleSaveStory}
          onConvertToBoard={handleConvertToBoard}
          onConvertToStory={handleConvertToStory}
          lineage={lineage}
        />
      </div>
    </div>
  )
}
