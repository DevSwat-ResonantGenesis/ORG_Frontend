import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const EvidenceGraphPreview = ({ data }: { data?: { nodes?: any[]; edges?: any[] } | null }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !data) return;
    
    // Ensure nodes and edges are arrays
    const nodes = Array.isArray(data.nodes) ? data.nodes : [];
    const edges = Array.isArray(data.edges) ? data.edges : [];
    
    // Don't render if there's no data
    if (nodes.length === 0 && edges.length === 0) return;
    
    cytoscape({
      container: ref.current,
      elements: [
        ...nodes.map((node) => ({ data: node })),
        ...edges.map((edge) => ({ data: { source: edge.source, target: edge.target } })),
      ],
      layout: { name: 'circle' },
      style: [
        { selector: 'node', style: { label: 'data(label)', 'background-color': '#10b981' } },
        { selector: 'edge', style: { width: 2, 'line-color': '#6b7280' } },
      ],
    });
  }, [data]);

  // Show message if no graph data
  if (!data || (!data.nodes?.length && !data.edges?.length)) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No evidence graph data available for this prediction.
      </div>
    );
  }

  return <div ref={ref} style={{ width: '100%', height: 400 }} />;
};

export default EvidenceGraphPreview;
