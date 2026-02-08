import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Plus, Check, Loader2, BarChart3 } from 'lucide-react';
import { useAudiences } from '@/hooks/useAudiences';
import { Button, SearchInput, EmptyState } from '@/components/shared';
import { formatCompactNumber } from '@/utils/format';
import type { Audience } from '@/api/types';
import toast from 'react-hot-toast';
import './Canvas.css';

// Fallback audiences used when the API returns no data
const fallbackAudiences = [
  { id: 'fallback-1', name: 'Gen Z (18-24)', population_size: 245000000, description: 'Digital natives, social-first generation' },
  { id: 'fallback-2', name: 'Millennials (25-34)', population_size: 312000000, description: 'Experience-driven, brand-conscious consumers' },
  { id: 'fallback-3', name: 'Gen X (35-44)', population_size: 298000000, description: 'Established professionals with spending power' },
  { id: 'fallback-4', name: 'Heavy Social Media Users', population_size: 156000000, description: '3+ hours daily on social platforms' },
  { id: 'fallback-5', name: 'Online Shoppers', population_size: 428000000, description: 'Made 5+ online purchases in past month' },
  { id: 'fallback-6', name: 'Health-Conscious Consumers', population_size: 189000000, description: 'Prioritize wellness in purchase decisions' },
];

const barColors = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#06b6d4', '#14b8a6', '#f59e0b',
];

