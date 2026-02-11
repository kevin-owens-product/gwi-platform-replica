import { apiClient } from '../client'
import type { OrganizationWorkspace } from '../types'

export const orgApi = {
  getWorkspace: () =>
    apiClient.get('v3/org/workspace').json<OrganizationWorkspace>(),

  updateWorkspace: (data: Partial<OrganizationWorkspace>) =>
    apiClient.put('v3/org/workspace', { json: data }).json<OrganizationWorkspace>(),
}
