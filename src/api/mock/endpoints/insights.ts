import type {
  InsightAsset,
  InsightAssetListParams,
  PaginatedResponse,
  CreateInsightAssetRequest,
  UpdateInsightAssetRequest,
  RunInsightQueryRequest,
  RunInsightQueryResponse,
  InsightCompatibilityResult,
  ConvertInsightAssetRequest,
  ConvertInsightAssetResponse,
  InsightLineage,
  CrosstabDimension,
} from '../../types'
import { mockInsightAssets } from '../data/insights'
import { generateCrosstabResult, generateStatsResponse } from '../data/queries'
import { delay, findById, newId, now, paginate } from '../helpers'

const assets = [...mockInsightAssets]

class InsightCompatibilityError extends Error {
  compatibility: InsightCompatibilityResult

  constructor(message: string, compatibility: InsightCompatibilityResult) {
    super(message)
    this.name = 'InsightCompatibilityError'
    this.compatibility = compatibility
  }
}

function questionStudyMap(_questionId: string): string {
  return 'study_core'
}

function evaluateCompatibility(request: RunInsightQueryRequest): InsightCompatibilityResult {
  const { query_spec: spec } = request
  const issues: InsightCompatibilityResult['issues'] = []
  const suggestions: InsightCompatibilityResult['suggestions'] = []

  if (spec.question_ids.length === 0 && spec.row_question_ids.length === 0) {
    issues.push({
      code: 'missing_questions',
      level: 'error',
      message: 'Select at least one question before running the query.',
    })
  }

  if (spec.time.wave_ids.length === 0) {
    issues.push({
      code: 'missing_waves',
      level: 'error',
      message: 'Select at least one wave/time period before running the query.',
    })
  }

  const allowedStudies = new Set(spec.dataset.allowed_study_ids ?? (spec.dataset.primary_study_id ? [spec.dataset.primary_study_id] : []))

  if (spec.dataset.enforce_compatibility && allowedStudies.size > 0) {
    const badWaves = spec.time.wave_ids.filter((wave) => !allowedStudies.has(wave.study_id))
    if (badWaves.length > 0) {
      issues.push({
        code: 'wave_dataset_mismatch',
        level: 'error',
        message: `Selected wave(s) are not available in dataset scope: ${badWaves.map((w) => w.wave_id).join(', ')}.`,
      })

      suggestions.push({
        id: 'suggest_keep_allowed_waves',
        label: 'Keep only waves from selected dataset',
        patch: {
          time: {
            ...spec.time,
            wave_ids: spec.time.wave_ids.filter((wave) => allowedStudies.has(wave.study_id)),
          },
        },
      })
    }

    const allQuestions = [...spec.question_ids, ...spec.row_question_ids, ...spec.column_question_ids]
    const outOfScopeQuestions = allQuestions.filter((questionId) => !allowedStudies.has(questionStudyMap(questionId)))
    if (outOfScopeQuestions.length > 0) {
      issues.push({
        code: 'question_dataset_mismatch',
        level: 'error',
        message: `Some questions are unavailable in selected dataset: ${outOfScopeQuestions.join(', ')}.`,
      })
    }
  }

  return {
    blocking: issues.some((issue) => issue.level === 'error'),
    issues,
    suggestions,
  }
}

function buildDimensions(spec: RunInsightQueryRequest['query_spec']): { rows: CrosstabDimension[]; columns: CrosstabDimension[] } {
  const rows: CrosstabDimension[] = spec.row_question_ids.map((questionId) => ({
    type: 'question',
    question_id: questionId,
  }))

  if (rows.length === 0) {
    rows.push(
      ...spec.question_ids.map((questionId) => ({
        type: 'question' as const,
        question_id: questionId,
      })),
    )
  }

  const questionColumns: CrosstabDimension[] = spec.column_question_ids.map((questionId) => ({
    type: 'question',
    question_id: questionId,
  }))

  const audienceColumns: CrosstabDimension[] = spec.column_audience_ids.map((audienceId) => ({
    type: 'audience',
    audience_id: audienceId,
  }))

  return {
    rows,
    columns: [...questionColumns, ...audienceColumns],
  }
}

function normalizeAsset(asset: InsightAsset): InsightAsset {
  return {
    ...asset,
    query_spec: asset.query_spec
      ? {
          ...asset.query_spec,
          row_question_ids: asset.query_spec.row_question_ids ?? [],
          column_question_ids: asset.query_spec.column_question_ids ?? [],
          column_audience_ids: asset.query_spec.column_audience_ids ?? [],
          filters: asset.query_spec.filters ?? [],
        }
      : undefined,
  }
}

