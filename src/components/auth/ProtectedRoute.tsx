import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

function ensureDemoSession() {
  const store = useAuthStore.getState()
  const token = store.token || import.meta.env.VITE_GWI_API_TOKEN || 'mock-token'

  if (!store.isAuthenticated || !store.token) {
    store.setTokens(token, 'mock-refresh-token')
  }

  if (!store.user) {
    store.setUser({
      id: 'demo-user',
      email: 'demo@globalwebindex.com',
      name: 'Demo User',
      role: 'admin',
      organization_id: 'demo-org',
      organization_name: 'GWI Demo Workspace',
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
      preferences: {},
    })
  }
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore()

  // In dev or mock mode, allow direct access for faster testing.
  if (import.meta.env.DEV || useMock) {
    ensureDemoSession()
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
