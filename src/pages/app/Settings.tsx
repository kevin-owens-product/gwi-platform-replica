import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Shield, Building2, Save, Users, BarChart2, Settings2, Loader2 } from 'lucide-react';
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

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'team', label: 'Team', icon: <Users size={16} /> },
  { id: 'usage', label: 'Usage', icon: <BarChart2 size={16} /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings2 size={16} /> },
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
            <div className="settings-section">
              <UserManagement />
            </div>
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
          )}
        </div>
      </div>
    </div>
  );
}