export const insightsApi = {
  async listAssets(params?: InsightAssetListParams): Promise<PaginatedResponse<InsightAsset>> {
    await delay()
    let items = [...assets]

    if (params?.type) {
      items = items.filter((asset) => asset.type === params.type)
    }

    if (params?.project_id) {
      items = items.filter((asset) => asset.project_id === params.project_id)
    }

    return paginate(items.map(normalizeAsset), params)
  },

  async getAsset(id: string): Promise<InsightAsset> {
    await delay()
    const asset = findById(assets, id)
    if (!asset) throw new Error(`Insight asset ${id} not found`)
    return normalizeAsset(asset)
  },

  async createAsset(data: CreateInsightAssetRequest): Promise<InsightAsset> {
    await delay()
    const asset: InsightAsset = {
      id: newId('ins'),
      type: data.type,
      name: data.name,
      description: data.description,
      created_at: now(),
      updated_at: now(),
      user_id: 'user_sarah',
      project_id: data.project_id,
      query_spec: data.query_spec,
      view_config: data.view_config,
      board_config: data.board_config,
      story_config: data.story_config,
      legacy_links: data.legacy_links,
      tags: data.tags,
    }

    assets.unshift(asset)
    return normalizeAsset(asset)
  },

  async updateAsset(id: string, data: UpdateInsightAssetRequest): Promise<InsightAsset> {
    await delay()
    const idx = assets.findIndex((asset) => asset.id === id)
    if (idx === -1) throw new Error(`Insight asset ${id} not found`)

    assets[idx] = {
      ...assets[idx],
      ...data,
      updated_at: now(),
    }

    return normalizeAsset(assets[idx])
  },

  async deleteAsset(id: string): Promise<void> {
    await delay()
    const idx = assets.findIndex((asset) => asset.id === id)
    if (idx !== -1) assets.splice(idx, 1)
  },

  async runQuery(request: RunInsightQueryRequest): Promise<RunInsightQueryResponse> {
    await delay()

    const compatibility = evaluateCompatibility(request)
    if (compatibility.blocking) {
      throw new InsightCompatibilityError('Insight query blocked by compatibility checks', compatibility)
    }

    if (request.view_mode === 'chart') {
      const chart = generateStatsResponse(
        request.query_spec.question_ids.length > 0
          ? request.query_spec.question_ids
          : request.query_spec.row_question_ids,
        {
          include_trend: request.query_spec.time.trend_mode !== 'off',
          include_confidence_intervals: true,
        },
      )

      return {
        view_mode: 'chart',
        chart,
        compatibility,
      }
    }

    const dims = buildDimensions(request.query_spec)
    const crosstab = generateCrosstabResult(
      Math.max(1, dims.rows.length * 4),
      Math.max(1, dims.columns.length * 3),
      dims,
      request.query_spec.time.trend_mode && request.query_spec.time.trend_mode !== 'off'
        ? request.query_spec.time.trend_mode
        : undefined,
    )

    return {
      view_mode: 'crosstab',
      crosstab,
      compatibility,
    }
  },

  async convertAsset(id: string, request: ConvertInsightAssetRequest): Promise<ConvertInsightAssetResponse> {
    await delay()
    const source = findById(assets, id)
    if (!source) throw new Error(`Insight asset ${id} not found`)

    const converted: InsightAsset = {
      ...source,
      id: newId('ins'),
      type: request.target_type,
      name: `${source.name} (${request.target_type})`,
      created_at: now(),
      updated_at: now(),
    }

    if (request.target_type === 'board') {
      converted.board_config = {
        view_asset_ids: source.type === 'view' ? [source.id] : source.board_config?.view_asset_ids ?? [],
        layout: { columns: 12, row_height: 80 },
        filter_overrides: [],
      }
    }

    if (request.target_type === 'story') {
      converted.story_config = {
        steps: [
          {
            id: newId('step'),
            title: source.name,
            description: 'Converted from insight asset.',
            view_asset_id: source.type === 'view' ? source.id : undefined,
            board_asset_id: source.type === 'board' ? source.id : undefined,
            filter_overrides: [],
          },
        ],
      }
    }

    assets.unshift(converted)

    return {
      source_asset_id: id,
      converted_asset: normalizeAsset(converted),
    }
  },

  async getLineage(id: string): Promise<InsightLineage> {
    await delay()
    const asset = findById(assets, id)
    if (!asset) throw new Error(`Insight asset ${id} not found`)

    const upstream: InsightLineage['upstream'] = []
    const downstream: InsightLineage['downstream'] = []

    if (asset.type === 'board') {
      const viewIds = asset.board_config?.view_asset_ids ?? []
      for (const viewId of viewIds) {
        const view = findById(assets, viewId)
        if (view) upstream.push({ asset_id: view.id, type: view.type, name: view.name })
      }
    }

    if (asset.type === 'story') {
      for (const step of asset.story_config?.steps ?? []) {
        if (step.view_asset_id) {
          const view = findById(assets, step.view_asset_id)
          if (view) upstream.push({ asset_id: view.id, type: view.type, name: view.name })
        }
        if (step.board_asset_id) {
          const board = findById(assets, step.board_asset_id)
          if (board) upstream.push({ asset_id: board.id, type: board.type, name: board.name })
        }
      }
    }

    for (const candidate of assets) {
      if (candidate.id === id) continue
      if (candidate.type === 'board' && (candidate.board_config?.view_asset_ids ?? []).includes(id)) {
        downstream.push({ asset_id: candidate.id, type: candidate.type, name: candidate.name })
      }

      if (candidate.type === 'story') {
        const used = (candidate.story_config?.steps ?? []).some((step) => step.view_asset_id === id || step.board_asset_id === id)
        if (used) {
          downstream.push({ asset_id: candidate.id, type: candidate.type, name: candidate.name })
        }
      }
    }

    return {
      asset_id: id,
      upstream,
      downstream,
    }
  },
}