export default function CanvasAudiences(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: audiencesData, isLoading, isError } = useAudiences({ search: searchQuery || undefined });

  const apiAudiences = audiencesData?.data ?? [];
  const hasApiData = apiAudiences.length > 0;

  // Build the display list -- use API data if available, otherwise fallback
  const displayAudiences = useMemo(() => {
    if (hasApiData) {
      return apiAudiences.map((a: Audience) => ({
        id: a.id,
        name: a.name,
        population_size: a.population_size ?? 0,
        description: a.description ?? '',
      }));
    }
    // Apply local search filter on fallback data
    if (searchQuery) {
      return fallbackAudiences.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return fallbackAudiences;
  }, [apiAudiences, hasApiData, searchQuery]);

  const toggleAudience = (id: string): void => {
    setSelectedAudiences((prev: string[]) =>
      prev.includes(id) ? prev.filter((a: string) => a !== id) : [...prev, id]
    );
  };

  const handleGenerate = (): void => {
    setGenerating(true);
    toast.success('Generating insights for selected audiences...');
    setTimeout(() => {
      setGenerating(false);
      navigate('/app/dashboards');
    }, 2000);
  };

  // Get selected audience objects for the comparison chart
  const selectedAudienceObjects = useMemo(() => {
    return displayAudiences.filter((a) => selectedAudiences.includes(a.id));
  }, [displayAudiences, selectedAudiences]);

  const maxPopulation = useMemo(() => {
    if (selectedAudienceObjects.length === 0) return 1;
    return Math.max(...selectedAudienceObjects.map((a) => a.population_size));
  }, [selectedAudienceObjects]);

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <h1 className="page-title">Canvas</h1>
        <p className="page-subtitle">Define your research objectives and target audiences</p>
      </div>

      <div className="canvas-steps">
        <Link to="/app/canvas" className="step completed">
          <div className="step-number">&#10003;</div>
          <div className="step-info">
            <h3>Define Goals</h3>
            <p>What do you want to learn?</p>
          </div>
        </Link>
        <div className="step-connector" />
        <div className="step active">
          <div className="step-number">2</div>
          <div className="step-info">
            <h3>Define Audiences</h3>
            <p>Who do you want to study?</p>
          </div>
        </div>
        <div className="step-connector" />
        <div className="step">
          <div className="step-number">3</div>
          <div className="step-info">
            <h3>Review &amp; Generate</h3>
            <p>Finalize your research brief</p>
          </div>
        </div>
      </div>

      <div className="canvas-content">
        <div className="audiences-section">
          <h2>Select your target audiences</h2>
          <p>Choose the audiences you want to analyze ({selectedAudiences.length} selected)</p>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search audiences..."
            />
          </div>

          {isLoading ? (
            <div className="dashboards-empty">
              <Loader2 size={32} className="spin" />
              <p>Loading audiences...</p>
            </div>
          ) : isError && !hasApiData ? (
            // Show fallback data even on error
            <AudienceList
              audiences={fallbackAudiences}
              selectedAudiences={selectedAudiences}
              onToggle={toggleAudience}
            />
          ) : displayAudiences.length === 0 ? (
            <EmptyState
              icon={<Users size={40} />}
              title="No audiences found"
              description={searchQuery ? 'No audiences match your search' : 'Create a custom audience to get started'}
            />
          ) : (
            <AudienceList
              audiences={displayAudiences}
              selectedAudiences={selectedAudiences}
              onToggle={toggleAudience}
            />
          )}

          {/* Audience Size Comparison Bar Chart */}
          {selectedAudienceObjects.length >= 2 && (
            <div className="audience-comparison">
              <div className="audience-comparison-header">
                <BarChart3 size={18} />
                <h3>Audience Size Comparison</h3>
              </div>
              <svg
                width="100%"
                viewBox={`0 0 600 ${selectedAudienceObjects.length * 48 + 8}`}
                style={{ overflow: 'visible' }}
              >
                {selectedAudienceObjects.map((audience, index) => {
                  const barWidth = maxPopulation > 0
                    ? (audience.population_size / maxPopulation) * 360
                    : 0;
                  const y = index * 48 + 4;
                  const color = barColors[index % barColors.length];
                  return (
                    <g key={audience.id}>
                      {/* Label */}
                      <text
                        x={148}
                        y={y + 22}
                        textAnchor="end"
                        fontSize="12"
                        fontWeight="500"
                        fill="currentColor"
                      >
                        {audience.name.length > 22
                          ? audience.name.substring(0, 22) + '...'
                          : audience.name}
                      </text>
                      {/* Track */}
                      <rect
                        x={158}
                        y={y + 4}
                        width={360}
                        height={28}
                        rx={6}
                        fill="#f1f5f9"
                        stroke="#e2e8f0"
                        strokeWidth={1}
                      />
                      {/* Bar fill */}
                      <rect
                        x={158}
                        y={y + 4}
                        width={Math.max(barWidth, 4)}
                        height={28}
                        rx={6}
                        fill={color}
                        opacity={0.85}
                      >
                        <animate
                          attributeName="width"
                          from="0"
                          to={Math.max(barWidth, 4)}
                          dur="0.6s"
                          fill="freeze"
                        />
                      </rect>
                      {/* Value label */}
                      <text
                        x={158 + Math.max(barWidth, 4) + 8}
                        y={y + 22}
                        fontSize="11"
                        fontWeight="600"
                        fill="#64748b"
                      >
                        {formatCompactNumber(audience.population_size)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          <Button variant="ghost" icon={<Plus size={16} />} className="add-custom-btn">
            Create custom audience
          </Button>

          <div className="canvas-actions" style={{ justifyContent: 'space-between' }}>
            <Button
              variant="secondary"
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate('/app/canvas')}
            >
              Back to Goals
            </Button>
            <Button
              variant="primary"
              disabled={selectedAudiences.length === 0 || generating}
              loading={generating}
              onClick={handleGenerate}
            >
              {generating ? 'Generating...' : 'Generate Insights'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-component for the audience list ---

interface AudienceDisplayItem {
  id: string;
  name: string;
  population_size: number;
  description: string;
}

interface AudienceListProps {
  audiences: AudienceDisplayItem[];
  selectedAudiences: string[];
  onToggle: (id: string) => void;
}

function AudienceList({ audiences, selectedAudiences, onToggle }: AudienceListProps): React.JSX.Element {
  return (
    <div className="audiences-list">
      {audiences.map((audience) => {
        const isSelected: boolean = selectedAudiences.includes(audience.id);
        return (
          <button
            key={audience.id}
            className={`audience-option ${isSelected ? 'selected' : ''}`}
            onClick={() => onToggle(audience.id)}
          >
            <div className="audience-checkbox">
              {isSelected && <Check size={14} />}
            </div>
            <div className="audience-info">
              <span className="audience-name">{audience.name}</span>
              <span className="audience-size">
                {audience.population_size > 0 ? `${formatCompactNumber(audience.population_size)} people` : ''}{audience.population_size > 0 && audience.description ? ' \u00B7 ' : ''}{audience.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
