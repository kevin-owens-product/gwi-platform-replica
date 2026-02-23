import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { agents, getFeaturedAgents } from '@/data/agents'
import type { AgentStarterTemplate } from '@/data/agent-templates'
import { useAgenticRuns } from '@/hooks/useAgentic'
import { useSparkChat } from '@/hooks/useSpark'
import HomeAttentionQueue from './home/HomeAttentionQueue'
import HomeCommandCenter from './home/HomeCommandCenter'
import HomeLaunchpad from './home/HomeLaunchpad'
import HomeOpsHealth from './home/HomeOpsHealth'
import HomeRecentWork from './home/HomeRecentWork'
import { trackHomeTelemetry } from './home/home-telemetry'
import { useHomeSnapshot } from './home/useHomeSnapshot'
import { resolveStarterTemplates, trackStarterEvent } from '@/utils/template-resolver'
import './Home.css'

export default function Home(): React.JSX.Element {
  const navigate = useNavigate()
  const sparkChat = useSparkChat()
  const { snapshot, refetchAll } = useHomeSnapshot()

  // Keep this query mounted for cross-page cache warmup so Agent Spark navigation feels immediate.
  useAgenticRuns()

  const featuredAgents = useMemo(() => getFeaturedAgents(4), [])
  const [question, setQuestion] = useState<string>('')
  const hasTrackedLoad = useRef(false)
  const [selectedStarterAgentId, setSelectedStarterAgentId] = useState<string>(
    featuredAgents[0]?.id ?? agents[0]?.id ?? ''
  )

  useEffect(() => {
    if (hasTrackedLoad.current) return
    hasTrackedLoad.current = true
    trackHomeTelemetry('home.loaded', {
      active_project_id: snapshot.activeProjectId,
      active_project_name: snapshot.activeProjectName,
    })
  }, [snapshot.activeProjectId, snapshot.activeProjectName])

  useEffect(() => {
    if (!selectedStarterAgentId && featuredAgents[0]?.id) {
      setSelectedStarterAgentId(featuredAgents[0].id)
    }
  }, [featuredAgents, selectedStarterAgentId])

  const templates = useMemo(() => {
    const selected = resolveStarterTemplates({
      agentId: selectedStarterAgentId || undefined,
      contextType: 'general',
      limit: 4,
    })

    if (selected.length > 0) return selected
    return snapshot.featuredTemplates
  }, [selectedStarterAgentId, snapshot.featuredTemplates])

  const handleSend = () => {
    const content = question.trim()
    if (!content || sparkChat.isPending) return

    trackHomeTelemetry('home.command_submitted', {
      has_active_project: Boolean(snapshot.activeProjectId),
      character_count: content.length,
    })

    sparkChat.mutate(
      {
        message: content,
        context: snapshot.activeProjectId ? { project_id: snapshot.activeProjectId } : undefined,
      },
      {
        onSuccess: (response) => {
          setQuestion('')
          navigate(`/app/agent-spark/${response.conversation_id}`)
        },
      }
    )
  }

  const handleStarterTemplateLaunch = (template: AgentStarterTemplate) => {
    const params = new URLSearchParams()
    if (template.agentId) params.set('agent', template.agentId)
    params.set('template_id', template.id)
    params.set('open_templates', '1')

    trackStarterEvent('starter_template_selected', {
      entry_point: 'home_v2',
      template_id: template.id,
      agent_id: template.agentId,
    })

    navigate(`/app/agent-spark?${params.toString()}`)
  }

  const handleFeaturedAgentLaunch = (agentId: string) => {
    const starterTemplate = resolveStarterTemplates({ agentId, contextType: 'general', limit: 1 })[0]
    const params = new URLSearchParams()
    params.set('agent', agentId)
    params.set('open_templates', '1')
    if (starterTemplate) params.set('template_id', starterTemplate.id)
    navigate(`/app/agent-spark?${params.toString()}`)
  }

  return (
    <div className="home-page home-v2">
      <div className="home-v2-content">
        <div className="home-v2-hero-grid">
          <HomeCommandCenter
            model={snapshot.commandCenter}
            question={question}
            isSubmitting={sparkChat.isPending}
            featuredAgents={featuredAgents}
            selectedAgentId={selectedStarterAgentId}
            templates={templates}
            totals={snapshot.workspaceTotals}
            onQuestionChange={setQuestion}
            onSubmit={handleSend}
            onSelectAgent={setSelectedStarterAgentId}
            onTemplateLaunch={handleStarterTemplateLaunch}
            onFeaturedAgentLaunch={handleFeaturedAgentLaunch}
            onAddAudience={() => navigate('/app/audiences/new')}
          />

          <HomeOpsHealth
            summary={snapshot.opsHealth}
            onCardOpen={(cardId) =>
              trackHomeTelemetry('home.ops_card_opened', {
                card_id: cardId,
                overall_status: snapshot.opsHealth.overallStatus,
              })
            }
          />
        </div>

        <HomeLaunchpad
          actions={snapshot.launchpad}
          onActionClick={(action) =>
            trackHomeTelemetry('home.quick_action_clicked', {
              action_id: action.id,
              action_path: action.path,
            })
          }
        />

        <div className="home-v2-lower-grid">
          <HomeRecentWork panel={snapshot.recentWork} onRetry={refetchAll} />
          <HomeAttentionQueue
            panel={snapshot.attentionQueue}
            onRetry={refetchAll}
            onOpenItem={(item) =>
              trackHomeTelemetry('home.attention_item_opened', {
                item_id: item.id,
                severity: item.severity,
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
