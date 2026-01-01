import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EvidenceGraphPreview } from '../features/landing/EvidenceGraphPreview';
import './dashboardEvidenceGraphWidget.css';

interface Prediction {
  id: string;
  input_text?: string;
  risk_score?: number;
  compliance_score?: number;
  created_at?: string;
}

interface DashboardEvidenceGraphWidgetProps {
  recentPredictions?: Prediction[];
  maxItems?: number;
}

export const DashboardEvidenceGraphWidget: React.FC<DashboardEvidenceGraphWidgetProps> = ({
  recentPredictions = [],
  maxItems = 3
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Get high-risk predictions
  const highRiskPredictions = recentPredictions
    .filter(p => (p.risk_score || 0) > 0.7)
    .slice(0, maxItems);

  if (highRiskPredictions.length === 0) {
    return (
      <div className="evidence-graph-widget">
        <div className="widget-header">
          <h3 className="widget-title">Evidence Graph Preview</h3>
          <button
            className="widget-expand-btn"
            onClick={() => navigate('/predictions')}
          >
            View All
          </button>
        </div>
        <div className="widget-empty">
          <p>No high-risk predictions to display</p>
          <p className="empty-subtitle">Evidence graphs will appear here when predictions are created</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evidence-graph-widget">
      <div className="widget-header">
        <h3 className="widget-title">Evidence Graph Preview</h3>
        <div className="widget-actions">
          <button
            className="widget-expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            className="widget-view-all-btn"
            onClick={() => navigate('/predictions')}
          >
            View All
          </button>
        </div>
      </div>

      <div className={`widget-content ${expanded ? 'expanded' : ''}`}>
        {highRiskPredictions.map((prediction, index) => {
          const riskLevel = (prediction.risk_score || 0) >= 0.8 ? 'critical' : 
                           (prediction.risk_score || 0) >= 0.6 ? 'high' : 'medium';

          return (
            <div
              key={prediction.id || index}
              className="prediction-preview-card"
              onClick={() => navigate(`/predictions/${prediction.id}`)}
            >
              <div className="preview-header">
                <div className="preview-meta">
                  <span className="preview-id">#{prediction.id?.substring(0, 8)}</span>
                  <span className={`preview-risk risk-${riskLevel}`}>
                    Risk: {(prediction.risk_score || 0).toFixed(2)}
                  </span>
                </div>
                <div className="preview-scores">
                  <span className="preview-score">
                    Compliance: {prediction.compliance_score || 0}%
                  </span>
                </div>
              </div>

              <div className="preview-text">
                {(prediction.input_text || 'No input text').substring(0, 100)}
                {(prediction.input_text || '').length > 100 ? '...' : ''}
              </div>

              <div className="preview-graph">
                <EvidenceGraphPreview
                  riskLevel={riskLevel}
                  animated={true}
                />
              </div>

              {prediction.created_at && (
                <div className="preview-footer">
                  <span className="preview-date">
                    {new Date(prediction.created_at).toLocaleDateString()}
                  </span>
                  <button className="preview-view-btn">View Details →</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

