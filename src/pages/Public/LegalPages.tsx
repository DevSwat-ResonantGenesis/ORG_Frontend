import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, ChevronRight, Shield, FileText, Lock, Scale } from 'lucide-react';

type LegalPageType = 'terms' | 'privacy' | 'security' | 'compliance';

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)',
    color: '#fff',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 3rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#666',
    marginBottom: '2rem',
  },
  breadcrumbLink: {
    color: '#888',
    cursor: 'pointer',
  },
  header: {
    marginBottom: '3rem',
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  lastUpdated: {
    fontSize: '0.875rem',
    color: '#888',
  },
  content: {
    fontSize: '0.95rem',
    color: '#aaa',
    lineHeight: 1.8,
  },
  section: {
    marginBottom: '2.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '1rem',
  },
  paragraph: {
    marginBottom: '1rem',
  },
  list: {
    paddingLeft: '1.5rem',
    marginBottom: '1rem',
  },
  listItem: {
    marginBottom: '0.5rem',
  },
  highlight: {
    padding: '1.25rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  highlightTitle: {
    fontWeight: '600',
    color: '#a5b4fc',
    marginBottom: '0.5rem',
  },
  footer: {
    marginTop: '4rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.875rem',
    color: '#666',
  },
  footerLink: {
    color: '#6366f1',
    cursor: 'pointer',
  },
};

const pageConfig: Record<LegalPageType, { icon: React.ReactNode; color: string; title: string; lastUpdated: string }> = {
  terms: { icon: <FileText size={28} />, color: '#6366f1', title: 'Terms of Service', lastUpdated: 'December 15, 2024' },
  privacy: { icon: <Lock size={28} />, color: '#10b981', title: 'Privacy Policy', lastUpdated: 'December 15, 2024' },
  security: { icon: <Shield size={28} />, color: '#f59e0b', title: 'Security', lastUpdated: 'December 10, 2024' },
  compliance: { icon: <Scale size={28} />, color: '#8b5cf6', title: 'Compliance', lastUpdated: 'December 1, 2024' },
};

const TermsContent = () => (
  <>
    <div style={styles.highlight}>
      <div style={styles.highlightTitle}>Summary</div>
      <p>By using ResonantGenesis, you agree to these terms. We provide AI agent building tools, and you're responsible for how you use them.</p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
      <p style={styles.paragraph}>
        By accessing or using ResonantGenesis ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
        If you disagree with any part of the terms, you may not access the Service.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>2. Description of Service</h2>
      <p style={styles.paragraph}>
        ResonantGenesis provides a platform for building, deploying, and managing autonomous AI agents. 
        Our services include:
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>AI agent creation and configuration tools</li>
        <li style={styles.listItem}>Workflow automation builder</li>
        <li style={styles.listItem}>Agent marketplace for publishing and discovery</li>
        <li style={styles.listItem}>API access for programmatic control</li>
        <li style={styles.listItem}>Analytics and monitoring dashboards</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>3. User Accounts</h2>
      <p style={styles.paragraph}>
        You are responsible for safeguarding your account credentials and for any activities under your account. 
        You must notify us immediately of any unauthorized access or security breach.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>4. Acceptable Use</h2>
      <p style={styles.paragraph}>You agree not to use the Service to:</p>
      <ul style={styles.list}>
        <li style={styles.listItem}>Violate any laws or regulations</li>
        <li style={styles.listItem}>Generate harmful, abusive, or illegal content</li>
        <li style={styles.listItem}>Infringe on intellectual property rights</li>
        <li style={styles.listItem}>Distribute malware or engage in hacking activities</li>
        <li style={styles.listItem}>Attempt to gain unauthorized access to our systems</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>5. Intellectual Property</h2>
      <p style={styles.paragraph}>
        You retain ownership of content you create using our Service. We retain ownership of the Service itself, 
        including all software, designs, and documentation.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>6. Payment Terms</h2>
      <p style={styles.paragraph}>
        Paid subscriptions are billed in advance on a monthly or annual basis. Refunds are available within 14 days 
        of initial purchase. Token purchases are non-refundable once used.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>7. Limitation of Liability</h2>
      <p style={styles.paragraph}>
        ResonantGenesis shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
        resulting from your use of the Service.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>8. Contact</h2>
      <p style={styles.paragraph}>
        For questions about these Terms, please contact us at legal@resonantgenesis.com
      </p>
    </div>
  </>
);

