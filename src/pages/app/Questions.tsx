import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Loader2, BarChart2, Table2, TrendingUp,
  Clock, X, Hash, Eye
} from 'lucide-react';
import QuestionBrowser from '@/components/taxonomy/QuestionBrowser';
import { Dropdown } from '@/components/shared';
import { useStudies } from '@/hooks/useTaxonomy';
import type { Question, Datapoint } from '@/api/types';
import './Questions.css';

const fallbackDatasets = [
  { label: 'GWI Core', value: 'gwi-core' },
  { label: 'GWI Zeitgeist', value: 'gwi-zeitgeist' },
  { label: 'GWI USA', value: 'gwi-usa' },
  { label: 'GWI Kids', value: 'gwi-kids' },
  { label: 'GWI Work', value: 'gwi-work' },
];

const categoryFilters = [
  { id: 'all', label: 'All' },
  { id: 'demographics', label: 'Demographics' },
  { id: 'media', label: 'Media' },
  { id: 'attitudes', label: 'Attitudes' },
  { id: 'purchasing', label: 'Purchasing' },
  { id: 'lifestyle', label: 'Lifestyle' },
];

// Mock data for the detail panel
const mockDatapoints: Record<string, { name: string; percentage: number }[]> = {
  default: [
    { name: 'Strongly Agree', percentage: 32 },
    { name: 'Agree', percentage: 41 },
    { name: 'Neutral', percentage: 15 },
    { name: 'Disagree', percentage: 8 },
    { name: 'Strongly Disagree', percentage: 4 },
  ],
};

const mockSampleSizes: Record<string, number> = {
  default: 24850,
};

interface RecentQuestion {
  id: string;
  name: string;
  category: string;
  viewedAt: number;
}

