import { useState, useRef, useEffect } from 'react';
import { Send, Users, ChevronDown, Plus, Sparkles, BarChart2, TrendingUp, Globe, ShoppingCart, RotateCcw, LucideIcon } from 'lucide-react';
import './AgentSpark.css';

interface SuggestedPrompt {
  icon: LucideIcon;
  text: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponses {
  default: string[];
  trends: string[];
  brand: string[];
  internet: string[];
  purchase: string[];
}

const datasets: string[] = ['GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Kids', 'GWI Work'];

const suggestedPrompts: SuggestedPrompt[] = [
  { icon: TrendingUp, text: 'What are the top social media trends among Gen Z?' },
  { icon: BarChart2, text: 'Compare brand awareness across age groups' },
  { icon: Globe, text: 'Show me internet usage by region' },
  { icon: ShoppingCart, text: 'What drives online purchase decisions?' },
];

const aiResponses: AIResponses = {
  default: [
    "Based on GWI data, here are the key insights I found:",
    "**Key Findings:**\n- Social media usage continues to grow, with 58% of internet users aged 16-64 using Instagram daily\n- TikTok has seen 23% year-over-year growth in daily active usage\n- YouTube remains the most widely used platform across all demographics",
    "**Demographic Breakdown:**\n| Age Group | Daily Social Use | Top Platform |\n|-----------|-----------------|-------------|\n| 16-24 | 3.2 hours | TikTok |\n| 25-34 | 2.8 hours | Instagram |\n| 35-44 | 2.1 hours | Facebook |\n| 45-54 | 1.6 hours | Facebook |",
    "Would you like me to create a chart from this data or dive deeper into any specific demographic?"
  ],
  trends: [
    "Here's what's trending among Gen Z consumers based on GWI Core data:",
    "**Top Social Media Trends (Gen Z, 16-24):**\n1. **Short-form video dominance** - 72% watch short-form video daily, up 15% YoY\n2. **Social commerce** - 45% have purchased directly through social media\n3. **Authenticity preference** - 68% prefer user-generated content over branded content\n4. **AI content creation** - 34% use AI tools for content creation regularly",
    "**Platform Preference Shifts:**\n- TikTok: +23% daily usage YoY\n- BeReal: +45% adoption (from low base)\n- Instagram: Stable at 67% daily usage\n- Facebook: -12% among this cohort",
    "I can create an audience segment based on these behaviors or generate a detailed report. What would you like?"
  ],
  brand: [
    "I've analyzed brand awareness data across age cohorts. Here's the overview:",
    "**Brand Awareness by Age Group:**\n\nAwareness levels vary significantly by generation. Key differences emerge in:\n- **Aided recall** - older demographics show stronger aided recall for legacy brands\n- **Unaided recall** - younger demographics more readily recall digital-native brands\n- **Brand sentiment** - Gen Z shows 40% higher positive sentiment for sustainable brands",
    "**Top Brands by Unaided Awareness:**\n| Rank | Gen Z | Millennials | Gen X |\n|------|-------|-------------|-------|\n| 1 | Nike | Apple | Samsung |\n| 2 | Apple | Nike | Apple |\n| 3 | Adidas | Samsung | Toyota |\n| 4 | Samsung | Amazon | Nike |\n| 5 | Netflix | Google | Sony |",
    "Should I build a crosstab comparing these segments, or would you like me to explore a specific brand?"
  ],
  internet: [
    "Here's a comprehensive look at internet usage patterns by region from GWI Core:",
    "**Global Internet Penetration & Daily Usage:**\n- **North America**: 92% penetration, avg 6.8 hrs/day\n- **Europe**: 87% penetration, avg 5.9 hrs/day\n- **Asia Pacific**: 68% penetration, avg 7.2 hrs/day\n- **Latin America**: 72% penetration, avg 8.1 hrs/day\n- **Middle East & Africa**: 54% penetration, avg 6.4 hrs/day",
    "**Device Preferences by Region:**\n- Mobile-first browsing dominates in APAC (78%) and LATAM (74%)\n- Desktop still significant in North America (42%) and Europe (38%)\n- Smart TV internet usage growing fastest in Europe (+28% YoY)",
    "I can break this down further by country or device type. Want me to create a visualization?"
  ],
  purchase: [
    "Great question! Here's what drives online purchase decisions based on our latest survey data:",
    "**Top Purchase Decision Factors (Global):**\n1. **Price/Value** - 73% cite as primary factor\n2. **Reviews & Ratings** - 62% check before purchasing\n3. **Free Delivery** - 58% consider this essential\n4. **Brand Trust** - 51% stick to familiar brands\n5. **Social Proof** - 44% influenced by social media recommendations",
    "**Generational Differences:**\n- Gen Z: Social media influence (61%) and sustainability credentials (38%) rank higher\n- Millennials: Convenience (67%) and loyalty programs (52%) are key drivers\n- Gen X: Product quality (71%) and customer service (48%) take priority",
    "Would you like me to segment this by market or build an audience of high-intent shoppers?"
  ],
};

function getResponseForMessage(text: string): string[] {
  const lower = text.toLowerCase();
  if (lower.includes('trend') || lower.includes('gen z') || lower.includes('social media trend'))
    return aiResponses.trends;
  if (lower.includes('brand') || lower.includes('awareness') || lower.includes('compare'))
    return aiResponses.brand;
  if (lower.includes('internet') || lower.includes('region') || lower.includes('usage by'))
    return aiResponses.internet;
  if (lower.includes('purchase') || lower.includes('buying') || lower.includes('decision'))
    return aiResponses.purchase;
  return aiResponses.default;
}

function formatMessageContent(text: string): React.JSX.Element[] {
  // Simple markdown-like rendering
  const lines: string[] = text.split('\n');
  const elements: React.JSX.Element[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const formatInline = (str: string): React.JSX.Element[] => {
    const parts: React.JSX.Element[] = [];
    let remaining = str;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const idx = remaining.indexOf(boldMatch[0]);
        if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(idx + boldMatch[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }
    return parts;
  };

  const flushTable = (): void => {
    if (tableRows.length > 1) {
      const headers = tableRows[0];
      const dataRows = tableRows.slice(1).filter((r: string[]) => !r.every((c: string) => c.match(/^[-|]+$/)));
      elements.push(
        <div key={elements.length} className="message-table-wrapper">
          <table className="message-table">
            <thead>
              <tr>{headers.map((h: string, i: number) => <th key={i}>{formatInline(h.trim())}</th>)}</tr>
            </thead>
            <tbody>
              {dataRows.map((row: string[], ri: number) => (
                <tr key={ri}>{row.map((cell: string, ci: number) => <td key={ci}>{formatInline(cell.trim())}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter((c: string) => c.length > 0);
      if (!inTable) inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.match(/^\d+\.\s/)) {
      elements.push(<div key={elements.length} className="message-list-item">{formatInline(line)}</div>);
    } else if (line.startsWith('- ')) {
      elements.push(<div key={elements.length} className="message-list-item">{formatInline(line)}</div>);
    } else if (line.trim() === '') {
      elements.push(<div key={elements.length} className="message-spacer" />);
    } else {
      elements.push(<p key={elements.length}>{formatInline(line)}</p>);
    }
  }

  if (inTable) flushTable();

  return elements;
}

export default function AgentSpark(): React.JSX.Element {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string>('GWI Core');
  const [datasetOpen, setDatasetOpen] = useState<boolean>(false);
  const [audienceAdded, setAudienceAdded] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = (text: string): void => {
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    const responseParts: string[] = getResponseForMessage(text);
    let delay = 800;

    responseParts.forEach((part: string, idx: number) => {
      delay += 600 + Math.random() * 400;
      setTimeout(() => {
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: part }]);
        if (idx === responseParts.length - 1) {
          setIsTyping(false);
        }
      }, delay);
    });
  };

  const handleSend = (): void => {
    if (message.trim() && !isTyping) {
      sendMessage(message.trim());
    }
  };

  const handlePromptClick = (text: string): void => {
    sendMessage(text);
  };

  const handleNewChat = (): void => {
    setMessages([]);
    setIsTyping(false);
    setMessage('');
    setAudienceAdded(false);
  };

  const handleAddAudience = (): void => {
    setAudienceAdded(true);
    setTimeout(() => setAudienceAdded(false), 2000);
  };

  return (
    <div className="agent-spark-page">
      <div className="spark-top-bar">
        <div className="spark-top-left">
          <Sparkles size={18} className="spark-logo-icon" />
          <span className="spark-title">Agent Spark</span>
          <span className="spark-badge">AI</span>
        </div>
        {messages.length > 0 && (
          <button className="spark-new-chat-btn" onClick={handleNewChat}>
            <RotateCcw size={14} />
            <span>New chat</span>
          </button>
        )}
      </div>

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="agent-spark-avatar-large">
              <Sparkles size={42} />
            </div>
            <h2>How can I help you today?</h2>
            <p>Ask questions about consumer data, create audiences, or get insights from {selectedDataset}.</p>
            <div className="suggested-prompts">
              {suggestedPrompts.map((prompt: SuggestedPrompt, idx: number) => (
                <button
                  key={idx}
                  className="suggested-prompt-chip"
                  onClick={() => handlePromptClick(prompt.text)}
                >
                  <prompt.icon size={16} className="prompt-chip-icon" />
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg: ChatMessage, idx: number) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="message-avatar">
                    <Sparkles size={16} />
                  </div>
                )}
                <div className="message-content">
                  {msg.role === 'assistant' ? formatMessageContent(msg.content) : msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="message-avatar">
                  <Sparkles size={16} />
                </div>
                <div className="message-content typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask Agent Spark a question..."
            value={message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
          />
          <div className="chat-input-actions">
            <button
              className={`action-btn ${audienceAdded ? 'action-btn-success' : ''}`}
              onClick={handleAddAudience}
            >
              <Users size={16} />
              <span>{audienceAdded ? 'Audience added' : 'Add audience'}</span>
            </button>
            <div className="chat-input-right">
              <div className="dataset-selector">
                <button
                  className="dataset-btn"
                  onClick={() => setDatasetOpen(!datasetOpen)}
                >
                  <span>{selectedDataset}</span>
                  <ChevronDown size={14} />
                </button>
                {datasetOpen && (
                  <div className="dataset-dropdown">
                    {datasets.map((d: string) => (
                      <button
                        key={d}
                        className={`dataset-option ${d === selectedDataset ? 'selected' : ''}`}
                        onClick={() => { setSelectedDataset(d); setDatasetOpen(false); }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!message.trim() || isTyping}
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
