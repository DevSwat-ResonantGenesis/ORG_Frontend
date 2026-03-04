/**
 * Profile Page - User Identity
 * 
 * Shows user identity bound to economic state.
 * All data from backend - NO local inference.
 * 
 * Backend APIs:
 * - GET /auth/me → user identity
 * - GET /billing/economic-state/me → economic state
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building2,
  Shield,
  Calendar,
  Key,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  Zap,
  Link2
} from 'lucide-react';
import { useAuth } from '../../security/auth/AuthProvider';
import { useEconomicState } from '../../context/EconomicStateContext';
import { TierBadge } from '../../components/EconomicState';
import styles from './ProfilePageNew.module.css';

export const ProfilePageNew: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, userId } = useAuth();
  const { 
    state: economicState, 
    tier,
    tierDisplayName,
    isDevOverride,
    loading: economicLoading 
  } = useEconomicState();

  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [userProfile, setUserProfile] = React.useState<{ 
    email?: string; 
    username?: string; 
    id?: string;
    role?: string;
    created_at?: string;
  } | null>(null);

  const loading = authLoading || economicLoading;

  // Fetch user profile
  React.useEffect(() => {
    if (isAuthenticated && userId) {
      fetch('/api/auth/me', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => setUserProfile(data))
        .catch(() => setUserProfile(null));
    }
  }, [isAuthenticated, userId]);

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <h2>Not authenticated</h2>
          <p>Please log in to view your profile.</p>
          <button onClick={() => navigate('/auth/login')} className={styles.loginButton}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/account')}>
          <ArrowLeft size={20} />
          Back to Account
        </button>
        <h1>Profile</h1>
      </header>

      <main className={styles.main}>
        {/* Avatar & Name */}
        <section className={styles.avatarSection}>
          <div className={styles.avatar}>
            <User size={48} />
          </div>
          <div className={styles.nameSection}>
            <h2>{userProfile?.username || 'User'}</h2>
            <div className={styles.badges}>
              <TierBadge size="md" />
              {isDevOverride && (
                <span className={styles.devBadge}>
                  <Zap size={12} />
                  Dev Override
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Identity Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <User size={18} />
            Identity
          </h3>
          <div className={styles.fieldGrid}>
            <ProfileField
              icon={<Mail size={16} />}
              label="Email"
              value={userProfile?.email || 'Not set'}
              copyable={!!userProfile?.email}
              onCopy={() => userProfile?.email && handleCopy(userProfile.email, 'email')}
              copied={copiedField === 'email'}
            />
            <ProfileField
              icon={<Key size={16} />}
              label="User ID"
              value={userId || 'Unknown'}
              copyable={!!userId}
              onCopy={() => userId && handleCopy(userId, 'userId')}
              copied={copiedField === 'userId'}
              mono
            />
            <ProfileField
              icon={<User size={16} />}
              label="Username"
              value={userProfile?.username || 'Not set'}
            />
            <ProfileField
              icon={<Calendar size={16} />}
              label="Member Since"
              value={userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
            />
          </div>
        </section>

        {/* Organization Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Building2 size={18} />
            Organization
          </h3>
          <div className={styles.fieldGrid}>
            <ProfileField
              icon={<Key size={16} />}
              label="Organization ID"
              value={economicState?.org_id || 'Not set'}
              copyable={!!economicState?.org_id}
              onCopy={() => economicState?.org_id && handleCopy(economicState.org_id, 'orgId')}
              copied={copiedField === 'orgId'}
              mono
            />
            <ProfileField
              icon={<Shield size={16} />}
              label="Role"
              value={userProfile?.role || 'member'}
            />
          </div>
        </section>

        {/* Subscription Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Shield size={18} />
            Subscription
          </h3>
          <div className={styles.fieldGrid}>
            <ProfileField
              icon={<Shield size={16} />}
              label="Tier"
              value={tierDisplayName}
            />
            <ProfileField
              icon={<Shield size={16} />}
              label="Status"
              value={economicState?.subscription_status || 'active'}
              badge
              badgeColor={economicState?.subscription_status === 'active' ? 'green' : 'yellow'}
            />
            <ProfileField
              icon={<Shield size={16} />}
              label="Source"
              value={economicState?.subscription_source || 'internal'}
            />
            {economicState?.subscription_id && (
              <ProfileField
                icon={<Key size={16} />}
                label="Subscription ID"
                value={economicState.subscription_id}
                copyable
                onCopy={() => handleCopy(economicState.subscription_id!, 'subId')}
                copied={copiedField === 'subId'}
                mono
              />
            )}
          </div>
        </section>

        {/* Dev Override Warning */}
        {isDevOverride && (
          <section className={styles.devWarning}>
            <Zap size={20} />
            <div>
              <strong>Developer Override Active</strong>
              <p>This account has dev override enabled. Economic enforcement is bypassed.</p>
            </div>
          </section>
        )}

        {/* Connect Profiles */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Link2 size={18} />
            Integrations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #71717a)', margin: 0 }}>
              Connect GitHub, Google, Notion, Stripe, DigitalOcean and 25+ more services to power your builds.
            </p>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: 'fit-content'
              }}
              onClick={() => navigate('/connect-profiles')}
            >
              <Link2 size={16} />
              Connect Your Profiles
            </button>
          </div>
        </section>

        {/* Actions */}
        <section className={styles.actionsSection}>
          <button 
            className={styles.secondaryButton}
            onClick={() => navigate('/settings')}
          >
            Edit Settings
          </button>
          <button 
            className={styles.primaryButton}
            onClick={() => navigate('/billing')}
          >
            Manage Subscription
          </button>
        </section>
      </main>
    </div>
  );
};

// Sub-component

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  mono?: boolean;
  badge?: boolean;
  badgeColor?: 'green' | 'yellow' | 'red';
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  icon,
  label,
  value,
  copyable,
  onCopy,
  copied,
  mono,
  badge,
  badgeColor = 'green',
}) => (
  <div className={styles.field}>
    <div className={styles.fieldIcon}>{icon}</div>
    <div className={styles.fieldContent}>
      <span className={styles.fieldLabel}>{label}</span>
      {badge ? (
        <span className={`${styles.fieldBadge} ${styles[badgeColor]}`}>
          {value}
        </span>
      ) : (
        <span className={`${styles.fieldValue} ${mono ? styles.mono : ''}`}>
          {value}
        </span>
      )}
    </div>
    {copyable && (
      <button className={styles.copyButton} onClick={onCopy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    )}
  </div>
);

export default ProfilePageNew;
