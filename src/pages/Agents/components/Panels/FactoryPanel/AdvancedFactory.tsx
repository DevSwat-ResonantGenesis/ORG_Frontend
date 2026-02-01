import React, { memo, useState, useCallback, useEffect } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import type { Agent } from '../../../../../types';
import { createAgent as createAgentApi } from '../../../../../api/agents';
import { fetchUserApiKeys } from '../../../../../api/userApiKeys';
import { getProviders as getResonantProviders } from '../../../../../api/resonantChat';
import styles from './AdvancedFactory.module.css';

// ============== ADVANCED AGENT FACTORY ==============
// Full-featured agent creation with backend integration

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.resonant.network';

interface AdvancedConfig {
  // Basic
  name: string;
  description: string;
  type: string;
  mode: 'governed' | 'unbounded';
  tags: string[];
  
  // AI Model
  provider: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  
  // Tools & Capabilities
  tools: string[];
  capabilities: string[];
  
  // Memory
  memoryEnabled: boolean;
  vectorStoreEnabled: boolean;
  contextWindow: number;
  
  // Autonomy
  canSpawnSubAgents: boolean;
  canModifySelf: boolean;
  canAccessNetwork: boolean;
  canExecuteCode: boolean;
  maxConcurrentTasks: number;
  
  // Developer
  webhookUrl: string;
  apiKeyEnabled: boolean;
  rateLimitPerMinute: number;
  
  // Deployment
  environment: 'development' | 'staging' | 'production';
  autoScale: boolean;
  minInstances: number;
  maxInstances: number;

  // Routing
  routingMode: 'auto' | 'manual' | 'fallback';
  fallbackChain: string[];
}

const PROVIDERS = {
  groq: {
    name: 'Groq',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
    icon: 'Zap'
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    icon: 'Zap'
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    icon: 'Brain'
  },
  google: {
    name: 'Gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    icon: 'Globe'
  },
  local: { 
    name: 'Local', 
    models: ['llama-3-70b', 'llama-3-8b', 'mistral-7b', 'codellama-34b', 'mixtral-8x7b'],
    icon: 'Server'
  },
};

type ResonantProvider = {
  id: string;
  provider_key?: string;
  name: string;
  available: boolean;
  has_user_key?: boolean;
  uses_credits?: boolean;
  model?: string;
  description?: string;
  capabilities?: string[];
};

type ResonantProvidersResponse = {
  providers: ResonantProvider[];
  default?: string;
  fallback_chain?: string[];
  fallback_chain_provider_keys?: string[];
  message?: string | null;
  credits?: {
    remaining?: number | null;
    total?: number | null;
    unlimited?: boolean;
  };
};

const _normalize_provider_id = (id: string) => {
  const v = (id || '').toLowerCase();
  if (v === 'chatgpt') return 'openai';
  if (v === 'gemini') return 'google';
  if (v === 'claude') return 'anthropic';
  return v;
};

const _category_for_capabilities = (caps?: string[]): string => {
  const c = (caps || []).map(x => (x || '').toLowerCase());
  if (c.includes('video')) return 'Video';
  if (c.includes('speech') || c.includes('audio') || c.includes('voice')) return 'Speech';
  if (c.includes('image') || c.includes('vision')) return 'Image';
  if (c.includes('coding') || c.includes('code')) return 'Coding';
  return 'Chat / General';
};

const _get_default_model_for_provider = (providerId: string): string => {
  const provider = (PROVIDERS as any)[providerId];
  const models: string[] | undefined = provider?.models;
  if (models && models.length > 0) return models[0];
  return '';
};

const TOOLS = [
  { id: 'web_search', name: 'Web Search', icon: 'Search', description: 'Search the internet' },
  { id: 'code_exec', name: 'Code Execution', icon: 'Code', description: 'Execute code in sandbox' },
  { id: 'file_access', name: 'File Access', icon: 'Folder', description: 'Read/write files' },
  { id: 'api_calls', name: 'API Calls', icon: 'External', description: 'Make HTTP requests' },
  { id: 'database', name: 'Database', icon: 'Database', description: 'Query databases' },
  { id: 'email', name: 'Email', icon: 'Mail', description: 'Send emails' },
  { id: 'calendar', name: 'Calendar', icon: 'Calendar', description: 'Manage calendar' },
  { id: 'image_gen', name: 'Image Generation', icon: 'Image', description: 'Generate images' },
  { id: 'speech', name: 'Speech', icon: 'Mic', description: 'Text-to-speech' },
  { id: 'vision', name: 'Vision', icon: 'Eye', description: 'Analyze images' },
];

