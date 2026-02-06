import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, SignUpRequest } from '@/api/types'

export function useLogin() {
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setTokens(response.access_token, response.refresh_token)
      setUser(response.user)
      queryClient.invalidateQueries()
      navigate('/app')
    },
    onError: () => {
      toast.error('Invalid email or password')
    },
  })
}

export function useSignUp() {
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: SignUpRequest) => authApi.signup(data),
    onSuccess: (response) => {
      setTokens(response.access_token, response.refresh_token)
      setUser(response.user)
      navigate('/app')
    },
    onError: () => {
      toast.error('Failed to create account')
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate('/')
    },
  })
}

export function useProfile() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset({ email }),
    onSuccess: () => {
      toast.success('Password reset link sent to your email')
    },
    onError: () => {
      toast.error('Failed to send reset link')
    },
  })
}
