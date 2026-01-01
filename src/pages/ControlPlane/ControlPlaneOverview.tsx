/**
 * Control Plane Overview
 * 
 * Comprehensive overview of the ResonantGenesis Control Plane
 * Shows all control plane capabilities and how to use them
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Activity,
  Brain,
  Shield,
  FileText,
  Lock,
  CheckCircle,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Play,
  Settings,
  BarChart3,
  Eye,
  GitBranch,
  Users,
  AlertTriangle,
  Zap
} from 'lucide-react';
import styles from './ControlPlane.module.css';

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  path: string;
  color: string;
}

const ControlPlaneOverview: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const features: FeatureCard[] = [
    {
      id: 'overview',
      title: 'System Dashboard',
      subtitle: 'Complete system visibility',
      description: 'Central command center for monitoring and managing your entire AI infrastructure. Real-time insights into system health, performance, and operational status.',
      icon: <Monitor size={24} />,
      features: [
        'Real-time system monitoring',
        'Resource utilization tracking',
        'Service health status',
        'Operational metrics dashboard'
      ],
      path: '/control-plane/live',
      color: '#3b82f6'
    },
    {
      id: 'live-monitor',
      title: 'Live Monitor',
      subtitle: 'Real-time execution',
      description: 'Watch AI agents execute in real-time with live streaming of events, decisions, and governance actions. See exactly how your AI behaves.',
      icon: <Activity size={24} />,
      features: [
        'Live event streaming',
        'Execution timeline view',
        'Real-time decision tracking',
        'Performance monitoring'
      ],
      path: '/control-plane/live',
      color: '#10b981'
    },
    {
      id: 'performance',
      title: 'Performance',
      subtitle: 'Metrics & analytics',
      description: 'Deep analytics on AI performance including response times, accuracy rates, resource usage, and optimization recommendations.',
      icon: <BarChart3 size={24} />,
      features: [
        'Response time analytics',
        'Accuracy metrics',
        'Resource utilization',
        'Performance trends'
      ],
      path: '/control-plane/performance',
      color: '#8b5cf6'
    },
    {
      id: 'semantics',
      title: 'Semantics',
      subtitle: 'Semantic analysis',
      description: 'Advanced semantic understanding and analysis of AI behavior, decisions, and outputs. Track how your AI interprets and processes information.',
      icon: <Brain size={24} />,
      features: [
        'Semantic pattern analysis',
        'Decision tree visualization',
        'Context understanding',
        'Meaning extraction'
      ],
      path: '/control-plane/semantics',
      color: '#f59e0b'
    },
    {
      id: 'trust',
      title: 'Trust',
      subtitle: 'Trust verification',
      description: 'Comprehensive trust scoring and verification system for AI agents. Monitor trust levels, validation, and reputation across all interactions.',
      icon: <Shield size={24} />,
      features: [
        'Trust score tracking',
        'Verification workflows',
        'Reputation monitoring',
        'Confidence metrics'
      ],
      path: '/control-plane/trust',
      color: '#06b6d4'
    },
    {
      id: 'governance',
      title: 'Governance',
      subtitle: 'Policy management',
      description: 'Define, manage, and enforce governance policies across your AI ecosystem. Ensure compliance with organizational rules and regulations.',
      icon: <FileText size={24} />,
      features: [
        'Policy definition engine',
        'Rule enforcement',
        'Compliance monitoring',
        'Policy versioning'
      ],
      path: '/control-plane/governance',
      color: '#84cc16'
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Access & protection',
      description: 'Enterprise-grade security controls including authentication, authorization, encryption, and threat protection for your AI systems.',
      icon: <Lock size={24} />,
      features: [
        'Access control management',
        'Encryption protocols',
        'Threat detection',
        'Security audit logs'
      ],
      path: '/control-plane/security',
      color: '#ef4444'
    },
    {
      id: 'compliance',
      title: 'Compliance',
      subtitle: 'Regulatory reports',
      description: 'Automated compliance monitoring and reporting for major regulations including GDPR, HIPAA, SOC 2, and industry standards.',
      icon: <CheckCircle size={24} />,
      features: [
        'GDPR compliance tracking',
        'HIPAA monitoring',
        'SOC 2 reporting',
        'Audit trail generation'
      ],
      path: '/control-plane/compliance',
      color: '#6366f1'
    },
    {
      id: 'business',
      title: 'Business',
      subtitle: 'Business metrics',
      description: 'Business intelligence and metrics for AI operations including ROI analysis, cost tracking, and value measurement.',
      icon: <TrendingUp size={24} />,
      features: [
        'ROI analytics',
        'Cost optimization',
        'Value tracking',
        'Business impact metrics'
      ],
      path: '/control-plane/business',
      color: '#f97316'
    },
    {
      id: 'scenarios',
      title: 'Guided Scenarios',
      subtitle: 'Interactive guides',
      description: 'Step-by-step interactive guides for understanding and testing control plane capabilities in safe, simulated environments.',
      icon: <BookOpen size={24} />,
      features: [
        'Interactive tutorials',
        'Safe simulation mode',
        'Step-by-step guidance',
        'Learning pathways'
      ],
      path: '/control-plane/scenarios',
      color: '#6b7280'
    }
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  const toggleFeature = (featureId: string) => {
    setExpandedFeature(expandedFeature === featureId ? null : featureId);
  };

  return (
    <div className={styles.controlPlaneOverview}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Control Plane</h1>
            <p className={styles.subtitle}>
              Enterprise-grade governance, security, and compliance for AI operations
            </p>
            <p className={styles.description}>
              Complete visibility and control over your AI infrastructure with real-time monitoring, 
              policy enforcement, and automated compliance. Built for organizations where 
              AI reliability is mission-critical.
            </p>
          </div>
          <div className={styles.headerGraphic}>
            <div className={styles.graphicElement}>
              <Settings className={styles.rotatingIcon} size={32} />
            </div>
            <div className={styles.graphicElement}>
              <Eye size={24} />
            </div>
            <div className={styles.graphicElement}>
              <GitBranch size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`${styles.featureCard} ${expandedFeature === feature.id ? styles.expanded : ''}`}
            style={{ '--feature-color': feature.color } as React.CSSProperties}
          >
            <div className={styles.featureHeader}>
              <div className={styles.featureIcon} style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <div className={styles.featureTitleSection}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureSubtitle}>{feature.subtitle}</p>
              </div>
              <button
                className={styles.expandButton}
                onClick={() => toggleFeature(feature.id)}
              >
                {expandedFeature === feature.id ? '−' : '+'}
              </button>
            </div>

            <p className={styles.featureDescription}>{feature.description}</p>

            {expandedFeature === feature.id && (
              <div className={styles.featureDetails}>
                <h4 className={styles.detailsTitle}>Key Capabilities:</h4>
                <ul className={styles.featuresList}>
                  {feature.features.map((item, index) => (
                    <li key={index} className={styles.featureItem}>
                      <CheckCircle size={16} className={styles.checkIcon} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  className={styles.actionButton}
                  onClick={() => handleFeatureClick(feature.path)}
                  style={{ backgroundColor: feature.color }}
                >
                  <Play size={16} />
                  Explore {feature.title}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Start Section */}
      <div className={styles.quickStart}>
        <h2 className={styles.quickStartTitle}>Quick Start Guide</h2>
        <div className={styles.quickStartGrid}>
          <div className={styles.quickStartCard}>
            <div className={styles.quickStartNumber}>1</div>
            <h3>Monitor System</h3>
            <p>Start with the System Dashboard to get real-time visibility into your AI infrastructure.</p>
            <button 
              className={styles.quickStartButton}
              onClick={() => handleFeatureClick('/control-plane/live')}
            >
              Open Live Monitor
            </button>
          </div>
          <div className={styles.quickStartCard}>
            <div className={styles.quickStartNumber}>2</div>
            <h3>Set Governance</h3>
            <p>Define policies and rules to ensure AI behavior aligns with your requirements.</p>
            <button 
              className={styles.quickStartButton}
              onClick={() => handleFeatureClick('/control-plane/governance')}
            >
              Configure Policies
            </button>
          </div>
          <div className={styles.quickStartCard}>
            <div className={styles.quickStartNumber}>3</div>
            <h3>Verify Compliance</h3>
            <p>Monitor regulatory compliance and generate audit reports automatically.</p>
            <button 
              className={styles.quickStartButton}
              onClick={() => handleFeatureClick('/control-plane/compliance')}
            >
              Check Compliance
            </button>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className={styles.trustSection}>
        <div className={styles.trustHeader}>
          <Shield className={styles.trustIcon} size={24} />
          <h2>Trusted by Leading Organizations</h2>
        </div>
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <CheckCircle size={20} className={styles.trustCheck} />
            <span>99.9% Uptime SLA</span>
          </div>
          <div className={styles.trustItem}>
            <CheckCircle size={20} className={styles.trustCheck} />
            <span>SOC 2 Type II Certified</span>
          </div>
          <div className={styles.trustItem}>
            <CheckCircle size={20} className={styles.trustCheck} />
            <span>GDPR Compliant</span>
          </div>
          <div className={styles.trustItem}>
            <CheckCircle size={20} className={styles.trustCheck} />
            <span>Enterprise Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPlaneOverview;
