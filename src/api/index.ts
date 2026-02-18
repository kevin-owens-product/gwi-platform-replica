export { apiClient, streamJsonLines } from './client'
export type * from './types'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
const useBackend = !!import.meta.env.VITE_BACKEND_URL

const real = () => import('./endpoints/_real')
const mock = () => import('./mock')

const source = useMock ? await mock() : await real()

export const {
  authApi,
  audiencesApi,
  chartsApi,
  crosstabsApi,
  dashboardsApi,
  reportsApi,
  taxonomyApi,
  queriesApi,
  sparkApi,
  adminApi,
  canvasApi,
  mediaApi,
  teamsApi,
  projectsApi,
  orgApi,
  agenticApi: _mockAgenticApi,
  integrationsApi,
} = source

// When VITE_BACKEND_URL is set, use the real backend for agentic endpoints
// regardless of VITE_USE_MOCK. This allows gradual migration per-product.
export const agenticApi = useBackend
  ? (await import('./endpoints/agentic')).agenticApi
  : _mockAgenticApi
