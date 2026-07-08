import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Database, Shield, Lock, ArrowRight, Layers } from 'lucide-react';

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
  cardTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto 3rem', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '2rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const BlockchainProtocolPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Blockchain Protocol — DSID-P, Merkle Trees, Block Format | DevSwat Docs</title>
        <meta name="description" content="DevSwat blockchain protocol documentation. DSID-P identity, block structure, merkle tree computation, CBOR encoding, audit chain, Base Sepolia anchoring. Two chains: internal + sovereign external." />
        <link rel="canonical" href="https://dev-swat.com/docs/blockchain-protocol" />
        <meta property="og:title" content="Blockchain Protocol — DevSwat Docs" />
        <meta property="og:description" content="DSID-P, block format, merkle trees, CBOR encoding, audit chain." />
        <meta property="og:url" content="https://dev-swat.com/docs/blockchain-protocol" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Database size={14} /> Blockchain Protocol</div>
        <h1 style={s.h1}>Blockchain Protocol Specification</h1>
        <p style={s.lead}>Internal chain for DSID-P audit logging. Sovereign external chain with Raft consensus.</p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Block Structure</h2>
        <code style={s.code}>{`{
  "index": 42,
  "timestamp": "2026-04-18T12:00:00Z",
  "previous_hash": "sha256:abc123...",
  "transactions": [...],
  "merkle_root": "sha256:def456...",
  "nonce": 0,
  "hash": "sha256:ghi789..."
}`}</code>
        <p style={s.p}>
          Each block contains: index, ISO timestamp, previous block hash (SHA-256), array of transactions,
          merkle root of all transactions, nonce, and block hash. Chain integrity verified by hash linkage.
        </p>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>DSID-P Identity</h2>
        <p style={s.p}>
          Decentralized State Identity with Provenance. Each entity gets a unique DSID composed of:
          type prefix + content hash + timestamp + creator signature.
        </p>
        <code style={s.code}>{`DSID Format: {type}:{sha256_hash}:{timestamp}:{signature}

Example:
  agent:a3f2b1c4d5e6....:1713446400:ed25519:sig...
  memory:7b8c9d0e1f2a....:1713446401:ed25519:sig...
  action:4e5f6a7b8c9d....:1713446402:ed25519:sig...`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Merkle Tree</h2>
        <p style={s.p}>
          Binary merkle tree over transaction hashes. Supports inclusion proofs — verify a transaction
          exists in a block without downloading all transactions.
        </p>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={14} color="#818cf8" /> Computation</div>
            <div style={s.cardText}>SHA-256 leaf hashes. Pairwise concatenation up the tree. Odd nodes duplicated. Root stored in block header.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={14} color="#818cf8" /> Verification</div>
            <div style={s.cardText}>Proof = sibling hashes from leaf to root. O(log n) verification. Compact proof for any transaction.</div>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Transaction Types</h2>
        <div style={s.grid}>
          {[
            { t: 'transfer', d: 'Token transfer between addresses' },
            { t: 'set', d: 'State update (key-value)' },
            { t: 'agent_action', d: 'Agent execution record with tool calls' },
            { t: 'training_gradient', d: 'Mining gradient submission proof' },
            { t: 'governance_decision', d: 'RARA governance action record' },
            { t: 'identity_register', d: 'New DSID registration' },
          ].map(tx => (
            <div key={tx.t} style={{ ...s.card, padding: '0.75rem 1rem' }}>
              <span style={{ fontFamily: 'monospace', color: '#818cf8', fontSize: '0.85rem' }}>{tx.t}</span>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{tx.d}</div>
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

export default BlockchainProtocolPage;
