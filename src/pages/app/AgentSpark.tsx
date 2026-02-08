import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles, Plus, Trash2, MessageSquare, Loader2, Download, Pin,
  ChevronDown, ChevronUp, Database, Users, Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SparkChat from '@/components/spark/SparkChat';
import { useSparkConversations, useSparkConversation, useDeleteSparkConversation } from '@/hooks/useSpark';
import { formatRelativeDate } from '@/utils/format';
import type { SparkMessage } from '@/api/types';
import './AgentSpark.css';

/* ------------------------------------------------------------------ */
/*  Mock data for new features                                         */
/* ------------------------------------------------------------------ */

const suggestedFollowUps: Record<string, string[]> = {
  default: [
    'Break this down by age group',
    'Compare with last quarter',
    'Show me the top 5 markets',
  ],
  audience: [
    'How does this differ for Gen Z?',
    'Filter by high-income households',
    'What are the key attitudinal drivers?',
  ],
  trend: [
    'Show year-over-year trend',
    'Which regions are growing fastest?',
    'Overlay with competitor data',
  ],
};

interface MockDataSource {
  study: string;
  wave: string;
  sampleSize: string;
}

const mockDataSources: MockDataSource[] = [
  { study: 'GWI Core', wave: 'Q4 2024', sampleSize: '45,218' },
  { study: 'GWI USA', wave: 'Q4 2024', sampleSize: '12,540' },
  { study: 'GWI Zeitgeist', wave: 'Dec 2024', sampleSize: '8,320' },
];

const activeContext = {
  dataset: 'GWI Core Q4 2024',
  audience: 'Internet Users 16-64',
  markets: '48 Markets',
};

/* ------------------------------------------------------------------ */
/*  Helper: pick follow-up suggestions                                 */
/* ------------------------------------------------------------------ */

