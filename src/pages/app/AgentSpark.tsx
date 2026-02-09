import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Plus, Trash2, MessageSquare, Loader2,
  Search, Pin, PinOff, Download, Tag, X,
  BarChart3, Table2, Users, Globe, Grid3X3, Lightbulb,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SparkChat from '@/components/spark/SparkChat';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';
import { useSparkConversations, useSparkConversation, useDeleteSparkConversation } from '@/hooks/useSpark';
import { useWorkspaceStore } from '@/stores/workspace';
import { formatRelativeDate } from '@/utils/format';
import type { SparkConversation, SparkAction, SparkContext } from '@/api/types';
import './AgentSpark.css';

const SUGGESTED_PROMPTS = [
  {
    icon: <BarChart3 size={16} />,
    text: 'Show me social media usage trends among Gen Z in the US over the past 3 years',
  },
  {
    icon: <Users size={16} />,
    text: 'Build an audience of health-conscious millennials who use TikTok daily',
  },
  {
    icon: <Grid3X3 size={16} />,
    text: 'Create a crosstab comparing brand awareness across age groups for Nike vs Adidas',
  },
  {
    icon: <Globe size={16} />,
    text: 'Compare online shopping behaviour in the UK, Germany and France',
  },
  {
    icon: <Lightbulb size={16} />,
    text: 'What are the top 5 media consumption trends this quarter?',
  },
  {
    icon: <Table2 size={16} />,
    text: 'Visualise the relationship between income levels and streaming platform usage',
  },
];

const CONTEXT_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  chart: { label: 'Chart', icon: <BarChart3 size={12} />, color: 'var(--color-primary)' },
  crosstab: { label: 'Crosstab', icon: <Table2 size={12} />, color: 'var(--color-accent-blue, #0ea5e9)' },
  audience: { label: 'Audience', icon: <Users size={12} />, color: 'var(--color-success, #22c55e)' },
  dashboard: { label: 'Dashboard', icon: <BarChart3 size={12} />, color: 'var(--color-warning, #f59e0b)' },
  report: { label: 'Report', icon: <MessageSquare size={12} />, color: 'var(--color-secondary, #6366f1)' },
  canvas: { label: 'Canvas', icon: <Grid3X3 size={12} />, color: 'var(--color-info, #8b5cf6)' },
};

const CATEGORY_OPTIONS = ['General', 'Research', 'Audience', 'Data Analysis', 'Reporting'];

export default function AgentSpark(): React.JSX.Element {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const promptParam = searchParams.get('prompt') ?? undefined;

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
    return ctx;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(routeId);
  // Track when a conversation was just created in-page so we skip the loading
  // spinner (which would unmount SparkChat and lose the messages it already has)
  const justCreatedRef = useRef(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: conversations, isLoading: conversationsLoading } = useSparkConversations();
  const { data: activeConversation, isLoading: conversationLoading } = useSparkConversation(activeConversationId ?? '');
  const deleteConversation = useDeleteSparkConversation();

  const activeContext = useWorkspaceStore((s) => s.activeContext);

  // Search within conversations
  const [conversationSearch, setConversationSearch] = useState('');
  const [showConversationSearch, setShowConversationSearch] = useState(false);

  // Pinned conversations
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Conversation tags/categories
  const [conversationCategories, setConversationCategories] = useState<Record<string, string>>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState<string | null>(null);

  // Sync activeConversationId when route param changes
  useEffect(() => {
    setActiveConversationId(routeId);
  }, [routeId]);

  const handleNewChat = () => {
    justCreatedRef.current = false;
    setActiveConversationId(undefined);
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
    }
    toast.success(action.label);
  };

  return (
    <div className="agent-spark-page">
      <div className="spark-top-bar">
        <div className="spark-top-left">
          <Sparkles size={18} className="spark-logo-icon" />
          <span className="spark-title">Agent Spark</span>
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
          {/* Export button */}
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
        <div style={{ flex: 1, minWidth: 0 }}>
          {conversationLoading && activeConversationId && !justCreatedRef.current ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <SparkChat
              conversationId={activeConversationId}
              initialMessages={activeConversation?.messages ?? []}
              initialInput={promptParam}
              autoSend={!!promptParam}
              context={sparkContext ?? (activeContext?.type && activeContext?.id ? {
                [`${activeContext.type}_id`]: activeContext.id,
              } : undefined)}
              onConversationCreated={handleConversationCreated}
              onAction={handleSparkAction}
            />
          )}
        </div>
      </div>

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
