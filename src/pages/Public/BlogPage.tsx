import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Calendar } from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 4rem' },
  h2: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s' },
  cardDate: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' },
  cardTitle: { fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 },
  tag: { display: 'inline-block', padding: '3px 10px', background: 'rgba(99,102,241,0.15)', borderRadius: 6, fontSize: '0.75rem', color: '#a5b4fc', marginRight: 6, marginTop: 8 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
};

const posts = [
  {
    date: 'April 2026',
    title: 'Introducing DevSwat — Agentic AI Infrastructure',
    desc: 'Why we built a full-stack AI agent platform with 3 blockchains, decentralized training, smart routing, and governance. The story behind 550K lines of code built in 4 months.',
    tags: ['Launch', 'Architecture'],
  },
  {
    date: 'April 2026',
    title: 'How Our Neural Skill Classifier Replaced LLM Prompt Detection',
    desc: 'We replaced expensive LLM-based skill detection with a trained MLP on sentence-transformer embeddings. 5ms inference, active learning, model weights in PostgreSQL.',
    tags: ['Engineering', 'ML'],
  },
  {
    date: 'April 2026',
    title: 'Building a Physics-Based State Engine from Scratch',
    desc: 'N-body simulation for state management. How gravity, repulsion, and resonance forces create emergent structure in the Hash Sphere.',
    tags: ['Engineering', 'Hash Sphere'],
  },
  {
    date: 'April 2026',
    title: 'Decentralized LLM Training: 1F1B Pipeline Parallelism at Scale',
    desc: 'Real PyTorch training across distributed miners. GQA+RoPE+SwiGLU transformer, Top-K gradient compression, WebRTC P2P weight transfer.',
    tags: ['Mining', 'ML'],
  },
  {
    date: 'April 2026',
    title: 'RARA Governance: How We Ensure AI Agents Can\'t Go Rogue',
    desc: 'Invariant enforcement, capability decay, kill switch, and compliance profiles. The governance layer that makes autonomous agents safe.',
    tags: ['Governance', 'Safety'],
  },
  {
    date: 'April 2026',
    title: 'OpenClaw: 137 Tools That Run on Your Machine',
    desc: 'Local-first federated agent connector. Why we chose privacy over convenience, and how self-creating tools via LLM + AST safety scan work.',
    tags: ['OpenClaw', 'Privacy'],
  },
];

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Blog — Engineering, AI Research &amp; Platform Updates | DevSwat</title>
        <meta name="description" content="DevSwat engineering blog: deep dives into agentic AI infrastructure, neural routing, decentralized LLM training, blockchain protocols, governance, and platform architecture." />
        <link rel="canonical" href="https://resonant.dev-swat.com/blog" />
        <meta property="og:title" content="DevSwat Blog — Engineering & AI Research" />
        <meta property="og:description" content="Deep dives into agentic AI, neural routing, decentralized training, blockchain, governance." />
        <meta property="og:url" content="https://resonant.dev-swat.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><BookOpen size={14} /> Blog</div>
        <h1 style={s.h1}>Engineering Blog</h1>
        <p style={s.lead}>
          Deep dives into agentic AI infrastructure, neural routing, decentralized training,
          blockchain protocols, and platform engineering.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <div style={s.grid}>
          {posts.map(post => (
            <div key={post.title} style={s.card}>
              <div style={s.cardDate}><Calendar size={12} /> {post.date}</div>
              <div style={s.cardTitle}>{post.title}</div>
              <div style={s.cardText}>{post.desc}</div>
              <div>{post.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