function getFollowUps(messages: SparkMessage[]): string[] {
  if (messages.length === 0) return suggestedFollowUps.default;
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant') return suggestedFollowUps.default;
  const content = last.content.toLowerCase();
  if (content.includes('audience') || content.includes('demographic')) return suggestedFollowUps.audience;
  if (content.includes('trend') || content.includes('growth')) return suggestedFollowUps.trend;
  return suggestedFollowUps.default;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AgentSpark(): React.JSX.Element {
  const { id: routeId } = useParams<{ id: string }>();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(routeId);
  const [sidebarTab, setSidebarTab] = useState<'history' | 'pinned'>('history');
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());

  /* ---------- State for follow-up injection into SparkChat ---------- */
  const [followUpText, setFollowUpText] = useState<string>('');

  const { data: conversations, isLoading: conversationsLoading } = useSparkConversations();
  const { data: activeConversation, isLoading: conversationLoading } = useSparkConversation(activeConversationId ?? '');
  const deleteConversation = useDeleteSparkConversation();

  const handleNewChat = () => {
    setActiveConversationId(undefined);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarTab('history');
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation.mutate(id, {
      onSuccess: () => {
        if (activeConversationId === id) {
          setActiveConversationId(undefined);
        }
      },
    });
  };

  /* ---------- Export handler ---------- */

  const handleExportChat = () => {
    toast.success('Conversation exported to clipboard!', {
      icon: '📋',
      duration: 3000,
    });
  };

  /* ---------- Pin helpers ---------- */

  const togglePin = (msgId: string) => {
    setPinnedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  /* ---------- Citation expand helpers ---------- */

  const toggleCitation = (msgId: string) => {
    setExpandedCitations((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  /* ---------- Follow-up chip handler ---------- */

  const handleFollowUp = (text: string) => {
    setFollowUpText(text);
  };

  /* ---------- Derived data ---------- */

  const allMessages: SparkMessage[] = activeConversation?.messages ?? [];
  const pinnedMessages = useMemo(
    () => allMessages.filter((m) => pinnedMessageIds.has(m.id)),
    [allMessages, pinnedMessageIds],
  );

  const followUps = getFollowUps(allMessages);

  return (
    <div className="agent-spark-page">
      {/* ============ Top bar ============ */}
      <div className="spark-top-bar">
        <div className="spark-top-left">
          <Sparkles size={18} className="spark-logo-icon" />
          <span className="spark-title">Agent Spark</span>
          <span className="spark-badge">AI</span>
        </div>

        {/* Context indicator */}
        <div className="spark-context-indicator">
          <div className="spark-context-chip">
            <Database size={13} />
            <span>{activeContext.dataset}</span>
          </div>
          <div className="spark-context-chip">
            <Users size={13} />
            <span>{activeContext.audience}</span>
          </div>
          <div className="spark-context-chip">
            <Globe size={13} />
            <span>{activeContext.markets}</span>
          </div>
        </div>

        <div className="spark-top-right">
          <button className="spark-export-btn" onClick={handleExportChat} title="Export conversation">
            <Download size={14} />
            <span>Export</span>
          </button>
          <button className="spark-new-chat-btn" onClick={handleNewChat}>
            <Plus size={14} />
            <span>New chat</span>
          </button>
        </div>
      </div>

      {/* ============ Main layout ============ */}
      <div className="chat-container" style={{ display: 'flex', gap: 0 }}>
        {/* ---------- Sidebar ---------- */}
        <div className="chat-sidebar" style={{
          width: '280px',
          minWidth: '280px',
          borderRight: '1px solid var(--border-color, #e5e7eb)',
          overflowY: 'auto',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Sidebar tabs */}
          <div className="spark-sidebar-tabs">
            <button
              className={`spark-sidebar-tab ${sidebarTab === 'history' ? 'active' : ''}`}
              onClick={() => setSidebarTab('history')}
            >
              <MessageSquare size={14} />
              <span>History</span>
            </button>
            <button
              className={`spark-sidebar-tab ${sidebarTab === 'pinned' ? 'active' : ''}`}
              onClick={() => setSidebarTab('pinned')}
            >
              <Pin size={14} />
              <span>Pinned</span>
              {pinnedMessageIds.size > 0 && (
                <span className="spark-sidebar-tab-count">{pinnedMessageIds.size}</span>
              )}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {sidebarTab === 'history' ? (
              /* --- History tab --- */
              conversationsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                  <Loader2 size={20} className="spin" />
                </div>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((convo) => (
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
                      }}>
                        {convo.title}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.5 }}>
                        {formatRelativeDate(convo.updated_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, convo.id)}
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
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 16px', opacity: 0.5, fontSize: '13px' }}>
                  No conversations yet
                </div>
              )
            ) : (
              /* --- Pinned tab --- */
              pinnedMessages.length > 0 ? (
                pinnedMessages.map((msg) => (
                  <div key={msg.id} className="spark-pinned-item">
                    <Pin size={13} className="spark-pinned-icon" />
                    <div className="spark-pinned-body">
                      <div className="spark-pinned-role">{msg.role === 'assistant' ? 'Spark' : 'You'}</div>
                      <div className="spark-pinned-text">{msg.content}</div>
                    </div>
                    <button
                      className="spark-pinned-remove"
                      onClick={() => togglePin(msg.id)}
                      title="Unpin"
                    >
                      <Pin size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="spark-pinned-empty">
                  <Pin size={20} style={{ opacity: 0.3 }} />
                  <span>No pinned messages</span>
                  <span className="spark-pinned-empty-hint">
                    Pin important messages using the pin icon on each message.
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* ---------- Main chat area ---------- */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {conversationLoading && activeConversationId ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <>
              <SparkChat
                conversationId={activeConversationId}
                initialMessages={activeConversation?.messages ?? []}
              />

              {/* ---------- Overlaid features below chat ---------- */}
              {allMessages.length > 0 && (
                <div className="spark-extras">
                  {/* Data Source Citations for last assistant message */}
                  {allMessages.filter((m) => m.role === 'assistant').length > 0 && (() => {
                    const lastAssistant = [...allMessages].reverse().find((m) => m.role === 'assistant');
                    if (!lastAssistant) return null;
                    const isExpanded = expandedCitations.has(lastAssistant.id);
                    return (
                      <div className="spark-citations-panel">
                        <button
                          className="spark-citations-toggle"
                          onClick={() => toggleCitation(lastAssistant.id)}
                        >
                          <Database size={14} />
                          <span>Data Sources ({mockDataSources.length})</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {isExpanded && (
                          <div className="spark-citations-body">
                            {mockDataSources.map((src, i) => (
                              <div key={i} className="spark-citation-row">
                                <span className="spark-citation-study">{src.study}</span>
                                <span className="spark-citation-meta">{src.wave}</span>
                                <span className="spark-citation-meta">n={src.sampleSize}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Pin last assistant message */}
                  {allMessages.filter((m) => m.role === 'assistant').length > 0 && (() => {
                    const lastAssistant = [...allMessages].reverse().find((m) => m.role === 'assistant');
                    if (!lastAssistant) return null;
                    const isPinned = pinnedMessageIds.has(lastAssistant.id);
                    return (
                      <button
                        className={`spark-pin-btn ${isPinned ? 'pinned' : ''}`}
                        onClick={() => togglePin(lastAssistant.id)}
                        title={isPinned ? 'Unpin this response' : 'Pin this response'}
                      >
                        <Pin size={14} />
                        <span>{isPinned ? 'Pinned' : 'Pin response'}</span>
                      </button>
                    );
                  })()}

                  {/* Suggested follow-ups */}
                  <div className="spark-followups">
                    <span className="spark-followups-label">Suggested follow-ups:</span>
                    <div className="spark-followups-chips">
                      {followUps.map((text, i) => (
                        <button
                          key={i}
                          className="spark-followup-chip"
                          onClick={() => handleFollowUp(text)}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
