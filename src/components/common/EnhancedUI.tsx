// ============== ENHANCED UI COMPONENTS ==============
// Modern, performant UI components for the IDE

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import styles from './EnhancedUI.module.css';

// ============== TOOLTIP ==============

interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = memo(({
  content,
  position = 'top',
  delay = 200,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  return (
    <div className={styles.tooltipWrapper} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div className={`${styles.tooltip} ${styles[`tooltip${position.charAt(0).toUpperCase() + position.slice(1)}`]}`}>
          {content}
        </div>
      )}
    </div>
  );
});

Tooltip.displayName = 'Tooltip';

// ============== BADGE ==============

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = memo(({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}) => (
  <span className={`${styles.badge} ${styles[variant]} ${styles[size]} ${dot ? styles.dot : ''} ${className || ''}`}>
    {children}
  </span>
));

Badge.displayName = 'Badge';

// ============== AVATAR ==============

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = memo(({
  src,
  name,
  size = 'md',
  status,
  className,
}) => {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7'];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`${styles.avatar} ${styles[size]} ${className || ''}`}>
      {src ? (
        <img src={src} alt={name} className={styles.avatarImage} />
      ) : (
        <div className={styles.avatarFallback} style={{ backgroundColor: colors[colorIndex] }}>
          {initials}
        </div>
      )}
      {status && <span className={`${styles.avatarStatus} ${styles[status]}`} />}
    </div>
  );
});

Avatar.displayName = 'Avatar';

// ============== CARD ==============

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = memo(({
  children,
  title,
  subtitle,
  actions,
  hoverable = false,
  className,
  onClick,
}) => (
  <div
    className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${onClick ? styles.clickable : ''} ${className || ''}`}
    onClick={onClick}
  >
    {(title || subtitle || actions) && (
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderText}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.cardActions}>{actions}</div>}
      </div>
    )}
    <div className={styles.cardContent}>{children}</div>
  </div>
));

Card.displayName = 'Card';

// ============== TABS ==============

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = memo(({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className,
}) => (
  <div className={`${styles.tabs} ${styles[variant]} ${className || ''}`}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''} ${tab.disabled ? styles.disabled : ''}`}
        onClick={() => !tab.disabled && onChange(tab.id)}
        disabled={tab.disabled}
      >
        {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
        <span>{tab.label}</span>
        {tab.badge !== undefined && tab.badge > 0 && (
          <span className={styles.tabBadge}>{tab.badge > 99 ? '99+' : tab.badge}</span>
        )}
      </button>
    ))}
  </div>
));

Tabs.displayName = 'Tabs';

// ============== SWITCH ==============

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Switch: React.FC<SwitchProps> = memo(({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className,
}) => (
  <label className={`${styles.switchWrapper} ${disabled ? styles.disabled : ''} ${className || ''}`}>
    <div className={`${styles.switch} ${styles[size]} ${checked ? styles.checked : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.switchInput}
      />
      <span className={styles.switchTrack}>
        <span className={styles.switchThumb} />
      </span>
    </div>
    {label && <span className={styles.switchLabel}>{label}</span>}
  </label>
));

Switch.displayName = 'Switch';

// ============== INPUT ==============

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  iconPosition = 'left',
  className,
  ...props
}, ref) => (
  <div className={`${styles.inputWrapper} ${className || ''}`}>
    {label && <label className={styles.inputLabel}>{label}</label>}
    <div className={`${styles.inputContainer} ${error ? styles.hasError : ''} ${icon ? styles[`icon${iconPosition.charAt(0).toUpperCase() + iconPosition.slice(1)}`] : ''}`}>
      {icon && iconPosition === 'left' && <span className={styles.inputIcon}>{icon}</span>}
      <input ref={ref} className={styles.input} {...props} />
      {icon && iconPosition === 'right' && <span className={styles.inputIcon}>{icon}</span>}
    </div>
    {error && <span className={styles.inputError}>{error}</span>}
  </div>
));

Input.displayName = 'Input';

// ============== BUTTON ==============

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  className,
  ...props
}, ref) => (
  <button
    ref={ref}
    className={`${styles.button} ${styles[variant]} ${styles[size]} ${loading ? styles.loading : ''} ${className || ''}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <span className={styles.buttonSpinner} />}
    {icon && iconPosition === 'left' && !loading && <span className={styles.buttonIcon}>{icon}</span>}
    {children && <span>{children}</span>}
    {icon && iconPosition === 'right' && !loading && <span className={styles.buttonIcon}>{icon}</span>}
  </button>
));

Button.displayName = 'Button';

// ============== DROPDOWN ==============

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (itemId: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = memo(({
  trigger,
  items,
  onSelect,
  align = 'left',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`${styles.dropdown} ${className || ''}`}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className={`${styles.dropdownMenu} ${styles[align]}`}>
          {items.map(item => (
            <button
              key={item.id}
              className={`${styles.dropdownItem} ${item.disabled ? styles.disabled : ''} ${item.danger ? styles.danger : ''}`}
              onClick={() => {
                if (!item.disabled) {
                  onSelect(item.id);
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
            >
              {item.icon && <span className={styles.dropdownIcon}>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

// ============== MODAL ==============

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

export const Modal: React.FC<ModalProps> = memo(({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={closeOnOverlay ? onClose : undefined}>
      <div className={`${styles.modal} ${styles[size]}`} onClick={e => e.stopPropagation()}>
        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button className={styles.modalClose} onClick={onClose}>×</button>
          </div>
        )}
        <div className={styles.modalContent}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default {
  Tooltip,
  Badge,
  Avatar,
  Card,
  Tabs,
  Switch,
  Input,
  Button,
  Dropdown,
  Modal,
};
