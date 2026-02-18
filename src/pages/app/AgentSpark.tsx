import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Plus, Trash2, MessageSquare, Loader2,
  Search, Pin, PinOff, Download, Tag, X,
  BarChart3, Table2, Users, Grid3X3, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SparkChat from '@/components/spark/SparkChat';
import StarterTemplateDrawer from '@/components/spark/StarterTemplateDrawer';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';
import IntegrationDestinationPicker from '@/components/integrations/IntegrationDestinationPicker';
import { useSparkConversations, useSparkConversation, useDeleteSparkConversation } from '@/hooks/useSpark';
import { useAgenticFlows, useAgenticRuns, useRunAgenticFlow } from '@/hooks/useAgentic';
import { useAgentAnalysisConfig } from '@/hooks/useAgentAnalysisConfig';
import { useDeliverIntegration } from '@/hooks/useIntegrations';
import { useWorkspaceStore } from '@/stores/workspace';
import { formatRelativeDate } from '@/utils/format';
import type { SparkConversation, SparkAction, SparkContext } from '@/api/types';
import SparkContextBadge from '@/components/workspace/SparkContextBadge';
import { getAgentById } from '@/data/agents';
import { getStarterTemplateById } from '@/data/agent-templates';
import { buildTemplatePrompt, getSparkContextType, trackStarterEvent } from '@/utils/template-resolver';
import { platformLinkages } from '@/agentic/registry';
import AgentAnalysisFilters from '@/components/agentic/AgentAnalysisFilters';
import './AgentSpark.css';

const CONTEXT_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  chart: { label: 'Chart', icon: <BarChart3 size={12} />, color: 'var(--color-primary)' },
  crosstab: { label: 'Crosstab', icon: <Table2 size={12} />, color: 'var(--color-accent-blue, #0ea5e9)' },
  audience: { label: 'Audience', icon: <Users size={12} />, color: 'var(--color-success, #22c55e)' },
  dashboard: { label: 'Dashboard', icon: <BarChart3 size={12} />, color: 'var(--color-warning, #f59e0b)' },
  report: { label: 'Report', icon: <MessageSquare size={12} />, color: 'var(--color-secondary, #6366f1)' },
  canvas: { label: 'Canvas', icon: <Grid3X3 size={12} />, color: 'var(--color-info, #8b5cf6)' },
};

const CATEGORY_OPTIONS = ['General', 'Research', 'Audience', 'Data Analysis', 'Reporting'];
const TEMPLATE_DRAWER_STORAGE_KEY = 'gwi_template_drawer_dismissed_agent_spark';

