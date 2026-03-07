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
import { fetchLiveProviders, formatLatency, type LiveProvider } from '@/api/providers';
import { logger } from '@/utils/logger';
import styles from './ProviderSelector.module.css';

export interface LLMProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  description: string;
  capabilities?: string[];
  latency?: number;
  model?: string;
  models?: string[];
  has_user_key?: boolean;
  uses_credits?: boolean;
}

const getProviderIcon = (providerId: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'auto': <AutoIcon />,
    'openai': <ChatGPTIcon />,
    'chatgpt': <ChatGPTIcon />,
    'gemini': <GeminiIcon />,
    'google': <GeminiIcon />,
    'anthropic': <ClaudeIcon />,
    'claude': <ClaudeIcon />,
    'groq': <MistralIcon />,
    'mistral': <MistralIcon />,
    'local': <span style={{ fontSize: '18px' }}>🖥️</span>,
    'codellama': <span style={{ fontSize: '18px' }}>💻</span>,
  };
  return iconMap[providerId.toLowerCase()] || <AutoIcon />;
};

interface ProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  autoReason?: string;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  autoReason,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedModels, setExpandedModels] = useState<string | null>(null);
  const [providers, setProviders] = useState<LLMProvider[]>([{
    id: 'auto',
    name: 'Auto',
    icon: <AutoIcon />,
    available: true,
    description: 'Smart routing - automatically selects best provider',
  }]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Fetch providers via REST API (more reliable than WebSocket through Cloudflare)
  const loadProviders = async () => {
    try {
      const data = await fetchLiveProviders();
      if (data.providers && data.providers.length > 0) {
        const liveProviders: LLMProvider[] = [
          {
            id: 'auto',
            name: 'Auto',
            icon: <AutoIcon />,
            available: true,
            description: 'Smart routing - automatically selects best provider',
          },
          ...data.providers.map((p: LiveProvider) => ({
            id: p.id,
            name: p.name,
            icon: getProviderIcon(p.id),
            available: p.available,
            description: p.model ? `${p.model}` : p.description,
            capabilities: p.capabilities,
            latency: p.latency,
            model: p.model,
            models: p.models || [],
            has_user_key: p.has_user_key,
            uses_credits: p.uses_credits,
          }))
        ];
        setProviders(liveProviders);
        logger.info('🔄 Providers loaded:', data.providers.length);
      }
    } catch (error) {
      logger.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadProviders();
    
    // Poll every 10 seconds for live status
    pollIntervalRef.current = window.setInterval(loadProviders, 10000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

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
      setExpandedModels(null);
      setShowDropdown(false);
    }
  };

  const handleModelSelect = (providerId: string, model: string) => {
    onProviderChange(providerId);
    if (onModelChange) onModelChange(model);
    setExpandedModels(null);
    setShowDropdown(false);
  };

  const toggleModelExpander = (e: React.MouseEvent, providerId: string) => {
    e.stopPropagation();
    setExpandedModels(expandedModels === providerId ? null : providerId);
  };

  const displayModel = selectedModel || selectedProviderData.model;

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.selector}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      >
        <span className={styles.icon}>{selectedProviderData.icon}</span>
        <span className={styles.name}>{selectedProviderData.name}</span>
        {selectedProvider === 'auto' && autoReason && (
          <span className={styles.badge}>SMART</span>
        )}
        {displayModel && selectedProvider !== 'auto' && (
          <span className={styles.latency}>• {displayModel}</span>
        )}
        {selectedProviderData.latency && !displayModel && (
          <span className={styles.latency}>• {formatLatency(selectedProviderData.latency)}</span>
        )}
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {showDropdown && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.dropdownHeader}>SELECT PROVIDER</div>
          {loading ? (
            <div className={styles.loading}>Loading providers...</div>
          ) : (
            providers.map((provider) => (
              <div key={provider.id}>
                <button
                  className={`${styles.option} ${selectedProvider === provider.id ? styles.selected : ''} ${!provider.available && provider.id !== 'auto' ? styles.disabled : ''}`}
                  onClick={() => handleProviderSelect(provider.id)}
                  disabled={!provider.available && provider.id !== 'auto'}
                  role="option"
                  aria-selected={selectedProvider === provider.id}
                >
                  <span className={styles.optionIcon}>{provider.icon}</span>
                  <div className={styles.optionContent}>
                    <span className={styles.optionName}>{provider.name}</span>
                    {provider.model && (
                      <span className={styles.optionModel}>
                        {(selectedProvider === provider.id && selectedModel) || provider.model}
                      </span>
                    )}
                  </div>
                  <div className={styles.optionMeta}>
                    {provider.id === 'auto' && <span className={styles.badge}>SMART</span>}
                    {provider.latency && (
                      <span className={styles.latency}>• {formatLatency(provider.latency)}</span>
                    )}
                    {provider.has_user_key && <span className={styles.byokBadge}>BYOK</span>}
                    {!provider.uses_credits && provider.id !== 'auto' && (
                      <span className={styles.freeBadge}>FREE</span>
                    )}
                    {provider.models && provider.models.length > 1 && provider.available && (
                      <span
                        className={styles.modelExpandBtn}
                        onClick={(e) => toggleModelExpander(e, provider.id)}
                        title={`${provider.models.length} models available`}
                      >
                        {expandedModels === provider.id ? '▾' : '▸'} {provider.models.length}
                      </span>
                    )}
                    {selectedProvider === provider.id && <CheckmarkIcon className={styles.checkmark} />}
                  </div>
                </button>
                {expandedModels === provider.id && provider.models && provider.models.length > 1 && (
                  <div className={styles.modelSubList}>
                    {provider.models.map((m) => (
                      <button
                        key={m}
                        className={`${styles.modelSubItem} ${(selectedModel || provider.model) === m ? styles.selected : ''}`}
                        onClick={() => handleModelSelect(provider.id, m)}
                      >
                        <span className={styles.modelSubName}>{m}</span>
                        {(selectedModel || provider.model) === m && <CheckmarkIcon className={styles.checkmark} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderSelector;
// Cache bust: 1771830595
