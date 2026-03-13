import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore, useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import { WorkflowCanvas } from './WorkflowCanvas';
import type { Workflow as UIWorkflow, WorkflowNode, WorkflowEdge } from '../../../../../types';
import * as workflowsApi from '../../../../../api/workflows';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './WorkflowPanel.module.css';

// ============== WORKFLOW PANEL ==============
// Contract: reads [workflow, agent], writes [workflow]
// Forbidden: [execution, economy]

type ViewMode = 'list' | 'builder' | 'templates';

interface WorkflowPanelProps {
  className?: string;
}

// Node palette configuration — synced with VisualWorkflowPage step types
const NODE_PALETTE = [
  { type: 'webhook_trigger', label: 'Webhook Trigger', color: '#f97316' },
  { type: 'http_request', label: 'HTTP Request', color: '#3b82f6' },
  { type: 'llm_completion', label: 'LLM Call', color: '#8b5cf6' },
  { type: 'web_search', label: 'Web Search', color: '#14b8a6' },
  { type: 'memory_search', label: 'Memory Search', color: '#06b6d4' },
  { type: 'agent_execute', label: 'Run Agent', color: '#f59e0b' },
  { type: 'code_execute', label: 'Run Code', color: '#22c55e' },
  { type: 'email_send', label: 'Send Email', color: '#e11d48' },
  { type: 'send_notification', label: 'Notification', color: '#10b981' },
  { type: 'transform_data', label: 'Transform', color: '#6366f1' },
  { type: 'condition', label: 'If/Else', color: '#ef4444' },
  { type: 'loop', label: 'Loop', color: '#a855f7' },
  { type: 'parallel', label: 'Parallel', color: '#0ea5e9' },
  { type: 'data_filter', label: 'Filter', color: '#d946ef' },
  { type: 'aggregator', label: 'Aggregator', color: '#ec4899' },
  { type: 'database_query', label: 'Database', color: '#7c3aed' },
  { type: 'delay', label: 'Delay', color: '#78716c' },
];

