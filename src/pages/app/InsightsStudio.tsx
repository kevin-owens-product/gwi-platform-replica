import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CompareStep,
  DefineStep,
  InsightsContextRail,
  InsightsLanding,
  InsightsStepper,
  PublishStep,
  QueryStep,
} from '@/components/insights/workflow'
import { Button } from '@/components/shared'
import {
  useAutosaveInsightDraft,
  useInsightAssets,
  useInsightDraft,
  useInsightStepValidation,
  usePublishInsightDraft,
  useRunInsightQuery,
} from '@/hooks/useInsights'
import { useAudiences } from '@/hooks/useAudiences'
import { useQuestions, useStudies, useWaves } from '@/hooks/useTaxonomy'
import { insightsStudioEnabled, insightsStudioV2Enabled } from '@/features/insights/config'
import {
  getNextStep,
  getPreviousStep,
  isInsightStudioStep,
  resolveInsightRoute,
} from '@/features/insights/defaults'
import { createFlowDraftPatch, insightFlowTemplates, type InsightFlowTemplate } from '@/features/insights/flow-library'
import { useInsightDraftStore } from '@/features/insights/draft-store'
import { resolveInsightExecutionContext } from '@/features/insights/runtime'
import { isStepReachable } from '@/features/insights/validation'
import { useWorkspaceStore } from '@/stores/workspace'
import { trackInsightsTelemetry } from '@/utils/insights-telemetry'
import type {
  InsightCompatibilityResult,
  InsightFilterSet,
  InsightLegacyLink,
  InsightPublishResult,
  InsightQuerySpec,
  InsightStudioStep,
  RunInsightQueryResponse,
} from '@/api/types'
import LegacyInsightsStudio from './InsightsStudioLegacy'
import './InsightsStudio.css'

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

function getPrimaryActionLabel(step: InsightStudioStep): string {
  switch (step) {
    case 'define':
      return 'Continue'
    case 'query':
      return 'Run Baseline'
    case 'compare':
      return 'Run Compare'
    case 'publish':
      return 'Publish'
    default:
      return 'Continue'
  }
}

