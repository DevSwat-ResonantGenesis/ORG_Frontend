/**
 * Copy Button Component
 * Copies text to clipboard and shows feedback
 */
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from '@/components/Icons/SettingsIcons';
import { Tooltip } from './Tooltip';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: 'small' | 'medium';
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  size = 'medium',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

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
    <Tooltip content={copied ? 'Copied!' : 'Copy to clipboard'}>
      <button
        className={`${styles.copyButton} ${styles[size]} ${className}`}
        onClick={handleCopy}
        type="button"
      >
        {copied ? (
          <>
            <CheckIcon size={size === 'small' ? 14 : 16} />
            {label && <span>Copied</span>}
          </>
        ) : (
          <>
            <CopyIcon size={size === 'small' ? 14 : 16} />
            {label && <span>{label}</span>}
          </>
        )}
      </button>
    </Tooltip>
  );
};

