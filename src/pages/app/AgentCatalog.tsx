import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { Badge } from '@/components/shared';
import { agents, AGENT_CATEGORIES, type AgentCategory, type Agent } from '@/data/agents';
import './AgentCatalog.css';

type FilterTab = 'All' | AgentCategory;

export default function AgentCatalog(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const navigate = useNavigate();

  const filteredAgents = activeTab === 'All'
    ? agents
    : agents.filter((a) => a.category === activeTab);

  const handleStartChat = (agent: Agent) => {
    navigate(`/app/agent-spark?agent=${agent.id}`);
  };

  return (
    <div className="agent-catalog-page">
      <div className="agent-catalog-content">
        {/* Hero Section */}
        <section className="catalog-hero">
          <div className="catalog-hero-icon">
            <Sparkles size={28} />
          </div>
          <h1 className="catalog-hero-title">Meet Your AI Agents</h1>
          <p className="catalog-hero-subtitle">
            Purpose-built agents for every workflow — from consumer insights and audience building to campaign strategy and industry analysis.
          </p>
        </section>

        {/* Category Filter Tabs */}
        <div className="catalog-tabs">
          <button
            className={`catalog-tab ${activeTab === 'All' ? 'catalog-tab--active' : ''}`}
            onClick={() => setActiveTab('All')}
          >
            All
          </button>
          {AGENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`catalog-tab ${activeTab === cat ? 'catalog-tab--active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Agent Cards Grid */}
        <div className="catalog-grid">
          {filteredAgents.map((agent) => {
            const IconComp = agent.icon;
            return (
              <div key={agent.id} className="agent-card">
                <div className="agent-card-header">
                  <div
                    className="agent-card-icon"
                    style={{ background: agent.iconBg, color: agent.iconColor }}
                  >
                    <IconComp size={22} />
                  </div>
                  {agent.status && (
                    <Badge variant={agent.status === 'popular' ? 'primary' : 'info'}>
                      {agent.status === 'popular' ? 'Popular' : 'New'}
                    </Badge>
                  )}
                </div>
                <h3 className="agent-card-name">{agent.name}</h3>
                <p className="agent-card-description">{agent.description}</p>
                <div className="agent-card-category">
                  <Badge variant="default">{agent.category}</Badge>
                </div>
                <div className="agent-card-capabilities">
                  {agent.capabilities.map((cap) => (
                    <span key={cap} className="agent-card-cap-tag">{cap}</span>
                  ))}
                </div>
                <p className="agent-card-example">"{agent.examplePrompt}"</p>
                <button
                  className="agent-card-cta"
                  onClick={() => handleStartChat(agent)}
                >
                  Start Chat
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}

          {/* Build Custom Agent CTA Card */}
          <div className="agent-card agent-card--custom">
            <div className="agent-card-header">
              <div className="agent-card-icon agent-card-icon--custom">
                <Plus size={22} />
              </div>
            </div>
            <h3 className="agent-card-name">Build Custom Agent</h3>
            <p className="agent-card-description">
              Create a specialized agent tailored to your unique research needs and workflows.
            </p>
            <div className="agent-card-capabilities">
              <span className="agent-card-cap-tag">Custom prompts</span>
              <span className="agent-card-cap-tag">Your data</span>
              <span className="agent-card-cap-tag">Team sharing</span>
            </div>
            <button className="agent-card-cta agent-card-cta--secondary" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
