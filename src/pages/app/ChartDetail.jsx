import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, MoreHorizontal, BarChart2 } from 'lucide-react';
import './ChartDetail.css';

export default function ChartDetail() {
  const { id } = useParams();

  return (
    <div className="chart-detail-page">
      <div className="chart-detail-header">
        <Link to="/app/chart-builder" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Charts</span>
        </Link>
        <div className="header-actions">
          <button className="icon-btn">
            <Download size={18} />
          </button>
          <button className="icon-btn">
            <Share2 size={18} />
          </button>
          <button className="icon-btn">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="chart-detail-content">
        <div className="chart-title-section">
          <h1>Social Media Usage by Age</h1>
          <p className="chart-subtitle">Last updated 2 hours ago</p>
        </div>

        <div className="chart-canvas">
          <div className="chart-placeholder">
            <BarChart2 size={64} />
            <p>Chart visualization would render here</p>
          </div>
        </div>

        <div className="chart-config-panel">
          <h3>Chart Configuration</h3>
          <div className="config-options">
            <div className="config-group">
              <label>Chart Type</label>
              <select className="config-select">
                <option>Bar Chart</option>
                <option>Line Chart</option>
                <option>Pie Chart</option>
              </select>
            </div>
            <div className="config-group">
              <label>Data Source</label>
              <select className="config-select">
                <option>GWI Core</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
