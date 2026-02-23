import { describe, expect, it } from 'vitest'
import { deriveHomeSnapshot } from './useHomeSnapshot'
import type { HomeSnapshotInput } from './types'

function createInput(overrides: Partial<HomeSnapshotInput> = {}): HomeSnapshotInput {
  return {
    activeProjectId: null,
    activeProjectName: null,
    runs: {
      data: [],
      isLoading: false,
      isError: false,
    },
    conversations: {
      data: [],
      isLoading: false,
      isError: false,
    },
    insights: {
      data: [],
      isLoading: false,
      isError: false,
    },
    dashboards: {
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      isError: false,
    },
    charts: {
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      isError: false,
    },
    crosstabs: {
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      isError: false,
    },
    audiences: {
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      isError: false,
    },
    reports: {
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      isError: false,
    },
    connections: {
      data: [],
      isLoading: false,
      isError: false,
    },
    activity: {
      data: [],
      isLoading: false,
      isError: false,
    },
    ...overrides,
  }
}

describe('deriveHomeSnapshot', () => {
  it('aggregates ops health and workspace totals from mixed source data', () => {
    const snapshot = deriveHomeSnapshot(
      createInput({
        runs: {
          data: [
            {
              id: 'run-1',
              flow_id: 'flow-governance-agent',
              status: 'completed',
              started_at: '2026-02-20T10:00:00Z',
              completed_at: '2026-02-20T10:05:00Z',
              brief: 'Run governance checks',
              outputs: [{ id: 'out-1', label: 'Validation Report', type: 'insight', summary: 'Validated claims' }],
            },
            {
              id: 'run-2',
              flow_id: 'flow-brief-interpretation',
              status: 'running',
              started_at: '2026-02-20T10:06:00Z',
              brief: 'Build narrative',
              outputs: [],
            },
            {
              id: 'run-3',
              flow_id: 'flow-campaign-lifecycle',
              status: 'failed',
              started_at: '2026-02-20T10:07:00Z',
              completed_at: '2026-02-20T10:09:00Z',
              brief: 'Deliver campaign outputs',
              outputs: [],
            },
          ],
          isLoading: false,
          isError: false,
        },
        dashboards: {
          data: { data: [{ id: 'dash-1', name: 'Ops Dashboard', updated_at: '2026-02-20T10:00:00Z' }], meta: { total: 3 } },
          isLoading: false,
          isError: false,
        },
        charts: {
          data: { data: [{ id: 'chart-1', name: 'Adoption Curve', updated_at: '2026-02-20T09:59:00Z' }], meta: { total: 5 } },
          isLoading: false,
          isError: false,
        },
        crosstabs: {
          data: { data: [{ id: 'xt-1', name: 'Audience Lift', updated_at: '2026-02-20T09:58:00Z' }], meta: { total: 4 } },
          isLoading: false,
          isError: false,
        },
        audiences: {
          data: { data: [{ id: 'aud-1', name: 'Hybrid Workers', updated_at: '2026-02-20T09:57:00Z' }], meta: { total: 2 } },
          isLoading: false,
          isError: false,
        },
        reports: {
          data: { data: [{ id: 'rpt-1', name: 'Weekly Delivery Pack', updated_at: '2026-02-20T09:56:00Z' }], meta: { total: 1 } },
          isLoading: false,
          isError: false,
        },
        connections: {
          data: [
            {
              id: 'conn-1',
              app_id: 'slack',
              status: 'connected',
              connected_at: '2026-02-20T09:00:00Z',
              last_tested_at: '2026-02-20T09:30:00Z',
            },
            {
              id: 'conn-2',
              app_id: 'microsoft_teams',
              status: 'error',
              connected_at: '2026-02-20T09:05:00Z',
              last_tested_at: '2026-02-20T09:40:00Z',
            },
          ],
          isLoading: false,
          isError: false,
        },
        activity: {
          data: [
            { id: 'a-1', type: 'delivery', status: 'success', created_at: '2026-02-20T09:00:00Z', app_id: 'slack' },
            { id: 'a-2', type: 'delivery', status: 'failed', created_at: '2026-02-20T09:05:00Z', app_id: 'microsoft_teams' },
          ],
          isLoading: false,
          isError: false,
        },
      })
    )

    expect(snapshot.opsHealth.totals.completedRuns).toBe(1)
    expect(snapshot.opsHealth.totals.runningRuns).toBe(1)
    expect(snapshot.opsHealth.totals.failedRuns).toBe(1)
    expect(snapshot.opsHealth.totals.governanceCoverage).toBe(100)
    expect(snapshot.opsHealth.totals.deliverySuccessRate).toBe(50)
    expect(snapshot.opsHealth.overallStatus).toBe('critical')
    expect(snapshot.workspaceTotals).toEqual({
      audiences: 2,
      charts: 5,
      crosstabs: 4,
      dashboards: 3,
      reports: 1,
    })
    expect(snapshot.recentWork.state).toBe('ready')
    expect(snapshot.attentionQueue.state).toBe('ready')
  })

  it('returns loading fallback states while source queries are pending', () => {
    const snapshot = deriveHomeSnapshot(
      createInput({
        runs: { data: undefined, isLoading: true, isError: false },
        dashboards: { data: undefined, isLoading: true, isError: false },
        charts: { data: undefined, isLoading: true, isError: false },
        crosstabs: { data: undefined, isLoading: true, isError: false },
        audiences: { data: undefined, isLoading: true, isError: false },
        reports: { data: undefined, isLoading: true, isError: false },
        conversations: { data: undefined, isLoading: true, isError: false },
        insights: { data: undefined, isLoading: true, isError: false },
        connections: { data: undefined, isLoading: true, isError: false },
        activity: { data: undefined, isLoading: true, isError: false },
      })
    )

    expect(snapshot.recentWork.state).toBe('loading')
    expect(snapshot.attentionQueue.state).toBe('loading')
    expect(snapshot.isLoading).toBe(true)
  })

  it('returns explicit error panel states when sources fail and no data exists', () => {
    const snapshot = deriveHomeSnapshot(
      createInput({
        runs: { data: undefined, isLoading: false, isError: true },
        dashboards: { data: undefined, isLoading: false, isError: true },
        charts: { data: undefined, isLoading: false, isError: true },
        crosstabs: { data: undefined, isLoading: false, isError: true },
        audiences: { data: undefined, isLoading: false, isError: true },
        reports: { data: undefined, isLoading: false, isError: true },
        conversations: { data: undefined, isLoading: false, isError: true },
        insights: { data: undefined, isLoading: false, isError: true },
        connections: { data: undefined, isLoading: false, isError: true },
        activity: { data: undefined, isLoading: false, isError: true },
      })
    )

    expect(snapshot.recentWork.state).toBe('error')
    expect(snapshot.attentionQueue.state).toBe('error')
    expect(snapshot.recentWork.errorMessage).toContain('Unable to load recent work')
    expect(snapshot.attentionQueue.errorMessage).toContain('Unable to load attention items')
  })
})
