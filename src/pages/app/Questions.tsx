import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
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

export default function Questions(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState<string>('gwi-core');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

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

  const handleAddToChart = () => {
    if (selectedQuestionIds.length > 0) {
      navigate(`/app/chart-builder/chart/new?questions=${selectedQuestionIds.join(',')}`);
    }
  };

  const selectedDatasetLabel = datasets.find((d) => d.value === selectedDataset)?.label ?? datasets[0]?.label ?? 'GWI Core';

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1 className="page-title">Questions</h1>
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
