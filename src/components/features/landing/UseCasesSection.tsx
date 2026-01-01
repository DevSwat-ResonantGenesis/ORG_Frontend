import React, { useState, useMemo } from 'react';
import { UseCaseCard, UseCaseCardProps } from './UseCaseCard';
import { IndustryFilter, Industry } from './IndustryFilter';
import './useCasesSection.css';

const useCases: UseCaseCardProps[] = [
  {
    title: 'Banking — Loan Approval',
    industry: 'banking',
    modelOutput: '"Approve loan. Applicant meets all criteria."',
    detectedIssues: [
      'Missing income verification evidence',
      'Credit history gaps not addressed',
      'Policy FD-03: "Loans over $50k require 2 income sources" — violation',
      'No evidence of debt-to-income ratio calculation',
      'Contradiction: Model says "meets all criteria" but evidence graph shows missing data'
    ],
    riskScore: 0.89,
    complianceScore: 38,
    businessImpact: 'AI never again approves a loan without proper justification. Compliance gets full evidence trails. Risk teams receive automated alerts. Prevents regulatory fines and bad debt.'
  },
  {
    title: 'Insurance — Claim Assessment',
    industry: 'banking',
    modelOutput: '"Claim approved. Coverage verified."',
    detectedIssues: [
      'Missing policy document verification',
      'No evidence of coverage period check',
      'Claim amount exceeds policy limits — not flagged',
      'Policy Rule I-15: "Claims over $10k require manual review" — violation',
      'No fraud pattern analysis performed',
      'Contradiction: Model claims "verified" but evidence graph shows missing verification nodes'
    ],
    riskScore: 0.85,
    complianceScore: 45,
    businessImpact: 'Prevents fraudulent claim approvals. Ensures all claims meet policy requirements. Protects insurance companies from financial losses. Maintains regulatory compliance with insurance regulations.'
  },
  {
    title: 'Healthcare — Medical Advice',
    industry: 'healthcare',
    modelOutput: '"Safe to take this medication. No interactions detected."',
    detectedIssues: [
      'Missing drug interaction database check',
      'No dosage verification evidence',
      'Safety Rule H-07: "All medication advice must cite interaction database" — violation',
      'No patient history cross-reference',
      'Contradiction: Model claims "no interactions" but evidence graph shows missing verification nodes'
    ],
    riskScore: 0.92,
    complianceScore: 42,
    businessImpact: 'Prevents dangerous medical advice from reaching patients. Ensures every recommendation is evidence-backed. Protects healthcare providers from liability. Saves lives.'
  },
  {
    title: 'Legal — Contract Analysis',
    industry: 'legal',
    modelOutput: '"Contract is valid and enforceable. All clauses are standard."',
    detectedIssues: [
      'Missing clause reference evidence',
      'Contradictory terms not flagged',
      'Legal Rule L-12: "Contract validation requires clause-by-clause analysis" — violation',
      'No precedent case references',
      'Unsupported claim: "All clauses are standard" has no supporting evidence'
    ],
    riskScore: 0.76,
    complianceScore: 55,
    businessImpact: 'Ensures contract reliability. Prevents legal disputes from unvalidated contracts. Provides full audit trail for legal teams. Protects organizations from contract risks.'
  },
  {
    title: 'Fraud Detection — Transaction Analysis',
    industry: 'fraud',
    modelOutput: '"This transaction appears normal. No fraud indicators detected."',
    detectedIssues: [
      'Location mismatch (impossible travel)',
      '3 failed login attempts before transaction — not checked',
      'Past fraud history — missing from evidence graph',
      'Device mismatch (new device fingerprint)',
      'Rule FD-03: "Transactions over $1,000 require device confirmation" — violation',
      'Contradiction: Model says "normal" but evidence graph shows "high-risk activity"'
    ],
    riskScore: 0.91,
    complianceScore: 38,
    businessImpact: 'AI never again approves a fraudulent transaction without justification. Compliance gets full evidence trails. Fraud teams receive automated risk alerts. Saved revenue: high-value prevention.'
  },
  {
    title: 'HR Screening — Resume Analysis',
    industry: 'hr',
    modelOutput: '"Reject candidate. Not qualified."',
    detectedIssues: [
      'No experience comparison evidence',
      'No skills extraction from resume',
      'No job requirement matching',
      'No performance history reference',
      'Hiring Rule 09: "AI rankings must be explainable" — violation',
      'Hiring Rule 14: "No decision may be based on inferred demographic data" — potential violation',
      'Risky pattern: Model rejected due to "gap in employment" — illegal in many regions',
      'No evidence of comparing candidate qualifications to job requirements'
    ],
    riskScore: 0.83,
    complianceScore: 52,
    businessImpact: 'Prevents biased AI hiring. Ensures every decision is evidence-backed. Protects company from discrimination lawsuits. Improves fairness and diversity. HR gains transparent audit trail.'
  },
  {
    title: 'Customer Service — Support Response',
    industry: 'healthcare',
    modelOutput: '"Customer is eligible for refund. Process immediately."',
    detectedIssues: [
      'No purchase history verification',
      'Missing refund policy check',
      'No evidence of customer account status',
      'Policy CS-22: "Refunds over $500 require manager approval" — violation',
      'No fraud risk assessment performed',
      'Contradiction: Model says "eligible" but evidence graph shows missing eligibility checks'
    ],
    riskScore: 0.78,
    complianceScore: 48,
    businessImpact: 'Prevents unauthorized refunds. Ensures all customer service decisions follow company policies. Protects revenue from fraudulent refund requests. Maintains customer service quality standards.'
  },
  {
    title: 'Content Moderation — Social Media',
    industry: 'legal',
    modelOutput: '"Content approved. No violations detected."',
    detectedIssues: [
      'Missing hate speech detection evidence',
      'No toxicity score calculation',
      'Policy violation keywords not checked',
      'Content Moderation Rule CM-08: "All posts must pass multi-layer safety checks" — violation',
      'No evidence of community guidelines review',
      'Contradiction: Model claims "no violations" but evidence graph shows missing safety checks'
    ],
    riskScore: 0.88,
    complianceScore: 40,
    businessImpact: 'Prevents harmful content from reaching users. Ensures platform safety and compliance. Protects brand reputation. Reduces legal liability. Maintains community trust and engagement.'
  }
];

