import React, { useState, useRef, useEffect } from 'react';
import {
  AutoIcon,
  ChatGPTIcon,
  GeminiIcon,
  ClaudeIcon,
  MistralIcon,
  ChevronDownIcon,
  CheckmarkIcon
} from '@/components/Icons/ProviderIcons';
import styles from './ProviderSelector.module.css';

export interface LLMProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  description: string;
}

const providers: LLMProvider[] = [
  {
    id: 'auto',
    name: 'Auto Recommended',
    icon: <AutoIcon />,
    available: true,
    description: 'System selects best provider',
  },
  {
    id: 'openai',
    name: 'ChatGPT',
    icon: <ChatGPTIcon />,
    available: false,
    description: 'Best for coding and technical queries',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: <GeminiIcon />,
    available: false,
    description: 'Best for analysis and memory integration',
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: <ClaudeIcon />,
    available: false,
    description: 'Best for creative writing and reasoning',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    icon: <MistralIcon />,
    available: false,
    description: 'Best for multilingual and general tasks',
  },
];

interface ProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
  autoReason?: string;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  autoReason,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const selectedProviderData = providers.find(p => p.id === selectedProvider) || providers[0];

  const handleProviderSelect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider && (provider.available || provider.id === 'auto')) {
      onProviderChange(providerId);
      setShowDropdown(false);
    }
  };

  return (
    <div className={styles.providerSelector} ref={dropdownRef}>
      <button
        className={`${styles.providerButton} ${showDropdown ? styles.active : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label={`Select LLM provider: ${selectedProviderData.name}`}
        title={selectedProvider === 'auto' && autoReason ? autoReason : selectedProviderData.description}
      >
        <ChevronDownIcon className={styles.chevronIcon} />
        <span className={styles.providerIcon}>{selectedProviderData.icon}</span>
        <span className={styles.providerName}>{selectedProviderData.name}</span>
      </button>

      {showDropdown && (
        <div className={styles.providerDropdown}>
          {providers.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const isAvailable = provider.available || provider.id === 'auto';

            return (
              <button
                key={provider.id}
                className={`${styles.providerOption} ${
                  isSelected ? styles.selected : ''
                } ${!isAvailable ? styles.disabled : ''}`}
                onClick={() => handleProviderSelect(provider.id)}
                disabled={!isAvailable}
                title={provider.description}
              >
                <div className={styles.providerOptionLeft}>
                  <ChevronDownIcon className={styles.optionChevron} />
                  <span className={styles.providerOptionIcon}>{provider.icon}</span>
                  <div className={styles.providerOptionContent}>
                    <div className={styles.providerOptionName}>
                      {provider.name}
                    </div>
                    {provider.description && (
                      <div className={styles.providerOptionDescription}>
                        {provider.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.providerOptionRight}>
                  {isSelected && (
                    <CheckmarkIcon className={styles.checkmark} />
                  )}
                  {!isAvailable && (
                    <span className={styles.comingSoon}>COMING SOON</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProviderSelector;
export { providers };
