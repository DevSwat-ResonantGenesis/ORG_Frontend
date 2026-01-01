import { settingsApi } from '@/api/settings';
import { logger } from '@/utils/logger';
import React, { useState } from 'react';
import styles from './AgentRestoreDialog.module.css';

interface AgentRestoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onRestored: () => void;
}

export const AgentRestoreDialog: React.FC<AgentRestoreDialogProps> = ({
    isOpen,
    onClose,
    onRestored,
}) => {
    const [cryptoHash, setCryptoHash] = useState('');
    const [mnemonic, setMnemonic] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleRestore = async () => {
        if (!cryptoHash.trim() || !mnemonic.trim()) {
            setError('Please enter both Hash and Mnemonic');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await settingsApi.restoreAgentByCryptoHash(cryptoHash.trim(), mnemonic.trim());
            alert('Agent restored successfully!');

            setCryptoHash('');
            setMnemonic('');
            onRestored();
            onClose();
        } catch (error: any) {
            logger.error('Failed to restore agent', error);
            const errorMessage = error?.response?.data?.message || 'Failed to restore agent';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Restore Agent from Hash Sphere</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>
                    <p className={styles.description}>
                        Enter the Agent Hash and the Mnemonic (if required) to restore an agent from the Hash Sphere blockchain.
                    </p>

                    <div className={styles.inputGroup}>
                        <label htmlFor="cryptoHash">Agent Hash (Hash Sphere):</label>
                        <input
                            id="cryptoHash"
                            type="text"
                            value={cryptoHash}
                            onChange={(e) => setCryptoHash(e.target.value)}
                            placeholder="e.g. 8f4343..."
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="mnemonic">Mnemonic Phrase:</label>
                        <textarea
                            id="mnemonic"
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                            placeholder="Enter 12-word mnemonic phrase..."
                            className={styles.input}
                            disabled={loading}
                            style={{ minHeight: '80px' }}
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.restoreButton}
                        onClick={handleRestore}
                        disabled={loading || !cryptoHash.trim() || !mnemonic.trim()}
                    >
                        {loading ? 'Restoring...' : 'Restore Agent'}
                    </button>
                </div>
            </div>
        </div>
    );
};
