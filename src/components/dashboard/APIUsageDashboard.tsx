import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, TrendingUp, AlertTriangle, CreditCard, 
  ExternalLink, RefreshCw, ChevronRight, Zap,
  BarChart3, Clock, CheckCircle, XCircle
} from 'lucide-react';
import {
  getAPISubscriptions,
  getAPIUsageSummary,
  getCurrentBillingCosts,
  type APISubscription,
  type APIUsageSummary
} from '../../api/apiUsage';

interface APIUsageDashboardProps {
  compact?: boolean;
}

const APIUsageDashboard: React.FC<APIUsageDashboardProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<APISubscription[]>([]);
  const [usage, setUsage] = useState<APIUsageSummary[]>([]);
  const [billingCosts, setBillingCosts] = useState<{
    base_cost: number;
    overage_cost: number;
    total_cost: number;
    next_billing_date: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, usageSummary, costs] = await Promise.all([
        getAPISubscriptions(),
        getAPIUsageSummary(),
        getCurrentBillingCosts()
      ]);
      setSubscriptions(subs);
      setUsage(usageSummary);
      setBillingCosts(costs);
    } catch (err) {
      setError('Failed to load API usage data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'trialing': return 'text-blue-400';
      case 'past_due': return 'text-amber-400';
      case 'canceled': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-white/10 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadData}
          className="mt-3 px-4 py-2 rounded bg-white/10 text-white text-sm hover:bg-white/20"
        >
          Retry
        </button>
      </div>
    );
  }

  // Compact view for dashboard widget
  if (compact) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            API Usage
          </h3>
          <button
            onClick={() => navigate('/api-keys')}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-4">No API subscriptions yet</p>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600"
            >
              Browse APIs
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {usage.slice(0, 3).map((api) => (
              <div key={api.api_id} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{api.api_name}</span>
                  <span className="text-gray-400 text-xs">
                    {formatNumber(api.total_simulation_units)} / {formatNumber(api.included_units)} SU
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getUsageColor(api.usage_percent)} transition-all`}
                    style={{ width: `${Math.min(api.usage_percent, 100)}%` }}
                  />
                </div>
                {api.overage_units > 0 && (
                  <div className="mt-1 text-xs text-amber-400">
                    +{formatNumber(api.overage_units)} overage ({formatCurrency(api.overage_cost)})
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {billingCosts && billingCosts.total_cost > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Current Period</span>
              <span className="text-white font-semibold">{formatCurrency(billingCosts.total_cost)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">API Usage & Billing</h2>
        <button
          onClick={loadData}
          className="p-2 rounded-lg bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Billing Summary */}
      {billingCosts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <CreditCard className="w-4 h-4" />
              Base Cost
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(billingCosts.base_cost)}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              Overage Cost
            </div>
            <div className="text-2xl font-bold text-amber-400">{formatCurrency(billingCosts.overage_cost)}</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-500/30">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Zap className="w-4 h-4" />
              Total This Period
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(billingCosts.total_cost)}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Clock className="w-4 h-4" />
              Next Billing
            </div>
            <div className="text-lg font-semibold text-white">
              {billingCosts.next_billing_date 
                ? new Date(billingCosts.next_billing_date).toLocaleDateString()
                : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Active Subscriptions</h3>
        </div>
        
        {subscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">No active API subscriptions</p>
            <button
              onClick={() => navigate('/pricing')}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-semibold hover:from-purple-600 hover:to-emerald-600"
            >
              Browse API Marketplace
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {subscriptions.map((sub) => {
              const apiUsage = usage.find(u => u.api_id === sub.api_id);
              return (
                <div key={sub.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium">{sub.api_name}</h4>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={getStatusColor(sub.status)}>
                          {sub.status === 'active' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{sub.plan.toUpperCase()} Plan</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{formatCurrency(sub.price)}/mo</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/api-keys?service=${sub.api_id}`)}
                      className="px-3 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20"
                    >
                      Manage
                    </button>
                  </div>

                  {apiUsage && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">
                          {formatNumber(apiUsage.total_simulation_units)} / {formatNumber(apiUsage.included_units)} SU used
                        </span>
                        <span className={apiUsage.usage_percent >= 90 ? 'text-red-400' : 'text-gray-400'}>
                          {apiUsage.usage_percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getUsageColor(apiUsage.usage_percent)} transition-all`}
                          style={{ width: `${Math.min(apiUsage.usage_percent, 100)}%` }}
                        />
                      </div>
                      {apiUsage.overage_units > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                          {formatNumber(apiUsage.overage_units)} overage units • {formatCurrency(apiUsage.overage_cost)} additional
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/pricing')}
          className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all text-left"
        >
          <BarChart3 className="w-6 h-6 text-purple-400 mb-2" />
          <h4 className="text-white font-medium">Browse APIs</h4>
          <p className="text-gray-400 text-sm">Explore and subscribe to new APIs</p>
        </button>
        <button
          onClick={() => navigate('/api-keys')}
          className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all text-left"
        >
          <CreditCard className="w-6 h-6 text-emerald-400 mb-2" />
          <h4 className="text-white font-medium">Manage Keys</h4>
          <p className="text-gray-400 text-sm">View and manage your API keys</p>
        </button>
      </div>
    </div>
  );
};

export default APIUsageDashboard;
