import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import SparkChat from '@/components/spark/SparkChat';
import { useSparkConversations, useSparkConversation, useDeleteSparkConversation } from '@/hooks/useSpark';
import { formatRelativeDate } from '@/utils/format';
import './AgentSpark.css';

export default function AgentSpark(): React.JSX.Element {
  const { id: routeId } = useParams<{ id: string }>();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(routeId);

  const { data: conversations, isLoading: conversationsLoading } = useSparkConversations();
  const { data: activeConversation, isLoading: conversationLoading } = useSparkConversation(activeConversationId ?? '');
  const deleteConversation = useDeleteSparkConversation();

  const handleNewChat = () => {
    setActiveConversationId(undefined);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
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

  return (
    <div className="agent-spark-page">
      <div className="spark-top-bar">
        <div className="spark-top-left">
          <Sparkles size={18} className="spark-logo-icon" />
          <span className="spark-title">Agent Spark</span>
          <span className="spark-badge">AI</span>
        </div>
        <button className="spark-new-chat-btn" onClick={handleNewChat}>
          <Plus size={14} />
          <span>New chat</span>
        </button>
      </div>

      <div className="chat-container" style={{ display: 'flex', gap: 0 }}>
        {/* Sidebar with conversation list */}
        <div className="chat-sidebar" style={{
          width: '280px',
          minWidth: '280px',
          borderRight: '1px solid var(--border-color, #e5e7eb)',
          overflowY: 'auto',
          padding: '12px 0',
        }}>
          {conversationsLoading ? (
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
          )}
        </div>

        {/* Main chat area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {conversationLoading && activeConversationId ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <SparkChat
              conversationId={activeConversationId}
              initialMessages={activeConversation?.messages ?? []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
