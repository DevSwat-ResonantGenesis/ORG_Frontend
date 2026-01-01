/**
 * Shared Agent Import Component
 * Import agents shared by other users using agent hash
 */
import React, { useState } from 'react';
import { settingsApi } from '@/api/settings';
import { ImportIcon, InfoIcon } from '@/components/Icons/SettingsIcons';
import { Tooltip } from '@/components/ui/Tooltip';
import { logger } from '@/utils/logger';
import styles from './SharedAgentImport.module.css';

interface SharedAgentImportProps {
  onImportSuccess: () => void;
}

export const SharedAgentImport: React.FC<SharedAgentImportProps> = ({ onImportSuccess }) => {
  const [agentHash, setAgentHash] = useState('');
  const [shareSecret, setShareSecret] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ownershipTransferred, setOwnershipTransferred] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agentHash.trim()) {
      setError('Please enter an agent hash');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setSuccess(false);
      setOwnershipTransferred(false);

      const agent = await settingsApi.importSharedAgent(
        agentHash.trim(),
        shareSecret.trim() || undefined
      );
      
      setSuccess(true);
      setOwnershipTransferred(agent.ownership_transferred || false);
      setAgentHash('');
      setShareSecret('');
      setTimeout(() => {
        setSuccess(false);
        setOwnershipTransferred(false);
        onImportSuccess();
      }, 3000);
    } catch (err: any) {
      logger.error('Failed to import shared agent', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to import agent. Make sure the hash is correct.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Import Shared Agent</h3>
        <Tooltip content="Import a shared agent using its hash. You'll get all the creator's settings (prompt, personality, patches, memory, etc.) and share the same memory with other users. Only the creator can edit it.">
          <InfoIcon size={18} className={styles.infoIcon} />
        </Tooltip>
      </div>

      <form onSubmit={handleImport} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Agent Hash
            <Tooltip content="Enter the agent hash provided by the agent owner. This is like a public key - anyone with the hash can use the agent.">
              <InfoIcon size={14} className={styles.inlineInfoIcon} />
            </Tooltip>
          </label>
          <input
            type="text"
            value={agentHash}
            onChange={(e) => {
              setAgentHash(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder="Enter agent hash (e.g., 0x1234...)"
            className={styles.input}
            disabled={importing}
          />
          <p className={styles.helpText}>
            Paste the agent hash here. The agent will be imported with all settings from the creator:
            system prompt, personality, memory config, patches, restrictions, weights, and more.
            You can use it but cannot edit it - only the creator can modify it.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            12-Word Ownership Passphrase (Optional)
            <Tooltip content="If you have the 12-word passphrase from the agent owner, enter it here to transfer FULL OWNERSHIP. You'll be able to edit all settings and have complete control. Without it, you'll get a read-only copy.">
              <InfoIcon size={14} className={styles.inlineInfoIcon} />
            </Tooltip>
          </label>
          <textarea
            value={shareSecret}
            onChange={(e) => {
              setShareSecret(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder="Enter 12-word passphrase (optional - for ownership transfer)"
            className={styles.textarea}
            disabled={importing}
            rows={2}
          />
          <p className={styles.helpText}>
            <strong>Optional:</strong> If you have the 12-word passphrase from the agent owner, entering it here will transfer FULL OWNERSHIP to your account. 
            You'll be able to edit all settings, delete the agent, and have complete control. 
            Without the passphrase, you'll get a read-only imported copy that shares memory but cannot be edited.
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            {ownershipTransferred ? (
              <>
                ✅ <strong>Ownership transferred successfully!</strong> You now have full control of this agent. 
                You can edit all settings, delete it, and manage it completely.
              </>
            ) : (
              <>
                ✅ Agent imported successfully! It will appear in your agent list. 
                You can use it but cannot edit it - only the creator can modify it.
              </>
            )}
          </div>
        )}

        <div className={styles.formActions}>
          <Tooltip content="Import the shared agent using the provided hash">
            <button
              type="submit"
              className={styles.importButton}
              disabled={importing || !agentHash.trim()}
            >
              <ImportIcon size={16} />
              <span>{importing ? 'Importing...' : 'Import Agent'}</span>
            </button>
          </Tooltip>
        </div>
      </form>
    </div>
  );
};

