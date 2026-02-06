import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, RateLimitInfo } from '@/api/types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  rateLimit: RateLimitInfo | null
  isAuthenticated: boolean

  setTokens: (token: string, refreshToken: string) => void
  setUser: (user: User) => void
  setRateLimit: (info: RateLimitInfo) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      rateLimit: null,
      isAuthenticated: false,

      setTokens: (token, refreshToken) =>
        set({ token, refreshToken, isAuthenticated: true }),

      setUser: (user) =>
        set({ user }),

      setRateLimit: (rateLimit) =>
        set({ rateLimit }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'gwi-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