const WorkflowPanelComponent: React.FC<WorkflowPanelProps> = ({ className }) => {
  const navigate = useNavigate();
  const storeWorkflows = useWorkflowStore(state => state.workflows);
  const selectedWorkflowId = useWorkflowStore(state => state.selectedWorkflowId);
  const { setWorkflows, addWorkflow, updateWorkflow, removeWorkflow, selectWorkflow, publishWorkflow, validateWorkflow, setLoading, setError } = useWorkflowStore();
  const agents = useAgentStore(state => state.agents);
  
  const [activeView, setActiveView] = useState<ViewMode>('list');
  const [workflowStats, setWorkflowStats] = useState<any>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [liveModels, setLiveModels] = useState<string[]>([]);

  // Fetch live LLM providers for model selection
  useEffect(() => {
    fastapiClient.get('/resonant-chat/providers').then(res => {
      const providers = res.data?.providers || [];
      const models: string[] = [];
      providers.forEach((p: any) => {
        if (p.live || p.status === 'online') {
          const provId = p.id || p.name || '';
          (p.models || []).forEach((m: any) => {
            const modelId = typeof m === 'string' ? m : (m.id || m.name || '');
            if (modelId) models.push(`${provId}/${modelId}`);
          });
          if ((p.models || []).length === 0 && provId) models.push(provId);
        }
      });
      if (models.length > 0) setLiveModels(models);
    }).catch(() => {});
  }, []);

  const handleExportWorkflows = () => {
    const exportData = { exported_at: new Date().toISOString(), workflows, stats: workflowStats };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflows-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const workflows = Array.isArray(storeWorkflows) ? storeWorkflows : [];
  const selectedWorkflow = Array.isArray(workflows)
    ? workflows.find((w: any) => w.id === selectedWorkflowId) || null
    : null;

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiToUiWorkflow = useCallback((api: workflowsApi.Workflow): UIWorkflow => {
    const triggerConfig = (api.trigger_config || {}) as any;
    const uiGraph = triggerConfig.ui_graph || {};
    const nodes = Array.isArray(uiGraph.nodes) ? uiGraph.nodes : [];
    const edges = Array.isArray(uiGraph.edges) ? uiGraph.edges : [];

    const fallbackNodes =
      nodes.length > 0
        ? nodes
        : [
            { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 200 }, config: {} },
            { id: 'end', type: 'end', label: 'End', position: { x: 500, y: 200 }, config: {} },
          ];

    const status = (triggerConfig.ui_status as UIWorkflow['status']) || 'draft';
    const createdAt = api.created_at ? new Date(api.created_at) : new Date();
    const updatedAt = api.updated_at ? new Date(api.updated_at) : createdAt;
    const publishedAt = triggerConfig.ui_published_at ? new Date(triggerConfig.ui_published_at) : null;

    return {
      id: api.id,
      name: api.name,
      description: api.description || '',
      version: String(api.version ?? '1'),
      status,
      nodes: fallbackNodes,
      edges,
      variables: [],
      triggers: [],
      createdAt,
      updatedAt,
      publishedAt,
    };
  }, []);

  const graphToSteps = useCallback((nodes: WorkflowNode[], edges: WorkflowEdge[]): any[] => {
    // Topological sort: convert visual graph into ordered backend steps
    const executableNodes = nodes.filter(n => n.type !== 'start' && n.type !== 'end');
    if (executableNodes.length === 0) return [];

    // Build adjacency from edges
    const incoming = new Map<string, number>();
    const adj = new Map<string, string[]>();
    for (const n of executableNodes) {
      incoming.set(n.id, 0);
      adj.set(n.id, []);
    }
    for (const e of edges) {
      if (adj.has(e.source) && incoming.has(e.target)) {
        adj.get(e.source)!.push(e.target);
        incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
      }
    }

    // Kahn's algorithm
    const queue = executableNodes.filter(n => (incoming.get(n.id) || 0) === 0);
    const sorted: WorkflowNode[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      sorted.push(node);
      for (const next of (adj.get(node.id) || [])) {
        incoming.set(next, (incoming.get(next) || 0) - 1);
        if (incoming.get(next) === 0) {
          const nextNode = executableNodes.find(n => n.id === next);
          if (nextNode) queue.push(nextNode);
        }
      }
    }
    // Add any remaining nodes not reached by edges
    for (const n of executableNodes) {
      if (!sorted.find(s => s.id === n.id)) sorted.push(n);
    }

    return sorted.map((node, i) => ({
      name: node.label || `step_${i}`,
      type: node.type,
      config: node.config || {},
      continue_on_error: false,
    }));
  }, []);

  const uiToApiUpdate = useCallback((ui: UIWorkflow): workflowsApi.UpdateWorkflowRequest => {
    return {
      name: ui.name,
      description: ui.description,
      trigger_type: 'manual',
      trigger_config: {
        ui_graph: {
          nodes: ui.nodes,
          edges: ui.edges,
        },
        ui_status: ui.status,
        ui_published_at: ui.publishedAt ? ui.publishedAt.toISOString() : null,
      },
      steps: graphToSteps(ui.nodes as any, ui.edges as any),
    };
  }, [graphToSteps]);

  const schedulePersist = useCallback(
    (ui: UIWorkflow) => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }

      persistTimerRef.current = setTimeout(async () => {
        persistTimerRef.current = null;
        try {
          await workflowsApi.updateWorkflow(ui.id, uiToApiUpdate(ui));
        } catch (e: any) {
          setError(e?.message || 'Failed to persist workflow');
        }
      }, 500);
    },
    [setError, uiToApiUpdate]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch workflows and stats in parallel
        const [apiWorkflows, statsRes] = await Promise.all([
          workflowsApi.listWorkflows(),
          fastapiClient.get('/api/v1/workflows/stats').catch(() => ({ data: null })),
        ]);
        if (statsRes.data) setWorkflowStats(statsRes.data);
        if (!mounted) return;
        setWorkflows(apiWorkflows.map(apiToUiWorkflow));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load workflows');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [apiToUiWorkflow, setError, setLoading, setWorkflows]);

  // Handle workflow updates
  const handleWorkflowUpdate = useCallback((workflowId: string, updates: Partial<UIWorkflow>) => {
    const base = workflows.find((w: any) => w.id === workflowId) as UIWorkflow | undefined;
    const next = base ? ({ ...base, ...updates, updatedAt: new Date() } as UIWorkflow) : undefined;
    updateWorkflow(workflowId, updates);
    if (next) schedulePersist(next);
  }, [schedulePersist, updateWorkflow, workflows]);

  const handleCreateWorkflow = useCallback(() => {
    if (!newWorkflowName.trim()) return;

    const draft: UIWorkflow = {
      id: `local-${Date.now()}`,
      name: newWorkflowName,
      description: '',
      version: '1',
      status: 'draft',
      nodes: [
        { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 200 }, config: {} },
        { id: 'end', type: 'end', label: 'End', position: { x: 500, y: 200 }, config: {} },
      ],
      edges: [],
      variables: [],
      triggers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
    };

    (async () => {
      setIsWorking(true);
      setPanelError(null);
      try {
        const created = await workflowsApi.createWorkflow({
          name: draft.name,
          description: draft.description,
          trigger_type: 'manual',
          trigger_config: {
            ui_graph: { nodes: draft.nodes, edges: draft.edges },
            ui_status: draft.status,
            ui_published_at: null,
          },
          steps: [],
        });

        const uiCreated = apiToUiWorkflow(created);
        addWorkflow(uiCreated);
        setNewWorkflowName('');
        selectWorkflow(uiCreated.id);
        setActiveView('builder');
      } catch (e: any) {
        const msg = e?.response?.data?.detail || e?.message || 'Failed to create workflow';
        setPanelError(msg);
        setTimeout(() => setPanelError(null), 7000);
      } finally {
        setIsWorking(false);
      }
    })();
  }, [addWorkflow, apiToUiWorkflow, newWorkflowName, selectWorkflow, setActiveView]);

  const handleValidateWorkflow = useCallback((workflowId: string) => {
    const ok = validateWorkflow(workflowId);
    if (!ok) return;

    const base = workflows.find((w: any) => w.id === workflowId) as UIWorkflow | undefined;
    if (base) schedulePersist({ ...base, status: 'validated', updatedAt: new Date() });
  }, [schedulePersist, validateWorkflow, workflows]);

  const handlePublishWorkflow = useCallback((workflowId: string) => {
    publishWorkflow(workflowId);
    const base = workflows.find((w: any) => w.id === workflowId) as UIWorkflow | undefined;
    if (base) {
      schedulePersist({
        ...base,
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [publishWorkflow, schedulePersist, workflows]);

  const handleDeleteWorkflow = useCallback((workflowId: string) => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await workflowsApi.deleteWorkflow(workflowId);
        removeWorkflow(workflowId);
      } catch (e: any) {
        setError(e?.message || 'Failed to delete workflow');
      } finally {
        setLoading(false);
      }
    })();
  }, [removeWorkflow, setError, setLoading]);

  const handleRunWorkflow = useCallback((workflowId: string) => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await workflowsApi.runWorkflow(workflowId, { input_data: {} });
      } catch (e: any) {
        setError(e?.message || 'Failed to run workflow');
      } finally {
        setLoading(false);
      }
    })();
  }, [setError, setLoading]);

  const getTemplateIcon = (iconType: string) => {
    switch (iconType) {
      case 'refresh': return <Icons.Refresh />;
      case 'external': return <Icons.External />;
      case 'edit': return <Icons.Edit />;
      case 'search': return <Icons.Search />;
      case 'code': return <Icons.Code />;
      case 'barChart': return <Icons.BarChart />;
      default: return <Icons.Fork />;
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return <Icons.Play />;
      case 'end': return <Icons.Stop />;
      case 'webhook_trigger': return <Icons.External />;
      case 'http_request': return <Icons.External />;
      case 'llm_completion': return <Icons.Brain />;
      case 'web_search': return <Icons.Search />;
      case 'memory_search': return <Icons.Search />;
      case 'agent_execute': return <Icons.Agents />;
      case 'code_execute': return <Icons.Code />;
      case 'email_send': return <Icons.Send />;
      case 'send_notification': return <Icons.Send />;
      case 'transform_data': return <Icons.Zap />;
      case 'condition': return <Icons.Fork />;
      case 'loop': return <Icons.Refresh />;
      case 'parallel': return <Icons.Fork />;
      case 'data_filter': return <Icons.Search />;
      case 'aggregator': return <Icons.BarChart />;
      case 'database_query': return <Icons.Code />;
      case 'delay': return <Icons.Clock />;
      default: return <Icons.Zap />;
    }
  };

  const handleNodesChange = useCallback((nodes: any[]) => {
    if (selectedWorkflow) {
      handleWorkflowUpdate(selectedWorkflow.id, { nodes: nodes as WorkflowNode[] });
    }
  }, [selectedWorkflow, handleWorkflowUpdate]);

  const handleEdgesChange = useCallback((edges: any[]) => {
    if (selectedWorkflow) {
      handleWorkflowUpdate(selectedWorkflow.id, { edges });
    }
  }, [selectedWorkflow, handleWorkflowUpdate]);

  const handleAddNode = useCallback((type: string) => {
    if (!selectedWorkflow) return;
    
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      position: { x: 200 + Math.random() * 100, y: 150 + Math.random() * 100 },
      config: {},
    };
    
    handleWorkflowUpdate(selectedWorkflow.id, { 
      nodes: [...selectedWorkflow.nodes, newNode] 
    });
  }, [selectedWorkflow, handleWorkflowUpdate]);

  const updateNodeConfig = useCallback((nodeId: string, configUpdates: Record<string, unknown>) => {
    if (!selectedWorkflow) return;
    const updatedNodes = selectedWorkflow.nodes.map(n =>
      n.id === nodeId ? { ...n, config: { ...(n.config || {}), ...configUpdates } } : n
    );
    handleWorkflowUpdate(selectedWorkflow.id, { nodes: updatedNodes });
  }, [selectedWorkflow, handleWorkflowUpdate]);

  const renderNodeConfig = () => {
    if (!selectedWorkflow || !selectedNodeId) return null;
    const node = selectedWorkflow.nodes.find(n => n.id === selectedNodeId);
    if (!node) return null;
    const cfg = (node.config || {}) as Record<string, any>;

    const defaultModels = ['groq/llama-3.3-70b-versatile', 'groq/llama-3.1-8b-instant', 'groq/mixtral-8x7b-32768', 'openai/gpt-4o', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro'];
    const modelOptions = liveModels.length > 0 ? liveModels : defaultModels;

    return (
      <div className={styles.configForm}>
        <div className={styles.configField}>
          <label>Label</label>
          <input 
            type="text" 
            value={node.label} 
            onChange={(e) => {
              const updatedNodes = selectedWorkflow.nodes.map(n =>
                n.id === selectedNodeId ? { ...n, label: e.target.value } : n
              );
              handleWorkflowUpdate(selectedWorkflow.id, { nodes: updatedNodes });
            }}
          />
        </div>
        <div className={styles.configField}>
          <label>Type</label>
          <span className={styles.configValue}>{node.type}</span>
        </div>

        {node.type === 'webhook_trigger' && (
          <>
            <div className={styles.configField}>
              <label>Webhook Path</label>
              <input type="text" value={cfg.path || '/webhook/incoming'} onChange={e => updateNodeConfig(node.id, { path: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>HTTP Method</label>
              <select value={cfg.method || 'POST'} onChange={e => updateNodeConfig(node.id, { method: e.target.value })}>
                {['POST','GET','PUT'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Secret</label>
              <input type="text" value={cfg.secret || ''} onChange={e => updateNodeConfig(node.id, { secret: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'http_request' && (
          <>
            <div className={styles.configField}>
              <label>Method</label>
              <select value={cfg.method || 'GET'} onChange={e => updateNodeConfig(node.id, { method: e.target.value })}>
                {['GET','POST','PUT','PATCH','DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>URL</label>
              <input type="text" value={cfg.url || ''} onChange={e => updateNodeConfig(node.id, { url: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Headers (JSON)</label>
              <textarea rows={2} value={cfg.headers || '{}'} onChange={e => updateNodeConfig(node.id, { headers: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Body (JSON)</label>
              <textarea rows={3} value={cfg.body || '{}'} onChange={e => updateNodeConfig(node.id, { body: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'llm_completion' && (
          <>
            <div className={styles.configField}>
              <label>Provider</label>
              <select value={cfg.provider || 'groq'} onChange={e => updateNodeConfig(node.id, { provider: e.target.value })}>
                {['groq','openai','anthropic','google'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Model {liveModels.length > 0 ? '(live)' : ''}</label>
              <select value={cfg.model || 'groq/llama-3.3-70b-versatile'} onChange={e => updateNodeConfig(node.id, { model: e.target.value })}>
                {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>System Prompt</label>
              <textarea rows={4} value={cfg.prompt || 'You are an expert assistant.'} onChange={e => updateNodeConfig(node.id, { prompt: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>User Message</label>
              <textarea rows={3} value={cfg.user_message || ''} onChange={e => updateNodeConfig(node.id, { user_message: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Max Tokens</label>
              <input type="number" value={cfg.max_tokens || 2048} onChange={e => updateNodeConfig(node.id, { max_tokens: parseInt(e.target.value) || 2048 })} />
            </div>
            <div className={styles.configField}>
              <label>Temperature (0-2)</label>
              <input type="number" step="0.1" min="0" max="2" value={cfg.temperature ?? 0.7} onChange={e => updateNodeConfig(node.id, { temperature: parseFloat(e.target.value) || 0.7 })} />
            </div>
          </>
        )}

        {node.type === 'web_search' && (
          <>
            <div className={styles.configField}>
              <label>Search Query</label>
              <input type="text" value={cfg.query || ''} onChange={e => updateNodeConfig(node.id, { query: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Search Engine</label>
              <select value={cfg.engine || 'duckduckgo'} onChange={e => updateNodeConfig(node.id, { engine: e.target.value })}>
                {['duckduckgo','brave','google'].map(se => <option key={se} value={se}>{se}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Max Results</label>
              <input type="number" value={cfg.max_results || 10} onChange={e => updateNodeConfig(node.id, { max_results: parseInt(e.target.value) || 10 })} />
            </div>
            <div className={styles.configField}>
              <label>Time Range</label>
              <select value={cfg.time_range || 'any'} onChange={e => updateNodeConfig(node.id, { time_range: e.target.value })}>
                {['any','day','week','month','year'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        )}

        {node.type === 'memory_search' && (
          <>
            <div className={styles.configField}>
              <label>Query</label>
              <input type="text" value={cfg.query || ''} onChange={e => updateNodeConfig(node.id, { query: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Namespace</label>
              <input type="text" value={cfg.namespace || 'default'} onChange={e => updateNodeConfig(node.id, { namespace: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Results Limit</label>
              <input type="number" value={cfg.top_k || 5} onChange={e => updateNodeConfig(node.id, { top_k: parseInt(e.target.value) || 5 })} />
            </div>
          </>
        )}

        {node.type === 'agent_execute' && (
          <>
            <div className={styles.configField}>
              <label>Agent</label>
              <select value={cfg.agent_id || ''} onChange={e => updateNodeConfig(node.id, { agent_id: e.target.value })}>
                <option value="">Select Agent</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Goal / Task</label>
              <textarea rows={3} value={cfg.goal || cfg.task || ''} onChange={e => updateNodeConfig(node.id, { goal: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Max Steps</label>
              <input type="number" value={cfg.max_steps || 10} onChange={e => updateNodeConfig(node.id, { max_steps: parseInt(e.target.value) || 10 })} />
            </div>
          </>
        )}

        {node.type === 'code_execute' && (
          <>
            <div className={styles.configField}>
              <label>Language</label>
              <select value={cfg.language || 'python'} onChange={e => updateNodeConfig(node.id, { language: e.target.value })}>
                {['python','javascript'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Code</label>
              <textarea rows={8} style={{ fontFamily: 'monospace', fontSize: '11px' }} value={cfg.code || 'result = input_data\noutput = {"status": "ok", "data": result}'} onChange={e => updateNodeConfig(node.id, { code: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Timeout (ms)</label>
              <input type="number" value={cfg.timeout || 30000} onChange={e => updateNodeConfig(node.id, { timeout: parseInt(e.target.value) || 30000 })} />
            </div>
          </>
        )}

        {node.type === 'email_send' && (
          <>
            <div className={styles.configField}>
              <label>To (email)</label>
              <input type="text" value={cfg.to || ''} onChange={e => updateNodeConfig(node.id, { to: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Subject</label>
              <input type="text" value={cfg.subject || ''} onChange={e => updateNodeConfig(node.id, { subject: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Body (HTML or text)</label>
              <textarea rows={5} value={cfg.body || ''} onChange={e => updateNodeConfig(node.id, { body: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Email Provider</label>
              <select value={cfg.provider || 'platform_smtp'} onChange={e => updateNodeConfig(node.id, { provider: e.target.value })}>
                {['platform_smtp','sendgrid','ses','custom_smtp'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Attach Previous Output As</label>
              <select value={cfg.attach_output || 'none'} onChange={e => updateNodeConfig(node.id, { attach_output: e.target.value })}>
                {['none','pdf','json','csv'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </>
        )}

        {node.type === 'send_notification' && (
          <>
            <div className={styles.configField}>
              <label>Channel</label>
              <select value={cfg.channel || 'slack'} onChange={e => updateNodeConfig(node.id, { channel: e.target.value })}>
                {['slack','discord','webhook','telegram'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Webhook URL</label>
              <input type="text" value={cfg.webhook_url || ''} onChange={e => updateNodeConfig(node.id, { webhook_url: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Message</label>
              <textarea rows={3} value={cfg.message || ''} onChange={e => updateNodeConfig(node.id, { message: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'transform_data' && (
          <>
            <div className={styles.configField}>
              <label>Operation</label>
              <select value={cfg.operation || 'map'} onChange={e => updateNodeConfig(node.id, { operation: e.target.value })}>
                {['map','filter','reduce','flatten','sort','unique','jq','jsonpath','template'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Expression</label>
              <textarea rows={3} value={cfg.expression || ''} onChange={e => updateNodeConfig(node.id, { expression: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'condition' && (
          <>
            <div className={styles.configField}>
              <label>Condition Expression</label>
              <input type="text" value={cfg.expression || cfg.left || ''} onChange={e => updateNodeConfig(node.id, { expression: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>True Branch Label</label>
              <input type="text" value={cfg.true_label || 'True'} onChange={e => updateNodeConfig(node.id, { true_label: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>False Branch Label</label>
              <input type="text" value={cfg.false_label || 'False'} onChange={e => updateNodeConfig(node.id, { false_label: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'loop' && (
          <>
            <div className={styles.configField}>
              <label>Items Array Path</label>
              <input type="text" value={cfg.items_path || ''} onChange={e => updateNodeConfig(node.id, { items_path: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Max Iterations</label>
              <input type="number" value={cfg.max_iterations || 100} onChange={e => updateNodeConfig(node.id, { max_iterations: parseInt(e.target.value) || 100 })} />
            </div>
            <div className={styles.configField}>
              <label>Parallel Execution</label>
              <select value={cfg.parallel || 'false'} onChange={e => updateNodeConfig(node.id, { parallel: e.target.value })}>
                {['false','true'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </>
        )}

        {node.type === 'parallel' && (
          <>
            <div className={styles.configField}>
              <label>Number of Branches</label>
              <input type="number" value={cfg.branches || 3} onChange={e => updateNodeConfig(node.id, { branches: parseInt(e.target.value) || 3 })} />
            </div>
            <div className={styles.configField}>
              <label>Wait Mode</label>
              <select value={cfg.wait_mode || 'all'} onChange={e => updateNodeConfig(node.id, { wait_mode: e.target.value })}>
                {['all','any','first_success'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </>
        )}

        {node.type === 'data_filter' && (
          <>
            <div className={styles.configField}>
              <label>Field Path</label>
              <input type="text" value={cfg.field || ''} onChange={e => updateNodeConfig(node.id, { field: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Operator</label>
              <select value={cfg.operator || 'equals'} onChange={e => updateNodeConfig(node.id, { operator: e.target.value })}>
                {['equals','not_equals','contains','not_contains','gt','lt','regex','exists','is_unique'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Value</label>
              <input type="text" value={cfg.value || ''} onChange={e => updateNodeConfig(node.id, { value: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Deduplicate By</label>
              <input type="text" value={cfg.deduplicate_key || ''} onChange={e => updateNodeConfig(node.id, { deduplicate_key: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'aggregator' && (
          <>
            <div className={styles.configField}>
              <label>Aggregation Mode</label>
              <select value={cfg.mode || 'merge'} onChange={e => updateNodeConfig(node.id, { mode: e.target.value })}>
                {['merge','concat','first','last','all','sum','count'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Wait For (inputs count)</label>
              <input type="number" value={cfg.wait_for || 2} onChange={e => updateNodeConfig(node.id, { wait_for: parseInt(e.target.value) || 2 })} />
            </div>
          </>
        )}

        {node.type === 'database_query' && (
          <>
            <div className={styles.configField}>
              <label>Database Type</label>
              <select value={cfg.db_type || 'postgresql'} onChange={e => updateNodeConfig(node.id, { db_type: e.target.value })}>
                {['postgresql','mongodb','redis','elasticsearch'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Connection String</label>
              <input type="text" value={cfg.connection_string || ''} onChange={e => updateNodeConfig(node.id, { connection_string: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Query</label>
              <textarea rows={4} style={{ fontFamily: 'monospace', fontSize: '11px' }} value={cfg.query || ''} onChange={e => updateNodeConfig(node.id, { query: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'delay' && (
          <>
            <div className={styles.configField}>
              <label>Duration (seconds)</label>
              <input type="number" value={cfg.duration || cfg.seconds || 5} onChange={e => updateNodeConfig(node.id, { duration: parseInt(e.target.value) || 1 })} />
            </div>
            <div className={styles.configField}>
              <label>Or Wait Until (ISO date)</label>
              <input type="text" value={cfg.until || ''} onChange={e => updateNodeConfig(node.id, { until: e.target.value })} />
            </div>
          </>
        )}
      </div>
    );
  };

  const getStatusColor = (status: UIWorkflow['status']) => {
    switch (status) {
      case 'published': return styles.published;
      case 'draft': return styles.draft;
      case 'validated': return styles.validated;
      case 'deprecated': return styles.deprecated;
      default: return '';
    }
  };

  const workflowTemplates = [
    {
      id: 't1', name: 'Data Pipeline', iconType: 'refresh', description: 'ETL workflow for data processing',
      templateNodes: [
        { id: 'start', type: 'start', label: 'Start', position: { x: 50, y: 200 }, config: {} },
        { id: 'extract', type: 'api', label: 'Extract Data', position: { x: 200, y: 200 }, config: { endpoint: '' } },
        { id: 'transform', type: 'transform', label: 'Transform', position: { x: 350, y: 200 }, config: {} },
        { id: 'validate', type: 'condition', label: 'Validate', position: { x: 500, y: 200 }, config: { condition: 'data.valid === true' } },
        { id: 'load', type: 'api', label: 'Load Data', position: { x: 650, y: 200 }, config: { endpoint: '' } },
        { id: 'end', type: 'end', label: 'End', position: { x: 800, y: 200 }, config: {} },
      ],
      templateEdges: [
        { id: 'e1', source: 'start', target: 'extract' },
        { id: 'e2', source: 'extract', target: 'transform' },
        { id: 'e3', source: 'transform', target: 'validate' },
        { id: 'e4', source: 'validate', target: 'load' },
        { id: 'e5', source: 'load', target: 'end' },
      ],
    },
    {
      id: 't2', name: 'Customer Support', iconType: 'external', description: 'Automated support ticket handling',
      templateNodes: [
        { id: 'start', type: 'start', label: 'Ticket Received', position: { x: 50, y: 200 }, config: {} },
        { id: 'classify', type: 'agent', label: 'Classify Ticket', position: { x: 200, y: 200 }, config: {} },
        { id: 'priority', type: 'condition', label: 'Check Priority', position: { x: 350, y: 200 }, config: { condition: 'priority === "high"' } },
        { id: 'escalate', type: 'agent', label: 'Escalate', position: { x: 500, y: 100 }, config: {} },
        { id: 'autoReply', type: 'agent', label: 'Auto Reply', position: { x: 500, y: 300 }, config: {} },
        { id: 'resolve', type: 'agent', label: 'Resolve', position: { x: 650, y: 200 }, config: {} },
        { id: 'notify', type: 'api', label: 'Notify Customer', position: { x: 800, y: 200 }, config: {} },
        { id: 'end', type: 'end', label: 'End', position: { x: 950, y: 200 }, config: {} },
      ],
      templateEdges: [
        { id: 'e1', source: 'start', target: 'classify' },
        { id: 'e2', source: 'classify', target: 'priority' },
        { id: 'e3', source: 'priority', target: 'escalate' },
        { id: 'e4', source: 'priority', target: 'autoReply' },
        { id: 'e5', source: 'escalate', target: 'resolve' },
        { id: 'e6', source: 'autoReply', target: 'resolve' },
        { id: 'e7', source: 'resolve', target: 'notify' },
        { id: 'e8', source: 'notify', target: 'end' },
      ],
    },
    {
      id: 't3', name: 'Content Generation', iconType: 'edit', description: 'Multi-step content creation',
      templateNodes: [
        { id: 'start', type: 'start', label: 'Start', position: { x: 50, y: 200 }, config: {} },
        { id: 'research', type: 'agent', label: 'Research Topic', position: { x: 200, y: 200 }, config: {} },
        { id: 'outline', type: 'agent', label: 'Create Outline', position: { x: 350, y: 200 }, config: {} },
        { id: 'draft', type: 'agent', label: 'Write Draft', position: { x: 500, y: 200 }, config: {} },
        { id: 'review', type: 'agent', label: 'Review & Edit', position: { x: 650, y: 200 }, config: {} },
        { id: 'publish', type: 'api', label: 'Publish', position: { x: 800, y: 200 }, config: {} },
        { id: 'end', type: 'end', label: 'End', position: { x: 950, y: 200 }, config: {} },
      ],
      templateEdges: [
        { id: 'e1', source: 'start', target: 'research' },
        { id: 'e2', source: 'research', target: 'outline' },
        { id: 'e3', source: 'outline', target: 'draft' },
        { id: 'e4', source: 'draft', target: 'review' },
        { id: 'e5', source: 'review', target: 'publish' },
        { id: 'e6', source: 'publish', target: 'end' },
      ],
    },
    {
      id: 't4', name: 'Research Assistant', iconType: 'search', description: 'Research and analysis workflow',
      templateNodes: [
        { id: 'start', type: 'start', label: 'Start', position: { x: 50, y: 200 }, config: {} },
        { id: 'query', type: 'agent', label: 'Parse Query', position: { x: 200, y: 200 }, config: {} },
        { id: 'search', type: 'api', label: 'Web Search', position: { x: 350, y: 100 }, config: {} },
        { id: 'dbSearch', type: 'api', label: 'DB Search', position: { x: 350, y: 300 }, config: {} },
        { id: 'merge', type: 'transform', label: 'Merge Results', position: { x: 500, y: 200 }, config: {} },
        { id: 'analyze', type: 'agent', label: 'Analyze', position: { x: 650, y: 200 }, config: {} },
        { id: 'summarize', type: 'agent', label: 'Summarize', position: { x: 800, y: 200 }, config: {} },
        { id: 'end', type: 'end', label: 'End', position: { x: 950, y: 200 }, config: {} },
      ],
      templateEdges: [
        { id: 'e1', source: 'start', target: 'query' },
        { id: 'e2', source: 'query', target: 'search' },
        { id: 'e3', source: 'query', target: 'dbSearch' },
        { id: 'e4', source: 'search', target: 'merge' },
        { id: 'e5', source: 'dbSearch', target: 'merge' },
        { id: 'e6', source: 'merge', target: 'analyze' },
        { id: 'e7', source: 'analyze', target: 'summarize' },
        { id: 'e8', source: 'summarize', target: 'end' },
      ],
    },
    {
      id: 't5', name: 'Code Review', iconType: 'code', description: 'Automated code review pipeline',
      templateNodes: [
        { id: 'start', type: 'start', label: 'PR Opened', position: { x: 50, y: 200 }, config: {} },
        { id: 'fetch', type: 'api', label: 'Fetch Diff', position: { x: 200, y: 200 }, config: {} },
        { id: 'lint', type: 'agent', label: 'Lint & Style', position: { x: 350, y: 200 }, config: {} },
        { id: 'security', type: 'agent', label: 'Security Scan', position: { x: 500, y: 200 }, config: {} },
        { id: 'comment', type: 'api', label: 'Post Review', position: { x: 650, y: 200 }, config: {} },
        { id: 'end', type: 'end', label: 'End', position: { x: 800, y: 200 }, config: {} },
      ],
      templateEdges: [
        { id: 'e1', source: 'start', target: 'fetch' },
        { id: 'e2', source: 'fetch', target: 'lint' },
        { id: 'e3', source: 'lint', target: 'security' },
        { id: 'e4', source: 'security', target: 'comment' },
        { id: 'e5', source: 'comment', target: 'end' },
      ],
    },
    {
      id: 't6', name: 'Report Generator', iconType: 'barChart', description: 'Automated report generation',
      templateNodes: [
        { id: 'start', type: 'start', label: 'Start', position: { x: 50, y: 200 }, config: {} },
        { id: 'gather', type: 'http_request', label: 'Gather Data', position: { x: 200, y: 200 }, config: {} },
        { id: 'process', type: 'transform_data', label: 'Process', position: { x: 350, y: 200 }, config: {} },
        { id: 'generate', type: 'llm_completion', label: 'Generate Report', position: { x: 500, y: 200 }, config: {} },
        { id: 'deliver', type: 'email_send', label: 'Deliver', position: { x: 650, y: 200 }, config: {} },
        { id: 'end', type: 'end', label: 'End', position: { x: 800, y: 200 }, config: {} },
      ],
      templateEdges: [
        { id: 'e1', source: 'start', target: 'gather' },
        { id: 'e2', source: 'gather', target: 'process' },
        { id: 'e3', source: 'process', target: 'generate' },
        { id: 'e4', source: 'generate', target: 'deliver' },
        { id: 'e5', source: 'deliver', target: 'end' },
      ],
    },
    {
      id: 't7', name: 'AI Events Scraper', iconType: 'search', description: 'Scrape AI/IT events from the web, deduplicate, generate PDF report, and email it',
      templateNodes: [
        { id: 'start', type: 'start', label: 'Start', position: { x: 50, y: 200 }, config: {} },
        { id: 'search_events', type: 'web_search', label: 'Search AI Events', position: { x: 220, y: 200 }, config: {
          query: 'AI technology conferences events 2026',
          engine: 'duckduckgo',
          max_results: 50,
          time_range: 'month',
        }},
        { id: 'extract_events', type: 'llm_completion', label: 'Extract Event Data', position: { x: 420, y: 200 }, config: {
          provider: 'groq',
          model: 'groq/llama-3.3-70b-versatile',
          prompt: 'You are a data extraction expert. Extract structured event data from search results into a JSON array.',
          user_message: 'Extract all AI/IT events from these search results. For each event return JSON with fields: name, description, date, time, location, price, registration_url. Search results: {{steps.search_events.output}}',
          max_tokens: 4096,
          temperature: 0.3,
        }},
        { id: 'deduplicate', type: 'data_filter', label: 'Remove Duplicates', position: { x: 620, y: 200 }, config: {
          field: 'name',
          operator: 'is_unique',
          deduplicate_key: 'name',
        }},
        { id: 'format_report', type: 'llm_completion', label: 'Generate HTML Report', position: { x: 820, y: 200 }, config: {
          provider: 'groq',
          model: 'groq/llama-3.3-70b-versatile',
          prompt: 'You are a professional report designer. Generate a beautiful HTML report for PDF conversion with modern styling.',
          user_message: 'Create a professional HTML report titled "AI & IT Events Report" with a table listing each event: Name, Description, Date & Time, Location, Price, and Registration Link. Events data: {{steps.deduplicate.output}}',
          max_tokens: 4096,
          temperature: 0.5,
        }},
        { id: 'email_report', type: 'email_send', label: 'Email Report', position: { x: 1020, y: 200 }, config: {
          to: '{{input.recipient_email}}',
          subject: 'AI & IT Events Report - {{steps.format_report.output.date}}',
          body: '{{steps.format_report.output}}',
          from_name: 'ResonantGenesis Workflows',
          provider: 'platform_smtp',
          attach_output: 'pdf',
        }},
        { id: 'end', type: 'end', label: 'End', position: { x: 1200, y: 200 }, config: {} },
      ],
      templateEdges: [
        { id: 'e1', source: 'start', target: 'search_events' },
        { id: 'e2', source: 'search_events', target: 'extract_events' },
        { id: 'e3', source: 'extract_events', target: 'deduplicate' },
        { id: 'e4', source: 'deduplicate', target: 'format_report' },
        { id: 'e5', source: 'format_report', target: 'email_report' },
        { id: 'e6', source: 'email_report', target: 'end' },
      ],
    },
  ];

  const handleUseTemplate = useCallback((template: typeof workflowTemplates[0]) => {
    (async () => {
      setIsWorking(true);
      setPanelError(null);
      try {
        const created = await workflowsApi.createWorkflow({
          name: template.name,
          description: template.description,
          trigger_type: 'manual',
          trigger_config: {
            ui_graph: { nodes: template.templateNodes, edges: template.templateEdges },
            ui_status: 'draft',
            ui_published_at: null,
          },
          steps: [],
        });

        const uiCreated = apiToUiWorkflow(created);
        addWorkflow(uiCreated);
        selectWorkflow(uiCreated.id);
        setActiveView('builder');
      } catch (e: any) {
        const msg = e?.response?.data?.detail || e?.message || 'Failed to create workflow from template';
        setPanelError(msg);
        setTimeout(() => setPanelError(null), 7000);
      } finally {
        setIsWorking(false);
      }
    })();
  }, [addWorkflow, apiToUiWorkflow, selectWorkflow, setActiveView]);

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Fork /> Workflow Builder</h2>
        <button onClick={handleExportWorkflows} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Icons.Download /> Export
        </button>
        <div className={styles.viewTabs}>
          {(['list', 'builder', 'templates'] as ViewMode[]).map(view => (
            <button
              key={view}
              className={`${styles.viewTab} ${activeView === view ? styles.active : ''}`}
              onClick={() => setActiveView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Error Banner */}
        {panelError && (
          <div style={{ padding: '8px 12px', margin: '8px 0', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{panelError}</span>
            <button onClick={() => setPanelError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}>&times;</button>
          </div>
        )}

        {/* Working Indicator */}
        {isWorking && (
          <div style={{ padding: '6px 12px', margin: '8px 0', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', fontSize: '12px' }}>
            Working...
          </div>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <>
            {workflowStats && (
              <div className={styles.statsBar}>
                <span><strong>{workflowStats.total_workflows}</strong> Total</span>
                <span><strong>{workflowStats.published}</strong> Published</span>
                <span><strong>{workflowStats.draft}</strong> Draft</span>
                <span><strong>{workflowStats.success_rate}%</strong> Success</span>
                <span><strong>{workflowStats.total_executions}</strong> Runs</span>
              </div>
            )}
            <div className={styles.createSection}>
              <input
                type="text"
                
                value={newWorkflowName}
                onChange={e => setNewWorkflowName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCreateWorkflow()}
              />
              <button className={styles.createBtn} onClick={handleCreateWorkflow}>
                <Icons.Plus /> Create
              </button>
            </div>

            <div className={styles.workflowsList}>
              <h3>Your Workflows</h3>
              {workflows.map((workflow: UIWorkflow) => (
                <div 
                  key={workflow.id}
                  className={`${styles.workflowCard} ${selectedWorkflowId === workflow.id ? styles.selected : ''}`}
                  onClick={() => selectWorkflow(workflow.id)}
                >
                  <div className={styles.workflowHeader}>
                    <span className={styles.workflowName}>{workflow.name}</span>
                    <span className={`${styles.statusBadge} ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className={styles.workflowDesc}>{workflow.description || 'No description'}</p>
                  <div className={styles.workflowMeta}>
                    <span><Icons.Fork /> {workflow.nodes.length} nodes</span>
                    <span>v{workflow.version}</span>
                    <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.workflowActions}>
                    <button onClick={(e) => { e.stopPropagation(); selectWorkflow(workflow.id); setActiveView('builder'); }}>
                      <Icons.Edit /> Edit
                    </button>
                    {workflow.status === 'draft' && (
                      <button onClick={(e) => { e.stopPropagation(); handleValidateWorkflow(workflow.id); }}>
                        <Icons.Check /> Validate
                      </button>
                    )}
                    {workflow.status === 'validated' && (
                      <button onClick={(e) => { e.stopPropagation(); handlePublishWorkflow(workflow.id); }}>
                        <Icons.Upload /> Publish
                      </button>
                    )}
                    <button 
                      className={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(workflow.id); }}
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Builder View */}
        {activeView === 'builder' && (
          <div className={styles.builderSection}>
            {selectedWorkflow ? (
              <>
                <div className={styles.builderHeader}>
                  <h3>{selectedWorkflow.name}</h3>
                  <span className={`${styles.statusBadge} ${getStatusColor(selectedWorkflow.status)}`}>
                    {selectedWorkflow.status}
                  </span>
                  <div className={styles.builderActions}>
                    <button
                      className={styles.primaryBtn}
                      onClick={() => navigate('/network/workflows/visual')}
                      style={{ background: '#6366f1', display: 'flex', alignItems: 'center', gap: 4 }}
                      title="Open full-screen visual workflow builder with ReactFlow canvas"
                    >
                      <Icons.External /> Full Builder
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => handleAddNode('http_request')}>
                      <Icons.Plus /> Add Node
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => handleValidateWorkflow(selectedWorkflow.id)}>
                      <Icons.Check /> Validate
                    </button>
                    <button className={styles.primaryBtn} onClick={() => handleRunWorkflow(selectedWorkflow.id)}>
                      <Icons.Play /> Run
                    </button>
                  </div>
                </div>
                <div className={styles.builderBody}>
                  <div className={styles.nodesPalette}>
                    <h4>Node Palette</h4>
                    <div className={styles.paletteGrid}>
                      {NODE_PALETTE.map(node => (
                        <div 
                          key={node.type} 
                          className={styles.paletteNode}
                          onClick={() => handleAddNode(node.type)}
                          style={{ borderColor: node.color }}
                        >
                          {getNodeIcon(node.type)}
                          <span>{node.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.paletteInfo}>
                      <p>Click a node to add it to the canvas</p>
                      <p>Drag nodes to reposition</p>
                      <p>Connect nodes by dragging from output to input</p>
                    </div>
                  </div>
                  <div className={styles.canvasArea}>
                    <WorkflowCanvas
                      nodes={selectedWorkflow.nodes as any}
                      edges={selectedWorkflow.edges as any}
                      onNodesChange={handleNodesChange}
                      onEdgesChange={handleEdgesChange}
                      onNodeSelect={setSelectedNodeId}
                      selectedNodeId={selectedNodeId}
                    />
                  </div>
                  {selectedNodeId && (
                    <div className={styles.nodeConfig}>
                      <h4>Node Configuration</h4>
                      {renderNodeConfig()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <Icons.Fork />
                <p>Select a workflow to edit</p>
                <button className={styles.primaryBtn} onClick={() => setActiveView('list')}>
                  View Workflows
                </button>
              </div>
            )}
          </div>
        )}

        {/* Templates View */}
        {activeView === 'templates' && (
          <div className={styles.templatesSection}>
            <h3>Workflow Templates</h3>
            <div className={styles.templatesGrid}>
              {workflowTemplates.map(template => (
                <div key={template.id} className={styles.templateCard}>
                  <span className={styles.templateIcon}>{getTemplateIcon(template.iconType)}</span>
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <div className={styles.templateMeta}>
                    <span>{template.templateNodes.length} nodes</span>
                  </div>
                  <button className={styles.useTemplateBtn} onClick={() => handleUseTemplate(template)}>
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const WorkflowPanel = memo(WorkflowPanelComponent);
export default WorkflowPanel;
