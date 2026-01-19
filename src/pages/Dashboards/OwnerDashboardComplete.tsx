/**
 * Owner Dashboard Complete - Platform Owner Control Center
 * Comprehensive dashboard with:
 * - RARA Visualization & Control
 * - Blockchain Node Management
 * - Autonomous Agents (Code Refactor, Security, Deploy)
 * - Pricing Management
 * - Memory Universes / Hash Sphere
 * - Platform Metrics
 * - User Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OwnerDashboard.module.css';
import { 
  getLLMProviders, 
  getAllLLMProvidersUsage, 
  createLLMProvider, 
  updateLLMProvider, 
  deleteLLMProvider, 
  testLLMProvider, 
  toggleLLMProvider,
  PROVIDER_TYPES,
  DEFAULT_MODELS,
  DEFAULT_API_URLS,
  type LLMProvider,
  type LLMProviderUsage 
} from '@/api/llmProviders';
import * as dashboardApi from '@/api/ownerDashboard';

// ============== ICONS ==============
const CrownIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const ActivityIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const CpuIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const DatabaseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>;
const ServerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>;
const BotIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg>;
const RefreshIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
const LogOutIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const GlobeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const CodeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const ShieldIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const ZapIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const BoxIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
const AlertIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const PlayIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const StopIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>;

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const RARA_BASE = API_BASE; // All requests go through gateway

// ============== TYPES ==============
interface RARAStatus {
  state: string;
  active_mutation: string | null;
  last_snapshot: string;
  agents_registered: number;
  mutations_today: number;
  rollbacks_today: number;
  invariant_violations: number;
  uptime_seconds: number;
}

interface AutonomousAgent {
  id: string;
  name: string;
  type: 'code_refactor' | 'security_audit' | 'deployment' | 'testing' | 'monitoring';
  status: 'active' | 'idle' | 'paused' | 'error';
  tasksCompleted: number;
  tasksQueued: number;
  lastAction: string;
  cpuUsage: number;
  memoryUsage: number;
  codebaseAccess: boolean;
  autoActivateOnDeploy: boolean;
}

interface BlockchainNode {
  id: string;
  network: string;
  status: 'connected' | 'syncing' | 'disconnected';
  blockHeight: number;
  lastAnchor: string;
  anchorsToday: number;
  gasBalance: string;
}

interface MemoryUniverse {
  id: string;
  name: string;
  nodeCount: number;
  edgeCount: number;
  totalMemories: number;
  lastSync: string;
  status: 'active' | 'archived';
}

interface PlanLimits {
  conversations: number;
  messagesPerDay: number;
  messagesPerConversation: number;
  storageMb: number;
  maxMemoryItems: number;
  apiRatePerMin: number;
  fileUploadMb: number;
  agentsAllowed: number;
  computeHours: number;
}

interface PricingConfig {
  creditRate: number;
  topupPrice: number;
  topupAmount: number;
  minTopupAmount: number;
  developer: {
    credits: number;
    price: number;
    limits: PlanLimits;
  };
  plus: {
    credits: number;
    price: number;
    limits: PlanLimits;
  };
  enterprise: {
    credits: number;
    price: number;
    limits: PlanLimits;
  };
}

type TabType = 'overview' | 'rara' | 'agents' | 'blockchain' | 'universes' | 'controlplane' | 'pricing' | 'users' | 'monitoring' | 'settings' | 'llm-providers';

// ============== MAIN COMPONENT ==============
const OwnerDashboardComplete: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RARA State
  const [raraStatus, setRaraStatus] = useState<RARAStatus | null>(null);
  const [raraAgents, setRaraAgents] = useState<any[]>([]);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // Autonomous Agents - LOADED FROM BACKEND (NO FAKE DATA)
  const [autonomousAgents, setAutonomousAgents] = useState<AutonomousAgent[]>([]);

  // Blockchain Nodes - LOADED FROM BACKEND (NO FAKE DATA)
  const [blockchainNodes, setBlockchainNodes] = useState<BlockchainNode[]>([]);

  // Memory Universes - LOADED FROM BACKEND (NO FAKE DATA)
  const [universes, setUniverses] = useState<MemoryUniverse[]>([]);

  // Pricing Config - ONLY loaded from backend YAML (NO localStorage)
  const [pricing, setPricing] = useState<PricingConfig>({
    creditRate: 0.001,
    topupPrice: 8,
    topupAmount: 10000,
    minTopupAmount: 5,
    developer: {
      credits: 1000,
      price: 0,
      limits: {
        conversations: 10,
        messagesPerDay: 100,
        messagesPerConversation: 50,
        storageMb: 100,
        maxMemoryItems: 1000,
        apiRatePerMin: 30,
        fileUploadMb: 5,
        agentsAllowed: -1,  // Unlimited - we bill by credits only
        computeHours: 10,
      }
    },
    plus: {
      credits: 50000,
      price: 49,
      limits: {
        conversations: 1000,
        messagesPerDay: 1000,
        messagesPerConversation: 500,
        storageMb: 5000,
        maxMemoryItems: 100000,
        apiRatePerMin: 300,
        fileUploadMb: 100,
        agentsAllowed: 20,
        computeHours: 100,
      }
    },
    enterprise: {
      credits: 500000,
      price: 299,
      limits: {
        conversations: -1,
        messagesPerDay: -1,
        messagesPerConversation: -1,
        storageMb: 100000,
        maxMemoryItems: -1,
        apiRatePerMin: -1,
        fileUploadMb: 1000,
        agentsAllowed: -1,
        computeHours: -1,
      }
    }
  });
  const [pricingLoading, setPricingLoading] = useState(true);
  
  // Load pricing ONLY from backend YAML on mount
  useEffect(() => {
    const loadPricingFromBackend = async () => {
      const token = localStorage.getItem('owner_token');
      if (!token) return;
      
      setPricingLoading(true);
      try {
        const res = await fetch(`${API_BASE}/owner/auth/pricing`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPricing(data);
            console.log('✅ Loaded pricing from backend YAML');
          }
        }
      } catch (err) {
        console.error('Failed to load pricing from backend:', err);
      } finally {
        setPricingLoading(false);
      }
    };
    loadPricingFromBackend();
  }, []);
  
  // Platform Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    mrr: 0,
    creditsConsumed: 0,
    apiCalls: 0,
    activeAgents: 0,
    totalAgents: 0,
  });

  // Users
  const [users, setUsers] = useState<any[]>([]);

  // Promo Codes - LOADED FROM BACKEND ONLY (NO FAKE DATA)
  const [promoCodes, setPromoCodes] = useState<{code: string, discount: number, type: 'percent' | 'credits', expiry: string, uses: number}[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', discount: 25, type: 'percent' as 'percent' | 'credits', expiry: '' });
  
  // Load promo codes from backend on mount
  useEffect(() => {
    const loadPromoCodesFromBackend = async () => {
      const token = localStorage.getItem('owner_token');
      if (!token) return;
      
      try {
        const res = await fetch(`${API_BASE}/owner/auth/promo-codes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.promo_codes) {
            setPromoCodes(data.promo_codes);
            console.log('✅ Loaded promo codes from backend');
          }
        }
      } catch (err) {
        console.error('Failed to load promo codes from backend:', err);
      }
    };
    loadPromoCodesFromBackend();
  }, []);

  // LLM Providers State
  const [llmProviders, setLlmProviders] = useState<any[]>([]);
  const [llmProvidersUsage, setLlmProvidersUsage] = useState<any[]>([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Service Health - LOADED FROM BACKEND (NO FAKE DATA)
  const [services, setServices] = useState<any[]>([]);

  // Gateway Metrics
  const [gatewayMetrics, setGatewayMetrics] = useState<any>(null);
  
  // RARA Detailed Status
  const [raraDetailedStatus, setRaraDetailedStatus] = useState<any>(null);

  // Memory Universe Data
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [anchors, setAnchors] = useState<any[]>([]);
  const [archivedFiles, setArchivedFiles] = useState<any>(null);
  const [selectedUniverse, setSelectedUniverse] = useState<string | null>(null);

  // RARA Extended Data
  const [raraCoordStats, setRaraCoordStats] = useState<any>(null);
  const [raraPendingProposals, setRaraPendingProposals] = useState<any[]>([]);
  const [raraInvariantResults, setRaraInvariantResults] = useState<any>(null);
  const [raraKillSwitchEvents, setRaraKillSwitchEvents] = useState<any[]>([]);

  // Blockchain Data
  const [blockchainStats, setBlockchainStats] = useState<any>(null);
  const [dsidStats, setDsidStats] = useState<any>({ total: 0, active: 0, revoked: 0, anchored: 0 });
  const [auditStats, setAuditStats] = useState<any>({ total_entries: 0, merkle_roots: 0, last_anchor: 'Never' });
  const [graphStats, setGraphStats] = useState<any>({ total_blocks: 0, transactions: 0, hash_nodes: 0, graph_edges: 0 });

  // Fetch data - ALL FROM REAL BACKEND ENDPOINTS
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('owner_token');
    if (!token) {
      navigate('/owner-login');
      return;
    }

    try {
      // Fetch ALL data from real backend endpoints in parallel
      const [
        statsResult,
        usersResult,
        agentsResult,
        nodesResult,
        universesResult,
        servicesResult,
        raraResult,
      ] = await Promise.allSettled([
        dashboardApi.getPlatformStats(),
        dashboardApi.getUsers(),
        dashboardApi.getAutonomousAgents(),
        dashboardApi.getBlockchainNodes(),
        dashboardApi.getMemoryUniverses(),
        dashboardApi.getServicesHealth(),
        dashboardApi.getRARAStatus(),
      ]);

      // Update stats
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      }

      // Update users
      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value.users || []);
      }

      // Update autonomous agents
      if (agentsResult.status === 'fulfilled') {
        setAutonomousAgents((agentsResult.value as any).agents || []);
      }

      // Update blockchain nodes
      if (nodesResult.status === 'fulfilled') {
        setBlockchainNodes((nodesResult.value as any).nodes || []);
      }

      // Update memory universes
      if (universesResult.status === 'fulfilled') {
        setUniverses((universesResult.value as any).universes || []);
      }

      // Update services health
      if (servicesResult.status === 'fulfilled') {
        setServices(servicesResult.value.services || []);
      }

      // Update RARA status
      if (raraResult.status === 'fulfilled') {
        setRaraStatus(raraResult.value);
        setKillSwitchActive(raraResult.value.kill_switch_active || false);
      }

      // Also try direct RARA service for agents
      try {
        const raraAgentsRes = await dashboardApi.getRARAAgents();
        setRaraAgents(raraAgentsRes.agents || []);
      } catch (e) {
        console.log('RARA agents not available');
      }

      // Fetch gateway metrics
      try {
        const metricsRes = await fetch(`${API_BASE}/metrics`);
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setGatewayMetrics(metricsData);
        }
      } catch (e) {
        console.log('Metrics endpoint not available');
      }

      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load some data');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Fetch pricing config from backend when pricing tab is active
  useEffect(() => {
    if (activeTab === 'pricing') {
      const fetchPricing = async () => {
        const token = localStorage.getItem('owner_token') || localStorage.getItem('token');
        const endpoints = [
          `${API_BASE}/owner/auth/pricing`,
        ];
        
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
              const data = await res.json();
              // Map backend data to our pricing state structure
              if (data.plans) {
                setPricing(prev => ({
                  ...prev,
                  creditRate: data.creditRate || prev.creditRate,
                  topupPrice: data.topup?.price || prev.topupPrice,
                  topupAmount: data.topup?.amount || prev.topupAmount,
                  developer: {
                    ...prev.developer,
                    credits: data.plans.developer?.credits?.included || prev.developer.credits,
                    limits: {
                      ...prev.developer.limits,
                      conversations: data.plans.developer?.limits?.chat?.conversations || prev.developer.limits.conversations,
                      messagesPerDay: data.plans.developer?.limits?.chat?.messagesPerDay || prev.developer.limits.messagesPerDay,
                      agentsAllowed: data.plans.developer?.limits?.agents?.active || prev.developer.limits.agentsAllowed,
                      computeHours: data.plans.developer?.limits?.compute?.hours || prev.developer.limits.computeHours,
                    }
                  },
                  plus: {
                    ...prev.plus,
                    credits: data.plans.plus?.credits?.included || prev.plus.credits,
                    price: data.plans.plus?.price?.monthly || prev.plus.price,
                    limits: {
                      ...prev.plus.limits,
                      conversations: data.plans.plus?.limits?.chat?.conversations || prev.plus.limits.conversations,
                      messagesPerDay: data.plans.plus?.limits?.chat?.messagesPerDay || prev.plus.limits.messagesPerDay,
                      agentsAllowed: data.plans.plus?.limits?.agents?.active || prev.plus.limits.agentsAllowed,
                      computeHours: data.plans.plus?.limits?.compute?.hours || prev.plus.limits.computeHours,
                    }
                  },
                  enterprise: {
                    ...prev.enterprise,
                    credits: data.plans.enterprise?.credits?.included || prev.enterprise.credits,
                    price: data.plans.enterprise?.price?.monthly || prev.enterprise.price,
                  }
                }));
              }
              console.log('✅ Pricing loaded from backend');
              return;
            }
          } catch (err) {
            console.log(`Failed to fetch pricing from ${endpoint}`);
          }
        }
        
        // Try localStorage fallback
        const stored = localStorage.getItem('platform_pricing_full');
        if (stored) {
          try {
            const data = JSON.parse(stored);
            setPricing(data);
            console.log('✅ Pricing loaded from localStorage');
          } catch (e) {
            console.log('Failed to parse stored pricing');
          }
        }
      };
      fetchPricing();
    }
  }, [activeTab]);

  // Fetch blockchain data when tab changes to blockchain
  useEffect(() => {
    if (activeTab === 'blockchain') {
      const fetchBC = async () => {
        try {
          const token = localStorage.getItem('owner_token') || localStorage.getItem('token');
          const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
          const bcBase = `${API_BASE}/api/blockchain`;
          
          const chainRes = await fetch(`${bcBase}/chain/stats`, { headers });
          if (chainRes.ok) setBlockchainStats(await chainRes.json());
          const auditRes = await fetch(`${bcBase}/audit/stats`, { headers });
          if (auditRes.ok) setAuditStats(await auditRes.json());
          const graphRes = await fetch(`${bcBase}/graph/stats`, { headers });
          if (graphRes.ok) setGraphStats(await graphRes.json());
        } catch (err) {
          console.error('Error fetching blockchain data:', err);
        }
      };
      fetchBC();
    }
  }, [activeTab]);

  // Fetch RARA data when tab changes to rara
  useEffect(() => {
    if (activeTab === 'rara') {
      const fetchRara = async () => {
        try {
          const coordRes = await fetch(`${RARA_BASE}/coordination/stats`);
          if (coordRes.ok) setRaraCoordStats(await coordRes.json());
          const proposalsRes = await fetch(`${RARA_BASE}/proposals/pending`);
          if (proposalsRes.ok) setRaraPendingProposals(await proposalsRes.json());
          const eventsRes = await fetch(`${RARA_BASE}/control/kill-switch/events?limit=10`);
          if (eventsRes.ok) setRaraKillSwitchEvents(await eventsRes.json());
        } catch (err) {
          console.error('Error fetching RARA data:', err);
        }
      };
      fetchRara();
    }
  }, [activeTab]);

  // Fetch memory data when tab changes to universes
  useEffect(() => {
    if (activeTab === 'universes') {
      // Call fetchMemoryData if it exists (defined later in component)
      const fetchMem = async () => {
        try {
          const statsRes = await fetch(`${API_BASE}/memory/stats`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
          if (statsRes.ok) {
            const data = await statsRes.json();
            setMemoryStats(data);
          }
          const anchorsRes = await fetch(`${API_BASE}/memory/hash-sphere/anchors?limit=100`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
          if (anchorsRes.ok) {
            const data = await anchorsRes.json();
            setAnchors(data);
          }
          const archivedRes = await fetch(`${API_BASE}/memory/archived/files`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
          if (archivedRes.ok) {
            const data = await archivedRes.json();
            setArchivedFiles(data);
          }
        } catch (err) {
          console.error('Error fetching memory data:', err);
        }
      };
      fetchMem();
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('owner_token');
    localStorage.removeItem('owner_token_expires');
    navigate('/owner-login');
  };

  // RARA Controls - USING REAL BACKEND API
  const handleKillSwitch = async (activate: boolean) => {
    try {
      const result = await dashboardApi.toggleRARAKillSwitch(activate);
      setKillSwitchActive(result.kill_switch_active);
    } catch (err) {
      console.error('Kill switch error:', err);
      alert('Failed to toggle kill switch. Make sure backend is running.');
    }
  };

  const handleEmergencyStop = async () => {
    if (confirm('⚠️ EMERGENCY STOP will halt ALL autonomous agents immediately. Continue?')) {
      try {
        await fetch(`${RARA_BASE}/control/emergency-stop`, { method: 'POST' });
        alert('Emergency stop activated. All agents halted.');
        fetchData();
      } catch (err) {
        console.error('Emergency stop error:', err);
      }
    }
  };

  // Agent Controls - USING REAL BACKEND API
  const toggleAgent = async (agentId: string) => {
    try {
      const result = await dashboardApi.toggleAutonomousAgent(agentId);
      setAutonomousAgents(prev => prev.map(a => {
        if (a.id === agentId) {
          return { ...a, status: result.new_status as AutonomousAgent['status'] };
        }
        return a;
      }));
    } catch (err) {
      console.error('Failed to toggle agent:', err);
      alert('Failed to toggle agent. Make sure backend is running.');
    }
  };
  
  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
      await dashboardApi.deleteAutonomousAgent(agentId);
      setAutonomousAgents(prev => prev.filter(a => a.id !== agentId));
    } catch (err) {
      console.error('Failed to delete agent:', err);
      alert('Failed to delete agent. Make sure backend is running.');
    }
  };
  
  const createAgent = async (agent: Partial<AutonomousAgent>) => {
    try {
      const newAgent = await dashboardApi.createAutonomousAgent(agent as any);
      setAutonomousAgents(prev => [...prev, newAgent as any]);
      return newAgent;
    } catch (err) {
      console.error('Failed to create agent:', err);
      alert('Failed to create agent. Make sure backend is running.');
      throw err;
    }
  };

  // LLM Provider Controls
  const fetchLLMProviders = useCallback(async () => {
    try {
      const [providers, usage] = await Promise.all([
        getLLMProviders(),
        getAllLLMProvidersUsage()
      ]);
      setLlmProviders(providers);
      setLlmProvidersUsage(usage);
    } catch (err) {
      console.error('Failed to fetch LLM providers:', err);
      // If API fails, show default providers so user can configure them
      if (llmProviders.length === 0) {
        setLlmProviders([
          { id: 'openai-default', name: 'OpenAI GPT-4', provider_type: 'openai', api_key: '', has_api_key: false, api_base_url: 'https://api.openai.com/v1', default_model: 'gpt-4-turbo-preview', models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o'], enabled: true, priority: 1, rate_limit_rpm: 60, rate_limit_tpm: 150000, max_retries: 3, timeout_seconds: 30, cost_per_1k_input: 0.01, cost_per_1k_output: 0.03 },
          { id: 'anthropic-default', name: 'Anthropic Claude', provider_type: 'anthropic', api_key: '', has_api_key: false, api_base_url: 'https://api.anthropic.com', default_model: 'claude-3-5-sonnet-20241022', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'], enabled: true, priority: 2, rate_limit_rpm: 50, rate_limit_tpm: 100000, max_retries: 3, timeout_seconds: 60, cost_per_1k_input: 0.003, cost_per_1k_output: 0.015 },
          { id: 'google-default', name: 'Google Gemini', provider_type: 'google', api_key: '', has_api_key: false, api_base_url: 'https://generativelanguage.googleapis.com', default_model: 'gemini-pro', models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'], enabled: true, priority: 3, rate_limit_rpm: 60, rate_limit_tpm: 120000, max_retries: 3, timeout_seconds: 30, cost_per_1k_input: 0.00025, cost_per_1k_output: 0.0005 },
          { id: 'groq-default', name: 'Groq (Fast)', provider_type: 'groq', api_key: '', has_api_key: false, api_base_url: 'https://api.groq.com/openai/v1', default_model: 'llama-3.1-70b-versatile', models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'], enabled: true, priority: 4, rate_limit_rpm: 30, rate_limit_tpm: 50000, max_retries: 3, timeout_seconds: 15, cost_per_1k_input: 0, cost_per_1k_output: 0 },
        ]);
      }
    }
  }, [llmProviders.length]);

  useEffect(() => {
    if (activeTab === 'llm-providers') {
      fetchLLMProviders();
    }
  }, [activeTab, fetchLLMProviders]);

  const handleTestProvider = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const result = await testLLMProvider(providerId);
      setTestResults(prev => ({ ...prev, [providerId]: result }));
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [providerId]: { status: 'error', message: err.message } }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleProvider = async (providerId: string) => {
    try {
      await toggleLLMProvider(providerId);
      await fetchLLMProviders();
    } catch (err) {
      console.error('Failed to toggle provider:', err);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await deleteLLMProvider(providerId);
      await fetchLLMProviders();
    } catch (err) {
      console.error('Failed to delete provider:', err);
    }
  };

  const handleSaveProvider = async (provider: any) => {
    try {
      if (editingProvider?.id) {
        await updateLLMProvider(editingProvider.id, provider);
      } else {
        await createLLMProvider(provider);
      }
      await fetchLLMProviders();
      setShowProviderModal(false);
      setEditingProvider(null);
    } catch (err: any) {
      alert(`Failed to save provider: ${err.message}`);
    }
  };

  // ============== RENDER TABS ==============

  const renderOverview = () => (
    <>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconBlue}`}><UsersIcon /></div></div>
          <div className={styles.statValue}>{stats.totalUsers}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconGreen}`}><ActivityIcon /></div></div>
          <div className={styles.statValue}>{stats.activeUsers}</div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconPurple}`}><DollarIcon /></div></div>
          <div className={styles.statValue}>${stats.mrr}</div>
          <div className={styles.statLabel}>MRR</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconOrange}`}><BotIcon /></div></div>
          <div className={styles.statValue}>{autonomousAgents.filter(a => a.status === 'active').length}/{autonomousAgents.length}</div>
          <div className={styles.statLabel}>Active Agents</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconCyan}`}><GlobeIcon /></div></div>
          <div className={styles.statValue}>{universes.length}</div>
          <div className={styles.statLabel}>Memory Universes</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconRed}`}><BoxIcon /></div></div>
          <div className={styles.statValue}>{blockchainNodes.filter(n => n.status === 'connected').length}</div>
          <div className={styles.statLabel}>Blockchain Nodes</div>
        </div>
      </div>

      {/* RARA Status Card */}
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ZapIcon /> RARA System Status</h3>
          {raraStatus ? (
            <div className={styles.revenueBreakdown}>
              <div className={styles.revenueItem}>
                <span className={styles.revenueItemLabel}>State</span>
                <span style={{ color: raraStatus.state === 'running' ? '#22c55e' : '#ef4444' }}>{raraStatus.state.toUpperCase()}</span>
              </div>
              <div className={styles.revenueItem}>
                <span className={styles.revenueItemLabel}>Agents Registered</span>
                <span>{raraStatus.agents_registered}</span>
              </div>
              <div className={styles.revenueItem}>
                <span className={styles.revenueItemLabel}>Mutations Today</span>
                <span>{raraStatus.mutations_today}</span>
              </div>
              <div className={styles.revenueItem}>
                <span className={styles.revenueItemLabel}>Uptime</span>
                <span>{Math.floor(raraStatus.uptime_seconds / 3600)}h {Math.floor((raraStatus.uptime_seconds % 3600) / 60)}m</span>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b' }}>Loading RARA status...</div>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ServerIcon /> Service Health</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {services.map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span>{s.name}</span>
                <span style={{ color: s.status === 'healthy' ? '#22c55e' : '#ef4444' }}>{s.latency}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kill Switch Warning */}
      {killSwitchActive && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '12px', marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertIcon />
            <div>
              <strong style={{ color: '#ef4444' }}>KILL SWITCH ACTIVE</strong>
              <p style={{ margin: '4px 0 0', color: '#f87171' }}>All autonomous agents are frozen. Click "Unfreeze" in RARA tab to resume.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const fetchRaraData = async () => {
    try {
      // Fetch coordination stats
      const coordRes = await fetch(`${RARA_BASE}/coordination/stats`);
      if (coordRes.ok) setRaraCoordStats(await coordRes.json());
      
      // Fetch pending proposals
      const proposalsRes = await fetch(`${RARA_BASE}/proposals/pending`);
      if (proposalsRes.ok) setRaraPendingProposals(await proposalsRes.json());
      
      // Fetch invariant results
      const invRes = await fetch(`${RARA_BASE}/invariants/results`);
      if (invRes.ok) setRaraInvariantResults(await invRes.json());
      
      // Fetch kill switch events
      const eventsRes = await fetch(`${RARA_BASE}/control/kill-switch/events?limit=10`);
      if (eventsRes.ok) setRaraKillSwitchEvents(await eventsRes.json());
    } catch (err) {
      console.error('Error fetching RARA data:', err);
    }
  };

  const handleCheckInvariants = async () => {
    try {
      const res = await fetch(`${RARA_BASE}/invariants/check`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ Invariant Check Complete\n\nAll Passed: ${data.all_passed}\nResults: ${data.results?.length || 0} checks`);
        fetchRaraData();
      }
    } catch (err) {
      alert(`⚠️ Invariant check failed: ${err}`);
    }
  };

  const handleResetBudgets = async () => {
    if (!confirm('Reset all agent budgets? This will allow agents to perform more mutations today.')) return;
    try {
      const res = await fetch(`${RARA_BASE}/control/reset-budgets`, { method: 'POST' });
      if (res.ok) {
        alert('✅ All agent budgets reset');
        fetchData();
      }
    } catch (err) {
      alert(`⚠️ Budget reset failed: ${err}`);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      const res = await fetch(`${RARA_BASE}/snapshots/create`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ Snapshot Created\n\nID: ${data.id}\nHash: ${data.hash?.slice(0, 16)}...`);
        fetchData();
      }
    } catch (err) {
      alert(`⚠️ Snapshot creation failed: ${err}`);
    }
  };

  const renderRARA = () => (
    <>
      {/* RARA Controls */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}><ShieldIcon /> RARA Kill Switch & Controls</h3>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleKillSwitch(!killSwitchActive)}
            style={{
              padding: '12px 24px',
              background: killSwitchActive ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {killSwitchActive ? <><PlayIcon /> Unfreeze All Agents</> : <><PauseIcon /> Freeze All Agents</>}
          </button>
          <button
            onClick={handleEmergencyStop}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <StopIcon /> EMERGENCY STOP
          </button>
          <button className={styles.agentBtn} onClick={handleCreateSnapshot}>📸 Create Snapshot</button>
          <button className={styles.agentBtn} onClick={handleResetBudgets}>💰 Reset Budgets</button>
          <button className={styles.agentBtn} onClick={handleCheckInvariants}>🔍 Check Invariants</button>
          <button className={styles.agentBtn} onClick={fetchRaraData}>🔄 Refresh</button>
        </div>
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
          Kill Switch: {killSwitchActive ? '🔴 ACTIVE - All agents frozen' : '🟢 INACTIVE - Agents running normally'}
        </p>
      </div>

      {/* RARA Status - Real Data */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ borderLeft: `3px solid ${raraStatus?.state === 'running' ? '#22c55e' : raraStatus?.state === 'frozen' ? '#eab308' : '#ef4444'}` }}>
          <div className={styles.statValue} style={{ color: raraStatus?.state === 'running' ? '#22c55e' : raraStatus?.state === 'frozen' ? '#eab308' : '#ef4444' }}>
            {raraStatus?.state?.toUpperCase() || 'UNKNOWN'}
          </div>
          <div className={styles.statLabel}>System State</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{raraStatus?.agents_registered ?? raraAgents.length ?? 0}</div>
          <div className={styles.statLabel}>Registered Agents</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{raraStatus?.mutations_today ?? 0}</div>
          <div className={styles.statLabel}>Mutations Today</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: (raraStatus?.invariant_violations || 0) > 0 ? '#ef4444' : '#22c55e' }}>
            {raraStatus?.invariant_violations ?? 0}
          </div>
          <div className={styles.statLabel}>Invariant Violations</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{raraStatus?.rollbacks_today ?? 0}</div>
          <div className={styles.statLabel}>Rollbacks Today</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {raraStatus?.uptime_seconds ? `${Math.floor(raraStatus.uptime_seconds / 3600)}h ${Math.floor((raraStatus.uptime_seconds % 3600) / 60)}m` : '0h 0m'}
          </div>
          <div className={styles.statLabel}>Uptime</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            {raraStatus?.last_snapshot?.slice(0, 8) || 'None'}...
          </div>
          <div className={styles.statLabel}>Last Snapshot</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ fontSize: '14px' }}>
            {raraStatus?.active_mutation?.slice(0, 8) || 'None'}
          </div>
          <div className={styles.statLabel}>Active Mutation</div>
        </div>
      </div>

      {/* Pending Proposals */}
      {raraPendingProposals.length > 0 && (
        <div className={styles.card} style={{ marginTop: '24px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
          <h3 className={styles.cardTitle} style={{ color: '#eab308' }}>⏳ Pending Proposals ({raraPendingProposals.length})</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Proposal ID</th><th>Planner</th><th>Capability</th><th>Target</th><th>Risk</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {raraPendingProposals.map((p: any) => (
                  <tr key={p.proposal_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{p.proposal_id?.slice(0, 8)}...</td>
                    <td>{p.planner_id}</td>
                    <td>{p.capability}</td>
                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.target}</td>
                    <td style={{ color: p.risk_score > 0.7 ? '#ef4444' : p.risk_score > 0.4 ? '#eab308' : '#22c55e' }}>
                      {(p.risk_score * 100).toFixed(0)}%
                    </td>
                    <td>
                      <button className={styles.agentBtn} style={{ padding: '4px 8px', fontSize: '11px' }}>Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RARA Agents List */}
      <div className={styles.section} style={{ marginTop: '24px' }}>
        <h3 className={styles.sectionTitle}><BotIcon /> Registered RARA Agents ({raraAgents.length})</h3>
        {raraAgents.length === 0 ? (
          <div className={styles.card}>
            <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
              No RARA agents registered yet. Agents will appear here when they register with the system.
              <br /><br />
              <button className={styles.agentBtn} onClick={() => window.open(`${RARA_BASE}/docs`, '_blank')}>📚 View RARA API Docs</button>
            </p>
          </div>
        ) : (
          <div className={styles.agentsGrid}>
            {raraAgents.map((agent: any) => (
              <div key={agent.id} className={styles.agentCard}>
                <div className={styles.agentHeader}>
                  <div className={styles.agentInfo}>
                    <div className={styles.agentIcon} style={{ 
                      background: agent.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      color: agent.status === 'active' ? '#22c55e' : '#64748b'
                    }}>
                      <BotIcon />
                    </div>
                    <div>
                      <div className={styles.agentName}>{agent.name || agent.id}</div>
                      <div className={styles.agentType}>{agent.type || 'general'}</div>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    background: agent.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    color: agent.status === 'active' ? '#22c55e' : '#64748b'
                  }}>{agent.status}</span>
                </div>
                <div className={styles.agentMetrics}>
                  <div className={styles.agentMetric}>
                    <div className={styles.agentMetricValue}>{agent.tasks_completed || 0}</div>
                    <div className={styles.agentMetricLabel}>Tasks</div>
                  </div>
                  <div className={styles.agentMetric}>
                    <div className={styles.agentMetricValue}>{agent.capabilities || 0}</div>
                    <div className={styles.agentMetricLabel}>Capabilities</div>
                  </div>
                  <div className={styles.agentMetric}>
                    <div className={styles.agentMetricValue} style={{ color: (agent.trust_score || 0.5) > 0.7 ? '#22c55e' : (agent.trust_score || 0.5) > 0.5 ? '#eab308' : '#ef4444' }}>
                      {((agent.trust_score || 0.5) * 100).toFixed(0)}%
                    </div>
                    <div className={styles.agentMetricLabel}>Trust</div>
                  </div>
                </div>
                <div className={styles.agentActions}>
                  <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={() => window.open(`${RARA_BASE}/agents/${agent.id}/capabilities`, '_blank')}>View Capabilities</button>
                  <button className={styles.agentBtn} onClick={() => window.open(`${RARA_BASE}/agents/${agent.id}/stats`, '_blank')}>Stats</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kill Switch Events */}
      {raraKillSwitchEvents.length > 0 && (
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>📜 Kill Switch Event History</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Timestamp</th><th>Trigger</th><th>Actor</th><th>State</th><th>Reason</th></tr>
              </thead>
              <tbody>
                {raraKillSwitchEvents.slice(0, 5).map((event: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontSize: '11px' }}>{event.timestamp || '-'}</td>
                    <td>{event.trigger || '-'}</td>
                    <td>{event.actor || '-'}</td>
                    <td style={{ color: event.state === 'frozen' ? '#eab308' : event.state === 'emergency_stop' ? '#ef4444' : '#22c55e' }}>
                      {event.state || '-'}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className={styles.card} style={{ marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>🔗 RARA API Endpoints</h3>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <a href={`${RARA_BASE}/status`} target="_blank" rel="noopener noreferrer" className={styles.agentBtn} style={{ textDecoration: 'none' }}>📊 Status</a>
          <a href={`${RARA_BASE}/agents`} target="_blank" rel="noopener noreferrer" className={styles.agentBtn} style={{ textDecoration: 'none' }}>🤖 Agents</a>
          <a href={`${RARA_BASE}/mutations/pending`} target="_blank" rel="noopener noreferrer" className={styles.agentBtn} style={{ textDecoration: 'none' }}>⏳ Pending Mutations</a>
          <a href={`${RARA_BASE}/snapshots`} target="_blank" rel="noopener noreferrer" className={styles.agentBtn} style={{ textDecoration: 'none' }}>📸 Snapshots</a>
          <a href={`${RARA_BASE}/governance/state`} target="_blank" rel="noopener noreferrer" className={styles.agentBtn} style={{ textDecoration: 'none' }}>⚖️ Governance</a>
          <a href={`${RARA_BASE}/docs`} target="_blank" rel="noopener noreferrer" className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} style={{ textDecoration: 'none' }}>📚 API Docs</a>
        </div>
      </div>
    </>
  );

  const renderAgents = () => (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><CodeIcon /> Autonomous Codebase Agents</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Internal agents with codebase access. Auto-activate on Droplet deploy.</p>
        </div>

        <div className={styles.agentsGrid}>
          {autonomousAgents.map(agent => (
            <div key={agent.id} className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <div className={styles.agentInfo}>
                  <div className={`${styles.agentIcon}`} style={{ 
                    background: agent.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 
                               agent.status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    color: agent.status === 'active' ? '#22c55e' : 
                           agent.status === 'error' ? '#ef4444' : '#64748b'
                  }}>
                    {agent.type === 'code_refactor' && <CodeIcon />}
                    {agent.type === 'security_audit' && <ShieldIcon />}
                    {agent.type === 'deployment' && <ServerIcon />}
                    {agent.type === 'testing' && <ActivityIcon />}
                    {agent.type === 'monitoring' && <CpuIcon />}
                  </div>
                  <div>
                    <div className={styles.agentName}>{agent.name}</div>
                    <div className={styles.agentType}>{agent.type.replace('_', ' ')}</div>
                  </div>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: agent.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 
                             agent.status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                  color: agent.status === 'active' ? '#22c55e' : 
                         agent.status === 'error' ? '#ef4444' : '#64748b'
                }}>{agent.status}</span>
              </div>

              <div className={styles.agentMetrics}>
                <div className={styles.agentMetric}>
                  <div className={styles.agentMetricValue}>{agent.tasksCompleted}</div>
                  <div className={styles.agentMetricLabel}>Tasks Done</div>
                </div>
                <div className={styles.agentMetric}>
                  <div className={styles.agentMetricValue}>{agent.tasksQueued}</div>
                  <div className={styles.agentMetricLabel}>Queued</div>
                </div>
                <div className={styles.agentMetric}>
                  <div className={styles.agentMetricValue}>{agent.cpuUsage}%</div>
                  <div className={styles.agentMetricLabel}>CPU</div>
                </div>
                <div className={styles.agentMetric}>
                  <div className={styles.agentMetricValue}>{agent.memoryUsage}MB</div>
                  <div className={styles.agentMetricLabel}>Memory</div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                Last: {agent.lastAction}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {agent.codebaseAccess && (
                  <span style={{ padding: '2px 6px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', borderRadius: '4px', fontSize: '10px' }}>
                    Codebase Access
                  </span>
                )}
                {agent.autoActivateOnDeploy && (
                  <span style={{ padding: '2px 6px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '4px', fontSize: '10px' }}>
                    Auto-Deploy
                  </span>
                )}
              </div>

              <div className={styles.agentActions}>
                <button 
                  className={`${styles.agentBtn} ${styles.agentBtnPrimary}`}
                  onClick={() => toggleAgent(agent.id)}
                >
                  {agent.status === 'active' ? 'Pause' : 'Start'}
                </button>
                <button className={`${styles.agentBtn}`} onClick={() => {
                  alert(`📜 Agent Logs: ${agent.name}\n\n` +
                    `Status: ${agent.status}\n` +
                    `Tasks Completed: ${agent.tasksCompleted}\n` +
                    `Last Action: ${agent.lastAction}\n\n` +
                    `To view full logs, check:\n` +
                    `- Agent Engine: http://localhost:8086/autonomous/agents/${agent.id}/status\n` +
                    `- Docker logs: docker logs agent_engine_service`);
                }}>View Logs</button>
              </div>
            </div>
          ))}
        </div>

        {/* Info: Difference between RARA and Autonomous Agents */}
        <div className={styles.card} style={{ marginTop: '24px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <h3 className={styles.cardTitle}>ℹ️ RARA Agents vs Autonomous Agents</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h4 style={{ color: '#ef4444', margin: '0 0 8px 0' }}>🛡️ RARA Agents (Safety Layer)</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '13px' }}>
                <li>Register with RARA for <strong>mutation governance</strong></li>
                <li>Subject to <strong>kill switch</strong> and invariant checks</li>
                <li>Require <strong>capability tokens</strong> with trust decay</li>
                <li>Mutations are <strong>atomic with rollback</strong></li>
                <li>For: Production code changes, file system access</li>
              </ul>
            </div>
            <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <h4 style={{ color: '#22c55e', margin: '0 0 8px 0' }}>🤖 Autonomous Agents (Execution Layer)</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '13px' }}>
                <li>Run 24/7 via <strong>autonomous daemon</strong></li>
                <li><strong>Self-triggering</strong> - decide when to act</li>
                <li>Parallel communication between agents</li>
                <li>Goal-driven with sub-goal decomposition</li>
                <li>For: Monitoring, testing, analysis, automation</li>
              </ul>
            </div>
          </div>
          <p style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
            <strong>Integration:</strong> Autonomous agents can register with RARA when they need to perform mutations. RARA provides the safety governance, autonomous daemon provides the execution runtime.
          </p>
        </div>

        {/* Quick Actions */}
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>⚡ Agent Engine Controls</h3>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={() => window.open('http://localhost:8086/autonomous/daemon/status', '_blank')}>📊 Daemon Status</button>
            <button className={styles.agentBtn} onClick={() => window.open('http://localhost:8086/autonomous/runtime/stats', '_blank')}>📈 Runtime Stats</button>
            <button className={styles.agentBtn} onClick={() => window.open('http://localhost:8086/autonomous/capabilities', '_blank')}>🔧 Capabilities</button>
            <button className={styles.agentBtn} onClick={() => window.open('http://localhost:8086/docs', '_blank')}>📚 API Docs</button>
          </div>
        </div>
      </div>
    </>
  );

  // Use gateway for blockchain API (service runs in Docker, not exposed directly)
  const BLOCKCHAIN_BASE = `${API_BASE}/api/blockchain`;

  const fetchBlockchainData = async () => {
    try {
      const token = localStorage.getItem('owner_token') || localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Fetch chain stats via gateway
      const chainRes = await fetch(`${BLOCKCHAIN_BASE}/chain/stats`, { headers });
      if (chainRes.ok) setBlockchainStats(await chainRes.json());
      
      // Fetch audit stats via gateway
      const auditRes = await fetch(`${BLOCKCHAIN_BASE}/audit/stats`, { headers });
      if (auditRes.ok) setAuditStats(await auditRes.json());
      
      // Fetch graph stats via gateway
      const graphRes = await fetch(`${BLOCKCHAIN_BASE}/graph/stats`, { headers });
      if (graphRes.ok) setGraphStats(await graphRes.json());
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
    }
  };

  const handleMineBlock = async () => {
    try {
      const token = localStorage.getItem('owner_token') || localStorage.getItem('token');
      const res = await fetch(`${BLOCKCHAIN_BASE}/blocks/mine`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ Block Mined!\n\nBlock #${data.block_number || 'N/A'}\nHash: ${data.block_hash?.slice(0, 16) || 'N/A'}...\nTransactions: ${data.transaction_count || 0}`);
        fetchBlockchainData();
      } else {
        const err = await res.json();
        alert(`ℹ️ ${err.message || 'No pending transactions to mine'}`);
      }
    } catch (err) {
      alert(`⚠️ Mining failed: ${err}`);
    }
  };

  const handleCreateDSID = async () => {
    const entityId = prompt('Enter Entity ID (e.g., user-123):');
    if (!entityId) return;
    try {
      const token = localStorage.getItem('owner_token') || localStorage.getItem('token');
      const res = await fetch(`${BLOCKCHAIN_BASE}/dsid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ entity_type: 'user', entity_id: entityId, content: { created: new Date().toISOString() } })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ DSID Created!\n\nDSID: ${data.dsid}\nEntity: ${data.entity_type}/${data.entity_id}`);
        fetchBlockchainData();
      }
    } catch (err) {
      alert(`⚠️ DSID creation failed: ${err}`);
    }
  };

  const handleVerifyDSID = async () => {
    const dsid = prompt('Enter DSID to verify:');
    if (!dsid) return;
    window.open(`${BLOCKCHAIN_BASE}/dsid/${dsid}`, '_blank');
  };

  const handleViewAuditLog = async () => {
    window.open(`${BLOCKCHAIN_BASE}/ai-audit/logs`, '_blank');
  };

  const handleGenerateReport = async () => {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 1);
    window.open(`${BLOCKCHAIN_BASE}/compliance/soc2?from_date=${fromDate.toISOString().split('T')[0]}&to_date=${new Date().toISOString().split('T')[0]}`, '_blank');
  };

  const handleAnchorMerkle = async () => {
    alert('🔗 Merkle Root Anchoring\n\nThis will anchor the current audit chain Merkle root to the configured blockchain.\n\nNote: Requires blockchain node connection and gas balance.');
  };

  const renderBlockchain = () => (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}><BoxIcon /> Blockchain Node Management - Full Control</h2>
        
        {/* Quick Actions */}
        <div className={styles.card} style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#60a5fa' }}>⛓️ Blockchain Operations</h3>
              <p style={{ margin: '4px 0 0', color: '#64748b' }}>Manage nodes, anchoring, DSID registry, and audit chain</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={handleMineBlock}>⛏️ Mine Block</button>
              <button className={styles.agentBtn} onClick={fetchBlockchainData}>🔄 Refresh Stats</button>
              <button className={styles.agentBtn} onClick={() => window.open(`${BLOCKCHAIN_BASE}/docs`, '_blank')}>📚 API Docs</button>
            </div>
          </div>
        </div>

        {/* Chain Stats from API */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{blockchainStats?.total_blocks || 0}</div>
            <div className={styles.statLabel}>Total Blocks</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{blockchainStats?.total_transactions || 0}</div>
            <div className={styles.statLabel}>Transactions</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{blockchainStats?.pending_transactions || 0}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: blockchainStats?.chain_valid === true ? '#22c55e' : blockchainStats?.chain_valid === false ? '#ef4444' : '#eab308' }}>
              {blockchainStats?.chain_valid === true ? '✓ Valid' : blockchainStats?.chain_valid === false ? '✗ Invalid' : '⏳ Checking...'}
            </div>
            <div className={styles.statLabel}>Chain Valid</div>
          </div>
        </div>

        {/* Node Cards */}
        <div className={styles.cardsGrid} style={{ marginTop: '24px' }}>
          {blockchainNodes.map(node => (
            <div key={node.id} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: node.status === 'connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: node.status === 'connected' ? '#22c55e' : '#eab308' }}>
                    <GlobeIcon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{node.network}</div>
                    <div style={{ fontSize: '12px', color: node.status === 'connected' ? '#22c55e' : '#eab308' }}>● {node.status}</div>
                  </div>
                </div>
                <button style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}>Disconnect</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Block Height</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{node.blockHeight.toLocaleString()}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Gas Balance</div>
                  <div style={{ fontWeight: 600, color: '#22c55e' }}>{node.gasBalance}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Anchors Today</div>
                  <div style={{ fontWeight: 600 }}>{node.anchorsToday}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Last Anchor</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '11px' }}>{node.lastAnchor}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} 
                  style={{ flex: 1 }}
                  onClick={() => {
                    const explorerUrl = node.network.includes('Base') 
                      ? 'https://sepolia.basescan.org' 
                      : node.network.includes('Ethereum') 
                        ? 'https://etherscan.io' 
                        : 'https://etherscan.io';
                    window.open(explorerUrl, '_blank');
                  }}
                >View Explorer</button>
                <button 
                  className={styles.agentBtn} 
                  style={{ flex: 1 }}
                  onClick={async () => {
                    try {
                      const res = await fetch(`${BLOCKCHAIN_BASE}/blockchain/transactions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          tx_type: 'test',
                          payload: { test: true, timestamp: new Date().toISOString(), network: node.network }
                        })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        alert(`✅ Test Transaction Created!\n\nTx Hash: ${data.tx_hash}\nType: ${data.tx_type}\nStatus: ${data.status}\n\nNote: This creates a test transaction in the internal blockchain.`);
                        fetchBlockchainData();
                      } else {
                        alert('⚠️ Transaction creation failed. Blockchain service may not be running.');
                      }
                    } catch (err) {
                      alert(`⚠️ Could not send test transaction: ${err}\n\nEnsure blockchain_service is running on port 8087.`);
                    }
                  }}
                >Send Test Tx</button>
              </div>
            </div>
          ))}
        </div>

        {/* DSID Registry */}
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>DSID Registry Management</h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Deterministic Sovereign Identity - Cryptographic identity anchoring for users, agents, and memories</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#a78bfa' }}>{dsidStats.total}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Total DSIDs</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>{dsidStats.active}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Active</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{dsidStats.revoked}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Revoked</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#60a5fa' }}>{dsidStats.anchored}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Anchored</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={handleCreateDSID}>Create DSID</button>
            <button className={styles.agentBtn} onClick={handleVerifyDSID}>Verify DSID</button>
            <button className={styles.agentBtn} onClick={() => { const dsid = prompt('Enter DSID to view lineage:'); if (dsid) window.open(`${BLOCKCHAIN_BASE}/blockchain/dsid/${dsid}/lineage`, '_blank'); }}>View Lineage</button>
            <button className={styles.agentBtn} onClick={() => window.open(`${BLOCKCHAIN_BASE}/blockchain/dsid`, '_blank')}>Export Registry</button>
          </div>
        </div>

        {/* Audit Chain */}
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>Audit Chain & Compliance</h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Immutable audit trail with Merkle root anchoring to external blockchains</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Audit Entries</div>
              <div style={{ fontWeight: 600 }}>{auditStats.total_entries || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Merkle Roots</div>
              <div style={{ fontWeight: 600 }}>{auditStats.merkle_roots || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Last Anchor</div>
              <div style={{ fontWeight: 600, fontSize: '11px' }}>{auditStats.last_anchor || 'Never'}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Compliance</div>
              <div style={{ fontWeight: 600, color: '#22c55e' }}>SOC 2</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={handleAnchorMerkle}>Anchor Merkle Root</button>
            <button className={styles.agentBtn} onClick={handleViewAuditLog}>View Audit Log</button>
            <button className={styles.agentBtn} onClick={handleGenerateReport}>Generate Report</button>
          </div>
        </div>

        {/* Transaction Graph */}
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>Transaction Graph & Hash Lineage</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Total Blocks</div>
              <div style={{ fontWeight: 600 }}>{graphStats.total_blocks || blockchainStats?.total_blocks || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Transactions</div>
              <div style={{ fontWeight: 600 }}>{graphStats.transactions || blockchainStats?.total_transactions || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Hash Nodes</div>
              <div style={{ fontWeight: 600 }}>{graphStats.hash_nodes || graphStats.node_count || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Graph Edges</div>
              <div style={{ fontWeight: 600 }}>{graphStats.graph_edges || graphStats.edge_count || 0}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={() => window.open(`${BLOCKCHAIN_BASE}/blockchain/graph/stats`, '_blank')}>View Graph</button>
            <button className={styles.agentBtn} onClick={() => { const hash = prompt('Enter hash to trace:'); if (hash) window.open(`${BLOCKCHAIN_BASE}/blockchain/hash/${hash}/lineage`, '_blank'); }}>Trace Hash</button>
            <button className={styles.agentBtn} onClick={() => window.open(`${BLOCKCHAIN_BASE}/blockchain/blocks/latest`, '_blank')}>Export Chain</button>
          </div>
        </div>

        {/* Node Configuration */}
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}><SettingsIcon /> Node Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>RPC Endpoint (Base Sepolia)</label>
              <input type="text" defaultValue="https://sepolia.base.org" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '12px' }} />
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Contract Address</label>
              <input type="text" defaultValue="0x..." style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '12px' }} />
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Auto-Anchor Interval</label>
              <select defaultValue="1h" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                <option value="15m">Every 15 minutes</option>
                <option value="1h">Every hour</option>
                <option value="6h">Every 6 hours</option>
                <option value="24h">Daily</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Gas Price Strategy</label>
              <select defaultValue="standard" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                <option value="slow">Slow (Low Gas)</option>
                <option value="standard">Standard</option>
                <option value="fast">Fast (High Gas)</option>
              </select>
            </div>
          </div>
          <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} style={{ marginTop: '16px' }}>Save Node Configuration</button>
        </div>
      </div>
    </>
  );

  const fetchMemoryData = async () => {
    try {
      // Fetch memory stats
      const statsRes = await fetch(`${API_BASE}/memory/stats`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      if (statsRes.ok) {
        const data = await statsRes.json();
        setMemoryStats(data);
      }
      // Fetch anchors
      const anchorsRes = await fetch(`${API_BASE}/memory/hash-sphere/anchors?limit=100`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      if (anchorsRes.ok) {
        const data = await anchorsRes.json();
        setAnchors(data);
      }
      // Fetch archived files
      const archivedRes = await fetch(`${API_BASE}/memory/archived/files`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      if (archivedRes.ok) {
        const data = await archivedRes.json();
        setArchivedFiles(data);
      }
    } catch (err) {
      console.error('Error fetching memory data:', err);
    }
  };

  const handleViewSphere = (universeId: string) => {
    setSelectedUniverse(universeId);
    alert(`📊 Viewing Hash Sphere for Universe: ${universeId}\nOpening visualization...`);
  };

  const handleExportUniverse = async (universeId: string, universeName: string) => {
    try {
      const res = await fetch(`${API_BASE}/memory/stats`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${universeName.replace(/\s+/g, '_')}_export.json`;
      a.click();
      alert(`✅ Exported ${universeName} data`);
    } catch (err) {
      alert(`⚠️ Export failed: ${err}`);
    }
  };

  const handleCreateAnchor = async () => {
    const text = prompt('Enter anchor text:');
    if (!text) return;
    const context = prompt('Enter context (optional):') || '';
    try {
      const res = await fetch(`${API_BASE}/memory/hash-sphere/anchors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ anchor_text: text, context, importance_score: 0.7 })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ Anchor created!\nHash: ${data.anchor_hash}\nID: ${data.id}`);
        fetchMemoryData();
      }
    } catch (err) {
      alert(`⚠️ Failed to create anchor: ${err}`);
    }
  };

  const handleHashText = async () => {
    const text = prompt('Enter text to hash:');
    if (!text) return;
    try {
      const res = await fetch(`${API_BASE}/memory/hash-sphere/hash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`🔗 Hash Sphere Result:\n\nHash: ${data.hash}\nEnergy: ${data.energy_score.toFixed(3)}\nSpin: ${data.spin_score.toFixed(3)}\nXYZ: [${data.xyz.map((v: number) => v.toFixed(3)).join(', ')}]\nAnchors: ${data.anchors.join(', ') || 'none'}`);
      }
    } catch (err) {
      alert(`⚠️ Hash failed: ${err}`);
    }
  };

  const renderUniverses = () => (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}><DatabaseIcon /> Memory Universes (Hash Sphere)</h2>
        
        {/* Real Stats from API */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{memoryStats?.total_memories?.toLocaleString() || universes.reduce((sum, u) => sum + u.totalMemories, 0).toLocaleString()}</div>
            <div className={styles.statLabel}>Total Memories</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{anchors.length || universes.reduce((sum, u) => sum + u.nodeCount, 0).toLocaleString()}</div>
            <div className={styles.statLabel}>Memory Anchors</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{memoryStats?.rag_documents?.toLocaleString() || 0}</div>
            <div className={styles.statLabel}>RAG Documents</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{memoryStats?.storage_mb?.toFixed(2) || '0.00'} MB</div>
            <div className={styles.statLabel}>Storage Used</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={handleCreateAnchor}>➕ Create Anchor</button>
            <button className={styles.agentBtn} onClick={handleHashText}>🔗 Hash Text</button>
            <button className={styles.agentBtn} onClick={fetchMemoryData}>🔄 Refresh Data</button>
            <button className={styles.agentBtn} onClick={() => window.open(`${API_BASE}/memory/stats`, '_blank')}>📊 View Raw Stats</button>
          </div>
        </div>

        {/* Memory Sources Breakdown */}
        {memoryStats?.by_source && (
          <div className={styles.card} style={{ marginTop: '24px' }}>
            <h3 className={styles.cardTitle}>📁 Memory Sources</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {Object.entries(memoryStats.by_source).map(([source, count]) => (
                <div key={source} style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#a78bfa' }}>{(count as number).toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{source}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Universe Cards */}
        <div className={styles.agentsGrid} style={{ marginTop: '24px' }}>
          {universes.map(universe => (
            <div key={universe.id} className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <div className={styles.agentInfo}>
                  <div className={styles.agentIcon} style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>
                    <GlobeIcon />
                  </div>
                  <div>
                    <div className={styles.agentName}>{universe.name}</div>
                    <div className={styles.agentType}>Last sync: {universe.lastSync}</div>
                  </div>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  background: universe.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                  color: universe.status === 'active' ? '#22c55e' : '#64748b'
                }}>{universe.status}</span>
              </div>
              <div className={styles.agentMetrics}>
                <div className={styles.agentMetric}>
                  <div className={styles.agentMetricValue}>{universe.id === 'primary' ? (memoryStats?.total_memories || universe.nodeCount).toLocaleString() : universe.nodeCount.toLocaleString()}</div>
                  <div className={styles.agentMetricLabel}>Nodes</div>
                </div>
                <div className={styles.agentMetric}>
                  <div className={styles.agentMetricValue}>{universe.id === 'primary' ? (anchors.length || universe.edgeCount).toLocaleString() : universe.edgeCount.toLocaleString()}</div>
                  <div className={styles.agentMetricLabel}>Anchors</div>
                </div>
                <div className={styles.agentMetric}>
                  <div className={styles.agentMetricValue}>{universe.id === 'archive' ? (archivedFiles?.count || 0) : universe.totalMemories.toLocaleString()}</div>
                  <div className={styles.agentMetricLabel}>{universe.id === 'archive' ? 'Archived' : 'Memories'}</div>
                </div>
              </div>
              <div className={styles.agentActions}>
                <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={() => handleViewSphere(universe.id)}>View Sphere</button>
                <button className={styles.agentBtn} onClick={() => handleExportUniverse(universe.id, universe.name)}>Export</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Anchors */}
      {anchors.length > 0 && (
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>🔗 Recent Memory Anchors</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Anchor Text</th><th>Hash</th><th>Context</th><th>Importance</th></tr>
              </thead>
              <tbody>
                {anchors.slice(0, 10).map((anchor: any) => (
                  <tr key={anchor.id}>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{anchor.anchor_text}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#a78bfa' }}>{anchor.anchor_hash?.slice(0, 16)}...</td>
                    <td>{anchor.context || '-'}</td>
                    <td>
                      <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                        <div style={{ width: `${(anchor.importance_score || 0.5) * 100}%`, height: '100%', background: '#a78bfa', borderRadius: '3px' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Memory Hash Sphere - 3D Visualization */}
      <div className={styles.card} style={{ marginTop: '24px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <h3 className={styles.cardTitle} style={{ color: '#a78bfa' }}>🧠 Memory Hash Sphere - 3D Visualization</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Semantic memory visualization - hashes encode meaning, energy, and spin for memory retrieval and resonance.</p>
        <div style={{ 
          height: '500px', 
          background: 'linear-gradient(135deg, #1a0a2e 0%, #0f0f1a 100%)',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Try to load the Hash Sphere visualization from port 8091 or show interactive fallback */}
          <iframe 
            src="http://localhost:8091" 
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              borderRadius: '12px'
            }}
            title="Memory Hash Sphere 3D Visualization"
            onError={(e) => console.log('Hash Sphere iframe failed to load')}
          />
          {/* Overlay with memory stats */}
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '12px', 
            background: 'rgba(0,0,0,0.7)', 
            padding: '12px 16px', 
            borderRadius: '8px',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ fontSize: '11px', color: '#a78bfa', marginBottom: '4px' }}>Memory Universe</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{memoryStats?.total_memories?.toLocaleString() || 0} memories</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{anchors.length} anchors</div>
          </div>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href={`${API_BASE}/api/state-physics`} target="_blank" rel="noopener noreferrer" className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} style={{ textDecoration: 'none' }}>🖥️ Open Full Screen</a>
          <button className={styles.agentBtn} onClick={handleCreateAnchor}>➕ Create Anchor</button>
          <button className={styles.agentBtn} onClick={handleHashText}>🔗 Test Hash</button>
          <button className={styles.agentBtn} onClick={() => window.open(`${API_BASE}/memory/stats`, '_blank')}>📊 Memory Stats</button>
          <button className={styles.agentBtn} onClick={() => handleExportUniverse('memory', 'Memory_Hash_Sphere')}>📤 Export All</button>
        </div>
      </div>

      {/* Emergence Hash Sphere - Physics Simulation (Port 8091) */}
      <div className={styles.card} style={{ marginTop: '24px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h3 className={styles.cardTitle} style={{ color: '#60a5fa' }}>⬡ Emergence Hash Sphere Visualizer</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Emergence physics simulation - A governed artificial economy where intelligence obeys physics, cost, and time.</p>
        <div style={{ 
          height: '500px', 
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <iframe 
            src="http://localhost:8091" 
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              borderRadius: '12px'
            }}
            title="Emergence Hash Sphere Visualizer"
          />
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="http://localhost:8091" target="_blank" rel="noopener noreferrer" className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} style={{ textDecoration: 'none' }}>
            🖥️ Open Full Screen
          </a>
          <a href="http://localhost:8091/docs" target="_blank" rel="noopener noreferrer" className={styles.agentBtn} style={{ textDecoration: 'none' }}>
            📚 API Docs
          </a>
          <button className={styles.agentBtn} onClick={() => window.open('http://localhost:8091/state', '_blank')}>📊 View State</button>
          <button className={styles.agentBtn} onClick={() => alert('⬡ Emergence Hash Sphere\n\nThis is a constraint-governed state-space universe visualizer.\n\nFeatures:\n- Physics simulation with entropy\n- Agent-based economy\n- Resource caps & safety limits\n- Real-time visualization\n\nPort: 8091')}>ℹ️ About</button>
        </div>
      </div>

      {/* Archived Files */}
      {archivedFiles && archivedFiles.count > 0 && (
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>📦 Archived Files ({archivedFiles.count})</h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Hash Sphere is immutable - archived files exist but are hidden from active queries.</p>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {archivedFiles.archived_files?.map((file: string, i: number) => (
              <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '4px', fontSize: '13px', fontFamily: 'monospace' }}>
                {file}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const [controlPlaneStatus, setControlPlaneStatus] = useState<{[key: string]: string}>({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [configModal, setConfigModal] = useState<{open: boolean, type: string, title: string}>({open: false, type: '', title: ''});

  const handleAdminAction = async (action: string) => {
    setControlPlaneStatus(prev => ({...prev, [action]: 'loading'}));
    try {
      let endpoint = '';
      let method = 'POST';
      switch(action) {
        case 'restart':
          endpoint = `${API_BASE}/admin/restart-services`;
          break;
        case 'backup':
          endpoint = `${API_BASE}/admin/backup`;
          break;
        case 'migrations':
          endpoint = `${API_BASE}/admin/run-migrations`;
          break;
        case 'clear-cache':
          endpoint = `${API_BASE}/admin/clear-cache`;
          break;
        case 'reports':
          endpoint = `${API_BASE}/admin/generate-reports`;
          break;
        case 'maintenance':
          endpoint = `${API_BASE}/admin/maintenance-mode`;
          setMaintenanceMode(!maintenanceMode);
          break;
        case 'deploy':
          endpoint = `${API_BASE}/admin/deploy`;
          break;
        case 'export-config':
          endpoint = `${API_BASE}/admin/export-config`;
          method = 'GET';
          break;
        default:
          endpoint = `${API_BASE}/health`;
      }
      const res = await fetch(endpoint, { method, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setControlPlaneStatus(prev => ({...prev, [action]: 'success'}));
        alert(`✅ ${action.replace('-', ' ').toUpperCase()} completed successfully!\n${JSON.stringify(data, null, 2)}`);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      setControlPlaneStatus(prev => ({...prev, [action]: 'error'}));
      alert(`⚠️ ${action.replace('-', ' ').toUpperCase()} - Action sent. Backend may need this endpoint implemented.\nError: ${err}`);
    }
    setTimeout(() => setControlPlaneStatus(prev => ({...prev, [action]: ''})), 3000);
  };

  const handleLayerConfig = (layer: string, name: string) => {
    setConfigModal({open: true, type: 'layer', title: `Configure ${layer} - ${name}`});
  };

  const handleSubsystemAction = async (name: string, action: string) => {
    const actionMap: {[key: string]: string} = {
      'DSID Registry': 'dsid',
      'Agent Orchestrator': 'agents',
      'Memory Anchor': 'memory',
      'Economic Engine': 'economic',
      'Audit Trail': 'audit'
    };
    const subsystem = actionMap[name] || name.toLowerCase().replace(' ', '-');
    
    try {
      let endpoint = '';
      switch(action) {
        case 'Manage':
          endpoint = `${API_BASE}/blockchain/dsids`;
          break;
        case 'Control':
          endpoint = `${RARA_BASE}/agents`;
          break;
        case 'Configure':
          endpoint = `${API_BASE}/memory/config`;
          break;
        case 'Adjust':
          setConfigModal({open: true, type: 'economic', title: 'Economic Engine Settings'});
          return;
        case 'Export':
          endpoint = `${API_BASE}/admin/audit-export`;
          break;
      }
      const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      const data = await res.json().catch(() => ({}));
      setConfigModal({open: true, type: subsystem, title: `${name} - ${action}`});
      alert(`📊 ${name} Data:\n${JSON.stringify(data, null, 2).slice(0, 500)}...`);
    } catch (err) {
      alert(`⚠️ ${name} - Fetching data. Backend endpoint may need implementation.\nSubsystem: ${subsystem}`);
      setConfigModal({open: true, type: subsystem, title: `${name} - ${action}`});
    }
  };

  const renderControlPlane = () => (
    <>
      {/* Config Modal */}
      {configModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setConfigModal({open: false, type: '', title: ''})}>
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#a78bfa' }}>{configModal.title}</h3>
              <button onClick={() => setConfigModal({open: false, type: '', title: ''})} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            {configModal.type === 'layer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Layer Status</label>
                  <select defaultValue="active" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                    <option value="active">Active</option>
                    <option value="degraded">Degraded</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Rate Limit (req/s)</label>
                  <input type="number" defaultValue={1000} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Logging Level</label>
                  <select defaultValue="info" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            )}
            
            {configModal.type === 'economic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Credit Multiplier</label>
                  <input type="number" step="0.1" defaultValue={1.0} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Billing Cycle</label>
                  <select defaultValue="monthly" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                    <span>Auto-deduct credits</span>
                  </label>
                </div>
              </div>
            )}

            {!['layer', 'economic'].includes(configModal.type) && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                <p>Configuration panel for <strong>{configModal.title}</strong></p>
                <p style={{ fontSize: '13px' }}>This subsystem can be managed through the API or CLI.</p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={() => { alert('✅ Configuration saved!'); setConfigModal({open: false, type: '', title: ''}); }}>Save Changes</button>
              <button className={styles.agentBtn} onClick={() => setConfigModal({open: false, type: '', title: ''})}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}><ShieldIcon /> Control Plane - Full Administrative Access</h2>
        
        {/* Control Plane Status */}
        <div className={styles.card} style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <CrownIcon />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#a78bfa' }}>👑 PLATFORM OWNER - FULL CONTROL</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b' }}>Mode: {maintenanceMode ? 'MAINTENANCE' : 'ADMIN'} · All Mutations: ENABLED · Root Access: GRANTED</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} 
                style={{ background: controlPlaneStatus['deploy'] === 'loading' ? '#6366f1' : 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                onClick={() => handleAdminAction('deploy')}
                disabled={controlPlaneStatus['deploy'] === 'loading'}
              >
                {controlPlaneStatus['deploy'] === 'loading' ? '⏳ Deploying...' : controlPlaneStatus['deploy'] === 'success' ? '✅ Deployed!' : '🚀 Deploy Changes'}
              </button>
              <button className={styles.agentBtn} onClick={() => handleAdminAction('export-config')}>
                {controlPlaneStatus['export-config'] === 'loading' ? '⏳...' : '📤 Export Config'}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className={styles.card} style={{ marginBottom: '24px' }}>
          <h3 className={styles.cardTitle}><ZapIcon /> Quick Admin Actions</h3>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button 
              className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} 
              onClick={() => handleAdminAction('restart')}
              style={{ background: controlPlaneStatus['restart'] === 'success' ? '#22c55e' : undefined }}
            >
              {controlPlaneStatus['restart'] === 'loading' ? '⏳ Restarting...' : controlPlaneStatus['restart'] === 'success' ? '✅ Restarted!' : '🔄 Restart All Services'}
            </button>
            <button className={styles.agentBtn} onClick={() => handleAdminAction('backup')} style={{ background: controlPlaneStatus['backup'] === 'success' ? 'rgba(34, 197, 94, 0.2)' : undefined }}>
              {controlPlaneStatus['backup'] === 'loading' ? '⏳ Creating...' : controlPlaneStatus['backup'] === 'success' ? '✅ Backup Created!' : '📦 Create Backup'}
            </button>
            <button className={styles.agentBtn} onClick={() => handleAdminAction('migrations')} style={{ background: controlPlaneStatus['migrations'] === 'success' ? 'rgba(34, 197, 94, 0.2)' : undefined }}>
              {controlPlaneStatus['migrations'] === 'loading' ? '⏳ Running...' : controlPlaneStatus['migrations'] === 'success' ? '✅ Done!' : '🔧 Run Migrations'}
            </button>
            <button className={styles.agentBtn} onClick={() => handleAdminAction('clear-cache')} style={{ background: controlPlaneStatus['clear-cache'] === 'success' ? 'rgba(34, 197, 94, 0.2)' : undefined }}>
              {controlPlaneStatus['clear-cache'] === 'loading' ? '⏳ Clearing...' : controlPlaneStatus['clear-cache'] === 'success' ? '✅ Cleared!' : '🧹 Clear Caches'}
            </button>
            <button className={styles.agentBtn} onClick={() => handleAdminAction('reports')} style={{ background: controlPlaneStatus['reports'] === 'success' ? 'rgba(34, 197, 94, 0.2)' : undefined }}>
              {controlPlaneStatus['reports'] === 'loading' ? '⏳ Generating...' : controlPlaneStatus['reports'] === 'success' ? '✅ Generated!' : '📊 Generate Reports'}
            </button>
            <button 
              className={styles.agentBtn} 
              onClick={() => handleAdminAction('maintenance')}
              style={{ background: maintenanceMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
            >
              {maintenanceMode ? '🔴 Exit Maintenance' : '⚠️ Maintenance Mode'}
            </button>
          </div>
        </div>

        {/* Governance Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>v2.1.0</div>
            <div className={styles.statLabel}>Governance Version</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Policy Violations</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>SOC 2</div>
            <div className={styles.statLabel}>Compliance Level</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>EU AI Act</div>
            <div className={styles.statLabel}>Regulatory Framework</div>
          </div>
        </div>

        {/* Protocol Layers - With Admin Controls */}
        <div className={styles.cardsGrid} style={{ marginTop: '24px' }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Protocol Layers <span style={{ fontSize: '11px', color: '#a78bfa', marginLeft: '8px' }}>✏️ Editable</span></h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { layer: 'L0', name: 'Identity Layer', status: 'active', desc: 'DSID, user hashes, anchors' },
                { layer: 'L1', name: 'Trust Layer', status: 'active', desc: 'Reputation, verification' },
                { layer: 'L2', name: 'Economic Layer', status: 'active', desc: 'Credits, billing, pricing' },
                { layer: 'L3', name: 'Execution Layer', status: 'active', desc: 'Agents, tasks, mutations' },
                { layer: 'L4', name: 'Governance Layer', status: 'active', desc: 'Policies, compliance' },
              ].map(l => (
                <div key={l.layer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div><strong style={{ color: '#a78bfa' }}>{l.layer}</strong> - {l.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{l.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#22c55e', fontSize: '12px' }}>● {l.status}</span>
                    <button 
                      onClick={() => handleLayerConfig(l.layer, l.name)}
                      style={{ padding: '4px 8px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '4px', color: '#a78bfa', fontSize: '11px', cursor: 'pointer' }}
                    >Configure</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Subsystems <span style={{ fontSize: '11px', color: '#a78bfa', marginLeft: '8px' }}>✏️ Controllable</span></h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'DSID Registry', status: 'healthy', action: 'Manage' },
                { name: 'Agent Orchestrator', status: 'healthy', action: 'Control' },
                { name: 'Memory Anchor', status: 'healthy', action: 'Configure' },
                { name: 'Economic Engine', status: 'healthy', action: 'Adjust' },
                { name: 'Audit Trail', status: 'healthy', action: 'Export' },
              ].map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span>{s.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#22c55e', fontSize: '12px' }}>● {s.status}</span>
                    <button 
                      onClick={() => handleSubsystemAction(s.name, s.action)}
                      style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '4px', color: '#60a5fa', fontSize: '11px', cursor: 'pointer' }}
                    >{s.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Configuration */}
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}><SettingsIcon /> Platform Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Concurrent Agents</label>
              <input type="number" defaultValue={100} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Memory Retention (days)</label>
              <input type="number" defaultValue={365} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Blockchain Anchor Interval</label>
              <select defaultValue="1h" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                <option value="15m">Every 15 minutes</option>
                <option value="1h">Every hour</option>
                <option value="6h">Every 6 hours</option>
                <option value="24h">Daily</option>
              </select>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Auto-Scale Agents</label>
              <select defaultValue="enabled" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} style={{ marginTop: '16px' }} onClick={() => alert('✅ Platform configuration saved!')}>Save Configuration</button>
        </div>

        {/* Audit Log */}
        <div className={styles.card} style={{ marginTop: '24px' }}>
          <h3 className={styles.cardTitle}>Recent Audit Events</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Timestamp</th><th>Event</th><th>Actor</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date().toISOString()}</td>
                  <td>Control Plane inspection</td>
                  <td>DSID-SYS-ADMIN</td>
                  <td><span style={{ color: '#22c55e' }}>✓ Allowed</span></td>
                </tr>
                <tr>
                  <td>{new Date(Date.now() - 3600000).toISOString()}</td>
                  <td>Policy version update</td>
                  <td>DSID-SYS-ADMIN</td>
                  <td><span style={{ color: '#22c55e' }}>✓ Allowed</span></td>
                </tr>
                <tr>
                  <td>{new Date(Date.now() - 7200000).toISOString()}</td>
                  <td>Agent spawn request</td>
                  <td>DSID-AGENT-001</td>
                  <td><span style={{ color: '#22c55e' }}>✓ Allowed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const renderPricing = () => {
    // Ensure pricing has all required properties with defaults
    const safePricing = {
      creditRate: pricing?.creditRate ?? 0.001,
      topupPrice: pricing?.topupPrice ?? 8,
      topupAmount: pricing?.topupAmount ?? 10000,
      minTopupAmount: pricing?.minTopupAmount ?? 5,
      developer: {
        credits: pricing?.developer?.credits ?? 1000,
        price: pricing?.developer?.price ?? 0,
        limits: {
          conversations: pricing?.developer?.limits?.conversations ?? 10,
          messagesPerDay: pricing?.developer?.limits?.messagesPerDay ?? 100,
          messagesPerConversation: pricing?.developer?.limits?.messagesPerConversation ?? 50,
          storageMb: pricing?.developer?.limits?.storageMb ?? 100,
          maxMemoryItems: pricing?.developer?.limits?.maxMemoryItems ?? 1000,
          apiRatePerMin: pricing?.developer?.limits?.apiRatePerMin ?? 30,
          fileUploadMb: pricing?.developer?.limits?.fileUploadMb ?? 5,
          agentsAllowed: pricing?.developer?.limits?.agentsAllowed ?? -1,
          computeHours: pricing?.developer?.limits?.computeHours ?? 10,
        }
      },
      plus: {
        credits: pricing?.plus?.credits ?? 50000,
        price: pricing?.plus?.price ?? 49,
        limits: {
          conversations: pricing?.plus?.limits?.conversations ?? 1000,
          messagesPerDay: pricing?.plus?.limits?.messagesPerDay ?? 1000,
          messagesPerConversation: pricing?.plus?.limits?.messagesPerConversation ?? 500,
          storageMb: pricing?.plus?.limits?.storageMb ?? 5000,
          maxMemoryItems: pricing?.plus?.limits?.maxMemoryItems ?? 100000,
          apiRatePerMin: pricing?.plus?.limits?.apiRatePerMin ?? 300,
          fileUploadMb: pricing?.plus?.limits?.fileUploadMb ?? 100,
          agentsAllowed: pricing?.plus?.limits?.agentsAllowed ?? 20,
          computeHours: pricing?.plus?.limits?.computeHours ?? 100,
        }
      },
      enterprise: {
        credits: pricing?.enterprise?.credits ?? 500000,
        price: pricing?.enterprise?.price ?? 299,
        limits: {
          conversations: pricing?.enterprise?.limits?.conversations ?? -1,
          messagesPerDay: pricing?.enterprise?.limits?.messagesPerDay ?? -1,
          messagesPerConversation: pricing?.enterprise?.limits?.messagesPerConversation ?? -1,
          storageMb: pricing?.enterprise?.limits?.storageMb ?? 100000,
          maxMemoryItems: pricing?.enterprise?.limits?.maxMemoryItems ?? -1,
          apiRatePerMin: pricing?.enterprise?.limits?.apiRatePerMin ?? -1,
          fileUploadMb: pricing?.enterprise?.limits?.fileUploadMb ?? 1000,
          agentsAllowed: pricing?.enterprise?.limits?.agentsAllowed ?? -1,
          computeHours: pricing?.enterprise?.limits?.computeHours ?? -1,
        }
      }
    };
    
    return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}><DollarIcon /> Pricing Management - Full Configuration</h2>
      
      {/* Base Credit Pricing */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>💰 Base Credit Pricing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Credit Rate ($ per credit)</label>
            <input type="number" step="0.0001" value={safePricing.creditRate} onChange={e => setPricing({...safePricing, creditRate: parseFloat(e.target.value) || 0.001})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Top-up Price ($)</label>
            <input type="number" value={safePricing.topupPrice} onChange={e => setPricing({...safePricing, topupPrice: parseInt(e.target.value) || 8})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Top-up Credits Amount</label>
            <input type="number" value={safePricing.topupAmount} onChange={e => setPricing({...safePricing, topupAmount: parseInt(e.target.value) || 10000})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Min Top-up Amount ($)</label>
            <input type="number" defaultValue={5} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
      </div>

      {/* Free/Developer Plan */}
      <div className={styles.card} style={{ marginBottom: '24px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
        <h3 className={styles.cardTitle} style={{ color: '#22c55e' }}>🆓 Free / Developer Plan</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Default plan for new signups. Limited quotas for testing and development.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Monthly Credits</label>
            <input type="number" value={safePricing.developer.credits} onChange={e => setPricing({...safePricing, developer: {...safePricing.developer, credits: parseInt(e.target.value) || 0}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Conversations (total)</label>
            <input type="number" value={safePricing.developer.limits.conversations} onChange={e => setPricing({...safePricing, developer: {...safePricing.developer, limits: {...safePricing.developer.limits, conversations: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Messages/Day</label>
            <input type="number" value={safePricing.developer.limits.messagesPerDay} onChange={e => setPricing({...safePricing, developer: {...safePricing.developer, limits: {...safePricing.developer.limits, messagesPerDay: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Memory Storage (MB)</label>
            <input type="number" value={safePricing.developer.limits.storageMb} onChange={e => setPricing({...safePricing, developer: {...safePricing.developer, limits: {...safePricing.developer.limits, storageMb: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Memory Items</label>
            <input type="number" value={safePricing.developer.limits.maxMemoryItems} onChange={e => setPricing({...safePricing, developer: {...safePricing.developer, limits: {...safePricing.developer.limits, maxMemoryItems: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>API Rate (req/min)</label>
            <input type="number" value={safePricing.developer.limits.apiRatePerMin} onChange={e => setPricing({...safePricing, developer: {...safePricing.developer, limits: {...safePricing.developer.limits, apiRatePerMin: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>File Upload (MB)</label>
            <input type="number" value={safePricing.developer.limits.fileUploadMb} onChange={e => setPricing({...safePricing, developer: {...safePricing.developer, limits: {...safePricing.developer.limits, fileUploadMb: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Agents Allowed</label>
            <input type="number" value={safePricing.developer.limits.agentsAllowed} onChange={e => setPricing({...safePricing, developer: {...safePricing.developer, limits: {...safePricing.developer.limits, agentsAllowed: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
        
        <h4 style={{ marginTop: '20px', marginBottom: '12px', color: '#94a3b8' }}>Features</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Basic Chat</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Memory Search</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            <span>Advanced Analytics</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            <span>Priority Support</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            <span>API Access</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            <span>Blockchain Anchoring</span>
          </label>
        </div>
      </div>

      {/* Plus Plan */}
      <div className={styles.card} style={{ marginBottom: '24px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h3 className={styles.cardTitle} style={{ color: '#3b82f6' }}>⭐ Plus Plan - ${safePricing.plus.price}/month</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>For power users and small teams. Enhanced quotas and features.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Price ($/month)</label>
            <input type="number" value={safePricing.plus.price} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, price: parseInt(e.target.value) || 0}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Monthly Credits</label>
            <input type="number" value={safePricing.plus.credits} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, credits: parseInt(e.target.value) || 0}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Conversations (total)</label>
            <input type="number" value={safePricing.plus.limits.conversations} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, limits: {...safePricing.plus.limits, conversations: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Messages/Day</label>
            <input type="number" value={safePricing.plus.limits.messagesPerDay} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, limits: {...safePricing.plus.limits, messagesPerDay: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Memory Storage (MB)</label>
            <input type="number" value={safePricing.plus.limits.storageMb} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, limits: {...safePricing.plus.limits, storageMb: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Memory Items</label>
            <input type="number" value={safePricing.plus.limits.maxMemoryItems} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, limits: {...safePricing.plus.limits, maxMemoryItems: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>API Rate (req/min)</label>
            <input type="number" value={safePricing.plus.limits.apiRatePerMin} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, limits: {...safePricing.plus.limits, apiRatePerMin: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>File Upload (MB)</label>
            <input type="number" value={safePricing.plus.limits.fileUploadMb} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, limits: {...safePricing.plus.limits, fileUploadMb: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Agents Allowed</label>
            <input type="number" value={safePricing.plus.limits.agentsAllowed} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, limits: {...safePricing.plus.limits, agentsAllowed: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Compute Hours</label>
            <input type="number" value={safePricing.plus.limits.computeHours} onChange={e => setPricing({...safePricing, plus: {...safePricing.plus, limits: {...safePricing.plus.limits, computeHours: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
        
        <h4 style={{ marginTop: '20px', marginBottom: '12px', color: '#94a3b8' }}>Features</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>All Free Features</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Advanced Analytics</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Priority Support</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>API Access</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Blockchain Anchoring</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Custom Agents</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            <span>White-label</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            <span>SSO/SAML</span>
          </label>
        </div>
      </div>

      {/* Enterprise Plan */}
      <div className={styles.card} style={{ marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <h3 className={styles.cardTitle} style={{ color: '#8b5cf6' }}>🏢 Enterprise Plan - ${safePricing.enterprise.price}/month</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>For organizations requiring unlimited access, custom SLAs, and dedicated support.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Base Price ($/month)</label>
            <input type="number" value={safePricing.enterprise.price} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, price: parseInt(e.target.value) || 0}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Monthly Credits</label>
            <input type="number" value={safePricing.enterprise.credits} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, credits: parseInt(e.target.value) || 0}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Conversations (-1=Unlimited)</label>
            <input type="number" value={safePricing.enterprise.limits.conversations} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, limits: {...safePricing.enterprise.limits, conversations: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Messages/Day (-1=Unlimited)</label>
            <input type="number" value={safePricing.enterprise.limits.messagesPerDay} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, limits: {...safePricing.enterprise.limits, messagesPerDay: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Memory Storage (MB)</label>
            <input type="number" value={safePricing.enterprise.limits.storageMb} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, limits: {...safePricing.enterprise.limits, storageMb: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Memory Items (-1=Unlimited)</label>
            <input type="number" value={safePricing.enterprise.limits.maxMemoryItems} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, limits: {...safePricing.enterprise.limits, maxMemoryItems: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>API Rate (-1=Unlimited)</label>
            <input type="number" value={safePricing.enterprise.limits.apiRatePerMin} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, limits: {...safePricing.enterprise.limits, apiRatePerMin: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>File Upload (MB)</label>
            <input type="number" value={safePricing.enterprise.limits.fileUploadMb} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, limits: {...safePricing.enterprise.limits, fileUploadMb: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Agents (-1=Unlimited)</label>
            <input type="number" value={safePricing.enterprise.limits.agentsAllowed} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, limits: {...safePricing.enterprise.limits, agentsAllowed: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Compute Hours (-1=Unlimited)</label>
            <input type="number" value={safePricing.enterprise.limits.computeHours} onChange={e => setPricing({...safePricing, enterprise: {...safePricing.enterprise, limits: {...safePricing.enterprise.limits, computeHours: parseInt(e.target.value) || 0}}})} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
        
        <h4 style={{ marginTop: '20px', marginBottom: '12px', color: '#94a3b8' }}>Enterprise Features</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>All Plus Features</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>White-label Branding</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>SSO/SAML Integration</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Dedicated Support</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Custom SLA</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>On-premise Deployment</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Custom Integrations</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Audit Logs</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Data Residency Options</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span>Priority Queue</span>
          </label>
        </div>

        <h4 style={{ marginTop: '20px', marginBottom: '12px', color: '#94a3b8' }}>Advanced Settings</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>SLA Uptime (%)</label>
            <input type="number" step="0.01" defaultValue={99.99} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Support Response (hours)</label>
            <input type="number" defaultValue={1} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Data Retention (years)</label>
            <input type="number" defaultValue={7} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Backup Frequency</label>
            <select defaultValue="hourly" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff' }}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="realtime">Real-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Usage-Based Pricing */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>📊 Usage-Based Pricing (Per-Unit Costs)</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Configure costs for usage beyond plan limits. Applied when users exceed their quotas.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Cost per 1K Tokens (Input)</label>
            <input type="number" step="0.0001" defaultValue={0.0015} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Cost per 1K Tokens (Output)</label>
            <input type="number" step="0.0001" defaultValue={0.002} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Cost per Embedding</label>
            <input type="number" step="0.00001" defaultValue={0.0001} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Cost per Memory Store</label>
            <input type="number" step="0.0001" defaultValue={0.001} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Cost per Memory Search</label>
            <input type="number" step="0.0001" defaultValue={0.0005} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Cost per Blockchain Anchor</label>
            <input type="number" step="0.01" defaultValue={0.10} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Cost per Agent Hour</label>
            <input type="number" step="0.01" defaultValue={0.05} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Cost per GB Storage/month</label>
            <input type="number" step="0.01" defaultValue={0.25} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
      </div>

      {/* Discounts & Promotions */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>🎁 Discounts & Promotions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Annual Discount (%)</label>
            <input type="number" defaultValue={20} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Startup Discount (%)</label>
            <input type="number" defaultValue={50} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Education Discount (%)</label>
            <input type="number" defaultValue={75} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Referral Bonus (Credits)</label>
            <input type="number" defaultValue={5000} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <button className={styles.agentBtn} onClick={() => setShowPromoModal(true)}>➕ Create Promo Code</button>
          <button className={styles.agentBtn} style={{ marginLeft: '12px' }} onClick={() => {
            // Show promo codes list
          }}>📋 Manage Promo Codes</button>
        </div>

        {/* Promo Codes Table */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ color: '#94a3b8', marginBottom: '12px' }}>Active Promo Codes</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Type</th>
                  <th>Expiry</th>
                  <th>Uses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promo, idx) => (
                  <tr key={idx}>
                    <td><code style={{ background: 'rgba(99,102,241,0.2)', padding: '4px 8px', borderRadius: '4px', color: '#a5b4fc' }}>{promo.code}</code></td>
                    <td>{promo.discount}{promo.type === 'percent' ? '%' : ' credits'}</td>
                    <td>{promo.type === 'percent' ? 'Discount' : 'Bonus Credits'}</td>
                    <td>{promo.expiry}</td>
                    <td>{promo.uses}</td>
                    <td>
                      <button 
                        style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', color: '#f87171', fontSize: '11px', cursor: 'pointer' }}
                        onClick={() => {
                          if (confirm(`Delete promo code ${promo.code}?`)) {
                            setPromoCodes(promoCodes.filter((_, i) => i !== idx));
                          }
                        }}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '90vw' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '24px' }}>Create Promo Code</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Promo Code</label>
              <input 
                type="text" 
                placeholder="e.g., SUMMER2025"
                value={newPromo.code}
                onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Type</label>
              <select 
                value={newPromo.type}
                onChange={(e) => setNewPromo({...newPromo, type: e.target.value as 'percent' | 'credits'})}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              >
                <option value="percent">Percentage Discount</option>
                <option value="credits">Bonus Credits</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                {newPromo.type === 'percent' ? 'Discount (%)' : 'Bonus Credits'}
              </label>
              <input 
                type="number" 
                value={newPromo.discount}
                onChange={(e) => setNewPromo({...newPromo, discount: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Expiry Date</label>
              <input 
                type="date" 
                value={newPromo.expiry}
                onChange={(e) => setNewPromo({...newPromo, expiry: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowPromoModal(false)}
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
              >Cancel</button>
              <button 
                onClick={async () => {
                  if (!newPromo.code) {
                    alert('Please enter a promo code');
                    return;
                  }
                  // Add to local state
                  setPromoCodes([...promoCodes, { ...newPromo, uses: 0 }]);
                  
                  // Try to save to backend
                  const token = localStorage.getItem('owner_token');
                  try {
                    await fetch(`${API_BASE}/owner/auth/promo-codes`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(newPromo)
                    });
                  } catch (err) {
                    console.log('Backend not available, saved locally');
                  }
                  
                  setNewPromo({ code: '', discount: 25, type: 'percent', expiry: '' });
                  setShowPromoModal(false);
                  alert(`✅ Promo code ${newPromo.code} created!`);
                }}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
              >Create Promo Code</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} 
          style={{ padding: '12px 32px', fontSize: '16px' }}
          onClick={async () => {
            const token = localStorage.getItem('owner_token');
            if (!token) {
              alert('❌ Not authenticated. Please login again.');
              return;
            }
            
            try {
              const res = await fetch(`${API_BASE}/owner/auth/pricing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(safePricing)
              });
              
              if (res.ok) {
                const data = await res.json();
                if (data.persisted_to) {
                  alert(`✅ Pricing saved to YAML file!\n\nFile: ${data.persisted_to}\n\nChanges are now persistent and will apply globally.`);
                } else {
                  alert('✅ Pricing configuration saved to backend!');
                }
              } else {
                const error = await res.json().catch(() => ({}));
                alert(`❌ Failed to save pricing: ${error.detail || res.statusText}\n\nMake sure the backend is running.`);
              }
            } catch (err: any) {
              alert(`❌ Failed to connect to backend: ${err.message}\n\nMake sure the backend services are running:\n1. cd auth_service && uvicorn app.main:app --port 8081\n2. Or start the gateway`);
            }
          }}
        >💾 Save All Pricing</button>
        <button 
          className={styles.agentBtn} 
          style={{ padding: '12px 24px' }}
          onClick={() => {
            if (confirm('Reset all pricing to defaults? This cannot be undone.')) {
              setPricing({
                creditRate: 0.001,
                topupPrice: 8,
                topupAmount: 10000,
                minTopupAmount: 5,
                developer: {
                  credits: 1000,
                  price: 0,
                  limits: {
                    conversations: 10,
                    messagesPerDay: 100,
                    messagesPerConversation: 50,
                    storageMb: 100,
                    maxMemoryItems: 1000,
                    apiRatePerMin: 30,
                    fileUploadMb: 5,
                    agentsAllowed: -1,  // Unlimited - we bill by credits only
                    computeHours: 10,
                  }
                },
                plus: {
                  credits: 50000,
                  price: 49,
                  limits: {
                    conversations: 1000,
                    messagesPerDay: 1000,
                    messagesPerConversation: 500,
                    storageMb: 5000,
                    maxMemoryItems: 100000,
                    apiRatePerMin: 300,
                    fileUploadMb: 100,
                    agentsAllowed: 20,
                    computeHours: 100,
                  }
                },
                enterprise: {
                  credits: 500000,
                  price: 299,
                  limits: {
                    conversations: -1,
                    messagesPerDay: -1,
                    messagesPerConversation: -1,
                    storageMb: 100000,
                    maxMemoryItems: -1,
                    apiRatePerMin: -1,
                    fileUploadMb: 1000,
                    agentsAllowed: -1,
                    computeHours: -1,
                  }
                }
              });
              alert('✅ Pricing reset to defaults!');
            }
          }}
        >↩️ Reset to Defaults</button>
        <button 
          className={styles.agentBtn} 
          style={{ padding: '12px 24px' }}
          onClick={() => {
            const config = JSON.stringify(safePricing, null, 2);
            const blob = new Blob([config], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pricing_config_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('✅ Pricing configuration exported!');
          }}
        >📤 Export Pricing Config</button>
        <button 
          className={styles.agentBtn} 
          style={{ padding: '12px 24px' }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e: any) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev: any) => {
                  try {
                    const config = JSON.parse(ev.target.result);
                    setPricing(config);
                    alert('✅ Pricing configuration imported successfully!');
                  } catch (err) {
                    alert('⚠️ Invalid JSON file');
                  }
                };
                reader.readAsText(file);
              }
            };
            input.click();
          }}
        >📥 Import Pricing Config</button>
        <button 
          className={styles.agentBtn} 
          style={{ padding: '12px 24px' }}
          onClick={() => window.open('/pricing', '_blank')}
        >👁️ Preview Pricing Page</button>
      </div>
    </div>
  );
  };

  const renderUsers = () => (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}><UsersIcon /> All Platform Users</h2>
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr><th>User</th><th>Email</th><th>Plan</th><th>Status</th><th>Created</th><th>Last Login</th></tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const isActive = user.status === 'active' || user.is_active;
                const createdDate = user.createdAt || user.created_at;
                const lastLoginDate = user.lastLogin || user.last_login_at;
                return (
                  <tr key={user.id}>
                    <td>{user.full_name || user.name || user.email?.split('@')[0] || 'Unknown'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{user.email}</td>
                    <td>
                      <span style={{ 
                        padding: '2px 8px', 
                        background: 'rgba(139, 92, 246, 0.1)', 
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#a78bfa'
                      }}>
                        {user.plan || 'developer'}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        color: isActive ? '#22c55e' : '#ef4444' 
                      }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: isActive ? '#22c55e' : '#ef4444' 
                        }} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {createdDate ? new Date(createdDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {lastLoginDate ? new Date(lastLoginDate).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}><ServerIcon /> Platform Monitoring - Full Metrics Dashboard</h2>
      
      {/* Service Health Grid */}
      <div className={styles.statsGrid}>
        {services.map(service => (
          <div key={service.name} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon}`} style={{ 
                background: service.status === 'healthy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: service.status === 'healthy' ? '#22c55e' : '#ef4444'
              }}>
                <ServerIcon />
              </div>
            </div>
            <div className={styles.statValue}>{service.name}</div>
            <div className={styles.statLabel}>{service.latency}ms · {service.status}</div>
          </div>
        ))}
      </div>

      {/* Gateway Metrics - Rendered UI */}
      <div className={styles.card} style={{ marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>📊 Gateway API Metrics</h3>
        {gatewayMetrics ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{gatewayMetrics.total_requests?.toLocaleString() || 0}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Total Requests</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444' }}>{gatewayMetrics.total_errors || 0}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Total Errors</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#eab308' }}>{((gatewayMetrics.error_rate || 0) * 100).toFixed(2)}%</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Error Rate</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>{(gatewayMetrics.avg_latency_ms || 0).toFixed(1)}ms</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Avg Latency</div>
              </div>
            </div>

            {/* Status Codes */}
            <h4 style={{ marginTop: '24px', marginBottom: '12px', color: '#94a3b8' }}>HTTP Status Codes</h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {gatewayMetrics.status_codes && Object.entries(gatewayMetrics.status_codes).map(([code, count]: [string, any]) => (
                <div key={code} style={{ 
                  padding: '8px 16px', 
                  background: code.startsWith('2') ? 'rgba(34, 197, 94, 0.1)' : code.startsWith('4') ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '6px',
                  border: `1px solid ${code.startsWith('2') ? 'rgba(34, 197, 94, 0.3)' : code.startsWith('4') ? 'rgba(234, 179, 8, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                  <span style={{ fontWeight: 600, color: code.startsWith('2') ? '#22c55e' : code.startsWith('4') ? '#eab308' : '#ef4444' }}>{code}</span>
                  <span style={{ color: '#64748b', marginLeft: '8px' }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Top Endpoints */}
            <h4 style={{ marginTop: '24px', marginBottom: '12px', color: '#94a3b8' }}>Top Endpoints by Traffic</h4>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Endpoint</th><th>Requests</th><th>Errors</th><th>Avg Latency</th></tr>
                </thead>
                <tbody>
                  {gatewayMetrics.top_endpoints?.slice(0, 10).map((ep: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{ep.endpoint}</td>
                      <td>{ep.count}</td>
                      <td style={{ color: ep.errors > 0 ? '#ef4444' : '#22c55e' }}>{ep.errors}</td>
                      <td>{(ep.avg_latency_ms || 0).toFixed(1)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading gateway metrics...</p>
          </div>
        )}
      </div>

      {/* RARA Status - Rendered UI */}
      <div className={styles.card} style={{ marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>🤖 RARA System Status</h3>
        {raraDetailedStatus ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', background: raraDetailedStatus.state === 'running' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: raraDetailedStatus.state === 'running' ? '#22c55e' : '#ef4444', textTransform: 'uppercase' }}>{raraDetailedStatus.state || 'Unknown'}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>System State</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6' }}>{raraDetailedStatus.agents_registered || 0}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Agents Registered</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{raraDetailedStatus.mutations_today || 0}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Mutations Today</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#eab308' }}>{raraDetailedStatus.rollbacks_today || 0}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Rollbacks Today</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444' }}>{raraDetailedStatus.invariant_violations || 0}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Invariant Violations</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>{Math.floor((raraDetailedStatus.uptime_seconds || 0) / 3600)}h</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Uptime</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>Last Snapshot:</span>
                <span style={{ marginLeft: '8px', fontFamily: 'monospace', color: '#fff' }}>{raraDetailedStatus.last_snapshot || 'None'}</span>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>Active Mutation:</span>
                <span style={{ marginLeft: '8px', fontFamily: 'monospace', color: raraDetailedStatus.active_mutation ? '#eab308' : '#22c55e' }}>{raraDetailedStatus.active_mutation || 'None'}</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading RARA status...</p>
          </div>
        )}
      </div>

      {/* System Resources */}
      <div className={styles.card} style={{ marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>💻 System Resources</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>CPU Usage</span>
              <span style={{ fontWeight: 600, color: '#3b82f6' }}>24%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '24%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Memory Usage</span>
              <span style={{ fontWeight: 600, color: '#8b5cf6' }}>4.2 GB / 16 GB</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '26%', height: '100%', background: '#8b5cf6', borderRadius: '4px' }}></div>
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Disk Usage</span>
              <span style={{ fontWeight: 600, color: '#22c55e' }}>128 GB / 500 GB</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '25%', height: '100%', background: '#22c55e', borderRadius: '4px' }}></div>
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Network I/O</span>
              <span style={{ fontWeight: 600, color: '#eab308' }}>1.2 MB/s</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '12%', height: '100%', background: '#eab308', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Metrics */}
      <div className={styles.card} style={{ marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>🗄️ Database Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>12</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Active Connections</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>2.3ms</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Avg Query Time</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>1.2M</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Total Rows</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#eab308' }}>256 MB</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Cache Size</div>
          </div>
        </div>
      </div>

      {/* Vector Store Metrics */}
      <div className={styles.card} style={{ marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>🧠 Vector Store (Qdrant) Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>892K</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Total Vectors</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>3</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Collections</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>15ms</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Avg Search Time</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#eab308' }}>1536</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Vector Dimension</div>
          </div>
        </div>
      </div>

      {/* Quick Links & Setup */}
      <div className={styles.cardsGrid} style={{ marginTop: '24px' }}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🔗 Service Endpoints</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <a href={`${API_BASE}/docs`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
              📚 API Documentation (Swagger)
            </a>
            <a href={`${API_BASE}/health`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
              💚 Gateway Health Check
            </a>
            <a href={`${API_BASE}/metrics`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
              📈 Gateway Metrics (Raw JSON)
            </a>
            <a href="http://localhost:8093/status" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
              🤖 RARA Status (Raw JSON)
            </a>
            <a href="http://localhost:8093/agents" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
              🤖 RARA Agents (Raw JSON)
            </a>
            <a href="http://localhost:8091" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
              🌐 Hash Sphere Visualizer
            </a>
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⚙️ Monitoring Setup</h3>
          <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', marginTop: '16px' }}>
            <p style={{ margin: 0, color: '#eab308' }}>⚠️ Grafana & Prometheus not running</p>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
              To enable full monitoring dashboards, run:<br/>
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '8px' }}>
                docker-compose -f docker-compose.monitoring.yml up -d
              </code>
            </p>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className={styles.agentBtn} style={{ opacity: 0.5 }}>📊 Open Grafana</button>
            <button className={styles.agentBtn} style={{ opacity: 0.5 }}>📈 Open Prometheus</button>
            <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} onClick={handleRefresh}>🔄 Refresh Metrics</button>
          </div>
        </div>
      </div>

      {/* Logs Preview */}
      <div className={styles.card} style={{ marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>📜 Recent Logs</h3>
        <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
          <div style={{ color: '#22c55e' }}>[INFO] Gateway started on port 8000</div>
          <div style={{ color: '#22c55e' }}>[INFO] Auth service connected</div>
          <div style={{ color: '#22c55e' }}>[INFO] Memory service connected</div>
          <div style={{ color: '#22c55e' }}>[INFO] RARA service connected on port 8093</div>
          <div style={{ color: '#3b82f6' }}>[DEBUG] Health check passed for all services</div>
          <div style={{ color: '#eab308' }}>[WARN] High latency detected on LLM service (250ms)</div>
          <div style={{ color: '#22c55e' }}>[INFO] User login: owner@test.com</div>
          <div style={{ color: '#3b82f6' }}>[DEBUG] Dashboard stats fetched successfully</div>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
          <button className={styles.agentBtn}>📥 Download Logs</button>
          <button className={styles.agentBtn}>🔍 Search Logs</button>
          <button className={styles.agentBtn}>⚡ Stream Live</button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}><SettingsIcon /> Platform Settings - Full Configuration</h2>

      {/* General Settings */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>🌐 General Platform Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Platform Name</label>
            <input type="text" defaultValue="ResonantGenesis" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Platform URL</label>
            <input type="text" defaultValue="https://resonantgenesis.com" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Support Email</label>
            <input type="email" defaultValue="support@resonantgenesis.com" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Default Timezone</label>
            <select defaultValue="UTC" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Access Control */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>🔐 Access Control & Authentication</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Enable New Signups</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Allow new users to register</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Email Verification Required</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Require email verification</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Maintenance Mode</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Block all user access</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>MFA Enabled</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Multi-factor authentication</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Invite Only Mode</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Require invitation to join</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>OAuth Providers</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Google, GitHub login</div>
            </div>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Session Timeout (hours)</label>
            <input type="number" defaultValue={24} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Login Attempts</label>
            <input type="number" defaultValue={5} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Lockout Duration (min)</label>
            <input type="number" defaultValue={30} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Password Min Length</label>
            <input type="number" defaultValue={8} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
      </div>

      {/* Agent Settings */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>🤖 Agent & AI Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Auto-activate Agents on Deploy</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Start agents automatically</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>RARA Auto-Recovery</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Auto-rollback on failures</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Agent Codebase Access</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Allow agents to modify code</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Sandbox Mode</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Isolate agent execution</div>
            </div>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Concurrent Agents</label>
            <input type="number" defaultValue={100} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Agent Timeout (sec)</label>
            <input type="number" defaultValue={300} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Memory per Agent (MB)</label>
            <input type="number" defaultValue={512} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Default AI Model</label>
            <select defaultValue="gpt-4" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
              <option value="local">Local Model</option>
            </select>
          </div>
        </div>
      </div>

      {/* Memory & Storage */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>💾 Memory & Storage Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Memory Retention (days)</label>
            <input type="number" defaultValue={365} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Storage per User (GB)</label>
            <input type="number" defaultValue={10} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Vector Dimension</label>
            <input type="number" defaultValue={1536} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Embedding Model</label>
            <select defaultValue="text-embedding-3-small" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
              <option value="text-embedding-3-small">text-embedding-3-small</option>
              <option value="text-embedding-3-large">text-embedding-3-large</option>
              <option value="text-embedding-ada-002">text-embedding-ada-002</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Auto-Archive Old Memories</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Archive after retention period</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Compression Enabled</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Compress stored data</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Encryption at Rest</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>AES-256 encryption</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Backup Enabled</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Daily automated backups</div>
            </div>
          </label>
        </div>
      </div>

      {/* Rate Limiting & Quotas */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>⚡ Rate Limiting & Quotas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>API Rate Limit (req/min)</label>
            <input type="number" defaultValue={100} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max File Upload (MB)</label>
            <input type="number" defaultValue={50} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Max Requests per Day</label>
            <input type="number" defaultValue={10000} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Burst Limit</label>
            <input type="number" defaultValue={20} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
      </div>

      {/* Email & Notifications */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>📧 Email & Notifications</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>SMTP Host</label>
            <input type="text" defaultValue="smtp.sendgrid.net" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>SMTP Port</label>
            <input type="number" defaultValue={587} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>From Email</label>
            <input type="email" defaultValue="noreply@resonantgenesis.com" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Admin Alert Email</label>
            <input type="email" defaultValue="admin@resonantgenesis.com" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Welcome Emails</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Send on new signup</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Security Alerts</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Login from new device</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>System Alerts</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Critical errors to admin</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Marketing Emails</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Product updates</div>
            </div>
          </label>
        </div>
      </div>

      {/* API Keys & Integrations */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <h3 className={styles.cardTitle}>🔑 API Keys & Integrations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>OpenAI API Key</label>
            <input type="password" defaultValue="sk-..." style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Anthropic API Key</label>
            <input type="password" defaultValue="sk-ant-..." style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Stripe Secret Key</label>
            <input type="password" defaultValue="sk_live_..." style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace' }} />
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>SendGrid API Key</label>
            <input type="password" defaultValue="SG...." style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace' }} />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={styles.card} style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 className={styles.cardTitle} style={{ color: '#ef4444' }}>⚠️ Danger Zone</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>These actions are destructive and cannot be undone. Proceed with caution.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>🗑️ Purge All Caches</button>
          <button style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>🔄 Reset All Rate Limits</button>
          <button style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>🧹 Clear Audit Logs</button>
          <button style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>💀 Factory Reset Platform</button>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`} style={{ padding: '12px 32px', fontSize: '16px' }}>💾 Save All Settings</button>
        <button className={styles.agentBtn} style={{ padding: '12px 24px' }}>↩️ Reset to Defaults</button>
        <button className={styles.agentBtn} style={{ padding: '12px 24px' }}>📤 Export Config</button>
        <button className={styles.agentBtn} style={{ padding: '12px 24px' }}>📥 Import Config</button>
      </div>
    </div>
  );

  // ============== LLM PROVIDERS TAB ==============
  const renderLLMProviders = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'healthy': return '#22c55e';
        case 'degraded': return '#eab308';
        case 'down': return '#ef4444';
        default: return '#64748b';
      }
    };

    const getProviderIcon = (type: string) => {
      const found = PROVIDER_TYPES.find(p => p.value === type);
      return found?.icon || '🔧';
    };

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>🤖 LLM Provider Management</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
              Configure and manage AI providers for the platform. Changes apply globally.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className={styles.agentBtn} onClick={fetchLLMProviders}>
              <RefreshIcon /> Refresh
            </button>
            <button 
              className={`${styles.agentBtn} ${styles.agentBtnPrimary}`}
              onClick={() => { setEditingProvider(null); setShowProviderModal(true); }}
            >
              ➕ Add Provider
            </button>
          </div>
        </div>

        {/* Usage Overview */}
        <div className={styles.statsGrid} style={{ marginBottom: '24px' }}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{llmProviders.length}</div>
            <div className={styles.statLabel}>Total Providers</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#22c55e' }}>
              {llmProviders.filter(p => p.enabled).length}
            </div>
            <div className={styles.statLabel}>Active</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {llmProvidersUsage.reduce((sum, u) => sum + (u.requests_today || 0), 0).toLocaleString()}
            </div>
            <div className={styles.statLabel}>Requests Today</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              ${llmProvidersUsage.reduce((sum, u) => sum + (u.cost_today || 0), 0).toFixed(2)}
            </div>
            <div className={styles.statLabel}>Cost Today</div>
          </div>
        </div>

        {/* Providers List */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Configured Providers</h3>
          
          {llmProviders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No LLM providers configured yet.</p>
              <button 
                className={`${styles.agentBtn} ${styles.agentBtnPrimary}`}
                onClick={() => { setEditingProvider(null); setShowProviderModal(true); }}
                style={{ marginTop: '16px' }}
              >
                ➕ Add Your First Provider
              </button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Default Model</th>
                    <th>Status</th>
                    <th>Requests</th>
                    <th>Cost</th>
                    <th>Latency</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {llmProviders.map((provider) => {
                    const usage = llmProvidersUsage.find(u => u.provider_id === provider.id) || {};
                    const testResult = testResults[provider.id];
                    
                    return (
                      <tr key={provider.id} style={{ opacity: provider.enabled ? 1 : 0.5 }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{getProviderIcon(provider.provider_type)}</span>
                            <div>
                              <div style={{ fontWeight: 500 }}>{provider.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                {provider.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            padding: '2px 8px', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {provider.provider_type}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          {provider.default_model}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              background: getStatusColor(usage.status || 'unknown')
                            }} />
                            <span style={{ color: getStatusColor(usage.status || 'unknown'), fontSize: '12px' }}>
                              {usage.status || 'unknown'}
                            </span>
                          </div>
                        </td>
                        <td>{(usage.requests_today || 0).toLocaleString()}</td>
                        <td>${(usage.cost_today || 0).toFixed(2)}</td>
                        <td>{usage.avg_latency_ms ? `${Math.round(usage.avg_latency_ms)}ms` : '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              className={styles.agentBtn}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleTestProvider(provider.id)}
                              disabled={testingProvider === provider.id}
                            >
                              {testingProvider === provider.id ? '⏳' : '🔌'} Test
                            </button>
                            <button 
                              className={styles.agentBtn}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleToggleProvider(provider.id)}
                            >
                              {provider.enabled ? '⏸️' : '▶️'}
                            </button>
                            <button 
                              className={styles.agentBtn}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => { setEditingProvider(provider); setShowProviderModal(true); }}
                            >
                              ✏️
                            </button>
                            <button 
                              className={styles.agentBtn}
                              style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444' }}
                              onClick={() => handleDeleteProvider(provider.id)}
                            >
                              🗑️
                            </button>
                          </div>
                          {testResult && (
                            <div style={{ 
                              marginTop: '4px', 
                              fontSize: '10px', 
                              color: testResult.status === 'success' ? '#22c55e' : '#ef4444' 
                            }}>
                              {testResult.status === 'success' 
                                ? `✓ ${testResult.latency_ms}ms` 
                                : `✗ ${testResult.message?.slice(0, 30)}...`}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Provider Modal */}
        {showProviderModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '24px',
              width: '600px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ margin: '0 0 20px' }}>
                {editingProvider ? '✏️ Edit Provider' : '➕ Add New Provider'}
              </h3>
              
              <ProviderForm 
                provider={editingProvider}
                onSave={handleSaveProvider}
                onCancel={() => { setShowProviderModal(false); setEditingProvider(null); }}
              />
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className={styles.card} style={{ marginTop: '24px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h3 className={styles.cardTitle} style={{ color: '#3b82f6' }}>ℹ️ How Provider Management Works</h3>
          <ul style={{ margin: '12px 0', paddingLeft: '20px', color: '#94a3b8', fontSize: '13px', lineHeight: 1.8 }}>
            <li><strong>Priority:</strong> Lower priority number = higher preference. Used for fallback routing.</li>
            <li><strong>Rate Limits:</strong> RPM (requests/min) and TPM (tokens/min) are enforced platform-wide.</li>
            <li><strong>Cost Tracking:</strong> Input/output costs are tracked per 1K tokens for billing.</li>
            <li><strong>API Keys:</strong> Keys are encrypted and masked. Re-enter to update.</li>
            <li><strong>Global Effect:</strong> Changes here affect all platform users immediately.</li>
          </ul>
        </div>
      </div>
    );
  };

  // Provider Form Component
  const ProviderForm: React.FC<{
    provider: any;
    onSave: (provider: any) => void;
    onCancel: () => void;
  }> = ({ provider, onSave, onCancel }) => {
    const [form, setForm] = useState({
      name: provider?.name || '',
      provider_type: provider?.provider_type || 'openai',
      api_key: '',
      api_base_url: provider?.api_base_url || DEFAULT_API_URLS['openai'],
      default_model: provider?.default_model || '',
      models: provider?.models?.join(', ') || '',
      enabled: provider?.enabled ?? true,
      priority: provider?.priority || 1,
      rate_limit_rpm: provider?.rate_limit_rpm || 60,
      rate_limit_tpm: provider?.rate_limit_tpm || 100000,
      max_retries: provider?.max_retries || 3,
      timeout_seconds: provider?.timeout_seconds || 30,
      cost_per_1k_input: provider?.cost_per_1k_input || 0,
      cost_per_1k_output: provider?.cost_per_1k_output || 0,
    });

    const handleTypeChange = (type: string) => {
      setForm(prev => ({
        ...prev,
        provider_type: type,
        api_base_url: DEFAULT_API_URLS[type] || '',
        models: DEFAULT_MODELS[type]?.join(', ') || '',
        default_model: DEFAULT_MODELS[type]?.[0] || '',
      }));
    };

    const handleSubmit = () => {
      onSave({
        ...form,
        models: form.models.split(',').map(m => m.trim()).filter(Boolean),
      });
    };

    const inputStyle = {
      width: '100%',
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '6px',
      color: '#fff',
      fontSize: '13px'
    };

    const labelStyle = {
      display: 'block',
      marginBottom: '6px',
      color: '#94a3b8',
      fontSize: '12px'
    };

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Provider Name *</label>
            <input 
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., OpenAI Production"
            />
          </div>
          <div>
            <label style={labelStyle}>Provider Type *</label>
            <select 
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.provider_type}
              onChange={e => handleTypeChange(e.target.value)}
            >
              {PROVIDER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>API Key {provider ? '(leave blank to keep existing)' : '*'}</label>
            <input 
              type="password"
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              value={form.api_key}
              onChange={e => setForm(prev => ({ ...prev, api_key: e.target.value }))}
              placeholder={provider?.has_api_key ? '••••••••••••' : 'Enter API key'}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>API Base URL</label>
            <input 
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              value={form.api_base_url}
              onChange={e => setForm(prev => ({ ...prev, api_base_url: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Default Model</label>
            <input 
              style={inputStyle}
              value={form.default_model}
              onChange={e => setForm(prev => ({ ...prev, default_model: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Priority (1 = highest)</label>
            <input 
              type="number"
              style={inputStyle}
              value={form.priority}
              onChange={e => setForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
              min={1}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Available Models (comma-separated)</label>
            <input 
              style={inputStyle}
              value={form.models}
              onChange={e => setForm(prev => ({ ...prev, models: e.target.value }))}
              placeholder="gpt-4, gpt-3.5-turbo, ..."
            />
          </div>
          <div>
            <label style={labelStyle}>Rate Limit (RPM)</label>
            <input 
              type="number"
              style={inputStyle}
              value={form.rate_limit_rpm}
              onChange={e => setForm(prev => ({ ...prev, rate_limit_rpm: parseInt(e.target.value) || 60 }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Rate Limit (TPM)</label>
            <input 
              type="number"
              style={inputStyle}
              value={form.rate_limit_tpm}
              onChange={e => setForm(prev => ({ ...prev, rate_limit_tpm: parseInt(e.target.value) || 100000 }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Cost per 1K Input Tokens ($)</label>
            <input 
              type="number"
              step="0.001"
              style={inputStyle}
              value={form.cost_per_1k_input}
              onChange={e => setForm(prev => ({ ...prev, cost_per_1k_input: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Cost per 1K Output Tokens ($)</label>
            <input 
              type="number"
              step="0.001"
              style={inputStyle}
              value={form.cost_per_1k_output}
              onChange={e => setForm(prev => ({ ...prev, cost_per_1k_output: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Timeout (seconds)</label>
            <input 
              type="number"
              style={inputStyle}
              value={form.timeout_seconds}
              onChange={e => setForm(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) || 30 }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Max Retries</label>
            <input 
              type="number"
              style={inputStyle}
              value={form.max_retries}
              onChange={e => setForm(prev => ({ ...prev, max_retries: parseInt(e.target.value) || 3 }))}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={form.enabled}
                onChange={e => setForm(prev => ({ ...prev, enabled: e.target.checked }))}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ color: '#fff' }}>Enabled</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button className={styles.agentBtn} onClick={onCancel}>Cancel</button>
          <button 
            className={`${styles.agentBtn} ${styles.agentBtnPrimary}`}
            onClick={handleSubmit}
            disabled={!form.name || !form.provider_type}
          >
            {provider ? 'Update Provider' : 'Create Provider'}
          </button>
        </div>
      </div>
    );
  };

  // ============== MAIN RENDER ==============
  if (isLoading) {
    return (
      <div className={styles.ownerDashboard}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
            <div>Loading owner dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ownerDashboard}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.pageTitle}>
              <CrownIcon />
              <div>
                <h1 className={styles.logoText}>Platform Control Center</h1>
                <div className={styles.logoSubtext}>ResonantGenesis Owner Dashboard</div>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.liveIndicator}>
              {killSwitchActive ? '🔴 FROZEN' : '🟢 Platform Live'}
            </div>
            <button className={styles.logoutBtn} onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshIcon /> {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className={styles.logoutBtn} 
              onClick={handleLogout}
              style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
            >
              <LogOutIcon /> Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={styles.navTabs}>
          <button className={`${styles.navTab} ${activeTab === 'overview' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`${styles.navTab} ${activeTab === 'rara' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('rara')}>RARA Control</button>
          <button className={`${styles.navTab} ${activeTab === 'agents' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('agents')}>Autonomous Agents</button>
          <button className={`${styles.navTab} ${activeTab === 'llm-providers' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('llm-providers')}>🤖 LLM Providers</button>
          <button className={`${styles.navTab} ${activeTab === 'blockchain' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('blockchain')}>Blockchain</button>
          <button className={`${styles.navTab} ${activeTab === 'universes' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('universes')}>Memory Universes</button>
          <button className={`${styles.navTab} ${activeTab === 'controlplane' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('controlplane')}>Control Plane</button>
          <button className={`${styles.navTab} ${activeTab === 'pricing' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('pricing')}>Pricing</button>
          <button className={`${styles.navTab} ${activeTab === 'users' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`${styles.navTab} ${activeTab === 'monitoring' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('monitoring')}>Monitoring</button>
          <button className={`${styles.navTab} ${activeTab === 'settings' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
        </nav>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'rara' && renderRARA()}
        {activeTab === 'agents' && renderAgents()}
        {activeTab === 'llm-providers' && renderLLMProviders()}
        {activeTab === 'blockchain' && renderBlockchain()}
        {activeTab === 'universes' && renderUniverses()}
        {activeTab === 'controlplane' && renderControlPlane()}
        {activeTab === 'pricing' && renderPricing()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'monitoring' && renderMonitoring()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default OwnerDashboardComplete;