export default function Questions(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState<string>('gwi-core');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDetailQuestion, setSelectedDetailQuestion] = useState<Question | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentQuestion[]>([]);

  const { data: studies, isLoading: studiesLoading } = useStudies();

  const datasets = useMemo(() => {
    if (studies && studies.length > 0) {
      return studies.map((s) => ({
        label: s.name,
        value: s.id,
      }));
    }
    return fallbackDatasets;
  }, [studies]);

  const addToRecentlyViewed = useCallback((question: Question) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((q) => q.id !== question.id);
      const newEntry: RecentQuestion = {
        id: question.id,
        name: question.name,
        category: question.category_name,
        viewedAt: Date.now(),
      };
      return [newEntry, ...filtered].slice(0, 3);
    });
  }, []);

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(question.id)
        ? prev.filter((id) => id !== question.id)
        : [...prev, question.id]
    );
  };

  const handleViewDetail = useCallback((question: Question) => {
    setSelectedDetailQuestion(question);
    addToRecentlyViewed(question);
  }, [addToRecentlyViewed]);

  const handleSelectDatapoints = (questionId: string, _datapoints: Datapoint[]) => {
    navigate(`/app/chart-builder/chart/new?question=${questionId}`);
  };

  const handleAddToChart = () => {
    if (selectedQuestionIds.length > 0) {
      navigate(`/app/chart-builder/chart/new?questions=${selectedQuestionIds.join(',')}`);
    }
  };

  const handleQuickAddToChart = useCallback((questionId: string) => {
    navigate(`/app/chart-builder/chart/new?question=${questionId}`);
  }, [navigate]);

  const handleQuickAddToCrosstab = useCallback((questionId: string) => {
    navigate(`/app/chart-builder/crosstab/new?question=${questionId}`);
  }, [navigate]);

  const handleQuickViewTrend = useCallback((questionId: string) => {
    navigate(`/app/chart-builder/chart/new?question=${questionId}&type=trend`);
  }, [navigate]);

  const selectedDatasetLabel = datasets.find((d) => d.value === selectedDataset)?.label ?? datasets[0]?.label ?? 'GWI Core';

  // Detail panel mock data
  const detailDatapoints = mockDatapoints.default;
  const detailSampleSize = mockSampleSizes.default;

  return (
    <div className="questions-page">
      <div className="questions-header">
        <div className="questions-header-left">
          <h1 className="page-title">Questions</h1>
          <span className="questions-count-indicator">
            <Hash size={13} />
            Showing {selectedQuestionIds.length} selected
          </span>
        </div>
        <div className="questions-dataset-wrapper">
          {studiesLoading ? (
            <button className="questions-dataset-btn" disabled>
              <Loader2 size={14} className="spin" />
              <span>Loading...</span>
            </button>
          ) : (
            <Dropdown
              trigger={
                <button className="questions-dataset-btn">
                  <span>{selectedDatasetLabel}</span>
                  <ChevronDown size={16} />
                </button>
              }
              items={datasets}
              onSelect={(value) => setSelectedDataset(value)}
            />
          )}
        </div>
      </div>

      {/* Recently Viewed Questions */}
      {recentlyViewed.length > 0 && (
        <div className="questions-recent">
          <div className="questions-recent-header">
            <Clock size={14} />
            <span>Recently Viewed</span>
          </div>
          <div className="questions-recent-list">
            {recentlyViewed.map((q) => (
              <button
                key={q.id}
                className="questions-recent-item"
                onClick={() => {
                  // Re-open detail for this question stub
                  setSelectedDetailQuestion({
                    id: q.id,
                    name: q.name,
                    category_name: q.category,
                    category_id: '',
                    type: 'single',
                    datapoints: [],
                    wave_ids: [],
                    namespace_id: '',
                  });
                }}
              >
                <Eye size={12} />
                <span className="questions-recent-name">{q.name}</span>
                <span className="questions-recent-category">{q.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="questions-category-chips">
        {categoryFilters.map((cat) => (
          <button
            key={cat.id}
            className={`questions-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="questions-content">
        <div className={`questions-browser-area ${selectedDetailQuestion ? 'with-detail' : ''}`}>
          <QuestionBrowser
            onSelectQuestion={(question) => {
              handleSelectQuestion(question);
              handleViewDetail(question);
            }}
            onSelectDatapoints={handleSelectDatapoints}
            selectedQuestionIds={selectedQuestionIds}
          />
        </div>

        {/* Question Detail Panel */}
        {selectedDetailQuestion && (
          <div className="questions-detail-panel">
            <div className="questions-detail-header">
              <h3>Question Detail</h3>
              <button
                className="questions-detail-close"
                onClick={() => setSelectedDetailQuestion(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="questions-detail-body">
              <div className="questions-detail-question-text">
                {selectedDetailQuestion.name}
              </div>

              <div className="questions-detail-meta">
                <span className="questions-detail-badge">
                  {selectedDetailQuestion.category_name || 'General'}
                </span>
                <span className="questions-detail-badge type">
                  {selectedDetailQuestion.type}
                </span>
              </div>

              <div className="questions-detail-stat-row">
                <div className="questions-detail-stat">
                  <span className="questions-detail-stat-label">Available Datapoints</span>
                  <span className="questions-detail-stat-value">
                    {selectedDetailQuestion.datapoints.length > 0
                      ? selectedDetailQuestion.datapoints.length
                      : detailDatapoints.length}
                  </span>
                </div>
                <div className="questions-detail-stat">
                  <span className="questions-detail-stat-label">Sample Size</span>
                  <span className="questions-detail-stat-value">{detailSampleSize.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="questions-quick-actions">
                <button
                  className="questions-quick-action-btn chart"
                  onClick={() => handleQuickAddToChart(selectedDetailQuestion.id)}
                >
                  <BarChart2 size={14} />
                  Add to Chart
                </button>
                <button
                  className="questions-quick-action-btn crosstab"
                  onClick={() => handleQuickAddToCrosstab(selectedDetailQuestion.id)}
                >
                  <Table2 size={14} />
                  Add to Crosstab
                </button>
                <button
                  className="questions-quick-action-btn trend"
                  onClick={() => handleQuickViewTrend(selectedDetailQuestion.id)}
                >
                  <TrendingUp size={14} />
                  View Trend
                </button>
              </div>

              {/* Preview Data */}
              <div className="questions-detail-preview">
                <h4 className="questions-detail-preview-title">Preview Data</h4>
                <div className="questions-detail-bars">
                  {detailDatapoints.map((dp) => (
                    <div key={dp.name} className="questions-detail-bar-row">
                      <span className="questions-detail-bar-label">{dp.name}</span>
                      <div className="questions-detail-bar-track">
                        <div
                          className="questions-detail-bar-fill"
                          style={{ width: `${dp.percentage}%` }}
                        />
                      </div>
                      <span className="questions-detail-bar-pct">{dp.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Datapoints list if available */}
              {selectedDetailQuestion.datapoints.length > 0 && (
                <div className="questions-detail-datapoints">
                  <h4 className="questions-detail-datapoints-title">Datapoints</h4>
                  <div className="questions-detail-datapoints-list">
                    {selectedDetailQuestion.datapoints.slice(0, 10).map((dp) => (
                      <span key={dp.id} className="questions-detail-dp-tag">
                        {dp.name}
                      </span>
                    ))}
                    {selectedDetailQuestion.datapoints.length > 10 && (
                      <span className="questions-detail-dp-more">
                        +{selectedDetailQuestion.datapoints.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedQuestionIds.length > 0 && (
        <div className="questions-action-bar">
          <span className="questions-action-count">
            {selectedQuestionIds.length} question{selectedQuestionIds.length !== 1 ? 's' : ''} selected
          </span>
          <button
            className="questions-action-btn"
            onClick={handleAddToChart}
          >
            Add {selectedQuestionIds.length} to chart
          </button>
        </div>
      )}
    </div>
  );
}
