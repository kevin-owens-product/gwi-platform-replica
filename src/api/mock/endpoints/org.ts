import type { OrganizationWorkspace } from '../../types'
import { mockOrgWorkspace } from '../data/projects'
import { delay, now } from '../helpers'

let orgWorkspace: OrganizationWorkspace = { ...mockOrgWorkspace }

export const orgApi = {
  async getWorkspace(): Promise<OrganizationWorkspace> {
    await delay()
    return { ...orgWorkspace }
  },

  async updateWorkspace(data: Partial<OrganizationWorkspace>): Promise<OrganizationWorkspace> {
    await delay()
    orgWorkspace = {
      ...orgWorkspace,
      ...data,
      context: { ...orgWorkspace.context, ...data.context },
      guardrails: { ...orgWorkspace.guardrails, ...data.guardrails },
      updated_at: now(),
    }
    return { ...orgWorkspace }
  },
}
