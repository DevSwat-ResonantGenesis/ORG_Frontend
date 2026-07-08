import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 3rem' },
  h2: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' },
  p: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1rem' },
  code: { background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', whiteSpace: 'pre' as const, overflowX: 'auto' as const, marginBottom: '1.5rem', display: 'block' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' },
  cardText: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto 3rem', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '2rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const GovernanceProtocolPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Governance Protocol — RARA Invariants, Capability Grammar | DevSwat Docs</title>
        <meta name="description" content="RARA governance protocol: invariant classes (structural, semantic, temporal), capability grammar, trust scoring with decay, mutation executor, compliance profiles (minimal/standard/strict)." />
        <link rel="canonical" href="https://dev-swat.com/docs/governance-protocol" />
        <meta property="og:title" content="RARA Governance Protocol — DevSwat Docs" />
        <meta property="og:description" content="Invariant classes, capability grammar, trust scoring, mutation executor." />
        <meta property="og:url" content="https://dev-swat.com/docs/governance-protocol" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Shield size={14} /> Governance Protocol</div>
        <h1 style={s.h1}>RARA Governance Protocol</h1>
        <p style={s.lead}>Invariant enforcement, capability decay, mutation executor, and compliance profiles.</p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Invariant Classes</h2>
        <div style={s.grid}>
          {[
            { t: 'Structural', d: 'Graph topology constraints. Node degree limits, edge type restrictions, connectivity requirements.' },
            { t: 'Semantic', d: 'Meaning-preserving constraints. Trust bounds, capability limits, identity uniqueness.' },
            { t: 'Temporal', d: 'Time-ordered constraints. Causality, sequence requirements, cooldown periods.' },
          ].map(inv => (
            <div key={inv.t} style={s.card}>
              <div style={s.cardTitle}>{inv.t}</div>
              <div style={s.cardText}>{inv.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Capability Grammar</h2>
        <code style={s.code}>{`Capability Grammar (YAML):
  agent.create:
    max_trust: 0.8
    requires: [authenticated, plan.plus]
    decay_rate: 0.01/hour
    
  agent.execute.unbounded:
    max_trust: 1.0
    requires: [authenticated, plan.enterprise, governance.approved]
    decay_rate: 0.005/hour
    
  system.kill_switch:
    max_trust: 1.0
    requires: [owner]
    decay_rate: 0

Key Rule: Capabilities can ONLY decay, never expand.
An agent cannot grant itself new authority.`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Mutation Executor</h2>
        <p style={s.p}>Every state change goes through the mutation executor:</p>
        <code style={s.code}>{`Mutation Flow:
  1. Pre-conditions checked (invariants, capabilities, trust)
  2. Blast radius calculated (affected nodes, edges, services)
  3. Snapshot taken (for rollback)
  4. Mutation applied atomically
  5. Post-conditions verified
  6. Cryptographic receipt generated
  7. Recorded on audit chain

If ANY step fails → automatic rollback to snapshot.`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Compliance Profiles</h2>
        <div style={s.grid}>
          {[
            { t: 'Minimal', d: 'Basic logging. No explainability artifacts. For development/testing.' },
            { t: 'Standard', d: 'Full audit trail. Explainability artifacts for major decisions. SOC2-compatible.' },
            { t: 'Strict', d: 'Full compliance. EU AI Act artifacts. Every decision explained. Pre-approval for critical actions.' },
          ].map(p => (
            <div key={p.t} style={s.card}>
              <div style={s.cardTitle}>{p.t}</div>
              <div style={s.cardText}>{p.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/products/governance')}>
          RARA Overview <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default GovernanceProtocolPage;
