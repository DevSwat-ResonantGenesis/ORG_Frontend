import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, Input } from '../../components/ui';
import fastapiClient from '../../api/fastapiClient';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import { goToDashboard } from '../../utils/navigation';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { logger } from '../../utils/logger';

const CreditsRefundsPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const [orgId, setOrgId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!canAccess(userRole, 'finance')) {
      goToDashboard(navigate);
    }
  }, [userRole, navigate]);

  if (!canAccess(userRole, 'finance')) {
    return null;
  }

  const handleAddCredits = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await fastapiClient.post('/finance/credits', {
        org_id: orgId,
        amount_cents: Math.round(parseFloat(amount) * 100),
        reason: reason,
      });
      setSuccess('Credits added successfully');
      setOrgId('');
      setAmount('');
      setReason('');
    } catch (err: any) {
      logger.error('Add credits error', err, { component: 'CreditsRefundsPage' });
      setError(err.response?.data?.detail || 'Failed to add credits');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await fastapiClient.post('/finance/refunds', {
        invoice_id: invoiceId,
        amount_cents: Math.round(parseFloat(refundAmount) * 100),
        reason: refundReason,
      });
      setSuccess('Refund processed successfully');
      setInvoiceId('');
      setRefundAmount('');
      setRefundReason('');
    } catch (err: any) {
      logger.error('Process refund error', err, { component: 'CreditsRefundsPage' });
      setError(err.response?.data?.detail || 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustInvoice = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await fastapiClient.post('/finance/invoices/adjust', {
        invoice_id: invoiceId,
        adjustment_amount_cents: Math.round(parseFloat(refundAmount) * 100),
        reason: refundReason,
      });
      setSuccess('Invoice adjusted successfully');
      setInvoiceId('');
      setRefundAmount('');
      setRefundReason('');
    } catch (err: any) {
      logger.error('Adjust invoice error', err, { component: 'CreditsRefundsPage' });
      setError(err.response?.data?.detail || 'Failed to adjust invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModernPageLayout
      title="Credits & Refund Management"
      subtitle="Manage account credits, process refunds, and adjust invoices. Handle billing adjustments with full audit trails for financial compliance and customer support. All transactions include immutable audit logs with advanced verification for compliance."
      loading={loading}
      error={error}
      maxWidth="xl"
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Add Credits
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Input
                label="Organization ID"
                placeholder="Organization ID"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
              />
              <Input
                label="Amount (USD)"
                type="number"
                placeholder="Amount (USD)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div>
                <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>
                  Reason
                </Text>
                <textarea
                  placeholder="Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    minHeight: '100px',
                    fontFamily: 'var(--font-family)'
                  }}
                />
              </div>
              <Button size="md" onClick={handleAddCredits} disabled={loading}>
                {loading ? 'Processing...' : 'Add Credits'}
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Process Refund
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Input
                label="Invoice ID"
                placeholder="Invoice ID"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
              />
              <Input
                label="Refund Amount (USD)"
                type="number"
                placeholder="Refund Amount (USD)"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
              <div>
                <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>
                  Reason
                </Text>
                <textarea
                  placeholder="Reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    minHeight: '100px',
                    fontFamily: 'var(--font-family)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button size="md" onClick={handleProcessRefund} disabled={loading} variant="secondary">
                  {loading ? 'Processing...' : 'Process Refund'}
                </Button>
                <Button size="md" onClick={handleAdjustInvoice} disabled={loading}>
                  {loading ? 'Processing...' : 'Adjust Invoice'}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </ModernPageLayout>
  );
};

export default CreditsRefundsPage;