const TEMPLATES = [
  { id: 't1', name: 'Research Assistant', type: 'researcher', provider: 'openai', model: 'gpt-4-turbo', tools: ['web_search', 'file_access'], description: 'Analyzes data and provides insights' },
  { id: 't2', name: 'Code Generator', type: 'coder', provider: 'anthropic', model: 'claude-3-opus', tools: ['code_exec', 'file_access'], description: 'Writes and reviews code' },
  { id: 't3', name: 'Data Analyst', type: 'executor', provider: 'openai', model: 'gpt-4', tools: ['database', 'file_access'], description: 'Processes and visualizes data' },
  { id: 't4', name: 'Content Writer', type: 'executor', provider: 'anthropic', model: 'claude-3-sonnet', tools: ['web_search'], description: 'Creates engaging content' },
  { id: 't5', name: 'Task Planner', type: 'planner', provider: 'openai', model: 'gpt-4-turbo', tools: ['calendar'], description: 'Breaks down complex tasks' },
  { id: 't6', name: 'Customer Support', type: 'executor', provider: 'openai', model: 'gpt-3.5-turbo', tools: ['email'], description: 'Handles customer inquiries' },
  { id: 't7', name: 'Full Stack Dev', type: 'coder', provider: 'anthropic', model: 'claude-3.5-sonnet', tools: ['code_exec', 'file_access', 'api_calls'], description: 'Full stack development agent' },
  { id: 't8', name: 'Vision Analyst', type: 'researcher', provider: 'openai', model: 'gpt-4o', tools: ['vision', 'file_access'], description: 'Analyzes images and documents' },
];

interface AdvancedFactoryProps {
  className?: string;
}

