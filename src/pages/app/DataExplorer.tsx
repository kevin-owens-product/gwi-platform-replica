import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Compass,
  Grid3X3,
  Layers,
  Loader2,
  Plus,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState, SearchInput } from '@/components/shared';
import { useCategories, useLocations, useQuestions, useStudies, useWaves } from '@/hooks/useTaxonomy';
import { formatCompactNumber, formatDate } from '@/utils/format';
import type { Question, QuestionType, Wave } from '@/api/types';
import './DataExplorer.css';

type ExplorerTool = 'audience' | 'chart' | 'crosstab' | 'spark';

type FilterValue<T extends string> = T | 'all';

interface ExplorerCollection {
  id: string;
  name: string;
  questionIds: string[];
  updatedAt: string;
}

interface EnrichedQuestion extends Question {
  linkedWaves: Wave[];
  latestWave?: Wave;
  coverageLocationIds: string[];
  coverageStudyIds: string[];
  totalSampleSize: number;
  qualityScore: number;
  searchScore: number;
  supportedTools: Record<ExplorerTool, boolean>;
}

interface DistributionPoint {
  id: string;
  name: string;
  percent: number;
}

const STORAGE_KEY = 'gwi.dataExplorer.collections.v1';
const DEFAULT_COLLECTION_ID = 'shortlist';

const intentHints = [
  'High-income gamers in the US',
  'Podcast listeners interested in technology',
  'Social commerce users in UK and Germany',
  'Environmentally concerned online shoppers',
];

const searchSynonyms: Array<{ match: string; terms: string[] }> = [
  { match: 'gen z', terms: ['age', '16-24', 'youth'] },
  { match: 'high income', terms: ['income', 'household income', 'affluent'] },
  { match: 'streaming', terms: ['tv', 'video', 'platform'] },
  { match: 'social commerce', terms: ['social media', 'purchase', 'shopping'] },
  { match: 'gamers', terms: ['gaming', 'console', 'mobile'] },
  { match: 'eco', terms: ['environment', 'sustainability'] },
];

const toolLabels: Record<ExplorerTool, string> = {
  audience: 'Audience Builder',
  chart: 'Chart Builder',
  crosstab: 'Crosstabs',
  spark: 'Spark',
};

const questionTypeLabels: Record<QuestionType, string> = {
  single: 'Single Choice',
  multi: 'Multi Select',
  scale: 'Scale',
  grid: 'Grid',
  open: 'Open Text',
  numeric: 'Numeric',
};

function createDefaultCollection(): ExplorerCollection {
  return {
    id: DEFAULT_COLLECTION_ID,
    name: 'My Shortlist',
    questionIds: [],
    updatedAt: new Date().toISOString(),
  };
}

function isValidCollection(value: unknown): value is ExplorerCollection {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ExplorerCollection>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.questionIds) &&
    candidate.questionIds.every((id) => typeof id === 'string') &&
    typeof candidate.updatedAt === 'string'
  );
}

function getToolSupport(question: Question): Record<ExplorerTool, boolean> {
  const isOpenText = question.type === 'open';
  return {
    audience: question.type === 'single' || question.type === 'multi' || question.type === 'scale',
    chart: !isOpenText,
    crosstab: !isOpenText,
    spark: true,
  };
}

function buildQueryTokens(rawQuery: string): string[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const tokens = new Set(
    query
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter(Boolean),
  );

  searchSynonyms.forEach(({ match, terms }) => {
    if (query.includes(match)) {
      terms.forEach((term) => {
        term
          .split(/[^a-z0-9]+/)
          .map((token) => token.trim())
          .filter(Boolean)
          .forEach((token) => tokens.add(token));
      });
    }
  });

  return Array.from(tokens);
}

