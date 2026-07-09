/**
 * Agent Editor Component
 * Create or edit an agent with tabs for different settings
 */
import React, { useState, useEffect } from 'react';
import { settingsApi, type Agent } from '@/api/settings';
import { getAvailableTools, type AvailableTool } from '@/api/agents';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { MemorySettings } from './MemorySettings';
import { AnchorManagement } from './AnchorManagement';
import { RestrictionsPanel } from './RestrictionsPanel';
import { APIKeyManagement } from './APIKeyManagement';
import { AgentExportImport } from './AgentExportImport';
import { AgentTemplates } from './AgentTemplates';
import { SystemWeightsSettings } from './SystemWeightsSettings';
import { AgentSharePanel } from './AgentSharePanel';
import { SharedAgentImport } from './SharedAgentImport';
import { AgentMetrics } from './AgentMetrics';
import { 
  MemoryIcon, 
  AnchorIcon, 
  RestrictionIcon, 
  APIKeyIcon, 
  ExportIcon, 
  ImportIcon, 
  TemplateIcon,
  SaveIcon,
  EditIcon,
  MetricsIcon,
  BackArrowIcon,
  ShareIcon
} from '@/components/Icons/SettingsIcons';
import { Tooltip } from '@/components/ui/Tooltip';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { logger } from '@/utils/logger';
import styles from './AgentEditor.module.css';

interface AgentEditorProps {
  agentId?: string;
  onBack: () => void;
  onSave: () => void;
}

type TabType = 'basic' | 'memory' | 'anchors' | 'restrictions' | 'api-keys' | 'export-import' | 'templates' | 'weights' | 'metrics' | 'share' | 'import';
type PromptInputMode = 'text' | 'json';

