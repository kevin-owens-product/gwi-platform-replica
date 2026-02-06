import { useState, useMemo } from 'react';
import { ChevronDown, Play, Plus, Trash2, Loader2 } from 'lucide-react';
import { useLocations } from '@/hooks/useTaxonomy';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button, Input } from '@/components/shared';
import type { Location } from '@/api/types';
import './PrintRF.css';

interface Publication {
  name: string;
  type: string;
  circulation: string;
}

interface InsertionRow {
  publication: string;
  insertions: number;
  period: string;
}

interface ResultItem {
  label: string;
  value: string;
}

const fallbackPublications: Publication[] = [
  { name: 'The Times', type: 'Daily Newspaper', circulation: '365,880' },
  { name: 'The Guardian', type: 'Daily Newspaper', circulation: '105,134' },
  { name: 'Daily Mail', type: 'Daily Newspaper', circulation: '1,134,184' },
  { name: 'The Sunday Times', type: 'Sunday Newspaper', circulation: '647,622' },
  { name: 'Financial Times', type: 'Daily Newspaper', circulation: '162,472' },
  { name: 'Vogue UK', type: 'Monthly Magazine', circulation: '186,519' },
  { name: 'GQ', type: 'Monthly Magazine', circulation: '108,234' },
  { name: 'The Economist', type: 'Weekly Magazine', circulation: '208,128' },
  { name: 'Time Out', type: 'Weekly Magazine', circulation: '305,741' },
  { name: 'Cosmopolitan', type: 'Monthly Magazine', circulation: '390,128' },
];

const audiences: string[] = [
  'Adults 16-64', 'Adults 18-34', 'Adults 25-54', 'Adults 35-64', 'All Adults 16+',
];

const fallbackMarkets: string[] = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain',
  'Italy', 'Australia', 'Japan', 'Brazil', 'Canada',
];

const periods: string[] = ['Daily', 'Weekly', 'Monthly'];