function computeSearchScore(question: Question, rawQuery: string, tokens: string[]): number {
  if (!rawQuery.trim()) return 1;

  const query = rawQuery.trim().toLowerCase();
  const name = question.name.toLowerCase();
  const description = question.description?.toLowerCase() ?? '';
  const category = question.category_name.toLowerCase();
  const datapoints = question.datapoints.map((datapoint) => datapoint.name.toLowerCase());

  let score = 0;

  if (name.includes(query)) score += 30;
  if (description.includes(query)) score += 14;
  if (category.includes(query)) score += 10;
  if (datapoints.some((datapoint) => datapoint.includes(query))) score += 8;

  tokens.forEach((token) => {
    if (name.includes(token)) score += 6;
    if (description.includes(token)) score += 3;
    if (category.includes(token)) score += 2;
    if (datapoints.some((datapoint) => datapoint.includes(token))) score += 2;
  });

  return score;
}

function getLatestWave(waves: Wave[]): Wave | undefined {
  return waves.reduce<Wave | undefined>((latest, current) => {
    if (!latest) return current;
    return new Date(current.end_date) > new Date(latest.end_date) ? current : latest;
  }, undefined);
}

function computeQualityScore(question: Question, linkedWaves: Wave[], marketCount: number): number {
  const latestWave = getLatestWave(linkedWaves);
  const now = new Date();

  let recencyScore = 8;
  if (latestWave) {
    const daysOld = Math.max(0, Math.floor((now.getTime() - new Date(latestWave.end_date).getTime()) / (1000 * 60 * 60 * 24)));
    if (daysOld <= 120) recencyScore = 36;
    else if (daysOld <= 240) recencyScore = 28;
    else if (daysOld <= 365) recencyScore = 20;
    else recencyScore = 14;
  }

  const depthScore = Math.min(24, question.datapoints.length * 3);
  const waveScore = Math.min(24, linkedWaves.length * 7);
  const marketScore = Math.min(20, marketCount * 2);

  return Math.max(30, Math.min(98, recencyScore + depthScore + waveScore + marketScore));
}

