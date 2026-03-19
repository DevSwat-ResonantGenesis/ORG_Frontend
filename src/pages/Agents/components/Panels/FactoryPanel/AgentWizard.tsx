import React, { memo, useState, useCallback, useEffect } from 'react';
import { useAgentStore } from '../../../../../stores/agentStore';
import { Icons } from '../../shared/Icons';
import { createAgent as createAgentApi, getAgentProvidersCatalog, getAvailableTools, assignGoal, createSchedule } from '../../../../../api/agents';
import type { ProviderCatalogProvider, AvailableTool } from '../../../../../api/agents';
import styles from './AgentWizard.module.css';

// ============== AGENT CREATION WIZARD ==============
// Step-by-step guided agent creation for new users

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'basics', title: 'Basic Info', description: 'Name and describe your agent' },
  { id: 'type', title: 'Agent Type', description: 'Choose what your agent does' },
  { id: 'model', title: 'AI Model', description: 'Select the AI model to power your agent' },
  { id: 'tools', title: 'Tools', description: 'Give your agent capabilities' },
  { id: 'goals', title: 'Goal & Schedule', description: 'Set a goal and optional recurring schedule' },
  { id: 'review', title: 'Review', description: 'Review and create your agent' },
];

const SCHEDULE_PRESETS = [
  { id: 'none', label: 'No schedule', cron: '', interval: 0 },
  { id: 'every_5m', label: 'Every 5 minutes', cron: '', interval: 300 },
  { id: 'every_30m', label: 'Every 30 minutes', cron: '', interval: 1800 },
  { id: 'hourly', label: 'Every hour', cron: '0 * * * *', interval: 0 },
  { id: 'daily', label: 'Daily at midnight', cron: '0 0 * * *', interval: 0 },
  { id: 'weekly', label: 'Weekly (Monday)', cron: '0 0 * * 1', interval: 0 },
  { id: 'custom', label: 'Custom cron...', cron: '', interval: 0 },
];

const AGENT_TYPES = [
  { id: 'executor', name: 'Task Executor', icon: 'Zap', description: 'Executes specific tasks and workflows' },
  { id: 'researcher', name: 'Researcher', icon: 'Search', description: 'Analyzes data and provides insights' },
  { id: 'coder', name: 'Code Assistant', icon: 'Code', description: 'Writes, reviews, and debugs code' },
  { id: 'planner', name: 'Planner', icon: 'Calendar', description: 'Plans and organizes complex tasks' },
  { id: 'assistant', name: 'General Assistant', icon: 'MessageSquare', description: 'Versatile helper for various tasks' },
];


const TOOL_ICON_MAP: Record<string, string> = {
  web_search: 'Search', fetch_url: 'External', 'memory.read': 'Database', 'memory.write': 'Database',
  create_rabbit_post: 'MessageSquare', list_rabbit_communities: 'Folder', create_rabbit_community: 'Folder',
  http_request: 'External', generate_image: 'Image', generate_audio: 'Volume2',
  generate_music: 'Music', generate_video: 'Video',
};

const CATEGORY_LABELS: Record<string, string> = {
  web: '🌐 Web', memory: '🧠 Memory', platform: '📦 Platform', media: '🎨 Media', general: '⚙️ General',
};

interface AgentWizardProps {
  className?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

// Validation helpers
const validateName = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return 'Agent name is required';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 50) return 'Name must be less than 50 characters';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9\s\-_]*$/.test(trimmed)) {
    return 'Name must start with a letter or number and contain only letters, numbers, spaces, hyphens, or underscores';
  }
  return null;
};

const validateDescription = (value: string): string | null => {
  if (value.length > 500) return 'Description must be less than 500 characters';
  return null;
};

