import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import getChartTheme from '../../theme/getChartTheme';
import type { EvidenceGraph, GraphNode } from '../../types';

interface EvidenceGraphVizProps {
  graph?: EvidenceGraph | null;
  onSelect: (node: GraphNode) => void;
  riskView?: boolean;
}

const EvidenceGraphViz = ({ graph, onSelect, riskView }: EvidenceGraphVizProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !graph) return;
    
    // Ensure nodes and edges are arrays
    const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
    const edges = Array.isArray(graph.edges) ? graph.edges : [];
    
    // Don't render if there's no data
    if (nodes.length === 0 && edges.length === 0) return;
    
    const theme = getChartTheme();
    const chart = echarts.init(ref.current);

    const nodeColor = (type: string) => {
      switch (type) {
        case 'input':
          return theme.primary;
        case 'token':
          return theme.muted;
        case 'anchor':
          return theme.lineSecondary;
        case 'policy':
          return theme.danger;
        default:
          return theme.muted;
      }
    };

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (p: { data: { label?: string; id: string } }) => p.data.label || p.data.id,
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          data: nodes.map((n) => ({
            id: n.id,
            name: n.label,
            label: { show: false },
            symbolSize: n.type === 'input' ? 50 : 30,
            itemStyle: { color: nodeColor(n.type || 'token') },
            rawType: n.type,
            rawNode: n,
          })),
          edges: edges.map((e) => ({
            source: e.source,
            target: e.target,
            label: { show: false },
            lineStyle: { width: 1, color: theme.grid },
            rawEdge: e,
          })),
          force: { repulsion: 200, edgeLength: 80 },
        },
      ],
    });

    chart.on('click', (params: any) => {
      if (params?.data?.rawNode) {
        onSelect(params.data.rawNode);
      }
    });

    return () => chart.dispose();
  }, [graph, onSelect]);

  // Show message if no graph data
  if (!graph || (!graph.nodes?.length && !graph.edges?.length)) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        No evidence graph data available for this prediction.
      </div>
    );
  }

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export default EvidenceGraphViz;
