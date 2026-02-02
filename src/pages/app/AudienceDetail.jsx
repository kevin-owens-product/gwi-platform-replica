import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronDown, X, Save } from 'lucide-react';
import './AudienceDetail.css';

export default function AudienceDetail({ isNew = false }) {
  const { id } = useParams();
  const [audienceName, setAudienceName] = useState(isNew ? '' : 'Sample Audience');
  const [conditions, setConditions] = useState([
    { id: 1, attribute: 'Age', operator: 'is', value: '25-34' }
  ]);

  const addCondition = () => {
    setConditions([...conditions, {
      id: Date.now(),
      attribute: '',
      operator: 'is',
      value: ''
    }]);
  };

  return (
    <div className="audience-detail-page">
      <div className="audience-detail-header">
        <Link to="/app/audiences" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Audiences</span>
        </Link>
        <div className="header-actions">
          <button className="btn-secondary">
            <span>Cancel</span>
          </button>
          <button className="btn-primary">
            <Save size={16} />
            <span>{isNew ? 'Create Audience' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="audience-detail-content">
        <div className="audience-name-section">
          <input
            type="text"
            className="audience-name-input"
            placeholder="Untitled Audience"
            value={audienceName}
            onChange={(e) => setAudienceName(e.target.value)}
          />
        </div>

        <div className="conditions-section">
          <h3 className="section-title">Build your audience</h3>
          <p className="section-description">
            Add conditions to define who belongs to this audience.
          </p>

          <div className="conditions-builder">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="condition-row">
                {index > 0 && (
                  <span className="condition-connector">AND</span>
                )}
                <div className="condition-fields">
                  <button className="condition-select">
                    <span>{condition.attribute || 'Select attribute'}</span>
                    <ChevronDown size={16} />
                  </button>
                  <button className="condition-select operator">
                    <span>{condition.operator}</span>
                    <ChevronDown size={16} />
                  </button>
                  <button className="condition-select">
                    <span>{condition.value || 'Select value'}</span>
                    <ChevronDown size={16} />
                  </button>
                  <button
                    className="remove-condition-btn"
                    onClick={() => setConditions(conditions.filter(c => c.id !== condition.id))}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button className="add-condition-btn" onClick={addCondition}>
              <Plus size={16} />
              <span>Add condition</span>
            </button>
          </div>
        </div>

        <div className="preview-section">
          <h3 className="section-title">Audience Preview</h3>
          <div className="preview-card">
            <div className="preview-stat">
              <span className="stat-value">--</span>
              <span className="stat-label">Estimated size</span>
            </div>
            <div className="preview-stat">
              <span className="stat-value">--</span>
              <span className="stat-label">% of total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
