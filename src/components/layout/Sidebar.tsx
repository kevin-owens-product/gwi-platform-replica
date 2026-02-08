import { NavLink } from 'react-router-dom'
import {
  Search, Home, Sparkles, Users, BarChart2, Grid3X3,
  LayoutDashboard, Square, FileText, HelpCircle,
  Settings, LogOut, ChevronDown, ChevronUp, MessageCircle,
  Tv, Newspaper, BookOpen, type LucideIcon,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import GlobalSearch from '../search/GlobalSearch'
import './Sidebar.css'

interface NavItem {
  path: string
  icon: LucideIcon
  label: string
  exact?: boolean
}

const navItems: NavItem[] = [
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
  { path: '/app/questions', icon: BookOpen, label: 'Questions' },
]

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [helpOpen, setHelpOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { searchOpen, setSearchOpen } = useUIStore()

  const helpRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const userName = user?.name || 'User'
  const userOrg = user?.organization_name || 'Organization'

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
        <div className="sidebar-section" ref={helpRef}>
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
              <a href="https://help.globalwebindex.com" target="_blank" rel="noopener noreferrer" className="sidebar-dropdown-item">
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
        <div className="sidebar-section" ref={userRef}>
          <button
            className="sidebar-dropdown-btn user-btn"
            onClick={() => setUserOpen(!userOpen)}
          >
            <div className="user-avatar">
              {userName.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-org">{userOrg}</span>
            </div>
            {userOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {userOpen && (
            <div className="sidebar-dropdown-menu">
              <NavLink to="/app/account-settings" className="sidebar-dropdown-item">
                <Settings size={16} />
                <span>Account settings</span>
              </NavLink>
              <button className="sidebar-dropdown-item logout" onClick={logout}>
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
  )
}
