import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, FileText, Download, Calendar, ChevronRight, ChevronDown, Eye, RefreshCw, Search, Filter } from 'lucide-react';

type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'pending' | 'not_applicable';
type ComplianceFramework = 'gdpr' | 'hipaa' | 'soc2' | 'pci_dss' | 'iso27001' | 'ccpa';
type RequirementPriority = 'critical' | 'high' | 'medium' | 'low';

interface ComplianceRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  framework: ComplianceFramework;
  priority: RequirementPriority;
  status: ComplianceStatus;
  lastAssessed: Date;
  nextAssessment: Date;
  evidence?: string[];
  notes?: string;
}

interface ComplianceFrameworkData {
  id: string;
  framework: ComplianceFramework;
  name: string;
  description: string;
  totalRequirements: number;
  compliantCount: number;
  nonCompliantCount: number;
  partialCount: number;
  pendingCount: number;
  lastAudit?: Date;
  nextAudit?: Date;
}

interface ComplianceCenterProps {
  frameworks: ComplianceFrameworkData[];
  requirements: ComplianceRequirement[];
  onViewRequirement?: (requirementId: string) => void;
  onExportReport?: (frameworkId: string) => void;
  onScheduleAudit?: (frameworkId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<ComplianceStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  compliant: {
    label: 'Compliant',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={14} />,
  },
  non_compliant: {
    label: 'Non-Compliant',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={14} />,
  },
  partial: {
    label: 'Partial',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={14} />,
  },
  pending: {
    label: 'Pending',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Clock size={14} />,
  },
  not_applicable: {
    label: 'N/A',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={14} />,
  },
};

const FRAMEWORK_CONFIG: Record<ComplianceFramework, {
  name: string;
  color: string;
  shortName: string;
}> = {
  gdpr: { name: 'GDPR', color: '#3b82f6', shortName: 'GDPR' },
  hipaa: { name: 'HIPAA', color: '#10b981', shortName: 'HIPAA' },
  soc2: { name: 'SOC 2', color: '#8b5cf6', shortName: 'SOC2' },
  pci_dss: { name: 'PCI DSS', color: '#f59e0b', shortName: 'PCI' },
  iso27001: { name: 'ISO 27001', color: '#ec4899', shortName: 'ISO' },
  ccpa: { name: 'CCPA', color: '#14b8a6', shortName: 'CCPA' },
};

const PRIORITY_CONFIG: Record<RequirementPriority, {
  label: string;
  color: string;
}> = {
  critical: { label: 'Critical', color: '#ef4444' },
  high: { label: 'High', color: '#f59e0b' },
  medium: { label: 'Medium', color: '#3b82f6' },
  low: { label: 'Low', color: '#888' },
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
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  frameworkCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.15s',
  },
  frameworkCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  frameworkHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  frameworkTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  frameworkIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  frameworkName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  frameworkDescription: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  complianceScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  progressSegments: {
    display: 'flex',
    height: '100%',
  },
  progressSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
  },
  statDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  frameworkActions: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  actionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  requirementsSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sectionTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  filterBar: {
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
    width: '180px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tr: {
    transition: 'background 0.15s',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
  requirementCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  requirementCode: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '0.125rem',
  },
  requirementTitle: {
    fontWeight: '500',
    color: '#fff',
  },
  frameworkBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '700',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
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
  dateCell: {
    fontSize: '0.8125rem',
    color: '#888',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px',
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

interface FrameworkCardProps {
  framework: ComplianceFrameworkData;
  onExport?: () => void;
  onScheduleAudit?: () => void;
}

const FrameworkCard: React.FC<FrameworkCardProps> = ({
  framework,
  onExport,
  onScheduleAudit,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const config = FRAMEWORK_CONFIG[framework.framework];
  const compliancePercent = Math.round(
    (framework.compliantCount / framework.totalRequirements) * 100
  );
  const scoreColor = compliancePercent >= 80 ? '#10b981' : compliancePercent >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div
      style={{
        ...styles.frameworkCard,
        ...(isHovered ? styles.frameworkCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.frameworkHeader}>
        <div style={styles.frameworkTitle}>
          <div
            style={{
              ...styles.frameworkIcon,
              background: `${config.color}20`,
              color: config.color,
            }}
          >
            {config.shortName}
          </div>
          <div>
            <div style={styles.frameworkName}>{config.name}</div>
            <div style={styles.frameworkDescription}>{framework.description}</div>
          </div>
        </div>
        <div style={styles.complianceScore}>
          <span style={{ ...styles.scoreValue, color: scoreColor }}>{compliancePercent}%</span>
          <span style={styles.scoreLabel}>Compliant</span>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div style={styles.progressSegments}>
          <div
            style={{
              ...styles.progressSegment,
              width: `${(framework.compliantCount / framework.totalRequirements) * 100}%`,
              background: '#10b981',
            }}
          />
          <div
            style={{
              ...styles.progressSegment,
              width: `${(framework.partialCount / framework.totalRequirements) * 100}%`,
              background: '#f59e0b',
            }}
          />
          <div
            style={{
              ...styles.progressSegment,
              width: `${(framework.nonCompliantCount / framework.totalRequirements) * 100}%`,
              background: '#ef4444',
            }}
          />
          <div
            style={{
              ...styles.progressSegment,
              width: `${(framework.pendingCount / framework.totalRequirements) * 100}%`,
              background: '#3b82f6',
            }}
          />
        </div>
      </div>

      <div style={styles.statsRow}>
        <span style={styles.statItem}>
          <span style={{ ...styles.statDot, background: '#10b981' }} />
          {framework.compliantCount} Compliant
        </span>
        <span style={styles.statItem}>
          <span style={{ ...styles.statDot, background: '#f59e0b' }} />
          {framework.partialCount} Partial
        </span>
        <span style={styles.statItem}>
          <span style={{ ...styles.statDot, background: '#ef4444' }} />
          {framework.nonCompliantCount} Non-Compliant
        </span>
      </div>

      <div style={styles.frameworkActions}>
        {onExport && (
          <button style={styles.actionButton} onClick={onExport}>
            <Download size={14} />
            Export
          </button>
        )}
        {onScheduleAudit && (
          <button style={styles.actionButton} onClick={onScheduleAudit}>
            <Calendar size={14} />
            Schedule Audit
          </button>
        )}
      </div>
    </div>
  );
};

interface RequirementRowProps {
  requirement: ComplianceRequirement;
  onView?: () => void;
}

const RequirementRow: React.FC<RequirementRowProps> = ({
  requirement,
  onView,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const frameworkConfig = FRAMEWORK_CONFIG[requirement.framework];
  const statusConfig = STATUS_CONFIG[requirement.status];
  const priorityConfig = PRIORITY_CONFIG[requirement.priority];

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={styles.td}>
        <div style={styles.requirementCell}>
          <span style={styles.requirementCode}>{requirement.code}</span>
          <span style={styles.requirementTitle}>{requirement.title}</span>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.frameworkBadge,
            background: `${frameworkConfig.color}20`,
            color: frameworkConfig.color,
          }}
        >
          {frameworkConfig.shortName}
        </span>
      </td>
      <td style={styles.td}>
        <div style={{ ...styles.priorityDot, background: priorityConfig.color }} title={priorityConfig.label} />
      </td>
      <td style={styles.td}>
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
      </td>
      <td style={styles.td}>
        <span style={styles.dateCell}>{formatDate(requirement.lastAssessed)}</span>
      </td>
      <td style={styles.td}>
        <span style={styles.dateCell}>{formatDate(requirement.nextAssessment)}</span>
      </td>
      <td style={styles.td}>
        {onView && (
          <button style={styles.viewButton} onClick={onView}>
            <Eye size={12} />
            View
          </button>
        )}
      </td>
    </tr>
  );
};

export const ComplianceCenter: React.FC<ComplianceCenterProps> = ({
  frameworks,
  requirements,
  onViewRequirement,
  onExportReport,
  onScheduleAudit,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [frameworkFilter, setFrameworkFilter] = useState<ComplianceFramework | 'all'>('all');

  const filteredRequirements = requirements.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (frameworkFilter !== 'all' && r.framework !== frameworkFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        r.code.toLowerCase().includes(query) ||
        r.title.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Shield size={22} />
          Compliance Center
        </h2>
        <div style={styles.headerActions}>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Framework Overview */}
      <div style={styles.overviewGrid}>
        {frameworks.map((framework) => (
          <FrameworkCard
            key={framework.id}
            framework={framework}
            onExport={onExportReport ? () => onExportReport(framework.id) : undefined}
            onScheduleAudit={onScheduleAudit ? () => onScheduleAudit(framework.id) : undefined}
          />
        ))}
      </div>

      {/* Requirements Table */}
      <div style={styles.requirementsSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Requirements ({filteredRequirements.length})</span>
          <div style={styles.filterBar}>
            <div style={styles.searchInput}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search requirements..."
                style={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredRequirements.length === 0 ? (
          <div style={styles.empty}>
            <Shield size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No requirements found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Requirement</th>
                <th style={styles.th}>Framework</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Assessed</th>
                <th style={styles.th}>Next Assessment</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.map((requirement) => (
                <RequirementRow
                  key={requirement.id}
                  requirement={requirement}
                  onView={onViewRequirement ? () => onViewRequirement(requirement.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ComplianceCenter;
