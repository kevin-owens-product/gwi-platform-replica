import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronRight, Check } from 'lucide-react';
import './Questions.css';

interface Category {
  name: string;
  subcategories: string[];
}

interface Question {
  id: number;
  text: string;
  category: string;
  subcategory: string;
  type: string;
  respondents: number;
}

const categories: Category[] = [
  {
    name: 'Demographics',
    subcategories: ['Age', 'Gender', 'Income', 'Education', 'Location'],
  },
  {
    name: 'Media Consumption',
    subcategories: ['Social Media', 'TV & Streaming', 'Print Media', 'Radio & Podcasts'],
  },
  {
    name: 'Brand Perceptions',
    subcategories: ['Brand Awareness', 'Brand Usage', 'Brand Loyalty'],
  },
  {
    name: 'Purchase Journey',
    subcategories: ['Discovery', 'Consideration', 'Purchase', 'Advocacy'],
  },
  {
    name: 'Attitudes & Lifestyle',
    subcategories: ['Health & Wellness', 'Sustainability', 'Finance', 'Entertainment'],
  },
  {
    name: 'Technology',
    subcategories: ['Devices', 'Apps & Services', 'Gaming', 'Smart Home'],
  },
];

const datasets: string[] = ['GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Kids', 'GWI Work'];

const sampleQuestions: Question[] = [
  { id: 1, text: 'What is your age?', category: 'Demographics', subcategory: 'Age', type: 'Single-select', respondents: 743219 },
  { id: 2, text: 'Which gender do you most identify with?', category: 'Demographics', subcategory: 'Gender', type: 'Single-select', respondents: 743219 },
  { id: 3, text: 'What is your annual household income?', category: 'Demographics', subcategory: 'Income', type: 'Single-select', respondents: 698412 },
  { id: 4, text: 'Which social media platforms have you used in the past month?', category: 'Media Consumption', subcategory: 'Social Media', type: 'Multi-select', respondents: 721530 },
  { id: 5, text: 'How much time do you spend watching online TV/streaming per day?', category: 'Media Consumption', subcategory: 'TV & Streaming', type: 'Scale', respondents: 710284 },
  { id: 6, text: 'Which brands have you purchased from in the last 3 months?', category: 'Brand Perceptions', subcategory: 'Brand Usage', type: 'Multi-select', respondents: 685920 },
  { id: 7, text: 'How likely are you to recommend your preferred brand to others?', category: 'Brand Perceptions', subcategory: 'Brand Loyalty', type: 'Scale', respondents: 652113 },
  { id: 8, text: 'Where do you typically discover new products?', category: 'Purchase Journey', subcategory: 'Discovery', type: 'Multi-select', respondents: 705832 },
  { id: 9, text: 'How important is environmental sustainability in purchase decisions?', category: 'Attitudes & Lifestyle', subcategory: 'Sustainability', type: 'Scale', respondents: 698412 },
  { id: 10, text: 'Which devices do you use to access the internet?', category: 'Technology', subcategory: 'Devices', type: 'Multi-select', respondents: 738901 },
];

export default function Questions(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<string>('GWI Core');
  const [datasetOpen, setDatasetOpen] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ Demographics: true });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  const toggleCategory = (name: string): void => {
    setExpandedCategories((prev: Record<string, boolean>) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCategoryClick = (catName: string): void => {
    setActiveCategory(catName);
    setActiveSubcategory(null);
  };

  const handleSubcategoryClick = (catName: string, subName: string): void => {
    setActiveCategory(catName);
    setActiveSubcategory(subName);
  };

  const toggleQuestion = (id: number): void => {
    setSelectedQuestions((prev: number[]) =>
      prev.includes(id) ? prev.filter((q: number) => q !== id) : [...prev, id]
    );
  };

  const filteredQuestions: Question[] = sampleQuestions.filter((q: Question) => {
    const matchesSearch = !searchQuery || q.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || q.category === activeCategory;
    const matchesSub = !activeSubcategory || q.subcategory === activeSubcategory;
    return matchesSearch && matchesCategory && matchesSub;
  });

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1 className="page-title">Questions</h1>
        <div className="questions-dataset-wrapper">
          <button
            className="questions-dataset-btn"
            onClick={() => setDatasetOpen(!datasetOpen)}
          >
            <span>{selectedDataset}</span>
            <ChevronDown size={16} />
          </button>
          {datasetOpen && (
            <div className="questions-dataset-dropdown">
              {datasets.map((d: string) => (
                <button
                  key={d}
                  className={`questions-dataset-option ${d === selectedDataset ? 'selected' : ''}`}
                  onClick={() => { setSelectedDataset(d); setDatasetOpen(false); }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="questions-content">
        <aside className="questions-sidebar">
          <div className="questions-sidebar-header">Categories</div>
          <div className="questions-category-tree">
            {categories.map((cat: Category) => (
              <div key={cat.name} className="questions-category">
                <button
                  className={`questions-category-btn ${activeCategory === cat.name && !activeSubcategory ? 'active' : ''}`}
                  onClick={() => { toggleCategory(cat.name); handleCategoryClick(cat.name); }}
                >
                  {expandedCategories[cat.name] ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  <span>{cat.name}</span>
                </button>
                {expandedCategories[cat.name] && (
                  <div className="questions-subcategories">
                    {cat.subcategories.map((sub: string) => (
                      <button
                        key={sub}
                        className={`questions-subcategory-btn ${activeCategory === cat.name && activeSubcategory === sub ? 'active' : ''}`}
                        onClick={() => handleSubcategoryClick(cat.name, sub)}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            className="questions-clear-btn"
            onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }}
          >
            Show all
          </button>
        </aside>

        <div className="questions-list-panel">
          <div className="questions-search-bar">
            <Search size={16} className="questions-search-icon" />
            <input
              type="text"
              className="questions-search-input"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="questions-list">
            {filteredQuestions.map((q: Question) => (
              <div
                key={q.id}
                className={`questions-item ${selectedQuestions.includes(q.id) ? 'selected' : ''}`}
                onClick={() => toggleQuestion(q.id)}
              >
                <div className={`questions-checkbox ${selectedQuestions.includes(q.id) ? 'checked' : ''}`}>
                  {selectedQuestions.includes(q.id) && <Check size={12} />}
                </div>
                <div className="questions-item-content">
                  <div className="questions-item-text">{q.text}</div>
                  <div className="questions-item-meta">
                    <span className="questions-item-type">{q.type}</span>
                    <span className="questions-item-respondents">{q.respondents.toLocaleString()} respondents</span>
                  </div>
                </div>
                <span className="questions-item-category">{q.subcategory}</span>
              </div>
            ))}
            {filteredQuestions.length === 0 && (
              <div className="questions-empty">No questions match your filters</div>
            )}
          </div>
        </div>
      </div>

      {selectedQuestions.length > 0 && (
        <div className="questions-action-bar">
          <span className="questions-action-count">{selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected</span>
          <button
            className="questions-action-btn"
            onClick={() => navigate('/app/chart-builder/chart/new')}
          >
            Add {selectedQuestions.length} to chart
          </button>
        </div>
      )}
    </div>
  );
}