export default function AgentSpark(): React.JSX.Element {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const promptParam = searchParams.get('prompt') ?? undefined;
  const agentParam = searchParams.get('agent') ?? undefined;
  const templateParam = searchParams.get('template_id') ?? undefined;
  const openTemplatesParam = searchParams.get('open_templates') === '1';
  const activeAgent = agentParam ? getAgentById(agentParam) : undefined;

  // Parse SparkContext from URL query params once on mount.
  // The route uses an optional :id? param so the component is never remounted
  // when navigating from /agent-spark to /agent-spark/:id.
  const [sparkContext] = useState<SparkContext | undefined>(() => {
    const contextType = searchParams.get('context_type');
    const contextId = searchParams.get('context_id');
    if (!contextType || !contextId) return undefined;
    const ctx: SparkContext = {};
    if (contextType === 'chart') ctx.chart_id = contextId;
    else if (contextType === 'crosstab') ctx.crosstab_id = contextId;
    else if (contextType === 'dashboard') ctx.dashboard_id = contextId;
    else if (contextType === 'audience') ctx.audience_id = contextId;
    const waveIds = searchParams.get('wave_ids');
    if (waveIds) ctx.wave_ids = waveIds.split(',');
    const locationIds = searchParams.get('location_ids');
    if (locationIds) ctx.location_ids = locationIds.split(',');
    const projectId = searchParams.get('project_id');
    if (projectId) ctx.project_id = projectId;
    const teamId = searchParams.get('team_id');
    if (teamId) ctx.team_id = teamId;
    return ctx;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(routeId);
  // Track when a conversation was just created in-page so we skip the loading
  // spinner (which would unmount SparkChat and lose the messages it already has)
  const justCreatedRef = useRef(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliveryConnectionIds, setSelectedDeliveryConnectionIds] = useState<string[]>([]);

  const { data: conversations, isLoading: conversationsLoading } = useSparkConversations();
  const { data: activeConversation, isLoading: conversationLoading } = useSparkConversation(activeConversationId ?? '');
  const deleteConversation = useDeleteSparkConversation();
  const { data: agenticFlows } = useAgenticFlows();
  const { data: agenticRuns, refetch: refetchAgenticRuns } = useAgenticRuns();
  const runAgenticFlow = useRunAgenticFlow();
  const deliverIntegration = useDeliverIntegration();
  const analysisConfig = useAgentAnalysisConfig();

  const activeContext = useWorkspaceStore((s) => s.activeContext);

  // Search within conversations
  const [conversationSearch, setConversationSearch] = useState('');
  const [showConversationSearch, setShowConversationSearch] = useState(false);

  // Pinned conversations
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Conversation tags/categories
  const [conversationCategories, setConversationCategories] = useState<Record<string, string>>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState<string | null>(null);

  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [brief, setBrief] = useState(
    'Summarize streaming bundle adoption for Gen Z creators in US/UK with a client-ready narrative.'
  );
  const [manualPrompt, setManualPrompt] = useState<string | undefined>(undefined);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(templateParam);
  const [templatePrefilled, setTemplatePrefilled] = useState(false);
  const [trackedTemplateFirstMessage, setTrackedTemplateFirstMessage] = useState(false);
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState<boolean>(() => {
    if (openTemplatesParam) return true;
    if (typeof window === 'undefined') return !routeId;
    const dismissed = window.localStorage.getItem(TEMPLATE_DRAWER_STORAGE_KEY) === '1';
    return !dismissed && !routeId;
  });

  useEffect(() => {
    if (!selectedFlowId && agenticFlows?.length) {
      setSelectedFlowId(agenticFlows[0].id);
    }
  }, [agenticFlows, selectedFlowId]);

  useEffect(() => {
    if (!activeAgent || !agenticFlows?.length) return;
    const specialistFlowId = `flow-${activeAgent.id}`;
    const specialistExists = agenticFlows.some((flow) => flow.id === specialistFlowId);
    if (specialistExists) {
      setSelectedFlowId(specialistFlowId);
      return;
    }

    const fallbackFlowId = activeAgent.category === 'Proactivity & ROI'
      ? 'flow-campaign-lifecycle'
      : 'flow-brief-interpretation';
    if (agenticFlows.some((flow) => flow.id === fallbackFlowId)) {
      setSelectedFlowId(fallbackFlowId);
    }
  }, [activeAgent, agenticFlows]);

  useEffect(() => {
    if (activeAgent?.examplePrompt) {
      setBrief(activeAgent.examplePrompt);
    }
  }, [activeAgent]);

  useEffect(() => {
    if (!templateParam) {
      setManualPrompt(undefined);
      setSelectedTemplateId(undefined);
      setTemplatePrefilled(false);
      setTrackedTemplateFirstMessage(false);
    }
  }, [activeAgent?.id, templateParam]);

  useEffect(() => {
    if (!templateParam || routeId) return;
    const template = getStarterTemplateById(templateParam);
    if (!template) return;
    setSelectedTemplateId(template.id);
    setManualPrompt(buildTemplatePrompt(template));
    setTemplatePrefilled(true);
    setTrackedTemplateFirstMessage(false);
    setIsTemplateDrawerOpen(true);
  }, [templateParam, routeId]);

  useEffect(() => {
    if (openTemplatesParam) {
      setIsTemplateDrawerOpen(true);
    }
  }, [openTemplatesParam]);

  const selectedFlow = useMemo(
    () => (agenticFlows ?? []).find((flow) => flow.id === selectedFlowId),
    [agenticFlows, selectedFlowId]
  );

  const flowNameById = useMemo(() => {
    return Object.fromEntries((agenticFlows ?? []).map((flow) => [flow.id, flow.name]));
  }, [agenticFlows]);

  const templateContextType = useMemo(() => {
    const fromQuery = getSparkContextType(sparkContext);
    if (fromQuery) return fromQuery;
    if (!activeContext) return 'general';
    if (
      activeContext.type === 'chart' ||
      activeContext.type === 'crosstab' ||
      activeContext.type === 'audience' ||
      activeContext.type === 'dashboard' ||
      activeContext.type === 'report' ||
      activeContext.type === 'canvas'
    ) {
      return activeContext.type;
    }
    return 'general';
  }, [sparkContext, activeContext]);

  // Sync activeConversationId when route param changes
  useEffect(() => {
    setActiveConversationId(routeId);
  }, [routeId]);

  const handleNewChat = () => {
    justCreatedRef.current = false;
    setManualPrompt(undefined);
    setSelectedTemplateId(undefined);
    setTemplatePrefilled(false);
    setTrackedTemplateFirstMessage(false);
    setIsTemplateDrawerOpen(true);
    setActiveConversationId(undefined);
    analysisConfig.resetConfig();
    navigate('/app/agent-spark');
  };

  const handleSelectConversation = (id: string) => {
    justCreatedRef.current = false;
    setActiveConversationId(id);
    navigate(`/app/agent-spark/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteConversation.mutate(pendingDeleteId, {
      onSuccess: () => {
        if (activeConversationId === pendingDeleteId) {
          setActiveConversationId(undefined);
          navigate('/app/agent-spark');
        }
        setShowDeleteModal(false);
        setPendingDeleteId(null);
      },
    });
  };

  // Pin/unpin toggle
  const togglePin = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(convId)) {
        next.delete(convId);
      } else {
        next.add(convId);
      }
      return next;
    });
  };

  // Assign category to a conversation
  const assignCategory = (convId: string, category: string) => {
    setConversationCategories((prev) => ({ ...prev, [convId]: category }));
    setShowCategoryPicker(null);
  };

  // Export current conversation
  const handleExportConversation = () => {
    if (!activeConversation) {
      toast.error('No conversation to export');
      return;
    }
    const lines: string[] = [];
    lines.push(`# ${activeConversation.title || 'Spark Conversation'}`);
    lines.push(`Exported: ${new Date().toLocaleString()}`);
    lines.push('');
    for (const msg of activeConversation.messages ?? []) {
      const role = msg.role === 'user' ? 'You' : 'Spark';
      lines.push(`**${role}:** ${msg.content}`);
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spark-${activeConversation.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported');
  };

  const latestAssistantMessage = useMemo(
    () =>
      [...(activeConversation?.messages ?? [])]
        .reverse()
        .find((msg) => msg.role === 'assistant'),
    [activeConversation]
  );

  const handleDeliverConversation = () => {
    if (selectedDeliveryConnectionIds.length === 0) {
      toast.error('Select at least one destination');
      return;
    }
    const summary =
      latestAssistantMessage?.narrative_summary ||
      latestAssistantMessage?.content?.slice(0, 280) ||
      activeConversation?.title ||
      'Spark output';

    deliverIntegration.mutate(
      {
        connection_ids: selectedDeliveryConnectionIds,
        source_type: 'spark',
        source_id: activeConversation?.id,
        summary,
        artifacts: activeConversation?.id
          ? [{ label: 'Conversation Link', type: 'link', url: `/app/agent-spark/${activeConversation.id}` }]
          : undefined,
        source_context: {
          agent_id: activeAgent?.id,
          conversation_id: activeConversation?.id,
          context_type: activeContext?.type,
          context_id: activeContext?.id,
        },
        run_metadata: {
          mode: 'smart_summary_with_attachments',
          delivered_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          setShowDeliveryModal(false);
          setSelectedDeliveryConnectionIds([]);
        },
      }
    );
  };

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let list = [...(conversations ?? [])];
    if (conversationSearch) {
      const q = conversationSearch.toLowerCase();
      list = list.filter(
        (c: SparkConversation) =>
          c.title?.toLowerCase().includes(q) ||
          c.messages?.some((m) => m.content.toLowerCase().includes(q))
      );
    }
    // Sort: pinned first, then by date
    list.sort((a: SparkConversation, b: SparkConversation) => {
      const aPinned = pinnedIds.has(a.id);
      const bPinned = pinnedIds.has(b.id);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    return list;
  }, [conversations, conversationSearch, pinnedIds]);

  // Context indicator
  const contextMeta = activeContext?.type ? CONTEXT_TYPE_META[activeContext.type] : null;

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  const handleConversationCreated = (id: string) => {
    justCreatedRef.current = true;
    setActiveConversationId(id);
    navigate(`/app/agent-spark/${id}`, { replace: true });
  };

  const handleSparkAction = (action: SparkAction) => {
    const p = action.payload;
    switch (action.type) {
      case 'create_chart':
        navigate(p.chart_id ? `/app/chart-builder/chart/${p.chart_id}` : '/app/chart-builder/chart/new');
        break;
      case 'create_audience':
        navigate(p.audience_id ? `/app/audiences/${p.audience_id}` : '/app/audiences/new');
        break;
      case 'show_data':
        navigate(p.crosstab_id ? `/app/crosstabs/${p.crosstab_id}` : '/app/crosstabs/new');
        break;
      case 'navigate':
        navigate(p.path as string);
        break;
      case 'deliver_output':
        setSelectedDeliveryConnectionIds(
          ((p.connection_ids ?? p.destination_ids) as string[] | undefined) ?? []
        );
        setShowDeliveryModal(true);
        break;
    }
    toast.success(action.label);
  };

  const handleRunAgenticFlow = () => {
    if (!selectedFlowId) {
      toast.error('Select a flow to run');
      return;
    }
    const configPayload = analysisConfig.hasActiveFilters ? analysisConfig.config : undefined;
    runAgenticFlow.mutate(
      { flowId: selectedFlowId, brief, analysisConfig: configPayload },
      {
        onSuccess: () => {
          toast.success('Flow completed');
          refetchAgenticRuns();
        },
        onError: () => {
          toast.error('Failed to run flow');
        },
      }
    );
  };

  const formatArtifactLabel = (artifact: string) =>
    artifact
      .split(/[_-]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const handleLoadDemoPrompt = (prompt: string) => {
    setManualPrompt(prompt);
    toast.success('Prompt loaded into chat');
  };

  const handleStarterTemplateSelect = (
    template: { id: string; agentId?: string },
    prompt: string
  ) => {
    if (template.agentId && template.agentId !== activeAgent?.id) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set('agent', template.agentId);
      nextParams.set('template_id', template.id);
      nextParams.set('open_templates', '1');
      navigate(`/app/agent-spark?${nextParams.toString()}`, { replace: true });
    }
    setSelectedTemplateId(template.id);
    setManualPrompt(prompt);
    setTemplatePrefilled(true);
    setTrackedTemplateFirstMessage(false);
    setIsTemplateDrawerOpen(true);
    toast.success('Template loaded. Edit before sending.');
  };

  const handleTemplateDrawerOpenChange = (nextOpen: boolean) => {
    setIsTemplateDrawerOpen(nextOpen);
    if (!nextOpen && typeof window !== 'undefined') {
      window.localStorage.setItem(TEMPLATE_DRAWER_STORAGE_KEY, '1');
    }
    if (nextOpen && typeof window !== 'undefined') {
      window.localStorage.removeItem(TEMPLATE_DRAWER_STORAGE_KEY);
    }
  };

  const handleMessageSent = (_message: string) => {
    if (isTemplateDrawerOpen) {
      setIsTemplateDrawerOpen(false);
    }
    if (templatePrefilled && !trackedTemplateFirstMessage) {
      trackStarterEvent('first_message_sent_from_template', {
        entry_point: 'agent_spark',
        template_id: selectedTemplateId,
        agent_id: activeAgent?.id,
      });
      setTrackedTemplateFirstMessage(true);
    }
  };

  return (
    <div className="agent-spark-page">
      <div className="spark-top-bar">
        <div className="spark-top-left">
          {activeAgent ? (
            <>
              <span
                className="spark-agent-indicator"
                style={{ background: activeAgent.iconBg, color: activeAgent.iconColor }}
              >
                <activeAgent.icon size={16} />
              </span>
              <span className="spark-title">{activeAgent.name}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="spark-logo-icon" />
              <span className="spark-title">Agent Spark</span>
            </>
          )}
          <span className="spark-badge">AI</span>

          {/* Context Indicator */}
          {contextMeta && activeContext?.name && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: `${contextMeta.color}14`,
                border: `1px solid ${contextMeta.color}33`,
                fontSize: 'var(--font-size-xs)',
                fontWeight: 500,
                color: contextMeta.color,
                marginLeft: 'var(--spacing-sm)',
              }}
            >
              {contextMeta.icon}
              {contextMeta.label}: {activeContext.name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <button
            className="spark-new-chat-btn"
            onClick={() => handleTemplateDrawerOpenChange(!isTemplateDrawerOpen)}
            title="Starter templates"
          >
            <Sparkles size={14} />
            <span>Templates</span>
          </button>
          {/* Export button */}
          {activeConversationId && activeConversation && (
            <button
              className="spark-new-chat-btn"
              onClick={() => setShowDeliveryModal(true)}
              title="Deliver output"
            >
              <Send size={14} />
              <span>Deliver</span>
            </button>
          )}
          {activeConversationId && activeConversation && (
            <button
              className="spark-new-chat-btn"
              onClick={handleExportConversation}
              title="Export conversation"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          )}
          <button className="spark-new-chat-btn" onClick={handleNewChat}>
            <Plus size={14} />
            <span>New chat</span>
          </button>
        </div>
      </div>

      <div className="chat-container">
        {/* Sidebar with conversation list */}
        <div className="chat-sidebar" style={{
          width: '280px',
          minWidth: '280px',
          borderRight: '1px solid var(--border-color, #e5e7eb)',
          overflowY: 'auto',
          padding: '12px 0',
        }}>
          {/* Conversation Search */}
          <div style={{ padding: '0 var(--spacing-sm, 8px) var(--spacing-sm, 8px)', display: 'flex', gap: '4px', alignItems: 'center' }}>
            {showConversationSearch ? (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 4, border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', padding: '4px 8px' }}>
                <Search size={14} style={{ color: 'var(--color-text-muted, #9ca3af)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                  placeholder="Search conversations..."
                  autoFocus
                  style={{ border: 'none', outline: 'none', flex: 1, fontSize: '13px', background: 'transparent' }}
                />
                <button
                  onClick={() => { setShowConversationSearch(false); setConversationSearch(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted, #9ca3af)', padding: 0, display: 'flex' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConversationSearch(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  border: '1px solid var(--color-border-light, #f3f4f6)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'var(--color-text-muted, #9ca3af)',
                  background: 'transparent',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <Search size={14} />
                Search chats...
              </button>
            )}
          </div>

          {conversationsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <Loader2 size={20} className="spin" />
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((convo: SparkConversation) => {
              const isPinned = pinnedIds.has(convo.id);
              const category = conversationCategories[convo.id];
              return (
                <div
                  key={convo.id}
                  className={`chat-sidebar-item ${activeConversationId === convo.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(convo.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: activeConversationId === convo.id
                      ? 'var(--surface-hover, #f3f4f6)'
                      : 'transparent',
                    borderRadius: '6px',
                    margin: '2px 8px',
                  }}
                >
                  <MessageSquare size={16} style={{ flexShrink: 0, opacity: 0.5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      {isPinned && <Pin size={10} style={{ color: 'var(--color-primary, #E31C79)', flexShrink: 0 }} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {convo.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {formatRelativeDate(convo.updated_at)}
                      {category && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '99px',
                            background: 'var(--color-surface-secondary, #f9fafb)',
                            color: 'var(--color-text-muted, #9ca3af)',
                          }}
                        >
                          {category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons: pin, tag, delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <button
                      onClick={(e) => togglePin(e, convo.id)}
                      title={isPinned ? 'Unpin' : 'Pin'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        opacity: isPinned ? 0.8 : 0.4,
                        flexShrink: 0,
                      }}
                    >
                      {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowCategoryPicker(showCategoryPicker === convo.id ? null : convo.id); }}
                        title="Set category"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          opacity: 0.4,
                          flexShrink: 0,
                        }}
                      >
                        <Tag size={14} />
                      </button>
                      {showCategoryPicker === convo.id && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            zIndex: 20,
                            background: 'var(--color-white, #fff)',
                            border: '1px solid var(--color-border, #e5e7eb)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            minWidth: 130,
                            overflow: 'hidden',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => assignCategory(convo.id, cat)}
                              style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '6px 10px',
                                fontSize: '13px',
                                border: 'none',
                                background: category === cat ? 'rgba(227,28,121,0.06)' : 'transparent',
                                color: category === cat ? 'var(--color-primary, #E31C79)' : 'var(--color-text, #191530)',
                                cursor: 'pointer',
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, convo.id)}
                      disabled={deleteConversation.isPending}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        opacity: 0.4,
                        flexShrink: 0,
                      }}
                      title="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 16px', opacity: 0.5, fontSize: '13px' }}>
              {conversationSearch ? 'No matching conversations' : 'No conversations yet'}
            </div>
          )}
        </div>

        {/* Main chat area */}
        <div className="agent-spark-main">
          {(isTemplateDrawerOpen || !activeConversationId) && (
            <StarterTemplateDrawer
              selectedAgentId={activeAgent?.id}
              contextType={templateContextType}
              selectedTemplateId={selectedTemplateId}
              open={isTemplateDrawerOpen}
              onOpenChange={handleTemplateDrawerOpenChange}
              onSelectTemplate={handleStarterTemplateSelect}
              entryPoint="agent_spark"
              limit={activeAgent ? 8 : 6}
            />
          )}
          <SparkContextBadge />
          {conversationLoading && activeConversationId && !justCreatedRef.current ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <SparkChat
              conversationId={activeConversationId}
              initialMessages={activeConversation?.messages ?? []}
              initialInput={manualPrompt ?? promptParam}
              autoSend={!manualPrompt && !!promptParam}
              context={(() => {
                const baseContext = sparkContext ?? (activeContext?.type && activeContext?.id
                  ? { [`${activeContext.type}_id`]: activeContext.id }
                  : undefined)
                return {
                  ...baseContext,
                  ...(activeAgent
                    ? {
                        agent_id: activeAgent.id,
                        agent_name: activeAgent.name,
                        agent_category: activeAgent.category,
                      }
                    : {}),
                  ...(analysisConfig.hasActiveFilters
                    ? { analysis_config: analysisConfig.config }
                    : {}),
                }
              })()}
              onConversationCreated={handleConversationCreated}
              onAction={handleSparkAction}
              agentName={activeAgent?.name}
              agentDescription={activeAgent?.description}
              onMessageSent={handleMessageSent}
            />
          )}
        </div>

        {/* Agentic panel */}
        <div className="agentic-panel">
          <div className="agentic-section">
            <div className="agentic-section-title">Agentic Flow Runner</div>
            <div className="agentic-section-subtitle">
              Convert briefs into orchestrated workflows with traceable outputs.
            </div>
            <label className="agentic-label">
              Flow
              <select
                value={selectedFlowId}
                onChange={(e) => setSelectedFlowId(e.target.value)}
                className="agentic-select"
              >
                {(agenticFlows ?? []).map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="agentic-label">
              Brief
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="agentic-textarea"
              />
            </label>
            <button
              className="agentic-primary"
              onClick={handleRunAgenticFlow}
              disabled={runAgenticFlow.isPending}
            >
              {runAgenticFlow.isPending ? 'Running...' : 'Run flow'}
            </button>
          </div>

          <AgentAnalysisFilters
            config={analysisConfig.config}
            onTimeframeChange={analysisConfig.setTimeframe}
            onGranularityChange={analysisConfig.setGranularity}
            onRebaseModeChange={analysisConfig.setRebaseMode}
            onAddWave={analysisConfig.addWaveId}
            onRemoveWave={analysisConfig.removeWaveId}
            onCompareWavesChange={analysisConfig.setCompareWaves}
            onReset={analysisConfig.resetConfig}
            hasActiveFilters={analysisConfig.hasActiveFilters}
          />

          <div className="agentic-section">
            <div className="agentic-section-title">Selected Flow Blueprint</div>
            <div className="agentic-section-subtitle">
              Step-by-step execution plan and artifacts for this run.
            </div>
            {selectedFlow ? (
              <div className="agentic-flow-steps">
                {selectedFlow.steps.map((step, index) => (
                  <div key={step.id} className="agentic-flow-step-card">
                    <div className="agentic-flow-step-header">
                      <span className="agentic-flow-step-index">{index + 1}</span>
                      <div className="agentic-flow-step-name">{step.name}</div>
                    </div>
                    <div className="agentic-flow-step-desc">{step.description}</div>
                    {step.output_artifacts && step.output_artifacts.length > 0 && (
                      <div className="agentic-flow-artifacts">
                        {step.output_artifacts.map((artifact) => (
                          <span key={artifact} className="agentic-flow-artifact">
                            {formatArtifactLabel(artifact)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="agentic-empty">Select a flow to preview its steps.</div>
            )}
          </div>

          {activeAgent && (
            <div className="agentic-section">
              <div className="agentic-section-title">Agent Demo Kit</div>
              <div className="agentic-section-subtitle">{activeAgent.demo.workflowName}</div>
              <div className="agentic-demo-summary">{activeAgent.demo.workflowSummary}</div>

              <div className="agentic-demo-group-title">Workflow Steps</div>
              <div className="agentic-demo-steps">
                {activeAgent.demo.steps.map((step) => (
                  <div key={step.id} className="agentic-demo-step">
                    <div className="agentic-demo-step-name">{step.name}</div>
                    <div className="agentic-demo-step-desc">{step.description}</div>
                    <div className="agentic-demo-step-deliverable">Deliverable: {step.deliverable}</div>
                  </div>
                ))}
              </div>

              <div className="agentic-demo-group-title">Deliverables</div>
              <div className="agentic-demo-deliverables">
                {activeAgent.demo.deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="agentic-demo-deliverable">
                    <div className="agentic-demo-deliverable-name">{deliverable.name}</div>
                    <div className="agentic-demo-deliverable-type">{deliverable.type}</div>
                    <div className="agentic-demo-deliverable-desc">{deliverable.description}</div>
                  </div>
                ))}
              </div>

              <div className="agentic-demo-group-title">Chat Walkthrough</div>
              <div className="agentic-demo-chat-prompts">
                {activeAgent.demo.chatPrompts.map((item) => (
                  <button
                    key={item.id}
                    className="agentic-chat-script-btn"
                    onClick={() => handleLoadDemoPrompt(item.prompt)}
                    title={item.prompt}
                  >
                    <span className="agentic-chat-script-title">{item.title}</span>
                    <span className="agentic-chat-script-outcome">{item.expectedOutcome}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="agentic-section">
            <div className="agentic-section-title">Recent Runs</div>
            <div className="agentic-list">
              {(agenticRuns ?? []).slice(0, 6).map((run) => (
                <div key={run.id} className="agentic-card">
                  <div className="agentic-card-title">{run.brief}</div>
                  <div className="agentic-card-meta">
                    Flow: {flowNameById[run.flow_id] ?? run.flow_id} • Status: {run.status}
                  </div>
                  <div className="agentic-output-list">
                    {run.outputs.slice(0, 5).map((output) => (
                      <div key={output.id} className="agentic-output">
                        <div className="agentic-output-main">
                          <span>{output.label}</span>
                          <span className="agentic-output-summary">{output.summary}</span>
                        </div>
                        <span className="agentic-output-type">{output.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!agenticRuns || agenticRuns.length === 0) && (
                <div className="agentic-empty">No runs yet</div>
              )}
            </div>
          </div>

          <div className="agentic-section">
            <div className="agentic-section-title">Platform Linkages</div>
            <div className="agentic-linkages">
              {platformLinkages.map((link) => (
                <div key={link.id} className="agentic-linkage">
                  <div className="agentic-linkage-title">{link.name}</div>
                  <div className="agentic-linkage-meta">Auth: {link.auth}</div>
                  <div className="agentic-linkage-endpoints">
                    {link.endpoints.map((endpoint) => (
                      <span key={endpoint}>{endpoint}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="agentic-section">
            <div className="agentic-section-title">Provenance & Validation</div>
            <div className="agentic-validation">
              <div className="agentic-validation-item">Citations attached to outputs</div>
              <div className="agentic-validation-item">Confidence thresholds applied</div>
              <div className="agentic-validation-item">Governance checks complete</div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        title="Deliver Output"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowDeliveryModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeliverConversation}
              loading={deliverIntegration.isPending}
              disabled={selectedDeliveryConnectionIds.length === 0}
            >
              Deliver
            </Button>
          </div>
        }
      >
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          Send a smart summary and attachments to connected destinations.
        </p>
        <IntegrationDestinationPicker
          capability="message_delivery"
          multiSelect
          value={selectedDeliveryConnectionIds}
          onChange={setSelectedDeliveryConnectionIds}
          title="Message delivery destinations"
          emptyMessage="Connect Slack, Teams, or Zapier in Developer Integrations first."
        />
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={handleCancelDelete}
        title="Delete conversation"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={deleteConversation.isPending}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
