import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  InsightAsset,
  InsightDraftStatus,
  InsightStudioDraft,
  InsightStudioStep,
  InsightCompatibilityResult,
} from '@/api/types'
import {
  createDefaultBoardConfig,
  createDefaultPublishPlan,
  createDefaultStoryConfig,
  createDefaultViewConfig,
  createEmptyDraft,
} from './defaults'

export interface InsightDraftRecord extends InsightStudioDraft {
  status: InsightDraftStatus
  error_message?: string
  change_token: number
  requires_rerun: boolean
  updated_at_local: string
  compatibility?: InsightCompatibilityResult
}

interface CreateDraftInput {
  id?: string
  studyId: string | null
  waveId: string | null
  metric: string
  step?: InsightStudioStep
}

interface UpdateDraftOptions {
  structural?: boolean
  touch?: boolean
}

interface InsightDraftStore {
  activeDraftId: string | null
  drafts: Record<string, InsightDraftRecord>
  createDraft: (input: CreateDraftInput) => string
  upsertDraft: (draft: InsightDraftRecord) => void
  hydrateFromAsset: (asset: InsightAsset, defaults: CreateDraftInput) => string
  setActiveDraftId: (draftId: string | null) => void
  updateDraft: (draftId: string, patch: Partial<InsightStudioDraft>, options?: UpdateDraftOptions) => void
  setDraftStatus: (draftId: string, status: InsightDraftStatus, errorMessage?: string) => void
  setDraftCompatibility: (draftId: string, compatibility?: InsightCompatibilityResult) => void
  markRunSuccess: (draftId: string, timestamp?: string) => void
  setRemoteAssetId: (draftId: string, assetId: string) => void
}

function nowIso(): string {
  return new Date().toISOString()
}

function createDraftId(): string {
  return `ins_draft_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function toRecord(draft: InsightStudioDraft): InsightDraftRecord {
  return {
    ...draft,
    status: 'idle',
    change_token: 0,
    requires_rerun: true,
    updated_at_local: nowIso(),
  }
}

function fromAsset(asset: InsightAsset, defaults: CreateDraftInput): InsightDraftRecord {
  return {
    id: asset.id,
    asset_id: asset.id,
    name: asset.name,
    objective: asset.description ?? '',
    step: defaults.step ?? 'publish',
    query_spec: asset.query_spec ?? createEmptyDraft(asset.id, defaults).query_spec,
    view_config: asset.view_config ?? createDefaultViewConfig(),
    board_config: asset.board_config ?? createDefaultBoardConfig(),
    story_config: asset.story_config ?? createDefaultStoryConfig(),
    selected_question_ids: asset.query_spec?.question_ids ?? [],
    base_audience_id: undefined,
    last_run_at: undefined,
    last_saved_at: asset.updated_at,
    publish_plan: createDefaultPublishPlan(),
    legacy_links: asset.legacy_links ?? [],
    status: 'idle',
    change_token: 0,
    requires_rerun: false,
    updated_at_local: nowIso(),
  }
}

export const useInsightDraftStore = create<InsightDraftStore>()(
  persist(
    (set, get) => ({
      activeDraftId: null,
      drafts: {},

      createDraft: (input) => {
        const draftId = input.id ?? createDraftId()
        const draft = toRecord(createEmptyDraft(draftId, {
          studyId: input.studyId,
          waveId: input.waveId,
          metric: input.metric,
          step: input.step,
        }))

        set((state) => ({
          activeDraftId: draftId,
          drafts: {
            ...state.drafts,
            [draftId]: draft,
          },
        }))

        return draftId
      },

      upsertDraft: (draft) => {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [draft.id]: draft,
          },
        }))
      },

      hydrateFromAsset: (asset, defaults) => {
        const draft = fromAsset(asset, defaults)
        set((state) => ({
          activeDraftId: draft.id,
          drafts: {
            ...state.drafts,
            [draft.id]: draft,
          },
        }))

        return draft.id
      },

      setActiveDraftId: (activeDraftId) => set({ activeDraftId }),

      updateDraft: (draftId, patch, options) => {
        const draft = get().drafts[draftId]
        if (!draft) return

        const structural = options?.structural ?? true
        const touch = options?.touch ?? true
        const updatedAt = nowIso()

        const nextQuerySpec = patch.query_spec
          ? {
              ...draft.query_spec,
              ...patch.query_spec,
              time: patch.query_spec.time ? { ...draft.query_spec.time, ...patch.query_spec.time } : draft.query_spec.time,
              dataset: patch.query_spec.dataset ? { ...draft.query_spec.dataset, ...patch.query_spec.dataset } : draft.query_spec.dataset,
              rebase: patch.query_spec.rebase ? { ...draft.query_spec.rebase, ...patch.query_spec.rebase } : draft.query_spec.rebase,
              filters: patch.query_spec.filters ?? draft.query_spec.filters,
            }
          : draft.query_spec

        const next: InsightDraftRecord = {
          ...draft,
          ...patch,
          query_spec: nextQuerySpec,
          view_config: patch.view_config ? { ...draft.view_config, ...patch.view_config } : draft.view_config,
          board_config: patch.board_config
            ? {
                ...draft.board_config,
                ...patch.board_config,
                layout: patch.board_config.layout ? { ...draft.board_config.layout, ...patch.board_config.layout } : draft.board_config.layout,
                view_asset_ids: patch.board_config.view_asset_ids ?? draft.board_config.view_asset_ids,
                filter_overrides: patch.board_config.filter_overrides ?? draft.board_config.filter_overrides,
              }
            : draft.board_config,
          story_config: patch.story_config
            ? {
                ...draft.story_config,
                ...patch.story_config,
                steps: patch.story_config.steps ?? draft.story_config.steps,
              }
            : draft.story_config,
          publish_plan: patch.publish_plan ? { ...draft.publish_plan, ...patch.publish_plan } : draft.publish_plan,
          updated_at_local: touch ? updatedAt : draft.updated_at_local,
          change_token: touch ? draft.change_token + 1 : draft.change_token,
          requires_rerun: touch && structural ? true : draft.requires_rerun,
        }

        set((state) => ({
          drafts: {
            ...state.drafts,
            [draftId]: next,
          },
        }))
      },

      setDraftStatus: (draftId, status, errorMessage) => {
        set((state) => {
          const draft = state.drafts[draftId]
          if (!draft) return state

          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...draft,
                status,
                error_message: errorMessage,
              },
            },
          }
        })
      },

      setDraftCompatibility: (draftId, compatibility) => {
        set((state) => {
          const draft = state.drafts[draftId]
          if (!draft) return state

          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...draft,
                compatibility,
              },
            },
          }
        })
      },

      markRunSuccess: (draftId, timestamp) => {
        const at = timestamp ?? nowIso()
        set((state) => {
          const draft = state.drafts[draftId]
          if (!draft) return state

          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...draft,
                last_run_at: at,
                requires_rerun: false,
              },
            },
          }
        })
      },

      setRemoteAssetId: (draftId, assetId) => {
        set((state) => {
          const draft = state.drafts[draftId]
          if (!draft) return state

          return {
            drafts: {
              ...state.drafts,
              [draftId]: {
                ...draft,
                asset_id: assetId,
              },
            },
          }
        })
      },
    }),
    {
      name: 'insights-studio-drafts-v1',
      partialize: (state) => ({
        activeDraftId: state.activeDraftId,
        drafts: state.drafts,
      }),
    },
  ),
)
