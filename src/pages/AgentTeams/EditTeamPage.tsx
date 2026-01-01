import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateAgentTeam, getAgentTeam, type CreateTeamRequest } from '../../api/agentTeams';
import { listAgents, type AgentResponse } from '../../api/agents';
import { Button } from '../../components/ui';
import { useToastContext } from '../../context/ToastContext';
import logger from '../../utils/logger';
import { validateWorkflowConfig, suggestCorrectedConfig } from '../../utils/workflowValidator';
import styles from '../Help/HelpCenterPage.module.css';

const EditTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { success, error: showError } = useToastContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [workflowType, setWorkflowType] = useState<'sequential' | 'parallel'>('sequential');
  const [workflowConfigJson, setWorkflowConfigJson] = useState<string>('');
  const [useCustomConfig, setUseCustomConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workflowWarnings, setWorkflowWarnings] = useState<string[]>([]);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [availableAgents, setAvailableAgents] = useState<AgentResponse[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!teamId) {
        navigate('/agent-teams');
        return;
      }

      try {
        const [team, agents] = await Promise.all([
          getAgentTeam(teamId),
          listAgents(),
        ]);

        setAvailableAgents(agents);
        
        // Load team data
        setName(team.name);
        setDescription(team.description || '');
        
        // Determine if custom config or simple
        if (team.workflow_config?.steps && team.workflow_config.steps.length > 0) {
          const configType = team.workflow_config.type;
          
          if (configType === 'sequential' || configType === 'parallel') {
             setWorkflowType(configType);
          } else {
             // For branching or other types, default state to sequential (UI won't show it in custom mode)
             setWorkflowType('sequential');
          }
          
          // Extract agent IDs
          const agentIds = team.workflow_config.steps.map(step => step.agentId);
          setSelectedAgents(agentIds);
          
          // Use Custom JSON to ensure we don't lose any detail
          setUseCustomConfig(true);
          setWorkflowConfigJson(JSON.stringify(team.workflow_config, null, 2));
        } else {
          setUseCustomConfig(false);
          const configType = team.workflow_config?.type;
          if (configType === 'sequential' || configType === 'parallel') {
            setWorkflowType(configType);
          } else {
            setWorkflowType('sequential');
          }
        }
      } catch (err: unknown) {
        logger.error('Failed to load team:', err);
        const errorMessage = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
          : err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load team';
        setError(errorMessage as string);
        showError(errorMessage as string);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamId, navigate, showError]);

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

    if (!teamId) return;

    setSaving(true);
    try {
      let workflowConfig: any = {
        type: workflowType,
      };

      if (!useCustomConfig && selectedAgents.length > 0) {
        const uniqueAgents = new Set(selectedAgents);
        if (uniqueAgents.size !== selectedAgents.length) {
          const errorMsg = '⚠️ You have selected the same agent multiple times. Each step must use a different agent.';
          setError(errorMsg);
          showError(errorMsg);
          setSaving(false);
          return;
        }
        
        const steps: Array<{
          id: string;
          agentId: string;
          inputKey: string;
          outputKey: string;
          role?: string;
        }> = [];
        
        selectedAgents.forEach((agentId, index) => {
          const agent = availableAgents.find(a => a.id === agentId);
          const stepId = agent?.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `step_${index + 1}`;
          const outputKey = stepId;
          
          let inputKey: string;
          if (workflowType === 'sequential') {
            if (index === 0) {
              inputKey = 'userInput';
            } else {
              const prevStep = steps[index - 1];
              inputKey = prevStep.outputKey;
            }
          } else {
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
        
        const validation = validateWorkflowConfig(workflowConfig);
        if (!validation.valid) {
          const errorMsg = `Auto-generated workflow validation failed:\n${validation.errors.join('\n')}`;
          setError(errorMsg);
          showError(errorMsg);
          setSaving(false);
          return;
        }
      } else if (useCustomConfig && workflowConfigJson.trim()) {
        try {
          const parsed = JSON.parse(workflowConfigJson.trim());
          const validation = validateWorkflowConfig(parsed);
          
          if (!validation.valid) {
            const errorMsg = `Workflow validation failed:\n${validation.errors.join('\n')}`;
            setError(errorMsg);
            showError(errorMsg);
            setSaving(false);
            return;
          }
          
          if (validation.warnings.length > 0) {
            setWorkflowWarnings(validation.warnings);
            showError(validation.warnings.join('\n'));
          } else {
            setWorkflowWarnings([]);
          }
          
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
          setSaving(false);
          return;
        }
      }

      const request: CreateTeamRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        agent_ids: selectedAgents,
        workflow_config: workflowConfig,
      };

      await updateAgentTeam(teamId, request);
      success('Agent team updated successfully');
      navigate('/agent-teams');
    } catch (err: unknown) {
      logger.error('Failed to update team:', err);
      let errorMessage = 'Failed to update team';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number; data?: { detail?: string } } }).response;
        if (response?.status === 405) {
          errorMessage = 'Update endpoint not available. The backend may not support updating teams yet.';
        } else if (response?.status === 404) {
          errorMessage = 'Team not found. It may have been deleted.';
        } else if (response?.data?.detail) {
          errorMessage = response.data.detail;
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className={styles.helpCenterPage}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            Loading team data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Edit Agent Team</h1>
          <p className={styles.subtitle}>
            Update your agent team configuration
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
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: '4px' }}>Description (Optional)</label>
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
                          flex: 1
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
                            <input
                              type="radio"
                              name="config-mode"
                              checked={!useCustomConfig}
                              onChange={() => setUseCustomConfig(false)}
                              style={{ cursor: 'pointer', accentColor: 'var(--color-primary-500)' }}
                            />
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Simple</div>
                          </div>
                          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Auto-generate workflow
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
                          flex: 1
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
                            <input
                              type="radio"
                              name="config-mode"
                              checked={useCustomConfig}
                              onChange={() => setUseCustomConfig(true)}
                              style={{ cursor: 'pointer', accentColor: 'var(--color-primary-500)' }}
                            />
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Custom JSON</div>
                          </div>
                          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Manual JSON definition
                          </div>
                        </label>
                      </div>

                      {!useCustomConfig ? (
                        <div>
                          <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: '4px' }}>Workflow Type</label>
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
                            <option value="sequential">Sequential (A → B → C)</option>
                            <option value="parallel">Parallel (A, B → C)</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: '4px' }}>Workflow Config JSON</label>
                          <textarea
                            value={workflowConfigJson}
                            onChange={(e) => setWorkflowConfigJson(e.target.value)}
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
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <label style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>Select Agents *</label>
                        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                          {selectedAgents.length} selected
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: 'var(--space-3)' }}>
                        <input
                          type="text"
                          placeholder="Search agents..."
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

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-2)',
                        maxHeight: '600px',
                        overflowY: 'auto'
                      }}>
                        {filteredAgents.map((agent) => (
                          <label
                            key={agent.id}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 'var(--space-1)',
                              cursor: 'pointer',
                              padding: 'var(--space-3)',
                              borderRadius: 'var(--radius-sm)',
                              border: `2px solid ${selectedAgents.includes(agent.id) ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                              background: selectedAgents.includes(agent.id) ? 'var(--color-primary-50)' : 'var(--bg-secondary)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="checkbox"
                                checked={selectedAgents.includes(agent.id)}
                                onChange={() => handleAgentToggle(agent.id)}
                                style={{ accentColor: 'var(--color-primary-500)' }}
                              />
                              <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{agent.name}</div>
                            </div>
                            {agent.description && (
                              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{agent.description}</div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                      <Button variant="secondary" size="md" type="button" onClick={() => navigate('/agent-teams')}>
                        Cancel
                      </Button>
                      <Button size="md" type="submit" variant="primary" disabled={saving || !name.trim() || selectedAgents.length === 0}>
                        {saving ? 'Saving...' : 'Save Changes'}
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
                Agent teams allow multiple AI agents to collaborate on complex tasks.
              </p>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Workflow Types</h3>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>Sequential</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  Agents execute one after another.
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>Parallel</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  Agents execute simultaneously.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTeamPage;

