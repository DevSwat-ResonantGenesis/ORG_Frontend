import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPredictionById } from '../../api/predictions';
import { fetchEvidenceGraph } from '../../api/evidence';
import { Button, Card, Text } from '../../components/ui';
import { FlowDiagram } from '../../components/diagrams/FlowDiagram';
import EvidenceGraphPreview from './EvidenceGraphPreview';
import { logger } from '../../utils/logger';
import type { Prediction, EvidenceGraph } from '../../types';
import styles from './PredictionDetailPage.module.css';

const PredictionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [graph, setGraph] = useState<EvidenceGraph | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [p, g] = await Promise.all([fetchPredictionById(id), fetchEvidenceGraph(id)]);
        setPrediction(p);
        // Convert API response to EvidenceGraph type
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
      } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : 'Prediction not found or you do not have access.';
        logger.error('Prediction detail load error', err, { component: 'PredictionDetailPage', predictionId: id });
        setError(errorMessage || 'Prediction not found or you do not have access.');
      }
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div className={styles.predictionDetailPage}>
        <div className={styles.container}>
          <div className={styles.errorState} style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ color: '#ef4444', marginBottom: '24px', fontSize: '16px' }}>{error}</div>
            <Button onClick={() => navigate('/predictions')}>Back to Predictions</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className={styles.predictionDetailPage}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.predictionDetailPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Prediction Detail</h1>
          <p className={styles.subtitle}>View prediction details, evidence graph, and compliance status</p>
          <div className={styles.headerActions}>
            <Button variant="secondary" size="md" onClick={() => navigate('/predictions')}>
              Back to List
            </Button>
          </div>
        </div>
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Prediction Summary */}
            <section className={styles.contentSection}>
            <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-lg)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Prediction Summary</Text>
        </Card.Header>
        <Card.Body>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Input Text</div>
            <div style={{ fontSize: '12px', color: 'var(--text-500)', marginBottom: '8px' }}>
              Input data
            </div>
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '0', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', border: '1px solid var(--border)' }}>
              {prediction.input_text || prediction.input_excerpt || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Model Output Metrics</div>
            <div style={{ fontSize: '12px', color: 'var(--text-500)', marginBottom: '8px' }}>
              Validity and risk scores
            </div>
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '0', fontSize: '14px', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Validity:</strong> {(prediction.validity || 0).toFixed(3)} 
                <span style={{ fontSize: '12px', color: 'var(--text-500)', marginLeft: '8px' }}>
                  (0-1 scale)
                </span>
              </div>
              <div>
                <strong>Risk Score:</strong> {(prediction.entropy || 0).toFixed(3)}
                <span style={{ fontSize: '12px', color: 'var(--text-500)', marginLeft: '8px' }}>
                  (0-1 scale)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>Risk Score</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              Overall risk assessment (0-1 scale)
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>{(prediction.entropy || 0).toFixed(3)}</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>Policy Violations</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              Number of policies triggered
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              {Array.isArray(prediction.policies_triggered) ? prediction.policies_triggered.length : 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>Timestamp</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              When this prediction was processed
            </div>
            <div style={{ fontSize: '14px' }}>
              {new Date(prediction.created_at || prediction.timestamp || Date.now()).toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>Model Version</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              ML model version used
            </div>
            <div style={{ fontSize: '14px' }}>v1.2.3</div>
          </div>
            </div>
            </Card.Body>
            </Card>
          </section>

          {/* Evidence Graph Flow */}
          <section className={styles.contentSection}>
            <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-lg)' }}>
              <Card.Header>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Evidence Graph Processing Flow</Text>
          <Text variant="body-sm" color="secondary">
            The evidence graph engine processes each prediction through multiple stages: input parsing, context extraction, 
            evidence node generation, relationship mapping, and risk propagation. This creates a complete traceable record 
            of how the prediction was derived and what evidence supports it.
          </Text>
        </Card.Header>
        <Card.Body>
          <FlowDiagram type="evidence" animated={true} />
              </Card.Body>
            </Card>
          </section>

          {/* Evidence Graph Preview */}
          <section className={styles.contentSection}>
            <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-lg)' }}>
        <Card.Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Evidence Graph</Text>
              <Text variant="body-sm" color="secondary">
                Interactive visualization showing how this prediction was derived. Nodes represent evidence, context points, and decisions. 
                Edges show relationships and dependencies. Color coding indicates risk levels and evidence quality.
              </Text>
            </div>
            {id && (
              <Button size="md" onClick={() => navigate(`/evidence/${id}`)}>
                Open Full Evidence Graph
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <EvidenceGraphPreview data={graph} />
        </Card.Body>
      </Card>

      {/* Policy Flow */}
      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Policy Evaluation Flow</Text>
          <Text variant="body-sm" color="secondary">
            Policies are evaluated against each prediction to ensure compliance with regulatory requirements and internal standards. 
            The policy engine checks risk thresholds, content restrictions, data usage rules, and compliance requirements. 
            Violations are flagged and logged for review.
          </Text>
        </Card.Header>
        <Card.Body>
          <FlowDiagram type="policy" animated={true} />
        </Card.Body>
      </Card>

      {/* Metadata */}
      <Card variant="elevated" padding="md">
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Technical Metadata</Text>
          <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-3)' }}>
            System-level metadata for this prediction, including organization context, execution details, and feature fingerprints. 
            This information is used for audit trails, debugging, and system monitoring.
          </Text>
        </Card.Header>
        <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2)' }}>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Organization ID</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                Organization that owns this prediction
              </Text>
              <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-family-mono)' }}>{(prediction as any).org_id || 'N/A'}</Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>User ID</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                User who submitted this prediction
              </Text>
              <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-family-mono)' }}>N/A</Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Execution Time</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                Time taken to process this prediction
              </Text>
              <Text variant="body" color="primary">N/A</Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Feature ID</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                Verification ID of input features
              </Text>
              <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>N/A</Text>
            </div>
          </div>
            </Card.Body>
            </Card>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PredictionDetailPage;
