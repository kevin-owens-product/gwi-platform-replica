import ky from 'ky'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_GWI_API_BASE_URL || 'https://api.globalwebindex.com'
const API_TOKEN = import.meta.env.VITE_GWI_API_TOKEN || ''
const API_KEY = import.meta.env.VITE_GWI_API_KEY || ''

// Track whether a token refresh is in progress to avoid multiple concurrent refreshes
let refreshPromise: Promise<void> | null = null

async function refreshAccessToken(): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  try {
    const response = await ky.post(`${API_BASE_URL}/v3/auth/refresh`, {
      json: { refresh_token: refreshToken },
      headers: API_KEY ? { 'X-Api-Key': API_KEY } : undefined,
    }).json<{ access_token: string; refresh_token: string; expires_in: number }>()

    useAuthStore.getState().setTokens(response.access_token, response.refresh_token)
  } catch {
    useAuthStore.getState().logout()
    window.location.href = '/'
    throw new Error('Token refresh failed')
  }
}

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token || API_TOKEN
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
        request.headers.set('Content-Type', 'application/json')
        if (API_KEY) {
          request.headers.set('X-Api-Key', API_KEY)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Track rate limit info
        const limit = response.headers.get('X-RateLimit-Limit')
        const remaining = response.headers.get('X-RateLimit-Remaining')
        if (limit && remaining) {
          useAuthStore.getState().setRateLimit({
            limit: parseInt(limit),
            remaining: parseInt(remaining),
            reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
          })
        }

        // Handle 401 — try refresh token and retry the request
        if (response.status === 401) {
          // Deduplicate concurrent refresh attempts
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
              refreshPromise = null
            })
          }

          try {
            await refreshPromise
          } catch {
            return response
          }

          // Retry the original request with the new token
          const token = useAuthStore.getState().token || API_TOKEN
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`)
          }
          return ky(request, options)
        }
      },
    ],
  },
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 429, 502, 503, 504],
  },
})

// Typed helper for JSON Lines streaming responses (supports both GET and POST)
export async function streamJsonLines<T>(
  endpoint: string,
  options?: Parameters<typeof apiClient>[1] & { method?: string; json?: unknown }
): Promise<T[]> {
  const { method, json, ...rest } = options ?? {}
  const fetchFn = method === 'post' ? apiClient.post : apiClient.get
  const response = await fetchFn(endpoint, {
    ...rest,
    ...(json ? { json } : {}),
    headers: { Accept: 'application/jsonl' },
  })
  const text = await response.text()
  return text
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T)
}
