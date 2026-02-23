import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import type { HomeSnapshot } from './home/types'
import Home from './Home'

const mockNavigate = vi.fn()
const mockMutate = vi.fn()
const mockRefetchAll = vi.fn()

let mockSnapshot: HomeSnapshot

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useSpark', () => ({
  useSparkChat: () => ({
    isPending: false,
    mutate: mockMutate,
  }),
}))

vi.mock('@/hooks/useAgentic', () => ({
  useAgenticRuns: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('./home/useHomeSnapshot', () => ({
  useHomeSnapshot: () => ({
    snapshot: mockSnapshot,
    refetchAll: mockRefetchAll,
  }),
}))

function createSnapshot(overrides: Partial<HomeSnapshot> = {}): HomeSnapshot {
  return {
    commandCenter: {
      title: 'Operational AI Command Center',
      subtitle: 'Route analysis and delivery workflows from one surface.',
      promptPlaceholder: 'Describe the analysis outcome you need.',
      helperText: 'Spark launches a structured workflow.',
      datasetLabel: 'GWI Core',
    },
    opsHealth: {
      overallStatus: 'attention',
      cards: [
        {
          id: 'agent',
          title: 'Agent Orchestration',
          status: 'attention',
          summary: '1 running · 2 completed · 0 failed',
          detail: 'Monitors active and completed agentic workflow execution.',
          actionLabel: 'Open Agent Spark',
          actionPath: '/app/agent-spark',
        },
        {
          id: 'governance',
          title: 'Governance Coverage',
          status: 'healthy',
          summary: '80% of completed runs include validation evidence',
          detail: 'Tracks validation and citation signals across completed runs.',
          actionLabel: 'Open Insights',
          actionPath: '/app/insights',
        },
        {
          id: 'delivery',
          title: 'Delivery Reliability',
          status: 'attention',
          summary: '90% successful deliveries · 0 errored connections',
          detail: 'Combines destination health and delivery activity outcomes.',
          actionLabel: 'Open Integrations',
          actionPath: '/app/account-settings/developer?dev_sub_tab=integrations',
        },
      ],
      totals: {
        completedRuns: 2,
        runningRuns: 1,
        failedRuns: 0,
        governanceCoverage: 80,
        deliverySuccessRate: 90,
        connectedDestinations: 3,
        erroredDestinations: 0,
      },
    },
    launchpad: [
      { id: 'spark', label: 'Open Agent Spark', description: 'Start a guided AI workflow.', path: '/app/agent-spark', icon: 'spark' },
      { id: 'charts', label: 'Build Chart', description: 'Create chart packs.', path: '/app/chart-builder', icon: 'charts' },
      { id: 'crosstabs', label: 'Run Crosstab', description: 'Execute significance checks.', path: '/app/crosstabs', icon: 'crosstabs' },
      { id: 'dashboards', label: 'Open Dashboards', description: 'Compose narrative dashboards.', path: '/app/dashboards', icon: 'dashboards' },
    ],
    recentWork: {
      state: 'ready',
      items: [
        {
          id: 'chart:1',
          type: 'chart',
          title: 'Adoption Curve',
          subtitle: 'Chart',
          updatedAt: '2026-02-20T10:00:00Z',
          path: '/app/chart-builder/chart/1',
        },
      ],
      emptyTitle: 'No work artifacts yet',
      emptyDescription: 'Create a chart, crosstab, or dashboard to populate your activity stream.',
      emptyCtaLabel: 'Open Charts',
      emptyCtaPath: '/app/chart-builder',
    },
    attentionQueue: {
      state: 'ready',
      items: [
        {
          id: 'attention:1',
          severity: 'warning',
          title: 'Governance coverage below target',
          description: '60% of runs include validation evidence.',
          createdAt: '2026-02-20T09:00:00Z',
          actionLabel: 'Open Insights',
          actionPath: '/app/insights',
        },
      ],
      emptyTitle: 'No attention items',
      emptyDescription: 'Operations look stable.',
      emptyCtaLabel: 'Run Agent Flow',
      emptyCtaPath: '/app/agent-spark',
    },
    workspaceTotals: {
      audiences: 2,
      charts: 5,
      crosstabs: 4,
      dashboards: 3,
      reports: 1,
    },
    featuredTemplates: [],
    isLoading: false,
    activeProjectId: null,
    activeProjectName: null,
    ...overrides,
  }
}

describe('Home', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockMutate.mockReset()
    mockRefetchAll.mockReset()
    mockSnapshot = createSnapshot()
  })

  it('renders command center and ops health panels', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Operational AI Command Center' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Operations Health' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Launchpad' })).toBeInTheDocument()
  })

  it('uses valid quick action routes for charts and crosstabs', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    const chartLink = screen.getByRole('link', { name: /Build Chart/i })
    const crosstabLink = screen.getByRole('link', { name: /Run Crosstab/i })

    expect(chartLink).toHaveAttribute('href', '/app/chart-builder')
    expect(crosstabLink).toHaveAttribute('href', '/app/crosstabs')
    expect(chartLink).not.toHaveAttribute('href', '/app/charts')
    expect(crosstabLink).not.toHaveAttribute('href', '/app/crosstab')
  })

  it('renders empty and error fallback states without crashing', () => {
    mockSnapshot = createSnapshot({
      recentWork: {
        ...createSnapshot().recentWork,
        state: 'error',
        items: [],
        errorMessage: 'Unable to load recent work right now.',
      },
      attentionQueue: {
        ...createSnapshot().attentionQueue,
        state: 'empty',
        items: [],
      },
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(screen.getByText('Recent work unavailable')).toBeInTheDocument()
    expect(screen.getByText('No attention items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Run Agent Flow/i })).toHaveAttribute('href', '/app/agent-spark')
  })
})
