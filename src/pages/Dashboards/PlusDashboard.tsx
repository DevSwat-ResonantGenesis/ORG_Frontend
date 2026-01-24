/**
 * Plus Dashboard - For Plus Plan Users
 * Enhanced features, more credits, and advanced analytics
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData, isAuthenticated } from '../../utils/auth-cookies';
import { fetchPlan } from '../../api/pricing';
import styles from './PlusDashboard.module.css';

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

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
  </svg>
);

import { ENV } from '../../config/env';

const API_BASE = ENV.apiUrl;

interface OrgStats {
  teamMembers: number;
  creditsUsed: number;
  creditsTotal: number;
  apiCalls: number;
  activeAgents: number;
}

type TabType = 'overview' | 'team' | 'usage' | 'agents' | 'settings';

const PlusDashboard: React.FC = () => {
  const navigate = useNavigate();
  const session = getSessionData();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<OrgStats>({
    teamMembers: 0,
    creditsUsed: 0,
    creditsTotal: 50000, // Will be fetched from API
    apiCalls: 0,
    activeAgents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    // Check if user has Plus plan
    if (session?.plan !== 'plus') {
      navigate('/dashboard');
      return;
    }
    fetchStats();
    
    // Fetch Plus tier pricing
    async function loadPlusPricing() {
      try {
        const planData = await fetchPlan('plus');
        if (planData?.credits?.included) {
          setStats(prev => ({
            ...prev,
            creditsTotal: planData.credits.included
          }));
        }
      } catch (error) {
        console.error('Failed to load Plus pricing:', error);
      }
    }
    loadPlusPricing();
  }, [navigate, session]);

  const fetchStats = async () => {
    try {
      // Fetch org stats
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load Plus dashboard data:', err);
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
          <div className={styles.statValue}>{stats.teamMembers}</div>
          <div className={styles.statLabel}>Team Members</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}><CreditCardIcon /></div>
          </div>
          <div className={styles.statValue}>{stats.creditsUsed.toLocaleString()}</div>
          <div className={styles.statLabel}>Credits Used</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}><ActivityIcon /></div>
          </div>
          <div className={styles.statValue}>{stats.apiCalls.toLocaleString()}</div>
          <div className={styles.statLabel}>API Calls (30d)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}><BotIcon /></div>
          </div>
          <div className={styles.statValue}>{stats.activeAgents}</div>
          <div className={styles.statLabel}>Active Agents</div>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ActivityIcon /> Usage Overview</h3>
          <div className={styles.usageBar}>
            <div className={styles.usageProgress} style={{ width: `${(stats.creditsUsed / stats.creditsTotal) * 100}%` }} />
          </div>
          <div className={styles.usageText}>
            {stats.creditsUsed.toLocaleString()} / {stats.creditsTotal.toLocaleString()} credits used
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ShieldIcon /> Security Status</h3>
          <div className={styles.securityItem}>
            <span className={styles.securityDot} style={{ background: '#10b981' }} />
            <span>SSO Enabled</span>
          </div>
          <div className={styles.securityItem}>
            <span className={styles.securityDot} style={{ background: '#10b981' }} />
            <span>Audit Logging Active</span>
          </div>
          <div className={styles.securityItem}>
            <span className={styles.securityDot} style={{ background: '#10b981' }} />
            <span>Data Encryption</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderTeam = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><UsersIcon /> Team Management</h2>
        <button className={styles.primaryBtn}>+ Invite Member</button>
      </div>
      <div className={styles.card}>
        <div className={styles.emptyState}>
          <UsersIcon />
          <p>No team members yet. Invite your first team member to get started.</p>
        </div>
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><ActivityIcon /> Usage Analytics</h2>
      </div>
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Credits Usage</h3>
          <div className={styles.chartPlaceholder}>Usage chart (integrate Chart.js)</div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>API Calls</h3>
          <div className={styles.chartPlaceholder}>API calls chart</div>
        </div>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><BotIcon /> AI Agents</h2>
        <button className={styles.primaryBtn}>+ Create Agent</button>
      </div>
      <div className={styles.card}>
        <div className={styles.emptyState}>
          <BotIcon />
          <p>No agents configured. Create your first AI agent to automate tasks.</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><SettingsIcon /> Organization Settings</h3>
        <div className={styles.settingItem}>
          <span>Organization Name</span>
          <span>{session?.organization || 'Not set'}</span>
        </div>
        <div className={styles.settingItem}>
          <span>Plan</span>
          <span className={styles.badge}>{session?.plan || 'Enterprise'}</span>
        </div>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><ShieldIcon /> Security Settings</h3>
        <div className={styles.settingItem}>
          <span>SSO Configuration</span>
          <button className={styles.secondaryBtn}>Configure</button>
        </div>
        <div className={styles.settingItem}>
          <span>API Keys</span>
          <button className={styles.secondaryBtn}>Manage</button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <nav className={styles.navTabs}>
          <button className={`${styles.navTab} ${activeTab === 'overview' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`${styles.navTab} ${activeTab === 'team' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('team')}>Team</button>
          <button className={`${styles.navTab} ${activeTab === 'usage' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('usage')}>Usage</button>
          <button className={`${styles.navTab} ${activeTab === 'agents' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('agents')}>Agents</button>
          <button className={`${styles.navTab} ${activeTab === 'settings' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
        </nav>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'team' && renderTeam()}
        {activeTab === 'usage' && renderUsage()}
        {activeTab === 'agents' && renderAgents()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default PlusDashboard;
