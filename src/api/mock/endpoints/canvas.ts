import type { CanvasProject, ResearchTemplate } from '../../types'
import { mockCanvasProjects, mockResearchTemplates } from '../data/canvas'
import { delay, findById, newId, now } from '../helpers'

const projects = [...mockCanvasProjects]

export const canvasApi = {
  async listProjects(): Promise<CanvasProject[]> {
    await delay()
    return projects.map((p) => ({ ...p }))
  },

  async getProject(id: string): Promise<CanvasProject> {
    await delay()
    const p = findById(projects, id)
    if (!p) throw new Error(`Canvas project ${id} not found`)
    return { ...p }
  },

  async createProject(data: { name: string; description?: string; template_id?: string }): Promise<CanvasProject> {
    await delay()

    const template = data.template_id
      ? findById(mockResearchTemplates, data.template_id)
      : undefined

    const project: CanvasProject = {
      id: newId('canvas'),
      name: data.name,
      description: data.description,
      created_at: now(),
      updated_at: now(),
      user_id: 'user_current',
      status: 'draft',
      current_step: 'objectives',
      progress_pct: 0,
      steps: [
        { type: 'objectives', status: 'pending', data: { step: 'objectives', goals: template?.default_goals ?? [] } },
        { type: 'markets', status: 'pending', data: { step: 'markets', location_ids: [] } },
        { type: 'audiences', status: 'pending', data: { step: 'audiences', audience_ids: [] } },
        { type: 'time_period', status: 'pending', data: { step: 'time_period', wave_ids: [] } },
        { type: 'analysis_framework', status: 'pending', data: { step: 'analysis_framework', question_ids: template?.default_question_ids ?? [], chart_types: template?.default_chart_types ?? [], metrics: [] } },
        { type: 'review', status: 'pending', data: { step: 'review', approved: false } },
        { type: 'results', status: 'pending', data: { step: 'results', generated_charts: [], generated_crosstabs: [] } },
      ],
    }

    projects.unshift(project)
    return { ...project }
  },

  async updateStep(projectId: string, stepType: string, data: Record<string, unknown>): Promise<CanvasProject> {
    await delay()
    const project = findById(projects, projectId)
    if (!project) throw new Error(`Canvas project ${projectId} not found`)

    const step = project.steps.find((s) => s.type === stepType)
    if (!step) throw new Error(`Step ${stepType} not found in project ${projectId}`)

    step.data = { ...step.data, ...data } as typeof step.data
    step.status = 'completed'
    step.completed_at = now()
    step.completed_by = 'user_current'

    // Advance current_step to next pending step
    const stepOrder = ['objectives', 'markets', 'audiences', 'time_period', 'analysis_framework', 'review', 'results']
    const currentIdx = stepOrder.indexOf(stepType)
    const nextPending = project.steps.find((s, idx) => idx > currentIdx && s.status === 'pending')
    if (nextPending) {
      project.current_step = nextPending.type
    }

    // Update progress
    const completedSteps = project.steps.filter((s) => s.status === 'completed').length
    project.progress_pct = Math.round((completedSteps / project.steps.length) * 100)
    project.status = project.progress_pct === 100 ? 'completed' : 'in_progress'
    project.updated_at = now()

    return { ...project }
  },

  async deleteProject(id: string): Promise<void> {
    await delay()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx !== -1) projects.splice(idx, 1)
  },

  async listTemplates(): Promise<ResearchTemplate[]> {
    await delay()
    return [...mockResearchTemplates]
  },
}