export default function InsightsStudio(): React.JSX.Element {
  const { step: routeStep, draftId: routeDraftId } = useParams<{ step?: string; draftId?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const legacyType = searchParams.get('legacy_type') ?? undefined
  const legacyId = searchParams.get('legacy_id') ?? undefined

  const resolvedRoute = resolveInsightRoute(routeStep, routeDraftId)
  const legacyRouteDraftId = resolvedRoute.draftId
  const currentStep = resolvedRoute.step

  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId)
  const favorites = useWorkspaceStore((state) => state.favorites)
  const insightDefaults = useWorkspaceStore((state) => state.insightWorkspaceDefaults)
  const setInsightWorkspaceDefaults = useWorkspaceStore((state) => state.setInsightWorkspaceDefaults)
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite)

  const localDraftMap = useInsightDraftStore((state) => state.drafts)
  const createDraftInStore = useInsightDraftStore((state) => state.createDraft)
  const setDraftCompatibility = useInsightDraftStore((state) => state.setDraftCompatibility)
  const markRunSuccess = useInsightDraftStore((state) => state.markRunSuccess)

  const [queryText, setQueryText] = useState('')
  const [queryResult, setQueryResult] = useState<RunInsightQueryResponse | null>(null)
  const [publishResult, setPublishResult] = useState<InsightPublishResult | null>(null)

  const {
    draft,
    draftId,
    ensureDraftId,
    updateDraft,
    isHydrating,
  } = useInsightDraft(legacyRouteDraftId, {
    studyId: insightDefaults.datasetStudyId,
    waveId: insightDefaults.waveId,
    metric: insightDefaults.metric,
    step: currentStep,
  })

  const { data: questionsResponse } = useQuestions({ per_page: 200, search: queryText || undefined })
  const { data: audiencesResponse } = useAudiences({ per_page: 100, project_id: activeProjectId || undefined })
  const { data: studies } = useStudies()
  const { data: waves } = useWaves({ study_id: draft?.query_spec.dataset.primary_study_id || undefined })
  const { data: assetsResponse } = useInsightAssets({ per_page: 100, project_id: activeProjectId || undefined })

  const runQuery = useRunInsightQuery()
  const autosaveDraft = useAutosaveInsightDraft()
  const publishDraft = usePublishInsightDraft()

  const questions = useMemo(() => questionsResponse?.data ?? [], [questionsResponse])
  const audiences = useMemo(() => audiencesResponse?.data ?? [], [audiencesResponse])
  const assets = useMemo(() => assetsResponse?.data ?? [], [assetsResponse])
  const localDrafts = useMemo(() => Object.values(localDraftMap), [localDraftMap])
  const pinnedFlowIds = useMemo(
    () => new Set(favorites.filter((item) => item.type === 'insights_flow').map((item) => item.id)),
    [favorites],
  )

  const availableViews = useMemo(() => assets.filter((asset) => asset.type === 'view'), [assets])
  const availableBoards = useMemo(() => assets.filter((asset) => asset.type === 'board'), [assets])

  const selectedAudience = useMemo(
    () => audiences.find((audience) => audience.id === draft?.base_audience_id),
    [audiences, draft?.base_audience_id],
  )

  const validations = useInsightStepValidation(draft)

  useEffect(() => {
    if (!insightsStudioV2Enabled) return
    if (routeStep && !isInsightStudioStep(routeStep)) {
      navigate(`/app/insights/publish/${routeStep}`, { replace: true })
    }
  }, [navigate, routeStep])

  useEffect(() => {
    if (!insightsStudioV2Enabled) return
    if (!routeStep) return
    if (currentStep === 'define') return
    if (isHydrating) return
    if (draft) return

    navigate('/app/insights/define', { replace: true })
  }, [currentStep, draft, isHydrating, navigate, routeStep])

  useEffect(() => {
    if (!routeStep) return

    trackInsightsTelemetry('insights.step.entered', {
      step: currentStep,
      draft_id: draft?.id ?? null,
    })
  }, [currentStep, draft?.id, routeStep])

  useEffect(() => {
    if (!routeStep) return
    if (!draft) return
    if (draft.step === currentStep) return

    updateDraft(draft.id, {
      step: currentStep,
    }, { structural: false, touch: false })
  }, [currentStep, draft, routeStep, updateDraft])

  useEffect(() => {
    if (!routeStep) return
    if (!draft) return

    setInsightWorkspaceDefaults({
      datasetStudyId: draft.query_spec.dataset.primary_study_id ?? null,
      waveId: draft.query_spec.time.wave_ids[0]?.wave_id ?? null,
      metric: draft.query_spec.metrics[0] ?? 'audience_percentage',
    })
  }, [draft, routeStep, setInsightWorkspaceDefaults])

  useEffect(() => {
    if (!routeStep) return
    if (!draft || draft.change_token === 0) return

    const timeoutId = setTimeout(() => {
      autosaveDraft.mutate({
        draft,
        projectId: activeProjectId || undefined,
      })
    }, 2000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [activeProjectId, autosaveDraft, draft, routeStep])

  const ensureRoutedDraftId = useCallback((step: InsightStudioStep = currentStep) => {
    const ensuredId = ensureDraftId()

    const legacyLink = legacyType && legacyId
      ? [{ type: legacyType as InsightLegacyLink['type'], id: legacyId, path: legacyPath(legacyType, legacyId) }]
      : undefined

    if (legacyLink && (!draft || !draft.legacy_links || draft.legacy_links.length === 0)) {
      updateDraft(ensuredId, { legacy_links: legacyLink }, { structural: false })
    }

    if (draftId !== ensuredId || routeStep !== step) {
      navigate(`/app/insights/${step}/${ensuredId}`, { replace: !draftId })
    }

    return ensuredId
  }, [currentStep, draft, draftId, ensureDraftId, legacyId, legacyType, navigate, routeStep, updateDraft])

  useEffect(() => {
    if (!insightsStudioV2Enabled) return
    if (routeStep) return
    if (!legacyType || !legacyId) return

    const createdDraftId = ensureRoutedDraftId('define')
    navigate(`/app/insights/define/${createdDraftId}`, { replace: true })
  }, [ensureRoutedDraftId, legacyId, legacyType, navigate, routeStep])

  const updateCurrentDraft = useCallback((patch: Parameters<typeof updateDraft>[1], options?: { structural?: boolean; touch?: boolean }) => {
    const ensuredId = ensureRoutedDraftId(currentStep)
    updateDraft(ensuredId, patch, {
      structural: options?.structural ?? true,
      touch: options?.touch ?? true,
    })
  }, [currentStep, ensureRoutedDraftId, updateDraft])

  const applyCompatibilityToDraft = useCallback((compatibility: InsightCompatibilityResult | undefined) => {
    if (!draft) return
    setDraftCompatibility(draft.id, compatibility)
  }, [draft, setDraftCompatibility])

  const runWithContext = useCallback(async (
    source: 'manual' | 'story_review' = 'manual',
    activeStoryStepId?: string,
  ) => {
    if (!draft) return

    const context = resolveInsightExecutionContext({
      querySpec: draft.query_spec,
      viewMode: draft.view_config.mode,
      chartType: draft.view_config.chart_type,
      workspaceFilterPresets: insightDefaults.filterPresets,
      boardFilterOverrides: draft.board_config.filter_overrides,
      storySteps: draft.story_config.steps,
      activeStoryStepId,
      assets,
    })

    try {
      const response = await runQuery.mutateAsync({
        view_mode: context.viewMode,
        query_spec: {
          ...context.baseQuerySpec,
          filters: context.effectiveFilters,
        },
      })

      setQueryResult(response)
      applyCompatibilityToDraft(response.compatibility)
      markRunSuccess(draft.id)

      updateCurrentDraft({
        query_spec: {
          ...draft.query_spec,
          filters: context.effectiveFilters,
        },
        view_config: {
          ...draft.view_config,
          mode: context.viewMode,
          chart_type: context.chartType,
        },
      }, { structural: false, touch: false })

      trackInsightsTelemetry('insights.query.run', {
        source,
        mode: context.viewMode,
        filter_count: context.effectiveFilters.length,
        story_step_id: context.activeStoryStep?.id ?? null,
      })

      if (response.compatibility.issues.length > 0) {
        toast('Query ran with compatibility warnings')
      } else if (source === 'manual') {
        toast.success(currentStep === 'compare' ? 'Compare query ran' : 'Query ran')
      }
    } catch (error) {
      const nextCompatibility = compatibilityFromError(error)
      if (nextCompatibility) {
        applyCompatibilityToDraft(nextCompatibility)
        trackInsightsTelemetry('insights.query.compatibility_blocked', {
          source,
          issue_count: nextCompatibility.issues.length,
          story_step_id: activeStoryStepId ?? null,
        })
        toast.error('Query blocked by compatibility checks')
      } else {
        toast.error('Failed to run insight query')
      }
    }
  }, [applyCompatibilityToDraft, assets, currentStep, draft, insightDefaults.filterPresets, markRunSuccess, runQuery, updateCurrentDraft])

  const handleMetricToggle = (metric: InsightQuerySpec['metrics'][number]) => {
    if (!draft) return

    const hasMetric = draft.query_spec.metrics.includes(metric)
    const nextMetrics = hasMetric
      ? draft.query_spec.metrics.filter((item) => item !== metric)
      : [...draft.query_spec.metrics, metric]

    updateCurrentDraft({
      query_spec: {
        ...draft.query_spec,
        metrics: nextMetrics.length > 0 ? nextMetrics : ['audience_percentage'],
      },
    })
  }

  const handleToggleQuestion = (questionId: string) => {
    if (!draft) return

    const selectedQuestionIds = draft.selected_question_ids.includes(questionId)
      ? draft.selected_question_ids.filter((id) => id !== questionId)
      : [...draft.selected_question_ids, questionId]

    updateCurrentDraft({
      selected_question_ids: selectedQuestionIds,
      query_spec: {
        ...draft.query_spec,
        question_ids: selectedQuestionIds,
        row_question_ids: selectedQuestionIds,
      },
    })
  }

  const handleAudienceChange = (audienceId: string) => {
    if (!draft) return

    const audience = audiences.find((entry) => entry.id === audienceId)
    updateCurrentDraft({
      base_audience_id: audienceId || undefined,
      query_spec: {
        ...draft.query_spec,
        base_audience: audience?.expression,
      },
    })
  }

  const handleAddCoreFilter = (filter: Omit<InsightFilterSet, 'id' | 'source'>) => {
    if (!draft) return

    updateCurrentDraft({
      query_spec: {
        ...draft.query_spec,
        filters: [
          ...draft.query_spec.filters,
          {
            id: `view_filter_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            source: 'view',
            ...filter,
          },
        ],
      },
    })
  }

  const handleRemoveCoreFilter = (filterId: string) => {
    if (!draft) return

    updateCurrentDraft({
      query_spec: {
        ...draft.query_spec,
        filters: draft.query_spec.filters.filter((filter) => filter.id !== filterId),
      },
    })
  }

  const handleApplySuggestion = (suggestionId: string) => {
    if (!draft || !draft.compatibility) return

    const suggestion = draft.compatibility.suggestions.find((item) => item.id === suggestionId)
    if (!suggestion) return

    updateCurrentDraft({
      query_spec: mergeQuerySpec(draft.query_spec, suggestion.patch),
    })

    toast.success('Compatibility suggestion applied')
  }

  const navigateToStep = (step: InsightStudioStep) => {
    if (!draft) {
      if (step !== 'define') {
        toast.error('Start from Define to create a draft first')
        return
      }
      navigate('/app/insights/define')
      return
    }

    if (validations && !isStepReachable(validations, step)) {
      toast.error('Complete previous steps before jumping ahead')
      return
    }

    const ensuredId = ensureRoutedDraftId(step)
    navigate(`/app/insights/${step}/${ensuredId}`)
  }

  const handlePrimaryAction = async () => {
    if (!draft || !validations) {
      const createdDraftId = ensureRoutedDraftId('define')
      navigate(`/app/insights/define/${createdDraftId}`)
      toast.success('Draft created')
      return
    }

    if (currentStep === 'query' || currentStep === 'compare') {
      const currentValidation = validations[currentStep]
      if (currentStep === 'query' && !currentValidation.valid) {
        toast.error(currentValidation.issues[0] ?? 'Step is incomplete')
        return
      }

      if (currentStep === 'compare' && draft.query_spec.time.wave_ids.length === 0) {
        toast.error('Select at least one primary wave.')
        return
      }

      trackInsightsTelemetry('insights.step.completed', {
        step: currentStep,
        draft_id: draft.id,
      })

      await runWithContext('manual')
      return
    }

    const currentValidation = validations[currentStep]
    if (!currentValidation.valid) {
      toast.error(currentValidation.issues[0] ?? 'Step is incomplete')
      return
    }

    trackInsightsTelemetry('insights.step.completed', {
      step: currentStep,
      draft_id: draft.id,
    })

    if (currentStep === 'publish') {
      const result = await publishDraft.mutateAsync({
        draft,
        projectId: activeProjectId || undefined,
      })
      setPublishResult(result)
      return
    }

    const nextStep = getNextStep(currentStep)
    const ensuredId = ensureRoutedDraftId(nextStep)
    navigate(`/app/insights/${nextStep}/${ensuredId}`)
  }

  const handleBack = () => {
    const previousStep = getPreviousStep(currentStep)
    if (previousStep === currentStep) {
      navigate('/app')
      return
    }

    if (!draft) {
      navigate(`/app/insights/${previousStep}`)
      return
    }

    const ensuredId = ensureRoutedDraftId(previousStep)
    navigate(`/app/insights/${previousStep}/${ensuredId}`)
  }

  const handleCreateDraft = () => {
    const createdDraftId = ensureRoutedDraftId('define')
    navigate(`/app/insights/define/${createdDraftId}`)
    toast.success('Draft created')
  }

  const handleStartBlankFlow = useCallback(() => {
    const createdDraftId = createDraftInStore({
      studyId: insightDefaults.datasetStudyId,
      waveId: insightDefaults.waveId,
      metric: insightDefaults.metric,
      step: 'define',
    })

    navigate(`/app/insights/define/${createdDraftId}`)
    toast.success('Draft created')
  }, [createDraftInStore, insightDefaults.datasetStudyId, insightDefaults.metric, insightDefaults.waveId, navigate])

  const handleStartFlow = useCallback((flow: InsightFlowTemplate) => {
    const createdDraftId = createDraftInStore({
      studyId: insightDefaults.datasetStudyId,
      waveId: insightDefaults.waveId,
      metric: insightDefaults.metric,
      step: 'define',
    })

    const createdDraft = useInsightDraftStore.getState().drafts[createdDraftId]
    if (createdDraft) {
      updateDraft(createdDraftId, createFlowDraftPatch(flow, createdDraft))
    }

    navigate(`/app/insights/define/${createdDraftId}`)
    toast.success(`Flow started: ${flow.name}`)
  }, [createDraftInStore, insightDefaults.datasetStudyId, insightDefaults.metric, insightDefaults.waveId, navigate, updateDraft])

  const handleResumeDraft = useCallback((resumeDraftId: string) => {
    const resumeStep = localDraftMap[resumeDraftId]?.step ?? 'define'
    navigate(`/app/insights/${resumeStep}/${resumeDraftId}`)
  }, [localDraftMap, navigate])

  const handleToggleFlowPin = useCallback((flow: InsightFlowTemplate) => {
    toggleFavorite({
      id: flow.id,
      type: 'insights_flow',
      name: flow.name,
    })
  }, [toggleFavorite])

  if (!insightsStudioEnabled) {
    return (
      <div className="insights-page">
        <div className="ins-note">
          <strong>Insights Studio rollout is disabled</strong>
          <p>Set `VITE_ENABLE_INSIGHTS_STUDIO=true` to enable this surface in the current environment.</p>
          <Link to="/app">Return to home</Link>
        </div>
      </div>
    )
  }

  if (!insightsStudioV2Enabled) {
    return <LegacyInsightsStudio />
  }

  if (!routeStep) {
    return (
      <div className="insights-page ins-workflow-page">
        <header className="ins-workflow-header">
          <Link to="/app" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          <div className="ins-workflow-header__meta">
            <h1>Insights Studio</h1>
            <p>Choose a pre-built flow, pin your favorites, or resume a draft.</p>
          </div>
        </header>
        <InsightsLanding
          flows={insightFlowTemplates}
          pinnedFlowIds={pinnedFlowIds}
          drafts={localDrafts}
          onTogglePin={handleToggleFlowPin}
          onStartFlow={handleStartFlow}
          onResumeDraft={handleResumeDraft}
          onStartBlank={handleStartBlankFlow}
        />
      </div>
    )
  }

  return (
    <div className="insights-page ins-workflow-page">
      <header className="ins-workflow-header">
        <Link to="/app" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
        <div className="ins-workflow-header__meta">
          <h1>{draft?.name ?? 'Insights Studio'}</h1>
          <p>Analyst workflow: Define -&gt; Query -&gt; Compare -&gt; Publish</p>
        </div>
      </header>

      {(legacyType && legacyId) && (
        <div className="insights-legacy-banner">
          <div>
            <strong>Opened from legacy {legacyType}</strong>
            <p>This draft stays linked to `{legacyType}:{legacyId}` for interoperability.</p>
          </div>
          <Link to={legacyPath(legacyType, legacyId)} className="insights-legacy-banner__link">
            Open Legacy Asset
          </Link>
        </div>
      )}

      <InsightsStepper
        currentStep={currentStep}
        validations={validations ?? {
          define: { valid: false, issues: [] },
          query: { valid: false, issues: [] },
          compare: { valid: false, issues: [] },
          publish: { valid: false, issues: [] },
        }}
        onStepClick={navigateToStep}
      />

      <div className="ins-workflow-layout">
        <main className="ins-workflow-main">
          {!draft && (
            <section className="ins-step-pane">
              <header className="ins-step-pane__header">
                <h2>Start your draft</h2>
                <p>Begin by setting an objective and selecting variables.</p>
              </header>
              <div className="ins-inline-actions">
                <button type="button" className="ins-run-btn" onClick={handleCreateDraft}>
                  Create draft
                </button>
              </div>
            </section>
          )}

          {draft && currentStep === 'define' && (
            <DefineStep
              draft={draft}
              query={queryText}
              onQueryChange={setQueryText}
              questions={questions}
              audiences={audiences}
              onObjectiveChange={(value) => updateCurrentDraft({ objective: value })}
              onNameChange={(value) => updateCurrentDraft({ name: value })}
              onAudienceChange={handleAudienceChange}
              onToggleQuestion={handleToggleQuestion}
            />
          )}

          {draft && currentStep === 'query' && (
            <QueryStep
              draft={draft}
              questions={questions}
              result={queryResult}
              onMetricToggle={handleMetricToggle}
              onViewModeChange={(mode) => updateCurrentDraft({ view_config: { ...draft.view_config, mode } })}
              onChartTypeChange={(chartType) => updateCurrentDraft({ view_config: { ...draft.view_config, chart_type: chartType } })}
              onAddFilter={handleAddCoreFilter}
              onRemoveFilter={handleRemoveCoreFilter}
            />
          )}

          {draft && currentStep === 'compare' && (
            <CompareStep
              draft={draft}
              studies={studies ?? []}
              waves={waves ?? []}
              onChangeDraft={(patch) => updateCurrentDraft({ query_spec: mergeQuerySpec(draft.query_spec, patch) })}
              onApplySuggestion={handleApplySuggestion}
            />
          )}

          {draft && currentStep === 'publish' && (
            <PublishStep
              draft={draft}
              availableViews={availableViews}
              availableBoards={availableBoards}
              publishResult={publishResult}
              isPublishing={publishDraft.isPending}
              onDraftUpdate={(patch, options) => updateCurrentDraft(patch, { structural: options?.structural ?? true })}
              onRunStoryStep={(stepId) => {
                void runWithContext('story_review', stepId)
              }}
              onPublish={() => {
                void handlePrimaryAction()
              }}
            />
          )}

          <div className="ins-workflow-actions">
            <Button variant="secondary" onClick={handleBack}>Back</Button>
            <Button
              variant="primary"
              icon={currentStep === 'publish' ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />}
              onClick={() => {
                void handlePrimaryAction()
              }}
              loading={runQuery.isPending || publishDraft.isPending}
            >
              {getPrimaryActionLabel(currentStep)}
            </Button>
          </div>
        </main>

        {draft && validations && (
          <InsightsContextRail
            draft={draft}
            selectedAudience={selectedAudience}
            currentStep={currentStep}
            validations={validations}
          />
        )}
      </div>
    </div>
  )
}
