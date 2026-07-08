import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { GitBranch, ArrowRight } from 'lucide-react';

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

const CrossChainPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Cross-Chain Bridge — Atomic Swaps, HTLC, Light Clients | DevSwat Docs</title>
        <meta name="description" content="DevSwat cross-chain bridge: light clients for external chain verification, relay network for block headers, HTLC atomic swaps, multi-chain asset transfer. Ethereum, Bitcoin, Polygon, Solana support." />
        <link rel="canonical" href="https://dev-swat.com/docs/cross-chain" />
        <meta property="og:title" content="Cross-Chain Bridge — DevSwat Docs" />
        <meta property="og:description" content="Light clients, relay network, HTLC atomic swaps, multi-chain bridge." />
        <meta property="og:url" content="https://dev-swat.com/docs/cross-chain" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><GitBranch size={14} /> Cross-Chain Bridge</div>
        <h1 style={s.h1}>Cross-Chain Bridge Protocol</h1>
        <p style={s.lead}>Light clients, relay network, HTLC atomic swaps for multi-chain asset bridging.</p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Architecture</h2>
        <div style={s.grid}>
          {[
            { t: 'Light Clients', d: 'Minimal verification nodes for each target chain. Validate block headers and merkle proofs without full chain sync.' },
            { t: 'Relay Network', d: 'Nodes that relay block headers between chains. Decentralized — multiple relayers for redundancy.' },
            { t: 'Bridge Contracts', d: 'Lock/unlock contracts on each chain. Assets locked on source, minted on destination. Reversible.' },
            { t: 'HTLC Atomic Swaps', d: 'Hash Time-Locked Contracts. Trustless exchange between chains. Either both sides complete or neither does.' },
          ].map(c => (
            <div key={c.t} style={s.card}>
              <div style={s.cardTitle}>{c.t}</div>
              <div style={s.cardText}>{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Atomic Swap Flow</h2>
        <code style={s.code}>{`HTLC Atomic Swap:
  1. Alice locks tokens on Chain A with hash(secret) + timeout
  2. Bob sees lock, locks tokens on Chain B with same hash(secret) + shorter timeout
  3. Alice reveals secret to claim Bob's tokens on Chain B
  4. Bob uses revealed secret to claim Alice's tokens on Chain A

Safety:
  - If Alice never reveals: both locks expire, funds returned
  - Bob's timeout < Alice's timeout (prevents front-running)
  - Hash preimage proof ensures atomicity`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Supported Chains (Planned)</h2>
        <div style={s.grid}>
          {[
            { t: 'Ethereum', d: 'ERC-20 bridge. Smart contract lock/unlock.' },
            { t: 'Base (L2)', d: 'Primary target. Low fees. Current anchoring destination.' },
            { t: 'Polygon', d: 'EVM-compatible. MATIC bridge.' },
            { t: 'Solana', d: 'SPL token bridge. High throughput.' },
          ].map(chain => (
            <div key={chain.t} style={s.card}>
              <div style={s.cardTitle}>{chain.t}</div>
              <div style={s.cardText}>{chain.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/products/blockchain')}>
          Blockchain Overview <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default CrossChainPage;