export const UseCasesSection: React.FC = () => {
  const [activeIndustry, setActiveIndustry] = useState<Industry>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract unique industries from use cases
  const availableIndustries = useMemo(() => {
    const industries = new Set<Industry>(['all']);
    useCases.forEach(useCase => {
      industries.add(useCase.industry);
    });
    return Array.from(industries) as Industry[];
  }, []);

  // Filter use cases based on active industry
  const filteredUseCases = useMemo(() => {
    const filtered = activeIndustry === 'all' 
      ? useCases 
      : useCases.filter(useCase => useCase.industry === activeIndustry);
    setCurrentIndex(0); // Reset to first card when filter changes
    return filtered;
  }, [activeIndustry]);

  // Get current card to display
  const currentCard = filteredUseCases[currentIndex] || null;

  // Handle next/previous navigation
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredUseCases.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredUseCases.length) % filteredUseCases.length);
  };

  return (
    <section id="use-cases" className="use-cases-section">
      <div className="page-container">
        <h2 className="section-title-large">Real-World Use Cases</h2>
        <p className="section-subtitle">
          These examples cover all major AI pain points across highly regulated industries.
        </p>

        <IndustryFilter
          industries={availableIndustries}
          activeIndustry={activeIndustry}
          onFilterChange={setActiveIndustry}
        />

        {/* Carousel - Show only one card */}
        <div className="use-cases-carousel">
          {currentCard && (
            <div className="carousel-container">
              <UseCaseCard key={currentIndex} {...currentCard} />
              {filteredUseCases.length > 1 && (
                <div className="carousel-controls">
                  <button 
                    className="carousel-btn prev" 
                    onClick={handlePrev}
                    aria-label="Previous use case"
                  >
                    ←
                  </button>
                  <span className="carousel-indicator">
                    {currentIndex + 1} / {filteredUseCases.length}
                  </span>
                  <button 
                    className="carousel-btn next" 
                    onClick={handleNext}
                    aria-label="Next use case"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="use-cases-summary">
          <h3 className="summary-title">Summary of Use Cases</h3>
          <div className="summary-table">
            <div className="summary-header">
              <div className="summary-cell">Domain</div>
              <div className="summary-cell">Risk Type</div>
              <div className="summary-cell">Why This Matters</div>
            </div>
            <div className="summary-row">
              <div className="summary-cell"><strong>Banking</strong></div>
              <div className="summary-cell">Regulatory + Ethical</div>
              <div className="summary-cell">Prevents illegal loan decisions</div>
            </div>
            <div className="summary-row">
              <div className="summary-cell"><strong>Healthcare</strong></div>
              <div className="summary-cell">Safety + Legal</div>
              <div className="summary-cell">Stops dangerous medical advice</div>
            </div>
            <div className="summary-row">
              <div className="summary-cell"><strong>Legal</strong></div>
              <div className="summary-cell">Accuracy + Liability</div>
              <div className="summary-cell">Ensures contract reliability</div>
            </div>
            <div className="summary-row">
              <div className="summary-cell"><strong>Fraud</strong></div>
              <div className="summary-cell">Financial + Compliance</div>
              <div className="summary-cell">Prevents multimillion-dollar fraud</div>
            </div>
            <div className="summary-row">
              <div className="summary-cell"><strong>HR Screening</strong></div>
              <div className="summary-cell">Bias + Legal</div>
              <div className="summary-cell">Prevents illegal AI discrimination</div>
            </div>
            <div className="summary-row">
              <div className="summary-cell"><strong>Insurance</strong></div>
              <div className="summary-cell">Financial + Compliance</div>
              <div className="summary-cell">Prevents fraudulent claim approvals</div>
            </div>
            <div className="summary-row">
              <div className="summary-cell"><strong>Customer Service</strong></div>
              <div className="summary-cell">Revenue + Policy</div>
              <div className="summary-cell">Prevents unauthorized refunds</div>
            </div>
            <div className="summary-row">
              <div className="summary-cell"><strong>Content Moderation</strong></div>
              <div className="summary-cell">Safety + Legal</div>
              <div className="summary-cell">Prevents harmful content distribution</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

