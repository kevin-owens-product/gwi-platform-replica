import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FolderKanban, Users, Globe, Settings, LayoutDashboard, Shield } from 'lucide-react'
import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { useTeams } from '@/hooks/useTeams'
import { useWorkspaceStore } from '@/stores/workspace'
import { Button, Tabs, Badge, Input } from '@/components/shared'
import ProjectWorkspaceSettings from '@/components/workspace/ProjectWorkspaceSettings'
import ProjectGuardrailsEditor from '@/components/workspace/ProjectGuardrailsEditor'
import './ProjectDetail.css'

const projectTabs = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'workspace', label: 'Workspace', icon: <LayoutDashboard size={16} /> },
  { id: 'guardrails', label: 'Guardrails', icon: <Shield size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
]

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: project, isLoading } = useProject(id || '')
  const { data: teamsData } = useTeams()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const activeProject = useWorkspaceStore((s) => s.activeProject)
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'archived'>('active')

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
      setStatus(project.status)
    }
  }, [project])

  if (isLoading) {
    return (
      <div className="project-detail">
        <div className="project-detail__loading">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-detail">
        <div className="project-detail__not-found">
          <h2>Project not found</h2>
          <Button variant="secondary" onClick={() => navigate('/app/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const team = teamsData?.data?.find((t) => t.id === project.team_id)
  const isActive = activeProject?.id === project.id

  const handleSave = () => {
    updateProject.mutate({
      id: project.id,
      data: { name: name.trim(), description: description.trim() || undefined, status },
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject.mutate(project.id, { onSuccess: () => navigate('/app/projects') })
    }
  }

  return (
    <div className="project-detail">
      <div className="project-detail__top-bar">
        <button className="project-detail__back" onClick={() => navigate('/app/projects')}>
          <ArrowLeft size={18} />
          <span>Projects</span>
        </button>
      </div>

      <div className="project-detail__header">
        <div className="project-detail__title-row">
          <div className="project-detail__avatar">
            <FolderKanban size={20} />
          </div>
          <div className="project-detail__info">
            <h1 className="project-detail__name">{project.name}</h1>
            {project.description && <p className="project-detail__desc">{project.description}</p>}
            <div className="project-detail__badges">
              {project.scope === 'team' ? (
                <Badge variant="default"><Users size={12} style={{ marginRight: 4 }} />{team?.name ?? 'Team Project'}</Badge>
              ) : (
                <Badge variant="info"><Globe size={12} style={{ marginRight: 4 }} />Org Project</Badge>
              )}
              {project.status === 'archived' && <Badge variant="warning">Archived</Badge>}
              {isActive && <Badge variant="success">Active project</Badge>}
            </div>
          </div>
          <div className="project-detail__actions">
            <Button
              variant={isActive ? 'secondary' : 'primary'}
              onClick={() => setActiveProject(isActive ? null : { id: project.id, name: project.name, scope: project.scope, team_id: project.team_id })}
            >
              {isActive ? 'Deactivate' : 'Set as Active'}
            </Button>
          </div>
        </div>
      </div>

      <div className="project-detail__tabs">
        <Tabs tabs={projectTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="project-detail__content">
        {activeTab === 'overview' && (
          <div className="project-detail__overview">
            <div className="project-detail__overview-card">
              <h3>Summary</h3>
              <p>{project.description || 'No description yet.'}</p>
            </div>
            <div className="project-detail__overview-card">
              <h3>Scope</h3>
              <p>{project.scope === 'team' ? `Team-owned: ${team?.name ?? 'Team'}` : 'Organization-wide project'}</p>
            </div>
            <div className="project-detail__overview-card">
              <h3>Status</h3>
              <p>{project.status}</p>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <ProjectWorkspaceSettings projectId={project.id} />
        )}

        {activeTab === 'guardrails' && (
          <ProjectGuardrailsEditor projectId={project.id} />
        )}

        {activeTab === 'settings' && (
          <div className="project-detail__settings">
            <div className="project-detail__settings-card">
              <h3>Project Settings</h3>
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
              <div className="project-detail__row">
                <label className="input-field__label">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'archived')} className="project-detail__select">
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="project-detail__settings-actions">
                <Button variant="primary" onClick={handleSave} loading={updateProject.isPending}>Save</Button>
                <Button variant="ghost" onClick={handleDelete} loading={deleteProject.isPending}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
