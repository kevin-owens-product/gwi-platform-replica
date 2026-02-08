import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Heart,
  ChevronDown,
  Users,
  Globe,
  Send,
  Tag,
  Eye,
  EyeOff,
  Share2,
  X,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudience, useCreateAudience, useUpdateAudience, useAudiences } from '@/hooks/useAudiences';
import AudienceBuilder from '@/components/audience/AudienceBuilder';
import { Button, Modal, SearchInput } from '@/components/shared';
import { formatCompactNumber } from '@/utils/format';
import type { AudienceExpression, Audience, ActivationDestinationType, SharingVisibility } from '@/api/types';
import './AudienceDetail.css';

interface AudienceDetailProps {
  isNew?: boolean;
}

const audienceTypeOptions: { label: string; value: string }[] = [
  { label: 'Custom', value: 'custom' },
  { label: 'Lookalike', value: 'lookalike' },
  { label: 'Template', value: 'template' },
  { label: 'Dynamic', value: 'dynamic' },
];

const activationDestinations: { label: string; value: ActivationDestinationType }[] = [
  { label: 'Meta Ads (Facebook)', value: 'meta_ads' },
  { label: 'Google Ads', value: 'google_ads' },
  { label: 'TikTok Ads', value: 'tiktok_ads' },
  { label: 'Amazon DSP', value: 'amazon_dsp' },
  { label: 'The Trade Desk', value: 'the_trade_desk' },
  { label: 'DV360', value: 'dv360' },
  { label: 'LiveRamp', value: 'liveramp' },
  { label: 'Salesforce', value: 'salesforce' },
  { label: 'CSV Export', value: 'csv_export' },
];

function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'var(--color-success, #22c55e)';
  if (score >= 60) return 'var(--color-warning, #f59e0b)';
  if (score >= 40) return 'var(--color-warning, #f59e0b)';
  return 'var(--color-error, #ef4444)';
}

function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

