import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronDown, Send, ExternalLink, LucideIcon } from 'lucide-react';
import './Home.css';

interface ExamplePrompt {
  label: string;
  icon: LucideIcon;
}

interface RecentChat {
  id: number;
  title: string;
  date: string;
}

const examplePrompts: ExamplePrompt[] = [
  { label: 'Understanding GWI taxonomy', icon: ExternalLink },
  { label: 'Strategy and consumer trends', icon: ExternalLink },
  { label: 'Audience profiling', icon: ExternalLink },
  { label: 'Competitive positioning', icon: ExternalLink },
];

const recentChats: RecentChat[] = [
  { id: 1, title: 'Chat', date: '120 days ago' },
];

export default function Home(): React.JSX.Element {
  const [question, setQuestion] = useState<string>('');
  const [dataset, setDataset] = useState<string>('GWI Core');

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Agent Spark Hero */}
        <div className="agent-spark-hero">
          <div className="agent-spark-avatar">
            <span className="wave-emoji">👋</span>
          </div>
          <h1 className="agent-spark-title">
            Hi Kevin, what can<br />
            <span className="highlight">Agent Spark</span> help you with today?
          </h1>

          {/* Input Area */}
          <div className="agent-spark-input-container">
            <input
              type="text"
              className="agent-spark-input"
              placeholder="Ask Agent Spark a question"
              value={question}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
            />
            <div className="agent-spark-input-actions">
              <button className="add-audience-btn">
                <Users size={16} />
                <span>Add audience</span>
              </button>
              <div className="agent-spark-input-right">
                <button className="dataset-selector">
                  <span>{dataset}</span>
                  <ChevronDown size={16} />
                </button>
                <button className="send-btn" disabled={!question}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          <p className="agent-spark-disclaimer">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>

        {/* Example Prompts */}
        <div className="example-prompts-section">
          <div className="example-prompts-header">
            <span className="sparkle-icon">✨</span>
            <span>See example prompts from popular categories</span>
          </div>
          <div className="example-prompts-list">
            {examplePrompts.map((prompt: ExamplePrompt, index: number) => (
              <button key={index} className="example-prompt-btn">
                <span>{prompt.label}</span>
                <ExternalLink size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="recent-section">
          <h2 className="recent-title">Most Recent</h2>
          <div className="recent-list">
            {recentChats.map((chat: RecentChat) => (
              <Link key={chat.id} to={`/app/agent-spark/${chat.id}`} className="recent-item">
                <div className="recent-item-icon">
                  <span className="sparkle-icon small">✨</span>
                </div>
                <div className="recent-item-content">
                  <h3 className="recent-item-title">{chat.title}</h3>
                  <p className="recent-item-date">{chat.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
