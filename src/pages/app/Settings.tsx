import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Shield, Building2, Save, Users, BarChart2, Settings2, Loader2,
  ScrollText, Keyboard, Mail, Bell, Palette, Globe, Clock,
  Plus, FileText, BarChart3, Table2, LayoutDashboard, Trash2,
  Eye, Edit3, Download, LogIn, UserPlus,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useProfile } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/api';
import { Tabs, Button, Input, Badge, DataTable } from '@/components/shared';
import type { Column } from '@/components/shared';
import UserManagement from '@/components/admin/UserManagement';
import UsageStats from '@/components/admin/UsageStats';
import ChartRenderer from '@/components/chart/ChartRenderer';
import type { User as UserType } from '@/api/types';
import { formatDate, formatRelativeDate } from '@/utils/format';
import './Settings.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileFormData {
  name: string;
  email: string;
  organization_name: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: string;
  entityName: string;
  details: string;
}

interface KeyboardShortcut {
  id: string;
  category: string;
  keys: string;
  description: string;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  queries: number;
  lastActive: string;
}

// ---------------------------------------------------------------------------
// Tabs config
// ---------------------------------------------------------------------------

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'team', label: 'Team', icon: <Users size={16} /> },
  { id: 'usage', label: 'Usage', icon: <BarChart2 size={16} /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings2 size={16} /> },
  { id: 'audit-log', label: 'Audit Log', icon: <ScrollText size={16} /> },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard size={16} /> },
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockAuditLog: AuditLogEntry[] = [
  { id: 'al-1', timestamp: '2026-02-08T14:32:00Z', user: 'Sarah Chen', action: 'created', entityType: 'chart', entityName: 'Q4 Social Trends', details: 'Created bar chart with 3 series' },
  { id: 'al-2', timestamp: '2026-02-08T11:15:00Z', user: 'James Park', action: 'edited', entityType: 'dashboard', entityName: 'Brand Health Overview', details: 'Added 2 new widgets' },
  { id: 'al-3', timestamp: '2026-02-07T16:45:00Z', user: 'Sarah Chen', action: 'deleted', entityType: 'audience', entityName: 'Test Audience Draft', details: 'Permanently deleted' },
  { id: 'al-4', timestamp: '2026-02-07T09:20:00Z', user: 'Alex Rivera', action: 'exported', entityType: 'report', entityName: 'Monthly Insights Jan 2026', details: 'Exported as PDF' },
  { id: 'al-5', timestamp: '2026-02-06T15:00:00Z', user: 'James Park', action: 'created', entityType: 'crosstab', entityName: 'Gen Z vs Millennials Media', details: 'Cross-tab with 4 questions' },
  { id: 'al-6', timestamp: '2026-02-06T10:30:00Z', user: 'Sarah Chen', action: 'viewed', entityType: 'chart', entityName: 'Streaming Platform Comparison', details: 'Viewed chart details' },
  { id: 'al-7', timestamp: '2026-02-05T13:10:00Z', user: 'Alex Rivera', action: 'created', entityType: 'audience', entityName: 'Fitness Enthusiasts 18-34', details: 'Created from crosstab selection' },
  { id: 'al-8', timestamp: '2026-02-05T08:45:00Z', user: 'James Park', action: 'login', entityType: 'system', entityName: 'Authentication', details: 'Logged in from Chrome/macOS' },
  { id: 'al-9', timestamp: '2026-02-04T17:20:00Z', user: 'Sarah Chen', action: 'invited', entityType: 'user', entityName: 'maria.gonzalez@example.com', details: 'Invited as analyst' },
  { id: 'al-10', timestamp: '2026-02-04T14:00:00Z', user: 'Alex Rivera', action: 'edited', entityType: 'chart', entityName: 'Social Media Usage Trends', details: 'Changed chart type to area' },
];

