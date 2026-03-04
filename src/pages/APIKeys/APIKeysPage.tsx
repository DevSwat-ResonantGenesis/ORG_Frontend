import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Key, Copy, Check, Trash2, Plus, Eye, EyeOff, 
  Atom, Zap, Shield, Server, AlertCircle, BarChart3,
  CreditCard, ShoppingCart
} from 'lucide-react';
import APIUsageDashboard from '../../components/dashboard/APIUsageDashboard';
import { isAuthenticated } from '../../utils/auth-cookies';
import { ENV } from '../../config/env';

interface APIKey {
  id: string;
  name: string;
  key: string;
  service: string;
  plan: string;
  created_at: string;
  last_used: string | null;
  calls_today: number;
  calls_limit: number;
}

const APIKeysPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceFilter = searchParams.get('service') || 'all';
  const planParam = searchParams.get('plan') || 'free';
  const tabParam = searchParams.get('tab') || 'keys';
  
  const [activeTab, setActiveTab] = useState(tabParam);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyService, setNewKeyService] = useState(serviceFilter === 'all' ? 'state-physics' : serviceFilter);
  const [newKeyPlan, setNewKeyPlan] = useState(planParam);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Load API keys from backend
  useEffect(() => {
    const loadApiKeys = async () => {
      // Check authentication using cookies
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const API_URL = ENV.apiUrl;
        
        const response = await fetch(`${API_URL}/auth/api-keys`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include HttpOnly cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          const formattedKeys: APIKey[] = data.map((key: any) => ({
            id: key.id,
            name: key.name,
            key: key.token || `${key.prefix}••••••••••••••••••••`,
            service: 'platform', // API keys are platform-wide
            plan: 'pro',
            created_at: key.created_at,
            last_used: key.last_used_at,
            calls_today: 0,
            calls_limit: 10000,
          }));
          setKeys(formattedKeys);
        } else if (response.status === 401) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Failed to load API keys:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadApiKeys();
  }, [navigate]);

  const services = [
    { id: 'state-physics', name: 'State Physics', icon: <Atom className="w-4 h-4" />, color: 'purple' },
    { id: 'resonant-chat', name: 'AGI Neural Hub', icon: <Zap className="w-4 h-4" />, color: 'blue' },
    { id: 'governance', name: 'Governance API', icon: <Shield className="w-4 h-4" />, color: 'emerald' },
    { id: 'dsid-p', name: 'DSID-P Protocol', icon: <Server className="w-4 h-4" />, color: 'orange' }
  ];

  const plans = [
    { id: 'free', name: 'Free', limit: '100/day' },
    { id: 'pro', name: 'Pro', limit: '10,000/day' },
    { id: 'enterprise', name: 'Enterprise', limit: 'Unlimited' }
  ];

  const filteredKeys = serviceFilter === 'all' 
    ? keys 
    : keys.filter(k => k.service === serviceFilter);

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••••••••••';
  };

  const createKey = async () => {
    // Check authentication using cookies
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/auth/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HttpOnly cookies
        body: JSON.stringify({
          name: newKeyName || 'API Key',
          scopes: [],
          expires_in_days: null,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newKey: APIKey = {
          id: data.id,
          name: data.name,
          key: data.token, // The full key is only returned on creation
          service: 'platform',
          plan: 'pro',
          created_at: data.created_at,
          last_used: null,
          calls_today: 0,
          calls_limit: 10000,
        };
        
        setKeys(prev => [newKey, ...prev]);
        setCreatedKey(data.token);
      } else {
        const error = await response.json();
        console.error('Failed to create API key:', error);
        alert('Failed to create API key: ' + (error.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      // Check authentication using cookies
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      try {
        const API_URL = ENV.apiUrl;
        
        const response = await fetch(`${API_URL}/auth/api-keys/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include HttpOnly cookies
          body: JSON.stringify({ api_key_id: id }),
        });
        
        if (response.ok || response.status === 204) {
          setKeys(prev => prev.filter(k => k.id !== id));
        } else {
          const error = await response.json();
          console.error('Failed to delete API key:', error);
          alert('Failed to delete API key: ' + (error.detail || 'Unknown error'));
        }
      } catch (error) {
        console.error('Failed to delete API key:', error);
        alert('Failed to delete API key');
      }
    }
  };

  const getServiceColor = (service: string) => {
    const s = services.find(s => s.id === service);
    return s?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a] py-12">
      <Helmet>
        <title>API Keys | ResonantGenesis – Autonomous Agent Infrastructure</title>
      </Helmet>

      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">API Management</h1>
            <p className="text-gray-400">Manage your API keys, usage, and billing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Marketplace
            </button>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreatedKey(null);
                setNewKeyName('');
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-semibold hover:from-purple-600 hover:to-emerald-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Key
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-white/5 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'keys' 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'usage' 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Usage & Billing
          </button>
        </div>

        {/* Usage Tab Content */}
        {activeTab === 'usage' && (
          <APIUsageDashboard />
        )}

        {/* Keys Tab Content */}
        {activeTab === 'keys' && (
          <>
        {/* Service Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => window.history.pushState({}, '', '/api-keys')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              serviceFilter === 'all' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Services
          </button>
          {services.map(service => (
            <button
              key={service.id}
              onClick={() => window.history.pushState({}, '', `/api-keys?service=${service.id}`)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                serviceFilter === service.id 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {service.icon}
              {service.name}
            </button>
          ))}
        </div>

        {/* Keys List */}
        <div className="space-y-4 mb-8">
          {filteredKeys.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
              <Key className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No API Keys</h3>
              <p className="text-gray-400 mb-6">Create your first API key to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                Create API Key
              </button>
            </div>
          ) : (
            filteredKeys.map(key => (
              <div key={key.id} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-white">{key.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        key.plan === 'pro' ? 'bg-emerald-500/20 text-emerald-400' :
                        key.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {key.plan.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {services.find(s => s.id === key.service)?.icon}
                      <span>{services.find(s => s.id === key.service)?.name}</span>
                      <span className="text-gray-600">•</span>
                      <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Key Display */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-black/30 font-mono text-sm mb-4">
                  <code className="flex-1 text-gray-300">
                    {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(key.id)}
                    className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    {visibleKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(key.key, key.id)}
                    className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedKey === key.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Usage Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Today's Usage:</span>
                    <span className="ml-2 text-white">{key.calls_today.toLocaleString()} / {key.calls_limit.toLocaleString()}</span>
                  </div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        key.calls_today / key.calls_limit > 0.9 ? 'bg-red-500' :
                        key.calls_today / key.calls_limit > 0.7 ? 'bg-yellow-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (key.calls_today / key.calls_limit) * 100)}%` }}
                    />
                  </div>
                  {key.last_used && (
                    <div className="text-gray-500">
                      Last used: {new Date(key.last_used).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a2e] rounded-2xl p-8 max-w-md w-full border border-white/10">
              {createdKey ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">API Key Created!</h2>
                    <p className="text-gray-400">Make sure to copy your key now. You won't be able to see it again.</p>
                  </div>

                  <div className="p-4 rounded-lg bg-black/30 mb-6">
                    <code className="text-sm text-emerald-400 break-all">{createdKey}</code>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdKey);
                        setCopiedKey('new');
                        setTimeout(() => setCopiedKey(null), 2000);
                      }}
                      className="flex-1 py-3 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {copiedKey === 'new' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {copiedKey === 'new' ? 'Copied!' : 'Copy Key'}
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">Create New API Key</h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Key Name</label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., Production Key"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Service</label>
                      <select
                        value={newKeyService}
                        onChange={(e) => setNewKeyService(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                      >
                        {services.map(service => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Plan</label>
                      <div className="grid grid-cols-3 gap-2">
                        {plans.map(plan => (
                          <button
                            key={plan.id}
                            onClick={() => setNewKeyPlan(plan.id)}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              newKeyPlan === plan.id
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-xs text-gray-500">{plan.limit}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {newKeyPlan !== 'free' && (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-6 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-200">
                        <strong>Note:</strong> {newKeyPlan === 'pro' ? 'Pro' : 'Enterprise'} keys require an active subscription. 
                        <a href={`/state-physics-api?plan=${newKeyPlan}`} className="underline ml-1">View pricing</a>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createKey}
                      disabled={!newKeyName || loading}
                      className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-semibold hover:from-purple-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Key'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIKeysPage;
