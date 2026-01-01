import React from 'react';
import './ServiceIcons.css';

// Service icons for homepage - animated, visible in dark and light mode

export const RiskManagementIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon risk-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4L6 10V22L16 28L26 22V10L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M16 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-path"/>
    <circle cx="16" cy="24" r="1" fill="currentColor" className="icon-dot"/>
  </svg>
);

export const ChatIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon chat-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 16C28 22.627 22.627 28 16 28L6 32V16C6 9.373 11.373 4 18 4C24.627 4 28 9.373 28 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <circle cx="12" cy="16" r="1.5" fill="currentColor" className="icon-dot"/>
    <circle cx="16" cy="16" r="1.5" fill="currentColor" className="icon-dot"/>
    <circle cx="20" cy="16" r="1.5" fill="currentColor" className="icon-dot"/>
  </svg>
);

export const MLOpsIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon mlops-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <path d="M8 12H24M8 16H24M8 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-path"/>
    <circle cx="12" cy="6" r="1.5" fill="currentColor" className="icon-dot"/>
    <circle cx="20" cy="6" r="1.5" fill="currentColor" className="icon-dot"/>
  </svg>
);

export const ComplianceIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon compliance-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4L6 10V22L16 28L26 22V10L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M12 16L14 18L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
  </svg>
);

export const AuditIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon audit-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4H26C27.105 4 28 4.895 28 6V26C28 27.105 27.105 28 26 28H6C4.895 28 4 27.105 4 26V6C4 4.895 4.895 4 6 4Z" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <path d="M8 10H24M8 16H24M8 22H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const HashSphereIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon hashsphere-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <circle cx="16" cy="10" r="2" fill="currentColor" className="icon-dot"/>
    <circle cx="16" cy="22" r="2" fill="currentColor" className="icon-dot"/>
    <circle cx="10" cy="16" r="2" fill="currentColor" className="icon-dot"/>
    <circle cx="22" cy="16" r="2" fill="currentColor" className="icon-dot"/>
    <path d="M16 10L10 16L16 22L22 16L16 10" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
  </svg>
);

export const EnterpriseIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon enterprise-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4L6 10V28H26V10L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M16 10V28" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <path d="M6 18H26" stroke="currentColor" strokeWidth="2" className="icon-path"/>
  </svg>
);

export const BillingIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon billing-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <path d="M6 12H26" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <circle cx="22" cy="20" r="2" fill="currentColor" className="icon-dot"/>
    <circle cx="26" cy="20" r="2" fill="currentColor" className="icon-dot"/>
  </svg>
);

export const IntegrationIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon integration-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <circle cx="22" cy="10" r="4" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <circle cx="10" cy="22" r="4" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <circle cx="22" cy="22" r="4" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <path d="M14 10L18 10M10 14L10 18M22 14L22 18M14 22L18 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const AnalyticsIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon analytics-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="20" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <rect x="10" y="14" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <rect x="16" y="10" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="2" className="icon-path"/>
    <rect x="22" y="6" width="4" height="22" rx="1" stroke="currentColor" strokeWidth="2" className="icon-path"/>
  </svg>
);

export const SecurityIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon security-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4L6 10V18C6 24 16 28 16 28C16 28 26 24 26 18V10L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M12 16L14 18L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
  </svg>
);

export const EvidenceGraphIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon evidence-icon ${className}`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="24" r="2" fill="currentColor" className="icon-dot"/>
    <circle cx="16" cy="16" r="2" fill="currentColor" className="icon-dot"/>
    <circle cx="24" cy="8" r="2" fill="currentColor" className="icon-dot"/>
    <path d="M10 23L14 17L22 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
  </svg>
);

// Differentiator Icons - Minimal 2025 Style
export const ChainIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon chain-icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <circle cx="16" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <circle cx="8" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <circle cx="16" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
  </svg>
);

export const SyncIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon sync-icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4V8M12 16V20M4 12H8M16 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <path d="M7 7L5 5M19 19L17 17M5 19L7 17M19 5L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
  </svg>
);

export const ChartIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`service-icon chart-icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="16" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <rect x="8" y="12" width="3" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <rect x="13" y="8" width="3" height="13" rx="0.5" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <rect x="18" y="4" width="3" height="17" rx="0.5" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
  </svg>
);

// Animated Differentiator Icons - 48px size for home page
export const AnimatedChainIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`differentiator-icon animated-chain-icon ${className}`} width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="chain-group">
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" className="chain-link chain-link-1"/>
      <circle cx="32" cy="16" r="4" stroke="currentColor" strokeWidth="2" className="chain-link chain-link-2"/>
      <circle cx="16" cy="32" r="4" stroke="currentColor" strokeWidth="2" className="chain-link chain-link-3"/>
      <circle cx="32" cy="32" r="4" stroke="currentColor" strokeWidth="2" className="chain-link chain-link-4"/>
      <path d="M20 16H28M16 20V28M32 20V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="chain-connector"/>
    </g>
  </svg>
);

export const AnimatedHashSphereIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`differentiator-icon animated-hashsphere-icon ${className}`} width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="hashsphere-group">
      <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="2" className="hashsphere-ring hashsphere-ring-1"/>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" className="hashsphere-ring hashsphere-ring-2"/>
      <circle cx="24" cy="24" r="2" fill="currentColor" className="hashsphere-center"/>
      <path d="M12 24H36M24 12V36" stroke="currentColor" strokeWidth="1.5" className="hashsphere-cross"/>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="hashsphere-outer"/>
    </g>
  </svg>
);

export const AnimatedSyncIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`differentiator-icon animated-sync-icon ${className}`} width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="sync-group">
      <path d="M24 8V16M24 32V40M8 24H16M32 24H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="sync-arrow sync-arrow-1"/>
      <path d="M14 14L10 10M38 38L34 34M10 38L14 34M38 10L34 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="sync-arrow sync-arrow-2"/>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" className="sync-center"/>
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" className="sync-ring"/>
    </g>
  </svg>
);

export const AnimatedChartIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`differentiator-icon animated-chart-icon ${className}`} width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="chart-group">
      <rect x="6" y="32" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="2" className="chart-bar chart-bar-1"/>
      <rect x="16" y="24" width="6" height="18" rx="1" stroke="currentColor" strokeWidth="2" className="chart-bar chart-bar-2"/>
      <rect x="26" y="16" width="6" height="26" rx="1" stroke="currentColor" strokeWidth="2" className="chart-bar chart-bar-3"/>
      <rect x="36" y="8" width="6" height="34" rx="1" stroke="currentColor" strokeWidth="2" className="chart-bar chart-bar-4"/>
      <path d="M6 42H42" stroke="currentColor" strokeWidth="1.5" className="chart-base"/>
    </g>
  </svg>
);