const mockShortcuts: KeyboardShortcut[] = [
  // Navigation
  { id: 'sc-1', category: 'Navigation', keys: 'Cmd+K', description: 'Open global search' },
  { id: 'sc-2', category: 'Navigation', keys: 'Cmd+/', description: 'Show keyboard shortcuts' },
  { id: 'sc-3', category: 'Navigation', keys: 'G then H', description: 'Go to Home' },
  { id: 'sc-4', category: 'Navigation', keys: 'G then D', description: 'Go to Dashboards' },
  { id: 'sc-5', category: 'Navigation', keys: 'G then A', description: 'Go to Audiences' },
  { id: 'sc-6', category: 'Navigation', keys: 'G then S', description: 'Go to Settings' },
  // Editing
  { id: 'sc-7', category: 'Editing', keys: 'Cmd+N', description: 'Create new item' },
  { id: 'sc-8', category: 'Editing', keys: 'Cmd+S', description: 'Save current work' },
  { id: 'sc-9', category: 'Editing', keys: 'Cmd+Z', description: 'Undo last action' },
  { id: 'sc-10', category: 'Editing', keys: 'Cmd+Shift+Z', description: 'Redo last action' },
  { id: 'sc-11', category: 'Editing', keys: 'Cmd+D', description: 'Duplicate selected item' },
  { id: 'sc-12', category: 'Editing', keys: 'Delete', description: 'Delete selected item' },
  // Chart
  { id: 'sc-13', category: 'Chart', keys: 'Cmd+E', description: 'Export chart as image' },
  { id: 'sc-14', category: 'Chart', keys: 'T', description: 'Toggle chart type picker' },
  { id: 'sc-15', category: 'Chart', keys: 'L', description: 'Toggle legend visibility' },
  { id: 'sc-16', category: 'Chart', keys: 'G', description: 'Toggle grid lines' },
  // Crosstab
  { id: 'sc-17', category: 'Crosstab', keys: 'Cmd+Enter', description: 'Run crosstab query' },
  { id: 'sc-18', category: 'Crosstab', keys: 'Cmd+Shift+E', description: 'Export crosstab data' },
  { id: 'sc-19', category: 'Crosstab', keys: 'R', description: 'Toggle row percentages' },
  { id: 'sc-20', category: 'Crosstab', keys: 'C', description: 'Toggle column percentages' },
];

const mockUsageChartData = [
  { name: 'Mon', Queries: 245 },
  { name: 'Tue', Queries: 312 },
  { name: 'Wed', Queries: 287 },
  { name: 'Thu', Queries: 395 },
  { name: 'Fri', Queries: 420 },
  { name: 'Sat', Queries: 150 },
  { name: 'Sun', Queries: 98 },
];

