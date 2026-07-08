import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ROUTE_META } from '@/config/routeMeta.mjs';
import {
  User, Code2, Layers, Shield, Cpu, ArrowRight,
  Github, Linkedin, Youtube, Twitter
} from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 700, margin: '0 auto 2.5rem' },
  section: { maxWidth: 900, margin: '0 auto', padding: '0 2rem 4rem' },
  h2: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' },
  p: { fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 },
  stat: { textAlign: 'center', padding: '1.5rem' },
  statNum: { fontSize: '2.2rem', fontWeight: 700, color: '#818cf8' },
  statLabel: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' },
  links: { display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' },
  link: { color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 900 },
};

const meta = ROUTE_META['/about'];

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/about" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About DevSwat",
          "description": "Full-stack agentic AI infrastructure platform built from scratch.",
          "url": "https://dev-swat.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "DevSwat",
            "url": "https://dev-swat.com",
            "founder": { "@type": "Person", "name": "Louie Nemesh", "jobTitle": "Founder & Lead Engineer" },
            "description": "Agentic AI infrastructure for building, running, and scheduling server and local agents."
          }
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><User size={14} /> About DevSwat</div>
        <h1 style={s.h1}>Built From Scratch.<br />By One Engineer.</h1>
        <p style={s.lead}>
          DevSwat is a full-stack, production-deployed agentic AI SaaS platform.
          7 proprietary IP systems, ~550,000 lines of code — built in under 4 months by Louie Nemesh.
          Every line of code is original. Every system is production-deployed.
        </p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <div style={{ ...s.grid, marginTop: '3rem' }}>
          {[
            { n: '~550K', l: 'Lines of Code' },
            { n: '7', l: 'Proprietary IP Systems' },
            { n: '4,384', l: 'API Endpoints' },
            { n: '662', l: 'React Components' },
            { n: '∞', l: 'LLM Providers' },
            { n: '137', l: 'OpenClaw Tools' },
          ].map((item) => (
            <div key={item.l} style={{ ...s.card, ...s.stat }}>
              <div style={s.statNum}>{item.n}</div>
              <div style={s.statLabel}>{item.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Why DevSwat Exists</h2>
        <p style={s.p}>
          The AI agent landscape in 2025–2026 is fragmented. Companies like OpenAI, Anthropic, Google DeepMind,
          and Meta provide foundation models — but building production agent systems requires stitching together
          dozens of tools, frameworks, and services. LangChain, CrewAI, AutoGen, and others each solve a slice,
          but none provide a complete, production-ready, multi-tenant SaaS platform.
        </p>
        <p style={s.p}>
          DevSwat fills this gap. It is the full vertical stack — from LLM provider abstraction to agent
          orchestration to governed semantic memory to billing to deployment. Unlike wrapper products that
          put a UI on top of OpenAI or LangChain, DevSwat is 7 proprietary IP systems built from the ground up.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>9 Proprietary IP Systems</h2>
        <div style={s.grid}>
          {[
            { icon: <Cpu size={18} color="#818cf8" />, title: 'ResonantChat', text: '68-module AI pipeline with hallucination detection, evidence graphs, and neural skill classification. ~5ms inference.' },
            { icon: <Layers size={18} color="#818cf8" />, title: 'Semantic Memory', text: '9-layer cognitive architecture. Per-user encrypted memory with embedding retrieval and resonance clustering.' },
            { icon: <Shield size={18} color="#818cf8" />, title: 'RARA Governance', text: 'Invariant enforcement, capability decay, kill switch, atomic mutations with rollback, compliance (EU AI Act, SOC2).' },
            { icon: <Code2 size={18} color="#818cf8" />, title: 'Code Visualizer', text: 'AST/SAST scanning for Python, JS, TS. Dependency graphs, dead code detection, governance reports.' },
            { icon: <Layers size={18} color="#818cf8" />, title: 'Multi-Agent Orchestration', text: 'Voting protocol, debate protocol, chain protocol. Team management with configurable quorum.' },
            { icon: <Shield size={18} color="#818cf8" />, title: 'Enterprise Control Plane', text: 'Semantic explorer, trust dashboard, governance center, compliance hub, security monitor.' },
            { icon: <Cpu size={18} color="#818cf8" />, title: 'SaaS Billing Engine', text: 'Stripe integration, 5 revenue streams, 4 plan tiers, credit system with real-time usage tracking.' },
          ].map((c) => (
            <div key={c.title} style={s.card}>
              <div style={s.cardTitle}>{c.icon} {c.title}</div>
              <div style={s.cardText}>{c.text}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>The Founder</h2>
        <p style={s.p}>
          <strong>Louie Nemesh</strong> — Founder & Lead Engineer at DevSwat.
          Built the entire platform solo in under 4 months using DevSwat's own agentic workflows —
          the ultimate proof-of-concept. Every line of code, every system design, every deployment decision.
        </p>
        <div style={s.links}>
          <a href="https://www.linkedin.com/company/devswat/" target="_blank" rel="noopener noreferrer" style={s.link}><Linkedin size={16} /> LinkedIn</a>
          <a href="https://www.youtube.com/@DevSwat" target="_blank" rel="noopener noreferrer" style={s.link}><Youtube size={16} /> YouTube</a>
          <a href="https://x.com/devswat" target="_blank" rel="noopener noreferrer" style={s.link}><Twitter size={16} /> X</a>
          <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" style={s.link}><Github size={16} /> GitHub</a>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Get Started Free <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default AboutPage;
