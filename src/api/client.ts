import ky from 'ky'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_GWI_API_BASE_URL || 'https://api.globalwebindex.com'

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
        request.headers.set('Content-Type', 'application/json')
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
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

        // Handle 401 — try refresh token
        if (response.status === 401) {
          const refreshToken = useAuthStore.getState().refreshToken
          if (refreshToken) {
            try {
              const refreshResponse = await ky.post(`${API_BASE_URL}/auth/refresh`, {
                json: { refresh_token: refreshToken },
              }).json<{ access_token: string; refresh_token: string; expires_in: number }>()

              useAuthStore.getState().setTokens(
                refreshResponse.access_token,
                refreshResponse.refresh_token
              )
            } catch {
              useAuthStore.getState().logout()
              window.location.href = '/'
            }
          }
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

// Typed helper for JSON Lines streaming responses
export async function streamJsonLines<T>(
  endpoint: string,
  options?: Parameters<typeof apiClient.get>[1]
): Promise<T[]> {
  const response = await apiClient.get(endpoint, {
    ...options,
    headers: { Accept: 'application/jsonl' },
  })
  const text = await response.text()
  return text
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T)
}
