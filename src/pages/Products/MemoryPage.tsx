import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/products/memory'];
import {
  Brain, Lock, Search, ArrowRight, Cpu,
  Database, Eye, Zap, Box, GitBranch, Clock, ShieldCheck, Code
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
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'transparent', color: '#a5b4fc', borderRadius: 8, border: '1px solid rgba(99,102,241,0.4)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginLeft: 12 },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: 4 },
  code: { background: '#0d0d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1.25rem', fontSize: '0.85rem', color: '#c7d2fe', fontFamily: 'ui-monospace, Menlo, monospace', overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre' },
  priceRow: { display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.95rem' },
};

// The real retrieval pipeline (what actually runs, in order)
const pipeline = [
  { icon: Box, name: '12-D Hash Sphere', d: 'Each memory is a point in a learned 12-dimensional semantic manifold. Retrieval ranks by gravity — proximity in meaning-space, not a lossy 3-D shadow.' },
  { icon: Zap, name: 'Emergent Anchors', d: 'Gravity wells form and drift as memories arrive. Dense regions of related memories pull new ones in — the field self-organizes like mass curving space.' },
  { icon: GitBranch, name: 'Associative Mesh', d: 'Memories that are recalled together wire together. A query surfaces linked memories that pure vector search would never find — biological associative recall.' },
  { icon: Search, name: 'Cross-Encoder Rerank', d: 'A cross-encoder jointly scores every (query, memory) pair for razor-sharp relevance — the precision layer the frontier labs use.' },
  { icon: Database, name: 'Fact Graph', d: 'Atomic facts are extracted, entity-resolved, and traversed multi-hop: “what grade is my daughter in” chains user → child → Lily → grade → kindergarten.' },
  { icon: Clock, name: 'Temporal Reasoning', d: 'Every memory carries its real event time. “When did X happen” and date-range queries are answered from the timeline, not guessed.' },
];

const moat = [
  { icon: ShieldCheck, name: 'Immutable & hash-chained', d: 'Every memory is cryptographically hashed and hash-chained (hashes only; content stays encrypted). Tamper-evident, append-only — never silently deleted.' },
  { icon: Lock, name: 'Sovereign & isolated', d: 'AES-encrypted, isolated per user / agent / org. A query only ever sees the caller’s own memory blocks.' },
  { icon: Cpu, name: 'Zero-LLM recall', d: 'A confidence gate answers directly from memory when it’s sure — no LLM call, no latency, no cost — and only calls a model on low confidence.' },
  { icon: Brain, name: 'Physics, not statistics', d: 'Gravity, drift, and anchors make the memory get smarter as you use it — a living field, not a static index.' },
];

const MemoryPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/products/memory" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/products/memory" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "Resonant Memory", "applicationCategory": "DeveloperApplication",
          "description": "Physics-informed, immutable, sovereign AI memory API with 12-D hash-sphere retrieval, multi-hop fact graph, and temporal reasoning.",
          "offers": { "@type": "Offer", "priceCurrency": "USD", "price": "5" },
          "url": "https://dev-swat.com/products/memory"
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Brain size={14} /> Resonant Memory</div>
        <h1 style={s.h1}>AI memory that thinks<br />in meaning — and never forgets.</h1>
        <p style={s.lead}>
          The world's first <strong>physics-informed, immutable, sovereign</strong> AI memory.
          Retrieval runs on a 12-dimensional hash-sphere manifold with gravity ranking, emergent
          anchors, an associative mesh, cross-encoder reranking, a multi-hop fact graph, and real
          temporal reasoning — every memory encrypted, cryptographically hash-chained, and isolated to you.
        </p>
        <div>
          <button style={s.btn} onClick={() => navigate('/pricing')}>Get an API key <ArrowRight size={16} /></button>
          <button style={s.btnGhost} onClick={() => navigate('/resonant-memory')}>See it in 3D <Eye size={16} /></button>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>How retrieval actually works</h2>
        <p style={s.p}>Most "memory" is a vector database. Resonant Memory is a brain: candidates are
          recalled by cosine + BM25 (the floor), then <strong>ranked and reasoned over</strong> by a
          six-stage physics pipeline.</p>
        <div style={s.grid}>
          {pipeline.map(f => (
            <div key={f.name} style={s.card}>
              <div style={s.cardTitle}><f.icon size={16} color="#818cf8" /> {f.name}</div>
              <div style={s.cardText}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>What no one else has</h2>
        <div style={s.grid}>
          {moat.map(f => (
            <div key={f.name} style={s.card}>
              <div style={s.cardTitle}><f.icon size={16} color="#818cf8" /> {f.name}</div>
              <div style={s.cardText}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}><Lock size={20} color="#818cf8" style={{ verticalAlign: 'middle', marginRight: 8 }} />Isolation — the block-partition model</h2>
        <p style={s.p}>Memories are cryptographically partitioned into per-relationship "blocks," exactly
          like a chain of custody. A query can only ever read the caller's own blocks.</p>
        <div>
          <span style={s.pill}>user_id → the user's private block</span>
          <span style={s.pill}>agent_hash → the agent's global block</span>
          <span style={s.pill}>user_id + agent_hash → the user+agent shared block</span>
          <span style={s.pill}>org_id → tenant isolation</span>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}><Code size={20} color="#818cf8" style={{ verticalAlign: 'middle', marginRight: 8 }} />Drop it into your project</h2>
        <p style={s.p}>Bring memory to any app with the SDK or a REST call. Isolation, hash-chained
          integrity, fact extraction, and the associative mesh all happen automatically.</p>
        <div style={s.code}>{`pip install resonant-memory

from resonant_memory import ResonantMemory
mem = ResonantMemory(api_key="rg_live_...", user_id="user-123")

mem.ingest("Marcus leads the payments team", event_timestamp="2026-05-08")

r = mem.recall_full("what does the user do")
print(r["memories"][0]["content"])   # → Marcus leads the payments team
print(r["confidence"], r["answer_from_memory"], r["evidence_hash"])`}</div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Simple, pay-per-call pricing</h2>
        <p style={s.p}>No subscriptions to use the API — buy credits (from $5) and each call deducts its
          cost. Top up anytime; when credits run out, calls pause until you refill.</p>
        <div style={{ ...s.card, maxWidth: 520 }}>
          <div style={s.priceRow}><span>Store a memory &nbsp;<code style={{color:'#818cf8'}}>ingest()</code></span><strong>120 credits</strong></div>
          <div style={s.priceRow}><span>Recall &nbsp;<code style={{color:'#818cf8'}}>recall()</code></span><strong>60 credits</strong></div>
          <div style={s.priceRow}><span>Read facts &nbsp;<code style={{color:'#818cf8'}}>facts()</code></span><strong>20 credits</strong></div>
          <div style={{ ...s.priceRow, borderBottom: 'none' }}><span>Credits</span><strong>from $5</strong></div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/pricing')}>
          Get your API key <ArrowRight size={16} />
        </button>
        <button style={s.btnGhost} onClick={() => navigate('/resonant-memory')}>
          Explore in 3D <Eye size={16} />
        </button>
      </section>
    </div>
  );
};

export default MemoryPage;
