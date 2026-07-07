import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, GitBranch, Shield, Lock, ArrowRight, Database, Layers, FileCheck } from 'lucide-react';

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

const DSIDPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>DSID-P — Decentralized State Identity Protocol | DevSwat</title>
        <meta name="description" content="DSID-P: Decentralized State Identity with Provenance. Custom blockchain protocol for agent identity, hash lineage tracking, merkle proofs, cryptographic receipts, and Base Sepolia anchoring." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/dsid" />
        <meta property="og:title" content="DSID-P — Decentralized State Identity Protocol" />
        <meta property="og:description" content="Custom blockchain protocol for agent identity, hash lineage, merkle proofs, and external anchoring." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/dsid" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Fingerprint size={14} /> DSID-P Protocol</div>
        <h1 style={s.h1}>Every State Has<br />a Provenance Trail</h1>
        <p style={s.lead}>
          DSID-P — Decentralized State Identity with Provenance. A custom blockchain protocol
          where every agent, every memory, every action has a cryptographically verifiable identity
          and lineage trail.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Protocol Features</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Fingerprint size={16} color="#818cf8" /> Digital State Identity</div>
            <div style={s.cardText}>Every entity on the platform gets a unique DSID. Agents, memories, transactions, governance decisions — all identifiable and traceable.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><GitBranch size={16} color="#818cf8" /> Hash Lineage</div>
            <div style={s.cardText}>Hash trees track the complete evolution of any state. Every modification creates a new hash linked to its parent. Full history preserved.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> Merkle Proofs</div>
            <div style={s.cardText}>Compact cryptographic proofs that a specific state exists in the chain. Verify without downloading the entire blockchain.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> Cryptographic Receipts</div>
            <div style={s.cardText}>Tamper-proof receipts for every state transition. Each receipt contains: hash, parent hash, timestamp, actor, action, and signature.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Database size={16} color="#818cf8" /> Identity Registry</div>
            <div style={s.cardText}>On-chain registry mapping DSIDs to entities. Crypto Identity Layer 4 integration for cross-service identity resolution.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Base Sepolia Anchoring</div>
            <div style={s.cardText}>Periodic merkle root published to Base Sepolia L2 for external verification. Internal chain integrity verifiable by anyone.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Use Cases</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><FileCheck size={16} color="#818cf8" /> Audit Compliance</div>
            <div style={s.cardText}>Every agent action recorded with DSID provenance. Complete audit trail for SOC2, EU AI Act, and regulatory requirements.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Agent Identity</div>
            <div style={s.cardText}>Agents anchored to blockchain identity. Verify which agent performed which action, when, and with what authority.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><GitBranch size={16} color="#818cf8" /> Memory Provenance</div>
            <div style={s.cardText}>Every memory write linked to its source. Trace any piece of AI-generated knowledge back to its origin.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/products/blockchain')}>
          Explore Blockchain Architecture <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default DSIDPage;
