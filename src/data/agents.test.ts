import { describe, expect, it } from 'vitest'
import { AGENT_STARTER_TEMPLATE_IDS, agents, getFeaturedAgents, getAgentById } from './agents'

describe('agents data', () => {
  it('includes all-in-one-agent in the catalog data', () => {
    const allInOne = getAgentById('all-in-one-agent')
    expect(allInOne).toBeDefined()
    expect(allInOne?.name).toBe('All In One Agent')
    expect(allInOne?.category).toBe('Orchestration')
  })

  it('pins all-in-one-agent as first featured agent', () => {
    const featured = getFeaturedAgents(4)
    expect(featured).toHaveLength(4)
    expect(featured[0].id).toBe('all-in-one-agent')
  })

  it('keeps all existing specialist agents available', () => {
    expect(agents.length).toBeGreaterThanOrEqual(11)
    expect(getAgentById('brief-interpreter')).toBeDefined()
    expect(getAgentById('advisor-agent')).toBeDefined()
  })

  it('maps all-in-one starter templates', () => {
    expect(AGENT_STARTER_TEMPLATE_IDS['all-in-one-agent']).toEqual([
      'tmpl-all-in-one-end-to-end',
      'tmpl-all-in-one-governed-delivery',
      'tmpl-all-in-one-monitor-and-optimize',
    ])
  })
})
