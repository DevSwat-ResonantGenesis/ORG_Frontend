import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
  Handle,
  Position,
  NodeProps,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, Trash2, ArrowLeft, Layout, Copy, Download, X, Settings, Undo2, Redo2, List, CheckCircle, XCircle, Loader, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Step type config ──
type WorkflowStepType =
  | 'http_request'
  | 'llm_completion'
  | 'memory_search'
  | 'agent_execute'
  | 'send_notification'
  | 'transform_data'
  | 'condition'
  | 'delay';

interface StepNodeData {
  label: string;
  stepType: WorkflowStepType;
  config: Record<string, any>;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

interface SavedWorkflow {
  id: string;
  name: string;
  status?: string;
  steps?: any[];
  graph_data?: any;
  created_at?: string;
  updated_at?: string;
}

// Config fields for each step type
const STEP_CONFIG_FIELDS: Record<WorkflowStepType, { key: string; label: string; type: 'text' | 'textarea' | 'select' | 'number'; options?: string[] }[]> = {
  http_request: [
    { key: 'url', label: 'URL', type: 'text' },
    { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
    { key: 'headers', label: 'Headers (JSON)', type: 'textarea' },
    { key: 'body', label: 'Body (JSON)', type: 'textarea' },
    { key: 'timeout', label: 'Timeout (ms)', type: 'number' },
  ],
  llm_completion: [
    { key: 'model', label: 'Model', type: 'select', options: ['groq/llama-3.3-70b-versatile', 'groq/llama-3.1-8b-instant', 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet'] },
    { key: 'prompt', label: 'Prompt Template', type: 'textarea' },
    { key: 'system_prompt', label: 'System Prompt', type: 'textarea' },
    { key: 'max_tokens', label: 'Max Tokens', type: 'number' },
    { key: 'temperature', label: 'Temperature', type: 'text' },
  ],
  memory_search: [
    { key: 'query', label: 'Search Query', type: 'text' },
    { key: 'top_k', label: 'Results Count', type: 'number' },
    { key: 'threshold', label: 'Similarity Threshold', type: 'text' },
  ],
  agent_execute: [
    { key: 'agent_id', label: 'Agent ID', type: 'text' },
    { key: 'goal', label: 'Goal/Task', type: 'textarea' },
    { key: 'max_loops', label: 'Max Loops', type: 'number' },
  ],
  send_notification: [
    { key: 'channel', label: 'Channel', type: 'select', options: ['email', 'webhook', 'slack', 'discord'] },
    { key: 'recipient', label: 'Recipient', type: 'text' },
    { key: 'subject', label: 'Subject', type: 'text' },
    { key: 'message', label: 'Message', type: 'textarea' },
  ],
  transform_data: [
    { key: 'transform_type', label: 'Transform Type', type: 'select', options: ['jq', 'jsonpath', 'template', 'javascript'] },
    { key: 'expression', label: 'Expression', type: 'textarea' },
  ],
  condition: [
    { key: 'condition_type', label: 'Condition Type', type: 'select', options: ['equals', 'contains', 'greater_than', 'less_than', 'regex', 'javascript'] },
    { key: 'field', label: 'Field to Check', type: 'text' },
    { key: 'value', label: 'Expected Value', type: 'text' },
  ],
  delay: [
    { key: 'duration_ms', label: 'Duration (ms)', type: 'number' },
    { key: 'until', label: 'Wait Until (ISO date)', type: 'text' },
  ],
};

const STEP_PALETTE: { type: WorkflowStepType; label: string; color: string; icon: string }[] = [
  { type: 'http_request', label: 'HTTP Request', color: '#3b82f6', icon: '🌐' },
  { type: 'llm_completion', label: 'LLM Call', color: '#8b5cf6', icon: '🧠' },
  { type: 'memory_search', label: 'Memory Search', color: '#06b6d4', icon: '🔍' },
  { type: 'agent_execute', label: 'Agent Execute', color: '#f59e0b', icon: '🤖' },
  { type: 'send_notification', label: 'Notification', color: '#10b981', icon: '📧' },
  { type: 'transform_data', label: 'Transform', color: '#6366f1', icon: '🔄' },
  { type: 'condition', label: 'Condition', color: '#ef4444', icon: '🔀' },
  { type: 'delay', label: 'Delay', color: '#78716c', icon: '⏱️' },
];

const STEP_COLORS: Record<string, string> = Object.fromEntries(STEP_PALETTE.map((s) => [s.type, s.color]));
const STEP_ICONS: Record<string, string> = Object.fromEntries(STEP_PALETTE.map((s) => [s.type, s.icon]));

const STATUS_COLORS: Record<string, string> = {
  pending: '#64748b', running: '#3b82f6', completed: '#22c55e', failed: '#ef4444',
};

// ── Custom Step Node ──
const StepNodeComponent = React.memo(({ data, selected }: NodeProps<StepNodeData>) => {
  const color = STEP_COLORS[data.stepType] || '#6366f1';
  const icon = STEP_ICONS[data.stepType] || '⚙️';
  const statusColor = data.status ? STATUS_COLORS[data.status] : null;

  return (
    <div
      style={{
        background: '#1e293b',
        border: `2px solid ${selected ? '#e2e8f0' : statusColor || color}`,
        borderRadius: 10,
        minWidth: 180,
        boxShadow: selected ? `0 0 12px ${color}40` : data.status === 'running' ? `0 0 12px ${STATUS_COLORS.running}40` : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0f172a' }}
      />
      <div
        style={{
          background: `${color}20`,
          borderBottom: `1px solid ${color}40`,
          padding: '6px 12px',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {data.stepType.replace(/_/g, ' ')}
        </span>
        {data.status && (
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor || '#64748b', display: 'inline-block', marginLeft: 'auto', animation: data.status === 'running' ? 'pulse 1.5s infinite' : 'none' }} />
        )}
      </div>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{data.label}</div>
        {data.config?.url && (
          <div
            style={{
              color: '#64748b',
              fontSize: 11,
              marginTop: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 160,
            }}
          >
            {data.config.url}
          </div>
        )}
        {data.config?.model && (
          <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{data.config.model}</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0f172a' }}
      />
      {data.stepType === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ background: '#10b981', width: 8, height: 8, border: '2px solid #0f172a', top: '60%' }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="false"
            style={{ background: '#ef4444', width: 8, height: 8, border: '2px solid #0f172a', top: '60%' }}
          />
        </>
      )}
    </div>
  );
});
StepNodeComponent.displayName = 'StepNodeComponent';

const nodeTypes: NodeTypes = { stepNode: StepNodeComponent };

// ── Inline styles ──
const S = {
  topBtn: (bg: string, opacity = 1): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
    background: bg, border: 'none', borderRadius: 6, color: 'white',
    cursor: 'pointer', fontSize: 13, opacity, transition: 'opacity 0.15s',
  }),
  smallBtn: (active = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
    background: active ? '#334155' : 'transparent', border: '1px solid #334155',
    borderRadius: 4, color: '#94a3b8', cursor: 'pointer', fontSize: 12,
  }),
  cfgInput: {
    width: '100%', padding: '6px 10px', background: '#0f172a',
    border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0',
    fontSize: 12, outline: 'none',
  } as React.CSSProperties,
  cfgTextarea: {
    width: '100%', padding: '6px 10px', background: '#0f172a',
    border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0',
    fontSize: 12, outline: 'none', minHeight: 60, resize: 'vertical' as const,
    fontFamily: 'monospace',
  } as React.CSSProperties,
  cfgSelect: {
    width: '100%', padding: '6px 10px', background: '#0f172a',
    border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 12,
  } as React.CSSProperties,
};

// ── Inner Component (needs ReactFlow context for drag-drop) ──
function VisualWorkflowInner() {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(true);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [showLoadPanel, setShowLoadPanel] = useState(false);
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  // Show toast message
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Save undo state
  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack([]);
  }, [nodes, edges]);

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(rs => [...rs, { nodes: [...nodes], edges: [...edges] }]);
    setUndoStack(us => us.slice(0, -1));
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [undoStack, nodes, edges, setNodes, setEdges]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(us => [...us, { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack(rs => rs.slice(0, -1));
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [redoStack, nodes, edges, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault(); deleteSelected();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo, selectedNode]);

  const onConnect = useCallback(
    (connection: Connection) => {
      pushUndo();
      setEdges((eds) =>
        addEdge({ ...connection, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)
      );
    },
    [setEdges, pushUndo]
  );

  const addNode = useCallback(
    (stepType: WorkflowStepType) => {
      pushUndo();
      const palette = STEP_PALETTE.find((s) => s.type === stepType)!;
      const id = `step_${Date.now()}`;
      const newNode: Node<StepNodeData> = {
        id,
        type: 'stepNode',
        position: { x: 250 + Math.random() * 200, y: 80 + nodes.length * 120 },
        data: { label: palette.label, stepType, config: {} },
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNode(id);
    },
    [nodes.length, setNodes, pushUndo]
  );

  // Drag-and-drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const stepType = event.dataTransfer.getData('application/workflow-step') as WorkflowStepType;
    if (!stepType) return;
    const palette = STEP_PALETTE.find((s) => s.type === stepType);
    if (!palette) return;
    pushUndo();
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = `step_${Date.now()}`;
    const newNode: Node<StepNodeData> = {
      id, type: 'stepNode', position,
      data: { label: palette.label, stepType, config: {} },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(id);
  }, [screenToFlowPosition, setNodes, pushUndo]);

  const deleteSelected = useCallback(() => {
    if (!selectedNode) return;
    pushUndo();
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges, pushUndo]);

  const duplicateSelected = useCallback(() => {
    if (!selectedNode) return;
    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return;
    pushUndo();
    const id = `step_${Date.now()}`;
    const newNode: Node<StepNodeData> = {
      id,
      type: 'stepNode',
      position: { x: node.position.x + 40, y: node.position.y + 60 },
      data: { ...node.data as StepNodeData, config: { ...(node.data as StepNodeData).config } },
    };
    setNodes(nds => [...nds, newNode]);
    setSelectedNode(id);
    showToast('success', 'Node duplicated');
  }, [selectedNode, nodes, setNodes, pushUndo, showToast]);

  // Update selected node data
  const updateNodeData = useCallback((key: string, value: any) => {
    if (!selectedNode) return;
    setNodes(nds => nds.map(n => {
      if (n.id !== selectedNode) return n;
      const data = n.data as StepNodeData;
      if (key === 'label') return { ...n, data: { ...data, label: value } };
      return { ...n, data: { ...data, config: { ...data.config, [key]: value } } };
    }));
  }, [selectedNode, setNodes]);

  const toWorkflowJson = useCallback(() => {
    const steps = nodes.map((node, idx) => {
      const data = node.data as StepNodeData;
      const outEdges = edges.filter((e) => e.source === node.id);
      return {
        id: node.id, name: data.label, type: data.stepType, order: idx,
        config: data.config || {}, next: outEdges.map((e) => e.target), position: node.position,
      };
    });
    return {
      name: workflowName, steps,
      graph_data: {
        nodes: nodes.map((n) => ({ id: n.id, position: n.position, data: n.data })),
        edges,
      },
    };
  }, [nodes, edges, workflowName]);

  const handleSave = useCallback(async () => {
    if (nodes.length === 0) { showToast('error', 'Add at least one step'); return; }
    setSaving(true);
    try {
      const json = toWorkflowJson();
      const url = workflowId ? `/api/v1/workflow/workflows/${workflowId}` : '/api/v1/workflow/workflows';
      const method = workflowId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const data = await res.json();
      if (data.id) setWorkflowId(data.id);
      showToast('success', workflowId ? 'Workflow updated!' : `Workflow "${workflowName}" saved!`);
      loadWorkflowsList();
    } catch (e: any) {
      showToast('error', e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [toWorkflowJson, nodes.length, workflowName, workflowId, showToast]);

  const handleRun = useCallback(async () => {
    if (nodes.length === 0) { showToast('error', 'Add steps before running'); return; }
    setRunning(true);
    setRunStatus('running');
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'pending' as const } })));
    try {
      const json = toWorkflowJson();
      const url = workflowId ? `/api/v1/workflow/workflows/${workflowId}/execute` : '/api/v1/workflows/draft/run';
      const body = workflowId ? { input: {} } : { inputs: {}, ...json };
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Run failed: ${res.status}`);
      const result = await res.json();
      setRunStatus(result.status || 'completed');
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'completed' as const } })));
      showToast('success', `Workflow ${result.status || 'executed'}!`);
    } catch (e: any) {
      setRunStatus('failed');
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'failed' as const } })));
      showToast('error', e?.message || 'Run failed');
    } finally {
      setRunning(false);
    }
  }, [toWorkflowJson, nodes.length, workflowId, showToast, setNodes]);

  const handleNew = useCallback(() => {
    pushUndo();
    setNodes([]);
    setEdges([]);
    setWorkflowId(null);
    setWorkflowName('Untitled Workflow');
    setRunStatus(null);
    setSelectedNode(null);
  }, [setNodes, setEdges, pushUndo]);

  // Load workflows list
  const loadWorkflowsList = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/workflow/workflows', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSavedWorkflows(Array.isArray(data) ? data : data?.workflows || []);
      }
    } catch { /* ignore */ }
  }, []);

  // Load a specific workflow
  const loadWorkflow = useCallback(async (wf: SavedWorkflow) => {
    try {
      const res = await fetch(`/api/v1/workflow/workflows/${wf.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Load failed');
      const data = await res.json();
      setWorkflowId(data.id || wf.id);
      setWorkflowName(data.name || wf.name);
      setRunStatus(null);
      if (data.graph_data?.nodes && data.graph_data?.edges) {
        setNodes(data.graph_data.nodes.map((n: any) => ({ ...n, type: n.type || 'stepNode' })));
        setEdges(data.graph_data.edges);
      } else if (data.steps) {
        const loadedNodes = data.steps.map((s: any, i: number) => ({
          id: s.id || `step_${i}`,
          type: 'stepNode',
          position: s.position || { x: 250, y: 80 + i * 120 },
          data: { label: s.name, stepType: s.type, config: s.config || {} },
        }));
        setNodes(loadedNodes);
        const loadedEdges: Edge[] = [];
        data.steps.forEach((s: any) => {
          (s.next || []).forEach((targetId: string) => {
            loadedEdges.push({ id: `e-${s.id}-${targetId}`, source: s.id, target: targetId, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } });
          });
        });
        setEdges(loadedEdges);
      }
      setShowLoadPanel(false);
      showToast('success', `Loaded "${data.name || wf.name}"`);
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to load workflow');
    }
  }, [setNodes, setEdges, showToast]);

  // Export as JSON
  const handleExport = useCallback(() => {
    const json = toWorkflowJson();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${workflowName.replace(/\s+/g, '_')}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Workflow exported');
  }, [toWorkflowJson, workflowName, showToast]);

  // Get selected node data for config panel
  const selectedNodeData = useMemo(() => {
    if (!selectedNode) return null;
    const node = nodes.find(n => n.id === selectedNode);
    return node ? (node.data as StepNodeData) : null;
  }, [selectedNode, nodes]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0e1a' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          background: toast.type === 'success' ? '#065f46' : '#7f1d1d',
          color: toast.type === 'success' ? '#6ee7b7' : '#fca5a5',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {toast.text}
        </div>
      )}

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
        background: '#0f172a', borderBottom: '1px solid #1e293b', flexWrap: 'wrap',
      }}>
        <button onClick={() => navigate('/network/workflows')} style={S.smallBtn()}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ width: 1, height: 24, background: '#334155', margin: '0 4px' }} />
        <Layout size={18} color="#6366f1" />
        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 15, fontWeight: 600, width: 260, outline: 'none' }}
        />
        <div style={{ flex: 1 }} />
        {/* Run status indicator */}
        {runStatus && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: `${STATUS_COLORS[runStatus] || '#64748b'}20`, color: STATUS_COLORS[runStatus] || '#64748b', border: `1px solid ${STATUS_COLORS[runStatus] || '#64748b'}40` }}>
            {runStatus === 'running' ? <Loader size={10} className="spin" /> : runStatus === 'completed' ? <CheckCircle size={10} /> : runStatus === 'failed' ? <XCircle size={10} /> : null}
            {runStatus}
          </span>
        )}
        {workflowId && <span style={{ color: '#334155', fontSize: 10, fontFamily: 'monospace' }}>ID: {workflowId.substring(0, 8)}</span>}
        <span style={{ color: '#64748b', fontSize: 11 }}>{nodes.length} steps | {edges.length} connections</span>
        <div style={{ width: 1, height: 24, background: '#334155', margin: '0 4px' }} />
        <button onClick={handleUndo} style={S.smallBtn()} title="Undo (Ctrl+Z)"><Undo2 size={14} /></button>
        <button onClick={handleRedo} style={S.smallBtn()} title="Redo (Ctrl+Y)"><Redo2 size={14} /></button>
        <div style={{ width: 1, height: 24, background: '#334155', margin: '0 4px' }} />
        <button onClick={handleNew} style={S.smallBtn()}><Plus size={14} /> New</button>
        <button onClick={() => { setShowLoadPanel(!showLoadPanel); if (!showLoadPanel) loadWorkflowsList(); }} style={S.smallBtn(showLoadPanel)}>
          <List size={14} /> Load
        </button>
        <button onClick={handleExport} style={S.smallBtn()} title="Export JSON"><Download size={14} /></button>
        <div style={{ width: 1, height: 24, background: '#334155', margin: '0 4px' }} />
        <button onClick={handleSave} disabled={saving} style={S.topBtn('#3b82f6', saving ? 0.6 : 1)}>
          <Save size={14} /> {saving ? 'Saving...' : workflowId ? 'Update' : 'Save'}
        </button>
        <button onClick={handleRun} disabled={running} style={S.topBtn('#10b981', running ? 0.6 : 1)}>
          <Play size={14} /> {running ? 'Running...' : 'Run'}
        </button>
        {selectedNode && (
          <>
            <button onClick={duplicateSelected} style={S.topBtn('#6366f1')}><Copy size={14} /> Clone</button>
            <button onClick={deleteSelected} style={S.topBtn('#ef4444')}><Trash2 size={14} /> Delete</button>
          </>
        )}
      </div>

      {/* Load Panel (dropdown) */}
      {showLoadPanel && (
        <div style={{
          position: 'absolute', top: 52, right: 240, zIndex: 50,
          width: 320, maxHeight: 400, overflowY: 'auto',
          background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>Saved Workflows</span>
            <button onClick={() => setShowLoadPanel(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={14} /></button>
          </div>
          {savedWorkflows.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12, padding: '16px 0', textAlign: 'center' }}>No saved workflows found</div>
          ) : savedWorkflows.map(wf => (
            <button key={wf.id} onClick={() => loadWorkflow(wf)} style={{
              display: 'block', width: '100%', padding: '8px 10px', marginBottom: 4,
              background: '#0f172a', border: '1px solid #334155', borderRadius: 6,
              color: '#e2e8f0', cursor: 'pointer', fontSize: 12, textAlign: 'left',
            }}>
              <div style={{ fontWeight: 500 }}>{wf.name}</div>
              {wf.created_at && <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>{new Date(wf.created_at).toLocaleDateString()}</div>}
            </button>
          ))}
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Left sidebar: step palette */}
        <div style={{ width: 200, background: '#0f172a', borderRight: '1px solid #1e293b', padding: 10, overflowY: 'auto' }}>
          <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
            Add Steps
          </div>
          {STEP_PALETTE.map((step) => (
            <div
              key={step.type}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData('application/workflow-step', step.type); e.dataTransfer.effectAllowed = 'move'; }}
              onClick={() => addNode(step.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 10px', marginBottom: 3, background: '#1e293b',
                border: '1px solid #334155', borderLeft: `3px solid ${step.color}`,
                borderRadius: 6, color: '#e2e8f0', cursor: 'grab', fontSize: 12,
                transition: 'background 0.15s', userSelect: 'none',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#334155'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#1e293b'; }}
            >
              <span>{step.icon}</span>
              <span>{step.label}</span>
            </div>
          ))}
          <div style={{ color: '#475569', fontSize: 10, marginTop: 12, padding: '6px 4px', borderTop: '1px solid #1e293b', lineHeight: 1.5 }}>
            Drag or click to add. Connect by dragging handles. Del to remove. Ctrl+Z undo. Ctrl+S save.
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1 }} ref={reactFlowWrapper} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} nodeTypes={nodeTypes}
            onNodeClick={(_, node) => { setSelectedNode(node.id); setShowConfigPanel(true); }}
            onPaneClick={() => setSelectedNode(null)}
            fitView style={{ background: '#0a0e1a' }}
            defaultEdgeOptions={{ animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }}
          >
            <Background color="#1e293b" gap={20} />
            <Controls style={{ background: '#1e293b', borderColor: '#334155', borderRadius: 8 }} />
            <MiniMap
              style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              nodeColor={(n: Node) => {
                const data = n.data as StepNodeData;
                return STEP_COLORS[data?.stepType] || '#6366f1';
              }}
            />
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div style={{
                  background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
                  padding: '24px 32px', color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 100,
                }}>
                  <Layout size={40} color="#6366f1" style={{ marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 6, fontSize: 18 }}>Visual Workflow Builder</div>
                  <div style={{ marginBottom: 12 }}>Click steps from the left panel to build your workflow</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>Ctrl+S to save | Ctrl+Z to undo | Del to delete selected</div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right sidebar: Node Config Panel */}
        {showConfigPanel && selectedNodeData && (
          <div style={{
            width: 300, background: '#0f172a', borderLeft: '1px solid #1e293b',
            padding: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          }}>
            {/* Config Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderBottom: '1px solid #1e293b',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings size={14} color="#6366f1" />
                <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>Configure Step</span>
              </div>
              <button onClick={() => setShowConfigPanel(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: 14 }}>
              {/* Step Type Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, marginBottom: 14,
                background: `${STEP_COLORS[selectedNodeData.stepType]}20`,
                color: STEP_COLORS[selectedNodeData.stepType],
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
              }}>
                {STEP_ICONS[selectedNodeData.stepType]} {selectedNodeData.stepType.replace(/_/g, ' ')}
              </div>

              {/* Label */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Label
                </label>
                <input
                  value={selectedNodeData.label}
                  onChange={e => updateNodeData('label', e.target.value)}
                  style={S.cfgInput}
                />
              </div>

              {/* Config Fields */}
              {STEP_CONFIG_FIELDS[selectedNodeData.stepType]?.map(field => (
                <div key={field.key} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    {field.label}
                  </label>
                  {field.type === 'text' && (
                    <input
                      value={selectedNodeData.config[field.key] || ''}
                      onChange={e => updateNodeData(field.key, e.target.value)}
                      style={S.cfgInput}
                      placeholder={field.label}
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={selectedNodeData.config[field.key] || ''}
                      onChange={e => updateNodeData(field.key, e.target.value ? Number(e.target.value) : '')}
                      style={S.cfgInput}
                      placeholder="0"
                    />
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      value={selectedNodeData.config[field.key] || ''}
                      onChange={e => updateNodeData(field.key, e.target.value)}
                      style={S.cfgTextarea}
                      placeholder={field.label}
                    />
                  )}
                  {field.type === 'select' && (
                    <select
                      value={selectedNodeData.config[field.key] || ''}
                      onChange={e => updateNodeData(field.key, e.target.value)}
                      style={S.cfgSelect}
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                </div>
              ))}

              {/* Node ID */}
              <div style={{ marginTop: 16, padding: '8px 0', borderTop: '1px solid #1e293b' }}>
                <div style={{ fontSize: 10, color: '#475569' }}>Node ID: {selectedNode}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Main Page Export (wrapped in ReactFlowProvider for drag-drop) ──
export default function VisualWorkflowPage() {
  return (
    <ReactFlowProvider>
      <VisualWorkflowInner />
    </ReactFlowProvider>
  );
}
