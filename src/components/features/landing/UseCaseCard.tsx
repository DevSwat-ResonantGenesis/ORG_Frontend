import React from 'react';
import { Button } from '@/components/ui/Button';
import { EvidenceGraphPreview } from './EvidenceGraphPreview';
import './useCaseCard.css';

export interface UseCaseCardProps {
  title: string;
  industry: 'banking' | 'healthcare' | 'legal' | 'fraud' | 'hr';
  modelOutput: string;
  detectedIssues: string[];
  riskScore: number;
  complianceScore: number;
  businessImpact: string;
  evidenceGraphPreview?: React.ReactNode;
}


const industryConfig = {
  banking: {
    label: 'Banking',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    icon: ''
  },
  healthcare: {
    label: 'Healthcare',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: ''
  },
  legal: {
    label: 'Legal',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: ''
  },
  fraud: {
    label: 'Fraud Detection',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: ''
  },
  hr: {
    label: 'HR Screening',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: ''
  }
};

const getRiskLevel = (score: number): { label: string; color: string } => {
  if (score >= 0.8) return { label: 'Critical', color: '#EF4444' };
  if (score >= 0.6) return { label: 'High', color: '#F59E0B' };
  if (score >= 0.4) return { label: 'Medium', color: '#FBBF24' };
  return { label: 'Low', color: '#10B981' };
};

export const UseCaseCard: React.FC<UseCaseCardProps> = ({
  title,
  industry,
  modelOutput,
  detectedIssues,
  riskScore,
  complianceScore,
  businessImpact,
  evidenceGraphPreview
}) => {
  const config = industryConfig[industry];
  const riskLevel = getRiskLevel(riskScore);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`use-case-card ${isVisible ? 'visible' : ''}`}
      style={{ borderColor: config.color }}
    >
      <div className="use-case-header">
        <div className="use-case-industry" style={{ 
          backgroundColor: config.bgColor,
          color: config.color
        }}>
          <span className="use-case-icon">{config.icon}</span>
          <span>{config.label}</span>
        </div>
        <div className="use-case-scores">
          <div className="score-item">
            <span className="score-label">Risk</span>
            <span className="score-value" style={{ color: riskLevel.color }}>
              {riskScore.toFixed(2)}
            </span>
            <span className="score-level" style={{ color: riskLevel.color }}>
              {riskLevel.label}
            </span>
          </div>
          <div className="score-item">
            <span className="score-label">Compliance</span>
            <span className="score-value" style={{ 
              color: complianceScore >= 70 ? '#10B981' : '#F59E0B' 
            }}>
              {complianceScore}%
            </span>
          </div>
        </div>
      </div>

      <h3 className="use-case-title">{title}</h3>

      <div className="use-case-section">
        <div className="section-label">Model Output</div>
        <div className="model-output-text">{modelOutput}</div>
      </div>

      <div className="use-case-section">
        <div className="section-label">What ResonantGenesis Detects</div>
        <div className="detected-issues detected-issues-2col">
          {detectedIssues.map((issue, idx) => (
            <div key={idx} className="issue-item">
              <span className="issue-text">{issue}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="use-case-section">
        <div className="section-label">Evidence Graph Preview</div>
        <div className="graph-preview graph-preview-2col">
          {/* Evidence Graph Animation Box */}
          <div className="graph-preview-box">
          {evidenceGraphPreview || (
            <EvidenceGraphPreview
              riskLevel={riskScore >= 0.8 ? 'critical' : riskScore >= 0.6 ? 'high' : 'medium'}
              animated={true}
            />
          )}
        </div>
          {/* Business Impact Box */}
          <div className="business-impact-box">
            <div className="business-impact-content">{businessImpact}</div>
          </div>
      </div>
      </div>
    </div>
  );
};

