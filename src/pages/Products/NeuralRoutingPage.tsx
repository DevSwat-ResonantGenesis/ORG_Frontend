import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Brain, Zap, Users, BarChart3, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

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

const agentTypes = [
  'General Reasoning', 'Code Generation', 'Code Debugging', 'Security Analysis',
  'Architecture Design', 'Math & Logic', 'Creative Writing', 'Data Analysis',
  'Research & Web Search', 'Memory & Context', 'Image Generation', 'Audio Generation',
  'Task Automation', 'Social Media', 'Integrations',
];

const NeuralRoutingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Neural Routing — ML Skill Classifier &amp; Multi-Agent Selection | DevSwat</title>
        <meta name="description" content="Neural skill classifier trained on sentence-transformer embeddings. 2-layer MLP routes messages to 14 specialized skills in ~5ms. Active learning, performance tracking, best-agent selection." />
        <link rel="canonical" href="https://dev-swat.com/products/neural-routing" />
        <meta property="og:title" content="Neural Routing — ML Skill Classifier" />
        <meta property="og:description" content="Trained MLP classifier routes messages to specialized skills in ~5ms. Active learning." />
        <meta property="og:url" content="https://dev-swat.com/products/neural-routing" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Brain size={14} /> Neural Routing</div>
        <h1 style={s.h1}>The Right Agent<br />For Every Question</h1>
        <p style={s.lead}>
          A real trained ML classifier — not keyword matching. sentence-transformer embeddings fed into
          a 2-layer MLP that routes to 14 specialized skills in ~5ms. Gets smarter with every conversation
          through active learning.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Architecture</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> Embedding Layer</div>
            <div style={s.cardText}>all-MiniLM-L6-v2 encodes (current message + last 3 messages) into a 384-dimensional embedding vector. Captures semantic intent, not just keywords.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Brain size={16} color="#818cf8" /> 2-Layer MLP</div>
            <div style={s.cardText}>384-dim → 256 → 128 → 14 classes. ReLU activations with dropout. Trained on 250+ curated samples. Model weights stored in PostgreSQL.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Active Learning</div>
            <div style={s.cardText}>Every prediction saved to DB. Accumulated samples merged with seed data for retraining. Model improves automatically over time.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><BarChart3 size={16} color="#818cf8" /> Skill Continuity</div>
            <div style={s.cardText}>Active skill continuity boost (+0.30) from toolResults metadata. If you're in a code session, code-related skills get a probability boost.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Specialized Agent Types</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {agentTypes.map(type => (
            <div key={type} style={{ ...s.card, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={14} color="#818cf8" />
              <span style={{ fontSize: '0.9rem' }}>{type}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>How It Differs</h2>
        <p style={s.p}>
          Most AI platforms use keyword matching or LLM-based routing (slow, expensive). DevSwat's neural
          skill classifier is a real trained model: ~5ms inference, no LLM call needed, works offline,
          and gets smarter through active learning. Container-independent — model weights persist in PostgreSQL,
          not the filesystem.
        </p>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Experience Neural Routing <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default NeuralRoutingPage;
