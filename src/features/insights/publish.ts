import type {
  CreateInsightAssetRequest,
  InsightAsset,
  InsightAssetType,
  InsightPublishResult,
  InsightStudioDraft,
} from '@/api/types'

interface PublishClient {
  createAsset: (data: CreateInsightAssetRequest) => Promise<InsightAsset>
}

function publishedTags(type: InsightAssetType): string[] {
  return ['insights', 'published_from_studio', type]
}

function buildCreateRequest(draft: InsightStudioDraft, type: InsightAssetType, projectId?: string): CreateInsightAssetRequest {
  const baseName = draft.name || 'Untitled insight'

  if (type === 'segment') {
    return {
      type,
      name: baseName,
      description: draft.objective,
      project_id: projectId,
      query_spec: draft.query_spec,
      legacy_links: draft.legacy_links,
      tags: publishedTags(type),
    }
  }

  if (type === 'view') {
    return {
      type,
      name: `${baseName} view`,
      description: draft.objective,
      project_id: projectId,
      query_spec: draft.query_spec,
      view_config: draft.view_config,
      legacy_links: draft.legacy_links,
      tags: publishedTags(type),
    }
  }

  if (type === 'board') {
    return {
      type,
      name: `${baseName} board`,
      description: draft.objective,
      project_id: projectId,
      board_config: draft.board_config,
      legacy_links: draft.legacy_links,
      tags: publishedTags(type),
    }
  }

  return {
    type,
    name: `${baseName} story`,
    description: draft.objective,
    project_id: projectId,
    story_config: draft.story_config,
    legacy_links: draft.legacy_links,
    tags: publishedTags(type),
  }
}

function toResultItem(asset: InsightAsset) {
  return {
    asset_id: asset.id,
    type: asset.type,
    insights_path: `/app/insights/publish/${asset.id}`,
    legacy_links: asset.legacy_links ?? [],
  }
}

export async function publishInsightDraft(
  client: PublishClient,
  draft: InsightStudioDraft,
  projectId?: string,
): Promise<InsightPublishResult> {
  const result: InsightPublishResult = {}

  if (draft.publish_plan.publish_segment) {
    const segment = await client.createAsset(buildCreateRequest(draft, 'segment', projectId))
    result.segment = toResultItem(segment)
  }

  if (draft.publish_plan.publish_view) {
    const view = await client.createAsset(buildCreateRequest(draft, 'view', projectId))
    result.view = toResultItem(view)
  }

  if (draft.publish_plan.publish_board) {
    const board = await client.createAsset(buildCreateRequest(draft, 'board', projectId))
    result.board = toResultItem(board)
  }

  if (draft.publish_plan.publish_story) {
    const story = await client.createAsset(buildCreateRequest(draft, 'story', projectId))
    result.story = toResultItem(story)
  }

  return result
}
