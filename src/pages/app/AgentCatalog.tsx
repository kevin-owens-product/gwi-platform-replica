import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { Badge } from '@/components/shared';
import { agents, AGENT_CATEGORIES, type AgentCategory, type Agent } from '@/data/agents';
import { resolveStarterTemplates, trackStarterEvent } from '@/utils/template-resolver';
import { agenticFlows, platformLinkages } from '@/agentic/registry';
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

  const handleStartWithTemplate = (agent: Agent) => {
    const starterTemplate = resolveStarterTemplates({ agentId: agent.id, contextType: 'general', limit: 1 })[0];
    const params = new URLSearchParams();
    params.set('agent', agent.id);
    params.set('open_templates', '1');
    if (starterTemplate) params.set('template_id', starterTemplate.id);
    trackStarterEvent('starter_template_selected', {
      entry_point: 'catalog',
      template_id: starterTemplate?.id,
      agent_id: agent.id,
    });
    navigate(`/app/agent-spark?${params.toString()}`);
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
                <div className="agent-card-workflow-meta">
                  <span>{agent.demo.steps.length} workflow steps</span>
                  <span>{agent.demo.deliverables.length} deliverables</span>
                  <span>{agent.demo.chatPrompts.length} chat prompts</span>
                </div>
                <div className="agent-card-demo-line">
                  Step 1: {agent.demo.steps[0]?.name}
                </div>
                <p className="agent-card-example">"{agent.examplePrompt}"</p>
                <div className="agent-card-cta-row">
                  <button
                    className="agent-card-cta agent-card-cta--outlined"
                    onClick={() => handleStartWithTemplate(agent)}
                  >
                    Start With Template
                  </button>
                  <button
                    className="agent-card-cta"
                    onClick={() => handleStartChat(agent)}
                  >
                    Start Chat
                    <ArrowRight size={14} />
                  </button>
                </div>
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

        <section className="catalog-section">
          <div className="catalog-section-header">
            <h2 className="catalog-section-title">Agentic Flows</h2>
            <p className="catalog-section-subtitle">
              Orchestrated workflows that convert briefs into validated, client-ready outputs.
            </p>
          </div>
          <div className="catalog-flow-grid">
            {agenticFlows.map((flow) => (
              <div key={flow.id} className="catalog-flow-card">
                <div className="catalog-flow-title">{flow.name}</div>
                <p className="catalog-flow-description">{flow.description}</p>
                <div className="catalog-flow-steps">
                  {flow.steps.map((step) => (
                    <span key={step.id} className="catalog-flow-step">{step.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="catalog-section">
          <div className="catalog-section-header">
            <h2 className="catalog-section-title">Platform Linkages</h2>
            <p className="catalog-section-subtitle">
              API and MCP surfaces used to connect agents with data, chat, and delivery systems.
            </p>
          </div>
          <div className="catalog-linkage-grid">
            {platformLinkages.map((link) => (
              <div key={link.id} className="catalog-linkage-card">
                <div className="catalog-linkage-title">{link.name}</div>
                <p className="catalog-linkage-description">{link.description}</p>
                <div className="catalog-linkage-meta">Auth: {link.auth}</div>
                <ul className="catalog-linkage-endpoints">
                  {link.endpoints.map((endpoint) => (
                    <li key={endpoint}>{endpoint}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