const AdvancedFactoryComponent: React.FC<AdvancedFactoryProps> = ({ className }) => {
  const { addAgent } = useAgentStore();
  
  const [activeTab, setActiveTab] = useState<'create' | 'templates' | 'import' | 'developer'>('create');
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [config, setConfig] = useState<AdvancedConfig>({
    name: '',
    description: '',
    type: 'executor',
    mode: 'governed',
    tags: [],
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    tools: [],
    capabilities: [],
    memoryEnabled: true,
    vectorStoreEnabled: false,
    contextWindow: 8192,
    canSpawnSubAgents: false,
    canModifySelf: false,
    canAccessNetwork: true,
    canExecuteCode: false,
    maxConcurrentTasks: 5,
    webhookUrl: '',
    apiKeyEnabled: false,
    rateLimitPerMinute: 60,
    environment: 'development',
    autoScale: false,
    minInstances: 1,
    maxInstances: 5,

    routingMode: 'auto',
    fallbackChain: ['groq', 'google', 'openai', 'anthropic'],
  });

  const [importData, setImportData] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);

  const [resonantProviders, setResonantProviders] = useState<ResonantProvidersResponse | null>(null);

  const [providerKeyStatus, setProviderKeyStatus] = useState<Record<string, 'configured' | 'missing' | 'unknown'>>({});

  useEffect(() => {
    const loadProviderKeyStatus = async () => {
      try {
        const keys = await fetchUserApiKeys();
        const configured = new Set(
          keys
            .filter((k) => k.isValid)
            .map((k) => (k.provider || '').toLowerCase())
            .filter(Boolean)
        );

        const status: Record<string, 'configured' | 'missing' | 'unknown'> = {};
        for (const id of Object.keys(PROVIDERS)) {
          const normalized = id.toLowerCase();
          if (normalized === 'local') {
            status[id] = 'configured';
            continue;
          }

          if (configured.has(normalized)) {
            status[id] = 'configured';
            continue;
          }

          status[id] = 'missing';
        }

        setProviderKeyStatus(status);
      } catch {
        setProviderKeyStatus({});
      }
    };

    loadProviderKeyStatus();
  }, []);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = (await getResonantProviders()) as ResonantProvidersResponse;
        setResonantProviders(data);
        const chainSource = (data.fallback_chain_provider_keys || data.fallback_chain || []);
        const chain = chainSource.map(_normalize_provider_id).filter(Boolean);
        if (chain.length > 0) {
          setConfig((prev) => ({
            ...prev,
            fallbackChain: chain,
            provider: prev.routingMode === 'auto' ? chain[0] : prev.provider,
            model:
              prev.routingMode === 'auto'
                ? _get_default_model_for_provider(chain[0]) || prev.model
                : prev.model,
          }));
        }
      } catch {
        setResonantProviders(null);
      }
    };

    loadProviders();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (error) {
          e.preventDefault();
          setError(null);
          return;
        }
      }

      if (activeTab !== 'create') return;

      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || '').toLowerCase();
      const isTextArea = tag === 'textarea';
      if (isTextArea) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        if (step < 6) {
          if (!requiredForStep(step)) return;
          e.preventDefault();
          setStep((s) => Math.min(6, s + 1));
        }
      }

      if (e.key === 'Enter' && e.shiftKey) {
        if (step > 1) {
          e.preventDefault();
          setStep((s) => Math.max(1, s - 1));
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, error, step, requiredForStep]);

  const canUseProvider = useCallback((providerId: string) => {
    const status = providerKeyStatus[providerId];
    if (!status) return true;
    return status === 'configured';
  }, [providerKeyStatus]);

  const providerCapsByKey = (resonantProviders?.providers || []).reduce<Record<string, string[]>>((acc, p) => {
    const key = _normalize_provider_id(p.provider_key || p.id);
    if (key) acc[key] = p.capabilities || [];
    return acc;
  }, {});

  const availableProviderIds = (resonantProviders?.providers || [])
    .filter((p) => p.available)
    .map((p) => _normalize_provider_id(p.provider_key || p.id));

  const visibleProviders = Object.entries(PROVIDERS)
    .filter(([id]) => id === 'local' || availableProviderIds.length === 0 || availableProviderIds.includes(id));

  const categorizedProviders = visibleProviders.reduce<Record<string, Array<[string, any]>>>((acc, entry) => {
    const [id] = entry;
    const caps = providerCapsByKey[id];
    const category = id === 'local' ? 'Local' : _category_for_capabilities(caps);
    if (!acc[category]) acc[category] = [];
    acc[category].push(entry);
    return acc;
  }, {});

  const requiredForStep = useCallback((s: number) => {
    if (s === 1) return Boolean(config.name.trim());
    if (s === 2) {
      if (config.routingMode === 'auto') return Boolean(config.fallbackChain?.length) && Boolean(config.model);
      if (!config.provider) return false;
      if (config.provider !== 'local' && !canUseProvider(config.provider)) return false;
      return Boolean(config.model);
    }
    return true;
  }, [config, canUseProvider]);

  const updateConfig = useCallback((updates: Partial<AdvancedConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const toggleTool = useCallback((toolId: string) => {
    setConfig(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(t => t !== toolId)
        : [...prev.tools, toolId]
    }));
  }, []);

  const applyTemplate = useCallback((template: typeof TEMPLATES[0]) => {
    setConfig(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      type: template.type,
      provider: template.provider,
      model: template.model,
      tools: template.tools,
    }));
    setActiveTab('create');
    setStep(2);
  }, []);

  // Backend API calls
  const createAgentAPI = async (agentData: any) => {
    return createAgentApi(agentData);
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/developer/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({ name: config.name, scopes: ['agent:read', 'agent:write'] }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.key);
        return data.key;
      }
    } catch (err) {
      console.error('Failed to generate API key:', err);
    }
    // Generate mock key for demo
    const mockKey = `rg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(mockKey);
    return mockKey;
  };

  const handleCreate = useCallback(async () => {
    if (!config.name.trim()) {
      setError('Agent name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const agentData = {
        name: config.name,
        description: config.description,
        system_prompt: config.systemPrompt,
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        tools: config.tools,
        safety_config: {
          provider: config.provider,
          topP: config.topP,
          frequencyPenalty: config.frequencyPenalty,
          presencePenalty: config.presencePenalty,
          tags: config.tags,
          routing: {
            mode: config.routingMode,
            fallback_chain: config.fallbackChain,
          },
          memoryConfig: {
            shortTermLimit: 10,
            longTermEnabled: config.memoryEnabled,
            vectorStoreEnabled: config.vectorStoreEnabled,
            contextWindow: config.contextWindow,
          },
          autonomyConfig: {
            canSpawnSubAgents: config.canSpawnSubAgents,
            canModifySelf: config.canModifySelf,
            canAccessNetwork: config.canAccessNetwork,
            canExecuteCode: config.canExecuteCode,
            maxConcurrentTasks: config.maxConcurrentTasks,
          },
          deployment: {
            environment: config.environment,
            autoScale: config.autoScale,
            minInstances: config.minInstances,
            maxInstances: config.maxInstances,
          },
          developer: {
            webhookUrl: config.webhookUrl,
            apiKeyEnabled: config.apiKeyEnabled,
            rateLimitPerMinute: config.rateLimitPerMinute,
          },
        },
      };

      // Create agent on backend (no local fallback)
      const response = await createAgentAPI(agentData);
      setCreatedAgentId(response.id);

      // Add to store
      const newAgent: Agent = {
        id: response.id,
        hash: response.manifest_hash || response.id,
        dsid: response.dsid || undefined,
        persisted: true,
        name: response.name,
        type: config.type,
        status: 'idle',
        mode: config.mode,
        version: String(response.version) + '.0.0',
        capabilities: config.tools,
        walletBalance: 100,
        riskLevel: 'low',
        utilityScore: 0,
        executions: 0,
        costToday: 0,
        pendingApprovals: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 'user-1',
        config: {
          provider: config.provider,
          model: config.model,
          systemPrompt: config.systemPrompt,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          tools: config.tools.map((toolId: string) => ({
            id: toolId,
            name: toolId,
            description: toolId,
            enabled: true,
          })),
          memoryConfig: {
            shortTermLimit: 10,
            longTermEnabled: config.memoryEnabled,
            vectorStoreEnabled: config.vectorStoreEnabled,
            contextWindow: config.contextWindow,
          },
          autonomyConfig: {
            canSpawnSubAgents: config.canSpawnSubAgents,
            canModifySelf: config.canModifySelf,
            canAccessNetwork: config.canAccessNetwork,
            canExecuteCode: config.canExecuteCode,
            maxConcurrentTasks: config.maxConcurrentTasks,
          },
        },
      };

      addAgent(newAgent);

      // Generate API key if enabled
      if (config.apiKeyEnabled) {
        await generateApiKey();
      }

      setCreatedAgentId(newAgent.id);
      setSuccess(`Agent "${config.name}" created successfully!`);

    } catch (err: any) {
      setError(err?.message || 'Agent was not created on server. Fix auth/API first.');
    } finally {
      setIsCreating(false);
    }
  }, [config, addAgent]);

  const handleImport = useCallback(() => {
    try {
      const data = JSON.parse(importData);
      if (data.name) {
        setConfig(prev => ({ ...prev, ...data }));
        setActiveTab('create');
        setSuccess('Configuration imported successfully!');
      }
    } catch {
      setError('Invalid JSON format');
    }
  }, [importData]);

  const handleExport = useCallback(() => {
    const exportData = JSON.stringify(config, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-config-${config.name || 'unnamed'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const handleReset = useCallback(() => {
    setSuccess(null);
    setCreatedAgentId(null);
    setStep(1);
    setConfig(prev => ({ ...prev, name: '', description: '', tools: [] }));
  }, []);

  const handlePublishToNetwork = useCallback(() => {
    if (createdAgentId) {
      // Navigate to network publish page with agent ID as query param
      window.location.href = `/network/publish?agentId=${createdAgentId}`;
    }
  }, [createdAgentId]);

  const getToolIcon = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      Search: <Icons.Search />,
      Code: <Icons.Code />,
      Folder: <Icons.Folder />,
      External: <Icons.External />,
      Database: <Icons.Database />,
      Mail: <Icons.Mail />,
      Calendar: <Icons.Calendar />,
      Image: <Icons.Image />,
      Mic: <Icons.Mic />,
      Eye: <Icons.Eye />,
    };
    return iconMap[iconName] || <Icons.Zap />;
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      {/* Status Messages */}
      {error && (
        <div className={styles.errorBanner}>
          <Icons.XCircle /> {error}
          <button onClick={() => setError(null)}><Icons.X /></button>
        </div>
      )}
      {success && (
        <div className={styles.successBanner}>
          <Icons.CheckCircle /> {success}
          {createdAgentId && (
            <div className={styles.successActions}>
              <button className={styles.publishNetworkBtn} onClick={handlePublishToNetwork}>
                <Icons.Upload /> Publish to Network
              </button>
              <button className={styles.createAnotherBtn} onClick={handleReset}>
                <Icons.Plus /> Create Another
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.panelBody}>
        <aside className={styles.navColumn}>
          <div className={styles.navHeader}>
            <div className={styles.navTitle}>Agent Factory</div>
            <div className={styles.navSubtitle}>Guided build flow</div>
          </div>

          <div className={styles.navSection}>
            <button
              className={`${styles.navItem} ${activeTab === 'templates' ? styles.active : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              <span className={styles.navItemIcon}><Icons.Grid /></span>
              <span className={styles.navItemLabel}>Templates</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'import' ? styles.active : ''}`}
              onClick={() => setActiveTab('import')}
            >
              <span className={styles.navItemIcon}><Icons.Upload /></span>
              <span className={styles.navItemLabel}>Import</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'developer' ? styles.active : ''}`}
              onClick={() => setActiveTab('developer')}
            >
              <span className={styles.navItemIcon}><Icons.Code /></span>
              <span className={styles.navItemLabel}>Developer</span>
            </button>
          </div>

          <div className={styles.navDivider} />

          <div className={styles.navSectionTitle}>Create</div>
          <div className={styles.navSection}>
            {[
              { num: 1, label: 'Identity', icon: <Icons.User /> },
              { num: 2, label: 'AI Model', icon: <Icons.Brain /> },
              { num: 3, label: 'Tools', icon: <Icons.Zap /> },
              { num: 4, label: 'Memory', icon: <Icons.Database /> },
              { num: 5, label: 'Autonomy', icon: <Icons.Lock /> },
              { num: 6, label: 'Deploy', icon: <Icons.Upload /> },
            ].map((s) => (
              <button
                key={s.num}
                className={`${styles.stepNavItem} ${activeTab === 'create' && step === s.num ? styles.active : ''} ${step > s.num ? styles.completed : ''}`}
                onClick={() => {
                  setActiveTab('create');
                  setStep(s.num);
                }}
              >
                <span className={styles.stepNavIcon}>{step > s.num ? <Icons.Check /> : s.icon}</span>
                <span className={styles.stepNavLabel}>{s.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className={styles.panelContent}>
          <div className={styles.contentColumn}>
          {/* Create Tab */}
          {activeTab === 'create' && (
            <div className={styles.createSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepHeaderTitle}>
                Step {step} of 6
              </div>
              <div className={styles.stepHeaderSummary}>
                <span className={styles.summaryChip}>{config.name.trim() ? config.name.trim() : 'Unnamed agent'}</span>
                <span className={styles.summaryChip}>{config.routingMode === 'auto' ? 'Auto routing' : config.provider || 'No provider'}</span>
                <span className={styles.summaryChip}>{config.model || 'No model'}</span>
              </div>
            </div>
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className={styles.formSection}>
                <h3><Icons.User /> Agent Identity</h3>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Agent Name *</label>
                    <input
                      value={config.name}
                      onChange={e => updateConfig({ name: e.target.value })}
                      placeholder="e.g., Research-Agent-01"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Agent Type</label>
                    <select value={config.type} onChange={e => updateConfig({ type: e.target.value })}>
                      <option value="executor">Executor</option>
                      <option value="planner">Planner</option>
                      <option value="researcher">Researcher</option>
                      <option value="coder">Coder</option>
                      <option value="negotiator">Negotiator</option>
                      <option value="verifier">Verifier</option>
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Description</label>
                  <textarea
                    value={config.description}
                    onChange={e => updateConfig({ description: e.target.value })}
                    placeholder="Describe what this agent does..."
                    rows={3}
                  />
                </div>
                <div className={styles.field}>
                  <label>Autonomy Mode</label>
                  <div className={styles.modeSelector}>
                    <button
                      className={`${styles.modeBtn} ${config.mode === 'governed' ? styles.active : ''}`}
                      onClick={() => updateConfig({ mode: 'governed' })}
                    >
                      <Icons.Lock /> Governed
                      <span>Requires approval for sensitive actions</span>
                    </button>
                    <button
                      className={`${styles.modeBtn} ${config.mode === 'unbounded' ? styles.active : ''}`}
                      onClick={() => updateConfig({ mode: 'unbounded' })}
                    >
                      <Icons.Unlock /> Unbounded
                      <span>Full autonomy, no restrictions</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: AI Model */}
            {step === 2 && (
              <div className={styles.formSection}>
                <h3><Icons.Brain /> AI Model Configuration</h3>

                {resonantProviders?.message && (
                  <div className={styles.providerNotice}>
                    {resonantProviders.message}
                  </div>
                )}

                <div className={styles.routingRow}>
                  <div className={styles.routingLabel}>Smart routing</div>
                  <div className={styles.routingOptions}>
                    <button
                      type="button"
                      className={`${styles.routingBtn} ${config.routingMode === 'auto' ? styles.active : ''}`}
                      onClick={() => {
                        const primary = (config.fallbackChain?.[0] || 'groq');
                        updateConfig({
                          routingMode: 'auto',
                          provider: primary,
                          model: _get_default_model_for_provider(primary) || config.model,
                        });
                      }}
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      className={`${styles.routingBtn} ${config.routingMode === 'manual' ? styles.active : ''}`}
                      onClick={() => updateConfig({ routingMode: 'manual' })}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      className={`${styles.routingBtn} ${config.routingMode === 'fallback' ? styles.active : ''}`}
                      onClick={() => updateConfig({ routingMode: 'fallback' })}
                    >
                      Fallback chain
                    </button>
                  </div>
                </div>

                {config.routingMode !== 'manual' && (
                  <div className={styles.fallbackChainRow}>
                    <div className={styles.fallbackChainLabel}>Fallback order</div>
                    <div className={styles.fallbackChainChips}>
                      {(config.fallbackChain || []).map((p) => (
                        <span key={p} className={styles.fallbackChip}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.providerGrid}>
                  {Object.entries(categorizedProviders).map(([category, entries]) => (
                    <div key={category} className={styles.providerGroup}>
                      <div className={styles.providerGroupTitle}>{category}</div>
                      <div className={styles.providerGroupGrid}>
                        {entries.map(([key, provider]) => (
                          <button
                            key={key}
                            className={`${styles.providerCard} ${config.provider === key ? styles.active : ''}`}
                            onClick={() => {
                              if (config.routingMode !== 'manual') {
                                setError('Switch routing to Manual to select a specific provider.');
                                return;
                              }
                              if (key !== 'local' && !canUseProvider(key)) {
                                setError(`No API key configured for ${provider.name}. Add one in Profile → API Keys.`);
                                return;
                              }
                              updateConfig({ provider: key, model: provider.models[0] });
                            }}
                          >
                            <Icons.Zap />
                            <span>{provider.name}</span>
                            {providerKeyStatus[key] === 'configured' && (
                              <span className={styles.providerBadgeConfigured}>Configured</span>
                            )}
                            {providerKeyStatus[key] === 'missing' && key !== 'local' && (
                              <span className={styles.providerBadgeMissing}>Add Key</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.providerHintRow}>
                  <span className={styles.providerHintText}>Providers marked “Add Key” require BYOK.</span>
                  <a className={styles.manageKeysLink} href="/profile">Manage API Keys</a>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Model</label>
                    <select value={config.model} onChange={e => updateConfig({ model: e.target.value })}>
                      {(PROVIDERS[config.provider as keyof typeof PROVIDERS]?.models || []).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Context Window</label>
                    <select value={config.contextWindow} onChange={e => updateConfig({ contextWindow: parseInt(e.target.value) })}>
                      <option value={4096}>4K tokens</option>
                      <option value={8192}>8K tokens</option>
                      <option value={16384}>16K tokens</option>
                      <option value={32768}>32K tokens</option>
                      <option value={128000}>128K tokens</option>
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>System Prompt</label>
                  <textarea
                    value={config.systemPrompt}
                    onChange={e => updateConfig({ systemPrompt: e.target.value })}
                    placeholder="You are a helpful AI assistant specialized in..."
                    rows={5}
                  />
                </div>
                <div className={styles.paramGrid}>
                  <div className={styles.paramField}>
                    <label>Temperature: {config.temperature}</label>
                    <input type="range" min="0" max="2" step="0.1" value={config.temperature} onChange={e => updateConfig({ temperature: parseFloat(e.target.value) })} />
                  </div>
                  <div className={styles.paramField}>
                    <label>Max Tokens: {config.maxTokens}</label>
                    <input type="range" min="256" max="32768" step="256" value={config.maxTokens} onChange={e => updateConfig({ maxTokens: parseInt(e.target.value) })} />
                  </div>
                  <div className={styles.paramField}>
                    <label>Top P: {config.topP}</label>
                    <input type="range" min="0" max="1" step="0.1" value={config.topP} onChange={e => updateConfig({ topP: parseFloat(e.target.value) })} />
                  </div>
                  <div className={styles.paramField}>
                    <label>Frequency Penalty: {config.frequencyPenalty}</label>
                    <input type="range" min="0" max="2" step="0.1" value={config.frequencyPenalty} onChange={e => updateConfig({ frequencyPenalty: parseFloat(e.target.value) })} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Tools */}
            {step === 3 && (
              <div className={styles.formSection}>
                <h3><Icons.Zap /> Tools & Capabilities</h3>
                <p className={styles.sectionDesc}>Select the tools this agent can use</p>
                <div className={styles.toolsGrid}>
                  {TOOLS.map(tool => (
                    <button
                      key={tool.id}
                      className={`${styles.toolCard} ${config.tools.includes(tool.id) ? styles.active : ''}`}
                      onClick={() => toggleTool(tool.id)}
                    >
                      <div className={styles.toolIcon}>{getToolIcon(tool.icon)}</div>
                      <div className={styles.toolInfo}>
                        <span className={styles.toolName}>{tool.name}</span>
                        <span className={styles.toolDesc}>{tool.description}</span>
                      </div>
                      {config.tools.includes(tool.id) && <Icons.CheckCircle />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Memory */}
            {step === 4 && (
              <div className={styles.formSection}>
                <h3><Icons.Database /> Memory Configuration</h3>
                <div className={styles.toggleGrid}>
                  <label className={styles.toggleItem}>
                    <input type="checkbox" checked={config.memoryEnabled} onChange={e => updateConfig({ memoryEnabled: e.target.checked })} />
                    <span className={styles.toggleLabel}>
                      <strong>Long-term Memory</strong>
                      <span>Persist information across sessions</span>
                    </span>
                  </label>
                  <label className={styles.toggleItem}>
                    <input type="checkbox" checked={config.vectorStoreEnabled} onChange={e => updateConfig({ vectorStoreEnabled: e.target.checked })} />
                    <span className={styles.toggleLabel}>
                      <strong>Vector Store</strong>
                      <span>Enable semantic search over memories</span>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 5: Autonomy */}
            {step === 5 && (
              <div className={styles.formSection}>
                <h3><Icons.Lock /> Autonomy Settings</h3>
                <div className={styles.toggleGrid}>
                  <label className={styles.toggleItem}>
                    <input type="checkbox" checked={config.canSpawnSubAgents} onChange={e => updateConfig({ canSpawnSubAgents: e.target.checked })} />
                    <span className={styles.toggleLabel}>
                      <strong>Spawn Sub-Agents</strong>
                      <span>Create child agents for subtasks</span>
                    </span>
                  </label>
                  <label className={styles.toggleItem}>
                    <input type="checkbox" checked={config.canAccessNetwork} onChange={e => updateConfig({ canAccessNetwork: e.target.checked })} />
                    <span className={styles.toggleLabel}>
                      <strong>Network Access</strong>
                      <span>Make external API calls</span>
                    </span>
                  </label>
                  <label className={styles.toggleItem}>
                    <input type="checkbox" checked={config.canExecuteCode} onChange={e => updateConfig({ canExecuteCode: e.target.checked })} />
                    <span className={styles.toggleLabel}>
                      <strong>Code Execution</strong>
                      <span>Run code in sandbox</span>
                    </span>
                  </label>
                </div>
                <div className={styles.field}>
                  <label>Max Concurrent Tasks: {config.maxConcurrentTasks}</label>
                  <input type="range" min="1" max="20" value={config.maxConcurrentTasks} onChange={e => updateConfig({ maxConcurrentTasks: parseInt(e.target.value) })} />
                </div>
              </div>
            )}

            {/* Step 6: Deploy */}
            {step === 6 && (
              <div className={styles.formSection}>
                <h3><Icons.Upload /> Review & Deploy</h3>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewSection}>
                    <h4>Agent Details</h4>
                    <div className={styles.reviewRow}><span>Name:</span><strong>{config.name || 'Unnamed'}</strong></div>
                    <div className={styles.reviewRow}><span>Type:</span><strong>{config.type}</strong></div>
                    <div className={styles.reviewRow}><span>Mode:</span><strong>{config.mode}</strong></div>
                  </div>
                  <div className={styles.reviewSection}>
                    <h4>AI Model</h4>
                    <div className={styles.reviewRow}><span>Provider:</span><strong>{config.provider}</strong></div>
                    <div className={styles.reviewRow}><span>Model:</span><strong>{config.model}</strong></div>
                    <div className={styles.reviewRow}><span>Temperature:</span><strong>{config.temperature}</strong></div>
                  </div>
                  <div className={styles.reviewSection}>
                    <h4>Tools ({config.tools.length})</h4>
                    <div className={styles.toolTags}>
                      {config.tools.map(t => <span key={t} className={styles.toolTag}>{t}</span>)}
                      {config.tools.length === 0 && <span className={styles.noTools}>No tools selected</span>}
                    </div>
                  </div>
                </div>
                <div className={styles.deployOptions}>
                  <div className={styles.field}>
                    <label>Environment</label>
                    <select value={config.environment} onChange={e => updateConfig({ environment: e.target.value as any })}>
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  <label className={styles.toggleItem}>
                    <input type="checkbox" checked={config.apiKeyEnabled} onChange={e => updateConfig({ apiKeyEnabled: e.target.checked })} />
                    <span className={styles.toggleLabel}>
                      <strong>Generate API Key</strong>
                      <span>For programmatic access</span>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={styles.formNav}>
              {step > 1 && (
                <button className={styles.backBtn} onClick={() => setStep(step - 1)}>
                  <Icons.ChevronLeft /> Back
                </button>
              )}
              <button className={styles.exportBtn} onClick={handleExport}>
                <Icons.Download /> Export Config
              </button>
              {step < 6 ? (
                <button className={styles.nextBtn} onClick={() => setStep(step + 1)}
                  disabled={!requiredForStep(step)}
                >
                  Next <Icons.ChevronRight />
                </button>
              ) : (
                <button 
                  className={styles.createBtn} 
                  onClick={handleCreate}
                  disabled={!config.name.trim() || isCreating}
                >
                  {isCreating ? (
                    <><Icons.Refresh /> Creating...</>
                  ) : (
                    <><Icons.Plus /> Create Agent</>
                  )}
                </button>
              )}
            </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className={styles.templatesSection}>
              <h3>Agent Templates</h3>
              <p className={styles.sectionDesc}>Start with a pre-configured template</p>
              <div className={styles.templatesGrid}>
                {TEMPLATES.map(template => (
                  <div key={template.id} className={styles.templateCard} onClick={() => applyTemplate(template)}>
                    <div className={styles.templateHeader}>
                      <Icons.Agents />
                      <h4>{template.name}</h4>
                    </div>
                    <p>{template.description}</p>
                    <div className={styles.templateMeta}>
                      <span>{template.provider}</span>
                      <span>{template.model}</span>
                    </div>
                    <div className={styles.templateTools}>
                      {template.tools.map(t => <span key={t}>{t}</span>)}
                    </div>
                    <button className={styles.useTemplateBtn}>Use Template</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className={styles.importSection}>
              <h3>Import/Export Configuration</h3>
              <div className={styles.importArea}>
                <label>Paste JSON Configuration</label>
                <textarea
                  value={importData}
                  onChange={e => setImportData(e.target.value)}
                  placeholder='{"name": "My Agent", "type": "executor", ...}'
                  rows={10}
                />
                <div className={styles.importActions}>
                  <button className={styles.importBtn} onClick={handleImport}>
                    <Icons.Upload /> Import
                  </button>
                  <button className={styles.exportBtn} onClick={handleExport}>
                    <Icons.Download /> Export Current
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Developer Tab */}
          {activeTab === 'developer' && (
            <div className={styles.developerSection}>
              <h3><Icons.Code /> Developer Tools</h3>
              
              <div className={styles.devCard}>
                <h4>API Key Management</h4>
                <p>Generate API keys for programmatic agent access</p>
                <div className={styles.apiKeySection}>
                  {apiKey ? (
                    <div className={styles.apiKeyDisplay}>
                      <input 
                        type={showApiKey ? 'text' : 'password'} 
                        value={apiKey} 
                        readOnly 
                      />
                      <button onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(apiKey)}>
                        <Icons.Copy />
                      </button>
                    </div>
                  ) : (
                    <button className={styles.generateKeyBtn} onClick={generateApiKey}>
                      <Icons.Key /> Generate API Key
                    </button>
                  )}
                </div>
              </div>

            <div className={styles.devCard}>
              <h4>Webhook Configuration</h4>
              <p>Receive real-time notifications for agent events</p>
              <div className={styles.field}>
                <label>Webhook URL</label>
                <input
                  type="url"
                  value={config.webhookUrl}
                  onChange={e => updateConfig({ webhookUrl: e.target.value })}
                  placeholder="https://your-server.com/webhook"
                />
              </div>
              <div className={styles.webhookEvents}>
                <label><input type="checkbox" defaultChecked /> agent.created</label>
                <label><input type="checkbox" defaultChecked /> agent.started</label>
                <label><input type="checkbox" defaultChecked /> execution.completed</label>
                <label><input type="checkbox" /> execution.failed</label>
              </div>
            </div>

            <div className={styles.devCard}>
              <h4>SDK & Documentation</h4>
              <div className={styles.sdkLinks}>
                <a href="#" className={styles.sdkLink}>
                  <Icons.Code /> Python SDK
                </a>
                <a href="#" className={styles.sdkLink}>
                  <Icons.Code /> JavaScript SDK
                </a>
                <a href="#" className={styles.sdkLink}>
                  <Icons.External /> API Documentation
                </a>
                <a href="#" className={styles.sdkLink}>
                  <Icons.External /> OpenAPI Spec
                </a>
              </div>
            </div>

            <div className={styles.devCard}>
              <h4>Rate Limiting</h4>
              <div className={styles.field}>
                <label>Requests per minute: {config.rateLimitPerMinute}</label>
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  step="10"
                  value={config.rateLimitPerMinute} 
                  onChange={e => updateConfig({ rateLimitPerMinute: parseInt(e.target.value) })} 
                />
              </div>
            </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdvancedFactory = memo(AdvancedFactoryComponent);
export default AdvancedFactory;
