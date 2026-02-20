import { useCallback, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { insightsApi } from '@/api'
import {
  INSIGHT_DRAFT_TAG,
  toDraftCreateRequest,
  toDraftUpdateRequest,
} from '@/features/insights/autosave'
import {
  createDefaultBoardConfig,
  createDefaultPublishPlan,
  createDefaultStoryConfig,
  createDefaultViewConfig,
  createEmptyDraft,
} from '@/features/insights/defaults'
import type { InsightDraftRecord } from '@/features/insights/draft-store'
import { useInsightDraftStore } from '@/features/insights/draft-store'
import { publishInsightDraft } from '@/features/insights/publish'
import { buildInsightStepValidation } from '@/features/insights/validation'
import { trackInsightsTelemetry } from '@/utils/insights-telemetry'
import type {
  InsightAssetListParams,
  CreateInsightAssetRequest,
  UpdateInsightAssetRequest,
  RunInsightQueryRequest,
  ConvertInsightAssetRequest,
  InsightCompatibilityResult,
  InsightPublishResult,
  InsightStudioDraft,
  InsightStudioStep,
} from '@/api/types'

interface InsightDraftDefaults {
  studyId: string | null
  waveId: string | null
  metric: string
  step?: InsightStudioStep
}

function normalizeDraftRecord(rawDraft: InsightDraftRecord, defaults: InsightDraftDefaults): InsightDraftRecord {
  const baseDraft = createEmptyDraft(rawDraft.id, {
    studyId: defaults.studyId,
    waveId: defaults.waveId,
    metric: defaults.metric,
    step: defaults.step,
  })

  return {
    ...rawDraft,
    name: rawDraft.name ?? baseDraft.name,
    objective: rawDraft.objective ?? baseDraft.objective,
    step: rawDraft.step ?? baseDraft.step,
    query_spec: {
      ...baseDraft.query_spec,
      ...rawDraft.query_spec,
      question_ids: rawDraft.query_spec?.question_ids ?? baseDraft.query_spec.question_ids,
      row_question_ids: rawDraft.query_spec?.row_question_ids ?? rawDraft.query_spec?.question_ids ?? baseDraft.query_spec.row_question_ids,
      column_question_ids: rawDraft.query_spec?.column_question_ids ?? baseDraft.query_spec.column_question_ids,
      column_audience_ids: rawDraft.query_spec?.column_audience_ids ?? baseDraft.query_spec.column_audience_ids,
      metrics: rawDraft.query_spec?.metrics?.length ? rawDraft.query_spec.metrics : baseDraft.query_spec.metrics,
      filters: rawDraft.query_spec?.filters ?? baseDraft.query_spec.filters,
      time: {
        ...baseDraft.query_spec.time,
        ...(rawDraft.query_spec?.time ?? {}),
        wave_ids: rawDraft.query_spec?.time?.wave_ids ?? baseDraft.query_spec.time.wave_ids,
        comparison_wave_ids: rawDraft.query_spec?.time?.comparison_wave_ids ?? baseDraft.query_spec.time.comparison_wave_ids,
      },
      rebase: {
        ...baseDraft.query_spec.rebase,
        ...(rawDraft.query_spec?.rebase ?? {}),
      },
      dataset: {
        ...baseDraft.query_spec.dataset,
        ...(rawDraft.query_spec?.dataset ?? {}),
      },
    },
    view_config: {
      ...createDefaultViewConfig(),
      ...(rawDraft.view_config ?? {}),
    },
    board_config: {
      ...createDefaultBoardConfig(),
      ...(rawDraft.board_config ?? {}),
      layout: {
        ...createDefaultBoardConfig().layout,
        ...(rawDraft.board_config?.layout ?? {}),
      },
      view_asset_ids: rawDraft.board_config?.view_asset_ids ?? createDefaultBoardConfig().view_asset_ids,
      filter_overrides: rawDraft.board_config?.filter_overrides ?? createDefaultBoardConfig().filter_overrides,
    },
    story_config: {
      ...createDefaultStoryConfig(),
      ...(rawDraft.story_config ?? {}),
      steps: rawDraft.story_config?.steps ?? createDefaultStoryConfig().steps,
    },
    selected_question_ids: rawDraft.selected_question_ids ?? rawDraft.query_spec?.question_ids ?? baseDraft.selected_question_ids,
    publish_plan: {
      ...createDefaultPublishPlan(),
      ...(rawDraft.publish_plan ?? {}),
    },
    status: rawDraft.status ?? 'idle',
    change_token: rawDraft.change_token ?? 0,
    requires_rerun: rawDraft.requires_rerun ?? true,
    updated_at_local: rawDraft.updated_at_local ?? new Date().toISOString(),
  }
}

export function useInsightAssets(params?: InsightAssetListParams) {
  return useQuery({
    queryKey: ['insights', 'assets', params],
    queryFn: () => insightsApi.listAssets(params),
  })
}

export function useInsightAsset(id: string) {
  return useQuery({
    queryKey: ['insights', 'asset', id],
    queryFn: () => insightsApi.getAsset(id),
    enabled: !!id,
  })
}

export function useCreateInsightAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInsightAssetRequest) => insightsApi.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'assets'] })
      toast.success('Insight asset created')
    },
    onError: () => {
      toast.error('Failed to create insight asset')
    },
  })
}

