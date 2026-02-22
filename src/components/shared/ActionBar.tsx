import React, { useState } from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

interface ActionButton {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface ActionBarProps {
  title?: string;
  subtitle?: string;
  breadcrumb?: React.ReactNode;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  moreActions?: ActionButton[];
  children?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#ccc',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  ghost: {
    background: 'transparent',
    color: '#888',
    border: '1px solid transparent',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  containerSticky: {
    position: 'sticky',
    top: 0,
    background: '#0a0a0f',
    zIndex: 50,
    padding: '1rem 1.5rem',
    margin: '0 -1.5rem',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: 0,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8125rem',
    color: '#888',
    margin: 0,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: 'wait',
  },
  iconButton: {
    padding: '0.5rem',
  },
  moreButton: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.375rem',
    minWidth: '160px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    padding: '0.375rem',
    zIndex: 100,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
  },
  dropdownItemHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  dropdownItemDanger: {
    color: '#ef4444',
  },
  dropdownItemDangerHover: {
    background: 'rgba(239, 68, 68, 0.15)',
  },
};

const ActionButton: React.FC<{
  action: ActionButton;
  iconOnly?: boolean;
}> = ({ action, iconOnly = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const variantStyle = VARIANT_STYLES[action.variant || 'secondary'];

  return (
    <button
      style={{
        ...styles.button,
        ...variantStyle,
        ...(iconOnly ? styles.iconButton : {}),
        ...(action.disabled ? styles.buttonDisabled : {}),
        ...(action.loading ? styles.buttonLoading : {}),
        ...(isHovered && !action.disabled ? { opacity: 0.9 } : {}),
      }}
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={iconOnly ? action.label : undefined}
    >
      {action.loading ? (
        <span style={{ width: '16px', height: '16px' }}>...</span>
      ) : (
        action.icon
      )}
      {!iconOnly && action.label}
    </button>
  );
};

const MoreActionsDropdown: React.FC<{
  actions: ActionButton[];
}> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div style={styles.moreButton}>
      <button
        style={{
          ...styles.button,
          ...VARIANT_STYLES.ghost,
          ...styles.iconButton,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={styles.dropdown}>
            {actions.map((action) => {
              const isDanger = action.variant === 'danger';
              const isHovered = hoveredItem === action.id;

              return (
                <button
                  key={action.id}
                  style={{
                    ...styles.dropdownItem,
                    ...(isDanger ? styles.dropdownItemDanger : {}),
                    ...(isHovered
                      ? isDanger
                        ? styles.dropdownItemDangerHover
                        : styles.dropdownItemHover
                      : {}),
                  }}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHoveredItem(action.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  disabled={action.disabled}
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const ActionBar: React.FC<ActionBarProps> = ({
  title,
  subtitle,
  breadcrumb,
  primaryAction,
  secondaryActions = [],
  moreActions = [],
  children,
  sticky = false,
  className,
}) => (
  <div
    style={{
      ...styles.container,
      ...(sticky ? styles.containerSticky : {}),
    }}
    className={className}
  >
    <div style={styles.left}>
      {breadcrumb}
      {title && <h1 style={styles.title}>{title}</h1>}
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
    </div>

    <div style={styles.right}>
      {children}

      {secondaryActions.map((action) => (
        <ActionButton key={action.id} action={action} />
      ))}

      {primaryAction && <ActionButton action={primaryAction} />}

      {moreActions.length > 0 && <MoreActionsDropdown actions={moreActions} />}
    </div>
  </div>
);

// Page header variant
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '1.5rem',
      marginBottom: '1.5rem',
    }}
    className={className}
  >
    <div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#fff',
          margin: 0,
          marginBottom: description ? '0.375rem' : 0,
        }}
      >
        {title}
      </h1>
      {description && (
        <p style={{ fontSize: '0.875rem', color: '#888', margin: 0 }}>
          {description}
        </p>
      )}
    </div>
    {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
  </div>
);

export default ActionBar;
