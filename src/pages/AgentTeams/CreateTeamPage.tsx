import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAgentTeam, type CreateTeamRequest } from '../../api/agentTeams';
import { listAgents, type AgentResponse } from '../../api/agents';
import { Button } from '../../components/ui';
import { useToastContext } from '../../context/ToastContext';
import logger from '../../utils/logger';
import { validateWorkflowConfig, suggestCorrectedConfig } from '../../utils/workflowValidator';
import styles from '../Help/HelpCenterPage.module.css';

const CreateTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [workflowType, setWorkflowType] = useState<'sequential' | 'parallel'>('sequential');
  const [workflowConfigJson, setWorkflowConfigJson] = useState<string>('');
  const [useCustomConfig, setUseCustomConfig] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [workflowWarnings, setWorkflowWarnings] = useState<string[]>([]);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [availableAgents, setAvailableAgents] = useState<AgentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agents = await listAgents();
        setAvailableAgents(agents);
      } catch (err: unknown) {
        logger.error('Failed to load agents:', err);
        showError('Failed to load agents');
      } finally {
        setLoading(false);
      }
    };
    loadAgents();
  }, [showError]);

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Team name is required');
      showError('Team name is required');
      return;
    }
    if (selectedAgents.length === 0) {
      setError('Please select at least one agent');
      showError('Please select at least one agent');
      return;
    }

    setCreating(true);
    try {
      let workflowConfig: any = {
        type: workflowType,
      };

      // Auto-generate steps for Simple mode
      if (!useCustomConfig && selectedAgents.length > 0) {
        const steps: Array<{
          id: string;
          agentId: string;
          inputKey: string;
          outputKey: string;
          role?: string;
        }> = [];
        
        // Validate that all agents are unique
        const uniqueAgents = new Set(selectedAgents);
        if (uniqueAgents.size !== selectedAgents.length) {
          const errorMsg = '⚠️ You have selected the same agent multiple times. Each step must use a different agent.';
          setError(errorMsg);
          showError(errorMsg);
          setCreating(false);
          return;
        }
        
        selectedAgents.forEach((agentId, index) => {
          const agent = availableAgents.find(a => a.id === agentId);
          const stepId = agent?.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `step_${index + 1}`;
          const outputKey = stepId;
          
          // For sequential: each step uses previous step's outputKey
          // For parallel: all steps use userInput (backend handles parallel execution)
          let inputKey: string;
          if (workflowType === 'sequential') {
            if (index === 0) {
              inputKey = 'userInput';
            } else {
              // Use the ACTUAL outputKey from the previous step (already created)
              const prevStep = steps[index - 1];
              inputKey = prevStep.outputKey;
            }
          } else {
            // Parallel: all steps start with userInput
            inputKey = 'userInput';
          }
          
          steps.push({
            id: stepId,
            agentId: agentId,
            inputKey: inputKey,
            outputKey: outputKey,
            role: agent?.meta_data?.role || agent?.name,
          });
        });
        
        workflowConfig = {
          type: workflowType,
          steps: steps,
        };
        
        // Validate auto-generated config
        const validation = validateWorkflowConfig(workflowConfig);
        if (!validation.valid) {
          const errorMsg = `Auto-generated workflow validation failed:\n${validation.errors.join('\n')}`;
          setError(errorMsg);
          showError(errorMsg);
          setCreating(false);
          return;
        }
      } else if (useCustomConfig && workflowConfigJson.trim()) {
        try {
          const parsed = JSON.parse(workflowConfigJson.trim());
          
          // Validate workflow config
          const validation = validateWorkflowConfig(parsed);
          
          if (!validation.valid) {
            const errorMsg = `Workflow validation failed:\n${validation.errors.join('\n')}`;
            setError(errorMsg);
            showError(errorMsg);
            setCreating(false);
            return;
          }
          
          // Show warnings but allow creation
          if (validation.warnings.length > 0) {
            setWorkflowWarnings(validation.warnings);
            // Show warning toast but don't block
            showError(validation.warnings.join('\n'));
          } else {
            setWorkflowWarnings([]);
          }
          
          // Suggest correction if there's a loop risk
          const corrected = suggestCorrectedConfig(parsed);
          if (corrected) {
            const correctedJson = JSON.stringify(corrected, null, 2);
            const shouldUseCorrected = window.confirm(
              '⚠️ Your final step uses inputKey: "*" which can cause infinite loops.\n\n' +
              'Would you like to use the corrected version that uses explicit inputKeys?\n\n' +
              'Click OK to use the corrected config, or Cancel to proceed with warnings.'
            );
            if (shouldUseCorrected) {
              workflowConfig = corrected;
              setWorkflowConfigJson(correctedJson);
            }
          }
          
          workflowConfig = parsed;
        } catch (parseError) {
          const errorMsg = 'Invalid JSON in workflow config. Please check your syntax.';
          setError(errorMsg);
          showError(errorMsg);
          setCreating(false);
          return;
        }
      }

      const request: CreateTeamRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        agent_ids: selectedAgents,
        workflow_config: workflowConfig,
      };

      await createAgentTeam(request);
      success('Agent team created successfully');
      navigate('/agent-teams');
    } catch (err: unknown) {
      logger.error('Failed to create team:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to create team';
      setError(errorMessage as string);
      showError(errorMessage as string);
    } finally {
      setCreating(false);
    }
  };

  const filteredAgents = availableAgents.filter(agent => {
    const query = agentSearchQuery.toLowerCase();
    return (
      agent.name.toLowerCase().includes(query) ||
      agent.description?.toLowerCase().includes(query) ||
      agent.meta_data?.role?.toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Create Agent Team</h1>
          <p className={styles.subtitle}>
            Build a team of AI agents to work together on complex tasks
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            
            <form onSubmit={handleSubmit}>
              {/* Team Configuration */}
              <section className={styles.contentSection}>
                <h2>Team Configuration</h2>
                <div className={styles.articleCard} style={{cursor: 'default'}}>
                  
                  {error && (
                    <div style={{ 
                      padding: 'var(--space-3)', 
                      background: 'var(--color-bg-error)', 
                      color: 'var(--color-text-error)', 
                      borderRadius: 'var(--radius-md)', 
                      marginBottom: 'var(--space-4)',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  {workflowWarnings.length > 0 && (
                    <div style={{ 
                      padding: 'var(--space-3)', 
                      background: 'var(--color-warning-light)', 
                      color: 'var(--color-warning-700)', 
                      borderRadius: 'var(--radius-md)', 
                      marginBottom: 'var(--space-4)',
                      fontSize: '14px',
                      border: '1px solid var(--color-warning-300)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      <strong>⚠️ Workflow Warnings:</strong>
                      {'\n'}
                      {workflowWarnings.join('\n')}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: '4px' }}>Team Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Code Review Team"
                        style={{
                          width: '100%',
                          padding: 'var(--space-2) var(--space-3)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--font-sm)'
                        }}
                      />
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Enter a descriptive name for your agent team
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: '4px' }}>Description (Optional)</label>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                        Describe what this team does and its purpose
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this team does..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--font-sm)',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <label style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>Workflow Configuration *</label>
                        <span style={{
                          fontSize: 'var(--font-xs)',
                          color: 'var(--color-primary-600)',
                          background: 'var(--color-primary-100)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {useCustomConfig ? 'Custom JSON' : 'Simple'}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                        Choose how to configure the workflow for your agent team
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 'var(--space-3)',
                        marginBottom: 'var(--space-3)'
                      }}>
                        <label style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 'var(--space-2)',
                          cursor: 'pointer',
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${!useCustomConfig ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                          background: !useCustomConfig ? 'var(--color-primary-50)' : 'var(--bg-secondary)',
                          transition: 'all 0.2s',
                          flex: 1,
                          minHeight: '100px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
                            <input
                              type="radio"
                              name="config-mode"
                              checked={!useCustomConfig}
                              onChange={() => setUseCustomConfig(false)}
                              style={{ cursor: 'pointer', accentColor: 'var(--color-primary-500)' }}
                            />
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              Simple
                            </div>
                          </div>
                          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Auto-generate workflow from selected agents
                          </div>
                        </label>
                        <label style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 'var(--space-2)',
                          cursor: 'pointer',
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${useCustomConfig ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                          background: useCustomConfig ? 'var(--color-primary-50)' : 'var(--bg-secondary)',
                          transition: 'all 0.2s',
                          flex: 1,
                          minHeight: '100px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
                            <input
                              type="radio"
                              name="config-mode"
                              checked={useCustomConfig}
                              onChange={() => setUseCustomConfig(true)}
                              style={{ cursor: 'pointer', accentColor: 'var(--color-primary-500)' }}
                            />
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              Custom JSON
                            </div>
                          </div>
                          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Define workflow steps manually with JSON
                          </div>
                        </label>
                      </div>

                      {!useCustomConfig ? (
                        <div>
                          <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: '4px' }}>Workflow Type</label>
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                            Choose how agents execute tasks
                          </div>
                          <select
                            value={workflowType}
                            onChange={(e) => setWorkflowType(e.target.value as 'sequential' | 'parallel')}
                            style={{
                              width: '100%',
                              padding: 'var(--space-2) var(--space-3)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: 'var(--font-sm)'
                            }}
                          >
                            <option value="sequential">Sequential (A → B → C) - Agents work one after another</option>
                            <option value="parallel">Parallel (A, B → C) - Agents work simultaneously</option>
                          </select>
                          
                          {workflowType === 'sequential' && (
                            <div style={{
                              marginTop: 'var(--space-3)',
                              padding: 'var(--space-3)',
                              background: 'var(--color-info-100)',
                              borderLeft: '3px solid var(--color-info-500)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-sm)',
                              color: 'var(--color-info-700)'
                            }}>
                              <strong style={{ display: 'block', marginBottom: 'var(--space-1)', color: 'var(--color-info-800)' }}>
                                ℹ️ How Sequential Workflows Work:
                              </strong>
                              <ul style={{ margin: 'var(--space-2) 0 0 var(--space-5)', padding: 0, listStyle: 'disc' }}>
                                <li style={{ margin: 'var(--space-1) 0' }}>
                                  <strong>Step 1</strong> receives your input and produces output
                                </li>
                                <li style={{ margin: 'var(--space-1) 0' }}>
                                  <strong>Step 2</strong> receives Step 1's output and produces its own output
                                </li>
                                <li style={{ margin: 'var(--space-1) 0' }}>
                                  <strong>Step 3</strong> receives Step 2's output, and so on...
                                </li>
                              </ul>
                              <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-info-200)' }}>
                                <strong>💡 Tip:</strong> Select agents in the order you want them to execute. Each agent will receive the previous agent's output as input.
                              </div>
                            </div>
                          )}
                          
                          {workflowType === 'parallel' && (
                            <div style={{
                              marginTop: 'var(--space-3)',
                              padding: 'var(--space-3)',
                              background: 'var(--color-warning-100)',
                              borderLeft: '3px solid var(--color-warning-500)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-sm)',
                              color: 'var(--color-warning-700)'
                            }}>
                              <strong style={{ display: 'block', marginBottom: 'var(--space-1)', color: 'var(--color-warning-800)' }}>
                                ⚡ Parallel Workflows:
                              </strong>
                              All agents execute simultaneously using the same input. Use this when agents can work independently.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: '4px' }}>Workflow Config JSON *</label>
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                            Define the workflow steps manually using JSON
                          </div>
                          <textarea
                            value={workflowConfigJson}
                            onChange={(e) => {
                              setWorkflowConfigJson(e.target.value);
                              setWorkflowWarnings([]);
                              setError('');
                              if (e.target.value.trim()) {
                                try {
                                  const parsed = JSON.parse(e.target.value.trim());
                                  const validation = validateWorkflowConfig(parsed);
                                  if (validation.warnings.length > 0) {
                                    setWorkflowWarnings(validation.warnings);
                                  }
                                  if (!validation.valid) {
                                    setError(validation.errors.join('\n'));
                                  }
                                } catch {
                                  // Invalid JSON, will be caught on submit
                                }
                              }
                            }}
                            placeholder={`{
  "type": "sequential",
  "steps": [
    {
      "id": "profile",
      "agentId": "agent-uuid-1",
      "inputKey": "userInput",
      "outputKey": "profile",
      "role": "Profile Extractor"
    }
  ]
}`}
                            rows={15}
                            style={{
                              width: '100%',
                              padding: 'var(--space-3)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: 'var(--font-sm)',
                              fontFamily: 'monospace',
                              resize: 'vertical'
                            }}
                          />
                          <div style={{
                            marginTop: 'var(--space-2)',
                            padding: 'var(--space-2)',
                            background: 'var(--color-primary-50)',
                            borderLeft: '3px solid var(--color-primary-500)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-xs)',
                            color: 'var(--color-primary-700)'
                          }}>
                            <strong style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--color-primary-800)' }}>
                              Format:
                            </strong>
                            Each step must have id, agentId, inputKey, outputKey.
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <label style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>Select Agents *</label>
                        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                          {selectedAgents.length} {selectedAgents.length === 1 ? 'agent' : 'agents'} selected
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                        Choose agents to include in this team
                      </div>
                      
                      {availableAgents.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                          <input
                            type="text"
                            placeholder="Search agents by name or role..."
                            value={agentSearchQuery}
                            onChange={(e) => setAgentSearchQuery(e.target.value)}
                            style={{
                              width: '100%',
                              padding: 'var(--space-2) var(--space-3)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: 'var(--font-sm)'
                            }}
                          />
                        </div>
                      )}

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-2)',
                        maxHeight: '600px',
                        overflowY: 'auto'
                      }}>
                        {loading ? (
                          <div style={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center', 
                            padding: 'var(--space-4)', 
                            color: 'var(--text-secondary)' 
                          }}>
                            Loading agents...
                          </div>
                        ) : availableAgents.length === 0 ? (
                          <div style={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center', 
                            padding: 'var(--space-4)', 
                            color: 'var(--text-secondary)' 
                          }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🤖</div>
                            <div style={{ fontWeight: 500, marginBottom: 'var(--space-2)' }}>No agents available</div>
                            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                              Create agents first before building a team
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate('/agents')}
                            >
                              Go to Agents
                            </Button>
                          </div>
                        ) : (
                          (() => {
                            if (filteredAgents.length === 0) {
                              return (
                                <div style={{ 
                                  gridColumn: '1 / -1',
                                  textAlign: 'center', 
                                  padding: 'var(--space-4)', 
                                  color: 'var(--text-secondary)' 
                                }}>
                                  <div style={{ fontWeight: 500 }}>No agents found</div>
                                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>Try adjusting your search query</div>
                                </div>
                              );
                            }

                            return filteredAgents.map((agent) => (
                              <label
                                key={agent.id}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  gap: 'var(--space-1)',
                                  cursor: 'pointer',
                                  padding: 'var(--space-3)',
                                  borderRadius: 'var(--radius-sm)',
                                  border: `2px solid ${selectedAgents.includes(agent.id) ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                                  background: selectedAgents.includes(agent.id) ? 'var(--color-primary-50)' : 'var(--bg-secondary)',
                                  transition: 'all 0.2s',
                                  minHeight: '100px'
                                }}
                                onMouseEnter={(e) => {
                                  if (!selectedAgents.includes(agent.id)) {
                                    e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!selectedAgents.includes(agent.id)) {
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                  }
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedAgents.includes(agent.id)}
                                    onChange={() => handleAgentToggle(agent.id)}
                                    style={{ 
                                      cursor: 'pointer', 
                                      accentColor: 'var(--color-primary-500)',
                                      width: '14px',
                                      height: '14px',
                                      margin: 0
                                    }}
                                  />
                                  <div style={{ 
                                    fontWeight: 600, 
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--font-sm)'
                                  }}>
                                    {agent.name}
                                  </div>
                                </div>
                                {agent.description && (
                                  <div style={{ 
                                    lineHeight: 1.4,
                                    fontSize: 'var(--font-xs)',
                                    color: 'var(--text-secondary)',
                                    marginTop: '4px'
                                  }}>
                                    {agent.description}
                                  </div>
                                )}
                              </label>
                            ));
                          })()
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                      <Button variant="secondary" size="md" type="button" onClick={() => navigate('/agent-teams')}>
                        Cancel
                      </Button>
                      <Button size="md" type="submit" variant="primary" disabled={creating || !name.trim() || selectedAgents.length === 0}>
                        {creating ? 'Creating...' : 'Create Team'}
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </form>

          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>About Agent Teams</h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                Agent teams allow multiple AI agents to collaborate on complex tasks. You can define sequential or parallel workflows to orchestrate their interactions.
              </p>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Workflow Types</h3>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>Sequential</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  Agents execute one after another, passing output to the next agent.
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>Parallel</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  Agents execute simultaneously using the same input.
                </div>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Tips</h3>
              <ul style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', paddingLeft: 'var(--space-4)' }}>
                <li>Give your team a clear, descriptive name.</li>
                <li>Start with a simple sequential workflow.</li>
                <li>Ensure selected agents have distinct roles.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamPage;
