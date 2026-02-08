import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Loader2, BarChart3, Grid3X3, Sparkles, BookmarkPlus, Filter, X, Tag } from 'lucide-react';
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
  { label: 'All Categories', value: 'all' },
  { label: 'Demographics', value: 'demographics' },
  { label: 'Media', value: 'media' },
  { label: 'Brand', value: 'brand' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Technology', value: 'technology' },
  { label: 'Purchase Behavior', value: 'purchase' },
  { label: 'Attitudes', value: 'attitudes' },
];

type ActionMode = 'chart' | 'crosstab' | 'audience' | 'spark';

export default function Questions(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState<string>('gwi-core');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [actionMode, setActionMode] = useState<ActionMode>('chart');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoriteQuestionIds, setFavoriteQuestionIds] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

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

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(question.id)
        ? prev.filter((id) => id !== question.id)
        : [...prev, question.id]
    );
  };

  const handleSelectDatapoints = (questionId: string, _datapoints: Datapoint[]) => {
    navigate(`/app/chart-builder/chart/new?question=${questionId}`);
  };

  const handleAction = () => {
    if (selectedQuestionIds.length === 0) return;
    const qParam = selectedQuestionIds.join(',');

    switch (actionMode) {
      case 'chart':
        navigate(`/app/chart-builder/chart/new?questions=${qParam}`);
        break;
      case 'crosstab':
        navigate(`/app/crosstabs/new?row_questions=${qParam}`);
        break;
      case 'audience':
        navigate(`/app/audiences/new?questions=${qParam}`);
        break;
      case 'spark':
        navigate(`/app/spark?questions=${qParam}`);
        break;
    }
  };

  const selectedDatasetLabel = datasets.find((d) => d.value === selectedDataset)?.label ?? datasets[0]?.label ?? 'GWI Core';

  const actionModeOptions = [
    { label: 'Add to Chart', value: 'chart', icon: <BarChart3 size={14} /> },
    { label: 'Add to Crosstab', value: 'crosstab', icon: <Grid3X3 size={14} /> },
    { label: 'Use in Audience', value: 'audience', icon: <Tag size={14} /> },
    { label: 'Ask Spark', value: 'spark', icon: <Sparkles size={14} /> },
  ];

  const actionLabel = actionModeOptions.find((a) => a.value === actionMode)?.label ?? 'Add to Chart';

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1 className="page-title">Questions</h1>
        <div className="questions-header-controls">
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

          {/* Category filter */}
          <Dropdown
            trigger={
              <button className="questions-filter-btn">
                <Filter size={14} />
                <span>{categoryFilters.find((c) => c.value === selectedCategory)?.label ?? 'All'}</span>
                <ChevronDown size={14} />
              </button>
            }
            items={categoryFilters}
            onSelect={(value) => setSelectedCategory(value)}
          />

          {/* Favorites toggle */}
          <button
            className={`questions-favorites-btn ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <BookmarkPlus size={14} />
            <span>Favorites</span>
            {favoriteQuestionIds.length > 0 && (
              <span className="questions-favorites-count">{favoriteQuestionIds.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="questions-content">
        <QuestionBrowser
          onSelectQuestion={handleSelectQuestion}
          onSelectDatapoints={handleSelectDatapoints}
          selectedQuestionIds={selectedQuestionIds}
        />
      </div>

      {selectedQuestionIds.length > 0 && (
        <div className="questions-action-bar">
          <span className="questions-action-count">
            {selectedQuestionIds.length} question{selectedQuestionIds.length !== 1 ? 's' : ''} selected
          </span>

          <button
            className="questions-clear-btn"
            onClick={() => setSelectedQuestionIds([])}
          >
            <X size={14} />
            Clear
          </button>

          <div className="questions-action-mode">
            {actionModeOptions.map((opt) => (
              <button
                key={opt.value}
                className={`questions-mode-btn ${actionMode === opt.value ? 'active' : ''}`}
                onClick={() => setActionMode(opt.value as ActionMode)}
                title={opt.label}
              >
                {opt.icon}
              </button>
            ))}
          </div>

          <button
            className="questions-action-btn"
            onClick={handleAction}
          >
            {actionLabel} ({selectedQuestionIds.length})
          </button>
        </div>
      )}
    </div>
  );
}
