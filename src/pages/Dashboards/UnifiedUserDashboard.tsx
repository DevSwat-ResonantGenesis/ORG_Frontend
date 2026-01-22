/**
 * User Dashboard - Clean & Simple
 * For free/developer tier users
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Zap, 
  CreditCard, 
  Clock,
  Sparkles,
  ChevronRight,
  Bot,
  Crown,
  ArrowUpRight,
  Settings,
  HelpCircle,
  Brain,
  FileText,
  BarChart3,
  Plus,
  ShoppingCart,
  ExternalLink
} from 'lucide-react';
import { getSessionData, isAuthenticated } from '../../utils/auth-cookies';
import { getSubscription, getCredits, type Subscription, type CreditBalance } from '../../api/billing';
import { getChatHistory, getUserAnalytics, type UserAnalytics } from '../../api/resonantChat';
import { listAgents } from '../../api/agents';
import { fetchUsageMetrics, type UsageMetrics } from '../../api/usage';
import { logger } from '../../utils/logger';
import { Button } from '../../components/ui';
import styles from './UnifiedUserDashboard.module.css';
import { getPlanById, getPlanCredits, getSimplePlanLimits } from '../../config/pricingConfig';
import { LimitWarningBanner } from '../../components/features/LimitWarningBanner';
import { PlanComparisonWidget } from '../../components/features/PlanComparisonWidget';
import { UsageChart } from '../../components/features/UsageChart';

interface DashboardStats {
  credits: number;
  creditsLimit: number;
  messages: number;
  conversations: number;
  conversationsLimit: number;
  agents: number;
  agentsLimit: number;
  memories: number;
  ragDocuments: number;
  ragDocumentsLimit: number;
}

const UnifiedUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const session = getSessionData();
  
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [buyCreditsLoading, setBuyCreditsLoading] = useState(false);
  const [planTier, setPlanTier] = useState<'developer' | 'plus' | 'enterprise'>('developer');
  const [conversations, setConversations] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    credits: 0,
    creditsLimit: 0, // Will be fetched from API
    messages: 0,
    conversations: 0,
    conversationsLimit: -1,
    agents: 0,
    agentsLimit: -1, // Unlimited - we bill by credits only
    memories: 0,
    ragDocuments: 0,
    ragDocumentsLimit: -1,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
    fetchConversations();

    // Fetch user's tier pricing
    async function loadTierPricing() {
      const sessionData = JSON.parse(localStorage.getItem('session') || '{}');
      const userTier = sessionData.plan || 'developer';

      try {
        const planData = await fetchPlan(userTier);
        if (planData?.credits?.included) {
          setStats(prev => ({
            ...prev,
            creditsLimit: planData.credits.included
          }));
        }
      } catch (error) {
        console.error('Failed to load tier pricing:', error);
      }
    }
    loadTierPricing();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [subscriptionData, creditsData, conversationData, agentsData, analyticsData, usageMetrics] = await Promise.all([
        getSubscription().catch(() => ({ plan: 'developer', status: 'active' })),
        getCredits().catch(() => ({ balance: getPlanCredits('developer'), lifetime_used: 0 })),
        getChatHistory().catch(() => ({ conversations: [] })),
        listAgents().catch(() => []),
        getUserAnalytics('30d').catch(() => null),
        fetchUsageMetrics().catch(() => null),
      ]);

      // Determine plan tier
      const plan = (subscriptionData as any)?.plan?.toLowerCase() || 'developer';
      let tier: 'developer' | 'plus' | 'enterprise' = 'developer';
      if (plan === 'plus' || plan === 'professional') tier = 'plus';
      else if (plan === 'enterprise') tier = 'enterprise';
      setPlanTier(tier);

      // Get conversations
      const convArray = Array.isArray(conversationData) 
        ? conversationData 
        : (conversationData?.conversations || []);
      setConversations(convArray.slice(0, 5));

      // Calculate stats from usage metrics or fallback to plan defaults from pricingConfig
      const planLimits = getSimplePlanLimits(tier);
      const creditsLimit = usageMetrics?.credits?.limit || getPlanCredits(tier);
      const agentsLimit = usageMetrics?.agents?.limit || planLimits.agents;
      const conversationsLimit = usageMetrics?.conversations?.limit || planLimits.conversations;
      const ragDocsLimit = usageMetrics?.ragDocuments?.limit || planLimits.ragDocuments;
      
      setStats({
        credits: creditsData?.balance || usageMetrics?.credits?.balance || 0,
        creditsLimit,
        messages: (analyticsData as UserAnalytics)?.usage?.total_messages || 0,
        conversations: usageMetrics?.conversations?.count || convArray.length,
        conversationsLimit,
        agents: usageMetrics?.agents?.active || (Array.isArray(agentsData) ? agentsData.length : 0),
        agentsLimit,
        memories: (analyticsData as any)?.usage?.total_memories || 0,
        ragDocuments: usageMetrics?.ragDocuments?.used || 0,
        ragDocumentsLimit: ragDocsLimit,
      });
    } catch (err) {
      logger.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const response = await fetch('/api/billing/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: 'plus',
          billing_cycle: 'monthly',
          success_url: `${window.location.origin}/dashboard?success=true`,
          cancel_url: `${window.location.origin}/dashboard?canceled=true`,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url || data.url;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleBuyCredits = async (packId: string) => {
    setBuyCreditsLoading(true);
    try {
      const response = await fetch('/api/billing/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pack_id: packId,
          success_url: `${window.location.origin}/dashboard?credits_purchased=true`,
          cancel_url: `${window.location.origin}/dashboard?canceled=true`,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url || data.url;
      } else {
        const error = await response.json();
        console.error('Credit purchase failed:', error);
      }
    } catch (err) {
      console.error('Credit purchase failed:', err);
    } finally {
      setBuyCreditsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getUsagePercent = (used: number, limit: number): number => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const plusPlan = getPlanById('plus');

  return (
    <div className={styles.dashboard}>
      {/* Limit Warning Banners */}
      {planTier === 'developer' && (
        <>
          <LimitWarningBanner type="credits" used={stats.creditsLimit - stats.credits} limit={stats.creditsLimit} />
          <LimitWarningBanner type="conversations" used={stats.conversations} limit={stats.conversationsLimit} />
          <LimitWarningBanner type="agents" used={stats.agents} limit={stats.agentsLimit} />
          <LimitWarningBanner type="rag_documents" used={stats.ragDocuments} limit={stats.ragDocumentsLimit} />
        </>
      )}

      {/* Plan & Credits */}
      <section className={styles.planSection}>
        <div className={styles.planCard}>
          <div className={styles.planHeader}>
            <div className={styles.planBadge}>
              <Zap size={16} />
              <span>{planTier === 'developer' ? 'Developer' : planTier === 'plus' ? 'Plus' : 'Enterprise'}</span>
            </div>
            {planTier === 'developer' && (
              <button className={styles.upgradeBtn} onClick={handleUpgrade} disabled={upgradeLoading}>
                <ArrowUpRight size={14} />
                {upgradeLoading ? 'Loading...' : 'Upgrade to Plus'}
              </button>
            )}
          </div>
          <div className={styles.creditsDisplay}>
            <div className={styles.creditsMain}>
              <span className={styles.creditsValue}>{formatNumber(stats.credits)}</span>
              <span className={styles.creditsLabel}>credits remaining</span>
            </div>
            <div className={styles.creditsBar}>
              <div 
                className={styles.creditsBarFill} 
                style={{ width: `${100 - getUsagePercent(stats.creditsLimit - stats.credits, stats.creditsLimit)}%` }}
              />
            </div>
            <span className={styles.creditsSubtext}>of {formatNumber(stats.creditsLimit)} monthly credits</span>
          </div>
        </div>
      </section>

      {/* Credit Purchase Section */}
      <section className={styles.creditPurchaseSection}>
        <div className={styles.creditPurchaseCard}>
          <div className={styles.creditPurchaseHeader}>
            <ShoppingCart size={20} />
            <h3>Buy More Credits</h3>
          </div>
          
          {planTier === 'developer' ? (
            <div className={styles.upgradePrompt}>
              <div className={styles.upgradePromptContent}>
                <Crown size={24} className={styles.crownIcon} />
                <div>
                  <p className={styles.upgradePromptTitle}>Credit purchases available on Plus plan</p>
                  <p className={styles.upgradePromptDesc}>Upgrade to Plus to buy additional credits anytime</p>
                </div>
              </div>
              <button 
                className={styles.upgradePromptBtn} 
                onClick={handleUpgrade}
                disabled={upgradeLoading}
              >
                <ArrowUpRight size={16} />
                {upgradeLoading ? 'Loading...' : 'Upgrade to Plus - $49/mo'}
              </button>
            </div>
          ) : (
            <div className={styles.creditPacks}>
              <button 
                className={styles.creditPack}
                onClick={() => handleBuyCredits('basic')}
                disabled={buyCreditsLoading}
              >
                <span className={styles.creditPackAmount}>10,000</span>
                <span className={styles.creditPackLabel}>credits</span>
                <span className={styles.creditPackPrice}>$8</span>
              </button>
              <button 
                className={styles.creditPack}
                onClick={() => handleBuyCredits('growth')}
                disabled={buyCreditsLoading}
              >
                <span className={styles.creditPackAmount}>50,000</span>
                <span className={styles.creditPackLabel}>credits</span>
                <span className={styles.creditPackPrice}>$35</span>
                <span className={styles.creditPackBadge}>Popular</span>
              </button>
              <button 
                className={styles.creditPack}
                onClick={() => handleBuyCredits('professional')}
                disabled={buyCreditsLoading}
              >
                <span className={styles.creditPackAmount}>100,000</span>
                <span className={styles.creditPackLabel}>credits</span>
                <span className={styles.creditPackPrice}>$60</span>
                <span className={styles.creditPackBadge}>Best Value</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Plus Subscription Bar */}
      {planTier === 'developer' && (
        <section className={styles.subscriptionBar}>
          <div className={styles.subscriptionBarContent}>
            <div className={styles.subscriptionBarLeft}>
              <div className={styles.subscriptionBarIcon}>
                <Crown size={24} />
              </div>
              <div className={styles.subscriptionBarText}>
                <h3>Upgrade to Plus Plan</h3>
                <p>50,000 credits/month • Unlimited conversations • Priority support</p>
              </div>
            </div>
            <div className={styles.subscriptionBarRight}>
              <span className={styles.subscriptionBarPrice}>
                <span className={styles.priceAmount}>$49</span>
                <span className={styles.pricePeriod}>/month</span>
              </span>
              <button 
                className={styles.subscriptionBarBtn}
                onClick={handleUpgrade}
                disabled={upgradeLoading}
              >
                {upgradeLoading ? 'Redirecting...' : 'Subscribe Now'}
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <section className={styles.statsSection}>
        <h2><Sparkles size={20} /> Your Activity</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <MessageSquare size={24} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.messages}</span>
              <span className={styles.statLabel}>Messages Sent</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <FileText size={24} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.conversations}</span>
              <span className={styles.statLabel}>Conversations</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Bot size={24} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.agents} / {stats.agentsLimit > 0 ? stats.agentsLimit : '∞'}</span>
              <span className={styles.statLabel}>AI Agents</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Brain size={24} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.memories}</span>
              <span className={styles.statLabel}>Memories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Chart */}
      <section className={styles.chartSection}>
        <UsageChart days={14} height={100} />
      </section>

      {/* Core Features */}
      <section className={styles.featuresSection}>
        <h2><Zap size={20} /> Quick Access</h2>
        <div className={styles.featuresGrid}>
          <button className={styles.featureCard} onClick={() => navigate('/resonant-chat')}>
            <div className={styles.featureIcon}><MessageSquare size={28} /></div>
            <div className={styles.featureInfo}>
              <h3>Resonant Chat</h3>
              <p>AI conversations with memory</p>
            </div>
            <ChevronRight size={20} />
          </button>
          
          <button className={styles.featureCard} onClick={() => navigate('/agents')}>
            <div className={styles.featureIcon}><Bot size={28} /></div>
            <div className={styles.featureInfo}>
              <h3>AI Agents</h3>
              <p>Create and manage agents</p>
            </div>
            <ChevronRight size={20} />
          </button>
          
          <button className={styles.featureCard} onClick={() => navigate('/usage')}>
            <div className={styles.featureIcon}><BarChart3 size={28} /></div>
            <div className={styles.featureInfo}>
              <h3>Usage & Credits</h3>
              <p>View detailed metrics</p>
            </div>
            <ChevronRight size={20} />
          </button>

          <button className={styles.featureCard} onClick={() => navigate('/profile')}>
            <div className={styles.featureIcon}><Settings size={28} /></div>
            <div className={styles.featureInfo}>
              <h3>Profile</h3>
              <p>Account & preferences</p>
            </div>
            <ChevronRight size={20} />
          </button>
          
          <button className={styles.featureCard} onClick={() => navigate('/help')}>
            <div className={styles.featureIcon}><HelpCircle size={28} /></div>
            <div className={styles.featureInfo}>
              <h3>Help Center</h3>
              <p>Guides & support</p>
            </div>
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Recent Conversations */}
      <section className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h2><Clock size={20} /> Recent Conversations</h2>
          <button className={styles.viewAllBtn} onClick={() => navigate('/resonant-chat')}>
            View All
          </button>
        </div>
        {conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={32} />
            <p>No conversations yet</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/resonant-chat')}>
              Start Your First Chat
            </Button>
          </div>
        ) : (
          <div className={styles.conversationsList}>
            {conversations.map((conv, idx) => (
              <button
                key={conv.id || idx}
                className={styles.conversationItem}
                onClick={() => navigate(`/resonant-chat?id=${conv.id}`)}
              >
                <MessageSquare size={18} />
                <div className={styles.convInfo}>
                  <span className={styles.convTitle}>{conv.title || 'Untitled Chat'}</span>
                  <span className={styles.convDate}>
                    {conv.created_at ? new Date(conv.created_at).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Upgrade CTA for Free Users */}
      {planTier === 'developer' && plusPlan && (
        <section className={styles.upgradeCta}>
          <div className={styles.upgradeContent}>
            <Crown size={32} />
            <div>
              <h2>Unlock More with Plus</h2>
              <p>50,000 credits/month, autonomous agents, workflows, and more!</p>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleUpgrade}
            disabled={upgradeLoading}
          >
            <Crown size={18} />
            {upgradeLoading ? 'Loading...' : 'Upgrade to Plus - $49/month'}
          </Button>
        </section>
      )}
    </div>
  );
};

export default UnifiedUserDashboard;
