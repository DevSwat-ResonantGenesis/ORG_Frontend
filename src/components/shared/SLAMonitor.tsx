import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Calendar, BarChart3, RefreshCw, Search, ChevronRight, ChevronDown, Eye } from 'lucide-react';

type SLAStatus = 'met' | 'at_risk' | 'breached' | 'pending';
type SLAMetricType = 'uptime' | 'response_time' | 'resolution_time' | 'availability' | 'throughput';
type SLAPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface SLAMetric {
  id: string;
  name: string;
  type: SLAMetricType;
  target: number;
  current: number;
  unit: string;
  status: SLAStatus;
  trend: 'up' | 'down' | 'stable';
  history: { date: Date; value: number }[];
}

interface SLAContract {
  id: string;
  name: string;
  customer?: string;
  period: SLAPeriod;
  startDate: Date;
  endDate: Date;
  metrics: SLAMetric[];
  overallStatus: SLAStatus;
  compliancePercent: number;
}

interface SLAMonitorProps {
  contracts: SLAContract[];
  onViewContract?: (contractId: string) => void;
  onViewMetric?: (contractId: string, metricId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface ContractCardProps {
  contract: SLAContract;
  onView?: () => void;
  onViewMetric?: (metricId: string) => void;
}

const STATUS_CONFIG: Record<SLAStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  met: {
    label: 'Met',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={14} />,
  },
  at_risk: {
    label: 'At Risk',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={14} />,
  },
  breached: {
    label: 'Breached',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={14} />,
  },
  pending: {
    label: 'Pending',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={14} />,
  },
};

const METRIC_TYPE_CONFIG: Record<SLAMetricType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  uptime: { label: 'Uptime', icon: <Target size={14} />, color: '#10b981' },
  response_time: { label: 'Response Time', icon: <Clock size={14} />, color: '#3b82f6' },
  resolution_time: { label: 'Resolution Time', icon: <Clock size={14} />, color: '#8b5cf6' },
  availability: { label: 'Availability', icon: <CheckCircle size={14} />, color: '#14b8a6' },
  throughput: { label: 'Throughput', icon: <BarChart3 size={14} />, color: '#f59e0b' },
};

const PERIOD_CONFIG: Record<SLAPeriod, { label: string }> = {
  daily: { label: 'Daily' },
  weekly: { label: 'Weekly' },
  monthly: { label: 'Monthly' },
  quarterly: { label: 'Quarterly' },
  yearly: { label: 'Yearly' },
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
  contractsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contractCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  contractCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  contractHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  contractTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  contractIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractInfo: {
    flex: 1,
  },
  contractName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  contractMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  complianceScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: '0.6875rem',
    color: '#888',
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
  periodBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    padding: '1.25rem',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  metricCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  metricName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  metricType: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.6875rem',
    color: '#888',
  },
  metricValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.375rem',
    marginBottom: '0.5rem',
  },
  currentValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  targetValue: {
    fontSize: '0.75rem',
    color: '#888',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  trendIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.6875rem',
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

const getComplianceColor = (percent: number) => {
  if (percent >= 99) return '#10b981';
  if (percent >= 95) return '#f59e0b';
  return '#ef4444';
};

interface MetricCardProps {
  metric: SLAMetric;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[metric.status];
  const typeConfig = METRIC_TYPE_CONFIG[metric.type];
  const progressPercent = Math.min((metric.current / metric.target) * 100, 100);

  const trendColor = metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#888';
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Clock;

  return (
    <div
      style={{
        ...styles.metricCard,
        ...(isHovered ? styles.metricCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={styles.metricHeader}>
        <span style={styles.metricName}>{metric.name}</span>
        <span
          style={{
            ...styles.statusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color,
            padding: '0.125rem 0.375rem',
          }}
        >
          {statusConfig.icon}
        </span>
      </div>

      <div style={styles.metricValue}>
        <span style={styles.currentValue}>
          {metric.current}
          {metric.unit}
        </span>
        <span style={styles.targetValue}>
          / {metric.target}
          {metric.unit}
        </span>
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progressPercent}%`,
            background: statusConfig.color,
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...styles.metricType, color: typeConfig.color }}>
          {typeConfig.icon}
          {typeConfig.label}
        </span>
        <span style={{ ...styles.trendIndicator, color: trendColor }}>
          <TrendIcon size={12} />
          {metric.trend}
        </span>
      </div>
    </div>
  );
};

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onView,
  onViewMetric,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const statusConfig = STATUS_CONFIG[contract.overallStatus];
  const complianceColor = getComplianceColor(contract.compliancePercent);

  return (
    <div
      style={{
        ...styles.contractCard,
        ...(isHovered ? styles.contractCardHover : {}),
        borderLeftWidth: '4px',
        borderLeftColor: statusConfig.color,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.contractHeader}>
        <div style={styles.contractTitle}>
          <div
            style={{
              ...styles.contractIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Target size={22} />
          </div>
          <div style={styles.contractInfo}>
            <div style={styles.contractName}>{contract.name}</div>
            <div style={styles.contractMeta}>
              {contract.customer && <span>{contract.customer}</span>}
              <span style={styles.periodBadge}>
                {PERIOD_CONFIG[contract.period].label}
              </span>
              <span>
                <Calendar size={12} style={{ marginRight: '0.25rem' }} />
                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
              </span>
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
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={styles.complianceScore}>
            <span style={{ ...styles.scoreValue, color: complianceColor }}>
              {contract.compliancePercent.toFixed(1)}%
            </span>
            <span style={styles.scoreLabel}>Compliance</span>
          </div>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {onView && (
            <button style={styles.viewButton} onClick={onView}>
              <Eye size={12} />
              Details
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div style={styles.metricsGrid}>
          {contract.metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              onClick={onViewMetric ? () => onViewMetric(metric.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const SLAMonitor: React.FC<SLAMonitorProps> = ({
  contracts,
  onViewContract,
  onViewMetric,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContracts = contracts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalContracts = contracts.length;
  const metContracts = contracts.filter(c => c.overallStatus === 'met').length;
  const atRiskContracts = contracts.filter(c => c.overallStatus === 'at_risk').length;
  const breachedContracts = contracts.filter(c => c.overallStatus === 'breached').length;
  const avgCompliance = contracts.length > 0
    ? contracts.reduce((sum, c) => sum + c.compliancePercent, 0) / contracts.length
    : 0;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Target size={22} />
          SLA Monitor
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search SLAs..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
              Refresh
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
          <div style={styles.statValue}>{metContracts}</div>
          <div style={styles.statLabel}>SLAs Met</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{atRiskContracts}</div>
          <div style={styles.statLabel}>At Risk</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{breachedContracts}</div>
          <div style={styles.statLabel}>Breached</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{avgCompliance.toFixed(1)}%</div>
          <div style={styles.statLabel}>Avg Compliance</div>
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div style={styles.empty}>
          <Target size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No SLA contracts found</span>
        </div>
      ) : (
        <div style={styles.contractsList}>
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onView={onViewContract ? () => onViewContract(contract.id) : undefined}
              onViewMetric={onViewMetric ? (metricId) => onViewMetric(contract.id, metricId) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SLAMonitor;
