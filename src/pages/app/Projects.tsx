import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderKanban, Users, Globe, Archive } from 'lucide-react'
import { useProjects, useCreateProject } from '@/hooks/useProjects'
import { useTeams } from '@/hooks/useTeams'
import { useWorkspaceStore } from '@/stores/workspace'
import { Button, SearchInput, Tabs, Modal, Input, Badge, EmptyState } from '@/components/shared'
import type { Project } from '@/api/types'
import './Projects.css'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'team', label: 'Team' },
  { id: 'org', label: 'Org' },
  { id: 'archived', label: 'Archived' },
]

export default function Projects(): React.JSX.Element {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newScope, setNewScope] = useState<'team' | 'org'>('team')
  const [newTeamId, setNewTeamId] = useState<string>('')

  const activeProject = useWorkspaceStore((s) => s.activeProject)
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject)

  const { data: teamsData } = useTeams()
  const teams = teamsData?.data ?? []

  const scopeFilter = activeTab === 'team' ? 'team' : activeTab === 'org' ? 'org' : undefined
  const statusFilter = activeTab === 'archived' ? 'archived' : undefined

  const { data, isLoading } = useProjects({
    search: search || undefined,
    scope: scopeFilter,
    status: statusFilter,
  })

  const createProject = useCreateProject()

  const projects = data?.data ?? []

  const handleCreate = () => {
    if (!newName.trim()) return
    if (newScope === 'team' && !newTeamId) return
    createProject.mutate({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      scope: newScope,
      team_id: newScope === 'team' ? newTeamId : undefined,
    }, {
      onSuccess: (project) => {
        setCreateOpen(false)
        setNewName('')
        setNewDescription('')
        setNewScope('team')
        setNewTeamId('')
        if (project) navigate(`/app/projects/${project.id}`)
      },
    })
  }

  return (
    <div className="projects-page">
      <div className="projects-page__header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="projects-page__subtitle">Organize work across teams and tools.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New Project
        </Button>
      </div>

      <div className="projects-page__controls">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects..." />
      </div>

      {isLoading ? (
        <div className="projects-page__loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={48} />}
          title={search ? 'No projects found' : 'No projects yet'}
          description={search ? 'Try a different search term' : 'Create a project to start collaborating.'}
          action={
            !search ? (
              <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                Create your first project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="projects-page__grid">
          {projects.map((project: Project) => {
            const team = teams.find((t) => t.id === project.team_id)
            const isActive = activeProject?.id === project.id
            return (
              <div key={project.id} className={`project-card ${isActive ? 'project-card--active' : ''}`}>
                <div className="project-card__header">
                  <div className="project-card__icon">
                    <FolderKanban size={18} />
                  </div>
                  <div>
                    <div className="project-card__name">{project.name}</div>
                    <div className="project-card__meta">
                      {project.scope === 'team' ? (
                        <span><Users size={12} /> {team?.name ?? 'Team Project'}</span>
                      ) : (
                        <span><Globe size={12} /> Org Project</span>
                      )}
                      {project.status === 'archived' && (
                        <span><Archive size={12} /> Archived</span>
                      )}
                    </div>
                  </div>
                </div>
                {project.description && <p className="project-card__desc">{project.description}</p>}
                <div className="project-card__actions">
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/app/projects/${project.id}`)}>Open</Button>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveProject(isActive ? null : { id: project.id, name: project.name, scope: project.scope, team_id: project.team_id })}
                  >
                    {isActive ? 'Active' : 'Set Active'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Project"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={createProject.isPending}>Create</Button>
          </>
        }
      >
        <div className="project-create">
          <Input
            label="Project Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
          <Input
            label="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            fullWidth
          />
          <div className="project-create__row">
            <label className="input-field__label">Scope</label>
            <select value={newScope} onChange={(e) => setNewScope(e.target.value as 'team' | 'org')} className="project-create__select">
              <option value="team">Team</option>
              <option value="org">Organization</option>
            </select>
          </div>
          {newScope === 'team' && (
            <div className="project-create__row">
              <label className="input-field__label">Team</label>
              <select value={newTeamId} onChange={(e) => setNewTeamId(e.target.value)} className="project-create__select">
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          )}
          {newScope === 'org' && (
            <div className="project-create__org-note">
              <Badge variant="info">Org projects are visible to all org members.</Badge>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
