import React from 'react';
import { Button } from '@/components/ui/Button';
import './ceoExplanation.css';

interface ExplanationStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

const steps: ExplanationStep[] = [
  {
    number: 1,
    title: 'Your AI systems send outputs automatically',
    description: 'LLMs, agents, classifiers, or automation systems send their outputs to DevSwat via API, batch upload, or UI. This is automatic — no one copies or pastes anything manually.',
    icon: ''
  },
  {
    number: 2,
    title: 'We extract the core claims (anchors)',
    description: 'Our engine identifies the key statements your model is making: facts, assertions, decisions, and recommendations.',
    icon: ''
  },
  {
    number: 3,
    title: 'We check each anchor for evidence',
    description: 'Our graph engine maps supporting facts, missing facts, contradictions, and risk patterns.',
    icon: ''
  },
  {
    number: 4,
    title: 'We compare against policies & regulations',
    description: 'This shows safety violations, compliance issues, fraud risk, bias, and unsupported decisions.',
    icon: ''
  },
  {
    number: 5,
    title: 'We generate evidence graph + risk score',
    description: 'Every prediction receives a complete evidence graph and risk score. Clear, transparent, auditable.',
    icon: ''
  },
  {
    number: 6,
    title: 'Dangerous outputs can be blocked automatically',
    description: 'Just like a firewall — but for AI reasoning. Unsafe outputs are prevented before reaching customers.',
    icon: ''
  }
];

const outcomes = [
  {
    title: 'Trustworthy AI',
    description: 'Every decision is evidence-backed and transparent',
    icon: ''
  },
  {
    title: 'Compliance Protection',
    description: 'Full audit trail for regulatory requirements',
    icon: ''
  },
  {
    title: 'Risk Reduction',
    description: 'Prevent fraud, bias, and safety violations',
    icon: ''
  },
  {
    title: 'Cost Savings',
    description: 'Avoid fines, lawsuits, and revenue losses',
    icon: ''
  }
];

export const CEOExplanationSection: React.FC = () => {
  return (
    <section id="for-executives" className="ceo-explanation-section">
      <div className="page-container">
        <div className="ceo-header">
          <h2 className="section-title-large">For Executives</h2>
          <p className="section-subtitle">
            How it works in less than 60 seconds
          </p>
        </div>

        <div className="ceo-steps">
          {steps.map((step, index) => (
            <div key={step.number} className="ceo-step-item">
              <div className="ceo-step-number">{step.number}</div>
              <div className="ceo-step-content">
                <div className="ceo-step-header">
                  <span className="ceo-step-icon">{step.icon}</span>
                  <h3 className="ceo-step-title">{step.title}</h3>
                </div>
                <p className="ceo-step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="ceo-outcomes">
          <h3 className="outcomes-title">Outcome: You Get</h3>
          <div className="outcomes-grid">
            {outcomes.map((outcome, index) => (
              <div key={index} className="outcome-card">
                <div className="outcome-icon">{outcome.icon}</div>
                <h4 className="outcome-title">{outcome.title}</h4>
                <p className="outcome-description">{outcome.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ceo-cta">
          <p className="cta-text">
            TRUST YOUR AI. PROVE YOUR AI. STAY COMPLIANT.
          </p>
          <div className="cta-buttons">
            <Button onClick={() => window.location.href = '/contact'}>
              Schedule Executive Briefing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

