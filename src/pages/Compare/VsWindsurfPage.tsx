import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

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
  { f: 'AI Code Completion', ds: true, w: true },
  { f: 'Cascade-style Agentic Mode', ds: true, w: true },
  { f: 'Multi-File Editing', ds: true, w: true },
  { f: 'Code Execution Intelligence', ds: true, w: true },
  { f: 'Persistent Memory Across Sessions', ds: true, w: true },
  { f: 'Autonomous Agent Scheduling', ds: true, w: false },
  { f: 'Multi-Agent Teams (Voting/Debate)', ds: true, w: false },
  { f: 'AST/SAST Code Analysis', ds: true, w: false },
  { f: 'Blockchain Audit Trail', ds: true, w: false },
  { f: 'Decentralized LLM Training', ds: true, w: false },
  { f: '$RGT Token Economy', ds: true, w: false },
  { f: 'OpenClaw (137 Local Tools)', ds: true, w: false },
  { f: 'Self-Hosted Option', ds: true, w: false },
  { f: 'RARA Governance / Kill Switch', ds: true, w: false },
  { f: 'Physics-Based State Engine', ds: true, w: false },
  { f: 'SaaS Platform (Not Just IDE)', ds: true, w: false },
  { f: 'Unlimited LLM Providers', ds: true, w: false },
  { f: 'Terminal Integration', ds: true, w: true },
  { f: 'Web App Deployment', ds: true, w: true },
  { f: 'Free Tier', ds: true, w: true },
];

const VsWindsurfPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>DevSwat vs Windsurf — AI IDE &amp; Platform Comparison 2026</title>
        <meta name="description" content="DevSwat vs Windsurf comparison. Windsurf has Cascade agentic mode. DevSwat has autonomous agents, blockchain, decentralized training, AST/SAST, governance, smart routing, and unlimited LLM providers." />
        <link rel="canonical" href="https://resonant.dev-swat.com/compare/devswat-vs-windsurf" />
        <meta property="og:title" content="DevSwat vs Windsurf — Full Comparison" />
        <meta property="og:description" content="Both have agentic coding. DevSwat adds agents, blockchain, mining, SAST, governance." />
        <meta property="og:url" content="https://resonant.dev-swat.com/compare/devswat-vs-windsurf" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}>Comparison</div>
        <h1 style={s.h1}>DevSwat vs Windsurf</h1>
        <p style={s.lead}>
          Windsurf (by Codeium) is an AI IDE with Cascade — an agentic coding assistant.
          DevSwat is a full agentic AI platform where the IDE is one of 30+ services.
          Both have strong AI coding — DevSwat goes much further.
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
              <th style={{ ...s.th, textAlign: 'center' }}>Windsurf</th>
            </tr>
          </thead>
          <tbody>
            {features.map(row => (
              <tr key={row.f}>
                <td style={s.td}>{row.f}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.ds ? Y : N}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.w ? Y : N}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>The Key Difference</h2>
        <p style={s.p}>
          <strong>Windsurf</strong> is an excellent AI IDE with Cascade — an agentic coding assistant that
          understands context, runs commands, edits files, and deploys. It also has persistent memory (Memories)
          and workflows.
        </p>
        <p style={s.p}>
          <strong>DevSwat</strong> has all of that in its IDE (66 tools, Cascade-quality agent loop) PLUS
          an entire platform: autonomous agents with scheduling, multi-agent teams, blockchain audit trails,
          decentralized LLM training, SAST scanning, semantic memory with 3D visualization, RARA governance,
          and OpenClaw local tool runtime.
        </p>
        <p style={s.p}>
          Windsurf is a great code editor. DevSwat is a code editor inside a full agentic AI infrastructure.
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

export default VsWindsurfPage;