export function useUpdateInsightAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInsightAssetRequest }) => insightsApi.updateAsset(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'assets'] })
      queryClient.invalidateQueries({ queryKey: ['insights', 'asset', id] })
      toast.success('Insight asset updated')
    },
    onError: () => {
      toast.error('Failed to update insight asset')
    },
  })
}

export function useDeleteInsightAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => insightsApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'assets'] })
      toast.success('Insight asset deleted')
    },
    onError: () => {
      toast.error('Failed to delete insight asset')
    },
  })
}

export function useRunInsightQuery() {
  return useMutation({
    mutationFn: (data: RunInsightQueryRequest) => insightsApi.runQuery(data),
  })
}

export function useConvertInsightAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertInsightAssetRequest }) => insightsApi.convertAsset(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'assets'] })
      queryClient.invalidateQueries({ queryKey: ['insights', 'asset', id] })
      toast.success('Asset converted')
    },
    onError: () => {
      toast.error('Failed to convert asset')
    },
  })
}

export function useInsightLineage(id: string) {
  return useQuery({
    queryKey: ['insights', 'lineage', id],
    queryFn: () => insightsApi.getLineage(id),
    enabled: !!id,
  })
}

export function useInsightDraft(draftId: string | undefined, defaults: InsightDraftDefaults) {
  const activeDraftId = useInsightDraftStore((state) => state.activeDraftId)
  const drafts = useInsightDraftStore((state) => state.drafts)
  const createDraft = useInsightDraftStore((state) => state.createDraft)
  const hydrateFromAsset = useInsightDraftStore((state) => state.hydrateFromAsset)
  const upsertDraft = useInsightDraftStore((state) => state.upsertDraft)
  const setActiveDraftId = useInsightDraftStore((state) => state.setActiveDraftId)
  const updateDraftInStore = useInsightDraftStore((state) => state.updateDraft)

  const effectiveDraftId = draftId ?? activeDraftId ?? undefined
  const localDraft = effectiveDraftId ? drafts[effectiveDraftId] : undefined
  const draft = useMemo(() => {
    if (!localDraft) return undefined
    return normalizeDraftRecord(localDraft, defaults)
  }, [defaults.metric, defaults.step, defaults.studyId, defaults.waveId, localDraft])

  const remoteDraft = useInsightAsset(draftId && !draft ? draftId : '')

  useEffect(() => {
    if (!draftId || draft || !remoteDraft.data) return
    hydrateFromAsset(remoteDraft.data, {
      id: draftId,
      studyId: defaults.studyId,
      waveId: defaults.waveId,
      metric: defaults.metric,
      step: defaults.step,
    })
  }, [defaults.metric, defaults.step, defaults.studyId, defaults.waveId, draft, draftId, hydrateFromAsset, remoteDraft.data])

  useEffect(() => {
    if (!draft || !localDraft) return

    if (JSON.stringify(draft) !== JSON.stringify(localDraft)) {
      upsertDraft(draft)
    }
  }, [draft, localDraft, upsertDraft])

  const ensureDraftId = useCallback(() => {
    if (effectiveDraftId && drafts[effectiveDraftId]) {
      setActiveDraftId(effectiveDraftId)
      return effectiveDraftId
    }

    const nextId = createDraft({
      id: draftId,
      studyId: defaults.studyId,
      waveId: defaults.waveId,
      metric: defaults.metric,
      step: defaults.step,
    })
    setActiveDraftId(nextId)
    return nextId
  }, [createDraft, defaults.metric, defaults.step, defaults.studyId, defaults.waveId, draftId, drafts, effectiveDraftId, setActiveDraftId])

  const updateDraft = useCallback(
    (targetDraftId: string, patch: Partial<InsightStudioDraft>, options?: { structural?: boolean; touch?: boolean }) => {
      updateDraftInStore(targetDraftId, patch, options)
    },
    [updateDraftInStore],
  )

  return {
    draftId: effectiveDraftId,
    draft,
    ensureDraftId,
    updateDraft,
    isHydrating: remoteDraft.isLoading,
  }
}

