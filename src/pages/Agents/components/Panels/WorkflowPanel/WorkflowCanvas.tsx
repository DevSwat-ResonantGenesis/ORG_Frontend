import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Icons } from '../../shared/Icons';
import styles from './WorkflowCanvas.module.css';

// ============== WORKFLOW CANVAS ==============
// Fully functional drag-drop workflow builder

interface Position {
  x: number;
  y: number;
}

interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'http_request' | 'llm_completion' | 'memory_search' | 'agent_execute' | 'send_notification' | 'transform_data' | 'condition' | 'delay' | 'loop' | 'parallel' | 'webhook' | 'code_execute' | 'email' | 'database' | 'filter';
  label: string;
  position: Position;
  config: Record<string, unknown>;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

const GRID_SIZE = 20;

const snapToGrid = (val: number): number => Math.round(val / GRID_SIZE) * GRID_SIZE;

const NODE_TYPES = {
  start: { color: '#22c55e', icon: 'Play' },
  end: { color: '#ef4444', icon: 'Stop' },
  http_request: { color: '#14b8a6', icon: 'External' },
  llm_completion: { color: '#8b5cf6', icon: 'Brain' },
  memory_search: { color: '#06b6d4', icon: 'Search' },
  agent_execute: { color: '#0ea5e9', icon: 'Agents' },
  send_notification: { color: '#f97316', icon: 'Send' },
  transform_data: { color: '#ec4899', icon: 'Zap' },
  condition: { color: '#f59e0b', icon: 'Fork' },
  delay: { color: '#6366f1', icon: 'Clock' },
  loop: { color: '#a855f7', icon: 'Refresh' },
  parallel: { color: '#06b6d4', icon: 'Fork' },
  webhook: { color: '#10b981', icon: 'External' },
  code_execute: { color: '#f43f5e', icon: 'Code' },
  email: { color: '#f97316', icon: 'Send' },
  database: { color: '#8b5cf6', icon: 'Search' },
  filter: { color: '#eab308', icon: 'Fork' },
};

