/**
 * Account Page - Primary User Dashboard
 * 
 * This is the SINGLE SOURCE OF TRUTH for user account information.
 * All data comes from backend APIs - NO local tier definitions.
 * 
 * Backend APIs:
 * - GET /billing/economic-state/me → subscription, credits, features
 * - GET /billing/usage/summary → usage metrics
 * - GET /auth/me → user identity
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  Zap, 
  Shield, 
  BarChart3, 
  Settings,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  MessageSquare,
  Bot,
  Code,
  Database
} from 'lucide-react';
// EconomicState removed — inline stub
const useEconomicState = () => ({ state: null as any, loading: false, error: null, tierDisplayName: 'Free', tierColor: '#888', canAccessFeature: () => true, refresh: () => {} });
import { useAuth } from '../../security/auth/AuthProvider';
const TierBadge = ({ size: _s }: { size?: string }) => null;
const CreditDisplay = ({ variant: _v }: { variant?: string }) => null;
import styles from './AccountPage.module.css';

// Usage summary from billing service
interface UsageSummary {
  credits_used_today: number;
  credits_used_this_month: number;
  breakdown: {
    chat: number;
    agents: number;
    ide: number;
    workflows: number;
    memory: number;
  };
}

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, userId } = useAuth();
  const { 
    state: economicState, 
    loading: economicLoading, 
    error,
    tierDisplayName,
    tierColor,
    canAccessFeature,
    refresh
  } = useEconomicState();

  const [usageSummary, setUsageSummary] = React.useState<UsageSummary | null>(null);
  const [usageLoading, setUsageLoading] = React.useState(true);

  // Fetch usage summary
  React.useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/billing/usage/summary', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUsageSummary(data);
        }
      } catch (err) {
        console.error('Failed to fetch usage summary:', err);
      } finally {
        setUsageLoading(false);
      }
    };
    fetchUsage();
  }, []);

  const [userProfile, setUserProfile] = React.useState<{ email?: string; username?: string } | null>(null);

  // Fetch user profile
  React.useEffect(() => {
    if (isAuthenticated && userId) {
      fetch('/api/auth/me', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => setUserProfile(data))
        .catch(() => setUserProfile(null));
    }
  }, [isAuthenticated, userId]);

  const loading = authLoading || economicLoading;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <h2>Failed to load account</h2>
          <p>{error}</p>
          <button onClick={refresh} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const features = (economicState?.features || {}) as Record<string, boolean>;
  const limits = (economicState?.hard_limits || {}) as Record<string, number>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <User size={32} />
            </div>
            <div className={styles.userDetails}>
              <h1>{userProfile?.username || userProfile?.email || 'User'}</h1>
              <p className={styles.email}>{userProfile?.email || userId}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <TierBadge size="lg" />
            <button 
              className={styles.settingsButton}
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Credits Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Zap size={20} />
            Credits
          </h2>
          <div className={styles.creditsCard}>
            <div className={styles.creditBalance}>
              <CreditDisplay variant="full" />
            </div>
            <div className={styles.creditActions}>
              <button 
                className={styles.primaryButton}
                onClick={() => navigate('/billing')}
              >
                <CreditCard size={16} />
                Manage Subscription
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Usage This Month */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <BarChart3 size={20} />
            Usage This Month
          </h2>
          {usageLoading ? (
            <div className={styles.usageLoading}>Loading usage...</div>
          ) : usageSummary ? (
            <div className={styles.usageGrid}>
              <UsageCard 
                icon={<MessageSquare size={20} />}
                label="Chat"
                value={usageSummary.breakdown.chat}
                unit="credits"
              />
              <UsageCard 
                icon={<Bot size={20} />}
                label="Agents"
                value={usageSummary.breakdown.agents}
                unit="credits"
              />
              <UsageCard 
                icon={<Code size={20} />}
                label="IDE"
                value={usageSummary.breakdown.ide}
                unit="credits"
              />
              <UsageCard 
                icon={<Cpu size={20} />}
                label="Workflows"
                value={usageSummary.breakdown.workflows}
                unit="credits"
              />
              <UsageCard 
                icon={<Database size={20} />}
                label="Memory"
                value={usageSummary.breakdown.memory}
                unit="credits"
              />
            </div>
          ) : (
            <div className={styles.usageEmpty}>
              <p>No usage data available</p>
            </div>
          )}
          <button 
            className={styles.secondaryButton}
            onClick={() => navigate('/usage')}
          >
            View Detailed Usage
            <ArrowUpRight size={14} />
          </button>
        </section>

        {/* Features Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Shield size={20} />
            Feature Access
          </h2>
          <div className={styles.featuresGrid}>
            <FeatureCard 
              label="IDE Access"
              enabled={features.ide_access}
              requiredTier="Plus"
            />
            <FeatureCard 
              label="Code Execution"
              enabled={features.code_execution}
              requiredTier="Plus"
            />
            <FeatureCard 
              label="Agent Marketplace"
              enabled={features.agent_marketplace}
              requiredTier="Free"
            />
            <FeatureCard 
              label="Workflow Builder"
              enabled={features.workflow_builder}
              requiredTier="Free"
            />
            <FeatureCard 
              label="API Access"
              enabled={features.api_access}
              requiredTier="Free"
            />
            <FeatureCard 
              label="Blockchain Access"
              enabled={features.blockchain_access}
              requiredTier="Pro"
            />
            <FeatureCard 
              label="HashSphere"
              enabled={features.hash_sphere_access}
              requiredTier="Free"
            />
          </div>
        </section>

        {/* Limits Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Clock size={20} />
            Account Limits
          </h2>
          <div className={styles.limitsGrid}>
            <LimitCard 
              label="Max Agents"
              value={limits.max_agents}
              unlimited={limits.max_agents === -1}
            />
            <LimitCard 
              label="Max Workflows"
              value={limits.max_workflows}
              unlimited={limits.max_workflows === -1}
            />
            <LimitCard 
              label="Max Memory"
              value={limits.max_memory_mb}
              unit="MB"
              unlimited={limits.max_memory_mb === -1}
            />
            <LimitCard 
              label="Requests/Day"
              value={limits.max_requests_per_day}
              unlimited={limits.max_requests_per_day === -1}
            />
            <LimitCard 
              label="Tokens/Day"
              value={limits.max_tokens_per_day}
              unlimited={limits.max_tokens_per_day === -1}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <ActionCard 
              icon={<CreditCard size={24} />}
              label="Billing"
              description="Manage subscription & payments"
              onClick={() => navigate('/billing')}
            />
            <ActionCard 
              icon={<BarChart3 size={24} />}
              label="Usage"
              description="View detailed usage metrics"
              onClick={() => navigate('/usage')}
            />
            <ActionCard 
              icon={<User size={24} />}
              label="Profile"
              description="Edit profile & preferences"
              onClick={() => navigate('/profile')}
            />
            <ActionCard 
              icon={<Settings size={24} />}
              label="Settings"
              description="Account settings"
              onClick={() => navigate('/settings')}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

// Sub-components

interface UsageCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}

const UsageCard: React.FC<UsageCardProps> = ({ icon, label, value, unit }) => (
  <div className={styles.usageCard}>
    <div className={styles.usageIcon}>{icon}</div>
    <div className={styles.usageContent}>
      <span className={styles.usageValue}>{value.toLocaleString()}</span>
      <span className={styles.usageUnit}>{unit}</span>
    </div>
    <span className={styles.usageLabel}>{label}</span>
  </div>
);

interface FeatureCardProps {
  label: string;
  enabled: boolean;
  requiredTier: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ label, enabled, requiredTier }) => (
  <div className={`${styles.featureCard} ${enabled ? styles.enabled : styles.disabled}`}>
    <div className={styles.featureIcon}>
      {enabled ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
    </div>
    <span className={styles.featureLabel}>{label}</span>
    {!enabled && (
      <span className={styles.featureRequired}>Requires {requiredTier}</span>
    )}
  </div>
);

interface LimitCardProps {
  label: string;
  value: number;
  unit?: string;
  unlimited?: boolean;
}

const LimitCard: React.FC<LimitCardProps> = ({ label, value, unit, unlimited }) => (
  <div className={styles.limitCard}>
    <span className={styles.limitLabel}>{label}</span>
    <span className={styles.limitValue}>
      {unlimited ? '∞' : value.toLocaleString()}
      {unit && !unlimited && <span className={styles.limitUnit}>{unit}</span>}
    </span>
  </div>
);

interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, label, description, onClick }) => (
  <button className={styles.actionCard} onClick={onClick}>
    <div className={styles.actionIcon}>{icon}</div>
    <div className={styles.actionContent}>
      <span className={styles.actionLabel}>{label}</span>
      <span className={styles.actionDescription}>{description}</span>
    </div>
    <ArrowUpRight size={16} className={styles.actionArrow} />
  </button>
);

export default AccountPage;
