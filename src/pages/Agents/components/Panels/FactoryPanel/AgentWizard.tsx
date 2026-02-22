import React, { memo, useState, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores/agentStore';
import { Icons } from '../../shared/Icons';
import { createAgent as createAgentApi } from '../../../../../api/agents';
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

const PROVIDERS = [
  { id: 'groq', name: 'Groq (Fast)', model: 'llama-3.3-70b-versatile', description: 'Ultra-fast inference' },
  { id: 'openai', name: 'OpenAI GPT-4', model: 'gpt-4o', description: 'Most capable model' },
  { id: 'anthropic', name: 'Claude 3.5', model: 'claude-3.5-sonnet', description: 'Best for coding & analysis' },
  { id: 'google', name: 'Gemini 2.0', model: 'gemini-2.0-flash', description: 'Fast and efficient' },
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

const AgentWizardComponent: React.FC<AgentWizardProps> = ({ className, onComplete, onCancel }) => {
  const { addAgent } = useAgentStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentType, setAgentType] = useState('executor');
  const [provider, setProvider] = useState('groq');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [mode, setMode] = useState<'governed' | 'unbounded'>('governed');

  const currentStepData = WIZARD_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const isReviewStep = currentStepData.id === 'review';

  const canProceed = useCallback(() => {
    switch (currentStepData.id) {
      case 'basics':
        return name.trim().length >= 2;
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
  }, [currentStepData.id, name, agentType, provider, model]);

  const handleNext = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleProviderSelect = useCallback((providerId: string) => {
    const providerData = PROVIDERS.find(p => p.id === providerId);
    setProvider(providerId);
    if (providerData) {
      setModel(providerData.model);
    }
  }, []);

  const toggleTool = useCallback((toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  }, []);

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
          name: agentData.name,
          description: agentData.description,
          type: agentData.type,
          status: 'idle',
          mode: agentData.mode,
          provider: agentData.provider,
          model: agentData.model,
          tools: agentData.tools,
          executions: 0,
          costToday: 0,
          persisted: true,
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
            <div className={styles.inputGroup}>
              <label htmlFor="agent-name">Agent Name *</label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Research Assistant, Code Helper"
                autoFocus
              />
              <span className={styles.hint}>Choose a descriptive name (min 2 characters)</span>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="agent-description">Description (optional)</label>
              <textarea
                id="agent-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this agent do?"
                rows={3}
              />
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

      case 'model':
        return (
          <div className={styles.stepContent}>
            <div className={styles.providerGrid}>
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  className={`${styles.providerCard} ${provider === p.id ? styles.selected : ''}`}
                  onClick={() => handleProviderSelect(p.id)}
                >
                  <div className={styles.providerInfo}>
                    <h4>{p.name}</h4>
                    <p>{p.description}</p>
                    <span className={styles.modelName}>{p.model}</span>
                  </div>
                  {provider === p.id && (
                    <div className={styles.checkmark}>
                      <Icons.CheckCircle />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className={styles.modeToggle}>
              <label>Governance Mode:</label>
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
                    setProvider('groq');
                    setModel('llama-3.3-70b-versatile');
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
        const selectedProvider = PROVIDERS.find(p => p.id === provider);

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
          <button
            className={styles.backBtn}
            onClick={isFirstStep ? onCancel : handleBack}
          >
            {isFirstStep ? 'Cancel' : 'Back'}
          </button>
          
          {isReviewStep ? (
            <button
              className={styles.createBtn}
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Agent'}
            </button>
          ) : (
            <button
              className={styles.nextBtn}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const AgentWizard = memo(AgentWizardComponent);
export default AgentWizard;
