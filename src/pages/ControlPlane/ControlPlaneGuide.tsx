/**
 * Control Plane Guide - Comprehensive Step-by-Step Instructions
 * 
 * Complete guide for understanding and using the ResonantGenesis Control Plane
 * Based on our database and real-world usage patterns
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Monitor,
  Activity,
  BarChart3,
  Brain,
  Shield,
  FileText,
  Lock,
  CheckCircle,
  TrendingUp,
  Play,
  ArrowRight,
  Check,
  AlertTriangle,
  Users,
  Settings,
  Eye,
  Zap,
  Clock,
  Database,
  Target,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import styles from './ControlPlane.module.css';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  action: string;
  result: string;
  tips: string[];
  relatedFunction?: string;
}

interface FunctionGuide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  steps: GuideStep[];
  prerequisites: string[];
  benefits: string[];
  useCases: string[];
}

const ControlPlaneGuide: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFunction, setExpandedFunction] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const functionGuides: FunctionGuide[] = [
    {
      id: 'overview',
      title: 'System Dashboard',
      subtitle: 'Complete system visibility',
      description: 'The System Dashboard provides a centralized view of your entire AI infrastructure. Monitor system health, resource utilization, service status, and operational metrics in real-time.',
      icon: <Monitor size={24} />,
      color: '#3b82f6',
      path: '/control-plane',
      steps: [
        {
          id: 'ov-1',
          title: 'Access Dashboard',
          description: 'Navigate to the Control Plane and open the System Dashboard.',
          action: 'Click on System Dashboard in the Control Plane overview.',
          result: 'Dashboard opens with real-time system metrics.',
          tips: [
            'Dashboard updates automatically every 5 seconds',
            'Use filters to focus on specific services',
            'Click any metric to see detailed breakdown'
          ]
        },
        {
          id: 'ov-2',
          title: 'Monitor System Health',
          description: 'Review the overall system health indicators and service status.',
          action: 'Check the health status cards at the top of the dashboard.',
          result: 'You see which services are running, degraded, or down.',
          tips: [
            'Green means healthy, yellow means degraded, red means down',
            'Hover over status to see last check time',
            'Set up alerts for critical services'
          ]
        },
        {
          id: 'ov-3',
          title: 'Analyze Resource Usage',
          description: 'Examine CPU, memory, and storage utilization across all services.',
          action: 'Look at the resource utilization graphs and tables.',
          result: 'You understand resource consumption patterns and bottlenecks.',
          tips: [
            'Compare usage against allocated quotas',
            'Set alerts for resource thresholds',
            'Use historical data to plan capacity'
          ]
        },
        {
          id: 'ov-4',
          title: 'Review Operational Metrics',
          description: 'Check key performance indicators and operational KPIs.',
          action: 'Navigate to the metrics section and review KPIs.',
          result: 'You have visibility into operational efficiency.',
          tips: [
            'Track response times and error rates',
            'Monitor user satisfaction scores',
            'Export reports for stakeholder reviews'
          ]
        }
      ],
      prerequisites: ['Basic understanding of system architecture', 'Access to Control Plane'],
      benefits: ['Real-time visibility', 'Proactive issue detection', 'Resource optimization', 'Operational insights'],
      useCases: ['System monitoring', 'Performance optimization', 'Capacity planning', 'Incident response']
    },
    {
      id: 'live-monitor',
      title: 'Live Monitor',
      subtitle: 'Real-time execution',
      description: 'Watch AI agents execute in real-time with live streaming of events, decisions, and governance actions. Understand exactly how your AI behaves.',
      icon: <Activity size={24} />,
      color: '#10b981',
      path: '/control-plane/live',
      steps: [
        {
          id: 'lm-1',
          title: 'Start Live Session',
          description: 'Initiate a real-time monitoring session for your AI agents.',
          action: 'Click "Start Monitoring" and select agents to watch.',
          result: 'Live execution stream begins with real-time updates.',
          tips: [
            'Select specific agents or monitor all',
            'Set filters to focus on certain event types',
            'Adjust playback speed for review'
          ]
        },
        {
          id: 'lm-2',
          title: 'Observe Decision Making',
          description: 'Watch how AI agents make decisions in real-time.',
          action: 'Follow the decision flow and reasoning paths.',
          result: 'You understand the agent\'s decision-making process.',
          tips: [
            'Decision trees show all possible paths',
            'Hover over nodes to see confidence scores',
            'Filter by decision type or domain'
          ]
        },
        {
          id: 'lm-3',
          title: 'Monitor Governance Actions',
          description: 'See how governance policies affect execution in real-time.',
          action: 'Watch for policy triggers and enforcement actions.',
          result: 'You understand governance impact on behavior.',
          tips: [
            'Red indicators show policy blocks',
            'Yellow shows warnings with modified execution',
            'Green means normal execution within policies'
          ]
        },
        {
          id: 'lm-4',
          title: 'Analyze Performance',
          description: 'Review performance metrics during live execution.',
          action: 'Check response times, accuracy, and resource usage.',
          result: 'You identify performance bottlenecks and optimization opportunities.',
          tips: [
            'Compare against baseline performance',
            'Look for patterns in slow responses',
            'Check resource efficiency ratios'
          ]
        }
      ],
      prerequisites: ['Understanding of AI agent behavior', 'Live monitoring permissions'],
      benefits: ['Real-time transparency', 'Immediate issue detection', 'Behavior analysis', 'Performance insights'],
      useCases: ['Agent debugging', 'Behavior validation', 'Performance tuning', 'Incident investigation']
    },
    {
      id: 'performance',
      title: 'Performance',
      subtitle: 'Metrics & analytics',
      description: 'Deep analytics on AI performance including response times, accuracy rates, resource usage, and optimization recommendations.',
      icon: <BarChart3 size={24} />,
      color: '#8b5cf6',
      path: '/control-plane/performance',
      steps: [
        {
          id: 'perf-1',
          title: 'Configure Metrics',
          description: 'Set up the performance metrics you want to track.',
          action: 'Select KPIs and configure data collection.',
          result: 'Performance tracking begins with your chosen metrics.',
          tips: [
            'Track response time, accuracy, throughput',
            'Set custom business metrics',
            'Configure alert thresholds'
          ]
        },
        {
          id: 'perf-2',
          title: 'Analyze Trends',
          description: 'Review performance trends over time and identify patterns.',
          action: 'Use time-series analysis and trend detection.',
          result: 'You see performance patterns and anomalies.',
          tips: [
            'Look for gradual degradation trends',
            'Compare weekday vs weekend patterns',
            'Check correlation with user load'
          ]
        },
        {
          id: 'perf-3',
          title: 'Optimize Settings',
          description: 'Use AI recommendations to optimize performance.',
          action: 'Review optimization suggestions and apply changes.',
          result: 'System performance improves with tuned parameters.',
          tips: [
            'Test optimizations in staging first',
            'Monitor for 24 hours after changes',
            'Roll back if performance degrades'
          ]
        },
        {
          id: 'perf-4',
          title: 'Generate Reports',
          description: 'Create comprehensive performance reports for stakeholders.',
          action: 'Export performance data and insights.',
          result: 'You have detailed performance documentation.',
          tips: [
            'Include executive summary and recommendations',
            'Add visualizations for key trends',
            'Schedule automated report generation'
          ]
        }
      ],
      prerequisites: ['Performance monitoring setup', 'Metrics configuration'],
      benefits: ['Performance optimization', 'Trend analysis', 'Resource efficiency', 'Stakeholder reporting'],
      useCases: ['Performance tuning', 'Capacity planning', 'SLA monitoring', 'Cost optimization']
    },
    {
      id: 'semantics',
      title: 'Semantics',
      subtitle: 'Semantic analysis',
      description: 'Advanced semantic understanding and analysis of AI behavior, decisions, and outputs. Track how your AI interprets and processes information.',
      icon: <Brain size={24} />,
      color: '#f59e0b',
      path: '/control-plane/semantics',
      steps: [
        {
          id: 'sem-1',
          title: 'Define Semantic Models',
          description: 'Configure semantic understanding models for your domain.',
          action: 'Select or train semantic models for your use case.',
          result: 'AI understands context and meaning in your domain.',
          tips: [
            'Use pre-trained models for common domains',
            'Fine-tune with your specific terminology',
            'Test with sample inputs from your domain'
          ]
        },
        {
          id: 'sem-2',
          title: 'Analyze Decision Patterns',
          description: 'Examine how AI interprets and processes semantic information.',
          action: 'Review semantic decision trees and patterns.',
          result: 'You understand the AI\'s semantic reasoning.',
          tips: [
            'Look for consistent interpretation patterns',
            'Check for bias in semantic understanding',
            'Validate against expected domain knowledge'
          ]
        },
        {
          id: 'sem-3',
          title: 'Extract Meaning',
          description: 'Extract and categorize meaning from AI outputs.',
          action: 'Use semantic analysis to categorize and tag outputs.',
          result: 'AI outputs are structured and meaningful.',
          tips: [
            'Configure custom meaning categories',
            'Set confidence thresholds for extraction',
            'Review and adjust extraction rules'
          ]
        },
        {
          id: 'sem-4',
          title: 'Validate Understanding',
          description: 'Test and validate semantic understanding accuracy.',
          action: 'Run validation tests and review accuracy metrics.',
          result: 'You ensure AI correctly understands your domain.',
          tips: [
            'Use domain-specific test cases',
            'Check edge cases and ambiguous inputs',
            'Monitor accuracy over time'
          ]
        }
      ],
      prerequisites: ['Semantic model configuration', 'Domain knowledge setup'],
      benefits: ['Better understanding', 'Context awareness', 'Meaning extraction', 'Domain adaptation'],
      useCases: ['Content analysis', 'Decision support', 'Knowledge extraction', 'Domain-specific AI']
    },
    {
      id: 'trust',
      title: 'Trust',
      subtitle: 'Trust verification',
      description: 'Comprehensive trust scoring and verification system for AI agents. Monitor trust levels, validation, and reputation across all interactions.',
      icon: <Shield size={24} />,
      color: '#06b6d4',
      path: '/control-plane/trust',
      steps: [
        {
          id: 'trust-1',
          title: 'Configure Trust Metrics',
          description: 'Set up trust scoring metrics and weights.',
          action: 'Define what constitutes trust for your agents.',
          result: 'Trust scoring system is configured for your environment.',
          tips: [
            'Include performance, reliability, and behavior metrics',
            'Set different weights for different contexts',
            'Configure trust decay rates over time'
          ]
        },
        {
          id: 'trust-2',
          title: 'Monitor Trust Levels',
          description: 'Track trust scores in real-time across all agents.',
          action: 'Watch trust scores change based on agent behavior.',
          result: 'You see which agents are trusted and which need improvement.',
          tips: [
            'Set alerts for trust threshold breaches',
            'Analyze trust score trends over time',
            'Compare trust across different agent types'
          ]
        },
        {
          id: 'trust-3',
          title: 'Validate Trust',
          description: 'Run trust validation and verification processes.',
          action: 'Execute trust validation checks and audits.',
          result: 'Trust scores are validated and verified.',
          tips: [
            'Use cross-validation with multiple metrics',
            'Check for trust manipulation attempts',
            'Document trust decisions for audits'
          ]
        },
        {
          id: 'trust-4',
          title: 'Manage Trust Reputation',
          description: 'Manage and maintain trust reputation across the ecosystem.',
          action: 'Update trust records and manage reputation.',
          result: 'Agent trust reputation is accurately maintained.',
          tips: [
            'Regularly update trust records',
            'Address trust issues quickly',
            'Build trust through consistent good behavior'
          ]
        }
      ],
      prerequisites: ['Trust metrics definition', 'Trust monitoring setup'],
      benefits: ['Trust visibility', 'Reputation management', 'Risk assessment', 'Quality assurance'],
      useCases: ['Agent selection', 'Risk management', 'Quality control', 'Compliance verification']
    },
    {
      id: 'governance',
      title: 'Governance',
      subtitle: 'Policy management',
      description: 'Define, manage, and enforce governance policies across your AI ecosystem. Ensure compliance with organizational rules and regulations.',
      icon: <FileText size={24} />,
      color: '#84cc16',
      path: '/control-plane/governance',
      steps: [
        {
          id: 'gov-1',
          title: 'Create Policies',
          description: 'Define governance policies and rules for AI behavior.',
          action: 'Write policies using natural language or policy editor.',
          result: 'Governance policies are created and ready for enforcement.',
          tips: [
            'Be specific about allowed and prohibited actions',
            'Include context conditions and exceptions',
            'Test policies with sample scenarios'
          ]
        },
        {
          id: 'gov-2',
          title: 'Configure Enforcement',
          description: 'Set up how and when policies are enforced.',
          action: 'Configure enforcement levels and actions.',
          result: 'Policy enforcement is active and monitoring behavior.',
          tips: [
            'Choose warning vs blocking based on risk',
            'Set escalation paths for violations',
            'Configure exceptions and override processes'
          ]
        },
        {
          id: 'gov-3',
          title: 'Monitor Compliance',
          description: 'Track policy compliance and violations in real-time.',
          action: 'Monitor compliance metrics and violation patterns.',
          result: 'You have visibility into policy adherence.',
          tips: [
            'Track compliance rates over time',
            'Analyze common violation patterns',
            'Set up alerts for critical violations'
          ]
        },
        {
          id: 'gov-4',
          title: 'Audit and Update',
          description: 'Regularly audit and update governance policies.',
          action: 'Review policy effectiveness and make improvements.',
          result: 'Governance policies remain effective and current.',
          tips: [
            'Schedule regular policy reviews',
            'Gather feedback from policy users',
            'Document policy changes and rationale'
          ]
        }
      ],
      prerequisites: ['Policy definition', 'Enforcement configuration'],
      benefits: ['Policy compliance', 'Risk management', 'Regulatory adherence', 'Behavioral control'],
      useCases: ['Compliance management', 'Risk mitigation', 'Regulatory reporting', 'Policy automation']
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Access & protection',
      description: 'Enterprise-grade security controls including authentication, authorization, encryption, and threat protection for your AI systems.',
      icon: <Lock size={24} />,
      color: '#ef4444',
      path: '/control-plane/security',
      steps: [
        {
          id: 'sec-1',
          title: 'Configure Authentication',
          description: 'Set up authentication methods and access controls.',
          action: 'Configure SSO, MFA, and user authentication.',
          result: 'Secure authentication is configured for all users.',
          tips: [
            'Use enterprise SSO where possible',
            'Enable MFA for all admin accounts',
            'Set up role-based access controls'
          ]
        },
        {
          id: 'sec-2',
          title: 'Set Authorization',
          description: 'Define authorization policies and permissions.',
          action: 'Configure who can access what and when.',
          result: 'Access controls are enforced and permissions managed.',
          tips: [
            'Follow principle of least privilege',
            'Use time-based access where appropriate',
            'Regularly review and update permissions'
          ]
        },
        {
          id: 'sec-3',
          title: 'Enable Encryption',
          description: 'Configure encryption for data in transit and at rest.',
          action: 'Set up encryption protocols and key management.',
          result: 'All sensitive data is encrypted and protected.',
          tips: [
            'Use industry-standard encryption algorithms',
            'Rotate encryption keys regularly',
            'Ensure end-to-end encryption for sensitive data'
          ]
        },
        {
          id: 'sec-4',
          title: 'Monitor Threats',
          description: 'Set up threat detection and security monitoring.',
          action: 'Configure security monitoring and alert systems.',
          result: 'Security threats are detected and responded to quickly.',
          tips: [
            'Set up alerts for suspicious activities',
            'Monitor for unusual access patterns',
            'Regular security scans and assessments'
          ]
        }
      ],
      prerequisites: ['Security infrastructure', 'Access management setup'],
      benefits: ['Data protection', 'Access control', 'Threat detection', 'Compliance assurance'],
      useCases: ['Access management', 'Data protection', 'Threat monitoring', 'Security compliance']
    },
    {
      id: 'compliance',
      title: 'Compliance',
      subtitle: 'Regulatory reports',
      description: 'Automated compliance monitoring and reporting for major regulations including GDPR, HIPAA, SOC 2, and industry standards.',
      icon: <CheckCircle size={24} />,
      color: '#6366f1',
      path: '/control-plane/compliance',
      steps: [
        {
          id: 'comp-1',
          title: 'Select Regulations',
          description: 'Choose which regulations and standards to comply with.',
          action: 'Select GDPR, HIPAA, SOC 2, or custom standards.',
          result: 'Compliance monitoring is configured for your requirements.',
          tips: [
            'Choose all relevant regulations for your industry',
            'Configure custom compliance rules if needed',
            'Document compliance requirements and mappings'
          ]
        },
        {
          id: 'comp-2',
          title: 'Map Controls',
          description: 'Map your controls to compliance requirements.',
          action: 'Connect your governance controls to compliance frameworks.',
          result: 'Compliance controls are linked to regulatory requirements.',
          tips: [
            'Use standard control frameworks where possible',
            'Document control effectiveness',
            'Regularly test control compliance'
          ]
        },
        {
          id: 'comp-3',
          title: 'Monitor Compliance',
          description: 'Track compliance status and generate reports.',
          action: 'Monitor compliance metrics and generate required reports.',
          result: 'You have real-time compliance visibility and documentation.',
          tips: [
            'Set up automated compliance reporting',
            'Track compliance trends over time',
            'Investigate compliance gaps quickly'
          ]
        },
        {
          id: 'comp-4',
          title: 'Audit Readiness',
          description: 'Prepare for and manage compliance audits.',
          action: 'Generate audit reports and evidence for regulators.',
          result: 'You are always prepared for compliance audits.',
          tips: [
            'Maintain audit trails automatically',
            'Practice mock audits regularly',
            'Keep evidence organized and accessible'
          ]
        }
      ],
      prerequisites: ['Compliance framework setup', 'Regulatory requirements'],
      benefits: ['Regulatory compliance', 'Audit readiness', 'Risk reduction', 'Customer trust'],
      useCases: ['Regulatory reporting', 'Audit preparation', 'Compliance monitoring', 'Risk management']
    },
    {
      id: 'business',
      title: 'Business',
      subtitle: 'Business metrics',
      description: 'Business intelligence and metrics for AI operations including ROI analysis, cost tracking, and value measurement.',
      icon: <TrendingUp size={24} />,
      color: '#f97316',
      path: '/control-plane/business',
      steps: [
        {
          id: 'biz-1',
          title: 'Define KPIs',
          description: 'Set up business KPIs and success metrics.',
          action: 'Configure ROI, cost, and value metrics.',
          result: 'Business metrics tracking is configured for your AI operations.',
          tips: [
            'Include both leading and lagging indicators',
            'Set baseline measurements before AI deployment',
            'Configure automated KPI calculations'
          ]
        },
        {
          id: 'biz-2',
          title: 'Track Costs',
          description: 'Monitor and analyze AI operational costs.',
          action: 'Track infrastructure, personnel, and operational costs.',
          result: 'You have complete visibility into AI costs.',
          tips: [
            'Categorize costs by function and service',
            'Track cost trends and anomalies',
            'Compare costs against business value generated'
          ]
        },
        {
          id: 'biz-3',
          title: 'Measure ROI',
          description: 'Calculate and analyze return on investment.',
          action: 'Generate ROI analysis and business impact reports.',
          result: 'You understand the business value of your AI investments.',
          tips: [
            'Include both direct and indirect benefits',
            'Use industry-standard ROI calculation methods',
            'Track ROI over multiple time periods'
          ]
        },
        {
          id: 'biz-4',
          title: 'Optimize Value',
          description: 'Optimize AI operations for maximum business value.',
          action: 'Use insights to improve efficiency and effectiveness.',
          result: 'AI operations deliver maximum business value.',
          tips: [
            'Focus on high-impact optimization opportunities',
            'Balance cost reduction with capability enhancement',
            'Regularly review and adjust business metrics'
          ]
        }
      ],
      prerequisites: ['Business metrics setup', 'Cost tracking configuration'],
      benefits: ['ROI visibility', 'Cost optimization', 'Value measurement', 'Business insights'],
      useCases: ['Financial planning', 'Investment decisions', 'Performance evaluation', 'Strategic planning']
    }
  ];

  const toggleFunction = (functionId: string) => {
    setExpandedFunction(expandedFunction === functionId ? null : functionId);
  };

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const handleStartFunction = (path: string) => {
    navigate(path);
  };

  return (
    <div className={styles.controlPlaneGuide}>
      {/* Header */}
      <div className={styles.guideHeader}>
        <div className={styles.headerContent}>
          <BookOpen className={styles.headerIcon} size={32} />
          <div className={styles.headerText}>
            <h1 className={styles.guideTitle}>Control Plane Guide</h1>
            <p className={styles.guideSubtitle}>
              Step-by-step instructions for mastering the ResonantGenesis Control Plane
            </p>
            <p className={styles.guideDescription}>
              Learn how to use each control plane function with detailed guides based on real-world usage patterns 
              and database insights. Track your progress as you complete each step.
            </p>
          </div>
        </div>
      </div>

      {/* Functions Grid */}
      <div className={styles.functionsGrid}>
        {functionGuides.map((func) => (
          <div
            key={func.id}
            className={`${styles.functionCard} ${expandedFunction === func.id ? styles.expanded : ''}`}
            style={{ '--function-color': func.color } as React.CSSProperties}
          >
            <div className={styles.functionHeader}>
              <div className={styles.functionIcon} style={{ color: func.color }}>
                {func.icon}
              </div>
              <div className={styles.functionTitleSection}>
                <h3 className={styles.functionTitle}>{func.title}</h3>
                <p className={styles.functionSubtitle}>{func.subtitle}</p>
              </div>
              <button
                className={styles.expandButton}
                onClick={() => toggleFunction(func.id)}
              >
                {expandedFunction === func.id ? '−' : '+'}
              </button>
            </div>

            <p className={styles.functionDescription}>{func.description}</p>

            {expandedFunction === func.id && (
              <div className={styles.functionDetails}>
                {/* Prerequisites */}
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <AlertTriangle size={16} className={styles.sectionIcon} />
                    Prerequisites
                  </h4>
                  <ul className={styles.sectionList}>
                    {func.prerequisites.map((prereq, index) => (
                      <li key={index} className={styles.sectionItem}>
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <Target size={16} className={styles.sectionIcon} />
                    Benefits
                  </h4>
                  <ul className={styles.sectionList}>
                    {func.benefits.map((benefit, index) => (
                      <li key={index} className={styles.sectionItem}>
                        <Check size={16} className={styles.checkIcon} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Use Cases */}
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <Users size={16} className={styles.sectionIcon} />
                    Use Cases
                  </h4>
                  <ul className={styles.sectionList}>
                    {func.useCases.map((useCase, index) => (
                      <li key={index} className={styles.sectionItem}>
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step-by-Step Guide */}
                <div className={styles.stepsSection}>
                  <h4 className={styles.sectionTitle}>
                    <Play size={16} className={styles.sectionIcon} />
                    Step-by-Step Guide
                  </h4>
                  <div className={styles.stepsList}>
                    {func.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`${styles.stepCard} ${completedSteps.has(step.id) ? styles.completed : ''}`}
                      >
                        <div className={styles.stepHeader}>
                          <div className={styles.stepNumber}>
                            {completedSteps.has(step.id) ? <Check size={16} /> : index + 1}
                          </div>
                          <div className={styles.stepContent}>
                            <h5 className={styles.stepTitle}>{step.title}</h5>
                            <p className={styles.stepDescription}>{step.description}</p>
                          </div>
                          <button
                            className={styles.stepToggle}
                            onClick={() => toggleStep(step.id)}
                          >
                            {completedSteps.has(step.id) ? '✓' : '○'}
                          </button>
                        </div>

                        <div className={styles.stepDetails}>
                          <div className={styles.stepAction}>
                            <strong>Action:</strong> {step.action}
                          </div>
                          <div className={styles.stepResult}>
                            <strong>Result:</strong> {step.result}
                          </div>
                          {step.tips.length > 0 && (
                            <div className={styles.stepTips}>
                              <strong>Tips:</strong>
                              <ul>
                                {step.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className={styles.functionActions}>
                  <button
                    className={styles.startButton}
                    onClick={() => handleStartFunction(func.path)}
                    style={{ backgroundColor: func.color }}
                  >
                    <Play size={16} />
                    Start {func.title}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className={styles.progressSection}>
        <h2 className={styles.progressTitle}>Your Progress</h2>
        <div className={styles.progressGrid}>
          {functionGuides.map((func) => {
            const funcSteps = func.steps.length;
            const completedFuncSteps = func.steps.filter(step => completedSteps.has(step.id)).length;
            const progressPercentage = (completedFuncSteps / funcSteps) * 100;
            
            return (
              <div key={func.id} className={styles.progressCard}>
                <div className={styles.progressHeader}>
                  <div className={styles.progressIcon} style={{ color: func.color }}>
                    {func.icon}
                  </div>
                  <div className={styles.progressInfo}>
                    <h4>{func.title}</h4>
                    <p>{completedFuncSteps}/{funcSteps} steps completed</p>
                  </div>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${progressPercentage}%`, backgroundColor: func.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ControlPlaneGuide;
