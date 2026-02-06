import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, token } = useAuthStore()

  // In development, allow access and auto-initialize token from env if needed
  if (import.meta.env.DEV) {
    if (!token) {
      const envToken = import.meta.env.VITE_GWI_API_TOKEN || ''
      if (envToken) {
        useAuthStore.getState().setTokens(envToken, 'dev-refresh-token')
        useAuthStore.getState().setUser({
          id: 'dev-user',
          email: 'dev@globalwebindex.com',
          name: 'Dev User',
          role: 'admin',
          organization_id: 'dev-org',
          organization_name: 'GWI Internal',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          preferences: {},
        })
      }
    }
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
