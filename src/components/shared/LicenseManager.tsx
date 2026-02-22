import React, { useState } from 'react';
import { Key, Plus, Search, Eye, Edit2, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Calendar, Users, Shield, Download, RefreshCw } from 'lucide-react';

type LicenseStatus = 'active' | 'expired' | 'suspended' | 'trial' | 'pending';
type LicenseType = 'enterprise' | 'professional' | 'team' | 'starter' | 'trial';

interface LicenseFeature {
  id: string;
  name: string;
  enabled: boolean;
  limit?: number;
  usage?: number;
}

interface License {
  id: string;
  key: string;
  type: LicenseType;
  status: LicenseStatus;
  organization: string;
  contactEmail: string;
  seats: number;
  usedSeats: number;
  features: LicenseFeature[];
  startDate: Date;
  expiryDate: Date;
  lastValidated?: Date;
  createdAt: Date;
}

interface LicenseManagerProps {
  licenses: License[];
  onCreateLicense?: () => void;
  onViewLicense?: (licenseId: string) => void;
  onEditLicense?: (licenseId: string) => void;
  onRenewLicense?: (licenseId: string) => void;
  onRevokeLicense?: (licenseId: string) => void;
  onDeleteLicense?: (licenseId: string) => void;
  onExportLicense?: (licenseId: string) => void;
  className?: string;
}

interface LicenseCardProps {
  license: License;
  onView?: () => void;
  onEdit?: () => void;
  onRenew?: () => void;
  onRevoke?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

const STATUS_CONFIG: Record<LicenseStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  expired: {
    label: 'Expired',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  suspended: {
    label: 'Suspended',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  trial: {
    label: 'Trial',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Clock size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
};

const TYPE_CONFIG: Record<LicenseType, {
  label: string;
  color: string;
}> = {
  enterprise: { label: 'Enterprise', color: '#8b5cf6' },
  professional: { label: 'Professional', color: '#3b82f6' },
  team: { label: 'Team', color: '#10b981' },
  starter: { label: 'Starter', color: '#f59e0b' },
  trial: { label: 'Trial', color: '#888' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '200px',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  licensesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1rem',
  },
  licenseCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  licenseCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  licenseCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  licenseCardExpired: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  licenseHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  licenseTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  licenseIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  licenseMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  licenseBody: {
    padding: '1.25rem',
  },
  licenseKey: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: '#818cf8',
  },
  seatsSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  seatsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  seatsTrack: {
    flex: 1,
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  seatsFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  seatsValue: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#e4e4e7',
    minWidth: '60px',
    textAlign: 'right',
  },
  dateSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  dateItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  dateLabel: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  dateValue: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  featuresSection: {
    marginBottom: '1rem',
  },
  featuresList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  featureBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
  },
  featureEnabled: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
  },
  featureDisabled: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  licenseFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerMeta: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  renewButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  exportButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
  },
  revokeButton: {
    background: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getDaysRemaining = (expiryDate: Date): { days: number; color: string } => {
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);

  if (days < 0) return { days: 0, color: '#ef4444' };
  if (days <= 7) return { days, color: '#ef4444' };
  if (days <= 30) return { days, color: '#f59e0b' };
  return { days, color: '#10b981' };
};

const getSeatsColor = (used: number, total: number): string => {
  const percentage = (used / total) * 100;
  if (percentage >= 90) return '#ef4444';
  if (percentage >= 70) return '#f59e0b';
  return '#10b981';
};

