import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Database, Shield, GitBranch, Network, Lock, ArrowRight,
  Layers, FileCheck, Radio, Globe
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
  tag: { display: 'inline-block', padding: '3px 10px', background: 'rgba(99,102,241,0.15)', borderRadius: 6, fontSize: '0.75rem', color: '#a5b4fc', marginRight: 6, marginBottom: 4 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const BlockchainPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Three-Blockchain Architecture — Audit, Training &amp; Cross-Chain | DevSwat</title>
        <meta name="description" content="DevSwat runs three blockchains: internal DSID-P for audit logging and identity, sovereign external chain with Raft consensus for training gradients, and planned Base/ETH cross-chain bridge." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/blockchain" />
        <meta property="og:title" content="Three-Blockchain Architecture — DevSwat" />
        <meta property="og:description" content="Internal audit chain (DSID-P), sovereign external chain (Raft consensus), and cross-chain bridge." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/blockchain" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Database size={14} /> Blockchain</div>
        <h1 style={s.h1}>Three Chains.<br />Three Purposes.</h1>
        <p style={s.lead}>
          Not one blockchain forced to do everything. DevSwat runs three distinct chains — each
          purpose-built for its role: audit logging, training verification, and cross-chain bridging.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Internal Blockchain — DSID-P</h2>
        <p style={s.p}>Digital State Identity Protocol for agent identity, content hashing, and immutable audit trails.</p>
        <div style={s.grid}>
          {[
            { icon: <Shield size={16} color="#818cf8" />, t: 'DSID-P Identity', d: 'Decentralized State Identity with Provenance. Hash lineage tracking, merkle proofs, cryptographic receipts.' },
            { icon: <FileCheck size={16} color="#818cf8" />, t: 'Audit Chain', d: 'Immutable audit trail of all platform operations. Compliance tagging, export for SOC2/EU AI Act.' },
            { icon: <Layers size={16} color="#818cf8" />, t: 'Transaction Graph', d: 'BFS pathfinding, relationship edges. Full history of every agent action, memory write, and state change.' },
            { icon: <Lock size={16} color="#818cf8" />, t: 'Base Sepolia Anchoring', d: 'Periodic merkle root published to Base Sepolia L2. External verification of internal chain integrity.' },
          ].map(c => (
            <div key={c.t} style={s.card}>
              <div style={s.cardTitle}>{c.icon} {c.t}</div>
              <div style={s.cardText}>{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>External Blockchain — Sovereign Chain</h2>
        <p style={s.p}>Own distributed chain — not riding on Ethereum or any other network.</p>
        <div style={s.grid}>
          {[
            { icon: <Network size={16} color="#818cf8" />, t: 'Raft Consensus', d: 'Leader election, log replication, heartbeats. Battle-tested consensus for distributed agreement.' },
            { icon: <Radio size={16} color="#818cf8" />, t: 'P2P Gossip', d: 'TCP gossip protocol for block/transaction propagation. Peer discovery via Lighthouse bootstrap nodes.' },
            { icon: <Database size={16} color="#818cf8" />, t: 'Block Production', d: '10-second block time. Up to 100 transactions per block. Merkle tree validation. Fork handling with longest-chain rule.' },
            { icon: <GitBranch size={16} color="#818cf8" />, t: 'Transaction Types', d: 'transfer, set (state update), agent_action, training_gradient. Each recorded with full provenance.' },
          ].map(c => (
            <div key={c.t} style={s.card}>
              <div style={s.cardTitle}>{c.icon} {c.t}</div>
              <div style={s.cardText}>{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Cross-Chain Bridge (Planned)</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Globe size={16} color="#818cf8" /> Base/ETH Mainnet</div>
            <div style={s.cardText}>$RGT currently lives on the sovereign chain (chain ID: resonant-genesis-external-1). Base/ETH mainnet bridge planned as the network matures. Utility first, not speculation.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><GitBranch size={16} color="#818cf8" /> Cross-Chain Protocol</div>
            <div style={s.cardText}>Light clients, relay network, atomic swaps (HTLC). Bridge for multi-chain asset transfer when external chain reaches critical mass.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/network')}>
          View Network Dashboard <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default BlockchainPage;
