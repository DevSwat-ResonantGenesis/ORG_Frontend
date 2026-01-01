import React from 'react';
import './flowDiagram.css';

interface FlowDiagramProps {
  type: 'prediction' | 'evidence' | 'compliance' | 'policy';
  animated?: boolean;
  interactive?: boolean;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  type,
  animated = true,
  interactive = false,
}) => {
  const renderPredictionFlow = () => (
    <div className="flow-diagram prediction-flow">
      <div className="flow-step">
        <div className="flow-node input-node">
          <div className="node-icon"></div>
          <div className="node-label">Input</div>
          <div className="node-desc">Model Output / Text</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node process-node">
          <div className="node-icon"></div>
          <div className="node-label">Anchor Extraction</div>
          <div className="node-desc">Extract core claims</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node process-node">
          <div className="node-icon"></div>
          <div className="node-label">Graph Construction</div>
          <div className="node-desc">Build evidence graph</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node process-node">
          <div className="node-icon"></div>
          <div className="node-label">Policy Check</div>
          <div className="node-desc">Evaluate policies</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node output-node">
          <div className="node-icon"></div>
          <div className="node-label">Output</div>
          <div className="node-desc">Risk score + Evidence</div>
        </div>
      </div>
    </div>
  );

  const renderEvidenceFlow = () => (
    <div className="flow-diagram evidence-flow">
      <div className="flow-grid">
        <div className="flow-layer">
          <div className="layer-label">Input Layer</div>
          <div className="layer-nodes">
            <div className="mini-node">Token</div>
            <div className="mini-node">Feature</div>
            <div className="mini-node">Embedding</div>
          </div>
        </div>
        <div className="flow-arrow-vertical">↓</div>
        <div className="flow-layer">
          <div className="layer-label">Attribution Layer</div>
          <div className="layer-nodes">
            <div className="mini-node">Shapley</div>
            <div className="mini-node">Salience</div>
            <div className="mini-node">Gradient</div>
          </div>
        </div>
        <div className="flow-arrow-vertical">↓</div>
        <div className="flow-layer">
          <div className="layer-label">Evidence Layer</div>
          <div className="layer-nodes">
            <div className="mini-node">Dataset</div>
            <div className="mini-node">Prior</div>
            <div className="mini-node">Document</div>
          </div>
        </div>
        <div className="flow-arrow-vertical">↓</div>
        <div className="flow-layer">
          <div className="layer-label">Policy Layer</div>
          <div className="layer-nodes">
            <div className="mini-node">Rules</div>
            <div className="mini-node">Compliance</div>
            <div className="mini-node">Safety</div>
          </div>
        </div>
        <div className="flow-arrow-vertical">↓</div>
        <div className="flow-layer">
          <div className="layer-label">Output Layer</div>
          <div className="layer-nodes">
            <div className="mini-node">Decision</div>
            <div className="mini-node">Confidence</div>
            <div className="mini-node">Trace</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplianceFlow = () => (
    <div className="flow-diagram compliance-flow">
      <div className="flow-step">
        <div className="flow-node">
          <div className="node-icon"></div>
          <div className="node-label">Prediction</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">
          <div className="node-icon"></div>
          <div className="node-label">Policy Match</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">
          <div className="node-icon"></div>
          <div className="node-label">Compliance Check</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">
          <div className="node-icon"></div>
          <div className="node-label">Audit Log</div>
        </div>
      </div>
    </div>
  );

  const renderPolicyFlow = () => (
    <div className="flow-diagram policy-flow">
      <div className="flow-step">
        <div className="flow-node">
          <div className="node-icon"></div>
          <div className="node-label">Policy Definition</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">
          <div className="node-icon"></div>
          <div className="node-label">Policy Engine</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">
          <div className="node-icon"></div>
          <div className="node-label">Runtime Enforcement</div>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">
          <div className="node-icon"></div>
          <div className="node-label">Violation Detection</div>
        </div>
      </div>
    </div>
  );

  const renderDiagram = () => {
    switch (type) {
      case 'prediction':
        return renderPredictionFlow();
      case 'evidence':
        return renderEvidenceFlow();
      case 'compliance':
        return renderComplianceFlow();
      case 'policy':
        return renderPolicyFlow();
      default:
        return renderPredictionFlow();
    }
  };

  return (
    <div className={`flow-diagram-container ${animated ? 'animated' : ''} ${interactive ? 'interactive' : ''}`}>
      {renderDiagram()}
    </div>
  );
};

export default FlowDiagram;

