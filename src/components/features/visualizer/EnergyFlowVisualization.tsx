/**
 * Energy Flow Visualization Component
 * 
 * Visualizes energy flow between nodes in a system
 * Shows directional flows, energy levels, and transfer rates
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface EnergyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  type: 'source' | 'sink' | 'transformer' | 'storage';
  efficiency: number;
}

interface EnergyFlow {
  id: string;
  from: string;
  to: string;
  rate: number;
  maxRate: number;
  active: boolean;
}

interface EnergyFlowVisualizationProps {
  width?: number;
  height?: number;
  onNodeSelect?: (node: EnergyNode | null) => void;
  onFlowSelect?: (flow: EnergyFlow | null) => void;
}

const EnergyFlowVisualization: React.FC<EnergyFlowVisualizationProps> = ({
  width = 800,
  height = 500,
  onNodeSelect,
  onFlowSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  const [nodes, setNodes] = useState<EnergyNode[]>([]);
  const [flows, setFlows] = useState<EnergyFlow[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [totalFlow, setTotalFlow] = useState(0);

  const getNodeColor = (type: EnergyNode['type']) => {
    switch (type) {
      case 'source': return '#10b981';
      case 'sink': return '#ef4444';
      case 'transformer': return '#8b5cf6';
      case 'storage': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const initializeSystem = useCallback(() => {
    const initialNodes: EnergyNode[] = [
      { id: 'solar', label: 'Solar Panel', x: 100, y: 100, energy: 80, maxEnergy: 100, type: 'source', efficiency: 0.95 },
      { id: 'wind', label: 'Wind Turbine', x: 100, y: 250, energy: 60, maxEnergy: 100, type: 'source', efficiency: 0.88 },
      { id: 'grid', label: 'Grid Input', x: 100, y: 400, energy: 100, maxEnergy: 100, type: 'source', efficiency: 1.0 },
      { id: 'inverter', label: 'Inverter', x: 300, y: 175, energy: 50, maxEnergy: 200, type: 'transformer', efficiency: 0.97 },
      { id: 'battery', label: 'Battery Bank', x: 500, y: 100, energy: 150, maxEnergy: 500, type: 'storage', efficiency: 0.92 },
      { id: 'transformer', label: 'Transformer', x: 500, y: 300, energy: 40, maxEnergy: 150, type: 'transformer', efficiency: 0.98 },
      { id: 'home', label: 'Home Load', x: 700, y: 150, energy: 0, maxEnergy: 100, type: 'sink', efficiency: 1.0 },
      { id: 'ev', label: 'EV Charger', x: 700, y: 300, energy: 0, maxEnergy: 80, type: 'sink', efficiency: 0.95 },
      { id: 'hvac', label: 'HVAC System', x: 700, y: 400, energy: 0, maxEnergy: 120, type: 'sink', efficiency: 0.90 }
    ];

    const initialFlows: EnergyFlow[] = [
      { id: 'f1', from: 'solar', to: 'inverter', rate: 15, maxRate: 25, active: true },
      { id: 'f2', from: 'wind', to: 'inverter', rate: 10, maxRate: 20, active: true },
      { id: 'f3', from: 'inverter', to: 'battery', rate: 8, maxRate: 30, active: true },
      { id: 'f4', from: 'inverter', to: 'transformer', rate: 12, maxRate: 40, active: true },
      { id: 'f5', from: 'grid', to: 'transformer', rate: 5, maxRate: 50, active: true },
      { id: 'f6', from: 'battery', to: 'transformer', rate: 3, maxRate: 20, active: true },
      { id: 'f7', from: 'transformer', to: 'home', rate: 8, maxRate: 25, active: true },
      { id: 'f8', from: 'transformer', to: 'ev', rate: 6, maxRate: 20, active: true },
      { id: 'f9', from: 'transformer', to: 'hvac', rate: 6, maxRate: 30, active: true }
    ];

    setNodes(initialNodes);
    setFlows(initialFlows);
    timeRef.current = 0;
  }, []);

  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  const updateSystem = useCallback(() => {
    timeRef.current += 1;

    setNodes(prevNodes => {
      return prevNodes.map(node => {
        let newEnergy = node.energy;

        // Sources generate energy
        if (node.type === 'source') {
          const variation = Math.sin(timeRef.current * 0.05 + node.x * 0.01) * 10;
          newEnergy = Math.min(node.maxEnergy, Math.max(20, node.energy + variation * 0.1));
        }

        // Sinks consume energy
        if (node.type === 'sink') {
          const consumption = Math.random() * 2;
          newEnergy = Math.max(0, node.energy - consumption);
        }

        return { ...node, energy: newEnergy };
      });
    });

    setFlows(prevFlows => {
      return prevFlows.map(flow => {
        const variation = Math.sin(timeRef.current * 0.1 + parseInt(flow.id.slice(1)) * 0.5) * 0.3;
        const newRate = Math.max(0, Math.min(flow.maxRate, flow.rate + variation));
        return { ...flow, rate: newRate };
      });
    });
  }, []);

  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        updateSystem();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, updateSystem]);

  useEffect(() => {
    const total = nodes.reduce((sum, n) => sum + n.energy, 0);
    const flowTotal = flows.filter(f => f.active).reduce((sum, f) => sum + f.rate, 0);
    setTotalEnergy(total);
    setTotalFlow(flowTotal);
  }, [nodes, flows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw flows
    flows.forEach(flow => {
      const fromNode = nodes.find(n => n.id === flow.from);
      const toNode = nodes.find(n => n.id === flow.to);
      if (!fromNode || !toNode) return;

      const isSelected = selectedFlow === flow.id;
      const alpha = flow.active ? 0.6 + (flow.rate / flow.maxRate) * 0.4 : 0.2;

      // Draw flow line
      ctx.strokeStyle = isSelected ? '#fff' : `rgba(59, 130, 246, ${alpha})`;
      ctx.lineWidth = isSelected ? 4 : 2 + (flow.rate / flow.maxRate) * 3;
      ctx.beginPath();
      ctx.moveTo(fromNode.x + 30, fromNode.y);
      ctx.lineTo(toNode.x - 30, toNode.y);
      ctx.stroke();

      // Draw animated particles along flow
      if (flow.active && isRunning) {
        const particleCount = Math.ceil(flow.rate / 5);
        for (let i = 0; i < particleCount; i++) {
          const t = ((timeRef.current * 0.02 + i / particleCount) % 1);
          const px = fromNode.x + 30 + (toNode.x - 30 - fromNode.x - 30) * t;
          const py = fromNode.y + (toNode.y - fromNode.y) * t;

          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw arrow
      const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
      const arrowX = toNode.x - 35;
      const arrowY = toNode.y - (toNode.y - fromNode.y) / (toNode.x - fromNode.x) * 5;

      ctx.fillStyle = isSelected ? '#fff' : `rgba(59, 130, 246, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 10 * Math.cos(angle - 0.3), arrowY - 10 * Math.sin(angle - 0.3));
      ctx.lineTo(arrowX - 10 * Math.cos(angle + 0.3), arrowY - 10 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();

      // Draw flow rate label
      if (showLabels) {
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2 - 10;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${flow.rate.toFixed(1)} kW`, midX, midY);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const color = getNodeColor(node.type);
      const isSelected = selectedNode === node.id;
      const energyPercent = node.energy / node.maxEnergy;

      // Node background
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = isSelected ? '#fff' : color;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.beginPath();
      ctx.roundRect(node.x - 30, node.y - 25, 60, 50, 8);
      ctx.fill();
      ctx.stroke();

      // Energy bar background
      ctx.fillStyle = '#334155';
      ctx.fillRect(node.x - 25, node.y + 10, 50, 8);

      // Energy bar fill
      ctx.fillStyle = color;
      ctx.fillRect(node.x - 25, node.y + 10, 50 * energyPercent, 8);

      // Node icon
      ctx.fillStyle = color;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const icon = node.type === 'source' ? '⚡' : 
                   node.type === 'sink' ? '🏠' : 
                   node.type === 'transformer' ? '⚙️' : '🔋';
      ctx.fillText(icon, node.x, node.y - 5);

      // Node label
      if (showLabels) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '11px sans-serif';
        ctx.fillText(node.label, node.x, node.y - 35);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${node.energy.toFixed(0)}/${node.maxEnergy}`, node.x, node.y + 30);
      }
    });
  }, [nodes, flows, selectedNode, selectedFlow, showLabels, isRunning, width, height]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check node clicks
    const clickedNode = nodes.find(n => 
      x >= n.x - 30 && x <= n.x + 30 && y >= n.y - 25 && y <= n.y + 25
    );

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      setSelectedFlow(null);
      onNodeSelect?.(clickedNode);
      return;
    }

    // Check flow clicks (simplified - check near midpoint)
    for (const flow of flows) {
      const fromNode = nodes.find(n => n.id === flow.from);
      const toNode = nodes.find(n => n.id === flow.to);
      if (!fromNode || !toNode) continue;

      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dist = Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2));

      if (dist < 20) {
        setSelectedFlow(flow.id);
        setSelectedNode(null);
        onFlowSelect?.(flow);
        return;
      }
    }

    setSelectedNode(null);
    setSelectedFlow(null);
    onNodeSelect?.(null);
    onFlowSelect?.(null);
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    controls: {
      display: 'flex',
      gap: '8px'
    },
    button: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: 'none',
      background: '#334155',
      color: '#f1f5f9',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px'
    },
    buttonActive: {
      background: '#3b82f6'
    },
    canvas: {
      borderRadius: '8px',
      cursor: 'pointer'
    },
    statsBar: {
      display: 'flex',
      gap: '24px',
      padding: '12px 16px',
      background: '#0f172a',
      borderRadius: '8px'
    },
    stat: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2px'
    },
    statLabel: {
      fontSize: '11px',
      color: '#64748b',
      textTransform: 'uppercase' as const
    },
    statValue: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#f1f5f9'
    },
    legend: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap' as const
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#94a3b8'
    },
    legendDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%'
    },
    infoPanel: {
      padding: '12px 16px',
      background: '#0f172a',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#94a3b8'
    }
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  const selectedFlowData = flows.find(f => f.id === selectedFlow);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Zap size={20} color="#f59e0b" />
          Energy Flow System
        </div>
        <div style={styles.controls}>
          <button
            style={{ ...styles.button, ...(isRunning ? styles.buttonActive : {}) }}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button style={styles.button} onClick={initializeSystem}>
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            style={{ ...styles.button, ...(showLabels ? styles.buttonActive : {}) }}
            onClick={() => setShowLabels(!showLabels)}
          >
            {showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
            Labels
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={styles.canvas}
        onClick={handleCanvasClick}
      />

      {showStats && (
        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Total Energy</span>
            <span style={styles.statValue}>{totalEnergy.toFixed(0)} kWh</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Active Flows</span>
            <span style={styles.statValue}>{flows.filter(f => f.active).length}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Total Flow Rate</span>
            <span style={styles.statValue}>{totalFlow.toFixed(1)} kW</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Nodes</span>
            <span style={styles.statValue}>{nodes.length}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Time</span>
            <span style={styles.statValue}>{timeRef.current}</span>
          </div>
        </div>
      )}

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#10b981' }} />
          Source
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#ef4444' }} />
          Sink
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#8b5cf6' }} />
          Transformer
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#3b82f6' }} />
          Storage
        </div>
      </div>

      {selectedNodeData && (
        <div style={styles.infoPanel}>
          <strong>Selected Node:</strong> {selectedNodeData.label} |
          Type: {selectedNodeData.type} |
          Energy: {selectedNodeData.energy.toFixed(1)}/{selectedNodeData.maxEnergy} |
          Efficiency: {(selectedNodeData.efficiency * 100).toFixed(0)}%
        </div>
      )}

      {selectedFlowData && (
        <div style={styles.infoPanel}>
          <strong>Selected Flow:</strong> {selectedFlowData.from} → {selectedFlowData.to} |
          Rate: {selectedFlowData.rate.toFixed(1)} kW |
          Max: {selectedFlowData.maxRate} kW |
          Status: {selectedFlowData.active ? 'Active' : 'Inactive'}
        </div>
      )}
    </div>
  );
};

export default EnergyFlowVisualization;
