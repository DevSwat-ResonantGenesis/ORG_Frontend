import React from 'react';
import './howItWorks.css';

interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
  details: string[];
  icon: string;
}

const steps: HowItWorksStep[] = [
  {
    number: 1,
    title: 'Your AI produces an output',
    description: 'LLMs, agents, classifiers, or automation systems send predictions to ResonantGenesis via API, batch upload, or UI.',
    details: [],
    icon: ''
  },
  {
    number: 2,
    title: 'We extract the core claims (anchors)',
    description: 'Our engine identifies the key statements your model is making:',
    details: [
      'decisions',
      'recommendations',
      'facts',
      'risk assessments'
    ],
    icon: ''
  },
  {
    number: 3,
    title: 'Evidence Graph construction',
    description: 'We map how each claim supports, contradicts, or relates to others. The engine reveals:',
    details: [
      'missing evidence',
      'logical gaps',
      'unsupported conclusions',
      'high-risk structures'
    ],
    icon: ''
  },
  {
    number: 4,
    title: 'Policy & compliance matching',
    description: 'Anchors are compared against:',
    details: [
      'business rules',
      'regulatory frameworks',
      'sector-specific standards',
      'safety guidelines'
    ],
    icon: ''
  },
  {
    number: 5,
    title: 'Scoring & explanations',
    description: 'Every prediction receives:',
    details: [
      'Validity score',
      'Risk index',
      'Compliance score',
      'Entropy score',
      'Plain-language explanation'
    ],
    icon: ''
  },
  {
    number: 6,
    title: 'Dashboard, API, and audit log',
    description: 'All results appear in:',
    details: [
      'dashboard KPIs',
      'evidence graph',
      'audit logs',
      'API responses'
    ],
    icon: ''
  }
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="page-container">
        <h2 className="section-title-large">How It Works</h2>
        <p className="section-subtitle">
          A transparent AI validation pipeline your compliance team can trust.
        </p>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={step.number} className="step-item">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-header">
                  <span className="step-icon">{step.icon}</span>
                  <h3 className="step-title">{step.title}</h3>
                </div>
                <p className="step-description">{step.description}</p>
                {step.details.length > 0 && (
                  <ul className="step-details">
                    {step.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="step-connector">
                  <div className="connector-line"></div>
                  <div className="connector-arrow">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="how-it-works-footer">
          <p className="footer-text">
            Systems can <strong>block unsafe outputs</strong> automatically.
          </p>
        </div>
      </div>
    </section>
  );
};

