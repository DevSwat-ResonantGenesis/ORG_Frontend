import { transferProjectOwnership } from '@/api/code';
import { logger } from '@/utils/logger';
import React, { useState } from 'react';
import styles from './ProjectTransferDialog.module.css';

interface ProjectTransferDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string; // Required for transfer
}

export const ProjectTransferDialog: React.FC<ProjectTransferDialogProps> = ({
    isOpen,
    onClose,
    projectId,
}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleTransfer = async () => {
        if (!email.trim() || !projectId) {
            setError('Please enter an email address');
            return;
        }

        // Basic confirmation
        if (!window.confirm('Are you sure you want to transfer ownership? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await transferProjectOwnership(projectId, email.trim());
            alert(`Project ownership transferred to ${email}`);
            setEmail('');
            onClose();
        } catch (error: any) {
            logger.error('Failed to transfer project', error);
            const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || 'Failed to transfer project';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Transfer Project Ownership</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>
                    <p className={styles.description}>
                        Transfer this project to another user by email.
                        Warning: You will lose ownership and admin rights to this project.
                    </p>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">New Owner Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            className={styles.input}
                            disabled={loading}
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
                        className={styles.transferButton}
                        onClick={handleTransfer}
                        disabled={loading || !email.trim()}
                    >
                        {loading ? 'Transferring...' : 'Transfer Ownership'}
                    </button>
                </div>
            </div>
        </div>
    );
};
