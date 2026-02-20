import type { CreateInsightAssetRequest, InsightStudioDraft, UpdateInsightAssetRequest } from '@/api/types'

const DRAFT_TAG = 'insights_studio_draft'

function dedupeTags(tags: string[]): string[] {
  return [...new Set(tags)]
}

export function toDraftCreateRequest(draft: InsightStudioDraft, projectId?: string): CreateInsightAssetRequest {
  return {
    type: 'story',
    name: draft.name,
    description: draft.objective,
    project_id: projectId,
    query_spec: draft.query_spec,
    view_config: draft.view_config,
    board_config: draft.board_config,
    story_config: draft.story_config,
    legacy_links: draft.legacy_links,
    tags: dedupeTags([DRAFT_TAG, 'insights', 'draft']),
  }
}

export function toDraftUpdateRequest(draft: InsightStudioDraft): UpdateInsightAssetRequest {
  return {
    name: draft.name,
    description: draft.objective,
    query_spec: draft.query_spec,
    view_config: draft.view_config,
    board_config: draft.board_config,
    story_config: draft.story_config,
    legacy_links: draft.legacy_links,
    tags: dedupeTags([DRAFT_TAG, 'insights', 'draft']),
  }
}

export function isDraftAsset(tags: string[] | undefined): boolean {
  return (tags ?? []).includes(DRAFT_TAG)
}

export const INSIGHT_DRAFT_TAG = DRAFT_TAG
