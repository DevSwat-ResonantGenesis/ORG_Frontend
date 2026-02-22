import React, { useState, useCallback } from 'react';
import { Copy, Check, Clipboard } from 'lucide-react';

type CopyButtonVariant = 'default' | 'ghost' | 'outline';
type CopyButtonSize = 'sm' | 'md' | 'lg';

interface CopyButtonProps {
  text: string;
  variant?: CopyButtonVariant;
  size?: CopyButtonSize;
  showLabel?: boolean;
  label?: string;
  successLabel?: string;
  successDuration?: number;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

const SIZE_CONFIG: Record<CopyButtonSize, {
  padding: string;
  iconSize: number;
  fontSize: string;
  gap: string;
}> = {
  sm: { padding: '0.375rem', iconSize: 14, fontSize: '0.75rem', gap: '0.375rem' },
  md: { padding: '0.5rem', iconSize: 16, fontSize: '0.8125rem', gap: '0.5rem' },
  lg: { padding: '0.625rem', iconSize: 18, fontSize: '0.875rem', gap: '0.5rem' },
};

const VARIANT_STYLES: Record<CopyButtonVariant, React.CSSProperties> = {
  default: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
};

const styles: Record<string, React.CSSProperties> = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonHover: {
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.12)',
  },
  buttonSuccess: {
    color: '#10b981',
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  label: {
    fontWeight: '500',
  },
};

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label = 'Copy',
  successLabel = 'Copied!',
  successDuration = 2000,
  onCopy,
  onError,
  disabled = false,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sizeConfig = SIZE_CONFIG[size];

  const handleCopy = useCallback(async () => {
    if (disabled || copied) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();

      setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (err) {
      onError?.(err as Error);
    }
  }, [text, disabled, copied, successDuration, onCopy, onError]);

  const Icon = copied ? Check : Copy;

  return (
    <button
      style={{
        ...styles.button,
        ...VARIANT_STYLES[variant],
        ...(isHovered && !disabled ? styles.buttonHover : {}),
        ...(copied ? styles.buttonSuccess : {}),
        ...(disabled ? styles.buttonDisabled : {}),
        padding: showLabel ? `${sizeConfig.padding} 0.75rem` : sizeConfig.padding,
        gap: sizeConfig.gap,
      }}
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      title={copied ? successLabel : label}
      className={className}
    >
      <Icon size={sizeConfig.iconSize} />
      {showLabel && (
        <span style={{ ...styles.label, fontSize: sizeConfig.fontSize }}>
          {copied ? successLabel : label}
        </span>
      )}
    </button>
  );
};

// Copy to clipboard hook
export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string, duration = 2000) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);

      setTimeout(() => {
        setCopied(false);
      }, duration);

      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }, []);

  return { copied, error, copy };
};

// Copyable text wrapper
interface CopyableTextProps {
  text: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export const CopyableText: React.FC<CopyableTextProps> = ({
  text,
  children,
  showIcon = true,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        cursor: 'pointer',
        padding: '0.125rem 0.375rem',
        borderRadius: '4px',
        background: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        transition: 'all 0.15s',
      }}
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={copied ? 'Copied!' : 'Click to copy'}
      className={className}
    >
      {children || text}
      {showIcon && (
        <span style={{ color: copied ? '#10b981' : '#666', flexShrink: 0 }}>
          {copied ? <Check size={12} /> : <Clipboard size={12} />}
        </span>
      )}
    </span>
  );
};

// Code copy block
interface CodeCopyProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeCopy: React.FC<CodeCopyProps> = ({
  code,
  language,
  className,
}) => (
  <div
    style={{
      position: 'relative',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '8px',
      padding: '1rem',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.8125rem',
      color: '#e4e4e7',
      overflow: 'auto',
    }}
    className={className}
  >
    <CopyButton
      text={code}
      variant="ghost"
      size="sm"
      style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
      }}
    />
    {language && (
      <span
        style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.75rem',
          fontSize: '0.6875rem',
          color: '#666',
          textTransform: 'uppercase',
        }}
      >
        {language}
      </span>
    )}
    <pre style={{ margin: 0, marginTop: language ? '1rem' : 0, whiteSpace: 'pre-wrap' }}>
      {code}
    </pre>
  </div>
);

export default CopyButton;
