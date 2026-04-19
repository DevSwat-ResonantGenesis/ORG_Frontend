import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
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

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={styles.header}>
          <div style={styles.badge}>
            <Shield size={14} /> Legal
          </div>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.updated}>Last updated: April 7, 2026</p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Introduction</h2>
          <p style={styles.text}>
            DevSwat ("we," "our," or "us") operates the dev-swat.com and dev-swat.com platforms.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
            use our platform, including our AI agent creation tools, code analysis services, and integrated
            third-party connections.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Information We Collect</h2>
          <p style={styles.text}>We may collect the following types of information:</p>
          <ul style={styles.list}>
            <li><strong>Account Information:</strong> Name, email address, and authentication credentials when you create an account.</li>
            <li><strong>Profile Data:</strong> Organization details, role, and preferences you provide.</li>
            <li><strong>Usage Data:</strong> How you interact with our platform, including features used, pages visited, and actions taken.</li>
            <li><strong>Connected Service Data:</strong> When you connect third-party services (Google Drive, Google Calendar, GitHub, etc.),
              we store OAuth tokens to access those services on your behalf. We do not store your third-party passwords.</li>
            <li><strong>Content Data:</strong> Code repositories, documents, and files you upload or analyze through our platform.</li>
            <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers for security and analytics.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. How We Use Your Information</h2>
          <ul style={styles.list}>
            <li>Provide, maintain, and improve our platform and services.</li>
            <li>Authenticate your identity and manage your account.</li>
            <li>Connect to third-party services you authorize (Google Drive, Calendar, GitHub, etc.).</li>
            <li>Process AI agent creation, code analysis, and other platform features.</li>
            <li>Send important notifications about your account or our services.</li>
            <li>Detect, prevent, and address technical issues and security threats.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Third-Party Service Integrations</h2>
          <p style={styles.text}>
            Our platform allows you to connect third-party services such as Google Drive, Google Calendar,
            Gmail, GitHub, and others. When you connect these services:
          </p>
          <ul style={styles.list}>
            <li>We use OAuth 2.0 for secure authorization — we never see or store your third-party passwords.</li>
            <li>We store encrypted OAuth refresh tokens to maintain your connection.</li>
            <li>We only request the permissions (scopes) necessary for the features you use.</li>
            <li>You can disconnect any service at any time from your Connect Profiles settings.</li>
            <li>Disconnecting a service revokes our access and deletes the stored tokens.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Data Security</h2>
          <p style={styles.text}>
            We implement industry-standard security measures to protect your data, including:
            encryption at rest and in transit, secure token storage, access controls, and regular
            security audits. However, no method of electronic storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Data Retention</h2>
          <p style={styles.text}>
            We retain your personal information for as long as your account is active or as needed to
            provide you services. You may request deletion of your account and associated data at any
            time by contacting us.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Your Rights</h2>
          <ul style={styles.list}>
            <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
            <li><strong>Deletion:</strong> Request deletion of your data and account.</li>
            <li><strong>Portability:</strong> Request your data in a portable format.</li>
            <li><strong>Revoke Consent:</strong> Disconnect third-party services or withdraw consent at any time.</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Cookies</h2>
          <p style={styles.text}>
            We use essential cookies for authentication and session management. We do not use
            third-party tracking cookies. Session cookies are required for the platform to function.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Changes to This Policy</h2>
          <p style={styles.text}>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </div>

        <div style={styles.contact}>
          <h2 style={styles.sectionTitle}>10. Contact Us</h2>
          <p style={styles.text}>
            If you have questions about this Privacy Policy, please contact us at:<br />
            <strong style={{ color: '#a5b4fc' }}>info@dev-swat.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
