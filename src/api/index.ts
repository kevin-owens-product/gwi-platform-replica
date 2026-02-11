export { apiClient, streamJsonLines } from './client'
export type * from './types'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

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
  agenticApi,
} = source
