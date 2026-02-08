import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Shield, Building2, Save, Users, BarChart2, Settings2, Loader2,
  Key, Clock, Bell, BellOff, Mail, Copy, RefreshCw, Eye, EyeOff,
  LogIn, Download, UserPlus, FileText, Database, Link2, Unlink, Check
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useProfile } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/api';
import { Tabs, Button, Input } from '@/components/shared';
import UserManagement from '@/components/admin/UserManagement';
import UsageStats from '@/components/admin/UsageStats';
import type { User as UserType } from '@/api/types';
import './Settings.css';

interface ProfileFormData {
  name: string;
  email: string;
  organization_name: string;
}

interface ApiKeyEntry {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  requests: number;
}

interface AuditEntry {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: string;
  lastSync?: string;
}

interface DataPermission {
  dataset: string;
  access: 'full' | 'read-only' | 'no-access';
  grantedBy: string;
  grantedDate: string;
}

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'team', label: 'Team', icon: <Users size={16} /> },
  { id: 'usage', label: 'Usage', icon: <BarChart2 size={16} /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings2 size={16} /> },
  { id: 'api', label: 'API', icon: <Key size={16} /> },
  { id: 'activity', label: 'Activity', icon: <Clock size={16} /> },
  { id: 'integrations', label: 'Integrations', icon: <Link2 size={16} /> },
];

// Mock API keys
const initialApiKeys: ApiKeyEntry[] = [
  {
    id: '1',
    name: 'Production Key',
    key: 'gwi_prod_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    created: '2025-09-15',
    lastUsed: '2026-02-07',
    requests: 12847,
  },
  {
    id: '2',
    name: 'Development Key',
    key: 'gwi_dev_sk_x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4',
    created: '2025-11-02',
    lastUsed: '2026-02-06',
    requests: 3291,
  },
];

// Mock audit log
const mockAuditLog: AuditEntry[] = [
  { id: '1', action: 'Login', detail: 'Signed in from Chrome on macOS', timestamp: '2026-02-08 09:14', icon: <LogIn size={14} /> },
  { id: '2', action: 'Data Export', detail: 'Exported audience segment "UK Adults 18-34" as CSV', timestamp: '2026-02-07 16:42', icon: <Download size={14} /> },
  { id: '3', action: 'Audience Created', detail: 'Created audience "Premium Shoppers Q1 2026"', timestamp: '2026-02-07 11:23', icon: <UserPlus size={14} /> },
  { id: '4', action: 'Report Generated', detail: 'TV Study report for BBC One + ITV campaign', timestamp: '2026-02-06 14:55', icon: <FileText size={14} /> },
  { id: '5', action: 'Login', detail: 'Signed in from Safari on iOS', timestamp: '2026-02-06 08:30', icon: <LogIn size={14} /> },
  { id: '6', action: 'Data Export', detail: 'Exported Print R&F results for Vogue campaign', timestamp: '2026-02-05 17:10', icon: <Download size={14} /> },
  { id: '7', action: 'Audience Created', detail: 'Created audience "Sports Enthusiasts Male 25-44"', timestamp: '2026-02-05 10:05', icon: <UserPlus size={14} /> },
  { id: '8', action: 'Settings Updated', detail: 'Changed notification preferences', timestamp: '2026-02-04 13:22', icon: <Settings2 size={14} /> },
  { id: '9', action: 'Login', detail: 'Signed in from Firefox on Windows', timestamp: '2026-02-04 09:00', icon: <LogIn size={14} /> },
  { id: '10', action: 'API Key Created', detail: 'Generated new development API key', timestamp: '2026-02-03 15:45', icon: <Key size={14} /> },
];

// Mock integrations
const initialIntegrations: Integration[] = [
  { id: 'ga', name: 'Google Analytics', description: 'Import web analytics data to enrich audience insights', connected: true, icon: 'GA', lastSync: '2 hours ago' },
  { id: 'sf', name: 'Salesforce', description: 'Sync CRM data with GWI audience segments', connected: false, icon: 'SF' },
  { id: 'hs', name: 'HubSpot', description: 'Push audience segments to HubSpot for targeted campaigns', connected: true, icon: 'HS', lastSync: '1 day ago' },
  { id: 'sl', name: 'Slack', description: 'Receive study completion and export notifications in Slack', connected: false, icon: 'SL' },
];

