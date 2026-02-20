import { describe, expect, it, vi } from 'vitest'
import { createEmptyDraft } from './defaults'
import { publishInsightDraft } from './publish'

describe('insights publish orchestration', () => {
  it('publishes only selected output types', async () => {
    const draft = createEmptyDraft('d1', {
      studyId: 'study_core',
      waveId: 'wave_2024q4',
      metric: 'audience_percentage',
    })

    draft.publish_plan = {
      publish_segment: true,
      publish_view: false,
      publish_board: true,
      publish_story: false,
    }

    const createAsset = vi.fn()
      .mockResolvedValueOnce({ id: 'segment_1', type: 'segment', legacy_links: [] } as any)
      .mockResolvedValueOnce({ id: 'board_1', type: 'board', legacy_links: [] } as any)

    const result = await publishInsightDraft({ createAsset }, draft, 'proj_1')

    expect(createAsset).toHaveBeenCalledTimes(2)
    expect(result.segment?.asset_id).toBe('segment_1')
    expect(result.board?.asset_id).toBe('board_1')
    expect(result.view).toBeUndefined()
    expect(result.story).toBeUndefined()
  })
})
