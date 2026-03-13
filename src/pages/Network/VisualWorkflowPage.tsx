import React, { useCallback, useMemo, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, Trash2, ArrowLeft, Layout } from 'lucide-react';
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
  status?: string;
}

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

// ── Custom Step Node ──
const StepNodeComponent = React.memo(({ data, selected }: NodeProps<StepNodeData>) => {
  const color = STEP_COLORS[data.stepType] || '#6366f1';
  const icon = STEP_ICONS[data.stepType] || '⚙️';

  return (
    <div
      style={{
        background: '#1e293b',
        border: `2px solid ${selected ? '#e2e8f0' : color}`,
        borderRadius: 10,
        minWidth: 180,
        boxShadow: selected ? `0 0 12px ${color}40` : '0 2px 8px rgba(0,0,0,0.3)',
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

// ── Main Page Component ──
export default function VisualWorkflowPage() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [saving, setSaving] = useState(false);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge({ ...connection, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)
      );
    },
    [setEdges]
  );

  const addNode = useCallback(
    (stepType: WorkflowStepType) => {
      const palette = STEP_PALETTE.find((s) => s.type === stepType)!;
      const id = `step_${Date.now()}`;
      const newNode: Node<StepNodeData> = {
        id,
        type: 'stepNode',
        position: { x: 250 + Math.random() * 200, y: 80 + nodes.length * 120 },
        data: { label: palette.label, stepType, config: {} },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes.length, setNodes]
  );

  const deleteSelected = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  const toWorkflowJson = useCallback(() => {
    const steps = nodes.map((node, idx) => {
      const data = node.data as StepNodeData;
      const outEdges = edges.filter((e) => e.source === node.id);
      return {
        id: node.id,
        name: data.label,
        type: data.stepType,
        order: idx,
        config: data.config || {},
        next: outEdges.map((e) => e.target),
        position: node.position,
      };
    });
    return {
      name: workflowName,
      steps,
      graph_data: {
        nodes: nodes.map((n) => ({ id: n.id, position: n.position, data: n.data })),
        edges,
      },
    };
  }, [nodes, edges, workflowName]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const json = toWorkflowJson();
      await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(json),
      });
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  }, [toWorkflowJson]);

  const handleRun = useCallback(async () => {
    const json = toWorkflowJson();
    try {
      await fetch('/api/v1/workflows/draft/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ inputs: {}, ...json }),
      });
    } catch (e) {
      console.error('Run failed:', e);
    }
  }, [toWorkflowJson]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0e1a' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <button
          onClick={() => navigate('/network/workflows')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            background: 'transparent',
            border: '1px solid #334155',
            borderRadius: 4,
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <Layout size={18} color="#6366f1" />
        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            fontSize: 16,
            fontWeight: 600,
            width: 300,
            outline: 'none',
          }}
        />
        <div style={{ flex: 1 }} />
        <span style={{ color: '#64748b', fontSize: 12 }}>{nodes.length} steps</span>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 14px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: 6,
            color: 'white',
            cursor: 'pointer',
            fontSize: 13,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleRun}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 14px',
            background: '#10b981',
            border: 'none',
            borderRadius: 6,
            color: 'white',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          <Play size={14} /> Run
        </button>
        {selectedNode && (
          <button
            onClick={deleteSelected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 14px',
              background: '#ef4444',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left sidebar: step palette */}
        <div
          style={{
            width: 220,
            background: '#0f172a',
            borderRight: '1px solid #1e293b',
            padding: 12,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              color: '#94a3b8',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: 12,
              letterSpacing: '0.5px',
            }}
          >
            Drag or Click to Add
          </div>
          {STEP_PALETTE.map((step) => (
            <button
              key={step.type}
              onClick={() => addNode(step.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 10px',
                marginBottom: 4,
                background: '#1e293b',
                border: '1px solid #334155',
                borderLeft: `3px solid ${step.color}`,
                borderRadius: 6,
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: 13,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#334155')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#1e293b')}
            >
              <span>{step.icon}</span>
              <span>{step.label}</span>
            </button>
          ))}

          <div
            style={{
              color: '#64748b',
              fontSize: 11,
              marginTop: 16,
              padding: '8px 4px',
              borderTop: '1px solid #1e293b',
              lineHeight: 1.5,
            }}
          >
            Click a step to add it to the canvas. Connect steps by dragging from one handle to another.
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            onPaneClick={() => setSelectedNode(null)}
            fitView
            style={{ background: '#0a0e1a' }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#6366f1', strokeWidth: 2 },
            }}
          >
            <Background color="#1e293b" gap={20} />
            <Controls
              style={{
                background: '#1e293b',
                borderColor: '#334155',
                borderRadius: 8,
              }}
            />
            <MiniMap
              style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              nodeColor={(n: Node) => {
                const data = n.data as StepNodeData;
                return STEP_COLORS[data?.stepType] || '#6366f1';
              }}
            />
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '16px 24px',
                    color: '#94a3b8',
                    fontSize: 14,
                    textAlign: 'center',
                    marginTop: 120,
                  }}
                >
                  <Layout size={32} color="#6366f1" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                    Visual Workflow Builder
                  </div>
                  <div>Click steps from the left panel to build your workflow</div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
