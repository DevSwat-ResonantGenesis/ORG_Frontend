import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 56px)',
    background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    padding: '3rem 2rem',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#a5b4fc',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginBottom: '2rem',
    padding: 0,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '100px',
    fontSize: '0.8rem',
    color: '#a5b4fc',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  updated: {
    color: '#8b8fa3',
    fontSize: '0.85rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: '0.75rem',
    borderBottom: '1px solid rgba(99,102,241,0.2)',
    paddingBottom: '0.5rem',
  },
  text: {
    color: '#94a3b8',
    lineHeight: 1.8,
    fontSize: '0.95rem',
  },
  list: {
    color: '#94a3b8',
    lineHeight: 2,
    fontSize: '0.95rem',
    paddingLeft: '1.5rem',
  },
  contact: {
    background: 'rgba(99,102,241,0.05)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '2rem',
  },
};

const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={styles.header}>
          <div style={styles.badge}>
            <FileText size={14} /> Legal
          </div>
          <h1 style={styles.title}>Terms of Service</h1>
          <p style={styles.updated}>Last updated: April 7, 2026</p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p style={styles.text}>
            By accessing or using the ResonantGenesis platform ("Service"), operated at dev-swat.com and
            resonantgenesis.xyz, you agree to be bound by these Terms of Service ("Terms"). If you do not
            agree to these Terms, do not use the Service.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Description of Service</h2>
          <p style={styles.text}>
            ResonantGenesis provides an AI-powered platform that includes:
          </p>
          <ul style={styles.list}>
            <li>AI agent creation, management, and execution tools.</li>
            <li>Code analysis and visualization services (Code Visualizer).</li>
            <li>Conversational AI assistant (Resonant Chat).</li>
            <li>Third-party service integrations (Google Drive, Calendar, GitHub, etc.).</li>
            <li>Decentralized computing network and blockchain identity.</li>
            <li>Memory and knowledge management (Hash Sphere).</li>
            <li>IDE extensions and development tools.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. User Accounts</h2>
          <ul style={styles.list}>
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must notify us immediately of any unauthorized use of your account.</li>
            <li>You must be at least 18 years old to use the Service.</li>
            <li>One person or entity may not maintain more than one account.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Acceptable Use</h2>
          <p style={styles.text}>You agree not to:</p>
          <ul style={styles.list}>
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its systems.</li>
            <li>Upload malicious code, viruses, or harmful content.</li>
            <li>Use the Service to harass, abuse, or harm others.</li>
            <li>Reverse engineer, decompile, or attempt to extract source code from the Service.</li>
            <li>Use AI agents to perform actions that violate third-party terms of service.</li>
            <li>Exceed reasonable usage limits or abuse platform resources.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Third-Party Integrations</h2>
          <p style={styles.text}>
            The Service allows you to connect third-party services such as Google Drive, Google Calendar,
            Gmail, and GitHub. By connecting these services:
          </p>
          <ul style={styles.list}>
            <li>You authorize ResonantGenesis to access these services on your behalf within the permissions you grant.</li>
            <li>You remain subject to the third-party service's own terms and policies.</li>
            <li>We are not responsible for the availability, accuracy, or content of third-party services.</li>
            <li>You may disconnect any third-party service at any time.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Intellectual Property</h2>
          <p style={styles.text}>
            You retain ownership of all content you create or upload to the platform. By using the Service,
            you grant us a limited license to process and store your content solely for the purpose of
            providing the Service. We do not claim ownership of your code, documents, or data.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Credits and Billing</h2>
          <ul style={styles.list}>
            <li>Certain features require credits, which may be purchased or earned through platform participation.</li>
            <li>Credits are non-transferable and non-refundable unless required by law.</li>
            <li>We reserve the right to modify pricing with reasonable notice.</li>
            <li>Free tier features are subject to usage limits.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>8. AI-Generated Content</h2>
          <p style={styles.text}>
            The Service uses artificial intelligence to generate content, code, and recommendations.
            AI-generated output is provided "as-is" without warranty of accuracy, completeness, or fitness
            for a particular purpose. You are responsible for reviewing and validating any AI-generated
            content before use in production systems.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Limitation of Liability</h2>
          <p style={styles.text}>
            To the maximum extent permitted by law, ResonantGenesis shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, including but not limited to loss of
            profits, data, or business opportunities, arising from your use of the Service.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>10. Service Availability</h2>
          <p style={styles.text}>
            We strive to maintain high availability but do not guarantee uninterrupted access to the Service.
            We may perform maintenance, updates, or modifications that temporarily affect availability.
            We will provide reasonable notice for planned maintenance when possible.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>11. Termination</h2>
          <p style={styles.text}>
            We may suspend or terminate your account if you violate these Terms. You may terminate your
            account at any time by contacting us. Upon termination, your right to use the Service ceases
            immediately, though we may retain certain data as required by law.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>12. Changes to Terms</h2>
          <p style={styles.text}>
            We reserve the right to modify these Terms at any time. Material changes will be communicated
            via the platform or email. Continued use of the Service after changes constitutes acceptance
            of the updated Terms.
          </p>
        </div>

        <div style={styles.contact}>
          <h2 style={styles.sectionTitle}>13. Contact</h2>
          <p style={styles.text}>
            For questions about these Terms of Service, please contact us at:<br />
            <strong style={{ color: '#a5b4fc' }}>info@dev-swat.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
