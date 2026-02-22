import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Info, ExternalLink } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface SettingsRowProps {
  label: string;
  description?: string;
  helpText?: string;
  helpLink?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sectionHeaderClickable: {
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  sectionHeaderHover: {
    background: 'rgba(255, 255, 255, 0.04)',
  },
  sectionIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    flexShrink: 0,
  },
  sectionTitleArea: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  sectionDescription: {
    fontSize: '0.8125rem',
    color: '#888',
    marginTop: '0.125rem',
  },
  collapseIcon: {
    color: '#666',
    flexShrink: 0,
  },
  sectionBody: {
    padding: '1rem 1.25rem',
  },
  sectionBodyCollapsed: {
    display: 'none',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '2rem',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  rowLast: {
    borderBottom: 'none',
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
  },
  rowLabelText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#e4e4e7',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  required: {
    color: '#ef4444',
  },
  rowDescription: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.25rem',
    lineHeight: 1.4,
  },
  helpLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#818cf8',
    textDecoration: 'none',
    marginTop: '0.375rem',
  },
  rowControl: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.875rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  toggleLast: {
    borderBottom: 'none',
  },
  toggleLabel: {
    flex: 1,
    minWidth: 0,
  },
  toggleLabelText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  toggleDescription: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.125rem',
  },
  toggleSwitch: {
    position: 'relative',
    width: '44px',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleSwitchOn: {
    background: '#6366f1',
  },
  toggleSwitchDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    background: '#fff',
    borderRadius: '50%',
    transition: 'left 0.2s',
  },
  toggleKnobOn: {
    left: '22px',
  },
  infoIcon: {
    color: '#666',
    cursor: 'help',
  },
};

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon,
  collapsible = false,
  defaultCollapsed = false,
  children,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);

  const handleHeaderClick = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div style={styles.section} className={className}>
      <div
        style={{
          ...styles.sectionHeader,
          ...(collapsible ? styles.sectionHeaderClickable : {}),
          ...(collapsible && isHovered ? styles.sectionHeaderHover : {}),
        }}
        onClick={handleHeaderClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {icon && <div style={styles.sectionIcon}>{icon}</div>}
        <div style={styles.sectionTitleArea}>
          <h3 style={styles.sectionTitle}>{title}</h3>
          {description && <div style={styles.sectionDescription}>{description}</div>}
        </div>
        {collapsible && (
          <span style={styles.collapseIcon}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </span>
        )}
      </div>
      <div
        style={{
          ...styles.sectionBody,
          ...(isCollapsed ? styles.sectionBodyCollapsed : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  description,
  helpText,
  helpLink,
  required = false,
  children,
  className,
}) => (
  <div style={styles.row} className={className}>
    <div style={styles.rowLabel}>
      <div style={styles.rowLabelText}>
        {label}
        {required && <span style={styles.required}>*</span>}
        {helpText && (
          <span style={styles.infoIcon} title={helpText}>
            <Info size={14} />
          </span>
        )}
      </div>
      {description && <div style={styles.rowDescription}>{description}</div>}
      {helpLink && (
        <a
          href={helpLink}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.helpLink}
        >
          Learn more <ExternalLink size={12} />
        </a>
      )}
    </div>
    <div style={styles.rowControl}>{children}</div>
  </div>
);

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
}) => (
  <div style={styles.toggle} className={className}>
    <div style={styles.toggleLabel}>
      <div style={styles.toggleLabelText}>{label}</div>
      {description && <div style={styles.toggleDescription}>{description}</div>}
    </div>
    <div
      style={{
        ...styles.toggleSwitch,
        ...(checked ? styles.toggleSwitchOn : {}),
        ...(disabled ? styles.toggleSwitchDisabled : {}),
      }}
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <div
        style={{
          ...styles.toggleKnob,
          ...(checked ? styles.toggleKnobOn : {}),
        }}
      />
    </div>
  </div>
);

// Settings group for organizing multiple sections
interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  children,
  className,
}) => (
  <div style={{ marginBottom: '2rem' }} className={className}>
    {title && (
      <h2
        style={{
          fontSize: '0.6875rem',
          fontWeight: '600',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
        }}
      >
        {title}
      </h2>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {children}
    </div>
  </div>
);

// Danger zone for destructive actions
interface DangerZoneProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const DangerZone: React.FC<DangerZoneProps> = ({
  title = 'Danger Zone',
  description,
  children,
  className,
}) => (
  <div
    style={{
      background: 'rgba(239, 68, 68, 0.05)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '12px',
      padding: '1.25rem',
    }}
    className={className}
  >
    <h3
      style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: '#ef4444',
        margin: '0 0 0.25rem 0',
      }}
    >
      {title}
    </h3>
    {description && (
      <p style={{ fontSize: '0.8125rem', color: '#888', margin: '0 0 1rem 0' }}>
        {description}
      </p>
    )}
    {children}
  </div>
);

export default SettingsSection;
