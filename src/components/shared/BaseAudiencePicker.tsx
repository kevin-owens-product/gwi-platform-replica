import { useState, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import SearchInput from './SearchInput';
import QuestionBrowser from '@/components/taxonomy/QuestionBrowser';
import type { Audience, AudienceQuestion, AudienceExpression, Question } from '@/api/types';
import './BaseAudiencePicker.css';

export interface BaseAudiencePickerProps {
  open: boolean;
  onClose: () => void;
  audiences: Audience[];
  questions: Question[];
  onSelectSaved: (audience: Audience) => void;
  onApplyQuestion: (expr: AudienceQuestion) => void;
  onClear: () => void;
}

/** Derive a human-readable label from an AudienceExpression, audiences list, and questions list. */
export function getBaseAudienceLabel(
  expr: AudienceExpression | undefined,
  audiences: Audience[],
  questions: Question[],
): string {
  if (!expr) return 'All Adults';
  // Check if the expression matches a saved audience
  const exprJson = JSON.stringify(expr);
  const match = audiences.find((a) => JSON.stringify(a.expression) === exprJson);
  if (match) return match.name;
  // Check if it's a question-based expression
  if ('question' in expr) {
    const q = questions.find((qu) => qu.id === expr.question.question_id);
    if (q) {
      const dpNames = expr.question.datapoint_ids
        .map((dpId) => q.datapoints.find((dp) => dp.id === dpId)?.name)
        .filter(Boolean);
      return dpNames.length > 0 ? `${q.name}: ${dpNames.join(', ')}` : q.name;
    }
    return 'Custom filter';
  }
  return 'Custom audience';
}

export default function BaseAudiencePicker({
  open,
  onClose,
  audiences,
  questions,
  onSelectSaved,
  onApplyQuestion,
  onClear,
}: BaseAudiencePickerProps): React.JSX.Element {
  const [tab, setTab] = useState<'saved' | 'question' | 'clear'>('saved');
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [datapointIds, setDatapointIds] = useState<Set<string>>(new Set());

  const resetState = () => {
    setTab('saved');
    setSearch('');
    setSelectedQuestion(null);
    setDatapointIds(new Set());
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleApply = () => {
    if (tab === 'clear') {
      onClear();
      handleClose();
    } else if (tab === 'question' && selectedQuestion && datapointIds.size > 0) {
      const expr: AudienceQuestion = {
        question: {
          question_id: selectedQuestion.id,
          datapoint_ids: Array.from(datapointIds),
        },
      };
      onApplyQuestion(expr);
      handleClose();
    }
  };

  const handleSavedSelect = (aud: Audience) => {
    onSelectSaved(aud);
    handleClose();
  };

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    setDatapointIds(new Set());
  };

  const handleDatapointToggle = (dpId: string) => {
    setDatapointIds((prev) => {
      const next = new Set(prev);
      if (next.has(dpId)) {
        next.delete(dpId);
      } else {
        next.add(dpId);
      }
      return next;
    });
  };

  const filteredAudiences = useMemo(() => {
    if (!search) return audiences;
    const q = search.toLowerCase();
    return audiences.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q),
    );
  }, [audiences, search]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Select Base Audience"
      size="xl"
      footer={
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={
              tab === 'saved' ||
              (tab === 'question' && datapointIds.size === 0)
            }
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      }
    >
      <div className="picker-tabs">
        <button
          className={`picker-tab ${tab === 'saved' ? 'picker-tab--active' : ''}`}
          onClick={() => setTab('saved')}
        >
          Saved Audiences
        </button>
        <button
          className={`picker-tab ${tab === 'question' ? 'picker-tab--active' : ''}`}
          onClick={() => setTab('question')}
        >
          By Question
        </button>
        <button
          className={`picker-tab ${tab === 'clear' ? 'picker-tab--active' : ''}`}
          onClick={() => setTab('clear')}
        >
          All Adults
        </button>
      </div>

      {tab === 'saved' && (
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search audiences..."
          />
          <div className="picker-list" style={{ marginTop: 'var(--spacing-md)' }}>
            {filteredAudiences.map((aud) => (
              <div
                key={aud.id}
                className="picker-list-item"
                onClick={() => handleSavedSelect(aud)}
              >
                <div className="picker-list-item__info">
                  <span className="picker-list-item__name">{aud.name}</span>
                  {aud.description && <span className="picker-list-item__desc">{aud.description}</span>}
                </div>
                {aud.sample_size != null && (
                  <span className="picker-list-item__meta">n={aud.sample_size.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'question' && (
        <div className="base-picker__split">
          <QuestionBrowser
            onSelectQuestion={handleQuestionSelect}
            selectedQuestionIds={selectedQuestion ? [selectedQuestion.id] : []}
          />
          {selectedQuestion ? (
            <div className="base-picker__question-detail">
              <h4>{selectedQuestion.name}</h4>
              <p>Select datapoints to filter by:</p>
              <div className="base-picker__dp-list">
                {selectedQuestion.datapoints.map((dp) => (
                  <div
                    key={dp.id}
                    className="base-picker__dp-item"
                    onClick={() => handleDatapointToggle(dp.id)}
                  >
                    <input
                      type="checkbox"
                      checked={datapointIds.has(dp.id)}
                      onChange={() => handleDatapointToggle(dp.id)}
                    />
                    <label>{dp.name}</label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="base-picker__question-detail">
              <div className="base-picker__empty">
                Select a question to see its datapoints
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'clear' && (
        <div className="base-picker__clear">
          <p>
            Use the full survey base with no audience filter applied.
            This resets the base to <strong>All Adults</strong>.
          </p>
        </div>
      )}
    </Modal>
  );
}
