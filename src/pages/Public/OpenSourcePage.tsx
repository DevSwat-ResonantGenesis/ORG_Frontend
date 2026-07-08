import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/open-source'];
import {
  Github, ExternalLink, ArrowRight, Terminal
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: '0.75rem' },
  tag: { display: 'inline-block', padding: '3px 10px', background: 'rgba(99,102,241,0.15)', borderRadius: 6, fontSize: '0.75rem', color: '#a5b4fc', marginRight: 6, marginBottom: 4 },
  repoLink: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none', marginTop: 8 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'transparent', color: '#a5b4fc', borderRadius: 8, border: '1px solid rgba(99,102,241,0.4)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', marginLeft: 12 },
};

const repos = [
  {
    name: 'RG_OpenClaw',
    title: 'OpenClaw — Federated Agent Connector',
    icon: <Terminal size={18} color="#818cf8" />,
    license: 'Source Available',
    desc: 'Local-first agent runtime with 137 tools across 15 categories. Tools run on YOUR machine. Self-creating tools via LLM + AST safety scan. Memory stays local in SQLite.',
    tags: ['137 Tools', 'Local-First', 'Self-Creating Tools', 'SQLite FTS5', 'Privacy'],
    url: 'https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw',
  },
];

const OpenSourcePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/open-source" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/open-source" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Github size={14} /> Open Source</div>
        <h1 style={s.h1}>Verify Everything.<br />Trust Nothing Blindly.</h1>
        <p style={s.lead}>
          Every line of the local-first agent runtime is auditable. Real engineering, not marketing slides.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Public Repositories</h2>
        <p style={s.p}>
          Repos on GitHub under <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>DevSwat-ResonantGenesis</a>.
          Platform services are source-available.
        </p>

        <div style={s.grid}>
          {repos.map(repo => (
            <div key={repo.name} style={s.card}>
              <div style={s.cardTitle}>{repo.icon} {repo.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: 8 }}>License: {repo.license}</div>
              <div style={s.cardText}>{repo.desc}</div>
              <div>
                {repo.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}
              </div>
              <a href={repo.url} target="_blank" rel="noopener noreferrer" style={s.repoLink}>
                <Github size={14} /> View on GitHub <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>What You Can Verify Right Now</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}>Real Engineering</div>
            <div style={s.cardText}>
              137-tool local-first agent runtime with self-creating tools via LLM + AST safety scan.
              SQLite FTS5 memory search. Zero inbound connections — works behind any firewall/NAT/VPN.
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>Production Infrastructure</div>
            <div style={s.cardText}>
              Production infrastructure with Nginx TLS termination, JWT auth, HSTS, CORS lockdown.
              All services run behind HTTPS with fail-closed auth in production.
              Live platform at dev-swat.com.
            </div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" style={s.btnOutline}>
          <Github size={16} /> View All Repos
        </a>
      </section>
    </div>
  );
};

export default OpenSourcePage;