export default function AudienceDetail({ isNew = false }: AudienceDetailProps): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: audience, isLoading: audienceLoading } = useAudience(isNew ? '' : (id ?? ''));
  const createAudience = useCreateAudience();
  const updateAudience = useUpdateAudience();
  const { data: audiencesResponse } = useAudiences({ per_page: 50 });
  const allAudiences = useMemo(() => audiencesResponse?.data ?? [], [audiencesResponse]);

  const [audienceName, setAudienceName] = useState<string>('');
  const [expression, setExpression] = useState<AudienceExpression | undefined>(undefined);

  // Audience type
  const [audienceType, setAudienceType] = useState<string>('custom');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Sharing / Visibility
  const [visibility, setVisibility] = useState<SharingVisibility>('private');

  // Compare modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareSearch, setCompareSearch] = useState('');
  const [selectedCompareId, setSelectedCompareId] = useState<string | null>(null);

  // Activation modal
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<ActivationDestinationType | null>(null);

  // Populate form when existing audience data loads
  useEffect(() => {
    if (audience && !isNew) {
      setAudienceName(audience.name);
      setExpression(audience.expression);
      setAudienceType(audience.audience_type ?? 'custom');
      setTags(audience.tags ?? []);
      setVisibility(audience.sharing?.visibility ?? 'private');
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
          tags,
          audience_type: audienceType === 'dynamic' ? 'dynamic' : 'static',
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
            tags,
            audience_type: audienceType === 'dynamic' ? 'dynamic' : 'static',
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

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCompare = () => {
    if (!selectedCompareId) {
      toast.error('Please select an audience to compare');
      return;
    }
    toast.success('Comparison view opening...');
    setCompareModalOpen(false);
  };

  const handleActivate = () => {
    if (!selectedDestination) {
      toast.error('Please select a destination');
      return;
    }
    toast.success(`Activation started for ${selectedDestination.replace(/_/g, ' ')}`);
    setActivationModalOpen(false);
    setSelectedDestination(null);
  };

  const filteredCompareAudiences = useMemo(() => {
    const filtered = allAudiences.filter((a) => a.id !== id);
    if (!compareSearch) return filtered;
    const q = compareSearch.toLowerCase();
    return filtered.filter((a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }, [allAudiences, id, compareSearch]);

  const healthScore = audience?.health_score?.overall;
  const marketSizes = audience?.market_sizes;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <input
              type="text"
              className="audience-name-input"
              placeholder="Untitled Audience"
              value={audienceName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudienceName(e.target.value)}
              style={{ flex: 1 }}
            />

            {/* Health Score Badge */}
            {healthScore != null && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: getHealthScoreColor(healthScore),
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-body-sm)',
                  flexShrink: 0,
                }}
                title={`Health score: ${healthScore}/100 - ${getHealthScoreLabel(healthScore)}`}
              >
                <Heart size={14} />
                <span>{healthScore}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.85 }}>{getHealthScoreLabel(healthScore)}</span>
              </div>
            )}

            {/* Audience Type Selector */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  padding: '8px 14px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  background: 'var(--color-white)',
                  cursor: 'pointer',
                }}
              >
                {audienceTypeOptions.find((o) => o.value === audienceType)?.label ?? 'Custom'}
                <ChevronDown size={14} />
              </button>
              {showTypeDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-dropdown, 0 4px 12px rgba(0,0,0,0.1))',
                    zIndex: 20,
                    minWidth: 160,
                    overflow: 'hidden',
                  }}
                >
                  {audienceTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setAudienceType(opt.value); setShowTypeDropdown(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        fontSize: 'var(--font-size-body-sm)',
                        color: audienceType === opt.value ? 'var(--color-primary)' : 'var(--color-text)',
                        fontWeight: audienceType === opt.value ? 600 : 400,
                        background: audienceType === opt.value ? 'var(--color-primary-light, rgba(227,28,121,0.06))' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Score Warnings */}
        {audience?.health_score?.warnings && audience.health_score.warnings.length > 0 && (
          <div style={{ gridColumn: '1 / -1', marginBottom: 'var(--spacing-md)' }}>
            {audience.health_score.warnings.map((warning, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-body-sm)',
                  background: warning.severity === 'error'
                    ? 'var(--color-error-light, rgba(239,68,68,0.08))'
                    : warning.severity === 'warning'
                    ? 'var(--color-warning-light, rgba(245,158,11,0.08))'
                    : 'var(--color-surface-secondary)',
                  color: warning.severity === 'error'
                    ? 'var(--color-error, #ef4444)'
                    : warning.severity === 'warning'
                    ? 'var(--color-warning, #f59e0b)'
                    : 'var(--color-text-secondary)',
                }}
              >
                <AlertTriangle size={14} />
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        )}

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

          {/* Tags Section */}
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <Tag size={16} />
              Tags
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-light, rgba(227,28,121,0.08))',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
                style={{
                  flex: 1,
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-body-sm)',
                }}
              />
              <Button variant="secondary" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Sharing / Permissions */}
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <Share2 size={16} />
              Sharing &amp; Permissions
            </h3>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', marginTop: 'var(--spacing-sm)' }}>
              <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>Visibility:</span>
              {(['private', 'team', 'organization'] as SharingVisibility[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    padding: '6px 14px',
                    border: `1px solid ${visibility === v ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: visibility === v ? 600 : 400,
                    color: visibility === v ? 'var(--color-primary)' : 'var(--color-text)',
                    background: visibility === v ? 'var(--color-primary-light, rgba(227,28,121,0.06))' : 'var(--color-white)',
                    cursor: 'pointer',
                  }}
                >
                  {v === 'private' ? <EyeOff size={14} /> : <Eye size={14} />}
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 'var(--spacing-xl)', display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button
              variant="secondary"
              icon={<Users size={16} />}
              onClick={() => setCompareModalOpen(true)}
            >
              Compare with another audience
            </Button>
            <Button
              variant="secondary"
              icon={<Send size={16} />}
              onClick={() => setActivationModalOpen(true)}
            >
              Activate
            </Button>
          </div>
        </div>

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

            {/* Activation Status */}
            {audience?.activation_status && audience.activation_status !== 'none' && (
              <div className="preview-stat">
                <span className="stat-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      marginRight: 6,
                      background:
                        audience.activation_status === 'active' ? 'var(--color-success, #22c55e)' :
                        audience.activation_status === 'syncing' ? 'var(--color-warning, #f59e0b)' :
                        audience.activation_status === 'error' ? 'var(--color-error, #ef4444)' :
                        'var(--color-text-muted)',
                    }}
                  />
                  {audience.activation_status.charAt(0).toUpperCase() + audience.activation_status.slice(1)}
                </span>
                <span className="stat-label">Activation Status</span>
              </div>
            )}

            {/* Active Destinations */}
            {audience?.activated_destinations && audience.activated_destinations.length > 0 && (
              <div className="preview-stat">
                <span className="stat-label" style={{ marginBottom: 'var(--spacing-xs)' }}>Active Destinations</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {audience.activated_destinations.map((dest, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontSize: 'var(--font-size-body-sm)' }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: dest.status === 'active' ? 'var(--color-success, #22c55e)' : 'var(--color-text-muted)',
                        }}
                      />
                      <span>{dest.destination_type.replace(/_/g, ' ')}</span>
                      {dest.match_rate != null && (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          ({(dest.match_rate * 100).toFixed(0)}% match)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Market Size Breakdown */}
          {marketSizes && Object.keys(marketSizes).length > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <Globe size={16} />
                Market Breakdown
              </h3>
              <div className="preview-card" style={{ marginTop: 'var(--spacing-sm)' }}>
                {Object.entries(marketSizes).map(([marketId, sizes]) => {
                  const maxSize = Math.max(...Object.values(marketSizes).map((s) => s.population_size));
                  const pct = maxSize > 0 ? (sizes.population_size / maxSize) * 100 : 0;
                  return (
                    <div key={marketId} style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 500 }}>{marketId}</span>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                          n={sizes.sample_size.toLocaleString()} / {formatCompactNumber(sizes.population_size)}
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--color-surface-tertiary, #f3f4f6)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compare Modal */}
      <Modal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Compare with another audience"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setCompareModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCompare} disabled={!selectedCompareId}>Compare</Button>
          </div>
        }
      >
        <SearchInput
          value={compareSearch}
          onChange={setCompareSearch}
          placeholder="Search audiences..."
        />
        <div className="picker-list" style={{ marginTop: 'var(--spacing-md)', maxHeight: 350, overflowY: 'auto' }}>
          {filteredCompareAudiences.map((aud) => (
            <div
              key={aud.id}
              className={`picker-list-item ${selectedCompareId === aud.id ? 'picker-list-item--selected' : ''}`}
              onClick={() => setSelectedCompareId(aud.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                background: selectedCompareId === aud.id ? 'var(--color-primary-light, rgba(227,28,121,0.06))' : 'transparent',
                borderBottom: '1px solid var(--color-border-light)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 500 }}>{aud.name}</div>
                {aud.description && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{aud.description}</div>
                )}
              </div>
              {aud.sample_size != null && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  n={aud.sample_size.toLocaleString()}
                </span>
              )}
            </div>
          ))}
          {filteredCompareAudiences.length === 0 && (
            <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-sm)' }}>
              No other audiences found
            </div>
          )}
        </div>
      </Modal>

      {/* Activation Modal */}
      <Modal
        open={activationModalOpen}
        onClose={() => setActivationModalOpen(false)}
        title="Activate Audience"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setActivationModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={<Send size={16} />} onClick={handleActivate} disabled={!selectedDestination}>
              Activate
            </Button>
          </div>
        }
      >
        <p style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
          Select a destination to push this audience for targeting.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          {activationDestinations.map((dest) => (
            <button
              key={dest.value}
              onClick={() => setSelectedDestination(dest.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: `1px solid ${selectedDestination === dest.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: selectedDestination === dest.value ? 600 : 400,
                color: selectedDestination === dest.value ? 'var(--color-primary)' : 'var(--color-text)',
                background: selectedDestination === dest.value ? 'var(--color-primary-light, rgba(227,28,121,0.06))' : 'var(--color-white)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Send size={14} />
              {dest.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
