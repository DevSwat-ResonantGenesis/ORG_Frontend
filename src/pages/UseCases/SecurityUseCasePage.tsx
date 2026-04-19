import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileCheck, Search, ArrowRight, Eye, AlertTriangle } from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 4rem' },
  h2: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const SecurityUseCasePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>DevSwat for Security — SAST Scanning, Governance &amp; Compliance</title>
        <meta name="description" content="How security teams use DevSwat: AST/SAST code scanning, RARA governance with invariant enforcement, immutable audit chains, EU AI Act and SOC2 compliance profiles, dead code detection." />
        <link rel="canonical" href="https://dev-swat.com/use-cases/security" />
        <meta property="og:title" content="DevSwat for Security" />
        <meta property="og:description" content="SAST scanning, RARA governance, immutable audit chains, EU AI Act and SOC2 compliance." />
        <meta property="og:url" content="https://dev-swat.com/use-cases/security" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Shield size={14} /> For Security</div>
        <h1 style={s.h1}>AI-Powered Security<br />That Never Sleeps</h1>
        <p style={s.lead}>
          AST/SAST scanning catches vulnerabilities in Python, JavaScript, and TypeScript.
          RARA governance enforces security invariants. Immutable blockchain audit trails for compliance.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Security Workflows</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Search size={16} color="#818cf8" /> SAST Scanning</div>
            <div style={s.cardText}>Scan GitHub repos or uploaded archives. AST-based analysis finds dead code, dependency issues, architectural drift, and security antipatterns.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Invariant Enforcement</div>
            <div style={s.cardText}>Define structural, semantic, and temporal invariants. RARA rejects any mutation that would violate them. Agents can't bypass security rules.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><FileCheck size={16} color="#818cf8" /> Compliance Reporting</div>
            <div style={s.cardText}>EU AI Act and SOC2 compliance profiles. Automatic explainability artifacts. Exportable audit logs with cryptographic receipts.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> Blockchain Audit Trail</div>
            <div style={s.cardText}>Every agent action, state change, and governance decision recorded on internal blockchain with DSID-P provenance. Tamper-proof.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><AlertTriangle size={16} color="#818cf8" /> Kill Switch</div>
            <div style={s.cardText}>Global emergency stop for all agents. Freeze state, stop execution, or full reset. Blast radius analysis before any mutation.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Eye size={16} color="#818cf8" /> Governance Reports</div>
            <div style={s.cardText}>Reachability contracts verify code paths. Drift detection catches architectural violations. Multi-project comparison across repos.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/code-visualizer')}>
          Try SAST Scanning <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default SecurityUseCasePage;
