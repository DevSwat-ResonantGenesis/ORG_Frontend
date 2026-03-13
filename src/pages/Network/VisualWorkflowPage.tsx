import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
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
import { Save, Play, Trash2, ArrowLeft, Layout, Settings, X, Copy, Undo2, Redo2, Download, Upload, Eye, Zap, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import fastapiClient from '../../api/fastapiClient';

// ── Types ──
type WorkflowStepType =
  | 'http_request'
  | 'llm_completion'
  | 'memory_search'
  | 'agent_execute'
  | 'send_notification'
  | 'transform_data'
  | 'condition'
  | 'delay'
  | 'code_execute'
  | 'webhook_trigger'
  | 'data_filter'
  | 'aggregator';

interface StepNodeData {
  label: string;
  stepType: WorkflowStepType;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  description?: string;
}

const STEP_PALETTE: { type: WorkflowStepType; label: string; color: string; icon: string; desc: string }[] = [
  { type: 'webhook_trigger', label: 'Webhook Trigger', color: '#f97316', icon: '🔔', desc: 'Start workflow from external webhook' },
  { type: 'http_request', label: 'HTTP Request', color: '#3b82f6', icon: '🌐', desc: 'Call any REST API endpoint' },
  { type: 'llm_completion', label: 'LLM Call', color: '#8b5cf6', icon: '🧠', desc: 'Generate text with AI models' },
  { type: 'memory_search', label: 'Memory Search', color: '#06b6d4', icon: '🔍', desc: 'Search Hash Sphere memory' },
  { type: 'agent_execute', label: 'Run Agent', color: '#f59e0b', icon: '🤖', desc: 'Execute an autonomous agent' },
  { type: 'code_execute', label: 'Run Code', color: '#22c55e', icon: '💻', desc: 'Execute Python/JS code' },
  { type: 'send_notification', label: 'Notification', color: '#10b981', icon: '📧', desc: 'Send email, Slack, Discord' },
  { type: 'transform_data', label: 'Transform', color: '#6366f1', icon: '🔄', desc: 'Map, filter, transform data' },
  { type: 'condition', label: 'If/Else', color: '#ef4444', icon: '🔀', desc: 'Branch based on condition' },
  { type: 'data_filter', label: 'Filter', color: '#a855f7', icon: '🧹', desc: 'Filter array data by rules' },
  { type: 'aggregator', label: 'Aggregator', color: '#ec4899', icon: '📊', desc: 'Merge multiple inputs' },
  { type: 'delay', label: 'Delay', color: '#78716c', icon: '⏱️', desc: 'Wait before continuing' },
];

const COLORS: Record<string, string> = Object.fromEntries(STEP_PALETTE.map(s => [s.type, s.color]));
const ICONS: Record<string, string> = Object.fromEntries(STEP_PALETTE.map(s => [s.type, s.icon]));

// ── Config fields per step type ──
const CONFIG_FIELDS: Record<WorkflowStepType, { key: string; label: string; type: 'text' | 'textarea' | 'select' | 'number'; options?: string[] }[]> = {
  webhook_trigger: [
    { key: 'path', label: 'Webhook Path', type: 'text' },
    { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'GET', 'PUT'] },
    { key: 'secret', label: 'Secret (optional)', type: 'text' },
  ],
  http_request: [
    { key: 'url', label: 'URL', type: 'text' },
    { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
    { key: 'headers', label: 'Headers (JSON)', type: 'textarea' },
    { key: 'body', label: 'Body (JSON)', type: 'textarea' },
    { key: 'timeout', label: 'Timeout (ms)', type: 'number' },
  ],
  llm_completion: [
    { key: 'model', label: 'Model', type: 'select', options: ['groq/llama-3.3-70b', 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro'] },
    { key: 'prompt', label: 'System Prompt', type: 'textarea' },
    { key: 'user_message', label: 'User Message', type: 'textarea' },
    { key: 'max_tokens', label: 'Max Tokens', type: 'number' },
    { key: 'temperature', label: 'Temperature', type: 'number' },
  ],
  memory_search: [
    { key: 'query', label: 'Search Query', type: 'text' },
    { key: 'namespace', label: 'Namespace', type: 'text' },
    { key: 'top_k', label: 'Results Limit', type: 'number' },
  ],
  agent_execute: [
    { key: 'agent_id', label: 'Agent ID', type: 'text' },
    { key: 'goal', label: 'Goal', type: 'textarea' },
    { key: 'max_steps', label: 'Max Steps', type: 'number' },
    { key: 'timeout', label: 'Timeout (seconds)', type: 'number' },
  ],
  code_execute: [
    { key: 'language', label: 'Language', type: 'select', options: ['python', 'javascript'] },
    { key: 'code', label: 'Code', type: 'textarea' },
    { key: 'timeout', label: 'Timeout (ms)', type: 'number' },
  ],
  send_notification: [
    { key: 'channel', label: 'Channel', type: 'select', options: ['email', 'slack', 'discord', 'webhook'] },
    { key: 'to', label: 'Recipient', type: 'text' },
    { key: 'subject', label: 'Subject', type: 'text' },
    { key: 'message', label: 'Message', type: 'textarea' },
  ],
  transform_data: [
    { key: 'operation', label: 'Operation', type: 'select', options: ['map', 'filter', 'reduce', 'jq', 'jsonpath'] },
    { key: 'expression', label: 'Expression', type: 'textarea' },
  ],
  condition: [
    { key: 'expression', label: 'Condition Expression', type: 'text' },
    { key: 'true_label', label: 'True Branch Label', type: 'text' },
    { key: 'false_label', label: 'False Branch Label', type: 'text' },
  ],
  data_filter: [
    { key: 'field', label: 'Field Path', type: 'text' },
    { key: 'operator', label: 'Operator', type: 'select', options: ['equals', 'not_equals', 'contains', 'gt', 'lt', 'gte', 'lte', 'regex'] },
    { key: 'value', label: 'Value', type: 'text' },
  ],
  aggregator: [
    { key: 'mode', label: 'Aggregation Mode', type: 'select', options: ['merge', 'concat', 'first', 'last', 'all'] },
    { key: 'wait_for', label: 'Wait For (count)', type: 'number' },
  ],
  delay: [
    { key: 'duration', label: 'Duration (seconds)', type: 'number' },
    { key: 'until', label: 'Or Until (ISO date)', type: 'text' },
  ],
};

// ── Custom Node ──
const StepNodeComponent = React.memo(({ data, selected }: NodeProps<StepNodeData>) => {
  const color = COLORS[data.stepType] || '#6366f1';
  const icon = ICONS[data.stepType] || '⚙️';
  const statusColors: Record<string, string> = { idle: '#475569', running: '#f59e0b', completed: '#10b981', failed: '#ef4444' };
  const st = data.status || 'idle';

  return (
    <div style={{
      background: '#1e293b',
      border: `2px solid ${selected ? '#e2e8f0' : color}`,
      borderRadius: 10,
      minWidth: 200,
      maxWidth: 260,
      boxShadow: selected ? `0 0 16px ${color}50` : '0 2px 10px rgba(0,0,0,0.4)',
      transition: 'all 0.2s',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: color, width: 10, height: 10, border: '2px solid #0f172a' }} />

      {/* Header */}
      <div style={{
        background: `${color}18`,
        borderBottom: `1px solid ${color}30`,
        padding: '6px 12px',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', flex: 1 }}>
          {data.stepType.replace(/_/g, ' ')}
        </span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[st], flexShrink: 0 }} />
      </div>

      {/* Body */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{data.label}</div>
        {data.description && (
          <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.3 }}>{data.description}</div>
        )}
        {data.config?.url && (
          <div style={{ color: '#64748b', fontSize: 10, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220, fontFamily: 'monospace' }}>
            {data.config.method || 'GET'} {data.config.url}
          </div>
        )}
        {data.config?.model && (
          <div style={{ color: '#64748b', fontSize: 10, marginTop: 4, fontFamily: 'monospace' }}>{data.config.model}</div>
        )}
        {data.config?.expression && (
          <div style={{ color: '#64748b', fontSize: 10, marginTop: 4, fontFamily: 'monospace' }}>if ({data.config.expression})</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 10, height: 10, border: '2px solid #0f172a' }} />
      {data.stepType === 'condition' && (
        <>
          <Handle type="source" position={Position.Right} id="true" style={{ background: '#10b981', width: 8, height: 8, border: '2px solid #0f172a', top: '65%' }} />
          <Handle type="source" position={Position.Left} id="false" style={{ background: '#ef4444', width: 8, height: 8, border: '2px solid #0f172a', top: '65%' }} />
        </>
      )}
    </div>
  );
});
StepNodeComponent.displayName = 'StepNodeComponent';

const nodeTypes: NodeTypes = { stepNode: StepNodeComponent };

// ── Config Panel ──
interface ConfigPanelProps {
  node: Node<StepNodeData> | null;
  onUpdate: (id: string, data: Partial<StepNodeData>) => void;
  onClose: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ node, onUpdate, onClose }) => {
  if (!node) return null;
  const data = node.data as StepNodeData;
  const fields = CONFIG_FIELDS[data.stepType] || [];
  const color = COLORS[data.stepType] || '#6366f1';

  return (
    <div style={{
      width: 320,
      background: '#0f172a',
      borderLeft: '1px solid #1e293b',
      padding: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Settings size={16} color={color} />
        <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, flex: 1 }}>Configure Step</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={16} color="#64748b" />
        </button>
      </div>

      <div style={{ padding: 16, flex: 1 }}>
        {/* Step Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
            Step Name
          </label>
          <input
            value={data.label}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
            Description
          </label>
          <input
            value={data.description || ''}
            onChange={(e) => onUpdate(node.id, { description: e.target.value })}
            placeholder="Optional description..."
            style={{
              width: '100%',
              padding: '8px 10px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Config Fields */}
        {fields.map((field) => (
          <div key={field.key} style={{ marginBottom: 14 }}>
            <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={data.config?.[field.key] || ''}
                onChange={(e) => onUpdate(node.id, { config: { ...data.config, [field.key]: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select...</option>
                {(field.options || []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={data.config?.[field.key] || ''}
                onChange={(e) => onUpdate(node.id, { config: { ...data.config, [field.key]: e.target.value } })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#e2e8f0',
                  fontSize: 12,
                  fontFamily: field.key === 'code' ? 'monospace' : 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={data.config?.[field.key] ?? ''}
                onChange={(e) => onUpdate(node.id, {
                  config: { ...data.config, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }
                })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Panel Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          <span style={{ color: '#64748b', fontSize: 11 }}>
            {data.stepType.replace(/_/g, ' ')} • Node {node.id.split('_').pop()}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Main Canvas (inner — needs ReactFlowProvider) ──
function VisualWorkflowInner() {
  const navigate = useNavigate();
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const nodeCounter = useRef(0);

  // Push to undo history
  const pushHistory = useCallback(() => {
    setHistory(prev => {
      const newH = prev.slice(0, historyIdx + 1);
      newH.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
      return newH.slice(-30); // keep 30 max
    });
    setHistoryIdx(prev => Math.min(prev + 1, 29));
  }, [nodes, edges, historyIdx]);

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prev = history[historyIdx - 1];
    if (prev) {
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIdx(i => i - 1);
    }
  }, [history, historyIdx, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 1];
    if (next) {
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIdx(i => i + 1);
    }
  }, [history, historyIdx, setNodes, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds));
    pushHistory();
  }, [setEdges, pushHistory]);

  const addNode = useCallback((stepType: WorkflowStepType) => {
    const palette = STEP_PALETTE.find(s => s.type === stepType)!;
    nodeCounter.current++;
    const id = `step_${nodeCounter.current}_${Date.now()}`;
    // Calculate good position
    const viewport = reactFlowInstance.getViewport();
    const x = (-viewport.x + 400) / viewport.zoom + Math.random() * 100;
    const y = (-viewport.y + 200) / viewport.zoom + nodes.length * 40;
    
    const newNode: Node<StepNodeData> = {
      id,
      type: 'stepNode',
      position: { x, y },
      data: { label: palette.label, stepType, config: {}, description: palette.desc },
    };
    setNodes(nds => [...nds, newNode]);
    setSelectedNodeId(id);
    setShowConfig(true);
    pushHistory();
  }, [nodes.length, setNodes, pushHistory, reactFlowInstance]);

  const deleteSelected = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes(nds => nds.filter(n => n.id !== selectedNodeId));
    setEdges(eds => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
    setShowConfig(false);
    pushHistory();
  }, [selectedNodeId, setNodes, setEdges, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (!selectedNodeId) return;
    const original = nodes.find(n => n.id === selectedNodeId);
    if (!original) return;
    nodeCounter.current++;
    const id = `step_${nodeCounter.current}_${Date.now()}`;
    const newNode: Node<StepNodeData> = {
      ...original,
      id,
      position: { x: original.position.x + 40, y: original.position.y + 40 },
      data: { ...original.data as StepNodeData, label: `${(original.data as StepNodeData).label} (copy)` },
      selected: false,
    };
    setNodes(nds => [...nds, newNode]);
    pushHistory();
  }, [selectedNodeId, nodes, setNodes, pushHistory]);

  const updateNodeData = useCallback((id: string, updates: Partial<StepNodeData>) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== id) return n;
      return { ...n, data: { ...n.data, ...updates } as StepNodeData };
    }));
  }, [setNodes]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const toWorkflowJson = useCallback(() => {
    const steps = nodes.map((node, idx) => {
      const data = node.data as StepNodeData;
      const outEdges = edges.filter(e => e.source === node.id);
      return {
        id: node.id, name: data.label, type: data.stepType, order: idx,
        config: data.config || {}, description: data.description || '',
        next: outEdges.map(e => ({ target: e.target, sourceHandle: e.sourceHandle })),
        position: node.position,
      };
    });
    return {
      name: workflowName,
      description: workflowDesc,
      steps,
      graph_data: {
        nodes: nodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
        edges,
      },
    };
  }, [nodes, edges, workflowName, workflowDesc]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fastapiClient.post('/workflows', toWorkflowJson());
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  }, [toWorkflowJson]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    // Set all nodes to running
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'running' } as StepNodeData })));
    try {
      await fastapiClient.post('/workflows/draft/run', { inputs: {}, ...toWorkflowJson() });
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'completed' } as StepNodeData })));
    } catch (e) {
      console.error('Run failed:', e);
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'failed' } as StepNodeData })));
    } finally {
      setRunning(false);
    }
  }, [toWorkflowJson, setNodes]);

  const exportJson = useCallback(() => {
    const json = JSON.stringify(toWorkflowJson(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [toWorkflowJson, workflowName]);

  const importJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.graph_data?.nodes && data.graph_data?.edges) {
          setNodes(data.graph_data.nodes);
          setEdges(data.graph_data.edges);
          if (data.name) setWorkflowName(data.name);
          if (data.description) setWorkflowDesc(data.description);
          pushHistory();
        }
      } catch { console.error('Invalid workflow JSON'); }
    };
    input.click();
  }, [setNodes, setEdges, pushHistory]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0e1a' }}>
      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        background: '#0f172a', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <button onClick={() => navigate('/network/workflows')} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
          background: 'transparent', border: '1px solid #334155', borderRadius: 4,
          color: '#94a3b8', cursor: 'pointer', fontSize: 12,
        }}>
          <ArrowLeft size={14} /> Back
        </button>
        <Layout size={16} color="#6366f1" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <input value={workflowName} onChange={e => setWorkflowName(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 15, fontWeight: 600, outline: 'none', width: '100%' }} />
          <input value={workflowDesc} onChange={e => setWorkflowDesc(e.target.value)} placeholder="Add description..."
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 11, outline: 'none', width: '100%' }} />
        </div>

        <span style={{ color: '#475569', fontSize: 11 }}>{nodes.length} steps • {edges.length} connections</span>

        {/* Undo/Redo */}
        <button onClick={undo} title="Undo" style={{ background: 'none', border: '1px solid #334155', borderRadius: 4, padding: '4px 6px', cursor: 'pointer' }}>
          <Undo2 size={14} color="#94a3b8" />
        </button>
        <button onClick={redo} title="Redo" style={{ background: 'none', border: '1px solid #334155', borderRadius: 4, padding: '4px 6px', cursor: 'pointer' }}>
          <Redo2 size={14} color="#94a3b8" />
        </button>

        <div style={{ width: 1, height: 20, background: '#334155' }} />

        {/* Import/Export */}
        <button onClick={importJson} title="Import JSON" style={{ background: 'none', border: '1px solid #334155', borderRadius: 4, padding: '4px 6px', cursor: 'pointer' }}>
          <Upload size={14} color="#94a3b8" />
        </button>
        <button onClick={exportJson} title="Export JSON" style={{ background: 'none', border: '1px solid #334155', borderRadius: 4, padding: '4px 6px', cursor: 'pointer' }}>
          <Download size={14} color="#94a3b8" />
        </button>

        <div style={{ width: 1, height: 20, background: '#334155' }} />

        {/* Save / Run / Delete */}
        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
          background: '#3b82f6', border: 'none', borderRadius: 6, color: 'white',
          cursor: 'pointer', fontSize: 12, opacity: saving ? 0.6 : 1,
        }}>
          <Save size={13} /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleRun} disabled={running || nodes.length === 0} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
          background: '#10b981', border: 'none', borderRadius: 6, color: 'white',
          cursor: 'pointer', fontSize: 12, opacity: running || nodes.length === 0 ? 0.5 : 1,
        }}>
          <Play size={13} /> {running ? 'Running...' : 'Run'}
        </button>
        {selectedNodeId && (
          <>
            <button onClick={duplicateSelected} title="Duplicate" style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
              background: '#334155', border: 'none', borderRadius: 6, color: '#e2e8f0',
              cursor: 'pointer', fontSize: 12,
            }}>
              <Copy size={13} />
            </button>
            <button onClick={deleteSelected} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
              background: '#ef4444', border: 'none', borderRadius: 6, color: 'white',
              cursor: 'pointer', fontSize: 12,
            }}>
              <Trash2 size={13} /> Delete
            </button>
          </>
        )}
      </div>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Step Palette */}
        <div style={{
          width: 200, background: '#0f172a', borderRight: '1px solid #1e293b',
          padding: '8px', overflowY: 'auto', flexShrink: 0,
        }}>
          <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, padding: '0 4px' }}>
            Add Steps
          </div>
          {STEP_PALETTE.map(step => (
            <button
              key={step.type}
              onClick={() => addNode(step.type)}
              title={step.desc}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                padding: '6px 8px', marginBottom: 2, background: '#1e293b',
                border: '1px solid transparent', borderLeft: `3px solid ${step.color}`,
                borderRadius: 5, color: '#cbd5e1', cursor: 'pointer', fontSize: 12,
                transition: 'all 0.15s', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.borderColor = '#475569'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <span style={{ fontSize: 13, flexShrink: 0 }}>{step.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.label}</span>
            </button>
          ))}
          <div style={{ color: '#475569', fontSize: 10, marginTop: 12, padding: '8px 4px', borderTop: '1px solid #1e293b', lineHeight: 1.4 }}>
            Click to add. Drag nodes to position. Connect handles to wire steps.
          </div>
        </div>

        {/* Center: Canvas */}
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => { setSelectedNodeId(node.id); setShowConfig(true); }}
            onNodeDoubleClick={(_, node) => { setSelectedNodeId(node.id); setShowConfig(true); }}
            onPaneClick={() => { setSelectedNodeId(null); setShowConfig(false); }}
            fitView
            style={{ background: '#0a0e1a' }}
            defaultEdgeOptions={{ animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }}
            snapToGrid snapGrid={[15, 15]}
          >
            <Background color="#1e293b" gap={20} />
            <Controls style={{ background: '#1e293b', borderColor: '#334155', borderRadius: 8 }} />
            <MiniMap style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              nodeColor={(n: Node) => COLORS[(n.data as StepNodeData)?.stepType] || '#6366f1'} />
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div style={{
                  background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
                  padding: '24px 32px', color: '#94a3b8', fontSize: 14, textAlign: 'center',
                  marginTop: 100, maxWidth: 400,
                }}>
                  <Zap size={36} color="#6366f1" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 18, marginBottom: 8 }}>
                    Visual Workflow Builder
                  </div>
                  <div style={{ lineHeight: 1.5, marginBottom: 16 }}>
                    Build powerful automations by connecting steps visually.
                    Click steps from the left panel to get started.
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => addNode('webhook_trigger')} style={{
                      padding: '6px 14px', background: '#f97316', border: 'none',
                      borderRadius: 6, color: 'white', fontSize: 12, cursor: 'pointer',
                    }}>
                      🔔 Start with Trigger
                    </button>
                    <button onClick={() => addNode('llm_completion')} style={{
                      padding: '6px 14px', background: '#8b5cf6', border: 'none',
                      borderRadius: 6, color: 'white', fontSize: 12, cursor: 'pointer',
                    }}>
                      🧠 Start with LLM
                    </button>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right: Config Panel */}
        {showConfig && selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setShowConfig(false)}
          />
        )}
      </div>
    </div>
  );
}

// ── Page Wrapper ──
export default function VisualWorkflowPage() {
  return (
    <ReactFlowProvider>
      <VisualWorkflowInner />
    </ReactFlowProvider>
  );
}
