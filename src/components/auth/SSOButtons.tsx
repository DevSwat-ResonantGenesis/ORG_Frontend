import React, { useState, useEffect } from 'react';
import { getSSOProviders, initiateSSO, type SSOProvider } from '@/api/sso';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/Button';
import styles from './SSOButtons.module.css';

/**
 * SSO Provider Buttons Component
 * Displays available SSO providers for authentication
 */
interface SSOButtonsProps {
  onError?: (error: string) => void;
  className?: string;
}

export const SSOButtons: React.FC<SSOButtonsProps> = ({ onError, className = '' }) => {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false; // Prevent multiple loads
    
    const loadProviders = async () => {
      // Prevent multiple simultaneous loads
      if (hasLoaded) {
        return;
      }
      hasLoaded = true;
      
      try {
        const availableProviders = await getSSOProviders();
        if (isMounted) {
          setProviders(availableProviders.filter(p => p.enabled));
        }
      } catch (error: any) {
        // Don't log errors for 401 (unauthorized - expected on login page), 429, 404, or 501
        if (error?.response?.status === 401 || error?.response?.status === 429 || error?.response?.status === 404 || error?.response?.status === 501) {
          // Silently fail - these are expected errors
          if (isMounted) {
            setProviders([]);
          }
        } else {
          logger.error('Failed to load SSO providers', error, { component: 'SSOButtons' });
          if (isMounted) {
            onError?.('Failed to load SSO providers');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProviders();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only load once

  const handleSSOClick = async (providerId: string) => {
    try {
      setInitiating(providerId);
      const authUrl = await initiateSSO(providerId);
      // Redirect to provider's authorization page
      window.location.href = authUrl;
    } catch (error: any) {
      logger.error('Failed to initiate SSO', error, { component: 'SSOButtons' });
      onError?.(error.message || 'Failed to start SSO authentication');
      setInitiating(null);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loading}>Loading SSO providers...</div>
      </div>
    );
  }

  if (providers.length === 0) {
    return null; // Don't show anything if no providers available
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.divider}>
        <span>Or continue with</span>
      </div>
      <div className={styles.buttons}>
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="secondary"
            onClick={() => handleSSOClick(provider.id)}
            disabled={initiating === provider.id}
            className={styles.ssoButton}
          >
            {provider.icon && (
              <img
                src={provider.icon}
                alt={provider.name}
                className={styles.icon}
                onError={(e) => {
                  // Hide icon if it fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span>
              {initiating === provider.id ? 'Connecting...' : `Continue with ${provider.name}`}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

