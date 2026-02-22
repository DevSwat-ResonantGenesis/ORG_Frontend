import React, { useState } from 'react';
import { ChevronRight, MoreVertical, Check } from 'lucide-react';

type ListItemVariant = 'default' | 'compact' | 'card' | 'selectable';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  badge?: React.ReactNode;
  trailing?: React.ReactNode;
  variant?: ListItemVariant;
  selected?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  onClick?: () => void;
  onSelect?: (selected: boolean) => void;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.875rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    width: '100%',
    textAlign: 'left',
  },
  itemHover: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  itemSelected: {
    background: 'rgba(99, 102, 241, 0.1)',
  },
  itemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  itemCompact: {
    padding: '0.625rem 0.875rem',
    gap: '0.75rem',
  },
  itemCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    marginBottom: '0.5rem',
  },
  itemCardHover: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  leading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  iconWrapperCompact: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#fff',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  titleCompact: {
    fontSize: '0.8125rem',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.125rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#666',
    marginTop: '0.375rem',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  trailing: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  chevron: {
    color: '#666',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.15s',
  },
  checkboxSelected: {
    background: '#6366f1',
    borderColor: '#6366f1',
  },
};

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  icon,
  avatar,
  badge,
  trailing,
  variant = 'default',
  selected = false,
  disabled = false,
  showChevron = false,
  onClick,
  onSelect,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isCompact = variant === 'compact';
  const isCard = variant === 'card';
  const isSelectable = variant === 'selectable';

  const handleClick = () => {
    if (disabled) return;
    if (isSelectable && onSelect) {
      onSelect(!selected);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      style={{
        ...styles.item,
        ...(isCompact ? styles.itemCompact : {}),
        ...(isCard ? styles.itemCard : {}),
        ...(isHovered && !disabled
          ? isCard
            ? styles.itemCardHover
            : styles.itemHover
          : {}),
        ...(selected ? styles.itemSelected : {}),
        ...(disabled ? styles.itemDisabled : {}),
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      role={onClick || onSelect ? 'button' : undefined}
      tabIndex={onClick || onSelect ? 0 : undefined}
    >
      {isSelectable && (
        <div
          style={{
            ...styles.checkbox,
            ...(selected ? styles.checkboxSelected : {}),
          }}
        >
          {selected && <Check size={14} color="#fff" />}
        </div>
      )}

      {(icon || avatar) && (
        <div style={styles.leading}>
          {avatar || (
            <div
              style={{
                ...styles.iconWrapper,
                ...(isCompact ? styles.iconWrapperCompact : {}),
              }}
            >
              {icon}
            </div>
          )}
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.titleRow}>
          <h4
            style={{
              ...styles.title,
              ...(isCompact ? styles.titleCompact : {}),
            }}
          >
            {title}
          </h4>
          {badge}
        </div>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        {description && <p style={styles.description}>{description}</p>}
      </div>

      <div style={styles.trailing}>
        {trailing}
        {showChevron && <ChevronRight size={18} style={styles.chevron} />}
      </div>
    </div>
  );
};

// List container
interface ListProps {
  children: React.ReactNode;
  dividers?: boolean;
  className?: string;
}

export const List: React.FC<ListProps> = ({
  children,
  dividers = false,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      ...(dividers
        ? {
            '& > *:not(:last-child)': {
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            },
          }
        : {}),
    }}
    className={className}
  >
    {children}
  </div>
);

// List section with header
interface ListSectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const ListSection: React.FC<ListSectionProps> = ({
  title,
  children,
  action,
  className,
}) => (
  <div style={{ marginBottom: '1.5rem' }} className={className}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
        padding: '0 0.5rem',
      }}
    >
      <h3
        style={{
          fontSize: '0.6875rem',
          fontWeight: '600',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

export default ListItem;
