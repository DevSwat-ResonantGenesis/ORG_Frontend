import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, Input } from '../../components/ui';
import { setupMFA, verifyMFA, getMFAStatus, disableMFA } from '../../api/mfa';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { logger } from '../../utils/logger';

const MFASetupPage = () => {
  const navigate = useNavigate();
  const [mfaStatus, setMfaStatus] = useState<{ mfa_enabled: boolean; mfa_setup: boolean } | null>(null);
  const [setupData, setSetupData] = useState<{ secret: string; qr_code: string; backup_codes: string[] } | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      setLoading(true);
      const status = await getMFAStatus();
      setMfaStatus(status);
    } catch (err: any) {
      logger.error('MFA status load error', err, { component: 'MFASetupPage' });
      setError('Failed to load MFA status');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      setError('');
      setSuccess('');
      const data = await setupMFA();
      setSetupData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to setup MFA');
    }
  };

  const handleVerify = async () => {
    try {
      setError('');
      setSuccess('');
      await verifyMFA(verificationToken);
      setSuccess('MFA enabled successfully!');
      await loadMFAStatus();
      setSetupData(null);
      setVerificationToken('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to verify MFA');
    }
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await disableMFA(disableToken);
      setSuccess('MFA disabled successfully');
      await loadMFAStatus();
      setDisableToken('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to disable MFA');
    }
  };

  const headerActions = (
    <Button variant="secondary" size="md" onClick={() => navigate('/settings')}>
      Back to Settings
    </Button>
  );

  return (
    <ModernPageLayout
      title="Multi-Factor Authentication"
      subtitle="Add an extra layer of security to your account"
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={loadMFAStatus}
      maxWidth="lg"
    >
      {success && (
        <Card variant="outlined" padding="md" style={{ 
          background: 'var(--color-bg-success)', 
          borderColor: 'var(--color-success)',
          marginBottom: 'var(--space-4)'
        }}>
          <Text variant="body-sm" color="primary">{success}</Text>
        </Card>
      )}

      {mfaStatus?.mfa_enabled ? (
        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              MFA is Enabled
            </Text>
            <Text variant="body-sm" color="secondary">
              Multi-factor authentication is currently active on your account.
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <Input
                label="Enter verification code to disable MFA"
                type="text"
                value={disableToken}
                onChange={(e) => setDisableToken(e.target.value)}
                placeholder="000000"
                style={{ flex: '1 1 200px' }}
              />
              <Button variant="danger" size="md" onClick={handleDisable}>
                Disable MFA
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : setupData ? (
        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Scan QR Code
            </Text>
            <Text variant="body-sm" color="secondary">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
              <img
                src={`data:image/png;base64,${setupData.qr_code}`}
                alt="MFA QR Code"
                style={{ maxWidth: '300px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)' }}
              />
            </div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-2)' }}>
                Or enter this secret manually:
              </Text>
              <code style={{
                display: 'block',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '12px',
                fontFamily: 'var(--font-family-mono)',
                wordBreak: 'break-all'
              }}>
                {setupData.secret}
              </code>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <Input
                label="Enter verification code"
                type="text"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="000000"
                style={{ flex: '1 1 200px' }}
              />
              <Button size="md" onClick={handleVerify}>Verify & Enable</Button>
            </div>
            {setupData.backup_codes && setupData.backup_codes.length > 0 && (
              <Card variant="outlined" padding="md">
                <Card.Header>
                  <Text variant="body-sm" color="primary" style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>
                    Backup Codes
                  </Text>
                  <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-2)' }}>
                    Save these codes in a safe place. You can use them if you lose access to your authenticator app.
                  </Text>
                </Card.Header>
                <Card.Body>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {setupData.backup_codes.map((code, idx) => (
                      <code key={idx} style={{
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'var(--color-bg-root)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--border-radius-md)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-family-mono)'
                      }}>
                        {code}
                      </code>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Enable MFA
            </Text>
            <Text variant="body-sm" color="secondary">
              Multi-factor authentication adds an extra layer of security by requiring a verification code from your authenticator app.
            </Text>
          </Card.Header>
          <Card.Body>
            <Button size="md" onClick={handleSetup}>Setup MFA</Button>
          </Card.Body>
        </Card>
      )}
    </ModernPageLayout>
  );
};

export default MFASetupPage;
