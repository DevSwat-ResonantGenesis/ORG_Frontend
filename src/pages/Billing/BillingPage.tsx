import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Package, History, Zap, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { getSession } from '../../utils/auth';
import { TOKEN_PACKS, getPlanDetails } from '../../utils/signupLogic';
import fastapiClient from '../../api/fastapiClient';
import styles from './BillingPage.module.css';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  description: string;
  invoice_url?: string;
}

interface CreditBalance {
  available: number;
  used: number;
  total: number;
  rollover: number;
}

const BillingPage = () => {
  const session = getSession() as any;
  const navigate = useNavigate();
  const plan = session?.plan || 'developer';
  const planDetails = getPlanDetails(plan);

  const [loading, setLoading] = useState(true);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true);
      try {
        // Load credit balance
        const balanceRes = await fastapiClient.get('/billing/credits/balance');
        setCreditBalance(balanceRes.data);

        // Load payment methods
        try {
          const methodsRes = await fastapiClient.get('/billing/payment-methods');
          setPaymentMethods(methodsRes.data?.methods || []);
        } catch {
          // Payment methods may not exist yet
        }

        // Load invoices
        try {
          const invoicesRes = await fastapiClient.get('/billing/invoices');
          setInvoices(invoicesRes.data?.invoices || []);
        } catch {
          // Invoices may not exist yet
        }
      } catch (err: any) {
        console.error('Failed to load billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, []);

  const handlePurchaseCredits = async (packId: string) => {
    setError('');
    setMessage('');
    setPurchasingPack(packId);

    try {
      const response = await fastapiClient.post('/billing/checkout/credits', {
        pack_id: packId,
        success_url: `${window.location.origin}/billing?success=credits`,
        cancel_url: `${window.location.origin}/billing?canceled=true`,
      });

      if (response.data?.checkout_url || response.data?.url) {
        window.location.href = response.data.checkout_url || response.data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to initiate purchase');
    } finally {
      setPurchasingPack(null);
    }
  };

  const handleUpgradePlan = async () => {
    try {
      const response = await fastapiClient.post('/billing/checkout/subscription', {
        plan: 'plus',
        billing_cycle: 'monthly',
        success_url: `${window.location.origin}/billing?success=upgrade`,
        cancel_url: `${window.location.origin}/billing?canceled=true`,
      });

      if (response.data?.checkout_url || response.data?.url) {
        window.location.href = response.data.checkout_url || response.data.url;
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to initiate upgrade');
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      const response = await fastapiClient.post('/billing/payment-methods/setup', {
        success_url: `${window.location.origin}/billing?success=payment`,
        cancel_url: `${window.location.origin}/billing`,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to setup payment method');
    }
  };

  // Check URL params for success/cancel messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'credits') {
      setMessage('Credits purchased successfully!');
    } else if (params.get('success') === 'upgrade') {
      setMessage('Plan upgraded successfully!');
    } else if (params.get('success') === 'payment') {
      setMessage('Payment method added successfully!');
    } else if (params.get('canceled')) {
      setError('Transaction was canceled');
    }
    // Clean URL
    if (params.has('success') || params.has('canceled')) {
      window.history.replaceState({}, '', '/billing');
    }
  }, []);

  if (loading) {
    return (
      <div className={styles.billingPage}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} />
            <p>Loading billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.billingPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Billing & Credits</h1>
          <p>Manage your subscription, credits, and payment methods</p>
        </header>

        {/* Messages */}
        {error && <div className={styles.alertError}>{error}</div>}
        {message && <div className={styles.alertSuccess}>{message}</div>}

        {/* Current Plan */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Zap size={20} />
            Current Plan
          </h2>
          <div className={styles.planCard}>
            <div className={styles.planInfo}>
              <h3>{planDetails?.name || plan}</h3>
              <p className={styles.planPrice}>
                {plan === 'developer' ? 'Free' : `$${planDetails?.price?.monthly || 49}/month`}
              </p>
              <ul className={styles.planFeatures}>
                {planDetails?.features?.slice(0, 4).map((feature, i) => (
                  <li key={i}><Check size={14} /> {feature}</li>
                ))}
              </ul>
            </div>
            {plan === 'developer' && (
              <Button onClick={handleUpgradePlan} variant="primary">
                Upgrade to Plus <ArrowRight size={16} />
              </Button>
            )}
            {plan === 'plus' && (
              <Button onClick={() => navigate('/pricing')} variant="secondary">
                View Enterprise Options
              </Button>
            )}
          </div>
        </section>

        {/* Credit Balance */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Package size={20} />
            Credit Balance
          </h2>
          <div className={styles.creditCard}>
            <div className={styles.creditStats}>
              <div className={styles.creditStat}>
                <span className={styles.creditValue}>
                  {creditBalance?.available?.toLocaleString() || '0'}
                </span>
                <span className={styles.creditLabel}>Available</span>
              </div>
              <div className={styles.creditStat}>
                <span className={styles.creditValue}>
                  {creditBalance?.used?.toLocaleString() || '0'}
                </span>
                <span className={styles.creditLabel}>Used This Month</span>
              </div>
              <div className={styles.creditStat}>
                <span className={styles.creditValue}>
                  {creditBalance?.rollover?.toLocaleString() || '0'}
                </span>
                <span className={styles.creditLabel}>Rollover</span>
              </div>
            </div>
          </div>
        </section>

        {/* Purchase Credits */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <CreditCard size={20} />
            Purchase Credits
          </h2>
          <p className={styles.sectionDesc}>
            Buy additional credits when you need more. Credits never expire.
          </p>
          <div className={styles.packsGrid}>
            {TOKEN_PACKS.map((pack) => (
              <div key={pack.id} className={`${styles.packCard} ${pack.popular ? styles.popular : ''}`}>
                {pack.popular && <span className={styles.popularBadge}>Most Popular</span>}
                <h3>{pack.name}</h3>
                <div className={styles.packTokens}>
                  {pack.tokens.toLocaleString()} credits
                </div>
                <div className={styles.packPrice}>${pack.price}</div>
                <div className={styles.packPerToken}>
                  ${(pack.price / pack.tokens * 1000).toFixed(2)} per 1K
                </div>
                <Button
                  onClick={() => handlePurchaseCredits(pack.id)}
                  disabled={purchasingPack === pack.id}
                  variant={pack.popular ? 'primary' : 'secondary'}
                  className={styles.packButton}
                >
                  {purchasingPack === pack.id ? (
                    <>
                      <Loader2 size={16} className={styles.spinnerSmall} />
                      Processing...
                    </>
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Methods */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <CreditCard size={20} />
            Payment Methods
          </h2>
          {paymentMethods.length > 0 ? (
            <div className={styles.paymentList}>
              {paymentMethods.map((method) => (
                <div key={method.id} className={styles.paymentCard}>
                  <div className={styles.cardBrand}>{method.brand}</div>
                  <div className={styles.cardNumber}>•••• {method.last4}</div>
                  <div className={styles.cardExpiry}>
                    Expires {method.exp_month}/{method.exp_year}
                  </div>
                  {method.is_default && <span className={styles.defaultBadge}>Default</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No payment methods on file</p>
          )}
          <Button onClick={handleAddPaymentMethod} variant="secondary" style={{ marginTop: 16 }}>
            Add Payment Method
          </Button>
        </section>

        {/* Invoice History */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <History size={20} />
            Invoice History
          </h2>
          {invoices.length > 0 ? (
            <div className={styles.invoiceList}>
              {invoices.map((invoice) => (
                <div key={invoice.id} className={styles.invoiceRow}>
                  <div className={styles.invoiceDate}>
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </div>
                  <div className={styles.invoiceDesc}>{invoice.description}</div>
                  <div className={styles.invoiceAmount}>${(invoice.amount / 100).toFixed(2)}</div>
                  <div className={`${styles.invoiceStatus} ${styles[invoice.status]}`}>
                    {invoice.status}
                  </div>
                  {invoice.invoice_url && (
                    <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer" className={styles.invoiceLink}>
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No invoices yet</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default BillingPage;
