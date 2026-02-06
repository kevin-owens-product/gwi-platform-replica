import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react'
import { useSparkChat } from '@/hooks/useSpark'
import type { SparkMessage, SparkContext } from '@/api/types'
import './SparkChat.css'

interface SparkChatProps {
  conversationId?: string
  initialMessages?: SparkMessage[]
  context?: SparkContext
  compact?: boolean
}

export default function SparkChat({
  conversationId,
  initialMessages = [],
  context,
  compact = false,
}: SparkChatProps) {
  const [messages, setMessages] = useState<SparkMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [activeConversation, setActiveConversation] = useState(conversationId)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sparkChat = useSparkChat()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || sparkChat.isPending) return

    const userMessage: SparkMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    sparkChat.mutate(
      {
        message: input.trim(),
        conversation_id: activeConversation,
        context,
      },
      {
        onSuccess: (response) => {
          setActiveConversation(response.conversation_id)
          setMessages((prev) => [...prev, response.message])
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please try again.',
              created_at: new Date().toISOString(),
            },
          ])
        },
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className={`spark-chat ${compact ? 'spark-chat--compact' : ''}`}>
      <div className="spark-chat__messages">
        {messages.length === 0 && (
          <div className="spark-chat__empty">
            <Sparkles size={32} />
            <h3>Agent Spark</h3>
            <p>Ask me anything about your data, audiences, or consumer insights.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`spark-chat__message spark-chat__message--${msg.role}`}
          >
            <div className="spark-chat__message-avatar">
              {msg.role === 'assistant' ? (
                <Sparkles size={16} />
              ) : (
                <User size={16} />
              )}
            </div>
            <div className="spark-chat__message-content">
              <div className="spark-chat__message-text">{msg.content}</div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="spark-chat__citations">
                  {msg.citations.map((citation, i) => (
                    <a
                      key={i}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="spark-chat__citation"
                    >
                      [{i + 1}] {citation.text}
                    </a>
                  ))}
                </div>
              )}

              {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                <div className="spark-chat__actions">
                  {msg.suggested_actions.map((action, i) => (
                    <button key={i} className="spark-chat__action-btn">
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {msg.role === 'assistant' && (
                <div className="spark-chat__message-tools">
                  <button onClick={() => copyMessage(msg.content)} title="Copy">
                    <Copy size={14} />
                  </button>
                  <button title="Good response">
                    <ThumbsUp size={14} />
                  </button>
                  <button title="Bad response">
                    <ThumbsDown size={14} />
                  </button>
                  <button title="Regenerate">
                    <RotateCcw size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {sparkChat.isPending && (
          <div className="spark-chat__message spark-chat__message--assistant">
            <div className="spark-chat__message-avatar">
              <Sparkles size={16} />
            </div>
            <div className="spark-chat__message-content">
              <div className="spark-chat__typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="spark-chat__input-area">
        <textarea
          ref={inputRef}
          className="spark-chat__input"
          placeholder="Ask Agent Spark a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="spark-chat__send"
          disabled={!input.trim() || sparkChat.isPending}
          onClick={handleSend}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
