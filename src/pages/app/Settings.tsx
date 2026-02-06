import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Shield, Building2, Save, LucideIcon } from 'lucide-react';
import './Settings.css';

interface SettingsTab {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  company: string;
}

const tabs: SettingsTab[] = [
  { id: 'account', label: 'Account details', icon: User, path: '/app/account-settings' },
  { id: 'security', label: 'Security', icon: Shield, path: '/app/account-settings/security' },
  { id: 'organisation', label: 'Organisation', icon: Building2, path: '/app/account-settings/organisation' },
];

export default function Settings(): React.JSX.Element {
  const { tab = 'account' } = useParams<{ tab?: string }>();
  const activeTab: string = tab || 'account';

  const [formData, setFormData] = useState<FormData>({
    firstName: 'Kevin',
    lastName: 'Owens',
    email: 'kevin.owens@gwi.com',
    jobTitle: 'Product Manager',
    company: 'GWI',
  });

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">Account Settings</h1>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          {tabs.map((item: SettingsTab) => (
            <Link
              key={item.id}
              to={item.path}
              className={`settings-nav-item ${activeTab === item.id || (activeTab === 'account' && item.id === 'account') ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="settings-content">
          {(activeTab === 'account' || !activeTab) && (
            <div className="settings-section">
              <h2>Account Details</h2>
              <p className="section-description">Update your personal information</p>

              <form className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Job title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <button type="button" className="btn-primary">
                  <Save size={16} />
                  <span>Save changes</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security</h2>
              <p className="section-description">Manage your password and security settings</p>

              <div className="security-option">
                <div className="security-info">
                  <h3>Password</h3>
                  <p>Last changed 3 months ago</p>
                </div>
                <button className="btn-secondary">Change password</button>
              </div>

              <div className="security-option">
                <div className="security-info">
                  <h3>Two-factor authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="btn-secondary">Enable</button>
              </div>
            </div>
          )}

          {activeTab === 'organisation' && (
            <div className="settings-section">
              <h2>Organisation</h2>
              <p className="section-description">View your organisation details</p>

              <div className="org-info">
                <div className="org-detail">
                  <label>Organisation name</label>
                  <p>GWI Internal</p>
                </div>
                <div className="org-detail">
                  <label>Plan</label>
                  <p>Enterprise</p>
                </div>
                <div className="org-detail">
                  <label>Users</label>
                  <p>47 active users</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
