/**
 * State Physics Visualization Component
 * 
 * Interactive visualization for state physics simulation
 * Shows particle systems, energy flows, and state transitions
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Settings,
  Activity,
  Zap,
  Atom,
  TrendingUp,
  Eye,
  Layers,
  Grid,
  Circle
} from 'lucide-react';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  state: 'stable' | 'excited' | 'transitioning' | 'decaying';
  connections: string[];
}

interface SimulationState {
  particles: Particle[];
  totalEnergy: number;
  entropy: number;
  time: number;
  isRunning: boolean;
}

interface StatePhysicsVisualizationProps {
  width?: number;
  height?: number;
  particleCount?: number;
  showGrid?: boolean;
  showConnections?: boolean;
  onStateChange?: (state: SimulationState) => void;
}

const StatePhysicsVisualization: React.FC<StatePhysicsVisualizationProps> = ({
  width = 800,
  height = 600,
  particleCount = 20,
  showGrid: initialShowGrid = true,
  showConnections: initialShowConnections = true,
  onStateChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [simulation, setSimulation] = useState<SimulationState>({
    particles: [],
    totalEnergy: 0,
    entropy: 0,
    time: 0,
    isRunning: false
  });
  
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [showConnections, setShowConnections] = useState(initialShowConnections);
  const [zoom, setZoom] = useState(1);
  const [selectedParticle, setSelectedParticle] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const getStateColor = (state: Particle['state']) => {
    switch (state) {
      case 'stable': return '#10b981';
      case 'excited': return '#f59e0b';
      case 'transitioning': return '#3b82f6';
      case 'decaying': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const initializeParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const particle: Particle = {
        id: `p-${i}`,
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        energy: Math.random() * 100,
        state: Math.random() > 0.7 ? 'excited' : 'stable',
        connections: []
      };
      particles.push(particle);
    }

    // Create connections between nearby particles
    particles.forEach((p, i) => {
      particles.forEach((other, j) => {
        if (i !== j) {
          const dist = Math.sqrt(Math.pow(p.x - other.x, 2) + Math.pow(p.y - other.y, 2));
          if (dist < 150 && Math.random() > 0.5) {
            p.connections.push(other.id);
          }
        }
      });
    });

    const totalEnergy = particles.reduce((sum, p) => sum + p.energy, 0);
    
    setSimulation({
      particles,
      totalEnergy,
      entropy: Math.random() * 50 + 25,
      time: 0,
      isRunning: false
    });
  }, [particleCount, width, height]);

  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  const updateSimulation = useCallback(() => {
    setSimulation(prev => {
      const newParticles = prev.particles.map(p => {
        // Update position
        let newX = p.x + p.vx;
        let newY = p.y + p.vy;
        let newVx = p.vx;
        let newVy = p.vy;

        // Bounce off walls
        if (newX < 20 || newX > width - 20) {
          newVx = -newVx * 0.9;
          newX = Math.max(20, Math.min(width - 20, newX));
        }
        if (newY < 20 || newY > height - 20) {
          newVy = -newVy * 0.9;
          newY = Math.max(20, Math.min(height - 20, newY));
        }

        // Energy decay
        let newEnergy = p.energy * 0.999;
        
        // State transitions
        let newState = p.state;
        if (p.state === 'excited' && Math.random() > 0.99) {
          newState = 'transitioning';
        } else if (p.state === 'transitioning' && Math.random() > 0.95) {
          newState = Math.random() > 0.5 ? 'stable' : 'decaying';
        } else if (p.state === 'decaying' && Math.random() > 0.98) {
          newState = 'stable';
          newEnergy = Math.random() * 50;
        } else if (p.state === 'stable' && Math.random() > 0.995) {
          newState = 'excited';
          newEnergy = Math.min(100, newEnergy + 30);
        }

        return {
          ...p,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          energy: newEnergy,
          state: newState
        };
      });

      const totalEnergy = newParticles.reduce((sum, p) => sum + p.energy, 0);
      const newEntropy = prev.entropy + (Math.random() - 0.5) * 0.5;

      const newState = {
        ...prev,
        particles: newParticles,
        totalEnergy,
        entropy: Math.max(0, Math.min(100, newEntropy)),
        time: prev.time + 1
      };

      if (onStateChange) {
        onStateChange(newState);
      }

      return newState;
    });
  }, [width, height, onStateChange]);

  useEffect(() => {
    if (simulation.isRunning) {
      const animate = () => {
        updateSimulation();
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
  }, [simulation.isRunning, updateSimulation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Apply zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width / zoom; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height / zoom);
        ctx.stroke();
      }
      for (let y = 0; y < height / zoom; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width / zoom, y);
        ctx.stroke();
      }
    }

    // Draw connections
    if (showConnections) {
      simulation.particles.forEach(p => {
        p.connections.forEach(connId => {
          const other = simulation.particles.find(op => op.id === connId);
          if (other) {
            const dist = Math.sqrt(Math.pow(p.x - other.x, 2) + Math.pow(p.y - other.y, 2));
            const alpha = Math.max(0, 1 - dist / 200);
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });
    }

    // Draw particles
    simulation.particles.forEach(p => {
      const color = getStateColor(p.state);
      const radius = 8 + (p.energy / 100) * 8;
      
      // Glow effect
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, `${color}40`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Selection ring
      if (selectedParticle === p.id) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [simulation, showGrid, showConnections, zoom, selectedParticle, width, height]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const clicked = simulation.particles.find(p => {
      const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
      return dist < 20;
    });

    setSelectedParticle(clicked?.id || null);
  };

  const toggleSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: false }));
    initializeParticles();
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
      fontSize: '13px',
      transition: 'background 0.2s'
    },
    buttonActive: {
      background: '#3b82f6'
    },
    canvas: {
      borderRadius: '8px',
      cursor: 'crosshair'
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
    particleInfo: {
      padding: '12px 16px',
      background: '#0f172a',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#94a3b8'
    },
    settingsPanel: {
      padding: '16px',
      background: '#0f172a',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px'
    },
    settingRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    settingLabel: {
      fontSize: '13px',
      color: '#94a3b8'
    },
    toggle: {
      width: '40px',
      height: '22px',
      borderRadius: '11px',
      background: '#334155',
      cursor: 'pointer',
      position: 'relative' as const,
      transition: 'background 0.2s'
    },
    toggleActive: {
      background: '#3b82f6'
    },
    toggleKnob: {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute' as const,
      top: '2px',
      left: '2px',
      transition: 'left 0.2s'
    },
    toggleKnobActive: {
      left: '20px'
    }
  };

  const selectedParticleData = simulation.particles.find(p => p.id === selectedParticle);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Atom size={20} color="#3b82f6" />
          State Physics Simulation
        </div>
        <div style={styles.controls}>
          <button
            style={{ ...styles.button, ...(simulation.isRunning ? styles.buttonActive : {}) }}
            onClick={toggleSimulation}
          >
            {simulation.isRunning ? <Pause size={16} /> : <Play size={16} />}
            {simulation.isRunning ? 'Pause' : 'Play'}
          </button>
          <button style={styles.button} onClick={resetSimulation}>
            <RotateCcw size={16} />
            Reset
          </button>
          <button style={styles.button} onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
            <ZoomIn size={16} />
          </button>
          <button style={styles.button} onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
            <ZoomOut size={16} />
          </button>
          <button
            style={{ ...styles.button, ...(showSettings ? styles.buttonActive : {}) }}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div style={styles.settingsPanel}>
          <div style={styles.settingRow}>
            <span style={styles.settingLabel}>Show Grid</span>
            <div
              style={{ ...styles.toggle, ...(showGrid ? styles.toggleActive : {}) }}
              onClick={() => setShowGrid(!showGrid)}
            >
              <div style={{ ...styles.toggleKnob, ...(showGrid ? styles.toggleKnobActive : {}) }} />
            </div>
          </div>
          <div style={styles.settingRow}>
            <span style={styles.settingLabel}>Show Connections</span>
            <div
              style={{ ...styles.toggle, ...(showConnections ? styles.toggleActive : {}) }}
              onClick={() => setShowConnections(!showConnections)}
            >
              <div style={{ ...styles.toggleKnob, ...(showConnections ? styles.toggleKnobActive : {}) }} />
            </div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={styles.canvas}
        onClick={handleCanvasClick}
      />

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Time</span>
          <span style={styles.statValue}>{simulation.time}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Particles</span>
          <span style={styles.statValue}>{simulation.particles.length}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Total Energy</span>
          <span style={styles.statValue}>{simulation.totalEnergy.toFixed(1)}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Entropy</span>
          <span style={styles.statValue}>{simulation.entropy.toFixed(1)}%</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Zoom</span>
          <span style={styles.statValue}>{(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#10b981' }} />
          Stable
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#f59e0b' }} />
          Excited
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#3b82f6' }} />
          Transitioning
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#ef4444' }} />
          Decaying
        </div>
      </div>

      {selectedParticleData && (
        <div style={styles.particleInfo}>
          <strong>Selected Particle:</strong> {selectedParticleData.id} |
          State: {selectedParticleData.state} |
          Energy: {selectedParticleData.energy.toFixed(1)} |
          Velocity: ({selectedParticleData.vx.toFixed(2)}, {selectedParticleData.vy.toFixed(2)}) |
          Connections: {selectedParticleData.connections.length}
        </div>
      )}
    </div>
  );
};

export default StatePhysicsVisualization;