const mockTopUsers: TopUser[] = [
  { id: 'tu-1', name: 'Sarah Chen', email: 'sarah.chen@example.com', queries: 1284, lastActive: '2026-02-08T14:32:00Z' },
  { id: 'tu-2', name: 'James Park', email: 'james.park@example.com', queries: 956, lastActive: '2026-02-08T11:15:00Z' },
  { id: 'tu-3', name: 'Alex Rivera', email: 'alex.rivera@example.com', queries: 743, lastActive: '2026-02-07T16:45:00Z' },
  { id: 'tu-4', name: 'Maria Gonzalez', email: 'maria.gonzalez@example.com', queries: 612, lastActive: '2026-02-06T10:30:00Z' },
  { id: 'tu-5', name: 'David Kim', email: 'david.kim@example.com', queries: 487, lastActive: '2026-02-05T08:45:00Z' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const actionIconMap: Record<string, React.ReactNode> = {
  created: <Plus size={14} />,
  edited: <Edit3 size={14} />,
  deleted: <Trash2 size={14} />,
  exported: <Download size={14} />,
  viewed: <Eye size={14} />,
  login: <LogIn size={14} />,
  invited: <UserPlus size={14} />,
};

const actionBadgeVariant: Record<string, 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  created: 'success',
  edited: 'info',
  deleted: 'danger',
  exported: 'primary',
  viewed: 'default',
  login: 'default',
  invited: 'warning',
};

const entityIconMap: Record<string, React.ReactNode> = {
  chart: <BarChart3 size={14} />,
  dashboard: <LayoutDashboard size={14} />,
  audience: <Users size={14} />,
  report: <FileText size={14} />,
  crosstab: <Table2 size={14} />,
  system: <Settings2 size={14} />,
  user: <User size={14} />,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Settings(): React.JSX.Element {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(tab || 'profile');

  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { user: storeUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Merge profile API data with store data; prefer API, fall back to store, then defaults
  const currentUser: Partial<UserType> = profile ?? storeUser ?? {};

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    organization_name: '',
  });

  const [preferences, setPreferences] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    locale: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultWave: 'Q4 2025',
    defaultLocation: 'Global',
    chartPalette: 'default' as 'default' | 'colorblind' | 'high-contrast' | 'monochrome',
    keyboardShortcuts: true,
    notifyEmail: true,
    notifyInApp: true,
  });

  // Audit log filters
  const [auditActionFilter, setAuditActionFilter] = useState<string>('');
  const [auditEntityFilter, setAuditEntityFilter] = useState<string>('');

  // Sync form data when profile loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        organization_name: currentUser.organization_name || '',
      });
      if (currentUser.preferences) {
        setPreferences((prev) => ({
          ...prev,
          theme: currentUser.preferences?.theme || prev.theme,
          locale: currentUser.preferences?.locale || prev.locale,
          timezone: currentUser.preferences?.timezone || prev.timezone,
        }));
      }
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.email, currentUser?.organization_name]);

  // Sync active tab when URL param changes
  useEffect(() => {
    if (tab && settingsTabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/app/account-settings/${tabId}`, { replace: true });
  };

  // Profile update mutation
  const updateProfile = useMutation({
    mutationFn: (data: Partial<UserType>) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      useAuthStore.getState().setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  // Preferences update mutation
  const updatePreferences = useMutation({
    mutationFn: (data: Partial<UserType>) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      useAuthStore.getState().setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Preferences saved');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name: formData.name,
      email: formData.email,
    });
  };

  const handleSavePreferences = () => {
    updatePreferences.mutate({
      preferences: {
        theme: preferences.theme === 'system' ? 'light' : preferences.theme,
        locale: preferences.locale,
        timezone: preferences.timezone,
      },
    });
  };

  // Filtered audit log
  const filteredAuditLog = mockAuditLog.filter((entry) => {
    if (auditActionFilter && entry.action !== auditActionFilter) return false;
    if (auditEntityFilter && entry.entityType !== auditEntityFilter) return false;
    return true;
  });

  // Grouped shortcuts
  const shortcutCategories = Array.from(new Set(mockShortcuts.map((s) => s.category)));

  // Audit log columns
  const auditColumns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      width: '160px',
      render: (entry) => (
        <span className="settings-audit-time" title={entry.timestamp}>
          <Clock size={13} />
          {formatRelativeDate(entry.timestamp)}
        </span>
      ),
    },
    { key: 'user', header: 'User', sortable: true },
    {
      key: 'action',
      header: 'Action',
      render: (entry) => (
        <Badge variant={actionBadgeVariant[entry.action] || 'default'}>
          <span className="settings-audit-action-inner">
            {actionIconMap[entry.action]}
            {entry.action}
          </span>
        </Badge>
      ),
    },
    {
      key: 'entityType',
      header: 'Entity Type',
      render: (entry) => (
        <span className="settings-audit-entity">
          {entityIconMap[entry.entityType]}
          {entry.entityType}
        </span>
      ),
    },
    { key: 'entityName', header: 'Entity Name', sortable: true },
    {
      key: 'details',
      header: 'Details',
      render: (entry) => (
        <span className="settings-audit-details">{entry.details}</span>
      ),
    },
  ];

  // Top users columns
  const topUserColumns: Column<TopUser>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    {
      key: 'queries',
      header: 'Queries',
      sortable: true,
      render: (u) => <strong>{u.queries.toLocaleString()}</strong>,
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (u) => formatRelativeDate(u.lastActive),
    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">Account Settings</h1>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          <Tabs
            tabs={settingsTabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            orientation="vertical"
          />
        </nav>

        <div className="settings-content">

          {/* ================================================================
              Profile Tab
              ================================================================ */}
          {activeTab === 'profile' && (
            <>
              <div className="settings-section">
                <h2>Profile Details</h2>
                <p className="section-description">Your personal information and account details</p>

                {profileLoading && (
                  <div className="settings-loading">
                    <Loader2 size={24} className="settings-spinner" />
                    <span>Loading profile...</span>
                  </div>
                )}

                {profileError && (
                  <div className="settings-error">
                    Failed to load profile. Showing cached data.
                  </div>
                )}

                {/* Profile card with avatar */}
                <div className="settings-profile-card">
                  <div className="settings-profile-avatar">
                    <span className="settings-profile-initials">
                      {getInitials(currentUser?.name || 'U')}
                    </span>
                  </div>
                  <div className="settings-profile-info">
                    <h3 className="settings-profile-name">{currentUser?.name || 'Unknown User'}</h3>
                    <p className="settings-profile-email">{currentUser?.email || '--'}</p>
                    <div className="settings-profile-badges">
                      <Badge variant="primary">{currentUser?.role || 'analyst'}</Badge>
                      <span className="settings-profile-org">
                        <Building2 size={14} />
                        {currentUser?.organization_name || 'Organisation'}
                      </span>
                    </div>
                    <p className="settings-profile-lastlogin">
                      <Clock size={13} />
                      Last login: {currentUser?.last_login_at ? formatDate(currentUser.last_login_at) : 'Today'}
                    </p>
                  </div>
                </div>

                <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                  <div className="form-row">
                    <Input
                      label="Full name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      fullWidth
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    fullWidth
                  />

                  <Input
                    label="Organisation"
                    type="text"
                    value={formData.organization_name}
                    disabled
                    hint="Contact your admin to change the organisation name"
                    fullWidth
                  />

                  <Input
                    label="Role"
                    type="text"
                    value={currentUser?.role || 'analyst'}
                    disabled
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Save size={16} />}
                    loading={updateProfile.isPending}
                  >
                    Save changes
                  </Button>
                </form>
              </div>

              {/* Security Section */}
              <div className="settings-section">
                <h2>Security</h2>
                <p className="section-description">Manage your password and security settings</p>

                <div className="security-option">
                  <div className="security-info">
                    <h3>Password</h3>
                    <p>Last changed 3 months ago</p>
                  </div>
                  <Button variant="secondary" icon={<Shield size={16} />}>
                    Change password
                  </Button>
                </div>

                <div className="security-option">
                  <div className="security-info">
                    <h3>Two-factor authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="secondary">Enable</Button>
                </div>
              </div>
            </>
          )}

          {/* ================================================================
              Team Tab
              ================================================================ */}
          {activeTab === 'team' && (
            <div className="settings-section">
              <UserManagement />
            </div>
          )}

          {/* ================================================================
              Usage Tab
              ================================================================ */}
          {activeTab === 'usage' && (
            <div className="settings-section">
              <h2>Usage Statistics</h2>
              <p className="section-description">Monitor your organisation's platform usage</p>
              <UsageStats />

              {/* Usage over time chart */}
              <div className="settings-usage-chart">
                <h3 className="settings-subsection-title">Queries Over Time (This Week)</h3>
                <ChartRenderer
                  type="area"
                  data={mockUsageChartData}
                  series={['Queries']}
                  height={280}
                  showLegend={false}
                  showGrid
                />
              </div>

              {/* Top users table */}
              <div className="settings-usage-topusers">
                <h3 className="settings-subsection-title">Top Users</h3>
                <DataTable
                  columns={topUserColumns}
                  data={mockTopUsers}
                  keyField="id"
                  emptyMessage="No usage data available"
                />
              </div>
            </div>
          )}

          {/* ================================================================
              Preferences Tab
              ================================================================ */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Preferences</h2>
              <p className="section-description">Customise your platform experience</p>

              <form className="settings-form settings-form--wide" onSubmit={(e) => { e.preventDefault(); handleSavePreferences(); }}>
                {/* Theme selector */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Palette size={15} />
                    Theme
                  </label>
                  <div className="settings-toggle-group settings-toggle-group--3">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`settings-toggle-btn ${preferences.theme === t ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, theme: t })}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default wave */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Globe size={15} />
                    Default Wave
                  </label>
                  <select
                    className="settings-select"
                    value={preferences.defaultWave}
                    onChange={(e) => setPreferences({ ...preferences, defaultWave: e.target.value })}
                  >
                    <option value="Q4 2025">Q4 2025</option>
                    <option value="Q3 2025">Q3 2025</option>
                    <option value="Q2 2025">Q2 2025</option>
                    <option value="Q1 2025">Q1 2025</option>
                  </select>
                </div>

                {/* Default location */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Globe size={15} />
                    Default Location
                  </label>
                  <select
                    className="settings-select"
                    value={preferences.defaultLocation}
                    onChange={(e) => setPreferences({ ...preferences, defaultLocation: e.target.value })}
                  >
                    <option value="Global">Global</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                {/* Chart color palette */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Palette size={15} />
                    Chart Color Palette
                  </label>
                  <div className="settings-palette-options">
                    {([
                      { value: 'default', label: 'Default', colors: ['#E31C79', '#0ea5e9', '#22c55e', '#f59e0b'] },
                      { value: 'colorblind', label: 'Colorblind Safe', colors: ['#0072B2', '#E69F00', '#009E73', '#CC79A7'] },
                      { value: 'high-contrast', label: 'High Contrast', colors: ['#000000', '#E31C79', '#0000FF', '#FF0000'] },
                      { value: 'monochrome', label: 'Monochrome', colors: ['#1f2937', '#4b5563', '#9ca3af', '#d1d5db'] },
                    ] as const).map((palette) => (
                      <button
                        key={palette.value}
                        type="button"
                        className={`settings-palette-btn ${preferences.chartPalette === palette.value ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, chartPalette: palette.value })}
                      >
                        <div className="settings-palette-swatches">
                          {palette.colors.map((c, i) => (
                            <span key={i} className="settings-palette-swatch" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="settings-palette-label">{palette.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyboard shortcuts toggle */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Keyboard size={15} />
                    Keyboard Shortcuts
                  </label>
                  <div className="settings-toggle-row">
                    <button
                      type="button"
                      className={`settings-switch ${preferences.keyboardShortcuts ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, keyboardShortcuts: !preferences.keyboardShortcuts })}
                      role="switch"
                      aria-checked={preferences.keyboardShortcuts}
                    >
                      <span className="settings-switch-thumb" />
                    </button>
                    <span className="settings-toggle-label">
                      {preferences.keyboardShortcuts ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Notification preferences */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Bell size={15} />
                    Notifications
                  </label>
                  <div className="settings-notification-options">
                    <div className="settings-toggle-row">
                      <button
                        type="button"
                        className={`settings-switch ${preferences.notifyEmail ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, notifyEmail: !preferences.notifyEmail })}
                        role="switch"
                        aria-checked={preferences.notifyEmail}
                      >
                        <span className="settings-switch-thumb" />
                      </button>
                      <span className="settings-toggle-label">
                        <Mail size={14} />
                        Email notifications
                      </span>
                    </div>
                    <div className="settings-toggle-row">
                      <button
                        type="button"
                        className={`settings-switch ${preferences.notifyInApp ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, notifyInApp: !preferences.notifyInApp })}
                        role="switch"
                        aria-checked={preferences.notifyInApp}
                      >
                        <span className="settings-switch-thumb" />
                      </button>
                      <span className="settings-toggle-label">
                        <Bell size={14} />
                        In-app notifications
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  icon={<Save size={16} />}
                  loading={updatePreferences.isPending}
                >
                  Save preferences
                </Button>
              </form>
            </div>
          )}

          {/* ================================================================
              Audit Log Tab
              ================================================================ */}
          {activeTab === 'audit-log' && (
            <div className="settings-section">
              <h2>Audit Log</h2>
              <p className="section-description">Track all actions performed across your organisation</p>

              <div className="settings-audit-filters">
                <select
                  className="settings-select"
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                >
                  <option value="">All actions</option>
                  <option value="created">Created</option>
                  <option value="edited">Edited</option>
                  <option value="deleted">Deleted</option>
                  <option value="exported">Exported</option>
                  <option value="viewed">Viewed</option>
                  <option value="login">Login</option>
                  <option value="invited">Invited</option>
                </select>
                <select
                  className="settings-select"
                  value={auditEntityFilter}
                  onChange={(e) => setAuditEntityFilter(e.target.value)}
                >
                  <option value="">All entity types</option>
                  <option value="chart">Chart</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="audience">Audience</option>
                  <option value="crosstab">Crosstab</option>
                  <option value="report">Report</option>
                  <option value="system">System</option>
                  <option value="user">User</option>
                </select>
              </div>

              <DataTable
                columns={auditColumns}
                data={filteredAuditLog}
                keyField="id"
                emptyMessage="No audit log entries match your filters"
              />
            </div>
          )}

          {/* ================================================================
              Keyboard Shortcuts Tab
              ================================================================ */}
          {activeTab === 'shortcuts' && (
            <div className="settings-section">
              <h2>Keyboard Shortcuts</h2>
              <p className="section-description">Quick reference for all available keyboard shortcuts</p>

              <div className="settings-shortcuts-list">
                {shortcutCategories.map((category) => (
                  <div key={category} className="settings-shortcuts-group">
                    <h3 className="settings-shortcuts-category">{category}</h3>
                    <div className="settings-shortcuts-items">
                      {mockShortcuts
                        .filter((s) => s.category === category)
                        .map((shortcut) => (
                          <div key={shortcut.id} className="settings-shortcut-row">
                            <span className="settings-shortcut-desc">{shortcut.description}</span>
                            <kbd className="settings-shortcut-keys">
                              {shortcut.keys.split('+').map((k, i, arr) => (
                                <span key={i}>
                                  <span className="settings-kbd">{k.trim()}</span>
                                  {i < arr.length - 1 && <span className="settings-kbd-plus">+</span>}
                                </span>
                              ))}
                            </kbd>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
