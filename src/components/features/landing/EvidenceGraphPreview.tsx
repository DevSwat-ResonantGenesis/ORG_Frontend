import React, { useEffect, useRef } from 'react';
import './evidenceGraphPreview.css';

interface GraphNode {
  id: string;
  label: string;
  type: 'claim' | 'evidence' | 'missing' | 'contradiction' | 'risk' | 'policy';
  x?: number;
  y?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  type: 'supports' | 'contradicts' | 'missing' | 'violates';
}

interface EvidenceGraphPreviewProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  animated?: boolean;
}

const defaultNodes: GraphNode[] = [
  { id: '1', label: 'Model Output', type: 'claim', x: 50, y: 20 },
  { id: '2', label: 'Evidence Node', type: 'evidence', x: 20, y: 50 },
  { id: '3', label: 'Missing Evidence', type: 'missing', x: 80, y: 50 },
  { id: '4', label: 'Risk Node', type: 'risk', x: 50, y: 80 },
  { id: '5', label: 'Policy Violation', type: 'policy', x: 20, y: 80 },
];

const defaultEdges: GraphEdge[] = [
  { from: '1', to: '2', type: 'supports' },
  { from: '1', to: '3', type: 'missing' },
  { from: '1', to: '4', type: 'violates' },
  { from: '4', to: '5', type: 'violates' },
];

const nodeTypeColors = {
  claim: '#3B82F6',
  evidence: '#10B981',
  missing: '#6B7280',
  contradiction: '#EF4444',
  risk: '#F59E0B',
  policy: '#8B5CF6',
};

const edgeTypeColors = {
  supports: '#10B981',
  contradicts: '#EF4444',
  missing: '#6B7280',
  violates: '#F59E0B',
};

export const EvidenceGraphPreview: React.FC<EvidenceGraphPreviewProps> = ({
  nodes = defaultNodes,
  edges = defaultEdges,
  riskLevel = 'medium',
  animated = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (!animated) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (svgRef.current) {
      observer.observe(svgRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  const width = 300;
  const height = 200;
  const padding = 20;

  // Normalize coordinates to fit within SVG bounds
  const normalizedNodes = nodes.map((node) => ({
    ...node,
    x: ((node.x || 50) / 100) * (width - padding * 2) + padding,
    y: ((node.y || 50) / 100) * (height - padding * 2) + padding,
  }));

  return (
    <div className="evidence-graph-preview">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={`graph-svg ${isVisible ? 'visible' : ''}`}
      >
        {/* Edges */}
        {edges.map((edge, idx) => {
          const fromNode = normalizedNodes.find((n) => n.id === edge.from);
          const toNode = normalizedNodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const color = edgeTypeColors[edge.type];
          const strokeDasharray = edge.type === 'missing' ? '4,4' : '0';

          return (
            <line
              key={`edge-${idx}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={strokeDasharray}
              opacity={isVisible ? 0.6 : 0}
              className="graph-edge"
              style={{
                transition: `opacity ${0.3 + idx * 0.1}s ease`,
              }}
            />
          );
        })}

        {/* Nodes */}
        {normalizedNodes.map((node, idx) => {
          const color = nodeTypeColors[node.type];
          const radius = node.type === 'claim' ? 12 : 8;

          return (
            <g key={node.id} className="graph-node-group">
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
                opacity={isVisible ? 1 : 0}
                className={`graph-node graph-node-${node.type}`}
                style={{
                  transition: `opacity ${0.4 + idx * 0.1}s ease, transform 0.3s ease`,
                }}
              />
              {node.type === 'risk' && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius + 4}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  opacity={isVisible ? 0.3 : 0}
                  className="graph-node-pulse"
                  style={{
                    animation: isVisible ? 'pulse 2s ease-in-out infinite' : 'none',
                  }}
                />
              )}
              <text
                x={node.x}
                y={node.y + radius + 12}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-secondary, #374151)"
                opacity={isVisible ? 1 : 0}
                className="graph-node-label"
                style={{
                  transition: `opacity ${0.5 + idx * 0.1}s ease`,
                }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="graph-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: nodeTypeColors.claim }}></span>
          <span>Claim</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: nodeTypeColors.evidence }}></span>
          <span>Evidence</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: nodeTypeColors.missing }}></span>
          <span>Missing</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: nodeTypeColors.risk }}></span>
          <span>Risk</span>
        </div>
      </div>
    </div>
  );
};

