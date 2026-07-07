import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { FileCode, ArrowRight } from 'lucide-react';

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

const CBORSpecPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>CBOR Block Format — RFC 8949 Encoding for Blockchain | DevSwat Docs</title>
        <meta name="description" content="CBOR (RFC 8949) canonical encoding for DevSwat blockchain. 5-layer encoding: blocks, transactions, smart contracts, semantic vectors, DSID-P identities. Deterministic serialization." />
        <link rel="canonical" href="https://resonant.dev-swat.com/docs/cbor-spec" />
        <meta property="og:title" content="CBOR Block Format — DevSwat Docs" />
        <meta property="og:description" content="RFC 8949 canonical encoding. 5-layer blockchain data serialization." />
        <meta property="og:url" content="https://resonant.dev-swat.com/docs/cbor-spec" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><FileCode size={14} /> CBOR Spec</div>
        <h1 style={s.h1}>CBOR Block Format Specification</h1>
        <p style={s.lead}>Canonical binary encoding following RFC 8949 for all blockchain data structures.</p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Why CBOR</h2>
        <p style={s.p}>
          JSON is not deterministic — key ordering varies. For blockchain hashing, we need bit-exact
          serialization. CBOR (Concise Binary Object Representation) per RFC 8949 provides canonical
          encoding where the same data always produces the same bytes.
        </p>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>5-Layer Encoding</h2>
        <div style={s.grid}>
          {[
            { t: 'Layer 1: Blocks', d: 'Block header, transaction list, merkle root. Canonical CBOR with sorted map keys.' },
            { t: 'Layer 2: Transactions', d: 'Sender, receiver, type, data, timestamp, signature. Minimal-size integer encoding.' },
            { t: 'Layer 3: Smart Contracts', d: 'Contract state, code hash, execution receipts. Nested CBOR for complex state.' },
            { t: 'Layer 4: Semantic Vectors', d: 'Embedding vectors encoded as CBOR byte strings. Half-precision float for compression.' },
            { t: 'Layer 5: DSID-P Identity', d: 'Identity records, hash lineage, provenance chains. Tagged CBOR for type safety.' },
          ].map(layer => (
            <div key={layer.t} style={s.card}>
              <div style={s.cardTitle}>{layer.t}</div>
              <div style={s.cardText}>{layer.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Encoding Rules</h2>
        <code style={s.code}>{`Canonical CBOR (RFC 8949 §4.2.1):
  1. Map keys sorted by encoded length, then lexicographically
  2. Integers use minimal-size encoding
  3. No indefinite-length arrays or maps
  4. Float: use shortest exact representation
  5. Strings: UTF-8, no surrogate pairs

Hash computation:
  1. Serialize data to canonical CBOR bytes
  2. SHA-256 hash of the raw bytes
  3. Hex-encode for display, raw bytes for chain storage`}</code>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/docs/blockchain-protocol')}>
          Blockchain Protocol <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default CBORSpecPage;
