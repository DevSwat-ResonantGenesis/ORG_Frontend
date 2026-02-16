/**
 * Enterprise Dashboard - For Enterprise/Organization Clients
 * Full organization management: SSO, employees, roles, audit logs, compliance
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSessionData, isAuthenticated } from '../../utils/auth-cookies';
import styles from './EnterpriseDashboard.module.css';

// Icons
const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" /><path d="M16 6h.01" />
    <path d="M8 10h.01" /><path d="M16 10h.01" />
    <path d="M8 14h.01" /><path d="M16 14h.01" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

import { ENV } from '../../config/env';

const API_BASE = ENV.apiUrl;

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

interface OrgStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  creditsUsed: number;
  creditsTotal: number;
  apiCalls: number;
}

type TabType = 'overview' | 'employees' | 'roles' | 'sso' | 'audit' | 'compliance' | 'settings';

const EnterpriseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSessionData();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<OrgStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    creditsUsed: 0,
    creditsTotal: 500000,
    apiCalls: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const postLoginTarget = sessionStorage.getItem('rg-post-login-target');
      if (postLoginTarget) {
        sessionStorage.removeItem('rg-post-login-target');
        navigate(postLoginTarget, { replace: true });
        return;
      }
    } catch {
    }
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (session?.plan !== 'enterprise') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [location.search]);

  const loadData = async () => {
    try {
      // TODO: Fetch org data from API
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load enterprise data:', err);
      setIsLoading(false);
    }
  };

  const renderOverview = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}><UsersIcon /></div>
          </div>
          <div className={styles.statValue}>{stats.totalEmployees}</div>
          <div className={styles.statLabel}>Total Employees</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}><UsersIcon /></div>
          </div>
          <div className={styles.statValue}>{stats.activeEmployees}</div>
          <div className={styles.statLabel}>Active Today</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}><BuildingIcon /></div>
          </div>
          <div className={styles.statValue}>{stats.departments}</div>
          <div className={styles.statLabel}>Departments</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}><ActivityIcon /></div>
          </div>
          <div className={styles.statValue}>{stats.apiCalls.toLocaleString()}</div>
          <div className={styles.statLabel}>API Calls (30d)</div>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ActivityIcon /> Organization Usage</h3>
          <div className={styles.usageBar}>
            <div className={styles.usageProgress} style={{ width: `${(stats.creditsUsed / stats.creditsTotal) * 100}%` }} />
          </div>
          <div className={styles.usageText}>
            {stats.creditsUsed.toLocaleString()} / {stats.creditsTotal.toLocaleString()} credits
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ShieldIcon /> Security Status</h3>
          <div className={styles.securityList}>
            <div className={styles.securityItem}>
              <span className={`${styles.statusDot} ${styles.statusActive}`} />
              <span>SSO Configured</span>
            </div>
            <div className={styles.securityItem}>
              <span className={`${styles.statusDot} ${styles.statusActive}`} />
              <span>Audit Logging Enabled</span>
            </div>
            <div className={styles.securityItem}>
              <span className={`${styles.statusDot} ${styles.statusActive}`} />
              <span>Data Encryption Active</span>
            </div>
            <div className={styles.securityItem}>
              <span className={`${styles.statusDot} ${styles.statusActive}`} />
              <span>Compliance Mode: SOC2</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><ClipboardIcon /> Recent Activity</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}><UserPlusIcon /></div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>New employee added: john.doe@company.com</div>
                <div className={styles.activityTime}>2 hours ago</div>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}><LockIcon /></div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>SSO configuration updated</div>
                <div className={styles.activityTime}>Yesterday</div>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}><ShieldIcon /></div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>Security policy updated</div>
                <div className={styles.activityTime}>3 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderEmployees = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><UsersIcon /> Employee Management</h2>
        <button className={styles.primaryBtn}><UserPlusIcon /> Add Employee</button>
      </div>
      <div className={styles.card}>
        {employees.length === 0 ? (
          <div className={styles.emptyState}>
            <UsersIcon />
            <p>No employees added yet. Add your first team member to get started.</p>
            <button className={styles.primaryBtn}>Add First Employee</button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{emp.name.charAt(0)}</div>
                        <div>
                          <div className={styles.userName}>{emp.name}</div>
                          <div className={styles.userEmail}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.roleBadge}>{emp.role}</span></td>
                    <td>{emp.department}</td>
                    <td><span className={`${styles.statusDot} ${styles[`status${emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}`]}`} />{emp.status}</td>
                    <td>{emp.lastActive}</td>
                    <td>
                      <button className={styles.actionBtn}>Edit</button>
                      <button className={styles.actionBtnDanger}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><KeyIcon /> Roles & Permissions</h2>
        <button className={styles.primaryBtn}>+ Create Role</button>
      </div>
      <div className={styles.rolesGrid}>
        <div className={styles.roleCard}>
          <div className={styles.roleHeader}>
            <h3 className={styles.roleName}>Admin</h3>
            <span className={styles.roleCount}>2 members</span>
          </div>
          <div className={styles.rolePermissions}>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> Full access</div>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> Manage employees</div>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> Billing access</div>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> SSO configuration</div>
          </div>
          <button className={styles.secondaryBtn}>Edit Role</button>
        </div>
        <div className={styles.roleCard}>
          <div className={styles.roleHeader}>
            <h3 className={styles.roleName}>Developer</h3>
            <span className={styles.roleCount}>5 members</span>
          </div>
          <div className={styles.rolePermissions}>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> API access</div>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> Create agents</div>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> View analytics</div>
            <div className={styles.permissionItem}><span className={styles.xIcon}>✗</span> Billing access</div>
          </div>
          <button className={styles.secondaryBtn}>Edit Role</button>
        </div>
        <div className={styles.roleCard}>
          <div className={styles.roleHeader}>
            <h3 className={styles.roleName}>Viewer</h3>
            <span className={styles.roleCount}>10 members</span>
          </div>
          <div className={styles.rolePermissions}>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> View dashboards</div>
            <div className={styles.permissionItem}><span className={styles.checkIcon}>✓</span> View reports</div>
            <div className={styles.permissionItem}><span className={styles.xIcon}>✗</span> API access</div>
            <div className={styles.permissionItem}><span className={styles.xIcon}>✗</span> Create agents</div>
          </div>
          <button className={styles.secondaryBtn}>Edit Role</button>
        </div>
      </div>
    </div>
  );

  const renderSSO = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><LockIcon /> Single Sign-On (SSO)</h2>
      </div>
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>SSO Configuration</h3>
          <div className={styles.ssoForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Identity Provider</label>
              <select className={styles.formSelect}>
                <option>Select provider...</option>
                <option>Okta</option>
                <option>Azure AD</option>
                <option>Google Workspace</option>
                <option>OneLogin</option>
                <option>Custom SAML</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>SSO URL</label>
              <input type="text" className={styles.formInput} placeholder="https://your-idp.com/sso" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Entity ID</label>
              <input type="text" className={styles.formInput} placeholder="urn:your-entity-id" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>X.509 Certificate</label>
              <textarea className={styles.formTextarea} placeholder="Paste your certificate here..." rows={4} />
            </div>
            <button className={styles.primaryBtn}>Save SSO Configuration</button>
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>SSO Status</h3>
          <div className={styles.ssoStatus}>
            <div className={styles.statusItem}>
              <span>SSO Enabled</span>
              <span className={styles.statusBadgeActive}>Active</span>
            </div>
            <div className={styles.statusItem}>
              <span>Provider</span>
              <span>Not configured</span>
            </div>
            <div className={styles.statusItem}>
              <span>Last Login via SSO</span>
              <span>N/A</span>
            </div>
            <div className={styles.statusItem}>
              <span>Enforce SSO</span>
              <label className={styles.toggle}>
                <input type="checkbox" />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><FileTextIcon /> Audit Logs</h2>
        <button className={styles.secondaryBtn}>Export Logs</button>
      </div>
      <div className={styles.card}>
        <div className={styles.filterBar}>
          <input type="text" className={styles.searchInput} placeholder="Search logs..." />
          <select className={styles.filterSelect}>
            <option>All Actions</option>
            <option>Login</option>
            <option>User Management</option>
            <option>Settings Change</option>
            <option>API Access</option>
          </select>
          <input type="date" className={styles.dateInput} />
        </div>
        {auditLogs.length === 0 ? (
          <div className={styles.emptyState}>
            <FileTextIcon />
            <p>No audit logs yet. Activity will be recorded here.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.timestamp}</td>
                    <td>{log.user}</td>
                    <td><span className={styles.actionBadge}>{log.action}</span></td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><ShieldIcon /> Compliance & Security</h2>
      </div>
      <div className={styles.complianceGrid}>
        <div className={styles.complianceCard}>
          <div className={styles.complianceIcon}><ShieldIcon /></div>
          <h3>SOC 2 Type II</h3>
          <p>Security, availability, and confidentiality controls</p>
          <span className={styles.complianceBadge}>Compliant</span>
        </div>
        <div className={styles.complianceCard}>
          <div className={styles.complianceIcon}><LockIcon /></div>
          <h3>GDPR</h3>
          <p>EU data protection and privacy</p>
          <span className={styles.complianceBadge}>Compliant</span>
        </div>
        <div className={styles.complianceCard}>
          <div className={styles.complianceIcon}><FileTextIcon /></div>
          <h3>HIPAA</h3>
          <p>Healthcare data protection</p>
          <span className={styles.complianceBadgePending}>Available</span>
        </div>
        <div className={styles.complianceCard}>
          <div className={styles.complianceIcon}><KeyIcon /></div>
          <h3>ISO 27001</h3>
          <p>Information security management</p>
          <span className={styles.complianceBadge}>Compliant</span>
        </div>
      </div>
      <div className={styles.card} style={{ marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>Data Residency</h3>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Primary Data Region</label>
          <select className={styles.formSelect}>
            <option>US East (Virginia)</option>
            <option>US West (Oregon)</option>
            <option>EU (Frankfurt)</option>
            <option>EU (Ireland)</option>
            <option>Asia Pacific (Singapore)</option>
          </select>
        </div>
        <button className={styles.primaryBtn}>Update Data Residency</button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><BuildingIcon /> Organization Settings</h3>
        <div className={styles.settingsForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Organization Name</label>
            <input type="text" className={styles.formInput} defaultValue={session?.organization || ''} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Domain</label>
            <input type="text" className={styles.formInput} placeholder="company.com" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Industry</label>
            <select className={styles.formSelect}>
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
              <option>Retail</option>
              <option>Other</option>
            </select>
          </div>
          <button className={styles.primaryBtn}>Save Changes</button>
        </div>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><KeyIcon /> API Configuration</h3>
        <div className={styles.apiKeySection}>
          <div className={styles.apiKeyItem}>
            <span className={styles.apiKeyLabel}>Production API Key</span>
            <div className={styles.apiKeyValue}>
              <code>sk-prod-••••••••••••••••</code>
              <button className={styles.copyBtn}>Copy</button>
            </div>
          </div>
          <div className={styles.apiKeyItem}>
            <span className={styles.apiKeyLabel}>Test API Key</span>
            <div className={styles.apiKeyValue}>
              <code>sk-test-••••••••••••••••</code>
              <button className={styles.copyBtn}>Copy</button>
            </div>
          </div>
          <button className={styles.secondaryBtn}>Regenerate Keys</button>
        </div>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><SettingsIcon /> Billing</h3>
        <div className={styles.billingInfo}>
          <div className={styles.billingItem}>
            <span>Current Plan</span>
            <span className={styles.planBadge}>Enterprise</span>
          </div>
          <div className={styles.billingItem}>
            <span>Monthly Credits</span>
            <span>500,000</span>
          </div>
          <div className={styles.billingItem}>
            <span>Billing Contact</span>
            <span>{session?.email || 'Not set'}</span>
          </div>
          <button className={styles.secondaryBtn}>Manage Billing</button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading Enterprise Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <nav className={styles.navTabs}>
          <button className={`${styles.navTab} ${activeTab === 'overview' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`${styles.navTab} ${activeTab === 'employees' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('employees')}>Employees</button>
          <button className={`${styles.navTab} ${activeTab === 'roles' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('roles')}>Roles</button>
          <button className={`${styles.navTab} ${activeTab === 'sso' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('sso')}>SSO</button>
          <button className={`${styles.navTab} ${activeTab === 'audit' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('audit')}>Audit Logs</button>
          <button className={`${styles.navTab} ${activeTab === 'compliance' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('compliance')}>Compliance</button>
          <button className={`${styles.navTab} ${activeTab === 'settings' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
        </nav>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'roles' && renderRoles()}
        {activeTab === 'sso' && renderSSO()}
        {activeTab === 'audit' && renderAudit()}
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
