import React, { memo, useState, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import type { Agent } from '../../../../../types';
import { createAgent as createAgentApi } from '../../../../../api/agents';
import styles from './SimpleFactory.module.css';

interface SimpleFactoryProps {
  className?: string;
}

const TEMPLATES = [
  {
    id: 'research',
    name: 'Research Assistant',
    description: 'Analyzes information, conducts research, and provides detailed insights',
    icon: 'Search',
    color: '#3b82f6',
    provider: 'openai',
    model: 'gpt-4-turbo',
    prompt: 'You are a research assistant. Help users find information, analyze data, and provide insights.',
  },
  {
    id: 'coder',
    name: 'Code Assistant',
    description: 'Writes, reviews, and debugs code across multiple languages',
    icon: 'Code',
    color: '#8b5cf6',
    provider: 'anthropic',
    model: 'claude-3-opus',
    prompt: 'You are a coding assistant. Help users write, debug, and optimize code.',
  },
  {
    id: 'writer',
    name: 'Content Writer',
    description: 'Creates engaging content, articles, and marketing copy',
    icon: 'Edit',
    color: '#ec4899',
    provider: 'openai',
    model: 'gpt-4',
    prompt: 'You are a content writer. Create engaging, well-structured content for various purposes.',
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Processes data, creates visualizations, and generates reports',
    icon: 'BarChart',
    color: '#10b981',
    provider: 'openai',
    model: 'gpt-4-turbo',
    prompt: 'You are a data analyst. Help users analyze data, create insights, and generate reports.',
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Handles customer inquiries with empathy and efficiency',
    icon: 'MessageCircle',
    color: '#f59e0b',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    prompt: 'You are a customer support agent. Help users with their questions and issues professionally.',
  },
  {
    id: 'planner',
    name: 'Task Planner',
    description: 'Breaks down complex projects into actionable steps',
    icon: 'List',
    color: '#06b6d4',
    provider: 'openai',
    model: 'gpt-4',
    prompt: 'You are a task planner. Help users break down complex projects into manageable steps.',
  },
];

const SimpleFactoryComponent: React.FC<SimpleFactoryProps> = ({ className }) => {
  const { addAgent } = useAgentStore();
  
  const [view, setView] = useState<'templates' | 'custom'>('templates');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const createAgentFromTemplate = useCallback(async (template: typeof TEMPLATES[0]) => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await createAgentApi({
        name: template.name,
        description: template.description,
        system_prompt: template.prompt,
        model: template.model,
        temperature: 0.7,
        max_tokens: 4096,
        tools: [],
      });

      const newAgent: Agent = {
        id: response.id,
        hash: response.id,
        name: response.name,
        type: 'executor',
        status: 'idle',
        mode: 'governed',
        version: String(response.version) + '.0.0',
        capabilities: [],
        walletBalance: 0,
        riskLevel: 'low',
        utilityScore: 0,
        executions: 0,
        costToday: 0,
        pendingApprovals: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: response.id,
        config: {
          provider: template.provider,
          model: template.model,
          systemPrompt: template.prompt,
          temperature: 0.7,
          maxTokens: 4096,
          tools: (response.tools || []).map((toolName: string) => ({
            id: toolName,
            name: toolName,
            description: toolName,
            enabled: true,
          })),
          memoryConfig: { shortTermLimit: 10, longTermEnabled: true, vectorStoreEnabled: false, contextWindow: 8192 },
          autonomyConfig: { canSpawnSubAgents: false, canModifySelf: false, canAccessNetwork: true, canExecuteCode: false, maxConcurrentTasks: 5 },
        },
      };

      addAgent(newAgent);
      setSuccess(`${template.name} created successfully!`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  }, [addAgent]);

  const createCustomAgent = useCallback(async () => {
    if (!customName.trim()) {
      setError('Please enter an agent name');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await createAgentApi({
        name: customName,
        description: customDescription || undefined,
        system_prompt: 'You are a helpful AI assistant.',
        model: 'gpt-4-turbo',
        temperature: 0.7,
        max_tokens: 4096,
        tools: [],
      });

      const newAgent: Agent = {
        id: response.id,
        hash: response.id,
        name: response.name,
        type: 'executor',
        status: 'idle',
        mode: 'governed',
        version: String(response.version) + '.0.0',
        capabilities: [],
        walletBalance: 0,
        riskLevel: 'low',
        utilityScore: 0,
        executions: 0,
        costToday: 0,
        pendingApprovals: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: response.id,
        config: {
          provider: 'openai',
          model: 'gpt-4-turbo',
          systemPrompt: 'You are a helpful AI assistant.',
          temperature: 0.7,
          maxTokens: 4096,
          tools: (response.tools || []).map((toolName: string) => ({
            id: toolName,
            name: toolName,
            description: toolName,
            enabled: true,
          })),
          memoryConfig: { shortTermLimit: 10, longTermEnabled: true, vectorStoreEnabled: false, contextWindow: 8192 },
          autonomyConfig: { canSpawnSubAgents: false, canModifySelf: false, canAccessNetwork: true, canExecuteCode: false, maxConcurrentTasks: 5 },
        },
      };

      addAgent(newAgent);
      setSuccess(`${customName} created successfully!`);
      setCustomName('');
      setCustomDescription('');
      
      setTimeout(() => {
        setSuccess(null);
        setView('templates');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  }, [customName, customDescription, addAgent]);

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      Search: <Icons.Search />,
      Code: <Icons.Code />,
      Edit: <Icons.Edit />,
      BarChart: <Icons.BarChart />,
      MessageCircle: <Icons.MessageCircle />,
      List: <Icons.List />,
    };
    return iconMap[iconName] || <Icons.Zap />;
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Create New Agent</h1>
          <p>Choose a template or create a custom agent</p>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={view === 'templates' ? styles.active : ''}
            onClick={() => setView('templates')}
          >
            <Icons.Grid /> Templates
          </button>
          <button
            className={view === 'custom' ? styles.active : ''}
            onClick={() => setView('custom')}
          >
            <Icons.Plus /> Custom
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className={styles.alert} data-type="error">
          <Icons.XCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <Icons.X />
          </button>
        </div>
      )}
      
      {success && (
        <div className={styles.alert} data-type="success">
          <Icons.CheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {view === 'templates' ? (
          <div className={styles.templatesView}>
            <div className={styles.templatesGrid}>
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={styles.templateCard}
                  style={{ '--card-color': template.color } as React.CSSProperties}
                >
                  {/* Card Header with Icon and Info */}
                  <div className={styles.cardHeader}>
                    <div className={styles.templateIcon}>
                      {getIcon(template.icon)}
                    </div>
                    <div className={styles.cardInfo}>
                      <h3>{template.name}</h3>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className={styles.cardBody}>
                    <p>{template.description}</p>
                  </div>
                  
                  {/* Footer with Create Button */}
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.createButton}
                      onClick={() => createAgentFromTemplate(template)}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Icons.Refresh className={styles.spin} />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Icons.Plus />
                          Create Agent
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.customView}>
            <div className={styles.customForm}>
              <div className={styles.formHeader}>
                <Icons.Sparkles />
                <h2>Create Custom Agent</h2>
                <p>Build an agent tailored to your specific needs</p>
              </div>

              <div className={styles.formGroup}>
                <label>Agent Name *</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., My Research Assistant"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description (optional)</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe what this agent will do..."
                  className={styles.textarea}
                  rows={4}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setView('templates')}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={createCustomAgent}
                  disabled={!customName.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Icons.Refresh className={styles.spin} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icons.Plus />
                      Create Agent
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.infoPanel}>
              <div className={styles.infoCard}>
                <Icons.Info />
                <h3>Smart Defaults</h3>
                <p>Your agent will be created with optimized settings:</p>
                <ul>
                  <li>GPT-4 Turbo model</li>
                  <li>Balanced temperature (0.7)</li>
                  <li>4K token context</li>
                  <li>Governed autonomy mode</li>
                </ul>
              </div>
              
              <div className={styles.infoCard}>
                <Icons.Settings />
                <h3>Customize Later</h3>
                <p>You can always adjust advanced settings after creation in the agent settings panel.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SimpleFactory = memo(SimpleFactoryComponent);
export default SimpleFactory;
