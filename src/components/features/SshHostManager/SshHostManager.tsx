/**
 * Lets a user register their own server/laptop so the sandboxed IDE
 * terminal (Claude Code CLI) can SSH into it. Opt-in and scoped to one
 * host at a time - RG never sees the user's server credentials, only a
 * host/port and the public half of a keypair generated inside the user's
 * own sandbox container (see RG_Terminal_Sandbox/app/docker_manager.py).
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import {
  fetchUserSshHost,
  registerUserSshHost,
  deleteUserSshHost,
  fetchTerminalSshPublicKey,
  type UserSshHostEntry,
} from '@/api/sshHosts';
// Reuse the BYOK panel's styling - same generic form/list/card patterns.
import styles from '../ApiKeyManager/ApiKeyManager.module.css';

export const SshHostManager: React.FC = () => {
  const [hostEntry, setHostEntry] = useState<UserSshHostEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [hostInput, setHostInput] = useState('');
  const [portInput, setPortInput] = useState('22');
  const [labelInput, setLabelInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      setHostEntry(await fetchUserSshHost());
    } catch (err) {
      console.error('Failed to load registered SSH host:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!hostInput.trim()) {
      setError('Please enter a host');
      return;
    }
    const port = parseInt(portInput, 10) || 22;

    setSaving(true);
    setError('');
    try {
      const entry = await registerUserSshHost(hostInput.trim(), port, labelInput.trim() || undefined);
      setHostEntry(entry);
      setShowAddForm(false);
      setHostInput('');
      setLabelInput('');
      setPublicKey(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to register host');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove this registered server? The terminal will lose SSH access to it.')) return;
    try {
      await deleteUserSshHost();
      setHostEntry(null);
      setPublicKey(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to remove host');
    }
  };

  const handleShowKey = async () => {
    setKeyLoading(true);
    setError('');
    try {
      setPublicKey(await fetchTerminalSshPublicKey());
      await load(); // fingerprint gets recorded server-side once the key exists
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to generate SSH key');
    } finally {
      setKeyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      {hostEntry && (
        <div className={styles.keysList}>
          <div className={styles.keyItem}>
            <div className={styles.keyInfo}>
              <div className={styles.keyProvider}>{hostEntry.label || 'My server'}</div>
              <div className={styles.keyName}>
                {hostEntry.host}:{hostEntry.port}
              </div>
              <div className={styles.keyPrefix}>
                {hostEntry.publicKeyFingerprint ? (
                  <>
                    <code>{hostEntry.publicKeyFingerprint}</code>
                    <span className={styles.validBadge}>Key generated</span>
                  </>
                ) : (
                  <span className={styles.invalidBadge}>No key yet - click "Get public key" below</span>
                )}
              </div>
            </div>
            <button className={styles.deleteButton} onClick={handleRemove}>
              Remove
            </button>
          </div>
        </div>
      )}

      {hostEntry && (
        <div className={styles.formGroup} style={{ marginTop: 'var(--space-3)' }}>
          <Button variant="secondary" size="sm" onClick={handleShowKey} disabled={keyLoading}>
            {keyLoading ? 'Generating...' : 'Get public key'}
          </Button>
          {publicKey && (
            <div className={styles.addForm} style={{ marginTop: 'var(--space-2)' }}>
              <label>Add this to your server's ~/.ssh/authorized_keys:</label>
              <input type="text" readOnly value={publicKey} className={styles.input} onFocus={(e) => e.target.select()} />
            </div>
          )}
        </div>
      )}

      {!hostEntry && (
        showAddForm ? (
          <div className={styles.addForm}>
            <div className={styles.formGroup}>
              <label>Host</label>
              <input
                type="text"
                value={hostInput}
                onChange={(e) => setHostInput(e.target.value)}
                placeholder="e.g. myserver.example.com or 203.0.113.5"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Port</label>
              <input
                type="text"
                value={portInput}
                onChange={(e) => setPortInput(e.target.value)}
                placeholder="22"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Label (optional)</label>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="e.g., Home server"
                className={styles.input}
              />
            </div>
            <div className={styles.formActions}>
              <Button variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleRegister} disabled={saving || !hostInput.trim()}>
                {saving ? 'Saving...' : 'Register'}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setShowAddForm(true)} className={styles.addButton}>
            + Connect your own server
          </Button>
        )
      )}
    </div>
  );
};

export default SshHostManager;