const WorkflowCanvasComponent: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  selectedNodeId,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });

  // Handle node drag start
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.position.x * zoom - pan.x,
      y: e.clientY - rect.top - node.position.y * zoom - pan.y,
    });
    onNodeSelect(nodeId);
  }, [nodes, zoom, pan, onNodeSelect]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x, y });

    if (draggingNode) {
      const rawX = (e.clientX - rect.left - dragOffset.x - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - dragOffset.y - pan.y) / zoom;
      const newX = snapToGrid(Math.max(0, rawX));
      const newY = snapToGrid(Math.max(0, rawY));

      const updatedNodes = nodes.map(node =>
        node.id === draggingNode
          ? { ...node, position: { x: newX, y: newY } }
          : node
      );
      onNodesChange(updatedNodes);
    }
  }, [draggingNode, dragOffset, nodes, zoom, pan, onNodesChange]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    if (connecting) {
      setConnecting(null);
    }
  }, [connecting]);

  // Handle connection start
  const handleConnectorMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnecting(nodeId);
  }, []);

  // Handle connection end
  const handleNodeConnectionDrop = useCallback((targetNodeId: string) => {
    if (connecting && connecting !== targetNodeId) {
      const edgeExists = edges.some(
        e => e.source === connecting && e.target === targetNodeId
      );
      if (!edgeExists) {
        const newEdge: WorkflowEdge = {
          id: `e-${Date.now()}`,
          source: connecting,
          target: targetNodeId,
        };
        onEdgesChange([...edges, newEdge]);
      }
    }
    setConnecting(null);
  }, [connecting, edges, onEdgesChange]);

  // Delete edge
  const handleEdgeDelete = useCallback((edgeId: string) => {
    onEdgesChange(edges.filter(e => e.id !== edgeId));
  }, [edges, onEdgesChange]);

  // Delete node
  const handleNodeDelete = useCallback((nodeId: string) => {
    if (nodeId === 'start' || nodeId === 'end') return; // Can't delete start/end
    onNodesChange(nodes.filter(n => n.id !== nodeId));
    onEdgesChange(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    onNodeSelect(null);
  }, [nodes, edges, onNodesChange, onEdgesChange, onNodeSelect]);

  // Render edge path
  const renderEdgePath = (edge: WorkflowEdge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;

    const sx = sourceNode.position.x + 80;
    const sy = sourceNode.position.y + 25;
    const tx = targetNode.position.x;
    const ty = targetNode.position.y + 25;

    const midX = (sx + tx) / 2;
    const path = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;

    return (
      <g key={edge.id} className={styles.edge}>
        <path d={path} className={styles.edgePath} />
        <path d={path} className={styles.edgeHitArea} onClick={() => handleEdgeDelete(edge.id)} />
        <circle cx={midX} cy={(sy + ty) / 2} r="8" className={styles.edgeDelete} onClick={() => handleEdgeDelete(edge.id)}>
          <title>Delete connection</title>
        </circle>
      </g>
    );
  };

  // Render connecting line
  const renderConnectingLine = () => {
    if (!connecting) return null;
    const sourceNode = nodes.find(n => n.id === connecting);
    if (!sourceNode) return null;

    const sx = sourceNode.position.x + 80;
    const sy = sourceNode.position.y + 25;

    return (
      <line
        x1={sx}
        y1={sy}
        x2={mousePos.x}
        y2={mousePos.y}
        className={styles.connectingLine}
      />
    );
  };

  // Get node icon
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
      case 'loop': return <Icons.Refresh />;
      case 'parallel': return <Icons.Fork />;
      case 'webhook': return <Icons.External />;
      case 'code_execute': return <Icons.Code />;
      case 'email': return <Icons.Send />;
      case 'database': return <Icons.Search />;
      case 'filter': return <Icons.Fork />;
      default: return <Icons.Zap />;
    }
  };

  // Handle canvas click to deselect nodes (only if clicking on empty space)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas, not on a node
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains(styles.nodesContainer)) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  return (
    <div 
      ref={canvasRef}
      className={styles.canvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Zoom controls */}
      <div className={styles.zoomControls}>
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
          <Icons.Plus />
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
          <Icons.ChevronDown />
        </button>
      </div>

      {/* SVG for edges */}
      <svg className={styles.edgesSvg} style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}>
        {edges.map(renderEdgePath)}
        {renderConnectingLine()}
      </svg>

      {/* Nodes */}
      <div className={styles.nodesContainer} style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}>
        {nodes.map(node => {
          const nodeType = NODE_TYPES[node.type as keyof typeof NODE_TYPES] || NODE_TYPES.agent_execute;
          return (
            <div
              key={node.id}
              className={`${styles.node} ${selectedNodeId === node.id ? styles.selected : ''}`}
              style={{
                left: node.position.x,
                top: node.position.y,
                borderColor: nodeType.color,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onMouseUp={() => connecting && handleNodeConnectionDrop(node.id)}
              onClick={(e) => { e.stopPropagation(); onNodeSelect(node.id); }}
            >
              {/* Input connector */}
              {node.type !== 'start' && (
                <div 
                  className={styles.connector} 
                  style={{ left: -6, background: nodeType.color }}
                />
              )}

              {/* Node content */}
              <div className={styles.nodeIcon} style={{ background: nodeType.color }}>
                {getNodeIcon(node.type)}
              </div>
              <div className={styles.nodeLabel}>{node.label}</div>

              {/* Output connector */}
              {node.type !== 'end' && (
                <div 
                  className={styles.connector}
                  style={{ right: -6, background: nodeType.color }}
                  onMouseDown={(e) => handleConnectorMouseDown(e, node.id)}
                />
              )}

              {/* Delete button */}
              {node.type !== 'start' && node.type !== 'end' && selectedNodeId === node.id && (
                <button 
                  className={styles.deleteBtn}
                  onClick={(e) => { e.stopPropagation(); handleNodeDelete(node.id); }}
                >
                  <Icons.XCircle />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {/* Minimap */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 160,
        height: 100,
        background: 'rgba(0,0,0,0.7)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        overflow: 'hidden',
        zIndex: 100,
      }}>
        <svg width="160" height="100" viewBox="0 0 1200 800">
          {nodes.map(node => {
            const nt = NODE_TYPES[node.type as keyof typeof NODE_TYPES] || NODE_TYPES.agent_execute;
            return (
              <rect
                key={node.id}
                x={node.position.x}
                y={node.position.y}
                width={80}
                height={30}
                rx={4}
                fill={nt.color}
                opacity={selectedNodeId === node.id ? 1 : 0.6}
              />
            );
          })}
          {edges.map(edge => {
            const s = nodes.find(n => n.id === edge.source);
            const t = nodes.find(n => n.id === edge.target);
            if (!s || !t) return null;
            return (
              <line
                key={edge.id}
                x1={s.position.x + 40}
                y1={s.position.y + 15}
                x2={t.position.x + 40}
                y2={t.position.y + 15}
                stroke="rgba(14,165,233,0.5)"
                strokeWidth={3}
              />
            );
          })}
          <rect
            x={-pan.x / zoom}
            y={-pan.y / zoom}
            width={(canvasRef.current?.clientWidth || 800) / zoom}
            height={(canvasRef.current?.clientHeight || 600) / zoom}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={4}
            strokeDasharray="8 4"
          />
        </svg>
      </div>
    </div>
  );
};

export const WorkflowCanvas = memo(WorkflowCanvasComponent);
export default WorkflowCanvas;
