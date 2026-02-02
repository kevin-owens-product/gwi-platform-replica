import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Plus } from 'lucide-react';
import './CrosstabDetail.css';

export default function CrosstabDetail({ isNew = false }) {
  const { id } = useParams();

  const sampleData = [
    ['', 'Male 18-24', 'Female 18-24', 'Male 25-34', 'Female 25-34'],
    ['Instagram', '78%', '85%', '72%', '80%'],
    ['TikTok', '65%', '71%', '45%', '52%'],
    ['Facebook', '45%', '48%', '62%', '65%'],
    ['Twitter/X', '42%', '38%', '48%', '44%'],
  ];

  return (
    <div className="crosstab-detail-page">
      <div className="crosstab-detail-header">
        <Link to="/app/crosstabs" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Crosstabs</span>
        </Link>
        <div className="header-actions">
          <button className="icon-btn">
            <Download size={18} />
          </button>
          <button className="icon-btn">
            <Share2 size={18} />
          </button>
          <button className="btn-primary">
            <Plus size={16} />
            <span>Add row</span>
          </button>
        </div>
      </div>

      <div className="crosstab-detail-content">
        <h1 className="crosstab-title">
          {isNew ? 'New Crosstab' : 'Demographics Overview'}
        </h1>

        <div className="crosstab-table-container">
          <table className="crosstab-table">
            <thead>
              <tr>
                {sampleData[0].map((header, idx) => (
                  <th key={idx}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.slice(1).map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className={cellIdx === 0 ? 'row-header' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
