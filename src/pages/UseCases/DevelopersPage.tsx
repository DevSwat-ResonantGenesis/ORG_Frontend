import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Code2, Bot, Brain, Search, Terminal, ArrowRight, Zap, Shield } from 'lucide-react';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/use-cases/developers'];

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

const DevelopersPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/use-cases/developers" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/use-cases/developers" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Code2 size={14} /> For Developers</div>
        <h1 style={s.h1}>Ship 10x Faster<br />With AI Infrastructure</h1>
        <p style={s.lead}>
          Not just autocomplete. DevSwat gives you an AI-powered IDE that runs your code,
          autonomous agents that handle entire tasks, and code analysis that catches what you miss.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Developer Workflows</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Terminal size={16} color="#818cf8" /> AI Pair Programming</div>
            <div style={s.cardText}>DevSwat IDE with 66 tools. AI reads your project, runs code, catches errors, and fixes them. Code execution intelligence — not just text prediction.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Bot size={16} color="#818cf8" /> Task Automation</div>
            <div style={s.cardText}>Create agents for repetitive tasks: test generation, PR reviews, dependency updates, database migrations. Schedule them to run automatically.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Search size={16} color="#818cf8" /> Code Analysis</div>
            <div style={s.cardText}>Scan any GitHub repo for dead code, dependency issues, and architectural drift. AST/SAST for Python, JavaScript, TypeScript.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Brain size={16} color="#818cf8" /> Persistent Memory</div>
            <div style={s.cardText}>AI remembers your patterns, your codebase structure, your preferences. Semantic memory persists across sessions. RAG-powered context.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Multi-LLM Access</div>
            <div style={s.cardText}>Connect any LLM provider — OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, Ollama, or bring your own. Smart routing reduces token costs automatically.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Privacy-First</div>
            <div style={s.cardText}>OpenClaw runs tools locally. Code execution on your machine. Memory stored locally in SQLite. Server never sees your source code.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Start Building Free <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default DevelopersPage;
