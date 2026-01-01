import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import { fetchInvoices, downloadInvoice, type Invoice as APIInvoice } from '../../api/finance';
import { Button, Card, Text } from '../../components/ui';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToastContext } from '../../context/ToastContext';
import { goToDashboard } from '../../utils/navigation';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

interface Invoice {
  id: string;
  org_id: string;
  org_name: string;
  period_start: string;
  period_end: string;
  amount_due_cents: number;
  currency: string;
  status: string;
  invoice_url?: string;
}

const InvoicesPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canAccess(userRole, 'finance')) {
      goToDashboard(navigate);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const invoicesData: APIInvoice[] = await fetchInvoices();
        setInvoices(invoicesData.map(inv => ({
          id: inv.id,
          org_id: inv.id,
          org_name: '',
          period_start: inv.period_start,
          period_end: inv.period_end,
          amount_due_cents: (inv.amount || 0) * 100,
          currency: 'USD',
          status: inv.status,
          invoice_url: inv.pdf_url,
        })));
      } catch (err: any) {
        const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to load invoices';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userRole, navigate, toast]);

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(cents / 100);
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      toast.warning('No invoices to export');
      return;
    }

    const headers = ['Invoice ID', 'Organization', 'Period Start', 'Period End', 'Amount', 'Currency', 'Status'];
    const rows = invoices.map(invoice => [
      invoice.id,
      invoice.org_name || invoice.org_id,
      new Date(invoice.period_start).toISOString().split('T')[0],
      new Date(invoice.period_end).toISOString().split('T')[0],
      (invoice.amount_due_cents / 100).toFixed(2),
      invoice.currency || 'USD',
      invoice.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Invoices exported successfully');
  };

  const headerActions = (
          <Button variant="secondary" size="md" onClick={handleExportCSV}>
            Export CSV
          </Button>
  );

  if (loading) {
    return <LoadingState message="Loading invoices..." fullPage />;
  }

  if (error && invoices.length === 0) {
    return (
      <ErrorState
        title="Failed to load invoices"
        message={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
        icon="📄"
      />
    );
  }

  return (
    <ModernPageLayout
      title="Invoice Management"
      subtitle="View and manage organization invoices, billing history, and payment records. Download PDF invoices for accounting. All invoices include detailed usage breakdowns and payment status."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      maxWidth="xl"
    >
        {invoices.length === 0 ? (
          <EmptyState
            title="No Invoices Found"
            description="There are no invoices available. Invoices are generated automatically at the end of each billing cycle."
          icon="📄"
            action={{
              label: "View Billing",
              onClick: () => navigate('/billing'),
            variant: 'primary' as const
            }}
            secondaryAction={{
              label: "Go to Dashboard",
              onClick: () => goToDashboard(navigate),
            variant: 'secondary' as const
            }}
          />
        ) : (
        <Card variant="elevated" padding="none">
          <ResponsiveTable
            columns={[
              {
                key: 'id',
                label: 'Invoice ID',
                mobileLabel: 'ID',
                render: (value) => <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>{String(value ?? '')}</span>
              },
              {
                key: 'period_end',
                label: 'Date',
                render: (value) => value ? new Date(String(value)).toLocaleDateString() : 'N/A'
              },
              {
                key: 'amount_due_cents',
                label: 'Amount',
                render: (value, row) => formatAmount(Number(value ?? 0), (row.currency as string) || 'USD')
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => (
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '12px',
                      fontWeight: 500,
                      background:
                        value === 'paid'
                          ? '#dcfce7'
                          : value === 'overdue'
                          ? '#fee2e2'
                          : '#fef3c7',
                      color:
                        value === 'paid'
                          ? '#166534'
                          : value === 'overdue'
                          ? '#991b1b'
                          : '#92400e',
                    }}
                  >
                    {String(value ?? '')}
                  </span>
                )
              },
              {
                key: 'invoice_url',
                label: 'PDF Link',
                mobileLabel: 'PDF',
                render: (value) => 
                  value ? (
                    <a href={String(value ?? '')} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      Download PDF
                    </a>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>N/A</span>
                  )
              }
            ]}
            data={invoices as unknown as Record<string, unknown>[]}
            onRowClick={(row) => {
                if (row.invoice_url && typeof row.invoice_url === 'string') {
                  window.open(row.invoice_url, '_blank');
              }
            }}
          />
            </Card>
      )}
    </ModernPageLayout>
  );
};

export default InvoicesPage;
