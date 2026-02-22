import React, { useState } from 'react';
import { Globe, Plus, Search, Settings, Eye, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, Download, Upload, Languages, FileText, BarChart3 } from 'lucide-react';

type LocaleStatus = 'complete' | 'partial' | 'draft' | 'needs_review';
type TranslationStatus = 'translated' | 'pending' | 'machine' | 'needs_review';

interface TranslationKey {
  id: string;
  key: string;
  defaultValue: string;
  translations: Record<string, { value: string; status: TranslationStatus }>;
  context?: string;
  lastUpdated: Date;
}

interface Locale {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  status: LocaleStatus;
  completionRate: number;
  totalKeys: number;
  translatedKeys: number;
  pendingKeys: number;
  isDefault: boolean;
  isEnabled: boolean;
  lastUpdated: Date;
}

interface LocalizationManagerProps {
  locales: Locale[];
  translationKeys: TranslationKey[];
  onCreateLocale?: () => void;
  onEditLocale?: (localeId: string) => void;
  onToggleLocale?: (localeId: string) => void;
  onDeleteLocale?: (localeId: string) => void;
  onExportLocale?: (localeId: string) => void;
  onImportTranslations?: () => void;
  onEditKey?: (keyId: string) => void;
  className?: string;
}

interface LocaleCardProps {
  locale: Locale;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

const STATUS_CONFIG: Record<LocaleStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  complete: {
    label: 'Complete',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  partial: {
    label: 'Partial',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  draft: {
    label: 'Draft',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Edit2 size={12} />,
  },
  needs_review: {
    label: 'Needs Review',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
};

const TRANSLATION_STATUS_CONFIG: Record<TranslationStatus, {
  label: string;
  color: string;
}> = {
  translated: { label: 'Translated', color: '#10b981' },
  pending: { label: 'Pending', color: '#f59e0b' },
  machine: { label: 'Machine', color: '#3b82f6' },
  needs_review: { label: 'Review', color: '#ef4444' },
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
  actionButton: {
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
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '1.5rem',
  },
  localesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  localeCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.15s',
  },
  localeCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  localeCardDefault: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  localeHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  localeTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  localeFlag: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  localeInfo: {
    flex: 1,
  },
  localeName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  defaultBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
  },
  localeMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  localeCode: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
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
  progressSection: {
    marginBottom: '1rem',
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  progressLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  progressValue: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#e4e4e7',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  localeStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  localeActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  exportButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  keysSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  keysHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  keysTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  keysList: {
    maxHeight: '400px',
    overflow: 'auto',
  },
  keyItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  keyItemHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  keyName: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#818cf8',
    fontFamily: "'JetBrains Mono', monospace",
  },
  keyValue: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    lineHeight: 1.4,
  },
  keyContext: {
    fontSize: '0.6875rem',
    color: '#888',
    fontStyle: 'italic',
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

const getCompletionColor = (rate: number): string => {
  if (rate >= 90) return '#10b981';
  if (rate >= 70) return '#f59e0b';
  return '#ef4444';
};

const LocaleCard: React.FC<LocaleCardProps> = ({
  locale,
  onEdit,
  onToggle,
  onDelete,
  onExport,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[locale.status];

  return (
    <div
      style={{
        ...styles.localeCard,
        ...(isHovered ? styles.localeCardHover : {}),
        ...(locale.isDefault ? styles.localeCardDefault : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.localeHeader}>
        <div style={styles.localeTitle}>
          <div style={styles.localeFlag}>
            <Globe size={20} color="#818cf8" />
          </div>
          <div style={styles.localeInfo}>
            <div style={styles.localeName}>
              {locale.name} ({locale.nativeName})
              {locale.isDefault && <span style={styles.defaultBadge}>Default</span>}
            </div>
            <div style={styles.localeMeta}>
              <span style={styles.localeCode}>{locale.code}</span>
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
      </div>

      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Translation Progress</span>
          <span style={styles.progressValue}>{locale.completionRate.toFixed(1)}%</span>
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${locale.completionRate}%`,
              background: getCompletionColor(locale.completionRate),
            }}
          />
        </div>
      </div>

      <div style={styles.localeStats}>
        <span>{locale.translatedKeys.toLocaleString()} translated</span>
        <span>{locale.pendingKeys.toLocaleString()} pending</span>
        <span>{locale.totalKeys.toLocaleString()} total</span>
      </div>

      <div style={styles.localeActions}>
        {onExport && (
          <button style={{ ...styles.iconButton, ...styles.exportButton }} onClick={onExport} title="Export">
            <Download size={14} />
          </button>
        )}
        {onEdit && (
          <button style={styles.iconButton} onClick={onEdit} title="Edit">
            <Settings size={14} />
          </button>
        )}
        {onDelete && !locale.isDefault && (
          <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export const LocalizationManager: React.FC<LocalizationManagerProps> = ({
  locales,
  translationKeys,
  onCreateLocale,
  onEditLocale,
  onToggleLocale,
  onDeleteLocale,
  onExportLocale,
  onImportTranslations,
  onEditKey,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocales = locales.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledLocales = locales.filter(l => l.isEnabled).length;
  const totalKeys = translationKeys.length;
  const avgCompletion = locales.length > 0
    ? locales.reduce((sum, l) => sum + l.completionRate, 0) / locales.length
    : 0;
  const pendingTranslations = locales.reduce((sum, l) => sum + l.pendingKeys, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Globe size={22} />
          Localization Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search locales..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onImportTranslations && (
            <button style={styles.actionButton} onClick={onImportTranslations}>
              <Upload size={14} />
              Import
            </button>
          )}
          {onCreateLocale && (
            <button style={styles.createButton} onClick={onCreateLocale}>
              <Plus size={14} />
              Add Locale
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Languages size={20} />
          </div>
          <div style={styles.statValue}>{enabledLocales}</div>
          <div style={styles.statLabel}>Active Locales</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <FileText size={20} />
          </div>
          <div style={styles.statValue}>{totalKeys.toLocaleString()}</div>
          <div style={styles.statLabel}>Translation Keys</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{avgCompletion.toFixed(1)}%</div>
          <div style={styles.statLabel}>Avg Completion</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{pendingTranslations.toLocaleString()}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Locales */}
        <div style={styles.localesSection}>
          {filteredLocales.length === 0 ? (
            <div style={styles.empty}>
              <Globe size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <span>No locales found</span>
            </div>
          ) : (
            filteredLocales.map((locale) => (
              <LocaleCard
                key={locale.id}
                locale={locale}
                onEdit={onEditLocale ? () => onEditLocale(locale.id) : undefined}
                onToggle={onToggleLocale ? () => onToggleLocale(locale.id) : undefined}
                onDelete={onDeleteLocale ? () => onDeleteLocale(locale.id) : undefined}
                onExport={onExportLocale ? () => onExportLocale(locale.id) : undefined}
              />
            ))
          )}
        </div>

        {/* Translation Keys */}
        <div style={styles.keysSection}>
          <div style={styles.keysHeader}>
            <span style={styles.keysTitle}>Translation Keys</span>
          </div>
          <div style={styles.keysList}>
            {translationKeys.slice(0, 20).map((key) => (
              <div
                key={key.id}
                style={styles.keyItem}
                onClick={onEditKey ? () => onEditKey(key.id) : undefined}
              >
                <div style={styles.keyName}>{key.key}</div>
                <div style={styles.keyValue}>{key.defaultValue}</div>
                {key.context && <div style={styles.keyContext}>{key.context}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalizationManager;
