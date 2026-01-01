import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { fetchPredictionById } from '../../api/predictions';
import { logger } from '../../utils/logger';
import { fetchEvidenceGraph } from '../../api/evidence';
import { Button, Card, Text } from '../../components/ui';
import { exportToJSON } from '../../utils/export';
import EvidenceSidebar from './EvidenceSidebar';
import EvidenceGraphViz from './EvidenceGraphViz';
import type { Prediction, EvidenceGraph, GraphNode } from '../../types';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

const EvidenceGraphPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [graph, setGraph] = useState<EvidenceGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [riskView, setRiskView] = useState(false);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchPredictionById(id as string);
        const g = await fetchEvidenceGraph(id as string);
        setPrediction(p);
        setGraph({
          nodes: g.nodes.map(n => ({
            id: n.id,
            label: n.label,
            type: n.type,
            data: {}
          })),
          edges: g.edges.map((e, index) => ({
            id: `edge-${index}`,
            source: e.source,
            target: e.target,
            label: e.relation,
            data: {}
          }))
        });
      } catch (err: any) {
        logger.error('Evidence graph load error', err, { component: 'EvidenceGraphPage', predictionId: id });
        setError(err?.message || 'Failed to load evidence graph');
      } finally {
      setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownloadGraph = () => {
    if (graph) {
      exportToJSON(graph, `evidence-graph-${id}`);
    }
  };

  const handleDownloadImage = async () => {
    if (!graphContainerRef.current) {
      alert('Graph container not found');
      return;
    }

    try {
      const button = document.querySelector('[data-export-png]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Exporting...';
      }

      const canvas = await html2canvas(graphContainerRef.current, {
        backgroundColor: 'var(--color-bg-root)',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate image');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `evidence-graph-${id}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        if (button) {
          button.disabled = false;
          button.textContent = 'Download Image (PNG)';
        }
      }, 'image/png');
    } catch (error) {
      logger.error('PNG export error', error);
      alert('Failed to export image. Please try again.');
      const button = document.querySelector('[data-export-png]') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Download Image (PNG)';
      }
    }
  };

  if (loading) {
    return <LoadingState message="Loading Evidence Graph..." fullPage />;
  }

  if (error || !graph) {
    return (
      <ErrorState
        title="Failed to load evidence graph"
        message={error || 'Unable to load evidence graph for this prediction.'}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
        icon="📊"
      />
    );
  }

  const headerActions = (
    <>
      <Button 
        variant={riskView ? 'primary' : 'secondary'} 
        size="md" 
        onClick={() => setRiskView(!riskView)}
      >
            Toggle Risk View
          </Button>
      <Button variant="secondary" size="md" onClick={handleDownloadGraph}>
        Download JSON
      </Button>
          <Button variant="secondary" size="md" onClick={handleDownloadImage} data-export-png>
        Download PNG
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate(`/predictions/${id}`)}>
            Back to Prediction
          </Button>
    </>
  );

  return (
    <ModernPageLayout
      title="Evidence Graph Visualization"
      subtitle="Interactive visualization of prediction evidence chains and decision paths. Explore transparent reasoning validation with clear, verifiable evidence graphs."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      maxWidth="full"
    >
      <div style={{ display: 'flex', gap: 'var(--space-6)', minHeight: '600px' }}>
        <Card variant="elevated" padding="none" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div ref={graphContainerRef} style={{ width: '100%', height: '100%', minHeight: '600px' }}>
            <EvidenceGraphViz graph={graph} onSelect={setSelected} riskView={riskView} />
          </div>
            </Card>
            <EvidenceSidebar prediction={prediction} selected={selected} />
            </div>
    </ModernPageLayout>
  );
};

export default EvidenceGraphPage;