// Mock data permissions
const mockDataPermissions: DataPermission[] = [
  { dataset: 'GWI Core - Global', access: 'full', grantedBy: 'Admin', grantedDate: '2025-01-15' },
  { dataset: 'GWI Core - UK', access: 'full', grantedBy: 'Admin', grantedDate: '2025-01-15' },
  { dataset: 'GWI USA', access: 'read-only', grantedBy: 'Team Lead', grantedDate: '2025-06-20' },
  { dataset: 'GWI Kids', access: 'no-access', grantedBy: '-', grantedDate: '-' },
  { dataset: 'GWI Sports', access: 'full', grantedBy: 'Admin', grantedDate: '2025-03-10' },
  { dataset: 'GWI Zeitgeist', access: 'read-only', grantedBy: 'Team Lead', grantedDate: '2025-09-01' },
];

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
    theme: 'light' as 'light' | 'dark',
    locale: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    weeklyDigest: false,
    studyCompleted: true,
    exportReady: true,
    teamUpdates: false,
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>(initialApiKeys);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  // Integrations state
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);

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
        theme: preferences.theme,
        locale: preferences.locale,
        timezone: preferences.timezone,
      },
    });
  };

  // API Key handlers
  const maskKey = (key: string): string => {
    return key.substring(0, 12) + '...' + key.substring(key.length - 4);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const regenerateKey = (id: string) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let newKey = 'gwi_regen_sk_';
    for (let i = 0; i < 32; i++) {
      newKey += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKeys((prev) =>
      prev.map((k) => k.id === id ? { ...k, key: newKey, created: new Date().toISOString().split('T')[0] } : k)
    );
    toast.success('API key regenerated');
  };

  // Integration handlers
  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integ) =>
        integ.id === id
          ? { ...integ, connected: !integ.connected, lastSync: !integ.connected ? 'Just now' : undefined }
          : integ
      )
    );
    const integration = integrations.find((i) => i.id === id);
    if (integration) {
      toast.success(
        integration.connected
          ? `${integration.name} disconnected`
          : `${integration.name} connected`
      );
    }
  };

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
          />
        </nav>

        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Details</h2>
              <p className="section-description">Update your personal information</p>

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
          )}

          {/* Security Section (kept from original, nested under profile) */}
          {activeTab === 'profile' && (
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
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <>
              <div className="settings-section">
                <UserManagement />
              </div>

              {/* Data Permissions */}
              <div className="settings-section">
                <h2>Data Permissions</h2>
                <p className="section-description">Datasets and studies your team has access to</p>

                <div className="settings-data-permissions-table-wrapper">
                  <table className="settings-data-permissions-table">
                    <thead>
                      <tr>
                        <th>Dataset / Study</th>
                        <th>Access Level</th>
                        <th>Granted By</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockDataPermissions.map((perm: DataPermission) => (
                        <tr key={perm.dataset}>
                          <td>
                            <div className="settings-dp-dataset">
                              <Database size={14} />
                              <span>{perm.dataset}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`settings-dp-badge settings-dp-badge-${perm.access}`}>
                              {perm.access === 'full' ? 'Full Access' : perm.access === 'read-only' ? 'Read Only' : 'No Access'}
                            </span>
                          </td>
                          <td className="settings-dp-muted">{perm.grantedBy}</td>
                          <td className="settings-dp-muted">{perm.grantedDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="settings-section">
              <h2>Usage Statistics</h2>
              <p className="section-description">Monitor your organisation's platform usage</p>
              <UsageStats />
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <>
              <div className="settings-section">
                <h2>Preferences</h2>
                <p className="section-description">Customise your platform experience</p>

                <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSavePreferences(); }}>
                  <div className="form-group">
                    <label className="input-field__label">Theme</label>
                    <div className="settings-toggle-group">
                      <button
                        type="button"
                        className={`settings-toggle-btn ${preferences.theme === 'light' ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                      >
                        Light
                      </button>
                      <button
                        type="button"
                        className={`settings-toggle-btn ${preferences.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  <Input
                    label="Locale"
                    type="text"
                    value={preferences.locale}
                    onChange={(e) => setPreferences({ ...preferences, locale: e.target.value })}
                    hint="e.g. en-US, en-GB, de-DE"
                    fullWidth
                  />

                  <Input
                    label="Timezone"
                    type="text"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    hint="e.g. Europe/London, America/New_York"
                    fullWidth
                  />

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

              {/* Notification Settings */}
              <div className="settings-section">
                <h2>Notification Settings</h2>
                <p className="section-description">Control how and when you receive notifications</p>

                <div className="settings-notifications">
                  <div className="settings-notification-item">
                    <div className="settings-notification-info">
                      <div className="settings-notification-icon">
                        <Mail size={16} />
                      </div>
                      <div>
                        <h3>Email Notifications</h3>
                        <p>Receive important updates via email</p>
                      </div>
                    </div>
                    <button
                      className={`settings-notification-toggle ${notifications.emailNotifications ? 'active' : ''}`}
                      onClick={() => {
                        setNotifications((prev) => ({ ...prev, emailNotifications: !prev.emailNotifications }));
                        toast.success(notifications.emailNotifications ? 'Email notifications disabled' : 'Email notifications enabled');
                      }}
                    >
                      <span className="settings-notification-toggle-dot" />
                    </button>
                  </div>

                  <div className="settings-notification-item">
                    <div className="settings-notification-info">
                      <div className="settings-notification-icon">
                        <Bell size={16} />
                      </div>
                      <div>
                        <h3>In-App Notifications</h3>
                        <p>Show notifications within the platform</p>
                      </div>
                    </div>
                    <button
                      className={`settings-notification-toggle ${notifications.inAppNotifications ? 'active' : ''}`}
                      onClick={() => {
                        setNotifications((prev) => ({ ...prev, inAppNotifications: !prev.inAppNotifications }));
                        toast.success(notifications.inAppNotifications ? 'In-app notifications disabled' : 'In-app notifications enabled');
                      }}
                    >
                      <span className="settings-notification-toggle-dot" />
                    </button>
                  </div>

                  <div className="settings-notification-item">
                    <div className="settings-notification-info">
                      <div className="settings-notification-icon">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h3>Weekly Digest</h3>
                        <p>Get a summary of platform activity every Monday</p>
                      </div>
                    </div>
                    <button
                      className={`settings-notification-toggle ${notifications.weeklyDigest ? 'active' : ''}`}
                      onClick={() => {
                        setNotifications((prev) => ({ ...prev, weeklyDigest: !prev.weeklyDigest }));
                        toast.success(notifications.weeklyDigest ? 'Weekly digest disabled' : 'Weekly digest enabled');
                      }}
                    >
                      <span className="settings-notification-toggle-dot" />
                    </button>
                  </div>

                  <div className="settings-notification-item">
                    <div className="settings-notification-info">
                      <div className="settings-notification-icon">
                        <BarChart2 size={16} />
                      </div>
                      <div>
                        <h3>Study Completed</h3>
                        <p>Notify when a study or analysis finishes running</p>
                      </div>
                    </div>
                    <button
                      className={`settings-notification-toggle ${notifications.studyCompleted ? 'active' : ''}`}
                      onClick={() => {
                        setNotifications((prev) => ({ ...prev, studyCompleted: !prev.studyCompleted }));
                        toast.success(notifications.studyCompleted ? 'Study notifications disabled' : 'Study notifications enabled');
                      }}
                    >
                      <span className="settings-notification-toggle-dot" />
                    </button>
                  </div>

                  <div className="settings-notification-item">
                    <div className="settings-notification-info">
                      <div className="settings-notification-icon">
                        <Download size={16} />
                      </div>
                      <div>
                        <h3>Export Ready</h3>
                        <p>Notify when a data export is ready for download</p>
                      </div>
                    </div>
                    <button
                      className={`settings-notification-toggle ${notifications.exportReady ? 'active' : ''}`}
                      onClick={() => {
                        setNotifications((prev) => ({ ...prev, exportReady: !prev.exportReady }));
                        toast.success(notifications.exportReady ? 'Export notifications disabled' : 'Export notifications enabled');
                      }}
                    >
                      <span className="settings-notification-toggle-dot" />
                    </button>
                  </div>

                  <div className="settings-notification-item">
                    <div className="settings-notification-info">
                      <div className="settings-notification-icon">
                        <Users size={16} />
                      </div>
                      <div>
                        <h3>Team Updates</h3>
                        <p>Notify when team members join, leave, or change roles</p>
                      </div>
                    </div>
                    <button
                      className={`settings-notification-toggle ${notifications.teamUpdates ? 'active' : ''}`}
                      onClick={() => {
                        setNotifications((prev) => ({ ...prev, teamUpdates: !prev.teamUpdates }));
                        toast.success(notifications.teamUpdates ? 'Team update notifications disabled' : 'Team update notifications enabled');
                      }}
                    >
                      <span className="settings-notification-toggle-dot" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="settings-section">
              <h2>API Keys</h2>
              <p className="section-description">Manage API keys for programmatic access to GWI data</p>

              <div className="settings-api-keys">
                {apiKeys.map((apiKey: ApiKeyEntry) => (
                  <div key={apiKey.id} className="settings-api-key-card">
                    <div className="settings-api-key-header">
                      <div className="settings-api-key-name-group">
                        <Key size={16} className="settings-api-key-icon" />
                        <div>
                          <h3>{apiKey.name}</h3>
                          <p className="settings-api-key-created">Created {apiKey.created}</p>
                        </div>
                      </div>
                      <div className="settings-api-key-stats">
                        <span className="settings-api-key-stat">
                          <span className="settings-api-key-stat-label">Requests</span>
                          <span className="settings-api-key-stat-value">{apiKey.requests.toLocaleString()}</span>
                        </span>
                        <span className="settings-api-key-stat">
                          <span className="settings-api-key-stat-label">Last used</span>
                          <span className="settings-api-key-stat-value">{apiKey.lastUsed}</span>
                        </span>
                      </div>
                    </div>
                    <div className="settings-api-key-value">
                      <code className="settings-api-key-code">
                        {visibleKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <div className="settings-api-key-actions">
                        <button
                          className="settings-api-key-btn"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          title={visibleKeys[apiKey.id] ? 'Hide key' : 'Show key'}
                        >
                          {visibleKeys[apiKey.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          className="settings-api-key-btn"
                          onClick={() => copyKey(apiKey.key)}
                          title="Copy key"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="settings-api-key-btn settings-api-key-btn-warning"
                          onClick={() => regenerateKey(apiKey.id)}
                          title="Regenerate key"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="settings-api-usage-summary">
                <h3>Usage Summary</h3>
                <div className="settings-api-usage-grid">
                  <div className="settings-api-usage-item">
                    <span className="settings-api-usage-label">Total Requests (30d)</span>
                    <span className="settings-api-usage-value">16,138</span>
                  </div>
                  <div className="settings-api-usage-item">
                    <span className="settings-api-usage-label">Rate Limit</span>
                    <span className="settings-api-usage-value">1,000/min</span>
                  </div>
                  <div className="settings-api-usage-item">
                    <span className="settings-api-usage-label">Active Keys</span>
                    <span className="settings-api-usage-value">{apiKeys.length}</span>
                  </div>
                  <div className="settings-api-usage-item">
                    <span className="settings-api-usage-label">Plan</span>
                    <span className="settings-api-usage-value">Enterprise</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="settings-section">
              <h2>Audit Log</h2>
              <p className="section-description">Recent account activity and actions</p>

              <div className="settings-audit-log">
                {mockAuditLog.map((entry: AuditEntry) => (
                  <div key={entry.id} className="settings-audit-entry">
                    <div className="settings-audit-icon">{entry.icon}</div>
                    <div className="settings-audit-content">
                      <div className="settings-audit-action">{entry.action}</div>
                      <div className="settings-audit-detail">{entry.detail}</div>
                    </div>
                    <div className="settings-audit-time">{entry.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>Connected Integrations</h2>
              <p className="section-description">Connect third-party tools to extend your GWI workflow</p>

              <div className="settings-integrations-grid">
                {integrations.map((integ: Integration) => (
                  <div key={integ.id} className={`settings-integration-card ${integ.connected ? 'connected' : ''}`}>
                    <div className="settings-integration-header">
                      <div className="settings-integration-icon-wrapper">
                        <span className="settings-integration-icon">{integ.icon}</span>
                      </div>
                      <div className="settings-integration-info">
                        <h3>{integ.name}</h3>
                        {integ.connected && integ.lastSync && (
                          <span className="settings-integration-sync">Last synced: {integ.lastSync}</span>
                        )}
                      </div>
                    </div>
                    <p className="settings-integration-desc">{integ.description}</p>
                    <div className="settings-integration-footer">
                      {integ.connected && (
                        <span className="settings-integration-status">
                          <Check size={12} />
                          Connected
                        </span>
                      )}
                      <Button
                        variant={integ.connected ? 'ghost' : 'primary'}
                        size="sm"
                        icon={integ.connected ? <Unlink size={14} /> : <Link2 size={14} />}
                        onClick={() => toggleIntegration(integ.id)}
                      >
                        {integ.connected ? 'Disconnect' : 'Connect'}
                      </Button>
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
