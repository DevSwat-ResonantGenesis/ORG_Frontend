import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';

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

const MemoryProtocolPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Memory Protocol — 9-Layer Architecture, Embeddings, Hash Sphere | DevSwat Docs</title>
        <meta name="description" content="DevSwat memory protocol: 9-layer cognitive architecture, embedding pipeline (all-MiniLM-L6-v2, 384-dim), Hash Sphere PCA coordinates, AES encryption, RAG retrieval, resonance clustering." />
        <link rel="canonical" href="https://dev-swat.com/docs/memory-protocol" />
        <meta property="og:title" content="Memory Protocol — DevSwat Docs" />
        <meta property="og:description" content="9-layer architecture, embedding pipeline, Hash Sphere coordinates, AES encryption." />
        <meta property="og:url" content="https://dev-swat.com/docs/memory-protocol" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Brain size={14} /> Memory Protocol</div>
        <h1 style={s.h1}>Memory Architecture Specification</h1>
        <p style={s.lead}>9-layer cognitive architecture, embedding pipeline, and Hash Sphere coordinate mapping.</p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Embedding Pipeline</h2>
        <code style={s.code}>{`Model: sentence-transformers/all-MiniLM-L6-v2
Dimensions: 384
Similarity: Cosine similarity (dot product on L2-normalized vectors)

Pipeline:
  1. Input text → tokenize (WordPiece, max 256 tokens)
  2. Forward pass → 384-dim embedding
  3. L2 normalize
  4. Store in PostgreSQL (vector column)
  5. ResonanceHasher PCA → 3D Hash Sphere coordinates (x, y, z)
  6. Store coordinates for 3D visualization`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Hash Sphere Coordinates</h2>
        <p style={s.p}>
          384-dim embeddings reduced to 3D via PCA (Principal Component Analysis). The ResonanceHasher
          computes stable coordinates that preserve semantic relationships — similar memories cluster together.
        </p>
        <code style={s.code}>{`Hash Sphere Mapping:
  Input: 384-dim embedding vector
  PCA: 384 → 3 principal components
  Output: { x: float, y: float, z: float }
  
  Semantic property: 
    cosine_sim(a, b) ≈ euclidean_distance(sphere_a, sphere_b)
    Related memories → nearby in 3D space`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>RAG Pipeline</h2>
        <code style={s.code}>{`Retrieval-Augmented Generation:
  1. User message → embed (384-dim)
  2. Vector search → top-K similar memories (K=5)
  3. Filter by user_id (isolation)
  4. Inject retrieved memories into LLM context
  5. LLM generates response grounded in actual data
  
  Ranking: cosine similarity + recency decay + relevance boost`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Encryption</h2>
        <p style={s.p}>
          Per-user AES encryption keys. Memory content encrypted at rest. Embeddings stored separately
          (required for vector search). Decryption only on retrieval with authenticated user context.
        </p>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/products/memory')}>
          Memory Product Page <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default MemoryProtocolPage;