export default function PrintRF(): React.JSX.Element {
  // API hooks
  const { data: apiLocations, isLoading: locationsLoading } = useLocations();
  const { selectedLocationIds } = useWorkspaceStore();

  // Derive market names from API locations, falling back to hardcoded list
  const marketNames = useMemo(() => {
    if (apiLocations && apiLocations.length > 0) {
      return apiLocations.map((loc: Location) => loc.name);
    }
    return fallbackMarkets;
  }, [apiLocations]);

  // Publications remain client-side (print-specific, not in taxonomy API)
  const publications = fallbackPublications;

  const [selectedPublications, setSelectedPublications] = useState<string[]>(['The Times', 'Vogue UK']);
  const [pubsOpen, setPubsOpen] = useState<boolean>(false);
  const [selectedAudience, setSelectedAudience] = useState<string>('Adults 16-64');
  const [audienceOpen, setAudienceOpen] = useState<boolean>(false);
  const [selectedMarket, setSelectedMarket] = useState<string>(
    selectedLocationIds.length > 0 ? selectedLocationIds[0] : 'United Kingdom'
  );
  const [marketOpen, setMarketOpen] = useState<boolean>(false);
  const [insertionRows, setInsertionRows] = useState<InsertionRow[]>([
    { publication: 'The Times', insertions: 3, period: 'Weekly' },
    { publication: 'Vogue UK', insertions: 1, period: 'Monthly' },
  ]);
  const [showResults, setShowResults] = useState<boolean>(false);

  const togglePublication = (name: string): void => {
    setSelectedPublications((prev: string[]) =>
      prev.includes(name) ? prev.filter((p: string) => p !== name) : [...prev, name]
    );
  };

  const addRow = (): void => {
    setInsertionRows((prev: InsertionRow[]) => [
      ...prev,
      { publication: publications[0].name, insertions: 1, period: 'Weekly' },
    ]);
  };

  const removeRow = (idx: number): void => {
    setInsertionRows((prev: InsertionRow[]) => prev.filter((_: InsertionRow, i: number) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof InsertionRow, value: string): void => {
    setInsertionRows((prev: InsertionRow[]) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: field === 'insertions' ? Math.max(1, parseInt(value) || 1) : value };
      return next;
    });
  };

  const results: ResultItem[] = [
    { label: 'Universe', value: '42,318,000' },
    { label: 'Sample Size', value: '8,421' },
    { label: 'Reach', value: '12,695,400' },
    { label: 'Avg Frequency', value: '3.2' },
    { label: 'Reach %', value: '30.0%' },
    { label: 'OTS', value: '40,625,280' },
    { label: 'Coverage Index', value: '118' },
  ];

  return (
    <div className="printrf-page">
      <div className="printrf-header">
        <h1 className="page-title">Print Reach & Frequency</h1>
        {locationsLoading && (
          <div className="printrf-loading-indicator">
            <Loader2 size={16} className="printrf-spinner" />
            <span>Loading data...</span>
          </div>
        )}
      </div>

      <div className="printrf-content">
        <div className="printrf-config">
          <div className="printrf-config-grid">
            {/* Publications */}
            <div className="printrf-field printrf-field-full">
              <label className="printrf-label">Publications</label>
              <div className="printrf-multiselect-wrapper">
                <button className="printrf-select-btn" onClick={() => setPubsOpen(!pubsOpen)}>
                  <span>{selectedPublications.length} publication{selectedPublications.length !== 1 ? 's' : ''} selected</span>
                  <ChevronDown size={16} />
                </button>
                {pubsOpen && (
                  <div className="printrf-dropdown printrf-dropdown-wide">
                    {publications.map((pub: Publication) => (
                      <label key={pub.name} className="printrf-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedPublications.includes(pub.name)}
                          onChange={() => togglePublication(pub.name)}
                        />
                        <div className="printrf-pub-info">
                          <span className="printrf-pub-name">{pub.name}</span>
                          <span className="printrf-pub-meta">{pub.type} &middot; Circ: {pub.circulation}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audience */}
            <div className="printrf-field">
              <label className="printrf-label">Audience</label>
              <div className="printrf-select-wrapper">
                <button className="printrf-select-btn" onClick={() => setAudienceOpen(!audienceOpen)}>
                  <span>{selectedAudience}</span>
                  <ChevronDown size={16} />
                </button>
                {audienceOpen && (
                  <div className="printrf-dropdown">
                    {audiences.map((a: string) => (
                      <button
                        key={a}
                        className={`printrf-dropdown-item ${a === selectedAudience ? 'selected' : ''}`}
                        onClick={() => { setSelectedAudience(a); setAudienceOpen(false); }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Market - populated from API locations */}
            <div className="printrf-field">
              <label className="printrf-label">Market</label>
              <div className="printrf-select-wrapper">
                <button className="printrf-select-btn" onClick={() => setMarketOpen(!marketOpen)}>
                  <span>{selectedMarket}</span>
                  <ChevronDown size={16} />
                </button>
                {marketOpen && (
                  <div className="printrf-dropdown">
                    {locationsLoading && (
                      <div className="printrf-dropdown-loading">
                        <Loader2 size={14} className="printrf-spinner" />
                        <span>Loading markets...</span>
                      </div>
                    )}
                    {marketNames.map((m: string) => (
                      <button
                        key={m}
                        className={`printrf-dropdown-item ${m === selectedMarket ? 'selected' : ''}`}
                        onClick={() => { setSelectedMarket(m); setMarketOpen(false); }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insertion Schedule */}
          <div className="printrf-insertions">
            <h3 className="printrf-section-title">Insertion Schedule</h3>
            <table className="printrf-insertion-table">
              <thead>
                <tr>
                  <th>Publication</th>
                  <th>Insertions</th>
                  <th>Period</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {insertionRows.map((row: InsertionRow, idx: number) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="printrf-table-select"
                        value={row.publication}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRow(idx, 'publication', e.target.value)}
                      >
                        {publications.map((pub: Publication) => (
                          <option key={pub.name} value={pub.name}>{pub.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Input
                        type="number"
                        className="printrf-table-input"
                        value={row.insertions}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRow(idx, 'insertions', e.target.value)}
                        min={1}
                      />
                    </td>
                    <td>
                      <select
                        className="printrf-table-select printrf-table-select-sm"
                        value={row.period}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRow(idx, 'period', e.target.value)}
                      >
                        {periods.map((p: string) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="printrf-remove-btn"
                        onClick={() => removeRow(idx)}
                        disabled={insertionRows.length <= 1}
                        icon={<Trash2 size={14} />}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              variant="ghost"
              size="sm"
              className="printrf-add-row-btn"
              onClick={addRow}
              icon={<Plus size={14} />}
            >
              Add row
            </Button>
          </div>

          <div className="printrf-actions">
            <Button
              variant="primary"
              icon={<Play size={16} />}
              className="printrf-run-btn"
              onClick={() => setShowResults(true)}
              disabled={insertionRows.length === 0}
            >
              Run Analysis
            </Button>
          </div>
        </div>

        {showResults && (
          <div className="printrf-results">
            <h3 className="printrf-section-title">Results</h3>
            <div className="printrf-results-grid">
              {results.map((r: ResultItem) => (
                <div key={r.label} className="printrf-result-card">
                  <div className="printrf-result-label">{r.label}</div>
                  <div className="printrf-result-value">{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
