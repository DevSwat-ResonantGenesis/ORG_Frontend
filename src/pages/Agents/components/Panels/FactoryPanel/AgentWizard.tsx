import React, { memo, useState, useCallback, useEffect } from 'react';
import { useAgentStore } from '../../../../../stores/agentStore';
import { Icons } from '../../shared/Icons';
import { createAgent as createAgentApi, getAgentProvidersCatalog } from '../../../../../api/agents';
import type { ProviderCatalogProvider } from '../../../../../api/agents';
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
  { id: 'review', title: 'Review', description: 'Review and create your agent' },
];

const AGENT_TYPES = [
  { id: 'executor', name: 'Task Executor', icon: 'Zap', description: 'Executes specific tasks and workflows' },
  { id: 'researcher', name: 'Researcher', icon: 'Search', description: 'Analyzes data and provides insights' },
  { id: 'coder', name: 'Code Assistant', icon: 'Code', description: 'Writes, reviews, and debugs code' },
  { id: 'planner', name: 'Planner', icon: 'Calendar', description: 'Plans and organizes complex tasks' },
  { id: 'assistant', name: 'General Assistant', icon: 'MessageSquare', description: 'Versatile helper for various tasks' },
];


const TOOLS = [
  { id: 'web_search', name: 'Web Search', icon: 'Search', description: 'Search the internet for information' },
  { id: 'code_exec', name: 'Code Execution', icon: 'Code', description: 'Run code in a secure sandbox' },
  { id: 'file_access', name: 'File Access', icon: 'Folder', description: 'Read and write files' },
  { id: 'api_calls', name: 'API Calls', icon: 'External', description: 'Make HTTP requests to external APIs' },
];

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
  const [mode, setMode] = useState<'governed' | 'unbounded'>('governed');

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
        tools: selectedTools,
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 4096,
      };

      const result = await createAgentApi(agentData);
      
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
                <div className={styles.providerChips}>
                  {dynamicProviders.map((p) => (
                    <button
                      key={p.id}
                      className={`${styles.providerChip} ${provider === p.id ? styles.selected : ''} ${!p.available ? styles.unavailable : ''}`}
                      onClick={() => handleProviderSelect(p.id)}
                      disabled={!p.available}
                      title={
                        p.has_user_key && !p.live
                          ? `${p.name} — available via your API key`
                          : p.live
                            ? `${p.name} — live`
                            : `${p.name} — unavailable`
                      }
                    >
                      <span className={styles.providerChipName}>{p.name}</span>
                      <span className={`${styles.statusDot} ${p.available ? styles.online : styles.offline}`} />
                      {p.has_user_key && <span className={styles.keyIcon} title="Using your API key">🔑</span>}
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
                  {activeProvider?.tier && (
                    <span className={styles.tierBadge}>{activeProvider.tier}</span>
                  )}
                </div>
              )}

              {/* BYOK link */}
              {activeProvider?.supports_byok && (
                <div className={styles.byokRow}>
                  <span className={styles.byokLabel}>
                    {activeProvider.has_user_key
                      ? '✅ Using your API key'
                      : '💡 Bring your own key for free usage'}
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
            <p className={styles.toolsIntro}>Select the tools your agent can use (optional):</p>
            <div className={styles.toolsGrid}>
              {TOOLS.map((tool) => {
                const IconComponent = (Icons as any)[tool.icon] || Icons.Zap;
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    className={`${styles.toolCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => toggleTool(tool.id)}
                  >
                    <div className={styles.toolIcon}>
                      <IconComponent />
                    </div>
                    <div className={styles.toolInfo}>
                      <h4>{tool.name}</h4>
                      <p>{tool.description}</p>
                    </div>
                    <div className={styles.toolCheckbox}>
                      {isSelected ? <Icons.CheckCircle /> : <Icons.Circle />}
                    </div>
                  </button>
                );
              })}
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
                  <span className={styles.reviewLabel}>Tools</span>
                  <span className={styles.reviewValue}>
                    {selectedTools.length > 0 
                      ? selectedTools.map(t => TOOLS.find(tool => tool.id === t)?.name).join(', ')
                      : 'None selected'}
                  </span>
                </div>
                {description && (
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Description</span>
                    <span className={styles.reviewValue}>{description}</span>
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
