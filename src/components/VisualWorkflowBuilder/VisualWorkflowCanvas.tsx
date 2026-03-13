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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, Plus, Trash2, Undo2 } from 'lucide-react';
import { StepNode } from './StepNode';

// ── Node types matching workflow_service step types ──
export type WorkflowStepType =
  | 'http_request'
  | 'llm_completion'
  | 'memory_search'
  | 'agent_execute'
  | 'send_notification'
  | 'transform_data'
  | 'condition'
  | 'delay';

export interface StepNodeData {
  label: string;
  stepType: WorkflowStepType;
  config: Record<string, any>;
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

const nodeTypes: NodeTypes = {
  stepNode: StepNode,
};

interface VisualWorkflowCanvasProps {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onRun?: (workflowJson: any) => void;
}

export const VisualWorkflowCanvas: React.FC<VisualWorkflowCanvasProps> = ({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onRun,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const addNode = useCallback(
    (stepType: WorkflowStepType) => {
      const palette = STEP_PALETTE.find((s) => s.type === stepType);
      if (!palette) return;

      const id = `step_${Date.now()}`;
      const newNode: Node<StepNodeData> = {
        id,
        type: 'stepNode',
        position: { x: 250 + Math.random() * 200, y: 100 + nodes.length * 120 },
        data: {
          label: palette.label,
          stepType,
          config: {},
        },
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
      graph_data: { nodes: nodes.map((n) => ({ id: n.id, position: n.position, data: n.data })), edges },
    };
  }, [nodes, edges, workflowName]);

  const handleSave = useCallback(() => {
    if (onSave) onSave(nodes, edges);
    const json = toWorkflowJson();
    console.log('Workflow JSON:', json);
    // POST to workflow_service
    fetch('/api/v1/workflows', {
      method: workflowId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(json),
    }).catch(console.error);
  }, [nodes, edges, onSave, toWorkflowJson, workflowId]);

  const handleRun = useCallback(() => {
    const json = toWorkflowJson();
    if (onRun) onRun(json);
    fetch(`/api/v1/workflows/${workflowId || 'draft'}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ inputs: {} }),
    }).catch(console.error);
  }, [toWorkflowJson, onRun, workflowId]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      {/* ── Left Sidebar: Step Palette ── */}
      <div
        style={{
          width: 220,
          background: '#0f172a',
          borderRight: '1px solid #1e293b',
          padding: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>
          Add Steps
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
            onMouseEnter={(e) => (e.currentTarget.style.background = '#334155')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1e293b')}
          >
            <span>{step.icon}</span>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      {/* ── Main Canvas ── */}
      <div style={{ flex: 1, position: 'relative' }}>
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
          <Controls style={{ background: '#1e293b', borderColor: '#334155' }} />
          <MiniMap
            style={{ background: '#0f172a', border: '1px solid #334155' }}
            nodeColor={(n) => {
              const data = n.data as StepNodeData;
              const palette = STEP_PALETTE.find((s) => s.type === data?.stepType);
              return palette?.color || '#6366f1';
            }}
          />

          {/* ── Top Toolbar ── */}
          <Panel position="top-center">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '6px 12px',
              }}
            >
              <input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#e2e8f0',
                  fontSize: 14,
                  fontWeight: 600,
                  width: 200,
                  outline: 'none',
                }}
              />
              <div style={{ width: 1, height: 20, background: '#334155' }} />
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: 4,
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <Save size={14} /> Save
              </button>
              <button
                onClick={handleRun}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: 4,
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer',
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
                    padding: '4px 10px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default VisualWorkflowCanvas;
