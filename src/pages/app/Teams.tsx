import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'
import { useWorkspaceStore } from '@/stores/workspace'
import { Button, SearchInput, EmptyState } from '@/components/shared'
import TeamCard from '@/components/teams/TeamCard'
import TeamCreateModal from '@/components/teams/TeamCreateModal'
import './Teams.css'

export default function Teams() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId)

  const { data, isLoading } = useTeams({ search: search || undefined })
  const teams = data?.data ?? []

  return (
    <div className="teams-page">
      <div className="teams-page__header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="teams-page__subtitle">
            Create and manage teams to collaborate with your colleagues
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New Team
        </Button>
      </div>

      <div className="teams-page__search">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search teams..."
        />
      </div>

      {isLoading ? (
        <div className="teams-page__loading">Loading teams...</div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title={search ? 'No teams found' : 'No teams yet'}
          description={
            search
              ? 'Try a different search term'
              : 'Create a team to start collaborating with your colleagues'
          }
          action={
            !search ? (
              <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                Create your first team
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="teams-page__grid">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isActive={team.id === activeTeamId}
              onClick={() => navigate(`/app/teams/${team.id}`)}
            />
          ))}
        </div>
      )}

      <TeamCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(teamId) => navigate(`/app/teams/${teamId}`)}
      />
    </div>
  )
}
