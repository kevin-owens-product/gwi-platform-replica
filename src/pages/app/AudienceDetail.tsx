import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  MapPin,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
} from 'lucide-react';
import { useAudience, useCreateAudience, useUpdateAudience } from '@/hooks/useAudiences';
import AudienceBuilder from '@/components/audience/AudienceBuilder';
import { Button } from '@/components/shared';
import { formatCompactNumber } from '@/utils/format';
import type { AudienceExpression } from '@/api/types';
import './AudienceDetail.css';

interface AudienceDetailProps {
  isNew?: boolean;
}

/* ========================================================
   Mock data for the new sections
   ======================================================== */

const mockGenderSplit = { male: 54, female: 42, other: 4 };

const mockAgeDistribution = [
  { label: '16-24', value: 28, color: 'var(--color-chart-1)' },
  { label: '25-34', value: 32, color: 'var(--color-chart-2)' },
  { label: '35-44', value: 20, color: 'var(--color-chart-3)' },
  { label: '45-54', value: 12, color: 'var(--color-chart-4)' },
  { label: '55+', value: 8, color: 'var(--color-chart-5)' },
];

const mockTopCountries = [
  { name: 'United States', value: 34 },
  { name: 'United Kingdom', value: 18 },
  { name: 'Germany', value: 12 },
  { name: 'France', value: 9 },
  { name: 'Brazil', value: 7 },
];

const mockTopInterests = [
  { name: 'Technology', weight: 92 },
  { name: 'Travel', weight: 78 },
  { name: 'Fitness', weight: 71 },
  { name: 'Gaming', weight: 65 },
  { name: 'Music', weight: 60 },
  { name: 'Sustainability', weight: 54 },
  { name: 'Fashion', weight: 48 },
  { name: 'Food & Drink', weight: 43 },
  { name: 'Finance', weight: 38 },
  { name: 'Automotive', weight: 32 },
];

const mockIndexScores = [
  { attribute: 'Social media daily users', index: 142, category: 'Behaviour' },
  { attribute: 'Purchased online (last month)', index: 128, category: 'Behaviour' },
  { attribute: 'Owns a smart speaker', index: 119, category: 'Ownership' },
  { attribute: 'Interested in crypto', index: 156, category: 'Attitudes' },
  { attribute: 'Watches streaming daily', index: 134, category: 'Media' },
  { attribute: 'Listens to podcasts weekly', index: 145, category: 'Media' },
  { attribute: 'Reads print newspapers', index: 62, category: 'Media' },
  { attribute: 'Watches linear TV daily', index: 74, category: 'Media' },
  { attribute: 'Uses cash primarily', index: 55, category: 'Behaviour' },
  { attribute: 'Drives to work', index: 88, category: 'Lifestyle' },
  { attribute: 'Exercises 3+ times/week', index: 121, category: 'Lifestyle' },
  { attribute: 'Premium brand preference', index: 113, category: 'Attitudes' },
];

const mockOverlapAudiences = [
  { name: 'Tech Enthusiasts 25-44', overlap: 38, size: '1.2M' },
  { name: 'Premium Online Shoppers', overlap: 24, size: '890K' },
];

const mockSimilarAudiences = [
  { id: 'sim-1', name: 'Digital-First Millennials', size: '1.4M', similarity: 87, description: 'Urban millennials who prefer digital channels for shopping and entertainment' },
  { id: 'sim-2', name: 'Tech-Savvy Professionals', size: '980K', similarity: 79, description: 'Working professionals aged 28-42 with high tech adoption' },
  { id: 'sim-3', name: 'Connected Gen Z', size: '2.1M', similarity: 72, description: 'Gen Z users highly active on social media and streaming platforms' },
  { id: 'sim-4', name: 'Eco-Conscious Consumers', size: '760K', similarity: 64, description: 'Sustainability-focused consumers who prefer ethical brands' },
];

/* ========================================================
   Helper: index color
   ======================================================== */
