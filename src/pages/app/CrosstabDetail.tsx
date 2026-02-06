import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Plus, ChevronDown } from 'lucide-react';
import './CrosstabDetail.css';

interface CrosstabDetailProps {
  isNew?: boolean;
}

interface CellColor {
  bg: string;
  color: string;
}

type CrosstabRow = [string, number, number, number, number, number, number];

const headers: string[] = ['', 'Male 18-24', 'Female 18-24', 'Male 25-34', 'Female 25-34', 'Male 35-44', 'Female 35-44'];
const rows: CrosstabRow[] = [
  ['Instagram', 78, 85, 72, 80, 58, 62],
  ['TikTok', 65, 71, 45, 52, 22, 28],
  ['Facebook', 45, 48, 62, 65, 72, 75],
  ['Twitter/X', 42, 38, 48, 44, 40, 36],
  ['YouTube', 82, 78, 76, 72, 65, 60],
  ['LinkedIn', 18, 15, 38, 32, 42, 38],
  ['Pinterest', 12, 28, 15, 35, 18, 38],
  ['Snapchat', 55, 62, 28, 32, 10, 14],
  ['Reddit', 32, 18, 35, 22, 28, 16],
  ['WhatsApp', 72, 75, 78, 80, 82, 85],
];

const audiences: string[] = ['All Adults 16+', 'Adults 18-34', 'Adults 25-54', 'Gen Z', 'Millennials'];
const dataSources: string[] = ['GWI Core', 'GWI Zeitgeist', 'GWI USA', 'GWI Work'];

function getCellColor(value: number): CellColor {
  if (value >= 75) return { bg: 'rgba(227, 28, 121, 0.12)', color: '#c9186a' };
  if (value >= 60) return { bg: 'rgba(227, 28, 121, 0.06)', color: '#E31C79' };
  if (value >= 40) return { bg: 'transparent', color: 'inherit' };
  if (value >= 20) return { bg: 'rgba(14, 165, 233, 0.06)', color: '#0284c7' };
  return { bg: 'rgba(14, 165, 233, 0.12)', color: '#0369a1' };
}

export default function CrosstabDetail({ isNew = false }: CrosstabDetailProps): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [crosstabName, setCrosstabName] = useState<string>(isNew ? '' : 'Social Media Usage by Demographics');
  const [showValues, setShowValues] = useState<string>('percentage');
  const [selectedAudience, setSelectedAudience] = useState<string>('All Adults 16+');
  const [selectedSource, setSelectedSource] = useState<string>('GWI Core');
  const [highlightHigh, setHighlightHigh] = useState<boolean>(true);

  return (
    <div className="crosstab-detail-page">
      <div className="crosstab-detail-header">
        <Link to="/app/crosstabs" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Crosstabs</span>
        </Link>
        <div className="header-actions">
          <button className="icon-btn"><Download size={18} /></button>
          <button className="icon-btn"><Share2 size={18} /></button>
          <button className="btn-primary">
            <Plus size={16} />
            <span>Add row</span>
          </button>
        </div>
      </div>

      <div className="crosstab-detail-content">
        <input
          type="text"
          className="crosstab-title-input"
          value={crosstabName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrosstabName(e.target.value)}
          placeholder="Untitled Crosstab"
        />

        <div className="crosstab-config-bar">
          <div className="crosstab-config-item">
            <label>Data Source</label>
            <select className="crosstab-config-select" value={selectedSource} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSource(e.target.value)}>
              {dataSources.map((ds: string) => <option key={ds} value={ds}>{ds}</option>)}
            </select>
          </div>
          <div className="crosstab-config-item">
            <label>Audience</label>
            <select className="crosstab-config-select" value={selectedAudience} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAudience(e.target.value)}>
              {audiences.map((a: string) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="crosstab-config-item">
            <label>Display</label>
            <select className="crosstab-config-select" value={showValues} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setShowValues(e.target.value)}>
              <option value="percentage">Percentage</option>
              <option value="index">Index</option>
            </select>
          </div>
          <div className="crosstab-config-item">
            <label className="crosstab-toggle-label">
              <input type="checkbox" checked={highlightHigh} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHighlightHigh(e.target.checked)} />
              <span>Color scale</span>
            </label>
          </div>
        </div>

        <div className="crosstab-table-container">
          <table className="crosstab-table">
            <thead>
              <tr>
                {headers.map((header: string, idx: number) => (
                  <th key={idx}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: CrosstabRow, rowIdx: number) => (
                <tr key={rowIdx}>
                  {row.map((cell: string | number, cellIdx: number) => {
                    if (cellIdx === 0) {
                      return <td key={cellIdx} className="row-header">{cell}</td>;
                    }
                    const numericCell = cell as number;
                    const displayVal = showValues === 'index' ? Math.round((numericCell / 50) * 100) : numericCell;
                    const suffix = showValues === 'index' ? '' : '%';
                    const style = highlightHigh ? getCellColor(numericCell) : ({} as Partial<CellColor>);
                    return (
                      <td key={cellIdx} style={{ backgroundColor: style.bg, color: style.color }}>
                        {displayVal}{suffix}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="crosstab-footer">
          <div className="crosstab-stats">
            <span className="crosstab-stat">Sample: <strong>743,219</strong></span>
            <span className="crosstab-stat">Wave: <strong>Q4 2024</strong></span>
            <span className="crosstab-stat">Source: <strong>{selectedSource}</strong></span>
          </div>
          {highlightHigh && (
            <div className="crosstab-color-legend">
              <span className="color-legend-label">Low</span>
              <div className="color-legend-bar" />
              <span className="color-legend-label">High</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
