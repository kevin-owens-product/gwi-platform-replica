import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Plus, BarChart2, PieChart, TrendingUp } from 'lucide-react';
import './DashboardDetail.css';

export default function DashboardDetail() {
  const { id } = useParams();

  const widgets = [
    { id: 1, title: 'Total Reach', value: '2.4M', change: '+12%', icon: TrendingUp },
    { id: 2, title: 'Engagement Rate', value: '4.8%', change: '+0.5%', icon: BarChart2 },
    { id: 3, title: 'Brand Awareness', value: '68%', change: '+3%', icon: PieChart },
  ];

  return (
    <div className="dashboard-detail-page">
      <div className="dashboard-detail-header">
        <Link to="/app/dashboards" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Dashboards</span>
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
            <span>Add widget</span>
          </button>
        </div>
      </div>

      <div className="dashboard-detail-content">
        <h1 className="dashboard-title">Q4 Performance Overview</h1>

        <div className="widgets-grid">
          {widgets.map((widget) => (
            <div key={widget.id} className="widget-card">
              <div className="widget-header">
                <widget.icon size={20} className="widget-icon" />
                <span className="widget-title">{widget.title}</span>
              </div>
              <div className="widget-value">{widget.value}</div>
              <div className="widget-change positive">{widget.change}</div>
            </div>
          ))}
        </div>

        <div className="chart-widgets">
          <div className="large-widget">
            <h3>Trend Over Time</h3>
            <div className="widget-placeholder">
              <TrendingUp size={48} />
              <p>Chart visualization</p>
            </div>
          </div>
          <div className="large-widget">
            <h3>Audience Breakdown</h3>
            <div className="widget-placeholder">
              <PieChart size={48} />
              <p>Chart visualization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