export const AgentEditor: React.FC<AgentEditorProps> = ({ agentId, onBack, onSave }) => {
  const [loading, setLoading] = useState(!!agentId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [promptInputMode, setPromptInputMode] = useState<PromptInputMode>('text');
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    personality_config: {} as Record<string, any>,
    isolate_anchors: true, // Default to isolated
    tool_mode: 'smart' as string,
    tools: [] as string[],
    tool_config: {} as Record<string, any>,
  });

  const [availableTools, setAvailableTools] = useState<AvailableTool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);

  const [agentData, setAgentData] = useState<Agent | null>(null);

  useEffect(() => {
    if (agentId) {
      loadAgent();
    }
  }, [agentId]);

  const loadAgent = async () => {
    if (!agentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const agent = await settingsApi.getAgent(agentId);
      setAgentData(agent);
      setFormData({
        name: agent.name || '',
        description: agent.description || '',
        system_prompt: agent.system_prompt || '',
        personality_config: agent.personality_config || {},
        isolate_anchors: agent.isolate_anchors !== undefined ? agent.isolate_anchors : true,
        tool_mode: agent.tool_mode || 'smart',
        tools: agent.tools || [],
        tool_config: agent.tool_config || {},
      });
      // Load available tools if agent is in manual mode
      if (agent.tool_mode === 'manual') {
        setToolsLoading(true);
        getAvailableTools().then(t => setAvailableTools(t)).finally(() => setToolsLoading(false));
      }
    } catch (err: any) {
      logger.error('Failed to load agent', err);
      setError(err?.message || 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent editing if agent is imported (read-only)
    if (agentId && agentData?.is_imported) {
      setError('This is a shared agent. Only the creator can edit it.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);

      if (agentId) {
        await settingsApi.updateAgent(agentId, {
          ...formData,
          isolate_anchors: formData.isolate_anchors,
          tool_mode: formData.tool_mode,
          tools: formData.tool_mode === 'smart' ? [] : formData.tools,
          tool_config: formData.tool_config,
        });
      } else {
        await settingsApi.createAgent(formData);
      }

      onSave();
    } catch (err: any) {
      logger.error('Failed to save agent', err);
      setError(err?.message || 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Convert text prompt to structured JSON format
  const convertTextToPromptJson = (text: string): string => {
    try {
      // If it's already valid JSON, return as-is
      JSON.parse(text);
      return text;
    } catch {
      // Convert plain text to structured prompt JSON
      const promptObject = {
        role: "system",
        content: text,
        metadata: {
          version: "1.0",
          created_at: new Date().toISOString(),
          type: "custom"
        }
      };
      return JSON.stringify(promptObject, null, 2);
    }
  };

  // Validate JSON prompt format
  const validateJsonPrompt = (jsonStr: string): { valid: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.content && !parsed.role) {
        return { valid: false, error: "JSON must contain 'content' or 'role' field" };
      }
      return { valid: true };
    } catch (e) {
      return { valid: false, error: `Invalid JSON: ${(e as Error).message}` };
    }
  };

  // Handle prompt input change with validation
  const handlePromptChange = (value: string) => {
    setJsonError(null);
    
    if (promptInputMode === 'json') {
      const validation = validateJsonPrompt(value);
      if (!validation.valid) {
        setJsonError(validation.error || 'Invalid JSON format');
      }
    }
    
    handleChange('system_prompt', value);
  };

  // Toggle between text and JSON mode
  const togglePromptMode = () => {
    if (promptInputMode === 'text') {
      // Converting to JSON mode - convert text to JSON
      const jsonPrompt = convertTextToPromptJson(formData.system_prompt);
      handleChange('system_prompt', jsonPrompt);
      setPromptInputMode('json');
    } else {
      // Converting to text mode - extract content from JSON
      try {
        const parsed = JSON.parse(formData.system_prompt);
        const textContent = parsed.content || formData.system_prompt;
        handleChange('system_prompt', textContent);
      } catch {
        // Keep as-is if not valid JSON
      }
      setPromptInputMode('text');
      setJsonError(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading agent..." />;
  }

  // Don't show tabs for new agents (no agentId)
  const showTabs = !!agentId;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Tooltip content="Go back to agents list">
          <button className={styles.backButton} onClick={onBack}>
            <BackArrowIcon size={16} />
            <span>Back</span>
          </button>
        </Tooltip>
        <h1 className={styles.title}>
          {agentId ? 'Edit Agent' : 'Create Agent'}
        </h1>
      </div>

      {error && (
        <div className={styles.error}>
          <ErrorState message={error} />
        </div>
      )}

      {showTabs && (
        <div className={styles.tabs}>
          <Tooltip content="Basic agent information: name, description, and system prompt">
            <button
              className={`${styles.tab} ${activeTab === 'basic' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <EditIcon size={16} />
              <span>Info</span>
            </button>
          </Tooltip>
          <Tooltip content="Configure memory retention, importance thresholds, and search settings">
            <button
              className={`${styles.tab} ${activeTab === 'memory' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('memory')}
            >
              <MemoryIcon size={16} />
              <span>Memory</span>
            </button>
          </Tooltip>
          <Tooltip content="View and manage memory anchors - stable semantic knowledge nodes">
            <button
              className={`${styles.tab} ${activeTab === 'anchors' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('anchors')}
            >
              <AnchorIcon size={16} />
              <span>Anchors</span>
            </button>
          </Tooltip>
          <Tooltip content="Set forbidden words, restricted topics, and content filters">
            <button
              className={`${styles.tab} ${activeTab === 'restrictions' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('restrictions')}
            >
              <RestrictionIcon size={16} />
              <span>Restrictions</span>
            </button>
          </Tooltip>
          <Tooltip content="Generate and manage API keys for external application integration">
            <button
              className={`${styles.tab} ${activeTab === 'api-keys' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('api-keys')}
            >
              <APIKeyIcon size={16} />
              <span>API</span>
            </button>
          </Tooltip>
          <Tooltip content="Export agent configuration as JSON or import from a file">
            <button
              className={`${styles.tab} ${activeTab === 'export-import' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('export-import')}
            >
              <ExportIcon size={16} />
              <span>Export/Import</span>
            </button>
          </Tooltip>
          <Tooltip content="Save agent as template or create new agents from existing templates">
            <button
              className={`${styles.tab} ${activeTab === 'templates' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              <TemplateIcon size={16} />
              <span>Templates</span>
            </button>
          </Tooltip>
          <Tooltip content="Configure Hash Sphere, RAG, and Memory percentage weights">
            <button
              className={`${styles.tab} ${activeTab === 'weights' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('weights')}
            >
              <MemoryIcon size={16} />
              <span>Weights</span>
            </button>
          </Tooltip>
          <Tooltip content="View agent performance metrics and analytics">
            <button
              className={`${styles.tab} ${activeTab === 'metrics' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('metrics')}
            >
              <MetricsIcon size={16} />
              <span>Metrics</span>
            </button>
          </Tooltip>
          <Tooltip content="Share this agent with others using agent hash">
            <button
              className={`${styles.tab} ${activeTab === 'share' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('share')}
            >
              <ShareIcon size={16} />
              <span>Share</span>
            </button>
          </Tooltip>
          <Tooltip content="Import a shared agent from another user using agent hash">
            <button
              className={`${styles.tab} ${activeTab === 'import' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('import')}
            >
              <ImportIcon size={16} />
              <span>Import</span>
            </button>
          </Tooltip>
        </div>
      )}

      {activeTab === 'basic' && (
        <form onSubmit={handleSubmit} className={styles.form}>
        {agentData?.is_imported && (
          <div className={styles.readOnlyNotice}>
            <p>⚠️ This is a shared agent. You can view all settings but cannot edit them. Only the creator can modify this agent.</p>
          </div>
        )}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="My AI Agent"
            disabled={agentData?.is_imported}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            placeholder="A helpful AI assistant for..."
            disabled={agentData?.is_imported}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>System Prompt</label>
            <div className={styles.promptModeToggle}>
              <button
                type="button"
                className={`${styles.modeButton} ${promptInputMode === 'text' ? styles.activeModeButton : ''}`}
                onClick={() => promptInputMode !== 'text' && togglePromptMode()}
                disabled={agentData?.is_imported}
              >
                Text
              </button>
              <button
                type="button"
                className={`${styles.modeButton} ${promptInputMode === 'json' ? styles.activeModeButton : ''}`}
                onClick={() => promptInputMode !== 'json' && togglePromptMode()}
                disabled={agentData?.is_imported}
              >
                JSON
              </button>
            </div>
          </div>
          <textarea
            className={`${styles.textarea} ${promptInputMode === 'json' ? styles.jsonTextarea : ''} ${jsonError ? styles.textareaError : ''}`}
            value={formData.system_prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            rows={promptInputMode === 'json' ? 12 : 8}
            placeholder={promptInputMode === 'text' 
              ? "You are a helpful AI assistant. Your personality is..."
              : '{\n  "role": "system",\n  "content": "You are a helpful AI assistant...",\n  "metadata": {\n    "version": "1.0",\n    "type": "custom"\n  }\n}'
            }
            disabled={agentData?.is_imported}
            style={promptInputMode === 'json' ? { fontFamily: 'monospace', fontSize: '13px' } : undefined}
          />
          {jsonError && (
            <p className={styles.errorText}>{jsonError}</p>
          )}
          <p className={styles.helpText}>
            {promptInputMode === 'text' 
              ? <>Customize the system prompt that will be sent to the LLM for this agent. You can use variables like {'{user_name}'}, {'{context}'}, {'{memory}'}.</>
              : <>Enter a structured JSON prompt. Must contain "content" or "role" field. The backend will automatically parse and validate the JSON format.</>
            }
          </p>
        </div>

        {/* Tool Mode Section */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Tool Mode</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => handleChange('tool_mode', 'smart')}
              disabled={agentData?.is_imported}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: formData.tool_mode === 'smart' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                background: formData.tool_mode === 'smart' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.04)',
                color: formData.tool_mode === 'smart' ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                cursor: agentData?.is_imported ? 'not-allowed' : 'pointer',
                fontWeight: formData.tool_mode === 'smart' ? 600 : 400,
                fontSize: '13px',
                textAlign: 'left' as const,
              }}
            >
              <div style={{ fontWeight: 600 }}>Smart (Auto)</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>All tools available — AI picks the right ones</div>
            </button>
            <button
              type="button"
              onClick={() => {
                handleChange('tool_mode', 'manual');
                if (availableTools.length === 0) {
                  setToolsLoading(true);
                  getAvailableTools().then(t => setAvailableTools(t)).finally(() => setToolsLoading(false));
                }
              }}
              disabled={agentData?.is_imported}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: formData.tool_mode === 'manual' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
                background: formData.tool_mode === 'manual' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.04)',
                color: formData.tool_mode === 'manual' ? '#fbbf24' : 'rgba(255,255,255,0.6)',
                cursor: agentData?.is_imported ? 'not-allowed' : 'pointer',
                fontWeight: formData.tool_mode === 'manual' ? 600 : 400,
                fontSize: '13px',
                textAlign: 'left' as const,
              }}
            >
              <div style={{ fontWeight: 600 }}>Manual</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>You choose exactly which tools to enable</div>
            </button>
          </div>

          {formData.tool_mode === 'manual' && (
            <div style={{ marginTop: '12px' }}>
              {toolsLoading ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(255,255,255,0.5)' }}>Loading tools...</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                  {availableTools.map((tool) => {
                    const isSelected = formData.tools.includes(tool.name);
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        disabled={agentData?.is_imported}
                        onClick={() => {
                          const newTools = isSelected
                            ? formData.tools.filter(t => t !== tool.name)
                            : [...formData.tools, tool.name];
                          handleChange('tools', newTools);
                        }}
                        title={tool.description}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                          background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.04)',
                          color: isSelected ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                          cursor: agentData?.is_imported ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        {tool.name.replace(/_/g, ' ')}
                        {tool.byok_provider && <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.6 }}>({tool.byok_provider})</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className={styles.helpText} style={{ marginTop: '8px' }}>
                {formData.tools.length} tool{formData.tools.length !== 1 ? 's' : ''} selected.
                Tools with a provider tag require your own API key (BYOK).
              </p>
            </div>
          )}
          {/* Voice picker for text-to-speech — shown whenever generate_audio could run:
              always in "smart" mode (all tools available), or when explicitly selected in "manual" mode. */}
          {(formData.tool_mode === 'smart' || formData.tools.includes('generate_audio')) && (() => {
            const audioTool = availableTools.find(t => t.name === 'generate_audio');
            const voiceOptions: string[] = audioTool?.parameters_schema?.properties?.voice?.enum
              || ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
            const selectedVoices: string[] = formData.tool_config?.generate_audio?.voices || [];
            const toggleVoice = (voice: string) => {
              const next = selectedVoices.includes(voice)
                ? selectedVoices.filter(v => v !== voice)
                : [...selectedVoices, voice];
              handleChange('tool_config', {
                ...formData.tool_config,
                generate_audio: { ...(formData.tool_config.generate_audio || {}), voices: next },
              });
            };
            return (
              <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'rgba(255,255,255,0.8)' }}>
                  Text-to-speech voices
                </div>
                <p className={styles.helpText} style={{ marginTop: 0, marginBottom: '8px' }}>
                  Pick which voices this agent may use for generate_audio (e.g. a distinct voice per story character). Leave none selected to default to a single voice ("alloy") every time. Requires your own OpenAI API key.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                  {voiceOptions.map((voice) => {
                    const checked = selectedVoices.includes(voice);
                    return (
                      <button
                        key={voice}
                        type="button"
                        disabled={agentData?.is_imported}
                        onClick={() => toggleVoice(voice)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '14px',
                          border: checked ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.15)',
                          background: checked ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.04)',
                          color: checked ? '#c084fc' : 'rgba(255,255,255,0.6)',
                          cursor: agentData?.is_imported ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          fontWeight: checked ? 600 : 400,
                        }}
                      >
                        {voice}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {agentId && (
          <div className={styles.formGroup}>
            <div className={styles.toggleGroup}>
              <label className={styles.label}>
                Isolate Anchors
                <Tooltip content="When ON: Anchors are isolated to this agent only. When OFF: Anchors are shared across all your agents.">
                  <span className={styles.infoIcon}>ℹ️</span>
                </Tooltip>
              </label>
              <div className={styles.toggleContainer}>
                <ToggleSwitch
                  checked={formData.isolate_anchors}
                  onChange={(checked) => handleChange('isolate_anchors', checked)}
                  disabled={agentData?.is_imported}
                  showLabel
                />
                <span className={styles.toggleDescription}>
                  {formData.isolate_anchors 
                    ? "Anchors are isolated to this agent"
                    : "Anchors are shared across all agents"}
                </span>
              </div>
              <p className={styles.helpText}>
                {formData.isolate_anchors
                  ? "Each agent will have its own isolated memory anchors. Better for specialized agents."
                  : "All agents will share the same memory anchors. Better for general-purpose assistants."}
              </p>
            </div>
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onBack}
            disabled={saving}
          >
            Cancel
          </button>
          {!agentData?.is_imported && (
            <Tooltip content={agentId ? "Save changes to this agent" : "Create a new agent with the specified configuration"}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={saving || !formData.name}
              >
                <SaveIcon size={16} />
                <span>{saving ? 'Saving...' : agentId ? 'Update Agent' : 'Create Agent'}</span>
              </button>
            </Tooltip>
          )}
          {agentData?.is_imported && (
            <Tooltip content="This is a shared agent. You cannot save changes. Only the creator can modify it.">
              <button
                type="button"
                className={styles.saveButton}
                disabled
              >
                <SaveIcon size={16} />
                <span>Read-Only (Cannot Edit)</span>
              </button>
            </Tooltip>
          )}
        </div>
      </form>
      )}

      {activeTab === 'memory' && agentId && (
        <MemorySettings agentId={agentId} />
      )}

      {activeTab === 'anchors' && agentId && (
        <AnchorManagement agentId={agentId} />
      )}

      {activeTab === 'restrictions' && agentId && (
        <RestrictionsPanel agentId={agentId} />
      )}

      {activeTab === 'api-keys' && agentId && (
        <APIKeyManagement agentId={agentId} />
      )}

      {activeTab === 'export-import' && agentId && (
        <AgentExportImport
          agentId={agentId}
          agentName={formData.name}
          onImportComplete={onSave}
        />
      )}

      {activeTab === 'templates' && agentId && (
        <AgentTemplates
          agentId={agentId}
          agentName={formData.name}
          onTemplateCreated={onSave}
          onAgentCreated={onSave}
        />
      )}

      {activeTab === 'weights' && agentId && (
        <SystemWeightsSettings agentId={agentId} />
      )}

      {activeTab === 'metrics' && agentId && (
        <AgentMetrics agentId={agentId} />
      )}

      {activeTab === 'share' && agentId && (
        <AgentSharePanel
          agentId={agentId}
          agentHash={agentData?.agent_hash}
          isPublic={agentData?.is_public}
        />
      )}

      {activeTab === 'import' && (
        <SharedAgentImport
          onImportSuccess={() => {
            onSave();
            onBack();
          }}
        />
      )}
    </div>
  );
};

