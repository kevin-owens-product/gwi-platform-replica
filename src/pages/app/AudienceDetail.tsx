import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAudience, useCreateAudience, useUpdateAudience } from '@/hooks/useAudiences';
import AudienceBuilder from '@/components/audience/AudienceBuilder';
import { Button } from '@/components/shared';
import { formatCompactNumber } from '@/utils/format';
import type { AudienceExpression } from '@/api/types';
import './AudienceDetail.css';

interface AudienceDetailProps {
  isNew?: boolean;
}

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
      </div>
    </div>
  );
}
