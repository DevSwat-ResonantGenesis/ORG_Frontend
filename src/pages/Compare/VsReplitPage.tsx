import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/compare/devswat-vs-replit'];

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 4rem' },
  h2: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' },
  p: { fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1.25rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '1.5rem' },
  th: { textAlign: 'left' as const, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
  td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const Y = <CheckCircle2 size={16} color="#4ade80" />;
const N = <XCircle size={16} color="rgba(255,255,255,0.2)" />;

const features = [
  { f: 'Browser-Based IDE', ds: true, r: true },
  { f: 'AI Code Assistant', ds: true, r: true },
  { f: 'App Hosting/Deployment', ds: true, r: true },
  { f: 'Collaboration', ds: true, r: true },
  { f: 'Desktop IDE', ds: true, r: false },
  { f: 'Autonomous AI Agents', ds: true, r: false },
  { f: 'Agent Scheduling', ds: true, r: false },
  { f: 'Multi-Agent Teams', ds: true, r: false },
  { f: 'AST/SAST Code Analysis', ds: true, r: false },
  { f: 'Semantic Memory (Persistent)', ds: true, r: false },
  { f: 'OpenClaw (137 Local Tools)', ds: true, r: false },
  { f: 'Self-Hosted Option', ds: true, r: false },
  { f: 'RARA Governance', ds: true, r: false },
  { f: 'Unlimited LLM Providers', ds: true, r: false },
  { f: 'Multi-Language Support', ds: true, r: true },
  { f: 'Free Tier', ds: true, r: true },
];

const VsReplitPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/compare/devswat-vs-replit" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/compare/devswat-vs-replit" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}>Comparison</div>
        <h1 style={s.h1}>DevSwat vs Replit</h1>
        <p style={s.lead}>
          Replit is a browser-based IDE with AI assistance and instant cloud deployment. Great for
          prototyping and learning. DevSwat is a full agentic AI platform with autonomous agents
          and governance — built for production.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Feature Comparison</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Feature</th>
              <th style={{ ...s.th, textAlign: 'center' }}>DevSwat</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Replit</th>
            </tr>
          </thead>
          <tbody>
            {features.map(row => (
              <tr key={row.f}>
                <td style={s.td}>{row.f}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.ds ? Y : N}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.r ? Y : N}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>The Key Difference</h2>
        <p style={s.p}>
          <strong>Replit</strong> excels at instant prototyping. Open a browser, start coding, deploy
          in seconds. Great AI assistant, multi-language support, and collaboration. It's the fastest
          path from idea to live app.
        </p>
        <p style={s.p}>
          <strong>DevSwat</strong> is for building production AI systems. Autonomous agents that run on
          schedule, SAST scanning, semantic memory,
          and governance. You can self-host the entire stack on your servers.
        </p>
        <p style={s.p}>
          Replit gets you from zero to prototype in minutes. DevSwat gets you from prototype to
          governed, auditable, production AI infrastructure.
        </p>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Try DevSwat Free <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default VsReplitPage;
