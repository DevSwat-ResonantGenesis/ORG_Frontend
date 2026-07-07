import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, FileCheck, AlertTriangle, ArrowRight } from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 4rem' },
  h2: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' },
  p: { fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const SecurityPage: React.FC = () => {
  return (
    <div style={s.page}>
      <Helmet>
        <title>Security — Encryption, Auth, Governance &amp; Compliance | DevSwat</title>
        <meta name="description" content="DevSwat security: JWT auth with MFA/TOTP, AES memory encryption, blockchain audit trails, RARA governance with kill switch, HSTS, CORS lockdown, fail-closed middleware, SOC2/EU AI Act compliance." />
        <link rel="canonical" href="https://resonant.dev-swat.com/security" />
        <meta property="og:title" content="DevSwat Security" />
        <meta property="og:description" content="JWT/MFA auth, AES encryption, blockchain audit, RARA governance, compliance." />
        <meta property="og:url" content="https://resonant.dev-swat.com/security" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Shield size={14} /> Security</div>
        <h1 style={s.h1}>Security First.<br />Always.</h1>
        <p style={s.lead}>
          Every layer hardened. JWT with MFA, AES encryption, blockchain audit trails,
          RARA governance, and compliance profiles. Your data is yours.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Authentication & Access</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> JWT Authentication</div>
            <div style={s.cardText}>Every API request authenticated via JWT bearer tokens. Short-lived access tokens with refresh rotation. Fail-closed middleware — unauthenticated requests blocked.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> MFA / TOTP</div>
            <div style={s.cardText}>Multi-factor authentication with TOTP (Time-based One-Time Password). Compatible with Google Authenticator, Authy, and any TOTP app.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> OAuth Integration</div>
            <div style={s.cardText}>Google and GitHub OAuth for single sign-on. Scoped permissions. Token refresh handled automatically.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Data Protection</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> AES Encryption</div>
            <div style={s.cardText}>Per-user encryption keys for semantic memory. Data encrypted at rest in PostgreSQL. Decryption only in authenticated user context.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> TLS Everywhere</div>
            <div style={s.cardText}>Nginx TLS termination with Let's Encrypt. HSTS enabled. All inter-service communication within Docker internal network.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> CORS Lockdown</div>
            <div style={s.cardText}>Strict CORS policy. Only resonant.dev-swat.com origin allowed. No wildcard origins. Credentials require explicit allowlisting.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Governance & Compliance</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><AlertTriangle size={16} color="#818cf8" /> RARA Kill Switch</div>
            <div style={s.cardText}>Global emergency stop for all agents. Freeze, stop, or reset. Deterministic bridge from governance policy to system action.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><FileCheck size={16} color="#818cf8" /> Blockchain Audit Trail</div>
            <div style={s.cardText}>Every agent action, state change, and governance decision recorded on internal blockchain with DSID-P provenance and merkle proofs.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Compliance Profiles</div>
            <div style={s.cardText}>EU AI Act and SOC2 compliance modes. Automatic explainability artifacts. Exportable audit logs with cryptographic receipts.</div>
          </div>
        </div>
      </section>

      <section style={{ ...s.section, paddingTop: '2rem' }}>
        <h2 style={s.h2}>Responsible Disclosure</h2>
        <p style={s.p}>
          Found a security issue? Email <strong>security@resonant.dev-swat.com</strong>. We take all reports
          seriously and will respond within 48 hours.
        </p>
      </section>
    </div>
  );
};

export default SecurityPage;
