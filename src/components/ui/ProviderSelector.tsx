import React, { useState, useRef, useEffect } from 'react';
import {
  AutoIcon,
  ChatGPTIcon,
  ClaudeIcon,
  GeminiIcon,
  MistralIcon,
  CohereIcon,
  GroqIcon,
  ChevronDownIcon
} from '@/components/Icons/ResonantChatIcons';
import styles from './ProviderSelector.module.css';

export type Provider = 'auto' | 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'cohere' | 'groq';

export type ProviderHealth = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface ProviderStats {
  health?: ProviderHealth;
  latency?: number; // in milliseconds
  cost?: number; // cost per 1K tokens
  errorRate?: number; // percentage
  lastChecked?: Date;
}

interface ProviderOption {
  value: Provider;
  label: string;
  icon: React.ReactNode;
  stats?: ProviderStats;
  recommended?: boolean;
  isAvailable?: boolean;
  isComingSoon?: boolean;
}

export interface ProviderSelectorProps {
  selectedProvider: Provider;
  onProviderChange: (provider: Provider) => void;
  autoReason?: string;
  className?: string;
  showStats?: boolean; // Show health, cost, latency
  providerStats?: Record<Provider, ProviderStats>; // Stats for each provider
  availableProviders?: Provider[]; // Providers with valid API keys
}

const getDefaultProviders = (providerStats?: Record<Provider, ProviderStats>, userAvailableProviders?: Provider[]): ProviderOption[] => {
  // Available providers - use user's configured providers or default to all
  const availableProviders: Provider[] = userAvailableProviders && userAvailableProviders.length > 0 
    ? ['auto', ...userAvailableProviders] 
    : ['auto', 'openai', 'anthropic', 'gemini', 'mistral', 'groq'];
  // Coming soon providers (providers not in available list)
  const allProviders: Provider[] = ['openai', 'anthropic', 'gemini', 'mistral', 'cohere', 'groq'];
  const comingSoonProviders: Provider[] = allProviders.filter(p => !availableProviders.includes(p));
  
  const baseProviders: Omit<ProviderOption, 'stats' | 'recommended'>[] = [
    { value: 'auto', label: 'Auto', icon: <AutoIcon className={styles.providerIcon} /> },
    { value: 'openai', label: 'ChatGPT', icon: <ChatGPTIcon className={styles.providerIcon} /> },
    { value: 'anthropic', label: 'Claude', icon: <ClaudeIcon className={styles.providerIcon} /> },
    { value: 'gemini', label: 'Gemini', icon: <GeminiIcon className={styles.providerIcon} /> },
    { value: 'mistral', label: 'Mistral', icon: <MistralIcon className={styles.providerIcon} /> },
    { value: 'cohere', label: 'Cohere', icon: <CohereIcon className={styles.providerIcon} /> },
    { value: 'groq', label: 'Groq', icon: <GroqIcon className={styles.providerIcon} /> },
  ];

  // Find recommended provider (lowest cost + latency, healthy)
  let recommendedProvider: Provider | null = null;
  if (providerStats) {
    const healthyProviders = Object.entries(providerStats)
      .filter(([_, stats]) => stats.health === 'healthy')
      .map(([provider, stats]) => ({
        provider: provider as Provider,
        score: (stats.cost || 0) + (stats.latency || 0) / 10, // Combined score
      }))
      .sort((a, b) => a.score - b.score);

    if (healthyProviders.length > 0) {
      recommendedProvider = healthyProviders[0].provider;
    }
  }

  return baseProviders.map(provider => ({
    ...provider,
    stats: providerStats?.[provider.value] || (availableProviders.includes(provider.value) ? { health: 'healthy' as ProviderHealth } : undefined),
    recommended: provider.value === recommendedProvider && provider.value !== 'auto',
    isAvailable: availableProviders.includes(provider.value),
    isComingSoon: comingSoonProviders.includes(provider.value),
  }));
};

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  autoReason,
  className = '',
  showStats = true,
  providerStats,
  availableProviders: userAvailableProviders
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownPositionRef = useRef<{ top: number; right: number } | null>(null);
  const providers = getDefaultProviders(providerStats, userAvailableProviders);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const updateDropdownPosition = () => {
      if (isOpen && buttonRef.current && dropdownRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 280; // max-width from CSS
        const dropdownHeight = dropdownRef.current.offsetHeight || 300;
        
        // Position from right side of button (opens to the left)
        let right = window.innerWidth - buttonRect.right;
        let top = buttonRect.top - dropdownHeight - 8;
        
        // If not enough space above, position below
        if (top < 10) {
          top = buttonRect.bottom + 8;
        }
        
        // Ensure it doesn't overflow right edge (minimum 10px from edge)
        if (right < 10) {
          right = 10;
        }
        
        // Ensure it doesn't overflow left edge
        const left = window.innerWidth - right - dropdownWidth;
        if (left < 10) {
          right = window.innerWidth - dropdownWidth - 10;
        }
        
        // Ensure it doesn't overflow bottom
        if (top + dropdownHeight > window.innerHeight - 10) {
          top = window.innerHeight - dropdownHeight - 10;
        }
        
        dropdownPositionRef.current = { top, right };
        dropdownRef.current.style.top = `${top}px`;
        dropdownRef.current.style.right = `${right}px`;
        dropdownRef.current.style.left = 'auto';
        dropdownRef.current.style.bottom = 'auto';
      }
    };

    if (isOpen) {
      // Set initial position immediately and on next frame
      updateDropdownPosition();
      requestAnimationFrame(() => {
        updateDropdownPosition();
      });
      // Also update after a short delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        updateDropdownPosition();
      }, 10);
      
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
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
        title={selectedProvider === 'auto' && autoReason ? autoReason : `Selected: ${selectedOption.label}`}
        aria-label={`Select AI model. Current: ${selectedOption.label}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={styles.selectorLabel}>{selectedOption.label}</span>
        <ChevronDownIcon className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div 
          className={styles.dropdown} 
          ref={dropdownRef} 
          role="listbox"
          style={{
            position: 'fixed',
            zIndex: 10000,
          }}
        >
          <div className={styles.optionRow}>
          {providers.map((provider) => {
            const stats = provider.stats;
            const isAvailable = provider.isAvailable ?? false;
            const isComingSoon = provider.isComingSoon ?? false;
            
            return (
              <button
                key={provider.value}
                className={`${styles.optionChip} ${selectedProvider === provider.value ? styles.optionChipActive : ''} ${provider.recommended ? styles.recommended : ''} ${isComingSoon ? styles.comingSoon : ''}`}
                onClick={() => !isComingSoon && handleSelect(provider.value)}
                type="button"
                disabled={isComingSoon}
                title={isComingSoon ? 'Coming soon' : provider.recommended ? 'Recommended provider' : isAvailable ? 'Online' : undefined}
              >
                <div className={styles.optionContent}>
                  <div className={styles.optionMain}>
                    <span className={styles.optionIcon}>{provider.icon}</span>
                    <span className={styles.optionLabel}>{provider.label}</span>
                    {isAvailable && !isComingSoon && (
                      <span className={styles.onlineBadge} title="Online">●</span>
                    )}
                    {isComingSoon && (
                      <span className={styles.comingSoonBadge} title="Coming soon">Soon</span>
                    )}
                    {provider.recommended && !isComingSoon && (
                      <span className={styles.recommendedBadge} title="Recommended">⭐</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          </div>
          {selectedProvider === 'auto' && autoReason && (
            <p className={styles.autoReason}>{autoReason}</p>
          )}
        </div>
      )}
    </div>
  );
};