function qualityBand(score: number): 'high' | 'medium' | 'watch' {
  if (score >= 78) return 'high';
  if (score >= 58) return 'medium';
  return 'watch';
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildDistributionPreview(question: Question): DistributionPoint[] {
  const topDatapoints = question.datapoints.slice(0, 6);
  if (topDatapoints.length === 0) return [];

  const weights = topDatapoints.map((datapoint, index) => {
    const hash = hashString(`${question.id}_${datapoint.id}_${index}`);
    return 25 + (hash % 70);
  });

  const total = weights.reduce((sum, value) => sum + value, 0);

  return topDatapoints
    .map((datapoint, index) => ({
      id: datapoint.id,
      name: datapoint.name,
      percent: Number(((weights[index] / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.percent - a.percent);
}

function tokenSet(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2),
  );
}

function getRelatedQuestions(baseQuestion: EnrichedQuestion, allQuestions: EnrichedQuestion[]): EnrichedQuestion[] {
  const baseTokens = tokenSet(baseQuestion.name);

  return allQuestions
    .filter((question) => question.id !== baseQuestion.id)
    .map((question) => {
      const candidateTokens = tokenSet(question.name);
      let overlap = 0;
      candidateTokens.forEach((token) => {
        if (baseTokens.has(token)) overlap += 2;
      });

      const sharedWaves = question.wave_ids.filter((waveId) => baseQuestion.wave_ids.includes(waveId)).length;
      const sameCategoryBoost = question.category_id === baseQuestion.category_id ? 8 : 0;

      return {
        question,
        score: overlap + sharedWaves * 2 + sameCategoryBoost,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.question);
}

export default function DataExplorer(): React.JSX.Element {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterValue<string>>('all');
  const [selectedType, setSelectedType] = useState<FilterValue<QuestionType>>('all');
  const [selectedMarket, setSelectedMarket] = useState<FilterValue<string>>('all');
  const [selectedWave, setSelectedWave] = useState<FilterValue<string>>('all');
  const [selectedStudy, setSelectedStudy] = useState<FilterValue<string>>('all');
  const [selectedTool, setSelectedTool] = useState<FilterValue<ExplorerTool>>('all');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  const [collections, setCollections] = useState<ExplorerCollection[]>(() => {
    if (typeof window === 'undefined') return [createDefaultCollection()];

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return [createDefaultCollection()];

      const parsed = JSON.parse(saved) as unknown;
      if (!Array.isArray(parsed)) return [createDefaultCollection()];

      const valid = parsed.filter(isValidCollection);
      if (valid.length === 0) return [createDefaultCollection()];
      if (!valid.some((collection) => collection.id === DEFAULT_COLLECTION_ID)) {
        return [createDefaultCollection(), ...valid];
      }
      return valid;
    } catch {
      return [createDefaultCollection()];
    }
  });

  const [activeCollectionId, setActiveCollectionId] = useState<string>(DEFAULT_COLLECTION_ID);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: waves } = useWaves();
  const { data: locations } = useLocations();
  const { data: studies } = useStudies();
  const { data: questionsResponse, isLoading: questionsLoading } = useQuestions({ per_page: 300 });

  const questionList = questionsResponse?.data ?? [];

  const waveById = useMemo(() => {
    return new Map((waves ?? []).map((wave) => [wave.id, wave]));
  }, [waves]);

  const locationById = useMemo(() => {
    return new Map((locations ?? []).map((location) => [location.id, location]));
  }, [locations]);

  const queryTokens = useMemo(() => buildQueryTokens(query), [query]);

  const enrichedQuestions = useMemo<EnrichedQuestion[]>(() => {
    return questionList.map((question) => {
      const linkedWaves = question.wave_ids
        .map((waveId) => waveById.get(waveId))
        .filter((wave): wave is Wave => Boolean(wave));

      const coverageLocationIds = Array.from(
        new Set(linkedWaves.flatMap((wave) => wave.location_ids)),
      );

      const coverageStudyIds = Array.from(
        new Set(linkedWaves.map((wave) => wave.study_id)),
      );

      const totalSampleSize = linkedWaves.reduce((sum, wave) => sum + wave.sample_size, 0);
      const latestWave = getLatestWave(linkedWaves);
      const qualityScore = computeQualityScore(question, linkedWaves, coverageLocationIds.length);
      const searchScore = computeSearchScore(question, query, queryTokens);

      return {
        ...question,
        linkedWaves,
        latestWave,
        coverageLocationIds,
        coverageStudyIds,
        totalSampleSize,
        qualityScore,
        searchScore,
        supportedTools: getToolSupport(question),
      };
    });
  }, [questionList, waveById, query, queryTokens]);

  const filteredQuestions = useMemo(() => {
    return enrichedQuestions
      .filter((question) => {
        if (selectedCategory !== 'all' && question.category_id !== selectedCategory) return false;
        if (selectedType !== 'all' && question.type !== selectedType) return false;
        if (selectedMarket !== 'all' && !question.coverageLocationIds.includes(selectedMarket)) return false;
        if (selectedWave !== 'all' && !question.wave_ids.includes(selectedWave)) return false;
        if (selectedStudy !== 'all' && !question.coverageStudyIds.includes(selectedStudy)) return false;
        if (selectedTool !== 'all' && !question.supportedTools[selectedTool]) return false;
        if (query.trim() && question.searchScore <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (query.trim()) {
          return b.searchScore - a.searchScore || b.qualityScore - a.qualityScore || a.name.localeCompare(b.name);
        }
        return b.qualityScore - a.qualityScore || a.name.localeCompare(b.name);
      });
  }, [enrichedQuestions, selectedCategory, selectedType, selectedMarket, selectedWave, selectedStudy, selectedTool, query]);

  useEffect(() => {
    if (filteredQuestions.length === 0) {
      setSelectedQuestionId(null);
      return;
    }

    if (!selectedQuestionId || !filteredQuestions.some((question) => question.id === selectedQuestionId)) {
      setSelectedQuestionId(filteredQuestions[0].id);
    }
  }, [filteredQuestions, selectedQuestionId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    if (!collections.some((collection) => collection.id === activeCollectionId)) {
      setActiveCollectionId(collections[0]?.id ?? DEFAULT_COLLECTION_ID);
    }
  }, [collections, activeCollectionId]);

  const selectedQuestion = useMemo(() => {
    if (!selectedQuestionId) return null;
    return filteredQuestions.find((question) => question.id === selectedQuestionId) ?? null;
  }, [filteredQuestions, selectedQuestionId]);

  const activeCollection = useMemo(() => {
    return collections.find((collection) => collection.id === activeCollectionId) ?? collections[0] ?? null;
  }, [collections, activeCollectionId]);

  const selectedDistribution = useMemo(() => {
    if (!selectedQuestion) return [];
    return buildDistributionPreview(selectedQuestion);
  }, [selectedQuestion]);

  const relatedQuestions = useMemo(() => {
    if (!selectedQuestion) return [];
    return getRelatedQuestions(selectedQuestion, enrichedQuestions);
  }, [selectedQuestion, enrichedQuestions]);

  const coverageLocationNames = useMemo(() => {
    if (!selectedQuestion) return [];
    return selectedQuestion.coverageLocationIds.map((locationId) => locationById.get(locationId)?.name ?? locationId);
  }, [selectedQuestion, locationById]);

  const compatibilityWarnings = useMemo(() => {
    if (!selectedQuestion) return [] as string[];

    const warnings: string[] = [];

    if (selectedTool !== 'all' && !selectedQuestion.supportedTools[selectedTool]) {
      warnings.push(`Not available in ${toolLabels[selectedTool]} for this variable type.`);
    }

    if (selectedMarket !== 'all' && !selectedQuestion.coverageLocationIds.includes(selectedMarket)) {
      const marketLabel = locationById.get(selectedMarket)?.name ?? selectedMarket;
      warnings.push(`No market coverage for ${marketLabel}.`);
    }

    if (selectedWave !== 'all' && !selectedQuestion.wave_ids.includes(selectedWave)) {
      const waveLabel = waveById.get(selectedWave)?.name ?? selectedWave;
      warnings.push(`This variable is not available in ${waveLabel}.`);
    }

    if (selectedStudy !== 'all' && !selectedQuestion.coverageStudyIds.includes(selectedStudy)) {
      const studyLabel = studies?.find((study) => study.id === selectedStudy)?.name ?? selectedStudy;
      warnings.push(`This variable does not map to ${studyLabel}.`);
    }

    return warnings;
  }, [selectedQuestion, selectedTool, selectedMarket, selectedWave, selectedStudy, locationById, waveById, studies]);

  const totalSavedCount = useMemo(() => {
    const unique = new Set<string>();
    collections.forEach((collection) => {
      collection.questionIds.forEach((questionId) => unique.add(questionId));
    });
    return unique.size;
  }, [collections]);

  const isSelectedQuestionSaved = useMemo(() => {
    if (!selectedQuestion) return false;
    return collections.some((collection) => collection.questionIds.includes(selectedQuestion.id));
  }, [collections, selectedQuestion]);

  const isSelectedQuestionInActiveCollection = useMemo(() => {
    if (!selectedQuestion || !activeCollection) return false;
    return activeCollection.questionIds.includes(selectedQuestion.id);
  }, [selectedQuestion, activeCollection]);

  const handleUseIntent = (hint: string) => {
    setQuery(hint);
  };

  const handleNavigateToTool = (tool: ExplorerTool) => {
    if (!selectedQuestion) return;

    if (!selectedQuestion.supportedTools[tool]) {
      toast.error(`${selectedQuestion.name} is not supported in ${toolLabels[tool]}.`);
      return;
    }

    if (tool === 'chart') {
      const params = new URLSearchParams({ questions: selectedQuestion.id });
      navigate(`/app/chart-builder/chart/new?${params.toString()}`);
      return;
    }

    if (tool === 'crosstab') {
      const params = new URLSearchParams({ row_questions: selectedQuestion.id });
      navigate(`/app/crosstabs/new?${params.toString()}`);
      return;
    }

    if (tool === 'audience') {
      const params = new URLSearchParams({ explorer_question: selectedQuestion.id });
      navigate(`/app/audiences/new?${params.toString()}`);
      return;
    }

    const sparkParams = new URLSearchParams({
      prompt: `Help me profile ${selectedQuestion.name} and recommend next variables to analyze.`,
      questions: selectedQuestion.id,
    });
    navigate(`/app/agent-spark?${sparkParams.toString()}`);
  };

  const handleToggleSaveToCollection = () => {
    if (!selectedQuestion || !activeCollection) return;

    const now = new Date().toISOString();

    setCollections((previous) =>
      previous.map((collection) => {
        if (collection.id !== activeCollection.id) return collection;

        if (collection.questionIds.includes(selectedQuestion.id)) {
          return {
            ...collection,
            questionIds: collection.questionIds.filter((questionId) => questionId !== selectedQuestion.id),
            updatedAt: now,
          };
        }

        return {
          ...collection,
          questionIds: [selectedQuestion.id, ...collection.questionIds],
          updatedAt: now,
        };
      }),
    );
  };

  const handleCreateCollection = () => {
    const trimmedName = newCollectionName.trim();
    if (!trimmedName) return;

    const id = `col_${Date.now().toString(36)}`;
    const nextCollection: ExplorerCollection = {
      id,
      name: trimmedName,
      questionIds: [],
      updatedAt: new Date().toISOString(),
    };

    setCollections((previous) => [nextCollection, ...previous]);
    setActiveCollectionId(id);
    setNewCollectionName('');
    toast.success(`Collection "${trimmedName}" created.`);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedMarket('all');
    setSelectedWave('all');
    setSelectedStudy('all');
    setSelectedTool('all');
  };

  return (
    <div className="data-explorer-page">
      <header className="dx-header">
        <div>
          <h1 className="page-title">Data Explorer</h1>
          <p className="dx-subtitle">Discover what data exists, understand coverage and quality, and use variables directly across the product.</p>
        </div>
        <div className="dx-header-stats">
          <div className="dx-stat-chip">
            <Layers size={14} />
            <span>{filteredQuestions.length} / {questionList.length} variables</span>
          </div>
          <div className="dx-stat-chip">
            <BookOpen size={14} />
            <span>{totalSavedCount} saved</span>
          </div>
        </div>
      </header>

      <section className="dx-discover-card">
        <div className="dx-search-row">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Describe your intent: high-income gamers in UK, podcast listeners, social commerce..."
            debounceMs={220}
          />
        </div>

        <div className="dx-intent-row">
          {intentHints.map((hint) => (
            <button
              key={hint}
              type="button"
              className="dx-intent-chip"
              onClick={() => handleUseIntent(hint)}
            >
              <Compass size={12} />
              <span>{hint}</span>
            </button>
          ))}
        </div>

        <div className="dx-filter-grid">
          <label className="dx-filter">
            <span>Category</span>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="all">All categories</option>
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

          <label className="dx-filter">
            <span>Type</span>
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value as FilterValue<QuestionType>)}>
              <option value="all">All types</option>
              {(Object.keys(questionTypeLabels) as QuestionType[]).map((type) => (
                <option key={type} value={type}>{questionTypeLabels[type]}</option>
              ))}
            </select>
          </label>

          <label className="dx-filter">
            <span>Market</span>
            <select value={selectedMarket} onChange={(event) => setSelectedMarket(event.target.value)}>
              <option value="all">All markets</option>
              {(locations ?? []).map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </label>

          <label className="dx-filter">
            <span>Wave</span>
            <select value={selectedWave} onChange={(event) => setSelectedWave(event.target.value)}>
              <option value="all">All waves</option>
              {(waves ?? []).map((wave) => (
                <option key={wave.id} value={wave.id}>{wave.name}</option>
              ))}
            </select>
          </label>

          <label className="dx-filter">
            <span>Study</span>
            <select value={selectedStudy} onChange={(event) => setSelectedStudy(event.target.value)}>
              <option value="all">All studies</option>
              {(studies ?? []).map((study) => (
                <option key={study.id} value={study.id}>{study.name}</option>
              ))}
            </select>
          </label>

          <label className="dx-filter">
            <span>Use in</span>
            <select value={selectedTool} onChange={(event) => setSelectedTool(event.target.value as FilterValue<ExplorerTool>)}>
              <option value="all">All product areas</option>
              {(Object.keys(toolLabels) as ExplorerTool[]).map((tool) => (
                <option key={tool} value={tool}>{toolLabels[tool]}</option>
              ))}
            </select>
          </label>

          <button type="button" className="dx-filter-reset" onClick={clearFilters}>Reset filters</button>
        </div>
      </section>

      <div className="dx-main-grid">
        <section className="dx-results-panel">
          <div className="dx-panel-header">
            <div>
              <h2>Discover</h2>
              <p>Ranked variables with coverage and compatibility at a glance.</p>
            </div>
            {(questionsLoading || categoriesLoading) && <Loader2 size={16} className="spin" />}
          </div>

          {questionsLoading ? (
            <div className="dx-loading">
              <Loader2 size={22} className="spin" />
              <span>Loading variables...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <EmptyState
              icon={<Brain size={28} />}
              title="No matching variables"
              description="Try broadening your search terms or clearing one of the filters."
              action={<button type="button" className="dx-filter-reset" onClick={clearFilters}>Clear filters</button>}
            />
          ) : (
            <div className="dx-results-list">
              {filteredQuestions.map((question) => {
                const quality = qualityBand(question.qualityScore);
                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`dx-result-card ${selectedQuestion?.id === question.id ? 'active' : ''}`}
                    onClick={() => setSelectedQuestionId(question.id)}
                  >
                    <div className="dx-result-head">
                      <h3>{question.name}</h3>
                      <span className={`dx-quality dx-quality--${quality}`}>Quality {question.qualityScore}</span>
                    </div>

                    <p className="dx-result-description">{question.description ?? 'No description provided.'}</p>

                    <div className="dx-result-meta">
                      <span>{question.category_name}</span>
                      <span>{questionTypeLabels[question.type]}</span>
                      <span>{question.datapoints.length} options</span>
                    </div>

                    <div className="dx-result-foot">
                      <span>{question.coverageLocationIds.length} markets</span>
                      <span>{question.wave_ids.length} waves</span>
                      <span>{formatCompactNumber(question.totalSampleSize)} sample</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <aside className="dx-detail-panel">
          {!selectedQuestion ? (
            <div className="dx-detail-empty">
              <EmptyState
                icon={<Tag size={28} />}
                title="Select a variable"
                description="Choose a variable from Discover to inspect coverage, quality, and usage actions."
              />
            </div>
          ) : (
            <>
              <div className="dx-panel-header">
                <div>
                  <h2>Understand</h2>
                  <p>Availability, quality, and context for confident use.</p>
                </div>
              </div>

              <div className="dx-selected-title">
                <h3>{selectedQuestion.name}</h3>
                <p>{selectedQuestion.description ?? 'No description provided for this variable.'}</p>
                <div className="dx-selected-meta">
                  <span>{selectedQuestion.category_name}</span>
                  <span>{questionTypeLabels[selectedQuestion.type]}</span>
                  <span>{selectedQuestion.datapoints.length} answer options</span>
                </div>
              </div>

              <div className="dx-coverage-grid">
                <article className="dx-coverage-card">
                  <label>Markets</label>
                  <strong>{selectedQuestion.coverageLocationIds.length}</strong>
                  <p>{coverageLocationNames.slice(0, 3).join(', ') || 'No market coverage metadata'}</p>
                </article>
                <article className="dx-coverage-card">
                  <label>Waves</label>
                  <strong>{selectedQuestion.wave_ids.length}</strong>
                  <p>{selectedQuestion.latestWave ? `${selectedQuestion.latestWave.name} (latest)` : 'Wave metadata unavailable'}</p>
                </article>
                <article className="dx-coverage-card">
                  <label>Sample footprint</label>
                  <strong>{formatCompactNumber(selectedQuestion.totalSampleSize)}</strong>
                  <p>{selectedQuestion.latestWave ? `Latest end date: ${formatDate(selectedQuestion.latestWave.end_date)}` : 'No wave date'}</p>
                </article>
              </div>

              <div className="dx-section">
                <h4>Compatibility matrix</h4>
                <div className="dx-tool-grid">
                  {(Object.keys(toolLabels) as ExplorerTool[]).map((tool) => {
                    const supported = selectedQuestion.supportedTools[tool];
                    return (
                      <div key={tool} className={`dx-tool-card ${supported ? 'supported' : 'unsupported'}`}>
                        <span>{toolLabels[tool]}</span>
                        <strong>{supported ? 'Supported' : 'Limited'}</strong>
                      </div>
                    );
                  })}
                </div>

                {compatibilityWarnings.length > 0 && (
                  <div className="dx-warnings">
                    {compatibilityWarnings.map((warning) => (
                      <div key={warning} className="dx-warning-row">
                        <AlertTriangle size={14} />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dx-section">
                <h4>Distribution preview</h4>
                <div className="dx-distribution-list">
                  {selectedDistribution.map((point) => (
                    <div key={point.id} className="dx-distribution-item">
                      <div className="dx-distribution-label">
                        <span>{point.name}</span>
                        <strong>{point.percent}%</strong>
                      </div>
                      <div className="dx-distribution-track">
                        <div className="dx-distribution-bar" style={{ width: `${point.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dx-section">
                <h4>Related variables</h4>
                <div className="dx-related-list">
                  {relatedQuestions.map((question) => (
                    <button
                      key={question.id}
                      type="button"
                      className="dx-related-chip"
                      onClick={() => setSelectedQuestionId(question.id)}
                    >
                      {question.name}
                    </button>
                  ))}
                  {relatedQuestions.length === 0 && (
                    <span className="dx-related-empty">No closely related variables found.</span>
                  )}
                </div>
              </div>

              <div className="dx-panel-header dx-panel-header--use">
                <div>
                  <h2>Use</h2>
                  <p>Send this variable into your next workflow.</p>
                </div>
              </div>

              <div className="dx-actions-grid">
                <button type="button" className="dx-action-btn" onClick={() => handleNavigateToTool('audience')}>
                  <Users size={14} />
                  Use in Audience
                </button>
                <button type="button" className="dx-action-btn" onClick={() => handleNavigateToTool('chart')}>
                  <BarChart3 size={14} />
                  Add to Chart
                </button>
                <button type="button" className="dx-action-btn" onClick={() => handleNavigateToTool('crosstab')}>
                  <Grid3X3 size={14} />
                  Add to Crosstab
                </button>
                <button type="button" className="dx-action-btn" onClick={() => handleNavigateToTool('spark')}>
                  <Sparkles size={14} />
                  Ask Spark
                </button>
              </div>

              <div className="dx-collections-box">
                <div className="dx-collections-head">
                  <h4>Saved collections</h4>
                  <span>{collections.length} collections</span>
                </div>

                <div className="dx-collections-controls">
                  <select value={activeCollectionId} onChange={(event) => setActiveCollectionId(event.target.value)}>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name} ({collection.questionIds.length})
                      </option>
                    ))}
                  </select>

                  <button type="button" className="dx-save-btn" onClick={handleToggleSaveToCollection}>
                    <BookOpen size={14} />
                    {isSelectedQuestionInActiveCollection ? 'Remove from collection' : 'Save to collection'}
                  </button>
                </div>

                {isSelectedQuestionSaved && !isSelectedQuestionInActiveCollection && (
                  <p className="dx-collection-note">This variable is already saved in another collection.</p>
                )}

                <div className="dx-new-collection">
                  <input
                    type="text"
                    value={newCollectionName}
                    placeholder="Create new collection"
                    onChange={(event) => setNewCollectionName(event.target.value)}
                  />
                  <button type="button" onClick={handleCreateCollection}>
                    <Plus size={13} />
                    Create
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
