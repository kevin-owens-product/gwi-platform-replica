import ky from 'ky'
import { useAuthStore } from '@/stores/auth'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'

/**
 * HTTP client for the local GWI backend server.
 * Used for endpoints that have been migrated from mock to real backend.
 */
export const backendClient = ky.create({
  prefixUrl: BACKEND_URL,
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})
