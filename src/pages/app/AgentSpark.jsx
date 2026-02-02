import { useState } from 'react';
import { Send, Users, ChevronDown, Plus } from 'lucide-react';
import './AgentSpark.css';

export default function AgentSpark() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { role: 'user', content: message }]);
      setMessage('');
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I\'m Agent Spark, your AI assistant for consumer insights. How can I help you today?'
        }]);
      }, 1000);
    }
  };

  return (
    <div className="agent-spark-page">
      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="agent-spark-avatar-large">
              <span>👋</span>
            </div>
            <h2>Start a conversation with Agent Spark</h2>
            <p>Ask questions about consumer data, create audiences, or get insights.</p>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="message-avatar">✨</div>
                )}
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask Agent Spark a question"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <div className="chat-input-actions">
            <button className="action-btn">
              <Users size={16} />
              <span>Add audience</span>
            </button>
            <div className="chat-input-right">
              <button className="dataset-btn">
                GWI Core
                <ChevronDown size={14} />
              </button>
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