const PrivacyContent = () => (
  <>
    <div style={styles.highlight}>
      <div style={styles.highlightTitle}>Summary</div>
      <p>We collect minimal data necessary to provide our services. We never sell your data. You control your data and can request deletion at any time.</p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>1. Information We Collect</h2>
      <p style={styles.paragraph}>We collect information you provide directly:</p>
      <ul style={styles.list}>
        <li style={styles.listItem}>Account information (name, email, password)</li>
        <li style={styles.listItem}>Payment information (processed by Stripe)</li>
        <li style={styles.listItem}>Agent configurations and content</li>
        <li style={styles.listItem}>Usage data and analytics</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>2. How We Use Your Information</h2>
      <ul style={styles.list}>
        <li style={styles.listItem}>To provide and maintain our Service</li>
        <li style={styles.listItem}>To process payments and send billing information</li>
        <li style={styles.listItem}>To send important updates about the Service</li>
        <li style={styles.listItem}>To improve our products and user experience</li>
        <li style={styles.listItem}>To detect and prevent fraud or abuse</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>3. Data Sharing</h2>
      <p style={styles.paragraph}>
        We do not sell your personal information. We may share data with:
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>Service providers (hosting, payment processing)</li>
        <li style={styles.listItem}>LLM providers when executing agents (with your consent)</li>
        <li style={styles.listItem}>Law enforcement when legally required</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>4. Data Retention</h2>
      <p style={styles.paragraph}>
        We retain your data for as long as your account is active. You can request deletion of your data at any time 
        by contacting support or using the account settings.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>5. Your Rights</h2>
      <p style={styles.paragraph}>You have the right to:</p>
      <ul style={styles.list}>
        <li style={styles.listItem}>Access your personal data</li>
        <li style={styles.listItem}>Correct inaccurate data</li>
        <li style={styles.listItem}>Request deletion of your data</li>
        <li style={styles.listItem}>Export your data</li>
        <li style={styles.listItem}>Opt out of marketing communications</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>6. Cookies</h2>
      <p style={styles.paragraph}>
        We use essential cookies for authentication and security. Analytics cookies are optional and can be 
        disabled in your browser settings.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>7. Contact</h2>
      <p style={styles.paragraph}>
        For privacy questions, contact our Data Protection Officer at privacy@resonantgenesis.com
      </p>
    </div>
  </>
);

const SecurityContent = () => (
  <>
    <div style={styles.highlight}>
      <div style={styles.highlightTitle}>Our Commitment</div>
      <p>Security is our top priority. We implement industry-leading security measures to protect your data and agents.</p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Infrastructure Security</h2>
      <ul style={styles.list}>
        <li style={styles.listItem}>All data encrypted at rest (AES-256) and in transit (TLS 1.3)</li>
        <li style={styles.listItem}>Infrastructure hosted on AWS with SOC 2 compliance</li>
        <li style={styles.listItem}>Regular security audits and penetration testing</li>
        <li style={styles.listItem}>DDoS protection and Web Application Firewall</li>
        <li style={styles.listItem}>Multi-region redundancy for high availability</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Application Security</h2>
      <ul style={styles.list}>
        <li style={styles.listItem}>Secure authentication with MFA support</li>
        <li style={styles.listItem}>Role-based access control (RBAC)</li>
        <li style={styles.listItem}>API keys with granular permissions</li>
        <li style={styles.listItem}>Audit logs for all actions</li>
        <li style={styles.listItem}>Automated vulnerability scanning</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Agent Execution Security</h2>
      <ul style={styles.list}>
        <li style={styles.listItem}>Sandboxed execution environment</li>
        <li style={styles.listItem}>Resource limits and timeouts</li>
        <li style={styles.listItem}>Content filtering and safety rules</li>
        <li style={styles.listItem}>Network isolation between agents</li>
      </ul>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Bug Bounty Program</h2>
      <p style={styles.paragraph}>
        We run a bug bounty program to reward security researchers who help us identify vulnerabilities. 
        Contact security@resonantgenesis.com to participate.
      </p>
    </div>
  </>
);

const ComplianceContent = () => (
  <>
    <div style={styles.highlight}>
      <div style={styles.highlightTitle}>Certifications</div>
      <p>ResonantGenesis is committed to meeting the highest compliance standards for enterprise customers.</p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>SOC 2 Type II</h2>
      <p style={styles.paragraph}>
        We have achieved SOC 2 Type II certification, demonstrating our commitment to security, availability, 
        processing integrity, confidentiality, and privacy.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>GDPR</h2>
      <p style={styles.paragraph}>
        We are fully compliant with the General Data Protection Regulation (GDPR). We provide tools for data 
        export, deletion, and consent management.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>CCPA</h2>
      <p style={styles.paragraph}>
        We comply with the California Consumer Privacy Act (CCPA), giving California residents additional 
        rights over their personal information.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>HIPAA</h2>
      <p style={styles.paragraph}>
        Enterprise customers requiring HIPAA compliance can sign a Business Associate Agreement (BAA). 
        Contact sales for details.
      </p>
    </div>

    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Data Processing Agreement</h2>
      <p style={styles.paragraph}>
        We offer Data Processing Agreements (DPAs) for enterprise customers. Contact legal@resonantgenesis.com 
        to request a DPA.
      </p>
    </div>
  </>
);

export default function LegalPages() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const pageType = (type as LegalPageType) || 'terms';
  const config = pageConfig[pageType] || pageConfig.terms;

  const renderContent = () => {
    switch (pageType) {
      case 'terms': return <TermsContent />;
      case 'privacy': return <PrivacyContent />;
      case 'security': return <SecurityContent />;
      case 'compliance': return <ComplianceContent />;
      default: return <TermsContent />;
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <div style={styles.logoIcon}>
            <Sparkles size={22} color="#fff" />
          </div>
          <span style={styles.logoText}>ResonantGenesis</span>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={14} />
          <span>Legal</span>
          <ChevronRight size={14} />
          <span>{config.title}</span>
        </div>

        <div style={styles.header}>
          <div style={{ ...styles.iconWrapper, background: `${config.color}20`, color: config.color }}>
            {config.icon}
          </div>
          <h1 style={styles.title}>{config.title}</h1>
          <p style={styles.lastUpdated}>Last updated: {config.lastUpdated}</p>
        </div>

        <div style={styles.content}>
          {renderContent()}
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Questions? Contact us at{' '}
            <span style={styles.footerLink} onClick={() => navigate('/contact')}>
              legal@resonantgenesis.com
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}

export { LegalPages as TermsPage };
export { LegalPages as PrivacyPage };
export { LegalPages as SecurityPage };
export { LegalPages as CompliancePage };
