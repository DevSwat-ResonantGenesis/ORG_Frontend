import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { useAgentStore } from '../../../../../stores/agentStore';
import { Icons } from '../../shared/Icons';
import type { Agent } from '../../../../../types';
import {
  createAgent as createAgentApi,
  createCustomTool as createCustomToolApi,
  deleteCustomTool as deleteCustomToolApi,
  getAgentProvidersCatalog,
  listCustomTools,
} from '../../../../../api/agents';
import type { ProviderCatalogProvider, AgentProvidersCatalogResponse } from '../../../../../api/agents';
import { fetchUserApiKeys } from '../../../../../api/userApiKeys';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './AdvancedFactory.module.css';

// ============== ADVANCED AGENT FACTORY ==============
// Full-featured agent creation with backend integration

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
  toolMode: 'smart' | 'manual';
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

  walletEnabled: boolean;
  walletInitialBalance: number;
  walletDailyLimit: number;
  walletTransactionLimit: number;
  walletMonthlyLimit: number;
  
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

// Fallback provider map — used only when dynamic catalog fetch fails
const FALLBACK_PROVIDERS_MAP: Record<string, { name: string; models: string[]; icon: string }> = {
  groq: { name: 'Groq', models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'], icon: 'Zap' },
  openai: { name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'], icon: 'Zap' },
  anthropic: { name: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'], icon: 'Brain' },
  google: { name: 'Gemini', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'], icon: 'Globe' },
  local: { name: 'Local', models: ['llama3.1:8b', 'codellama:13b', 'mistral:7b'], icon: 'Server' },
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

const _get_default_model_for_provider = (providerId: string, providersMap: Record<string, { name: string; models: string[]; icon: string }>): string => {
  const provider = providersMap[providerId];
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
    toolMode: 'manual',
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

    walletEnabled: true,
    walletInitialBalance: 0,
    walletDailyLimit: 100,
    walletTransactionLimit: 50,
    walletMonthlyLimit: 1000,
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

  const [resonantProviders, setResonantProviders] = useState<AgentProvidersCatalogResponse | null>(null);

  const [providerKeyStatus, setProviderKeyStatus] = useState<Record<string, 'configured' | 'missing' | 'unknown'>>({});

  const [customTools, setCustomTools] = useState<Array<{ id: string; name: string; display_name?: string | null; description?: string | null; category?: string | null; parameters_schema?: Record<string, any> | null; handler_type?: string | null; handler_config?: Record<string, any> | null; risk_level?: string; requires_approval?: boolean | null; is_active?: boolean }>>([]);
  const [availableTools, setAvailableTools] = useState<Array<{ id: string; name: string; display_name?: string | null; description?: string | null; category?: string | null; parameters_schema?: Record<string, any> | null; handler_type?: string | null; handler_config?: Record<string, any> | null; risk_level?: string; requires_approval?: boolean | null; is_active?: boolean }>>([]);
  const [isLoadingAvailableTools, setIsLoadingAvailableTools] = useState(false);
  const [toolSearch, setToolSearch] = useState('');
  const [toolCategoryFilter, setToolCategoryFilter] = useState<string>('all');
  const [toolRiskFilter, setToolRiskFilter] = useState<string>('all');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [toolDetails, setToolDetails] = useState<null | {
    id: string;
    name: string;
    display_name?: string | null;
    description?: string | null;
    category?: string | null;
    parameters_schema?: Record<string, any> | null;
    handler_type?: string | null;
    handler_config?: Record<string, any> | null;
    risk_level?: string;
    requires_approval?: boolean | null;
    is_active?: boolean;
  }>(null);
  const [newToolName, setNewToolName] = useState('');
  const [newToolUrl, setNewToolUrl] = useState('');
  const [newToolDescription, setNewToolDescription] = useState('');
  const [newToolMethod, setNewToolMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('POST');
  const [newToolRiskLevel, setNewToolRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newToolRequiresApproval, setNewToolRequiresApproval] = useState(true);
  const [newToolParametersSchema, setNewToolParametersSchema] = useState('');
  const [isCreatingTool, setIsCreatingTool] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);

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
        // Check all known provider IDs (from catalog or fallback)
        const allIds = resonantProviders?.providers?.length
          ? resonantProviders.providers.map(p => _normalize_provider_id(p.provider_key || p.id))
          : Object.keys(FALLBACK_PROVIDERS_MAP);
        for (const id of allIds) {
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
        const data = await getAgentProvidersCatalog();
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
                ? _get_default_model_for_provider(chain[0], FALLBACK_PROVIDERS_MAP) || prev.model
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
    const loadCustomTools = async () => {
      try {
        const tools = await listCustomTools();
        setCustomTools(
          (tools || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            display_name: t.display_name,
            description: t.description,
            category: t.category,
            parameters_schema: t.parameters_schema,
            handler_type: t.handler_type,
            handler_config: t.handler_config,
            risk_level: t.risk_level,
            requires_approval: t.requires_approval,
            is_active: t.is_active,
          }))
        );
      } catch {
        setCustomTools([]);
      }
    };
    loadCustomTools();
  }, []);

  const refreshAvailableTools = useCallback(async () => {
    setIsLoadingAvailableTools(true);
    try {
      const tools = await fastapiClient.get('/api/v1/agents/tools');
      const list = Array.isArray((tools.data as any)) ? (tools.data as any[]) : [];
      setAvailableTools(
        list.map((t: any) => ({
          id: t.id,
          name: t.name,
          display_name: t.display_name,
          description: t.description,
          category: t.category,
          parameters_schema: t.parameters_schema,
          handler_type: t.handler_type,
          handler_config: t.handler_config,
          risk_level: t.risk_level,
          requires_approval: t.requires_approval,
          is_active: t.is_active,
        }))
      );
    } catch {
      setAvailableTools([]);
    } finally {
      setIsLoadingAvailableTools(false);
    }
  }, []);

  const availableToolCategories = useMemo(() => {
    const set = new Set<string>();
    for (const t of availableTools) {
      if (t.category) set.add(t.category);
    }
    return Array.from(set).sort();
  }, [availableTools]);

  const filteredAvailableTools = useMemo(() => {
    const q = toolSearch.trim().toLowerCase();
    return availableTools
      .filter((t) => t.is_active !== false)
      .filter((t) => {
        if (toolCategoryFilter !== 'all' && (t.category || '') !== toolCategoryFilter) return false;
        if (toolRiskFilter !== 'all' && (t.risk_level || '') !== toolRiskFilter) return false;
        if (showSelectedOnly && !config.tools.includes(t.name)) return false;
        if (!q) return true;
        const label = (t.display_name || t.name || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        return label.includes(q) || desc.includes(q);
      });
  }, [availableTools, config.tools, showSelectedOnly, toolCategoryFilter, toolRiskFilter, toolSearch]);

  useEffect(() => {
    refreshAvailableTools();
  }, [refreshAvailableTools]);

  useEffect(() => {
    if (!toolDetails) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setToolDetails(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toolDetails]);

  const refreshCustomTools = useCallback(async () => {
    try {
      const tools = await listCustomTools();
      setCustomTools(
        (tools || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          display_name: t.display_name,
          description: t.description,
          category: t.category,
          parameters_schema: t.parameters_schema,
          handler_type: t.handler_type,
          handler_config: t.handler_config,
          risk_level: t.risk_level,
          requires_approval: t.requires_approval,
          is_active: t.is_active,
        }))
      );
    } catch {
      setCustomTools([]);
    }
  }, []);

  const startEditCustomTool = useCallback((t: { id: string; name: string; description?: string | null; handler_config?: Record<string, any> | null; risk_level?: string; requires_approval?: boolean | null; parameters_schema?: Record<string, any> | null }) => {
    setEditingToolId(t.id);
    setNewToolName(t.name);
    setNewToolDescription(t.description || '');
    const url = (t.handler_config as any)?.url;
    const method = (t.handler_config as any)?.method;
    setNewToolUrl(typeof url === 'string' ? url : '');
    setNewToolMethod((['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).includes(method) ? method : 'POST');
    setNewToolRiskLevel((['low', 'medium', 'high', 'critical'] as const).includes(t.risk_level as any) ? (t.risk_level as any) : 'medium');
    setNewToolRequiresApproval(Boolean(t.requires_approval));
    setNewToolParametersSchema(t.parameters_schema ? JSON.stringify(t.parameters_schema, null, 2) : '');
    setError(null);
  }, []);

  const cancelEditCustomTool = useCallback(() => {
    setEditingToolId(null);
    setNewToolName('');
    setNewToolUrl('');
    setNewToolDescription('');
    setNewToolParametersSchema('');
    setNewToolMethod('POST');
    setNewToolRiskLevel('medium');
    setNewToolRequiresApproval(true);
    setError(null);
  }, []);

  const handleCreateCustomTool = useCallback(async () => {
    if (!newToolName.trim()) {
      setError('Tool name is required');
      return;
    }
    if (!newToolUrl.trim()) {
      setError('Tool URL is required');
      return;
    }

    // Validate URL format
    try {
      // eslint-disable-next-line no-new
      new URL(newToolUrl.trim());
    } catch {
      setError('Tool URL must be a valid URL');
      return;
    }

    let parsedSchema: Record<string, any> | undefined;
    if (newToolParametersSchema.trim()) {
      try {
        parsedSchema = JSON.parse(newToolParametersSchema);
      } catch {
        setError('Parameters schema must be valid JSON');
        return;
      }
    }

    setIsCreatingTool(true);
    setError(null);
    try {
      await createCustomToolApi({
        name: newToolName.trim(),
        description: newToolDescription.trim() || undefined,
        category: 'custom',
        parameters_schema: parsedSchema,
        handler_type: 'http',
        handler_config: {
          url: newToolUrl.trim(),
          method: newToolMethod,
        },
        risk_level: newToolRiskLevel,
        requires_approval: newToolRequiresApproval,
      });
      setNewToolName('');
      setNewToolUrl('');
      setNewToolDescription('');
      setNewToolParametersSchema('');
      setNewToolMethod('POST');
      setNewToolRiskLevel('medium');
      setNewToolRequiresApproval(true);
      await refreshCustomTools();
      await refreshAvailableTools();
      setSuccess(editingToolId ? 'Custom tool updated' : 'Custom tool created');
      setEditingToolId(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to create custom tool');
    } finally {
      setIsCreatingTool(false);
    }
  }, [editingToolId, newToolDescription, newToolMethod, newToolName, newToolParametersSchema, newToolRequiresApproval, newToolRiskLevel, newToolUrl, refreshAvailableTools, refreshCustomTools]);

  const handleDeleteCustomTool = useCallback(async (toolId: string) => {
    const tool = customTools.find((t) => t.id === toolId);
    const label = tool?.display_name || tool?.name || toolId;
    const ok = window.confirm(`Delete custom tool "${label}"?`);
    if (!ok) return;

    if (editingToolId === toolId) {
      cancelEditCustomTool();
    }

    setError(null);
    try {
      await deleteCustomToolApi(toolId);
      await refreshCustomTools();
      await refreshAvailableTools();
      setSuccess('Custom tool deleted');
    } catch (e: any) {
      setError(e?.message || 'Failed to delete custom tool');
    }
  }, [cancelEditCustomTool, customTools, editingToolId, refreshAvailableTools, refreshCustomTools]);

  const canUseProvider = useCallback((providerId: string) => {
    const status = providerKeyStatus[providerId];
    if (!status) return true;
    return status === 'configured';
  }, [providerKeyStatus]);

  // Build dynamic providers map from the backend catalog, falling back to hardcoded map
  const dynamicProvidersMap = useMemo<Record<string, { name: string; models: string[]; icon: string }>>(() => {
    if (!resonantProviders?.providers?.length) return { ...FALLBACK_PROVIDERS_MAP };
    const map: Record<string, { name: string; models: string[]; icon: string }> = {};
    for (const p of resonantProviders.providers) {
      const key = _normalize_provider_id(p.provider_key || p.id);
      const fallback = FALLBACK_PROVIDERS_MAP[key];
      map[key] = {
        name: p.name || fallback?.name || key,
        models: p.models?.length ? p.models : (fallback?.models || [p.model || '']),
        icon: fallback?.icon || 'Zap',
      };
    }
    return map;
  }, [resonantProviders]);

  const providerCapsByKey = (resonantProviders?.providers || []).reduce<Record<string, string[]>>((acc, p) => {
    const key = _normalize_provider_id(p.provider_key || p.id);
    if (key) acc[key] = p.capabilities || [];
    return acc;
  }, {});

  const providerMetaByKey = (resonantProviders?.providers || []).reduce<Record<string, ProviderCatalogProvider>>((acc, p) => {
    const key = _normalize_provider_id(p.provider_key || p.id);
    if (key) acc[key] = p;
    return acc;
  }, {});

  const availableProviderIds = (resonantProviders?.providers || [])
    .filter((p) => p.available)
    .map((p) => _normalize_provider_id(p.provider_key || p.id));

  const visibleProviders = Object.entries(dynamicProvidersMap)
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
  }, []);

  // Backend API calls
  const createAgentAPI = async (agentData: any) => {
    return createAgentApi(agentData);
  };

  const generateApiKey = async () => {
    try {
      const res = await fastapiClient.post('/api/v1/developer/keys', {
        name: config.name || 'Agent Key',
        scopes: ['agent:read', 'agent:write'],
      });
      const key = (res.data as any)?.key;
      if (!key) {
        throw new Error('API key generation returned no key');
      }
      setApiKey(key);
      return key;
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to generate API key';
      setError(message);
      throw new Error(message);
    }
  };

  const handleCreate = useCallback(async () => {
    if (!config.name.trim()) {
      setError('Agent name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const allowedActions: string[] = [];
      const blockedActions: string[] = [];

      if (config.canAccessNetwork) allowedActions.push('network_access');
      else blockedActions.push('network_access');

      if (config.canExecuteCode) allowedActions.push('code_execution');
      else blockedActions.push('code_execution');

      if (config.canSpawnSubAgents) allowedActions.push('spawn_sub_agents');
      else blockedActions.push('spawn_sub_agents');

      if (config.canModifySelf) allowedActions.push('modify_self');
      else blockedActions.push('modify_self');

      const agentData = {
        name: config.name,
        type: config.type,
        description: config.description,
        system_prompt: config.systemPrompt,
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        tool_mode: config.toolMode,
        tools: config.toolMode === 'smart' ? [] : config.tools,
        allowed_actions: allowedActions,
        blocked_actions: blockedActions,
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

      const postCreateErrors: string[] = [];

      try {
        await fastapiClient.post(`/api/v1/autonomy/mode/${response.id}`, {
          mode: config.mode,
          reason: 'factory',
        });
      } catch (e: any) {
        const detail = e?.response?.data?.detail;
        const message = typeof detail === 'string' ? detail : e?.message;
        postCreateErrors.push(`Autonomy mode: ${message || 'failed to set mode'}`);
      }

      if (config.walletEnabled) {
        const toNum = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
        const initial_balance = toNum(config.walletInitialBalance);
        const daily_limit = toNum(config.walletDailyLimit);
        const transaction_limit = toNum(config.walletTransactionLimit);
        const monthly_limit = toNum(config.walletMonthlyLimit);

        if ([initial_balance, daily_limit, transaction_limit, monthly_limit].some((x) => !Number.isFinite(x) || x < 0)) {
          postCreateErrors.push('Wallet limits: invalid values');
        } else {
          try {
            await fastapiClient.post(`/api/v1/wallets/${response.id}`, {
              initial_balance,
              daily_limit,
              transaction_limit,
              monthly_limit,
            });
          } catch (e: any) {
            const detail = e?.response?.data?.detail;
            const message = typeof detail === 'string' ? detail : e?.message;
            postCreateErrors.push(`Wallet: ${message || 'failed to create wallet'}`);
          }
        }
      }

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
        walletBalance: 0,
        riskLevel: 'low',
        utilityScore: 0,
        executions: 0,
        costToday: 0,
        pendingApprovals: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: '',
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
      if (postCreateErrors.length > 0) {
        setError(`Agent created, but setup failed: ${postCreateErrors.join(' | ')}`);
      } else {
        setSuccess(`Agent "${config.name}" created successfully!`);
      }

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

  const getTemplateIcon = (templateType: string) => {
    if (templateType === 'coder') return <Icons.Code />;
    if (templateType === 'planner') return <Icons.List />;
    if (templateType === 'researcher') return <Icons.Search />;
    return <Icons.Agents />;
  };

  const templateAccent = (providerId: string) => {
    const p = (providerId || '').toLowerCase();
    if (p.includes('anthropic')) return '#a855f7';
    if (p.includes('openai')) return '#3b82f6';
    if (p.includes('google') || p.includes('gemini')) return '#10b981';
    if (p.includes('groq')) return '#f59e0b';
    return '#0ea5e9';
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
        <div className={styles.panelContent}>
          <div className={styles.contentColumn}>
            <div className={styles.stepHeader}>
              <div className={styles.stepHeaderTitle}>
                AGENT FACTORY
              </div>
              <div className={styles.stepHeaderSummary}>
                <span className={styles.summaryChip}>{config.name.trim() ? config.name.trim() : 'Unnamed agent'}</span>
                <span className={styles.summaryChip}>{config.routingMode === 'auto' ? 'Auto routing' : config.provider || 'No provider'}</span>
                <span className={styles.summaryChip}>{config.model || 'No model'}</span>
              </div>
            </div>

            <div className={styles.templatesSection}>
              <h3>Agent Templates</h3>
              <p className={styles.sectionDesc}>Start with a pre-configured template</p>
              <div className={styles.templatesGrid}>
                {TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={styles.templateCard}
                    style={{ ['--card-color' as any]: templateAccent(template.provider) } as any}
                    onClick={() => applyTemplate(template)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.templateIcon} style={{ background: templateAccent(template.provider) }}>
                        {getTemplateIcon(template.type)}
                      </div>
                      <div className={styles.cardInfo}>
                        <h3>{template.name}</h3>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <p>{template.description}</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <button className={styles.useTemplateBtn} type="button" onClick={() => applyTemplate(template)}>Use Template</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.createSection}>
            {/* Step 1: Identity */}
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
                      <div className={styles.modeBtnTop}>
                        <Icons.Lock /> Governed
                      </div>
                      <div className={styles.modeBtnDesc}>Requires approval for sensitive actions</div>
                    </button>
                    <button
                      className={`${styles.modeBtn} ${config.mode === 'unbounded' ? styles.active : ''}`}
                      onClick={() => updateConfig({ mode: 'unbounded' })}
                    >
                      <div className={styles.modeBtnTop}>
                        <Icons.Unlock /> Unbounded
                      </div>
                      <div className={styles.modeBtnDesc}>Full autonomy, no restrictions</div>
                    </button>
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
              </div>

            {/* Step 2: AI Model */}
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
                          model: _get_default_model_for_provider(primary, dynamicProvidersMap) || config.model,
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
                            {providerMetaByKey[key]?.has_user_key && (
                              <span className={styles.providerBadgeConfigured}>BYOK</span>
                            )}
                            {!providerMetaByKey[key]?.has_user_key && providerMetaByKey[key]?.uses_credits && (
                              <span className={styles.providerBadgeConfigured}>Platform</span>
                            )}
                            {!providerMetaByKey[key]?.has_user_key && !providerMetaByKey[key]?.uses_credits && key !== 'local' && (
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
                      {(dynamicProvidersMap[config.provider]?.models || []).map(m => (
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
                  <div className={styles.paramField}>
                    <label>Presence Penalty: {config.presencePenalty}</label>
                    <input type="range" min="0" max="2" step="0.1" value={config.presencePenalty} onChange={e => updateConfig({ presencePenalty: parseFloat(e.target.value) })} />
                  </div>
                </div>
              </div>

            {/* Step 3: Tools */}
              <div className={styles.formSection}>
                <h3><Icons.Zap /> Tools & Capabilities</h3>
                <p className={styles.sectionDesc}>Select the tools this agent can use</p>

                {/* Tool Mode Toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setConfig(c => ({ ...c, toolMode: 'smart' }))}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: '8px',
                      border: config.toolMode === 'smart' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                      background: config.toolMode === 'smart' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                      color: config.toolMode === 'smart' ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', fontSize: '13px', textAlign: 'left' as const,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>⚡ Smart (Auto)</div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>All tools available — AI picks the right ones</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig(c => ({ ...c, toolMode: 'manual' }))}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: '8px',
                      border: config.toolMode === 'manual' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
                      background: config.toolMode === 'manual' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                      color: config.toolMode === 'manual' ? '#fbbf24' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', fontSize: '13px', textAlign: 'left' as const,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>🔧 Manual</div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>You choose exactly which tools to enable</div>
                  </button>
                </div>

                {config.toolMode === 'smart' && (
                  <div style={{ padding: '16px', background: 'rgba(59,130,246,0.08)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)', marginBottom: '16px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                      ✨ <strong>Smart mode</strong> — Agent will have access to all available tools (web search, memory, platform actions, media generation via BYOK). The AI automatically picks the right tools for each task.
                    </p>
                  </div>
                )}

                {config.toolMode === 'manual' && customTools.length > 0 && (
                  <div className={styles.customToolsStrip}>
                    <div className={styles.customToolsTitle}>Your Tools</div>
                    <div className={styles.customToolsRow}>
                      {customTools.map((t) => (
                        <button
                          key={t.id}
                          className={`${styles.customToolChip} ${config.tools.includes(t.name) ? styles.active : ''}`}
                          onClick={() => toggleTool(t.name)}
                          type="button"
                          title={t.display_name || t.name}
                        >
                          {t.display_name || t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {config.toolMode === 'manual' && (<>
                <div className={styles.toolsFilterRow}>
                  <div className={styles.field}>
                    <label>Search tools</label>
                    <input value={toolSearch} onChange={(e) => setToolSearch(e.target.value)} placeholder="Search by name/description" />
                  </div>
                  <div className={styles.field}>
                    <label>Category</label>
                    <select value={toolCategoryFilter} onChange={(e) => setToolCategoryFilter(e.target.value)}>
                      <option value="all">All</option>
                      {availableToolCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Risk</label>
                    <select value={toolRiskFilter} onChange={(e) => setToolRiskFilter(e.target.value)}>
                      <option value="all">All</option>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="critical">critical</option>
                    </select>
                  </div>
                  <label className={styles.toggleItem}>
                    <input type="checkbox" checked={showSelectedOnly} onChange={(e) => setShowSelectedOnly(e.target.checked)} />
                    <span className={styles.toggleLabel}>
                      <strong>Selected only</strong>
                      <span>Show enabled tools</span>
                    </span>
                  </label>
                </div>

                <div className={styles.toolsGrid}>
                  {filteredAvailableTools.map((tool) => {
                      const uiMeta = TOOLS.find(
                        (m) => m.id === tool.name || m.id === tool.id || m.name === tool.display_name
                      );
                      const iconName = uiMeta?.icon || 'Zap';
                      const label = tool.display_name || tool.name;
                      const desc = tool.description || uiMeta?.description || '';
                      const toolKey = tool.name;

                      return (
                        <div
                          key={tool.id}
                          className={`${styles.toolCard} ${config.tools.includes(toolKey) ? styles.active : ''}`}
                          onClick={() => toggleTool(toolKey)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleTool(toolKey);
                            }
                          }}
                        >
                          <div className={styles.toolIcon}>{getToolIcon(iconName)}</div>
                          <div className={styles.toolInfo}>
                            <div className={styles.toolNameRow}>
                              <div className={styles.toolName}>{label}</div>
                              <div className={styles.toolBadges}>
                                {tool.risk_level && (
                                  <span className={`${styles.badge} ${styles[`risk_${tool.risk_level}` as keyof typeof styles] || ''}`}>{tool.risk_level}</span>
                                )}
                                {tool.requires_approval && <span className={`${styles.badge} ${styles.badgeApproval}`}>approval</span>}
                              </div>
                            </div>
                            <div className={styles.toolDesc}>{desc}</div>
                            {(tool.category || tool.handler_type) && (
                              <div className={styles.toolMetaRow}>
                                {tool.category && <span className={styles.miniChip}>{tool.category}</span>}
                                {tool.handler_type && <span className={styles.miniChip}>{tool.handler_type}</span>}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className={styles.toolDetailsBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setToolDetails(tool);
                            }}
                          >
                            Details
                          </button>
                        </div>
                      );
                    })}

                  {!isLoadingAvailableTools && filteredAvailableTools.length === 0 && (
                    <div className={styles.toolsEmptyState}>
                      No tools match your filters.
                    </div>
                  )}
                  {isLoadingAvailableTools && (
                    <div className={styles.toolsEmptyState}>
                      Loading tools…
                    </div>
                  )}
                </div>
                </>)}
              </div>

            {/* Step 4+5: Memory & Autonomy — combined compact card */}
              <div className={styles.formSection}>
                <h3><Icons.Lock /> Memory & Autonomy</h3>
                <div className={styles.compactToggles}>
                  <label className={styles.compactToggle}>
                    <span className={styles.compactToggleSwitch}>
                      <input type="checkbox" checked={config.memoryEnabled} onChange={e => updateConfig({ memoryEnabled: e.target.checked })} />
                      <span className={styles.compactToggleTrack} />
                    </span>
                    <span className={styles.compactToggleText}>Long-term Memory</span>
                  </label>
                  <label className={styles.compactToggle}>
                    <span className={styles.compactToggleSwitch}>
                      <input type="checkbox" checked={config.vectorStoreEnabled} onChange={e => updateConfig({ vectorStoreEnabled: e.target.checked })} />
                      <span className={styles.compactToggleTrack} />
                    </span>
                    <span className={styles.compactToggleText}>Vector Store</span>
                  </label>
                  <label className={styles.compactToggle}>
                    <span className={styles.compactToggleSwitch}>
                      <input type="checkbox" checked={config.canSpawnSubAgents} onChange={e => updateConfig({ canSpawnSubAgents: e.target.checked })} />
                      <span className={styles.compactToggleTrack} />
                    </span>
                    <span className={styles.compactToggleText}>Spawn Sub-Agents</span>
                  </label>
                  <label className={styles.compactToggle}>
                    <span className={styles.compactToggleSwitch}>
                      <input type="checkbox" checked={config.canModifySelf} onChange={e => updateConfig({ canModifySelf: e.target.checked })} />
                      <span className={styles.compactToggleTrack} />
                    </span>
                    <span className={styles.compactToggleText}>Self-Modification</span>
                  </label>
                  <label className={styles.compactToggle}>
                    <span className={styles.compactToggleSwitch}>
                      <input type="checkbox" checked={config.canAccessNetwork} onChange={e => updateConfig({ canAccessNetwork: e.target.checked })} />
                      <span className={styles.compactToggleTrack} />
                    </span>
                    <span className={styles.compactToggleText}>Network Access</span>
                  </label>
                  <label className={styles.compactToggle}>
                    <span className={styles.compactToggleSwitch}>
                      <input type="checkbox" checked={config.canExecuteCode} onChange={e => updateConfig({ canExecuteCode: e.target.checked })} />
                      <span className={styles.compactToggleTrack} />
                    </span>
                    <span className={styles.compactToggleText}>Code Execution</span>
                  </label>
                  <label className={styles.compactToggle}>
                    <span className={styles.compactToggleSwitch}>
                      <input type="checkbox" checked={config.walletEnabled} onChange={e => updateConfig({ walletEnabled: e.target.checked })} />
                      <span className={styles.compactToggleTrack} />
                    </span>
                    <span className={styles.compactToggleText}>Wallet & Budget</span>
                  </label>
                </div>
                <div className={styles.compactSlider}>
                  <label>Max Tasks: {config.maxConcurrentTasks}</label>
                  <input type="range" min="1" max="20" value={config.maxConcurrentTasks} onChange={e => updateConfig({ maxConcurrentTasks: parseInt(e.target.value) })} />
                </div>
                {config.walletEnabled && (
                  <div className={styles.compactWalletGrid}>
                    <div className={styles.compactWalletField}>
                      <label>Initial</label>
                      <input type="number" min={0} step={1} value={config.walletInitialBalance} onChange={e => updateConfig({ walletInitialBalance: parseFloat(e.target.value || '0') })} />
                    </div>
                    <div className={styles.compactWalletField}>
                      <label>Daily</label>
                      <input type="number" min={0} step={1} value={config.walletDailyLimit} onChange={e => updateConfig({ walletDailyLimit: parseFloat(e.target.value || '0') })} />
                    </div>
                    <div className={styles.compactWalletField}>
                      <label>Per Tx</label>
                      <input type="number" min={0} step={1} value={config.walletTransactionLimit} onChange={e => updateConfig({ walletTransactionLimit: parseFloat(e.target.value || '0') })} />
                    </div>
                    <div className={styles.compactWalletField}>
                      <label>Monthly</label>
                      <input type="number" min={0} step={1} value={config.walletMonthlyLimit} onChange={e => updateConfig({ walletMonthlyLimit: parseFloat(e.target.value || '0') })} />
                    </div>
                  </div>
                )}
              </div>

            {/* Step 6: Deploy */}
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

                  <div className={styles.reviewSection}>
                    <h4>Governance & Budget</h4>
                    <div className={styles.reviewRow}><span>Mode:</span><strong>{config.mode}</strong></div>
                    <div className={styles.reviewRow}><span>Wallet:</span><strong>{config.walletEnabled ? 'enabled' : 'disabled'}</strong></div>
                    {config.walletEnabled && (
                      <>
                        <div className={styles.reviewRow}><span>Daily limit:</span><strong>{config.walletDailyLimit}</strong></div>
                        <div className={styles.reviewRow}><span>Transaction limit:</span><strong>{config.walletTransactionLimit}</strong></div>
                        <div className={styles.reviewRow}><span>Monthly limit:</span><strong>{config.walletMonthlyLimit}</strong></div>
                      </>
                    )}
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
                    <input type="checkbox" checked={config.autoScale} onChange={e => updateConfig({ autoScale: e.target.checked })} />
                    <span className={styles.toggleLabel}>
                      <strong>Auto Scale</strong>
                      <span>Scale instances based on demand</span>
                    </span>
                  </label>
                  <div className={styles.field}>
                    <label>Min Instances</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={config.minInstances}
                      onChange={e => updateConfig({ minInstances: parseInt(e.target.value || '1') })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Max Instances</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={config.maxInstances}
                      onChange={e => updateConfig({ maxInstances: parseInt(e.target.value || '1') })}
                    />
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

            {/* Navigation */}
            <div className={styles.formNav}>
              <button className={styles.exportBtn} onClick={handleExport}>
                <Icons.Download /> Export Config
              </button>
              <button 
                className={styles.createBtn} 
                onClick={handleCreate}
                disabled={!requiredForStep(1) || !requiredForStep(2) || isCreating}
              >
                {isCreating ? (
                  <><Icons.Refresh /> Creating...</>
                ) : (
                  <><Icons.Plus /> Create Agent</>
                )}
              </button>
            </div>
            </div>
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
                <label><input type="checkbox" defaultChecked /> execution.failed</label>
              </div>
            </div>

            <div className={styles.devCard}>
              <h4>Custom Tools</h4>
              <p>Create and manage your own tool endpoints</p>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Tool Name</label>
                  <input value={newToolName} onChange={e => setNewToolName(e.target.value)} placeholder="e.g. my-webhook-tool" disabled={Boolean(editingToolId)} />
                </div>
                <div className={styles.field}>
                  <label>Tool URL</label>
                  <input value={newToolUrl} onChange={e => setNewToolUrl(e.target.value)} placeholder="https://your-api.com/tool" />
                </div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>HTTP Method</label>
                  <select value={newToolMethod} onChange={e => setNewToolMethod(e.target.value as any)}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Risk Level</label>
                  <select value={newToolRiskLevel} onChange={e => setNewToolRiskLevel(e.target.value as any)}>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="critical">critical</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <input value={newToolDescription} onChange={e => setNewToolDescription(e.target.value)} placeholder="What does this tool do?" />
              </div>
              <div className={styles.field}>
                <label>Parameters Schema (JSON, optional)</label>
                <textarea
                  value={newToolParametersSchema}
                  onChange={e => setNewToolParametersSchema(e.target.value)}
                  placeholder='{"type":"object","properties":{}}'
                  rows={3}
                />
              </div>
              <div className={styles.webhookEvents}>
                <label>
                  <input type="checkbox" checked={newToolRequiresApproval} onChange={e => setNewToolRequiresApproval(e.target.checked)} />
                  requires approval
                </label>
              </div>
              <div className={styles.importActions}>
                <button className={styles.importBtn} onClick={handleCreateCustomTool} disabled={isCreatingTool}>
                  {isCreatingTool ? 'Saving…' : (editingToolId ? 'Update Tool' : 'Create Tool')}
                </button>
                {editingToolId && (
                  <button className={styles.exportBtn} type="button" onClick={cancelEditCustomTool}>
                    Cancel
                  </button>
                )}
                <button className={styles.exportBtn} onClick={refreshCustomTools}>
                  Refresh
                </button>
              </div>

              {customTools.length > 0 && (
                <div className={styles.customToolsList}>
                  {customTools.map((t) => (
                    <div key={t.id} className={styles.customToolRow}>
                      <div className={styles.customToolRowBody}>
                        <div className={styles.customToolRowName}>{t.display_name || t.name}</div>
                        <div className={styles.customToolRowMeta}>
                          {typeof (t.handler_config as any)?.method === 'string' && (
                            <span className={styles.miniChip}>{String((t.handler_config as any).method).toUpperCase()}</span>
                          )}
                          {typeof (t.handler_config as any)?.url === 'string' && (
                            <span className={styles.miniChip}>{String((t.handler_config as any).url)}</span>
                          )}
                          {t.risk_level && (
                            <span className={`${styles.badge} ${styles[`risk_${t.risk_level}` as keyof typeof styles] || ''}`}>{t.risk_level}</span>
                          )}
                          {t.requires_approval && <span className={`${styles.badge} ${styles.badgeApproval}`}>approval</span>}
                        </div>
                      </div>
                      <button className={styles.exportBtn} onClick={() => startEditCustomTool(t)}>Edit</button>
                      <button className={styles.backBtn} onClick={() => handleDeleteCustomTool(t.id)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}

              {customTools.length === 0 && (
                <div className={styles.toolsEmptyState}>No custom tools yet.</div>
              )}
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
          </div>
        </div>
      </div>

      {toolDetails && (
        <div className={styles.modalOverlay} onClick={() => setToolDetails(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Tool details">
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{toolDetails.display_name || toolDetails.name}</div>
              <button className={styles.modalClose} type="button" onClick={() => setToolDetails(null)}>
                <Icons.X />
              </button>
            </div>
            <div className={styles.modalBody}>
              {toolDetails.description && (
                <div className={styles.modalSection}>
                  <div className={styles.modalLabel}>Description</div>
                  <div className={styles.modalValue}>{toolDetails.description}</div>
                </div>
              )}

              <div className={styles.modalSection}>
                <div className={styles.modalLabel}>Meta</div>
                <div className={styles.modalChips}>
                  {toolDetails.category && <span className={styles.miniChip}>{toolDetails.category}</span>}
                  {toolDetails.risk_level && <span className={`${styles.badge} ${styles[`risk_${toolDetails.risk_level}` as keyof typeof styles] || ''}`}>{toolDetails.risk_level}</span>}
                  {toolDetails.requires_approval && <span className={`${styles.badge} ${styles.badgeApproval}`}>approval</span>}
                  {toolDetails.handler_type && <span className={styles.miniChip}>{toolDetails.handler_type}</span>}
                </div>
              </div>

              {toolDetails.handler_config && (
                <div className={styles.modalSection}>
                  <div className={styles.modalLabel}>Handler</div>
                  <pre className={styles.modalCode}>{JSON.stringify(toolDetails.handler_config, null, 2)}</pre>
                </div>
              )}
              {toolDetails.parameters_schema && (
                <div className={styles.modalSection}>
                  <div className={styles.modalLabel}>Parameters schema</div>
                  <pre className={styles.modalCode}>{JSON.stringify(toolDetails.parameters_schema, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdvancedFactory = memo(AdvancedFactoryComponent);
export default AdvancedFactory;
