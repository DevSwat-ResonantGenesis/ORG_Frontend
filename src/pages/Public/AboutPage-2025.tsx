import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { goToSignup, goToContact } from '../../utils/navigation';
import styles from '../Help/HelpCenterPage.module.css';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const capabilities = [
    {
      title: 'Every Action, On Record',
      description: 'Not just logging — governed execution. Every action is evaluated against your policies before it runs. Pass, flag, or block in milliseconds.',
      tags: ['governance', 'real-time', 'audit']
    },
    {
      title: 'One Platform, Any AI',
      description: 'Use GPT-4, Claude, Gemini, Mistral, or Groq — all through one interface, with consistent governance regardless of provider.',
      tags: ['multi-provider', 'no lock-in']
    },
    {
      title: 'AI That Earns Trust',
      description: 'New agents start restricted. As they prove reliable, they earn more autonomy. Misbehave? Permissions revoked automatically.',
      tags: ['trust tiers', 'safety']
    },
    {
      title: 'Explain Any Decision',
      description: 'Every AI decision links back to its inputs, reasoning, and policies. Full causal chain for auditors and debugging.',
      tags: ['explainability', 'compliance']
    }
  ];

  const values = [
    {
      title: 'Prevention, Not Detection',
      description: "We don't log bad actions — we prevent them. Policies are enforced before execution, not reviewed after damage is done.",
      tags: ['core']
    },
    {
      title: 'Prove Everything',
      description: "Every execution is cryptographically signed. Not 'trust us' — verify it yourself. Tamper-proof by architecture.",
      tags: ['core']
    },
    {
      title: 'Built for Scale',
      description: "This isn't a prototype. 150+ production APIs, horizontal scaling, and architecture designed for enterprise workloads from day one.",
      tags: ['enterprise']
    }
  ];

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>We're Making Autonomous AI Safe for Production</h1>
          <p className={styles.subtitle}>
            ResonantGenesis was founded on a simple belief: AI should be able to act autonomously, 
            but every action should be verifiable, auditable, and controllable.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Mission Section */}
            <section className={styles.contentSection}>
              <h2>The Problem With AI Today</h2>
              <div className={styles.articleCard} style={{ cursor: 'default', marginBottom: '24px' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.7', margin: 0 }}>
                  Current AI systems face a fundamental tension: <strong>give AI autonomy and lose control</strong>, 
                  or <strong>keep human-in-the-loop and limit scale</strong>. Enterprises need AI that can act 
                  independently — but they also need audit trails, compliance, and the ability to explain every decision.
                  <br /><br />
                  Until now, these were tradeoffs. <strong>We built ResonantGenesis to eliminate them.</strong>
                </p>
              </div>

              <h2>What We Actually Built</h2>
              <div className={styles.articleGrid}>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h3>Governance Layer</h3>
                  <p>
                    A real-time policy engine that evaluates every AI action before it executes. 
                    Not logging after the fact — enforcement before the action runs.
                  </p>
                </div>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h3>Execution Ledger</h3>
                  <p>
                    Blockchain-anchored proof of every AI decision. Immutable, queryable, 
                    and designed for regulatory compliance.
                  </p>
                </div>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h3>Identity Protocol (DSID-P)</h3>
                  <p>
                    Cryptographic identity for every agent and user. No anonymous AI. 
                    Every action is attributable and traceable.
                  </p>
                </div>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h3>Semantic Memory (Hash Sphere)</h3>
                  <p>
                    3D semantic memory that persists across sessions and models. 
                    Your AI actually remembers and learns from context.
                  </p>
                </div>
              </div>
            </section>

            {/* Capabilities Section */}
            <section className={styles.contentSection}>
              <h2>Core Capabilities</h2>
              <div className={styles.articleGrid}>
                {capabilities.map((capability, idx) => (
                  <div key={idx} className={styles.articleCard} style={{ cursor: 'default' }}>
                    <h3>{capability.title}</h3>
                    <p>{capability.description}</p>
                    <div className={styles.articleTags}>
                      {capability.tags.map(tag => (
                        <span key={tag} className={styles.articleTag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Values Section */}
            <section className={styles.contentSection}>
              <h2>Design Principles</h2>
              <div className={styles.articleGrid}>
                {values.map((value, idx) => (
                  <div key={idx} className={styles.articleCard} style={{ cursor: 'default' }}>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                    <div className={styles.articleTags}>
                      {value.tags.map(tag => (
                        <span key={tag} className={styles.articleTag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>Platform Stats</h3>
              <ul>
                <li>150+ API endpoints</li>
                <li>22 microservices</li>
                <li>99.9% uptime SLA</li>
                <li>&lt;100ms governance latency</li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Security & Compliance</h3>
              <ul>
                <li>SOC2 Type II ready</li>
                <li>GDPR compliant</li>
                <li>HIPAA ready</li>
                <li>End-to-end encryption</li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Explore the System</h3>
              <p>
                See governed AI execution in action. View the live ledger and control plane.
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/control-plane')}>
                Open Control Plane
              </Button>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Enterprise Inquiry</h3>
              <p>
                Deploying governed AI at scale? Let's discuss your requirements.
              </p>
              <Button variant="secondary" size="sm" fullWidth onClick={() => goToContact(navigate)}>
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