const AgentWizardComponent: React.FC<AgentWizardProps> = ({ className, onComplete, onCancel }) => {
  const { addAgent } = useAgentStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
  
  // Dynamic providers from backend LLM service — no hardcoded fallbacks
  const [dynamicProviders, setDynamicProviders] = useState<ProviderCatalogProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState<string | null>(null);

  // Field validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentType, setAgentType] = useState('executor');
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolMode, setToolMode] = useState<'smart' | 'manual'>('smart');
  const [availableTools, setAvailableTools] = useState<AvailableTool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [mode, setMode] = useState<'governed' | 'unbounded'>('governed');
  const [goal, setGoal] = useState('');
  const [schedulePreset, setSchedulePreset] = useState('none');
  const [customCron, setCustomCron] = useState('');

  // Fetch available tools when switching to manual mode
  useEffect(() => {
    if (toolMode === 'manual' && availableTools.length === 0) {
      setToolsLoading(true);
      getAvailableTools()
        .then(tools => setAvailableTools(tools))
        .finally(() => setToolsLoading(false));
    }
  }, [toolMode]);

  // Fetch live provider catalog from the LLM service on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setProvidersError(null);
        const catalog = await getAgentProvidersCatalog();
        if (cancelled) return;
        if (catalog?.providers?.length) {
          setDynamicProviders(catalog.providers);
          // Auto-select: prefer catalog.default ONLY if it's available, else first available
          const preferredDefault = catalog.providers.find(p => p.id === catalog.default && p.available);
          const defaultId = preferredDefault?.id || catalog.providers.find(p => p.available)?.id || catalog.providers[0]?.id;
          if (defaultId && !provider) {
            const prov = catalog.providers.find(p => p.id === defaultId);
            setProvider(defaultId);
            setModel(prov?.model || prov?.models?.[0] || '');
          }
        } else {
          setProvidersError('No providers returned from backend');
        }
      } catch (err: any) {
        if (cancelled) return;
        setProvidersError(err?.message || 'Failed to fetch LLM providers');
      } finally {
        if (!cancelled) setProvidersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const currentStepData = WIZARD_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const isReviewStep = currentStepData.id === 'review';

  // Handle field blur for validation
  const handleFieldBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let error: string | null = null;
    switch (field) {
      case 'name':
        error = validateName(name);
        break;
      case 'description':
        error = validateDescription(description);
        break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  }, [name, description]);

  // Handle name change with real-time validation
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (touched.name) {
      setFieldErrors(prev => ({ ...prev, name: validateName(value) }));
    }
  }, [touched.name]);

  // Handle description change with real-time validation
  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    if (touched.description) {
      setFieldErrors(prev => ({ ...prev, description: validateDescription(value) }));
    }
  }, [touched.description]);

  const canProceed = useCallback(() => {
    switch (currentStepData.id) {
      case 'basics':
        const nameError = validateName(name);
        const descError = validateDescription(description);
        return !nameError && !descError;
      case 'type':
        return !!agentType;
      case 'model':
        return !!provider && !!model;
      case 'tools':
        return true; // Tools are optional
      case 'goals':
        return true; // Goal & schedule are optional
      case 'review':
        return true;
      default:
        return false;
    }
  }, [currentStepData.id, name, description, agentType, provider, model]);

  const handleNext = useCallback(() => {
    // Validate current step before proceeding
    if (currentStepData.id === 'basics') {
      const nameError = validateName(name);
      const descError = validateDescription(description);
      setFieldErrors({ name: nameError, description: descError });
      setTouched({ name: true, description: true });
      if (nameError || descError) return;
    }
    
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null); // Clear any previous errors
    }
  }, [currentStep, currentStepData.id, name, description]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleProviderSelect = useCallback((providerId: string) => {
    const providerData = dynamicProviders.find(p => p.id === providerId);
    setProvider(providerId);
    if (providerData) {
      setModel(providerData.model || providerData.models?.[0] || '');
    }
  }, [dynamicProviders]);

  const toggleTool = useCallback((toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow Enter to proceed on basics step if valid
        if (e.key === 'Enter' && !e.shiftKey && currentStepData.id === 'basics') {
          e.preventDefault();
          if (canProceed()) handleNext();
        }
        return;
      }
      
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          if (canProceed() && !isLastStep && !createdAgentId) {
            e.preventDefault();
            handleNext();
          }
          break;
        case 'ArrowLeft':
        case 'Backspace':
          if (!isFirstStep && !createdAgentId) {
            e.preventDefault();
            handleBack();
          }
          break;
        case 'Escape':
          if (onCancel) {
            e.preventDefault();
            onCancel();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, currentStepData.id, canProceed, handleNext, handleBack, isLastStep, isFirstStep, createdAgentId, onCancel]);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    setError(null);

    try {
      const agentData = {
        name: name.trim(),
        description: description.trim() || `A ${agentType} agent`,
        type: agentType,
        mode,
        provider,
        model,
        tool_mode: toolMode,
        tools: toolMode === 'smart' ? [] : selectedTools,
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 4096,
      };

      const result = await createAgentApi(agentData);

      // Assign goal if provided
      if (result?.id && goal.trim()) {
        try {
          await assignGoal(result.id, { description: goal.trim(), priority: 1 });
        } catch (e) { console.warn('Goal assign failed (non-blocking):', e); }
      }

      // Create schedule if selected
      if (result?.id && schedulePreset !== 'none' && goal.trim()) {
        try {
          const preset = SCHEDULE_PRESETS.find(p => p.id === schedulePreset);
          const cronExpr = schedulePreset === 'custom' ? customCron : (preset?.cron || undefined);
          const intervalSec = preset?.interval || undefined;
          await createSchedule(result.id, {
            name: `${name.trim()} schedule`,
            goal: goal.trim(),
            cron_expression: cronExpr || undefined,
            interval_seconds: intervalSec || undefined,
          });
        } catch (e) { console.warn('Schedule create failed (non-blocking):', e); }
      }
      
      if (result?.id) {
        setCreatedAgentId(result.id);
        addAgent({
          id: result.id,
          hash: '0x' + result.id.replace(/-/g, '').slice(0, 40),
          name: agentData.name,
          description: agentData.description,
          type: agentData.type as any,
          status: 'idle',
          mode: agentData.mode,
          version: '1.0.0',
          capabilities: agentData.tools || [],
          walletBalance: 0,
          riskLevel: 'low' as const,
          utilityScore: 0.5,
          executions: 0,
          costToday: 0,
          pendingApprovals: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: '',
          persisted: true,
          provider: agentData.provider,
          model: agentData.model,
          tools: agentData.tools,
          config: {
            provider: agentData.provider || 'openai',
            model: agentData.model || 'gpt-4-turbo-preview',
            systemPrompt: '',
            temperature: 0.7,
            maxTokens: 4096,
            tools: [],
            memoryConfig: { shortTermLimit: 10, longTermEnabled: false, vectorStoreEnabled: false, contextWindow: 4096 },
            autonomyConfig: { canSpawnSubAgents: false, canModifySelf: false, canAccessNetwork: false, canExecuteCode: false, maxConcurrentTasks: 5 },
          },
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  }, [name, description, agentType, mode, provider, model, selectedTools, addAgent]);

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'basics':
        return (
          <div className={styles.stepContent}>
            <div className={styles.formCard}>
              <div className={`${styles.inputGroup} ${touched.name && fieldErrors.name ? styles.hasError : ''}`}>
                <label htmlFor="agent-name">Agent Name *</label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  placeholder="e.g., Research Assistant, Code Helper"
                  autoFocus
                  className={touched.name && fieldErrors.name ? styles.inputError : ''}
                  aria-invalid={touched.name && !!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : 'name-hint'}
                />
                {touched.name && fieldErrors.name ? (
                  <span id="name-error" className={styles.errorText}>{fieldErrors.name}</span>
                ) : (
                  <span id="name-hint" className={styles.hint}>2-50 characters</span>
                )}
                <div className={styles.charCount}>{name.length}/50</div>
              </div>
              <div className={`${styles.inputGroup} ${touched.description && fieldErrors.description ? styles.hasError : ''}`}>
                <label htmlFor="agent-description">Description (optional)</label>
                <textarea
                  id="agent-description"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onBlur={() => handleFieldBlur('description')}
                  placeholder="What does this agent do?"
                  rows={2}
                  className={touched.description && fieldErrors.description ? styles.inputError : ''}
                  aria-invalid={touched.description && !!fieldErrors.description}
                  aria-describedby={fieldErrors.description ? 'desc-error' : 'desc-hint'}
                />
                {touched.description && fieldErrors.description ? (
                  <span id="desc-error" className={styles.errorText}>{fieldErrors.description}</span>
                ) : (
                  <span id="desc-hint" className={styles.hint}>Brief description of the agent's purpose</span>
                )}
                <div className={styles.charCount}>{description.length}/500</div>
              </div>
            </div>
          </div>
        );

      case 'type':
        return (
          <div className={styles.stepContent}>
            <div className={styles.typeGrid}>
              {AGENT_TYPES.map((type) => {
                const IconComponent = (Icons as any)[type.icon] || Icons.Agents;
                return (
                  <button
                    key={type.id}
                    className={`${styles.typeCard} ${agentType === type.id ? styles.selected : ''}`}
                    onClick={() => setAgentType(type.id)}
                  >
                    <div className={styles.typeIcon}>
                      <IconComponent />
                    </div>
                    <div className={styles.typeInfo}>
                      <h4>{type.name}</h4>
                      <p>{type.description}</p>
                    </div>
                    {agentType === type.id && (
                      <div className={styles.checkmark}>
                        <Icons.CheckCircle />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'model': {
        const activeProvider = dynamicProviders.find(p => p.id === provider);
        const providerModels = activeProvider?.models || (activeProvider?.model ? [activeProvider.model] : []);
        return (
          <div className={styles.stepContent}>
            {/* Provider selector row */}
            <div className={styles.formCard}>
              <label className={styles.fieldLabel}>Provider</label>
              {providersLoading ? (
                <div className={styles.loadingProviders}>Loading providers...</div>
              ) : providersError ? (
                <div className={styles.loadingProviders}>
                  <span style={{ color: '#f87171' }}>⚠ {providersError}</span>
                  <button
                    className={styles.byokLink}
                    style={{ marginLeft: 12 }}
                    onClick={() => {
                      setProvidersLoading(true);
                      setProvidersError(null);
                      getAgentProvidersCatalog().then(catalog => {
                        if (catalog?.providers?.length) {
                          setDynamicProviders(catalog.providers);
                          const prefDefault = catalog.providers.find(p => p.id === catalog.default && p.available);
                          const defaultId = prefDefault?.id || catalog.providers.find(p => p.available)?.id || catalog.providers[0]?.id;
                          if (defaultId) {
                            const prov = catalog.providers.find(p => p.id === defaultId);
                            setProvider(defaultId);
                            setModel(prov?.model || prov?.models?.[0] || '');
                          }
                        } else {
                          setProvidersError('No providers returned from backend');
                        }
                      }).catch((err: any) => setProvidersError(err?.message || 'Failed to fetch')).finally(() => setProvidersLoading(false));
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className={styles.providerList}>
                  {dynamicProviders.map((p) => (
                    <button
                      key={p.id}
                      className={`${styles.providerRow} ${provider === p.id ? styles.selected : ''} ${!p.available ? styles.unavailable : ''}`}
                      onClick={() => handleProviderSelect(p.id)}
                      disabled={!p.available}
                    >
                      <span className={styles.providerRowIcon}>
                        {p.id === 'groq' && '⚡'}
                        {p.id === 'openai' && '🤖'}
                        {p.id === 'anthropic' && '🧠'}
                        {p.id === 'google' && '💎'}
                        {p.id === 'local' && '🖥️'}
                      </span>
                      <div className={styles.providerRowContent}>
                        <span className={styles.providerRowName}>{p.name}</span>
                        <span className={styles.providerRowModel}>
                          {p.model || (p.models?.[0]) || 'No models'}
                        </span>
                      </div>
                      <div className={styles.providerRowMeta}>
                        {p.has_user_key && (
                          <span className={styles.byokBadge} title="Using your API key">BYOK</span>
                        )}
                        {!p.has_user_key && p.has_system_key && (
                          <span className={styles.systemKeyBadge} title="Platform key">SYS</span>
                        )}
                        <span className={`${styles.statusDot} ${p.available ? styles.online : styles.offline}`} />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Model dropdown */}
              {provider && (
                <div className={styles.modelSelectGroup}>
                  <label className={styles.fieldLabel}>Model</label>
                  <select
                    className={styles.modelSelect}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    {providerModels.length === 0 && (
                      <option value="">No models available</option>
                    )}
                    {providerModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* BYOK link */}
              {activeProvider?.supports_byok && (
                <div className={styles.byokRow}>
                  <span className={styles.byokLabel}>
                    {activeProvider.has_user_key
                      ? '✅ Using your API key — no credits used'
                      : '💡 Add your own key for free unlimited usage'}
                  </span>
                  <a
                    href="/profile?tab=api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.byokLink}
                  >
                    {activeProvider.has_user_key ? 'Manage Keys' : 'Add API Key'}
                  </a>
                </div>
              )}
            </div>

            {/* Governance mode */}
            <div className={styles.modeToggle}>
              <label>Governance Mode</label>
              <div className={styles.modeButtons}>
                <button
                  className={`${styles.modeBtn} ${mode === 'governed' ? styles.active : ''}`}
                  onClick={() => setMode('governed')}
                >
                  <Icons.Lock /> Governed
                </button>
                <button
                  className={`${styles.modeBtn} ${mode === 'unbounded' ? styles.active : ''}`}
                  onClick={() => setMode('unbounded')}
                >
                  <Icons.Unlock /> Unbounded
                </button>
              </div>
              <span className={styles.hint}>
                {mode === 'governed' 
                  ? 'Actions are traced and auditable' 
                  : 'Full autonomy with fewer restrictions'}
              </span>
            </div>
          </div>
        );
      }

      case 'tools':
        return (
          <div className={styles.stepContent}>
            {/* Smart / Manual toggle */}
            <div className={styles.modeToggle} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Tool Mode</label>
              <div className={styles.modeButtons}>
                <button
                  className={`${styles.modeBtn} ${toolMode === 'smart' ? styles.active : ''}`}
                  onClick={() => setToolMode('smart')}
                >
                  <Icons.Zap /> Smart (Auto)
                </button>
                <button
                  className={`${styles.modeBtn} ${toolMode === 'manual' ? styles.active : ''}`}
                  onClick={() => setToolMode('manual')}
                >
                  <Icons.Settings /> Manual
                </button>
              </div>
              <span className={styles.hint}>
                {toolMode === 'smart'
                  ? 'Agent automatically has access to all tools and picks the right ones for each task.'
                  : 'You choose exactly which tools this agent can use.'}
              </span>
            </div>

            {toolMode === 'smart' ? (
              <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                  ✨ <strong>Smart mode enabled</strong> — Your agent will have access to all available tools including web search, memory, platform actions, and media generation (images, audio, music, video via BYOK).
                  The AI decides which tools to use based on the goal.
                </p>
              </div>
            ) : (
              <>
                <p className={styles.toolsIntro}>Select the tools your agent can use:</p>
                {toolsLoading ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.5)' }}>Loading tools...</div>
                ) : (
                  <>
                    {/* Group tools by category */}
                    {Object.entries(
                      availableTools.reduce<Record<string, AvailableTool[]>>((acc, tool) => {
                        const cat = tool.category || 'general';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(tool);
                        return acc;
                      }, {})
                    ).map(([category, tools]: [string, AvailableTool[]]) => (
                      <div key={category} style={{ marginBottom: 16 }}>
                        <h4 style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
                          {CATEGORY_LABELS[category] || category}
                        </h4>
                        <div className={styles.toolsGrid}>
                          {tools.map((tool) => {
                            const iconName = TOOL_ICON_MAP[tool.name] || 'Zap';
                            const IconComponent = (Icons as any)[iconName] || Icons.Zap;
                            const isSelected = selectedTools.includes(tool.name);
                            return (
                              <button
                                key={tool.id}
                                className={`${styles.toolCard} ${isSelected ? styles.selected : ''}`}
                                onClick={() => toggleTool(tool.name)}
                              >
                                <div className={styles.toolIcon}>
                                  <IconComponent />
                                </div>
                                <div className={styles.toolInfo}>
                                  <h4>{tool.name.replace(/_/g, ' ').replace(/\./g, ' ')}</h4>
                                  <p>{tool.description}</p>
                                  {tool.byok_provider && (
                                    <span style={{ fontSize: 11, color: '#f59e0b', marginTop: 2, display: 'inline-block' }}>
                                      🔑 Requires {tool.byok_provider} API key
                                    </span>
                                  )}
                                </div>
                                <div className={styles.toolCheckbox}>
                                  {isSelected ? <Icons.CheckCircle /> : <Icons.Circle />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        );

      case 'goals':
        return (
          <div className={styles.stepContent}>
            <div className={styles.inputGroup}>
              <label>Agent Goal</label>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 8px' }}>
                What should this agent accomplish? This will be its primary objective.
              </p>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Monitor my GitHub repo for new issues and summarize them daily"
                rows={3}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>

            <div className={styles.inputGroup} style={{ marginTop: 20 }}>
              <label>Recurring Schedule</label>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 8px' }}>
                Optionally run this agent on a schedule. Requires a goal above.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {SCHEDULE_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${styles.typeCard} ${schedulePreset === preset.id ? styles.selected : ''}`}
                    onClick={() => setSchedulePreset(preset.id)}
                    style={{ padding: '10px 12px', minHeight: 'auto' }}
                  >
                    <span style={{ fontSize: 14 }}>{preset.label}</span>
                  </button>
                ))}
              </div>
              {schedulePreset === 'custom' && (
                <input
                  value={customCron}
                  onChange={(e) => setCustomCron(e.target.value)}
                  placeholder="Cron expression, e.g. */15 * * * *"
                  style={{ marginTop: 10 }}
                />
              )}
              {schedulePreset !== 'none' && !goal.trim() && (
                <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
                  A goal is required to create a schedule.
                </p>
              )}
            </div>
          </div>
        );

      case 'review':
        if (createdAgentId) {
          return (
            <div className={styles.stepContent}>
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <Icons.CheckCircle />
                </div>
                <h3>Agent Created Successfully!</h3>
                <p>Your agent "{name}" is ready to use.</p>
                <div className={styles.successActions}>
                  <button className={styles.primaryBtn} onClick={onComplete}>
                    Go to Agent Studio
                  </button>
                  <button className={styles.secondaryBtn} onClick={() => {
                    setCurrentStep(0);
                    setName('');
                    setDescription('');
                    setAgentType('executor');
                    const defaultProv = dynamicProviders.find(p => p.available) || dynamicProviders[0];
                    setProvider(defaultProv?.id || '');
                    setModel(defaultProv?.model || defaultProv?.models?.[0] || '');
                    setSelectedTools([]);
                    setGoal('');
                    setSchedulePreset('none');
                    setCustomCron('');
                    setCreatedAgentId(null);
                  }}>
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          );
        }

        const selectedType = AGENT_TYPES.find(t => t.id === agentType);
        const selectedProvider = dynamicProviders.find(p => p.id === provider);

        return (
          <div className={styles.stepContent}>
            {error && <div className={styles.errorMsg}>{error}</div>}
            <div className={styles.reviewCard}>
              <h3>Review Your Agent</h3>
              <div className={styles.reviewGrid}>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Name</span>
                  <span className={styles.reviewValue}>{name}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Type</span>
                  <span className={styles.reviewValue}>{selectedType?.name || agentType}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>AI Model</span>
                  <span className={styles.reviewValue}>{selectedProvider?.name} ({model})</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Mode</span>
                  <span className={styles.reviewValue}>{mode === 'governed' ? 'Governed' : 'Unbounded'}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Tool Mode</span>
                  <span className={styles.reviewValue}>{toolMode === 'smart' ? '✨ Smart (All tools auto)' : '🔧 Manual'}</span>
                </div>
                {toolMode === 'manual' && (
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Tools</span>
                    <span className={styles.reviewValue}>
                      {selectedTools.length > 0
                        ? selectedTools.map(t => t.replace(/_/g, ' ')).join(', ')
                        : 'None selected'}
                    </span>
                  </div>
                )}
                {description && (
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Description</span>
                    <span className={styles.reviewValue}>{description}</span>
                  </div>
                )}
                {goal.trim() && (
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Goal</span>
                    <span className={styles.reviewValue}>{goal}</span>
                  </div>
                )}
                {schedulePreset !== 'none' && (
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Schedule</span>
                    <span className={styles.reviewValue}>
                      {schedulePreset === 'custom' ? `Cron: ${customCron}` : SCHEDULE_PRESETS.find(p => p.id === schedulePreset)?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${styles.wizard} ${className || ''}`}>
      <div className={styles.wizardInner}>
        {/* Progress Steps */}
        <div className={styles.progressBar}>
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`${styles.progressStep} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
            >
              <div className={styles.stepNumber}>
                {index < currentStep ? <Icons.CheckCircle /> : index + 1}
              </div>
              <span className={styles.stepTitle}>{step.title}</span>
            </div>
          ))}
        </div>

        {/* Step Header */}
        <div className={styles.stepHeader}>
          <h2>{currentStepData.title}</h2>
          <p>{currentStepData.description}</p>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        {!createdAgentId && (
          <div className={styles.navigation}>
            <div className={styles.navLeft}>
              <button
                className={styles.backBtn}
                onClick={isFirstStep ? onCancel : handleBack}
              >
                {isFirstStep ? 'Cancel' : '← Back'}
              </button>
              <span className={styles.keyboardHint}>
                ← → Enter Esc
              </span>
            </div>
            
            {isReviewStep ? (
              <button
                className={`${styles.createBtn} ${isCreating ? styles.loading : ''}`}
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <span className={styles.spinner}></span>
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </button>
            ) : (
              <button
                className={styles.nextBtn}
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AgentWizard = memo(AgentWizardComponent);
export default AgentWizard;