const LicenseCard: React.FC<LicenseCardProps> = ({
  license,
  onView,
  onEdit,
  onRenew,
  onRevoke,
  onDelete,
  onExport,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[license.status];
  const typeConfig = TYPE_CONFIG[license.type];
  const daysRemaining = getDaysRemaining(license.expiryDate);
  const seatsPercentage = (license.usedSeats / license.seats) * 100;

  return (
    <div
      style={{
        ...styles.licenseCard,
        ...(isHovered ? styles.licenseCardHover : {}),
        ...(license.status === 'active' ? styles.licenseCardActive : {}),
        ...(license.status === 'expired' ? styles.licenseCardExpired : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.licenseHeader}>
        <div style={styles.licenseTitle}>
          <div
            style={{
              ...styles.licenseIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Key size={22} />
          </div>
          <div style={styles.licenseInfo}>
            <div style={styles.licenseName}>{license.organization}</div>
            <div style={styles.licenseMeta}>
              <span
                style={{
                  ...styles.statusBadge,
                  background: statusConfig.bgColor,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              <span style={{ ...styles.typeBadge, color: typeConfig.color }}>
                {typeConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.licenseBody}>
        <div style={styles.licenseKey}>
          <Key size={14} />
          {license.key}
        </div>

        <div style={styles.seatsSection}>
          <div style={styles.sectionTitle}>Seats Usage</div>
          <div style={styles.seatsBar}>
            <div style={styles.seatsTrack}>
              <div
                style={{
                  ...styles.seatsFill,
                  width: `${seatsPercentage}%`,
                  background: getSeatsColor(license.usedSeats, license.seats),
                }}
              />
            </div>
            <span style={styles.seatsValue}>
              {license.usedSeats} / {license.seats}
            </span>
          </div>
        </div>

        <div style={styles.dateSection}>
          <div style={styles.dateItem}>
            <span style={styles.dateLabel}>Start Date</span>
            <span style={styles.dateValue}>{formatDate(license.startDate)}</span>
          </div>
          <div style={styles.dateItem}>
            <span style={styles.dateLabel}>Expiry Date</span>
            <span style={{ ...styles.dateValue, color: daysRemaining.color }}>
              {formatDate(license.expiryDate)}
            </span>
          </div>
          <div style={styles.dateItem}>
            <span style={styles.dateLabel}>Days Left</span>
            <span style={{ ...styles.dateValue, color: daysRemaining.color }}>
              {daysRemaining.days}
            </span>
          </div>
        </div>

        <div style={styles.featuresSection}>
          <div style={styles.sectionTitle}>Features</div>
          <div style={styles.featuresList}>
            {license.features.slice(0, 5).map((feature) => (
              <span
                key={feature.id}
                style={{
                  ...styles.featureBadge,
                  ...(feature.enabled ? styles.featureEnabled : styles.featureDisabled),
                }}
              >
                {feature.enabled ? <CheckCircle size={10} /> : <XCircle size={10} />}
                {feature.name}
              </span>
            ))}
            {license.features.length > 5 && (
              <span style={{ ...styles.featureBadge, ...styles.featureDisabled }}>
                +{license.features.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={styles.licenseFooter}>
        <span style={styles.footerMeta}>{license.contactEmail}</span>
        <div style={styles.actionButtons}>
          {onExport && (
            <button style={{ ...styles.iconButton, ...styles.exportButton }} onClick={onExport} title="Export">
              <Download size={14} />
            </button>
          )}
          {onRenew && license.status !== 'active' && (
            <button style={{ ...styles.iconButton, ...styles.renewButton }} onClick={onRenew} title="Renew">
              <RefreshCw size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.iconButton} onClick={onEdit} title="Edit">
              <Edit2 size={14} />
            </button>
          )}
          {onRevoke && license.status === 'active' && (
            <button style={{ ...styles.iconButton, ...styles.revokeButton }} onClick={onRevoke} title="Revoke">
              <XCircle size={14} />
            </button>
          )}
          {onDelete && (
            <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const LicenseManager: React.FC<LicenseManagerProps> = ({
  licenses,
  onCreateLicense,
  onViewLicense,
  onEditLicense,
  onRenewLicense,
  onRevokeLicense,
  onDeleteLicense,
  onExportLicense,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLicenses = licenses.filter(l =>
    l.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLicenses = licenses.filter(l => l.status === 'active').length;
  const expiredLicenses = licenses.filter(l => l.status === 'expired').length;
  const totalSeats = licenses.reduce((sum, l) => sum + l.seats, 0);
  const usedSeats = licenses.reduce((sum, l) => sum + l.usedSeats, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Key size={22} />
          License Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search licenses..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateLicense && (
            <button style={styles.createButton} onClick={onCreateLicense}>
              <Plus size={14} />
              New License
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{activeLicenses}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <XCircle size={20} />
          </div>
          <div style={styles.statValue}>{expiredLicenses}</div>
          <div style={styles.statLabel}>Expired</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div style={styles.statValue}>{totalSeats.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Seats</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Shield size={20} />
          </div>
          <div style={styles.statValue}>{usedSeats.toLocaleString()}</div>
          <div style={styles.statLabel}>Used Seats</div>
        </div>
      </div>

      {/* Licenses Grid */}
      {filteredLicenses.length === 0 ? (
        <div style={styles.empty}>
          <Key size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No licenses found</span>
        </div>
      ) : (
        <div style={styles.licensesGrid}>
          {filteredLicenses.map((license) => (
            <LicenseCard
              key={license.id}
              license={license}
              onView={onViewLicense ? () => onViewLicense(license.id) : undefined}
              onEdit={onEditLicense ? () => onEditLicense(license.id) : undefined}
              onRenew={onRenewLicense ? () => onRenewLicense(license.id) : undefined}
              onRevoke={onRevokeLicense ? () => onRevokeLicense(license.id) : undefined}
              onDelete={onDeleteLicense ? () => onDeleteLicense(license.id) : undefined}
              onExport={onExportLicense ? () => onExportLicense(license.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LicenseManager;
