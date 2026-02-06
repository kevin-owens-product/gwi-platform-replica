import { apiClient } from '../client'
import type {
  SparkChatRequest,
  SparkChatResponse,
  SparkConversation,
} from '../types'

export const sparkApi = {
  chat: (data: SparkChatRequest) =>
    apiClient.post('v3/spark/chat', { json: data }).json<SparkChatResponse>(),

  getConversations: () =>
    apiClient.get('v3/spark/conversations').json<SparkConversation[]>(),

  getConversation: (id: string) =>
    apiClient.get(`v3/spark/conversations/${id}`).json<SparkConversation>(),

  deleteConversation: (id: string) =>
    apiClient.delete(`v3/spark/conversations/${id}`).json<void>(),
}
