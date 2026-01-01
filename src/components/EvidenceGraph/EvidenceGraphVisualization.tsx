/**
 * Evidence Graph Visualization Component
 * 
 * Shows what influenced the answer, not how the system computed it.
 * Influence ≠ computation.
 * 
 * SECURITY: Does NOT expose sensitive data:
 * - No edge weights or scores
 * - No internal agent paths or orchestration
 * - No pruning logic or discarded candidates
 * - Only shows relevant context that informed the response
 * 
 * Rule: An Evidence Graph explains relevance, not reasoning.
 */

import React, { useEffect, useRef, useState } from 'react';
import styles from './EvidenceGraphVisualization.module.css';

export interface EvidenceGraphNode {
  id: string;
  type: 'query' | 'anchor' | 'memory' | 'message';
  label: string;
  xyz: [number, number, number];
  role?: 'user' | 'assistant' | 'system';
}

export interface EvidenceGraphEdge {
  source: string;
  target: string;
  type: 'evidence' | 'memory' | 'anchor';
  // Edges mean "influenced" or "informed", not "caused" or "weighted"
  // No weights, scores, or confidence values exposed
}

export interface EvidenceGraphData {
  message_id: string;
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
  node_count: number;
  edge_count: number;
}

interface EvidenceGraphVisualizationProps {
  graphData: EvidenceGraphData | null;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edge: EvidenceGraphEdge) => void;
  selectedNodeId?: string | null;
  compact?: boolean;
}

