import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Code2, Cpu, Globe, ArrowRight, Github,
  Linkedin, Youtube, Twitter, Rocket, Heart
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
  links: { display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' },
  link: { color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' },
  empty: { textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' },
};

const TechnologyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Helmet>
        <title>Careers at DevSwat — Build the Future of Agentic AI</title>
        <meta name="description" content="Join DevSwat and help build agentic AI infrastructure. Python, FastAPI, React, TypeScript, blockchain, distributed systems, ML. Built by one engineer — now looking for exceptional talent." />
        <link rel="canonical" href="https://dev-swat.com/careers" />
        <meta property="og:title" content="Careers at DevSwat" />
        <meta property="og:description" content="Build agentic AI infrastructure. Python, FastAPI, React, TypeScript, blockchain, ML. Founded by one engineer — join the mission." />
        <meta property="og:url" content="https://dev-swat.com/careers" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Careers at DevSwat",
          "description": "Career opportunities at DevSwat — agentic AI infrastructure.",
          "url": "https://dev-swat.com/careers"
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Briefcase size={14} /> Careers</div>
        <h1 style={s.h1}>Help Build the Future<br />of Agentic AI</h1>
        <p style={s.lead}>
          DevSwat was built from scratch by one engineer — ~550K lines of code,
          9 proprietary IP systems. As we scale, we're looking for exceptional people who want
          to work on genuinely novel AI infrastructure.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>The Tech Stack</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Code2 size={16} color="#818cf8" /> Backend</div>
            <div style={s.cardText}>Python, FastAPI, SQLAlchemy, Alembic, Pydantic, Celery, asyncio, httpx, WebSockets</div>
            <div style={{ marginTop: 10 }}>
              <span style={s.tag}>Full-Stack Platform</span><span style={s.tag}>Production Infrastructure</span><span style={s.tag}>~550K LOC</span>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Globe size={16} color="#818cf8" /> Frontend</div>
            <div style={s.cardText}>React 18, TypeScript, Vite, Zustand, Three.js, D3.js, Monaco Editor, CSS Modules</div>
            <div style={{ marginTop: 10 }}>
              <span style={s.tag}>662 Components</span><span style={s.tag}>85+ Routes</span><span style={s.tag}>SPA + SSR OG</span>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Cpu size={16} color="#818cf8" /> AI / ML</div>
            <div style={s.cardText}>OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere SDKs. PyTorch for training. sentence-transformers for embeddings.</div>
            <div style={{ marginTop: 10 }}>
              <span style={s.tag}>Unlimited LLM Providers</span><span style={s.tag}>Pipeline Parallelism</span><span style={s.tag}>Embeddings</span>
            </div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>What You'd Work On</h2>
        <div style={s.grid}>
          {[
            { icon: <Cpu size={16} color="#818cf8" />, t: 'Agent Systems', d: 'Multi-agent orchestration, autonomous daemon, goal pursuit, Agent Architect builder, tool execution sandboxes.' },
            { icon: <Globe size={16} color="#818cf8" />, t: 'Decentralized Training', d: 'Pipeline-parallel LLM training, P2P weight transfer, gradient compression, Raft consensus blockchain.' },
            { icon: <Code2 size={16} color="#818cf8" />, t: 'Code Intelligence', d: 'AST/SAST analysis, dependency graphs, governance engine, multi-project comparison, IDE agent loop.' },
            { icon: <Rocket size={16} color="#818cf8" />, t: 'Novel Systems', d: 'Physics-based state engine (N-body), 9-layer semantic memory, DSID-P blockchain protocol, capability grammar.' },
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
        <h2 style={s.h2}>Open Positions</h2>
        <div style={s.empty}>
          <Heart size={32} color="#818cf8" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No open positions right now</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
            We're pre-funding. When positions open, they'll appear here first.<br />
            Follow us on social media to be the first to know.
          </div>
        </div>
        <div style={s.links}>
          <a href="https://www.linkedin.com/company/devswat/" target="_blank" rel="noopener noreferrer" style={s.link}><Linkedin size={16} /> LinkedIn</a>
          <a href="https://www.youtube.com/@DevSwat" target="_blank" rel="noopener noreferrer" style={s.link}><Youtube size={16} /> YouTube</a>
          <a href="https://x.com/devswat" target="_blank" rel="noopener noreferrer" style={s.link}><Twitter size={16} /> X</a>
          <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" style={s.link}><Github size={16} /> GitHub</a>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/contact')}>
          Get in Touch <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default TechnologyPage;
