import { apiClient } from '../client'
import type {
  SparkChatRequest,
  SparkChatResponse,
  SparkConversation,
} from '../types'

export const sparkApi = {
  chat: (data: SparkChatRequest) =>
    apiClient.post('spark/chat', { json: data }).json<SparkChatResponse>(),

  getConversations: () =>
    apiClient.get('spark/conversations').json<SparkConversation[]>(),

  getConversation: (id: string) =>
    apiClient.get(`spark/conversations/${id}`).json<SparkConversation>(),

  deleteConversation: (id: string) =>
    apiClient.delete(`spark/conversations/${id}`).json<void>(),
}