export const EvidenceGraphVisualization: React.FC<EvidenceGraphVisualizationProps> = ({
  graphData,
  onNodeClick,
  onEdgeClick,
  selectedNodeId,
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<EvidenceGraphEdge | null>(null);

  // Project 3D coordinates to 2D canvas
  const project3D = (xyz: [number, number, number], width: number, height: number): [number, number] => {
    // Simple orthographic projection with better scaling
    const scale = Math.min(width, height) * 0.35;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clamp coordinates to ensure nodes stay within visible area
    const x = Math.max(20, Math.min(width - 20, centerX + xyz[0] * scale));
    const y = Math.max(20, Math.min(height - 20, centerY - xyz[1] * scale));
    
    return [x, y];
  };

  // Get node color by type
  const getNodeColor = (node: EvidenceGraphNode): string => {
    if (node.type === 'query') {
      return node.role === 'user' ? '#3399ff' : '#66cc66';
    } else if (node.type === 'anchor') {
      return '#ffcc33';
    } else if (node.type === 'memory') {
      return '#cc66cc';
    }
    return '#999999';
  };

  // Draw graph with enhanced 3D effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.clientWidth * 2; // High DPI
    const height = canvas.height = canvas.clientHeight * 2;
    ctx.scale(2, 2); // Scale for high DPI

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Draw subtle grid for depth perception
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < displayWidth; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, displayHeight);
      ctx.stroke();
    }
    for (let i = 0; i < displayHeight; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(displayWidth, i);
      ctx.stroke();
    }

    // Draw edges with gradient glow
    graphData.edges.forEach(edge => {
      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
      const targetNode = graphData.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;

      const [x1, y1] = project3D(sourceNode.xyz, displayWidth, displayHeight);
      const [x2, y2] = project3D(targetNode.xyz, displayWidth, displayHeight);

      // Create gradient for edge
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      const sourceColor = getNodeColor(sourceNode);
      const targetColor = getNodeColor(targetNode);
      
      if (hoveredEdge === edge) {
        gradient.addColorStop(0, sourceColor);
        gradient.addColorStop(1, targetColor);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
      } else {
        gradient.addColorStop(0, `${sourceColor}66`);
        gradient.addColorStop(1, `${targetColor}66`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
      }
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw nodes with glossy 3D effect
    graphData.nodes.forEach(node => {
      const [x, y] = project3D(node.xyz, displayWidth, displayHeight);
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNode === node.id;
      const color = getNodeColor(node);

      // Calculate radius based on z-depth for parallax effect
      const zDepth = node.xyz[2] || 0;
      const baseRadius = isSelected ? 14 : isHovered ? 12 : 10;
      const radius = baseRadius + zDepth * 2;

      // Draw outer glow
      const glowGradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 2.5);
      glowGradient.addColorStop(0, `${color}40`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw main node with gradient for 3D effect
      const nodeGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
      nodeGradient.addColorStop(0, '#ffffff');
      nodeGradient.addColorStop(0.3, color);
      nodeGradient.addColorStop(1, `${color}88`);
      
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw glossy highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x - radius * 0.2, y - radius * 0.3, radius * 0.4, radius * 0.25, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw selection ring with glow
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw label with background (if not compact)
      if (!compact && (isHovered || isSelected)) {
        const label = node.label.substring(0, 25);
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
        const textWidth = ctx.measureText(label).width;
        
        // Label background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(x - textWidth / 2 - 6, y - radius - 22, textWidth + 12, 18, 4);
        ctx.fill();
        
        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - radius - 9);
      }
    });

    // Handle mouse interactions (use displayWidth/Height for hit detection)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Check if hovering over a node
      let foundNode = false;
      graphData.nodes.forEach(node => {
        const [x, y] = project3D(node.xyz, displayWidth, displayHeight);
        const zDepth = node.xyz[2] || 0;
        const radius = 10 + zDepth * 2;
        const distance = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
        if (distance < radius + 5) {
          setHoveredNode(node.id);
          foundNode = true;
        }
      });

      if (!foundNode) {
        setHoveredNode(null);
      }

      // Check if hovering over an edge
      let foundEdge = null;
      graphData.edges.forEach(edge => {
        const sourceNode = graphData.nodes.find(n => n.id === edge.source);
        const targetNode = graphData.nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const [x1, y1] = project3D(sourceNode.xyz, displayWidth, displayHeight);
        const [x2, y2] = project3D(targetNode.xyz, displayWidth, displayHeight);

        // Check if point is near line
        const dx = x2 - x1;
        const dy = y2 - y1;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return;
        
        const t = Math.max(0, Math.min(1, ((mx - x1) * dx + (my - y1) * dy) / (dx * dx + dy * dy)));
        const nearestX = x1 + t * dx;
        const nearestY = y1 + t * dy;
        const distance = Math.sqrt((mx - nearestX) ** 2 + (my - nearestY) ** 2);
        
        if (distance < 8) {
          foundEdge = edge;
        }
      });

      setHoveredEdge(foundEdge);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Check if clicking on a node
      graphData.nodes.forEach(node => {
        const [x, y] = project3D(node.xyz, displayWidth, displayHeight);
        const zDepth = node.xyz[2] || 0;
        const radius = 10 + zDepth * 2;
        const distance = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
        if (distance < radius + 5) {
          onNodeClick?.(node.id);
        }
      });

      // Check if clicking on an edge
      if (hoveredEdge) {
        onEdgeClick?.(hoveredEdge);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [graphData, selectedNodeId, hoveredNode, hoveredEdge, onNodeClick, onEdgeClick, compact]);

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No evidence graph data available</p>
        <p className={styles.emptyHint}>Evidence graph is built during message processing</p>
      </div>
    );
  }

  // Check if memories were used
  const hasMemories = graphData.nodes.some(n => n.type === 'memory');
  const hasAnchors = graphData.nodes.some(n => n.type === 'anchor');

  // In compact mode, only show the canvas (no header, legend, etc.)
  if (compact) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ 
            cursor: hoveredNode || hoveredEdge ? 'pointer' : 'default', 
            width: '100%', 
            height: '100%',
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.container}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Evidence Graph</h3>
        <div className={styles.stats}>
          <span className={styles.stat}>{graphData.node_count} items</span>
          <span className={styles.stat}>{graphData.edge_count} connections</span>
        </div>
      </div>

      {/* Why this matters tooltip */}
      <div className={styles.tooltip}>
        <span className={styles.tooltipIcon}>ℹ️</span>
        <span className={styles.tooltipText}>These items influenced the response</span>
      </div>

      {/* Memory usage badges */}
      <div className={styles.badges}>
        {hasMemories ? (
          <span className={styles.badgeActive}>🧠 Used long-term memory</span>
        ) : (
          <span className={styles.badgeInactive}>No prior memory used</span>
        )}
        {hasAnchors && (
          <span className={styles.badgeActive}>🔗 Context anchors active</span>
        )}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#3399ff' }} />
          <span>Your Query</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#66cc66' }} />
          <span>AI Response</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#ffcc33' }} />
          <span>Context Anchors</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#cc66cc' }} />
          <span>Long-term Memory</span>
        </div>
      </div>

      <div className={styles.canvasContainer}>
        <div className={styles.gridOverlay} />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ cursor: hoveredNode || hoveredEdge ? 'pointer' : 'default', position: 'relative', zIndex: 3 }}
        />
      </div>

      {/* Confidence disclaimer */}
      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          This graph shows relevant context, not full reasoning.
        </p>
      </div>
    </div>
  );
};

