import { NavLink, useLocation } from 'react-router-dom';
import {
  Search, Home, Sparkles, Users, BarChart2, Grid3X3,
  LayoutDashboard, Square, FileText, HelpCircle,
  Settings, LogOut, ChevronDown, ChevronUp, MessageCircle,
  Tv, Newspaper
} from 'lucide-react';
import { useState } from 'react';
import GlobalSearch from '../search/GlobalSearch';
import './Sidebar.css';

const navItems = [
  { path: '/app', icon: Home, label: 'Home', exact: true },
  { path: '/app/agent-spark', icon: Sparkles, label: 'Agent Spark' },
  { path: '/app/audiences', icon: Users, label: 'Audiences' },
  { path: '/app/chart-builder', icon: BarChart2, label: 'Charts' },
  { path: '/app/crosstabs', icon: Grid3X3, label: 'Crosstabs' },
  { path: '/app/dashboards', icon: LayoutDashboard, label: 'Dashboards' },
  { path: '/app/canvas', icon: Square, label: 'Canvas' },
  { path: '/app/reports', icon: FileText, label: 'Reports' },
  { path: '/app/tv-study', icon: Tv, label: 'TV Study' },
  { path: '/app/printrf', icon: Newspaper, label: 'Print R&F' },
];

export default function Sidebar({ user = { name: 'Kevin Owens', org: 'GWI Internal' } }) {
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-text">GWI</span>
          <span className="logo-dot">.</span>
        </div>
        <button className="sidebar-search-btn" onClick={() => setSearchOpen(true)}>
          <Search size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Help Section */}
        <div className="sidebar-section">
          <button
            className="sidebar-dropdown-btn"
            onClick={() => setHelpOpen(!helpOpen)}
          >
            <HelpCircle size={18} />
            <span>Help</span>
            {helpOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {helpOpen && (
            <div className="sidebar-dropdown-menu">
              <a href="#" className="sidebar-dropdown-item">
                <FileText size={16} />
                <span>Help center</span>
              </a>
              <a href="#" className="sidebar-dropdown-item highlight">
                <MessageCircle size={16} />
                <span>Live chat</span>
              </a>
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="sidebar-section">
          <button
            className="sidebar-dropdown-btn user-btn"
            onClick={() => setUserOpen(!userOpen)}
          >
            <div className="user-avatar">
              {user.name.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-org">{user.org}</span>
            </div>
            {userOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {userOpen && (
            <div className="sidebar-dropdown-menu">
              <NavLink to="/app/account-settings" className="sidebar-dropdown-item">
                <Settings size={16} />
                <span>Account settings</span>
              </NavLink>
              <button className="sidebar-dropdown-item logout">
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <GlobalSearch onClose={() => setSearchOpen(false)} />
      )}
    </aside>
  );
}
