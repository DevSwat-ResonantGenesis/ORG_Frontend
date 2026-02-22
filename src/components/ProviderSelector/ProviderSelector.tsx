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
import { ENV } from '@/config/env';
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
    'mistral': <MistralIcon />
  };
  return iconMap[providerId.toLowerCase()] || <AutoIcon />;
};

const getCapabilityLabel = (capability: string): string => {
  const labels: Record<string, string> = {
    'chat': '💬 Chat',
    'coding': '💻 Coding',
    'vision': '👁️ Vision',
    'image': '🎨 Images',
    'music': '🎵 Music',
    'video': '🎬 Video',
    'reasoning': '🧠 Reasoning',
    'creative': '✨ Creative'
  };
  return labels[capability] || capability;
};

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
  const [providers, setProviders] = useState<LLMProvider[]>([{
    id: 'auto',
    name: 'Auto',
    icon: <AutoIcon />,
    available: true,
    description: 'Loading providers...',
  }]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // WebSocket connection for LIVE provider status updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Get WebSocket URL from environment
        const wsUrl = ENV.wsUrl || 'wss://resonantgenesis.xyz';
        const wsEndpoint = `${wsUrl}/ws/provider-status`;
        
        logger.info('Connecting to provider status WebSocket:', wsEndpoint);
        
        const ws = new WebSocket(wsEndpoint);
        wsRef.current = ws;
        
        ws.onopen = () => {
          logger.info('✅ Provider status WebSocket connected');
          setWsConnected(true);
          setLoading(false);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'provider_status') {
              // Update providers with live data
              const liveProviders: LLMProvider[] = [
                {
                  id: 'auto',
                  name: 'Auto',
                  icon: <AutoIcon />,
                  available: true,
                  description: 'Smart routing - automatically selects best provider',
                },
                ...data.providers.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  icon: getProviderIcon(p.id),
                  available: p.available,
                  description: `${p.model} - ${p.status}`,
                  capabilities: p.capabilities,
                  latency: p.latency,
                  model: p.model,
                  has_user_key: false,
                  uses_credits: p.available,
                }))
              ];
              
              setProviders(liveProviders);
              logger.info('🔄 Live provider status updated:', data.providers.length);
            } else if (data.type === 'keepalive' || data.type === 'pong') {
              // Connection is alive
            }
          } catch (error) {
            logger.error('Failed to parse WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          logger.error('Provider status WebSocket error:', error);
          setWsConnected(false);
        };
        
        ws.onclose = () => {
          logger.warn('Provider status WebSocket closed, reconnecting in 5s...');
          setWsConnected(false);
          wsRef.current = null;
          
          // Reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        };
      } catch (error) {
        logger.error('Failed to connect WebSocket:', error);
        setLoading(false);
      }
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
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
        <span className={styles.providerName}>
          {selectedProviderData.name}
          {wsConnected && <span className={styles.liveIndicator} title="Live updates">●</span>}
        </span>
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
                      {provider.latency && (
                        <span className={styles.latency}>
                          {formatLatency(provider.latency)}
                        </span>
                      )}
                    </div>
                    {provider.description && (
                      <div className={styles.providerOptionDescription}>
                        {provider.description}
                      </div>
                    )}
                    {provider.capabilities && provider.capabilities.length > 0 && (
                      <div className={styles.capabilities}>
                        {provider.capabilities.slice(0, 3).map(cap => (
                          <span key={cap} className={styles.capability}>
                            {getCapabilityLabel(cap)}
                          </span>
                        ))}
                      </div>
                    )}
                    {provider.model && (
                      <div className={styles.model}>
                        {provider.model}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.providerOptionRight}>
                  {provider.has_user_key && (
                    <span className={styles.badge} title="Using your API key">🔑</span>
                  )}
                  {provider.uses_credits && (
                    <span className={styles.badge} title="Using platform credits">💳</span>
                  )}
                  {isSelected && (
                    <CheckmarkIcon className={styles.checkmark} />
                  )}
                  {!isAvailable && (
                    <span className={styles.comingSoon}>UNAVAILABLE</span>
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
