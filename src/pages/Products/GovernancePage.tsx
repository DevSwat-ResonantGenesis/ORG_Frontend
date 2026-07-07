import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Lock, AlertTriangle, FileCheck, ArrowRight,
  Layers, Eye, Zap, RotateCcw, Scale
} from 'lucide-react';

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

const GovernancePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>RARA Governance — AI Safety, Kill Switch, Compliance | DevSwat</title>
        <meta name="description" content="RARA: Resonant Autonomous Runtime Architecture. Invariant enforcement, capability decay, kill switch, atomic mutations with rollback, EU AI Act and SOC2 compliance, cryptographic receipts." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/governance" />
        <meta property="og:title" content="RARA Governance — AI Safety & Compliance" />
        <meta property="og:description" content="Invariant enforcement, capability decay, kill switch, compliance profiles, cryptographic receipts." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/governance" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Shield size={14} /> RARA Governance</div>
        <h1 style={s.h1}>AI That Can't<br />Go Rogue</h1>
        <p style={s.lead}>
          RARA — Resonant Autonomous Runtime Architecture. The governance layer that ensures
          every agent stays within bounds. Invariant enforcement, capability decay, kill switch,
          and compliance verification baked into the platform core.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Core Governance Systems</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Invariant Engine</div>
            <div style={s.cardText}>Graph constraint enforcement via AST Analysis. Structural, semantic, and temporal invariant classes. If invariants break, mutations are rejected.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> Capability Engine</div>
            <div style={s.cardText}>Capabilities can only decay, never expand autonomously. No agent may grant itself new authority. Trust scoring with time-based decay.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><AlertTriangle size={16} color="#818cf8" /> Kill Switch</div>
            <div style={s.cardText}>Global emergency freeze, stop, or reset. Deterministic bridge from physics state to governance actions. Instant system-wide halt.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><RotateCcw size={16} color="#818cf8" /> Atomic Mutations</div>
            <div style={s.cardText}>Every state change is an atomic mutation with snapshot rollback. Pre/post conditions verified. Blast radius calculated before execution.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><FileCheck size={16} color="#818cf8" /> Compliance Verifier</div>
            <div style={s.cardText}>EU AI Act and SOC2 compliance profiles: minimal, standard, strict. Explainability artifacts generated for every governance decision.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> Cryptographic Receipts</div>
            <div style={s.cardText}>Tamper-proof receipts for all mutations. Quorum authority for critical decisions. Epoch-based governance windows.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Advanced Systems</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Eye size={16} color="#818cf8" /> Physics Governance Bridge</div>
            <div style={s.cardText}>Deterministic bridge from Hash Sphere physics state to governance actions. Collapse risk monitoring, entropy thresholds trigger governance responses.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Scale size={16} color="#818cf8" /> DISD Protocol</div>
            <div style={s.cardText}>Enhanced Distributed Identity with Secure Dispatch. Cryptographic identity verification, quorum-based authority, pre-authorization gates.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Snapshot Engine</div>
            <div style={s.cardText}>Full system state snapshots at any point. Restore to any previous state. Compare states across snapshots for drift detection.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/enterprise')}>
          Enterprise Governance <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default GovernancePage;
