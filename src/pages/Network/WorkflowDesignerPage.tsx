import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  Save,
  Trash2,
  ArrowRight,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  GitBranch,
  Box,
  Copy,
} from 'lucide-react';
import { searchAgents, type Agent } from '../../services/nodeApi';
import { isAuthenticated } from '../../utils/auth-cookies';

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  agentName?: string;
  input: Record<string, any>;
  inputMapping: Record<string, string>;
  condition?: { if: string };
  onError: 'fail' | 'skip' | 'continue';
}

interface Workflow {
  version: string;
  workflow: {
    id: string;
    name: string;
    description: string;
    category: string;
    pricing?: {
      model: string;
      price: number;
    };
  };
  inputs: Record<string, { type: string; description: string; required: boolean }>;
  steps: WorkflowStep[];
  output: {
    mapping: Record<string, string>;
  };
}

interface ExecutionResult {
  workflow_id: string;
  success: boolean;
  output: any;
  steps: Array<{
    step_id: string;
    agent_hash: string;
    success: boolean;
    output: any;
    error?: string;
    duration_ms: number;
  }>;
  total_duration_ms: number;
  error?: string;
}

import { ENV } from '../../config/env';

const NODE_API = ENV.apiUrl;

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    maxHeight: 'calc(100vh - 56px)',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '0.5rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
  },
  secondaryButton: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    padding: '1.5rem',
    overflowY: 'auto',
  },
  sidebarSection: {
    marginBottom: '1.5rem',
  },
  sidebarTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#888',
    marginBottom: '0.75rem',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    marginBottom: '0.75rem',
  },
  textarea: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  canvas: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
    background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 50%)',
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  stepCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  stepHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(99,102,241,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  stepName: {
    flex: 1,
    marginLeft: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  stepBody: {
    padding: '1rem',
  },
  select: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    marginBottom: '0.75rem',
    cursor: 'pointer',
  },
  connector: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0.5rem',
  },
  connectorLine: {
    width: '2px',
    height: '24px',
    background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
    position: 'relative',
  },
  addStepButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: 'rgba(99,102,241,0.1)',
    border: '2px dashed rgba(99,102,241,0.3)',
    borderRadius: '12px',
    color: '#6366f1',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  resultPanel: {
    width: '400px',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    padding: '1.5rem',
    overflowY: 'auto',
    background: 'rgba(0,0,0,0.2)',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
  },
  resultStep: {
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    fontSize: '0.8rem',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '0.375rem',
  },
  agentOption: {
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const SAMPLE_WORKFLOW: Workflow = {
  version: '1.0.0',
  workflow: {
    id: 'wf-content-pipeline',
    name: 'Content Analysis Pipeline',
    description: 'Analyze text, summarize it, and create an action plan',
    category: 'content',
    pricing: {
      model: 'per-execution',
      price: 0.05,
    },
  },
  inputs: {
    text: { type: 'string', description: 'Input text to analyze', required: true },
  },
  steps: [],
  output: {
    mapping: {},
  },
};

export default function WorkflowDesignerPage() {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow>(SAMPLE_WORKFLOW);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [testInput, setTestInput] = useState('{"text": "AI is transforming how we work and live. Machine learning enables automation of complex tasks. Natural language processing helps computers understand human communication."}');

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const { agents: fetchedAgents } = await searchAgents();
      setAgents(fetchedAgents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }

  function addStep() {
    const newStep: WorkflowStep = {
      id: `step-${workflow.steps.length + 1}`,
      name: `Step ${workflow.steps.length + 1}`,
      agent: '',
      input: {},
      inputMapping: {},
      onError: 'fail',
    };
    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, newStep],
    });
  }

  function updateStep(index: number, updates: Partial<WorkflowStep>) {
    const newSteps = [...workflow.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    
    // Update agent name if agent changed
    if (updates.agent) {
      const agent = agents.find(a => a.manifest_hash === updates.agent);
      if (agent) {
        newSteps[index].agentName = agent.name;
      }
    }
    
    setWorkflow({ ...workflow, steps: newSteps });
  }

  function removeStep(index: number) {
    const newSteps = workflow.steps.filter((_, i) => i !== index);
    // Re-number step IDs
    newSteps.forEach((step, i) => {
      step.id = `step-${i + 1}`;
    });
    setWorkflow({ ...workflow, steps: newSteps });
  }

  async function executeWorkflow() {
    if (workflow.steps.length === 0) {
      alert('Add at least one step to the workflow');
      return;
    }

    setExecuting(true);
    setResult(null);

    try {
      const inputs = JSON.parse(testInput);
      const response = await fetch(`${NODE_API}/workflow/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: workflow,
          inputs: inputs,
          user_dsid: 'dsid-u-workflow-test-0000',
          trust_tier: 1,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        workflow_id: workflow.workflow.id,
        success: false,
        output: null,
        steps: [],
        total_duration_ms: 0,
        error: String(error),
      });
    } finally {
      setExecuting(false);
    }
  }

  function exportWorkflow() {
    const json = JSON.stringify(workflow, null, 2);
    navigator.clipboard.writeText(json);
    alert('Workflow JSON copied to clipboard!');
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <GitBranch size={24} color="#6366f1" />
          Workflow Designer
        </div>
        <div style={styles.headerActions}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => navigate('/network/workflows/visual')}
          >
            <Zap size={16} />
            Visual Builder
          </button>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={exportWorkflow}
          >
            <Copy size={16} />
            Export JSON
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton, opacity: executing ? 0.7 : 1 }}
            onClick={executeWorkflow}
            disabled={executing}
          >
            <Play size={16} />
            {executing ? 'Running...' : 'Run Workflow'}
          </button>
        </div>
      </div>

      <div style={styles.main}>
        {/* Left Sidebar - Workflow Settings */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarTitle}>Workflow Info</div>
            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              value={workflow.workflow.name}
              onChange={(e) => setWorkflow({
                ...workflow,
                workflow: { ...workflow.workflow, name: e.target.value },
              })}
              placeholder="Workflow name"
            />
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={workflow.workflow.description}
              onChange={(e) => setWorkflow({
                ...workflow,
                workflow: { ...workflow.workflow, description: e.target.value },
              })}
              placeholder="What does this workflow do?"
            />
          </div>

          <div style={styles.sidebarSection}>
            <div style={styles.sidebarTitle}>Test Input</div>
            <textarea
              style={{ ...styles.textarea, fontFamily: 'monospace', fontSize: '0.75rem' }}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>

          <div style={styles.sidebarSection}>
            <div style={styles.sidebarTitle}>Available Agents</div>
            {agents.map((agent) => (
              <div
                key={agent.manifest_hash}
                style={styles.agentOption}
                onClick={() => {
                  navigator.clipboard.writeText(agent.manifest_hash);
                }}
                title="Click to copy hash"
              >
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{agent.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                  {agent.manifest_hash.slice(0, 20)}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas - Step Builder */}
        <div style={styles.canvas}>
          <div style={styles.stepList}>
            {/* Start Node */}
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(16,185,129,0.2)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '20px',
                color: '#10b981',
                fontSize: '0.8rem',
              }}>
                <Zap size={14} />
                Workflow Start
              </div>
            </div>

            {workflow.steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Connector */}
                <div style={styles.connector}>
                  <div style={styles.connectorLine}>
                    <ArrowRight
                      size={14}
                      style={{
                        position: 'absolute',
                        bottom: '-7px',
                        left: '-6px',
                        transform: 'rotate(90deg)',
                        color: '#8b5cf6',
                      }}
                    />
                  </div>
                </div>

                {/* Step Card */}
                <div style={styles.stepCard}>
                  <div style={styles.stepHeader}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={styles.stepNumber}>{index + 1}</div>
                      <input
                        style={{
                          ...styles.stepName,
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          outline: 'none',
                        }}
                        value={step.name}
                        onChange={(e) => updateStep(index, { name: e.target.value })}
                      />
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={styles.stepBody}>
                    <label style={styles.label}>Agent</label>
                    <select
                      style={styles.select}
                      value={step.agent}
                      onChange={(e) => updateStep(index, { agent: e.target.value })}
                    >
                      <option value="">Select an agent...</option>
                      {agents.map((agent) => (
                        <option key={agent.manifest_hash} value={agent.manifest_hash}>
                          {agent.name}
                        </option>
                      ))}
                    </select>

                    <label style={styles.label}>Input Mapping (JSON)</label>
                    <textarea
                      style={{ ...styles.textarea, fontFamily: 'monospace', fontSize: '0.75rem', minHeight: '60px' }}
                      value={JSON.stringify(step.inputMapping, null, 2)}
                      onChange={(e) => {
                        try {
                          const mapping = JSON.parse(e.target.value);
                          updateStep(index, { inputMapping: mapping });
                        } catch {}
                      }}
                      placeholder={index === 0 
                        ? '{"content": "$input.text"}'
                        : `{"data": "$steps.step-${index}.output.result"}`
                      }
                    />

                    <label style={styles.label}>On Error</label>
                    <select
                      style={styles.select}
                      value={step.onError}
                      onChange={(e) => updateStep(index, { onError: e.target.value as any })}
                    >
                      <option value="fail">Stop workflow</option>
                      <option value="skip">Skip remaining steps</option>
                      <option value="continue">Continue anyway</option>
                    </select>
                  </div>
                </div>
              </React.Fragment>
            ))}

            {/* Connector to Add */}
            {workflow.steps.length > 0 && (
              <div style={styles.connector}>
                <div style={styles.connectorLine} />
              </div>
            )}

            {/* Add Step Button */}
            <div style={styles.addStepButton} onClick={addStep}>
              <Plus size={20} />
              Add Step
            </div>

            {/* End Node */}
            {workflow.steps.length > 0 && (
              <>
                <div style={styles.connector}>
                  <div style={styles.connectorLine} />
                </div>
                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(99,102,241,0.2)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '20px',
                    color: '#6366f1',
                    fontSize: '0.8rem',
                  }}>
                    <CheckCircle size={14} />
                    Workflow End
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Execution Results */}
        <div style={styles.resultPanel}>
          <div style={styles.resultHeader}>
            <Box size={18} />
            Execution Results
          </div>

          {!result && !executing && (
            <div style={styles.emptyState}>
              Run the workflow to see results
            </div>
          )}

          {executing && (
            <div style={styles.emptyState}>
              <div style={{ marginBottom: '0.5rem' }}>⏳</div>
              Executing workflow...
            </div>
          )}

          {result && (
            <>
              <div style={{
                padding: '1rem',
                background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: '8px',
                marginBottom: '1rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: result.success ? '#10b981' : '#ef4444',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}>
                  {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {result.success ? 'Success' : 'Failed'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  {result.total_duration_ms}ms total
                </div>
              </div>

              <div style={styles.sidebarTitle}>Step Results</div>
              {result.steps.map((step, i) => (
                <div key={step.step_id} style={{
                  ...styles.resultStep,
                  borderLeft: `3px solid ${step.success ? '#10b981' : '#ef4444'}`,
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {step.step_id}
                  </div>
                  <div style={{ color: '#666', marginBottom: '0.5rem' }}>
                    {step.duration_ms}ms
                  </div>
                  {step.error && (
                    <div style={{ color: '#ef4444', fontSize: '0.7rem' }}>
                      {step.error}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ ...styles.sidebarTitle, marginTop: '1rem' }}>Final Output</div>
              <pre style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#10b981',
                overflow: 'auto',
                maxHeight: '200px',
              }}>
                {JSON.stringify(result.output, null, 2)}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
