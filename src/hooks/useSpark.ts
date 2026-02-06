import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sparkApi } from '@/api'
import type { SparkChatRequest } from '@/api/types'

export function useSparkConversations() {
  return useQuery({
    queryKey: ['spark-conversations'],
    queryFn: () => sparkApi.getConversations(),
  })
}

export function useSparkConversation(id: string) {
  return useQuery({
    queryKey: ['spark-conversations', id],
    queryFn: () => sparkApi.getConversation(id),
    enabled: !!id,
  })
}

export function useSparkChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SparkChatRequest) => sparkApi.chat(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['spark-conversations'] })
      queryClient.invalidateQueries({
        queryKey: ['spark-conversations', response.conversation_id],
      })
    },
  })
}

export function useDeleteSparkConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sparkApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spark-conversations'] })
    },
  })
}
