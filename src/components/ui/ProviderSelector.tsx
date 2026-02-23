import React, { useState, useRef, useEffect } from 'react';
import {
  AutoIcon,
  ChatGPTIcon,
  GeminiIcon,
  ClaudeIcon,
  MistralIcon,
  ChevronDownIcon,
} from '@/components/Icons/ProviderIcons';
import { fetchLiveProviders, formatLatency } from '@/api/providers';
import styles from './ProviderSelector.module.css';

export type Provider = 'auto' | 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'groq' | 'local' | 'codellama';

export type ProviderHealth = 'healthy' | 'degraded' | 'down';

export interface ProviderStats {
  latency?: number;
  cost?: number;
  health?: ProviderHealth;
}

interface ProviderOption {
  value: Provider;
  label: string;
  icon: React.ReactNode;
  stats?: ProviderStats;
  recommended?: boolean;
  isAvailable?: boolean;
  model?: string;
  latency?: number;
  has_user_key?: boolean;
  uses_credits?: boolean;
}

interface ProviderSelectorProps {
  selectedProvider: Provider;
  onProviderChange: (provider: Provider) => void;
  autoReason?: string;
  className?: string;
  showStats?: boolean;
  providerStats?: Record<Provider, ProviderStats>;
  availableProviders?: Provider[];
}

const getProviderIcon = (providerId: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'auto': <AutoIcon className={styles.providerIcon} />,
    'openai': <ChatGPTIcon className={styles.providerIcon} />,
    'chatgpt': <ChatGPTIcon className={styles.providerIcon} />,
    'anthropic': <ClaudeIcon className={styles.providerIcon} />,
    'claude': <ClaudeIcon className={styles.providerIcon} />,
    'gemini': <GeminiIcon className={styles.providerIcon} />,
    'google': <GeminiIcon className={styles.providerIcon} />,
    'mistral': <MistralIcon className={styles.providerIcon} />,
    'groq': <MistralIcon className={styles.providerIcon} />,
    'local': <span style={{ fontSize: '16px' }}>🖥️</span>,
    'codellama': <span style={{ fontSize: '16px' }}>💻</span>,
  };
  return iconMap[providerId.toLowerCase()] || <AutoIcon className={styles.providerIcon} />;
};

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  autoReason,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [providers, setProviders] = useState<ProviderOption[]>([
    { value: 'auto', label: 'Auto', icon: <AutoIcon className={styles.providerIcon} />, isAvailable: true }
  ]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const loadProviders = async () => {
    try {
      const data = await fetchLiveProviders();
      if (data.providers && data.providers.length > 0) {
        const liveProviders: ProviderOption[] = [
          { 
            value: 'auto', 
            label: 'Auto', 
            icon: <AutoIcon className={styles.providerIcon} />, 
            isAvailable: true,
            recommended: true,
          },
          ...data.providers.map((p) => ({
            value: p.id as Provider,
            label: p.name,
            icon: getProviderIcon(p.id),
            isAvailable: p.available,
            model: p.model,
            latency: p.latency,
            has_user_key: p.has_user_key,
            uses_credits: p.uses_credits,
            stats: {
              latency: p.latency,
              health: p.available ? 'healthy' as ProviderHealth : 'down' as ProviderHealth,
            }
          }))
        ];
        setProviders(liveProviders);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
    pollIntervalRef.current = window.setInterval(loadProviders, 15000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = providers.find(p => p.value === selectedProvider) || providers[0];

  const handleSelect = (provider: Provider) => {
    onProviderChange(provider);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.providerSelector} ${className}`}>
      <button
        ref={buttonRef}
        className={styles.selectorButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
      >
        <span className={styles.selectorLabel}>{selectedOption.label}</span>
        {selectedOption.latency && (
          <span className={styles.latencyBadge}>• {formatLatency(selectedOption.latency)}</span>
        )}
        <ChevronDownIcon className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} ref={dropdownRef} role="listbox">
          <div className={styles.dropdownHeader}>SELECT PROVIDER</div>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <div className={styles.optionRow}>
              {providers.map((provider) => (
                <button
                  key={provider.value}
                  className={`${styles.optionChip} ${selectedProvider === provider.value ? styles.optionChipActive : ''} ${!provider.isAvailable && provider.value !== 'auto' ? styles.disabled : ''}`}
                  onClick={() => provider.isAvailable && handleSelect(provider.value)}
                  type="button"
                  disabled={!provider.isAvailable && provider.value !== 'auto'}
                >
                  <div className={styles.optionContent}>
                    <div className={styles.optionMain}>
                      <span className={styles.optionIcon}>{provider.icon}</span>
                      <span className={styles.optionLabel}>{provider.label}</span>
                      {provider.isAvailable && provider.value !== 'auto' && (
                        <span className={styles.onlineBadge} title="Online">●</span>
                      )}
                      {provider.value === 'auto' && (
                        <span className={styles.smartBadge}>SMART</span>
                      )}
                    </div>
                    {provider.latency && (
                      <span className={styles.latencyText}>• {formatLatency(provider.latency)}</span>
                    )}
                    {!provider.uses_credits && provider.value !== 'auto' && (
                      <span className={styles.freeBadge}>FREE</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
