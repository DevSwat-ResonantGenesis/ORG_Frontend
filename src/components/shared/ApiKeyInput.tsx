import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Copy, Check, RefreshCw, Trash2, Key, Shield } from 'lucide-react';

interface ApiKeyInputProps {
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  showCopy?: boolean;
  showReveal?: boolean;
  showRegenerate?: boolean;
  showDelete?: boolean;
  onRegenerate?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

interface ApiKeyDisplayProps {
  apiKey: string;
  label?: string;
  createdAt?: Date;
  lastUsed?: Date;
  permissions?: string[];
  onRevoke?: () => void;
  onCopy?: () => void;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    transition: 'all 0.2s',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
  },
  keyIcon: {
    color: '#666',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.875rem',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    letterSpacing: '0.05em',
  },
  inputHidden: {
    WebkitTextSecurity: 'disc',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  actionButtonDanger: {
    color: '#ef4444',
  },
  actionButtonDangerHover: {
    background: 'rgba(239, 68, 68, 0.15)',
  },
  actionButtonSuccess: {
    color: '#10b981',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardLabel: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  cardKey: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    color: '#888',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  permissions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginTop: '0.75rem',
  },
  permissionBadge: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    color: '#818cf8',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Enter API key...',
  showCopy = true,
  showReveal = true,
  showRegenerate = false,
  showDelete = false,
  onRegenerate,
  onDelete,
  disabled = false,
  readOnly = false,
  className,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const maskedValue = isRevealed ? value : value.replace(/./g, '•');

  return (
    <div style={styles.container} className={className}>
      {label && <label style={styles.label}>{label}</label>}
      <div
        style={{
          ...styles.inputWrapper,
          ...(isFocused ? styles.inputWrapperFocused : {}),
        }}
      >
        <Key size={16} style={styles.keyIcon} />
        <input
          ref={inputRef}
          type={isRevealed ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          style={styles.input}
          autoComplete="off"
        />
        <div style={styles.actions}>
          {showReveal && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'reveal' ? styles.actionButtonHover : {}),
              }}
              onClick={() => setIsRevealed(!isRevealed)}
              onMouseEnter={() => setHoveredAction('reveal')}
              onMouseLeave={() => setHoveredAction(null)}
              title={isRevealed ? 'Hide' : 'Reveal'}
              type="button"
            >
              {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          {showCopy && value && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'copy' ? styles.actionButtonHover : {}),
                ...(copied ? styles.actionButtonSuccess : {}),
              }}
              onClick={handleCopy}
              onMouseEnter={() => setHoveredAction('copy')}
              onMouseLeave={() => setHoveredAction(null)}
              title={copied ? 'Copied!' : 'Copy'}
              type="button"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
          {showRegenerate && onRegenerate && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'regenerate' ? styles.actionButtonHover : {}),
              }}
              onClick={onRegenerate}
              onMouseEnter={() => setHoveredAction('regenerate')}
              onMouseLeave={() => setHoveredAction(null)}
              title="Regenerate"
              type="button"
            >
              <RefreshCw size={14} />
            </button>
          )}
          {showDelete && onDelete && (
            <button
              style={{
                ...styles.actionButton,
                ...styles.actionButtonDanger,
                ...(hoveredAction === 'delete' ? styles.actionButtonDangerHover : {}),
              }}
              onClick={onDelete}
              onMouseEnter={() => setHoveredAction('delete')}
              onMouseLeave={() => setHoveredAction(null)}
              title="Delete"
              type="button"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ApiKeyDisplay: React.FC<ApiKeyDisplayProps> = ({
  apiKey,
  label = 'API Key',
  createdAt,
  lastUsed,
  permissions,
  onRevoke,
  onCopy,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const maskedKey = apiKey.slice(0, 8) + '...' + apiKey.slice(-4);

  return (
    <div style={styles.card} className={className}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>
            <Shield size={16} color="#818cf8" />
            <span style={styles.cardLabel}>{label}</span>
          </div>
          <code style={styles.cardKey}>{maskedKey}</code>
        </div>
        <div style={styles.cardActions}>
          <button
            style={{
              ...styles.actionButton,
              ...(hoveredAction === 'copy' ? styles.actionButtonHover : {}),
              ...(copied ? styles.actionButtonSuccess : {}),
            }}
            onClick={handleCopy}
            onMouseEnter={() => setHoveredAction('copy')}
            onMouseLeave={() => setHoveredAction(null)}
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {onRevoke && (
            <button
              style={{
                ...styles.actionButton,
                ...styles.actionButtonDanger,
                ...(hoveredAction === 'revoke' ? styles.actionButtonDangerHover : {}),
              }}
              onClick={onRevoke}
              onMouseEnter={() => setHoveredAction('revoke')}
              onMouseLeave={() => setHoveredAction(null)}
              title="Revoke"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.cardMeta}>
        {createdAt && <span>Created {formatDate(createdAt)}</span>}
        {lastUsed && <span>Last used {formatDate(lastUsed)}</span>}
      </div>

      {permissions && permissions.length > 0 && (
        <div style={styles.permissions}>
          {permissions.map((perm) => (
            <span key={perm} style={styles.permissionBadge}>
              {perm}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput;
