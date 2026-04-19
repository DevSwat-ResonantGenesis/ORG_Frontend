import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Lock, Layers, Search, ArrowRight, Cpu,
  Database, Eye, Zap, Box
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

const layers = [
  { n: '1', name: 'Sensory Buffer', d: 'Raw input processing and immediate perceptual data.' },
  { n: '2', name: 'Working Memory', d: 'Short-term active context for current task.' },
  { n: '3', name: 'Episodic Memory', d: 'Specific experiences and events with temporal context.' },
  { n: '4', name: 'Semantic Memory', d: 'General knowledge, facts, and conceptual understanding.' },
  { n: '5', name: 'Procedural Memory', d: 'How-to knowledge, skills, and learned procedures.' },
  { n: '6', name: 'Meta-Cognitive', d: 'Self-awareness about own knowledge and reasoning.' },
  { n: '7', name: 'Emotional', d: 'Sentiment and affective context markers.' },
  { n: '8', name: 'Social', d: 'Understanding of relationships and social dynamics.' },
  { n: '9', name: 'Creative', d: 'Novel combinations and generative synthesis.' },
];

const MemoryPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Semantic Memory — 9-Layer Encrypted AI Memory Engine | DevSwat</title>
        <meta name="description" content="Per-user encrypted semantic memory with 9-layer cognitive architecture. Embedding-based retrieval, resonance clustering, RAG, Hash Sphere coordinates, AES encryption, 3D visualization." />
        <link rel="canonical" href="https://dev-swat.com/products/memory" />
        <meta property="og:title" content="Semantic Memory — 9-Layer AI Memory Engine" />
        <meta property="og:description" content="9-layer cognitive architecture. Encrypted per-user memory with embedding retrieval and 3D visualization." />
        <meta property="og:url" content="https://dev-swat.com/products/memory" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "DevSwat Semantic Memory", "applicationCategory": "DeveloperApplication",
          "description": "9-layer encrypted semantic memory engine with embedding retrieval and 3D visualization.",
          "url": "https://dev-swat.com/products/memory"
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Brain size={14} /> Semantic Memory</div>
        <h1 style={s.h1}>AI That Remembers.<br />Encrypted. Per-User.</h1>
        <p style={s.lead}>
          9-layer cognitive architecture inspired by human memory systems. Embedding-based retrieval,
          resonance clustering, RAG context injection, AES encryption. Every user gets their own
          isolated memory universe with 3D visualization.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>9-Layer Cognitive Architecture</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {layers.map(l => (
            <div key={l.name} style={s.card}>
              <div style={s.cardTitle}><span style={{ color: '#818cf8', fontSize: '0.85rem' }}>Layer {l.n}</span> {l.name}</div>
              <div style={s.cardText}>{l.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Core Features</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Search size={16} color="#818cf8" /> Embedding Retrieval</div>
            <div style={s.cardText}>sentence-transformers (all-MiniLM-L6-v2) generates 384-dim embeddings. Vector similarity search finds relevant memories in milliseconds.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> RAG Pipeline</div>
            <div style={s.cardText}>Retrieval-Augmented Generation injects relevant memories into LLM context. Every response grounded in your actual data.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> AES Encryption</div>
            <div style={s.cardText}>Per-user encryption keys. Memory data encrypted at rest and in transit. Your memories are yours alone.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Cpu size={16} color="#818cf8" /> Resonance Clustering</div>
            <div style={s.cardText}>ResonanceHasher PCA maps memories to Hash Sphere coordinates. Related memories cluster together in 3D space.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Eye size={16} color="#818cf8" /> 3D Visualization</div>
            <div style={s.cardText}>Interactive Three.js memory universe. Explore your memories as a 3D particle cloud. Zoom, rotate, click to inspect.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Database size={16} color="#818cf8" /> Dual Memory Engines</div>
            <div style={s.cardText}>Short-term (session context) and long-term (persistent) memory. Both accessible via the same API and UI.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/resonant-memory')}>
          Explore Memory <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default MemoryPage;