export function useAutosaveInsightDraft() {
  const setDraftStatus = useInsightDraftStore((state) => state.setDraftStatus)
  const updateDraft = useInsightDraftStore((state) => state.updateDraft)
  const setRemoteAssetId = useInsightDraftStore((state) => state.setRemoteAssetId)

  return useMutation({
    mutationFn: async ({ draft, projectId }: { draft: InsightDraftRecord; projectId?: string }) => {
      if (draft.asset_id) {
        return insightsApi.updateAsset(draft.asset_id, toDraftUpdateRequest(draft))
      }

      return insightsApi.createAsset(toDraftCreateRequest(draft, projectId))
    },
    onMutate: ({ draft }) => {
      setDraftStatus(draft.id, 'saving')
    },
    onSuccess: (asset, { draft }) => {
      if (!(asset.tags ?? []).includes(INSIGHT_DRAFT_TAG)) {
        return
      }

      setRemoteAssetId(draft.id, asset.id)
      updateDraft(draft.id, {
        asset_id: asset.id,
        last_saved_at: asset.updated_at,
      }, { structural: false, touch: false })
      setDraftStatus(draft.id, 'saved')
      trackInsightsTelemetry('insights.autosave.succeeded', {
        draft_id: draft.id,
        asset_id: asset.id,
      })
    },
    onError: (error, { draft }) => {
      const message = error instanceof Error ? error.message : 'Autosave failed'
      setDraftStatus(draft.id, 'error', message)
      trackInsightsTelemetry('insights.autosave.failed', {
        draft_id: draft.id,
        message,
      })
    },
  })
}

export function usePublishInsightDraft() {
  return useMutation({
    mutationFn: async ({ draft, projectId }: { draft: InsightDraftRecord; projectId?: string }) => {
      trackInsightsTelemetry('insights.publish.started', {
        draft_id: draft.id,
      })

      const result = await publishInsightDraft(insightsApi, draft, projectId)
      return result
    },
    onSuccess: (result, { draft }) => {
      const publishedCount = Object.keys(result).length
      toast.success(`Published ${publishedCount} asset${publishedCount === 1 ? '' : 's'}`)
      trackInsightsTelemetry('insights.publish.completed', {
        draft_id: draft.id,
        published_count: publishedCount,
      })
    },
    onError: (error, { draft }) => {
      const message = error instanceof Error ? error.message : 'Failed to publish outputs'
      toast.error(message)
      trackInsightsTelemetry('insights.publish.failed', {
        draft_id: draft.id,
        message,
      })
    },
  })
}

export function useInsightStepValidation(draft: InsightDraftRecord | undefined, compatibility?: InsightCompatibilityResult) {
  return useMemo(() => {
    if (!draft) return null
    return buildInsightStepValidation(draft, compatibility)
  }, [compatibility, draft])
}

export type { InsightPublishResult }