function getIndexColor(index: number): string {
  if (index >= 130) return 'var(--color-index-strong-over)';
  if (index >= 110) return 'var(--color-index-over)';
  if (index >= 90) return 'var(--color-index-neutral)';
  if (index >= 70) return 'var(--color-index-under)';
  return 'var(--color-index-strong-under)';
}

function getIndexBg(index: number): string {
  if (index >= 130) return 'var(--color-success-light)';
  if (index >= 110) return '#e6f9f3';
  if (index >= 90) return 'var(--color-surface-secondary)';
  if (index >= 70) return 'var(--color-warning-light)';
  return 'var(--color-error-light)';
}

function getIndexIcon(index: number) {
  if (index >= 110) return <TrendingUp size={14} />;
  if (index >= 90) return <Minus size={14} />;
  return <TrendingDown size={14} />;
}

/* ========================================================
   Component
   ======================================================== */
export default function AudienceDetail({ isNew = false }: AudienceDetailProps): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: audience, isLoading: audienceLoading } = useAudience(isNew ? '' : (id ?? ''));
  const createAudience = useCreateAudience();
  const updateAudience = useUpdateAudience();

  const [audienceName, setAudienceName] = useState<string>('');
  const [expression, setExpression] = useState<AudienceExpression | undefined>(undefined);

  // Populate form when existing audience data loads
  useEffect(() => {
    if (audience && !isNew) {
      setAudienceName(audience.name);
      setExpression(audience.expression);
    }
  }, [audience, isNew]);

  const isSaving = createAudience.isPending || updateAudience.isPending;

  const handleSave = () => {
    if (!audienceName.trim()) return;

    if (isNew) {
      createAudience.mutate(
        {
          name: audienceName.trim(),
          expression: expression ?? { and: [] },
        },
        {
          onSuccess: () => {
            navigate('/app/audiences');
          },
        }
      );
    } else if (id) {
      updateAudience.mutate(
        {
          id,
          data: {
            name: audienceName.trim(),
            expression,
          },
        },
        {
          onSuccess: () => {
            navigate('/app/audiences');
          },
        }
      );
    }
  };

  const handleCancel = () => {
    navigate('/app/audiences');
  };

  // Loading state for existing audience
  if (!isNew && audienceLoading) {
    return (
      <div className="audience-detail-page">
        <div className="audience-detail-header">
          <button className="back-link" onClick={() => navigate('/app/audiences')}>
            <ArrowLeft size={18} />
            <span>Back to Audiences</span>
          </button>
        </div>
        <div className="audience-detail-content" style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <Loader2 size={32} className="spin" />
        </div>
      </div>
    );
  }

  const maxAge = Math.max(...mockAgeDistribution.map((d) => d.value));
  const maxCountry = Math.max(...mockTopCountries.map((c) => c.value));

  return (
    <div className="audience-detail-page">
      <div className="audience-detail-header">
        <button className="back-link" onClick={() => navigate('/app/audiences')}>
          <ArrowLeft size={18} />
          <span>Back to Audiences</span>
        </button>
        <div className="header-actions">
          <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
            loading={isSaving}
            disabled={!audienceName.trim()}
          >
            {isNew ? 'Create Audience' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="audience-detail-content">
        <div className="audience-name-section">
          <input
            type="text"
            className="audience-name-input"
            placeholder="Untitled Audience"
            value={audienceName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudienceName(e.target.value)}
          />
        </div>

        {/* ---- LEFT COLUMN: Builder + New Sections ---- */}
        <div className="audience-detail-main">
          <div className="conditions-section">
            <h3 className="section-title">Build your audience</h3>
            <p className="section-description">
              Add conditions to define who belongs to this audience.
            </p>

            <div className="conditions-builder">
              <AudienceBuilder
                expression={expression}
                onChange={setExpression}
              />
            </div>
          </div>

          {/* ---- Audience Index Section ---- */}
          {!isNew && (
            <div className="index-section">
              <h3 className="section-title">Audience Index</h3>
              <p className="section-description">
                Index scores compared to the base population. Values above 100 indicate over-representation.
              </p>
              <div className="index-table">
                <div className="index-table__header">
                  <span className="index-table__col index-table__col--attr">Attribute</span>
                  <span className="index-table__col index-table__col--cat">Category</span>
                  <span className="index-table__col index-table__col--idx">Index</span>
                </div>
                {mockIndexScores.map((item) => (
                  <div key={item.attribute} className="index-table__row">
                    <span className="index-table__col index-table__col--attr">{item.attribute}</span>
                    <span className="index-table__col index-table__col--cat">
                      <span className="index-category-badge">{item.category}</span>
                    </span>
                    <span className="index-table__col index-table__col--idx">
                      <span
                        className="index-value"
                        style={{
                          color: getIndexColor(item.index),
                          backgroundColor: getIndexBg(item.index),
                        }}
                      >
                        {getIndexIcon(item.index)}
                        {item.index}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- Overlap Analysis Section ---- */}
          {!isNew && (
            <div className="overlap-section">
              <h3 className="section-title">Overlap Analysis</h3>
              <p className="section-description">
                See how this audience overlaps with other audiences.
              </p>
              <div className="overlap-card">
                <div className="venn-diagram">
                  <div className="venn-circle venn-circle--primary">
                    <span className="venn-label">{audienceName || 'This Audience'}</span>
                  </div>
                  <div className="venn-circle venn-circle--overlap1">
                    <span className="venn-label">{mockOverlapAudiences[0].name}</span>
                  </div>
                  <div className="venn-circle venn-circle--overlap2">
                    <span className="venn-label">{mockOverlapAudiences[1].name}</span>
                  </div>
                  <div className="venn-center-label">Overlap</div>
                </div>
                <div className="overlap-details">
                  {mockOverlapAudiences.map((oa) => (
                    <div key={oa.name} className="overlap-detail-row">
                      <div className="overlap-detail-row__info">
                        <span className="overlap-detail-row__name">{oa.name}</span>
                        <span className="overlap-detail-row__size">{oa.size} people</span>
                      </div>
                      <div className="overlap-detail-row__bar-wrapper">
                        <div className="overlap-detail-row__bar">
                          <div
                            className="overlap-detail-row__bar-fill"
                            style={{ width: `${oa.overlap}%` }}
                          />
                        </div>
                        <span className="overlap-detail-row__pct">{oa.overlap}% overlap</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- Similar Audiences Section ---- */}
          {!isNew && (
            <div className="similar-section">
              <h3 className="section-title">Similar Audiences</h3>
              <p className="section-description">
                Audiences with similar demographic and behavioural profiles.
              </p>
              <div className="similar-grid">
                {mockSimilarAudiences.map((sa) => (
                  <Link
                    key={sa.id}
                    to={`/app/audiences/${sa.id}`}
                    className="similar-card"
                  >
                    <div className="similar-card__header">
                      <Users size={18} className="similar-card__icon" />
                      <span className="similar-card__similarity">{sa.similarity}% match</span>
                    </div>
                    <h4 className="similar-card__name">{sa.name}</h4>
                    <p className="similar-card__desc">{sa.description}</p>
                    <div className="similar-card__footer">
                      <span className="similar-card__size">{sa.size} people</span>
                      <span className="similar-card__link">
                        View <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---- RIGHT SIDEBAR ---- */}
        <div className="audience-detail-sidebar">
          {/* Preview */}
          <div className="preview-section">
            <h3 className="section-title">Audience Preview</h3>
            <div className="preview-card">
              <div className="preview-stat">
                <span className="stat-value">
                  {audience?.sample_size != null
                    ? formatCompactNumber(audience.sample_size)
                    : '--'}
                </span>
                <span className="stat-label">Estimated size</span>
              </div>
              <div className="preview-stat">
                <span className="stat-value">
                  {audience?.population_size != null && audience?.sample_size != null && audience.population_size > 0
                    ? `${((audience.sample_size / audience.population_size) * 100).toFixed(1)}%`
                    : '--'}
                </span>
                <span className="stat-label">% of total</span>
              </div>
            </div>
          </div>

          {/* Demographic Profile */}
          {!isNew && (
            <div className="demo-profile-section">
              <h3 className="section-title">Demographic Profile</h3>

              {/* Gender Split */}
              <div className="demo-profile-card">
                <h4 className="demo-profile-card__title">Gender Split</h4>
                <div className="gender-pie">
                  <svg viewBox="0 0 120 120" className="gender-pie__svg">
                    {/* Male arc */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="var(--color-chart-2)"
                      strokeWidth="20"
                      strokeDasharray={`${mockGenderSplit.male * 3.14} ${314 - mockGenderSplit.male * 3.14}`}
                      strokeDashoffset="0"
                      transform="rotate(-90 60 60)"
                    />
                    {/* Female arc */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="var(--color-chart-1)"
                      strokeWidth="20"
                      strokeDasharray={`${mockGenderSplit.female * 3.14} ${314 - mockGenderSplit.female * 3.14}`}
                      strokeDashoffset={`${-(mockGenderSplit.male * 3.14)}`}
                      transform="rotate(-90 60 60)"
                    />
                    {/* Other arc */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="var(--color-chart-4)"
                      strokeWidth="20"
                      strokeDasharray={`${mockGenderSplit.other * 3.14} ${314 - mockGenderSplit.other * 3.14}`}
                      strokeDashoffset={`${-((mockGenderSplit.male + mockGenderSplit.female) * 3.14)}`}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="gender-pie__legend">
                    <div className="gender-pie__legend-item">
                      <span className="legend-dot" style={{ backgroundColor: 'var(--color-chart-2)' }} />
                      <span>Male {mockGenderSplit.male}%</span>
                    </div>
                    <div className="gender-pie__legend-item">
                      <span className="legend-dot" style={{ backgroundColor: 'var(--color-chart-1)' }} />
                      <span>Female {mockGenderSplit.female}%</span>
                    </div>
                    <div className="gender-pie__legend-item">
                      <span className="legend-dot" style={{ backgroundColor: 'var(--color-chart-4)' }} />
                      <span>Other {mockGenderSplit.other}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Age Distribution */}
              <div className="demo-profile-card">
                <h4 className="demo-profile-card__title">Age Distribution</h4>
                <div className="age-bars">
                  {mockAgeDistribution.map((d) => (
                    <div key={d.label} className="age-bar-row">
                      <span className="age-bar-row__label">{d.label}</span>
                      <div className="age-bar-row__track">
                        <div
                          className="age-bar-row__fill"
                          style={{
                            width: `${(d.value / maxAge) * 100}%`,
                            backgroundColor: d.color,
                          }}
                        />
                      </div>
                      <span className="age-bar-row__value">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Countries */}
              <div className="demo-profile-card">
                <h4 className="demo-profile-card__title">
                  <MapPin size={14} />
                  Top Countries
                </h4>
                <div className="country-list">
                  {mockTopCountries.map((c) => (
                    <div key={c.name} className="country-row">
                      <span className="country-row__name">{c.name}</span>
                      <div className="country-row__bar-wrapper">
                        <div className="country-row__bar">
                          <div
                            className="country-row__bar-fill"
                            style={{ width: `${(c.value / maxCountry) * 100}%` }}
                          />
                        </div>
                        <span className="country-row__value">{c.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Interests (Tag Cloud) */}
              <div className="demo-profile-card">
                <h4 className="demo-profile-card__title">
                  <Tag size={14} />
                  Top Interests
                </h4>
                <div className="interest-cloud">
                  {mockTopInterests.map((interest) => {
                    const scale = 0.7 + (interest.weight / 100) * 0.6;
                    return (
                      <span
                        key={interest.name}
                        className="interest-tag"
                        style={{
                          fontSize: `${scale}em`,
                          opacity: 0.5 + (interest.weight / 100) * 0.5,
                        }}
                      >
                        {interest.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
