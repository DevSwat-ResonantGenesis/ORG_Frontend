import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
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

// Node palette configuration
const NODE_PALETTE = [
  { type: 'http_request', label: 'HTTP Request', color: '#14b8a6' },
  { type: 'llm_completion', label: 'LLM Call', color: '#8b5cf6' },
  { type: 'memory_search', label: 'Memory Search', color: '#06b6d4' },
  { type: 'agent_execute', label: 'Agent', color: '#0ea5e9' },
  { type: 'send_notification', label: 'Notification', color: '#f97316' },
  { type: 'transform_data', label: 'Transform', color: '#ec4899' },
  { type: 'condition', label: 'Condition', color: '#f59e0b' },
  { type: 'delay', label: 'Delay', color: '#6366f1' },
  { type: 'loop', label: 'Loop', color: '#a855f7' },
  { type: 'parallel', label: 'Parallel', color: '#06b6d4' },
  { type: 'webhook', label: 'Webhook', color: '#10b981' },
  { type: 'code_execute', label: 'Run Code', color: '#f43f5e' },
  { type: 'email', label: 'Email', color: '#f97316' },
  { type: 'database', label: 'Database', color: '#8b5cf6' },
  { type: 'filter', label: 'Filter', color: '#eab308' },
];

const WorkflowPanelComponent: React.FC<WorkflowPanelProps> = ({ className }) => {
  const storeWorkflows = useWorkflowStore(state => state.workflows);
  const selectedWorkflowId = useWorkflowStore(state => state.selectedWorkflowId);
  const { setWorkflows, addWorkflow, updateWorkflow, removeWorkflow, selectWorkflow, publishWorkflow, validateWorkflow, setLoading, setError } = useWorkflowStore();
  const agents = useAgentStore(state => state.agents);
  
  const [activeView, setActiveView] = useState<ViewMode>('list');
  const [workflowStats, setWorkflowStats] = useState<any>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

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
      case 'http_request': return <Icons.External />;
      case 'llm_completion': return <Icons.Brain />;
      case 'memory_search': return <Icons.Search />;
      case 'agent_execute': return <Icons.Agents />;
      case 'send_notification': return <Icons.Send />;
      case 'transform_data': return <Icons.Zap />;
      case 'condition': return <Icons.Fork />;
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
              <input type="text" placeholder="https://api.example.com/endpoint" value={cfg.url || ''} onChange={e => updateNodeConfig(node.id, { url: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'llm_completion' && (
          <>
            <div className={styles.configField}>
              <label>Prompt</label>
              <textarea rows={4} placeholder="Enter prompt... Use {{input.key}} for variables" value={cfg.prompt || ''} onChange={e => updateNodeConfig(node.id, { prompt: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Model</label>
              <input type="text" placeholder="gpt-4-turbo-preview" value={cfg.model || ''} onChange={e => updateNodeConfig(node.id, { model: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Max Tokens</label>
              <input type="number" placeholder="1024" value={cfg.max_tokens || ''} onChange={e => updateNodeConfig(node.id, { max_tokens: parseInt(e.target.value) || 1024 })} />
            </div>
          </>
        )}

        {node.type === 'memory_search' && (
          <>
            <div className={styles.configField}>
              <label>Query</label>
              <input type="text" placeholder="Search query... Use {{input.key}} for variables" value={cfg.query || ''} onChange={e => updateNodeConfig(node.id, { query: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Limit</label>
              <input type="number" placeholder="5" value={cfg.limit || ''} onChange={e => updateNodeConfig(node.id, { limit: parseInt(e.target.value) || 5 })} />
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
              <label>Task</label>
              <textarea rows={3} placeholder="Task description for the agent" value={cfg.task || ''} onChange={e => updateNodeConfig(node.id, { task: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'send_notification' && (
          <>
            <div className={styles.configField}>
              <label>Channel</label>
              <select value={cfg.channel || 'log'} onChange={e => updateNodeConfig(node.id, { channel: e.target.value })}>
                {['log','email','slack','webhook'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Message</label>
              <textarea rows={3} placeholder="Notification message... Use {{steps.step_name.output}} for variables" value={cfg.message || ''} onChange={e => updateNodeConfig(node.id, { message: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'transform_data' && (
          <div className={styles.configField}>
            <label>Expression</label>
            <input type="text" placeholder="$.steps.step_name.output" value={cfg.expression || ''} onChange={e => updateNodeConfig(node.id, { expression: e.target.value })} />
          </div>
        )}

        {node.type === 'condition' && (
          <>
            <div className={styles.configField}>
              <label>Left Value</label>
              <input type="text" placeholder="{{steps.step_name.result}}" value={cfg.left || ''} onChange={e => updateNodeConfig(node.id, { left: e.target.value })} />
            </div>
            <div className={styles.configField}>
              <label>Operator</label>
              <select value={cfg.operator || '=='} onChange={e => updateNodeConfig(node.id, { operator: e.target.value })}>
                {['==','!=','>','<','contains'].map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            <div className={styles.configField}>
              <label>Right Value</label>
              <input type="text" placeholder="true" value={cfg.right || ''} onChange={e => updateNodeConfig(node.id, { right: e.target.value })} />
            </div>
          </>
        )}

        {node.type === 'delay' && (
          <div className={styles.configField}>
            <label>Seconds</label>
            <input type="number" placeholder="5" value={cfg.seconds || ''} onChange={e => updateNodeConfig(node.id, { seconds: parseInt(e.target.value) || 1 })} />
          </div>
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
        { id: 'gather', type: 'api', label: 'Gather Data', position: { x: 200, y: 200 }, config: {} },
        { id: 'process', type: 'transform', label: 'Process', position: { x: 350, y: 200 }, config: {} },
        { id: 'generate', type: 'agent', label: 'Generate Report', position: { x: 500, y: 200 }, config: {} },
        { id: 'deliver', type: 'api', label: 'Deliver', position: { x: 650, y: 200 }, config: {} },
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
                placeholder="New workflow name..."
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
                    <button className={styles.secondaryBtn} onClick={() => handleAddNode('agent')}>
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
