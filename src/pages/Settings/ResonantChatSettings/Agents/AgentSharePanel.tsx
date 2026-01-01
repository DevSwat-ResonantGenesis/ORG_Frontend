/**
 * Agent Share Panel Component
 * Share an agent with other users by generating/displaying agent hash
 */
import React, { useState, useEffect, useRef } from 'react';
import { settingsApi } from '@/api/settings';
import { CopyIcon, ShareIcon, InfoIcon, CheckIcon } from '@/components/Icons/SettingsIcons';
import { Tooltip } from '@/components/ui/Tooltip';
import { logger } from '@/utils/logger';
import styles from './AgentSharePanel.module.css';

interface AgentSharePanelProps {
  agentId: string;
  agentHash?: string;
  isPublic?: boolean;
}

export const AgentSharePanel: React.FC<AgentSharePanelProps> = ({ agentId, agentHash: initialHash, isPublic: initialIsPublic }) => {
  const [agentHash, setAgentHash] = useState<string | undefined>(initialHash);
  const [shareSecret, setShareSecret] = useState<string | undefined>();
  const [isPublic, setIsPublic] = useState(initialIsPublic || false);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const secretLoadedRef = useRef(false); // Track if we've attempted to load secret

  useEffect(() => {
    if (initialHash) {
      setAgentHash(initialHash);
    }
    // Only load share secret once on mount if we don't already have one
    if (agentId && !secretLoadedRef.current && !shareSecret) {
      secretLoadedRef.current = true;
      loadShareSecret();
    }
  }, [initialHash, agentId]); // Removed shareSecret from deps to prevent infinite loop

  const loadShareSecret = async () => {
    if (!agentId) return;
    
    try {
      const agent = await settingsApi.getAgent(agentId);
      logger.debug('Loaded agent:', { hasShareSecret: !!agent.share_secret, agentHash: agent.agent_hash });
      if (agent.share_secret && agent.share_secret.trim()) {
        // Use functional update to avoid stale closure
        setShareSecret((current) => {
          // Only update if we don't already have a secret (to prevent clearing it)
          if (!current || !current.trim()) {
            logger.info('✅ Loaded share secret from API');
            return agent.share_secret;
          }
          return current; // Keep existing secret
        });
      } else if (agent.agent_hash) {
        // Agent has hash but no secret - might need to regenerate or generate secret
        logger.info('Agent has hash but no share_secret. User may need to generate hash again.');
      }
    } catch (err: any) {
      logger.error('Failed to load share secret', err);
      // Don't show error - secret might not exist yet
    }
  };

  const handleGenerateHash = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await settingsApi.generateAgentHash(agentId);
      setAgentHash(result.agent_hash);
      if (result.share_secret && result.share_secret.trim()) {
        setShareSecret(result.share_secret);
        logger.info('✅ Share secret generated and set:', result.share_secret.substring(0, 30) + '...');
        // Mark as loaded to prevent useEffect from clearing it
        secretLoadedRef.current = true;
      } else {
        // If not returned, try loading it
        logger.warn('Share secret not in response, attempting to load...');
        setTimeout(() => {
          secretLoadedRef.current = true;
          loadShareSecret();
        }, 500);
      }
    } catch (err: any) {
      logger.error('Failed to generate agent hash', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to generate agent hash');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      setError(null);
      const result = await settingsApi.shareAgent(agentId, true);
      setAgentHash(result.agent_hash);
      setIsPublic(true);
      if (result.share_secret && result.share_secret.trim()) {
        setShareSecret(result.share_secret);
        logger.info('✅ Share secret generated and set:', result.share_secret.substring(0, 30) + '...');
        // Mark as loaded to prevent useEffect from clearing it
        secretLoadedRef.current = true;
      } else {
        // If not returned, try loading it
        logger.warn('Share secret not in response, attempting to load...');
        setTimeout(() => {
          secretLoadedRef.current = true;
          loadShareSecret();
        }, 500);
      }
    } catch (err: any) {
      logger.error('Failed to share agent', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to share agent');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyHash = async () => {
    if (!agentHash) return;
    
    try {
      await navigator.clipboard.writeText(agentHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy hash', err);
      setError('Failed to copy to clipboard');
    }
  };

  const handleCopySecret = async () => {
    if (!shareSecret) return;
    
    try {
      await navigator.clipboard.writeText(shareSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy secret', err);
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Share Agent</h3>
        <Tooltip content="Share this agent with other users. They'll get all your settings (prompt, personality, patches, memory, etc.) and share the same memory. Only you can edit it.">
          <InfoIcon size={18} className={styles.infoIcon} />
        </Tooltip>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {!agentHash ? (
        <div className={styles.generateSection}>
          <p className={styles.description}>
            Generate an agent hash to share this agent with others. The hash acts like a public key - anyone with it can use your agent.
          </p>
          <div className={styles.actions}>
            <Tooltip content="Generate a unique hash for this agent">
              <button
                className={styles.generateButton}
                onClick={handleGenerateHash}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Agent Hash'}
              </button>
            </Tooltip>
            <Tooltip content="Make this agent shareable and generate hash">
              <button
                className={styles.shareButton}
                onClick={handleShare}
                disabled={sharing}
              >
                <ShareIcon size={16} />
                <span>{sharing ? 'Sharing...' : 'Share Agent'}</span>
              </button>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className={styles.hashSection}>
          <div className={styles.hashGroup}>
            <label className={styles.label}>
              Agent Hash
              <Tooltip content="This is the public identifier for your agent. Share this with others so they can import and use your agent.">
                <InfoIcon size={14} className={styles.inlineInfoIcon} />
              </Tooltip>
            </label>
            <div className={styles.hashDisplay}>
              <code className={styles.hashValue}>{agentHash}</code>
              <Tooltip content={copied ? 'Copied!' : 'Copy hash to clipboard'}>
                <button
                  className={styles.copyButton}
                  onClick={handleCopyHash}
                  type="button"
                >
                  {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                </button>
              </Tooltip>
            </div>
            <p className={styles.helpText}>
              Share this hash with others. When they import it, they'll get all your agent settings:
              system prompt, personality, memory config, patches, restrictions, weights, and more.
              They'll also share the same memory with you and other users. Only you can edit it.
            </p>
          </div>

          {shareSecret && shareSecret.trim() ? (
            <div className={styles.secretGroup}>
              <label className={styles.label}>
                Share Secret (12-word passphrase)
                <Tooltip content="This is your private secret to access this agent on other accounts. Keep it safe!">
                  <InfoIcon size={14} className={styles.inlineInfoIcon} />
                </Tooltip>
              </label>
              <div className={styles.secretDisplay}>
                <code className={styles.secretValue} style={{ userSelect: 'all', cursor: 'text' }}>{shareSecret}</code>
                <Tooltip content={copied ? 'Copied!' : 'Copy secret to clipboard'}>
                  <button
                    className={styles.copyButton}
                    onClick={handleCopySecret}
                    type="button"
                  >
                    {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  </button>
                </Tooltip>
              </div>
              <p className={styles.warningText}>
                ⚠️ <strong>KEEP THIS SECRET SAFE!</strong> This is your private key for ownership transfer. 
                Anyone with this 12-word passphrase can claim <strong>FULL OWNERSHIP</strong> of your agent on their account, 
                including the ability to edit all settings, delete it, and have complete control. 
                Only share it with people you trust completely!
              </p>
            </div>
          ) : agentHash ? (
            <div className={styles.secretGroup}>
              <div style={{ padding: '12px', background: 'var(--color-orange-50, #fff7ed)', border: '1px solid var(--color-orange-200, #fed7aa)', borderRadius: '6px', marginBottom: '16px' }}>
                <p className={styles.helpText} style={{ color: 'var(--color-orange-700, #c2410c)', fontStyle: 'italic', marginBottom: '12px' }}>
                  ⚠️ <strong>No 12-word passphrase found.</strong> Generate one to enable ownership transfer.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Tooltip content="Generate the 12-word passphrase for this agent">
                    <button
                      className={styles.generateButton}
                      onClick={handleGenerateHash}
                      disabled={loading}
                      style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                      {loading ? 'Generating...' : 'Generate Passphrase'}
                    </button>
                  </Tooltip>
                  <Tooltip content="Make agent shareable and generate passphrase">
                    <button
                      className={styles.shareButton}
                      onClick={handleShare}
                      disabled={sharing}
                      style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                      <ShareIcon size={14} />
                      <span>{sharing ? 'Sharing...' : 'Share Agent'}</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ) : null}

          {isPublic && (
            <div className={styles.publicBadge}>
              <span className={styles.badgeText}>✓ Agent is publicly shareable</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

