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
  { f: 'AI Code Completion', ds: true, c: true },
  { f: 'Code Execution Intelligence', ds: true, c: false },
  { f: 'Autonomous AI Agents', ds: true, c: false },
  { f: 'Agent Scheduling (Cron)', ds: true, c: false },
  { f: 'Multi-Agent Orchestration', ds: true, c: false },
  { f: 'AST/SAST Code Analysis', ds: true, c: false },
  { f: 'Semantic Memory (Persistent)', ds: true, c: false },
  { f: 'OpenClaw (137 Local Tools)', ds: true, c: false },
  { f: 'Self-Hosted Option', ds: true, c: false },
  { f: 'RARA Governance / Kill Switch', ds: true, c: false },
  { f: 'Unlimited LLM Providers', ds: true, c: false },
  { f: 'Multi-File Editing', ds: true, c: true },
  { f: 'Terminal Integration', ds: true, c: true },
  { f: 'Git Integration', ds: true, c: true },
  { f: 'VS Code Extension Ecosystem', ds: true, c: true },
  { f: 'Free Tier', ds: true, c: true },
  { f: 'Tab Autocomplete', ds: true, c: true },
];

const VsCursorPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>DevSwat vs Cursor — AI IDE Comparison 2026</title>
        <meta name="description" content="DevSwat vs Cursor comparison. DevSwat has autonomous agents, SAST, semantic memory, 137 local tools, and governance — Cursor is a VS Code fork with AI autocomplete." />
        <link rel="canonical" href="https://dev-swat.com/compare/devswat-vs-cursor" />
        <meta property="og:title" content="DevSwat vs Cursor — Full Comparison" />
        <meta property="og:description" content="Feature comparison: agents, SAST, memory vs AI autocomplete." />
        <meta property="og:url" content="https://dev-swat.com/compare/devswat-vs-cursor" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}>Comparison</div>
        <h1 style={s.h1}>DevSwat vs Cursor</h1>
        <p style={s.lead}>
          Cursor is a VS Code fork with AI autocomplete and chat. DevSwat is a full agentic AI platform
          with autonomous agents, governance, SAST, and 137 local tools.
          Different products for different needs.
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
              <th style={{ ...s.th, textAlign: 'center' }}>Cursor</th>
            </tr>
          </thead>
          <tbody>
            {features.map(row => (
              <tr key={row.f}>
                <td style={s.td}>{row.f}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.ds ? Y : N}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.c ? Y : N}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>The Key Difference</h2>
        <p style={s.p}>
          <strong>Cursor</strong> is an excellent AI code editor. It does one thing well: AI-assisted coding
          with tab completion, chat, and multi-file editing. It's a VS Code fork with Anthropic/OpenAI integration.
        </p>
        <p style={s.p}>
          <strong>DevSwat</strong> is a full-stack agentic AI infrastructure. The IDE is one part of a complete platform.
          You also get autonomous agents with scheduling,
          AST/SAST scanning, 9-layer semantic memory, RARA governance, smart routing, and a local-first tool runtime with 137 tools.
        </p>
        <p style={s.p}>
          If you need an AI code editor, both work. If you need AI infrastructure for building, governing,
          and deploying autonomous agents — DevSwat is the only option.
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

export default VsCursorPage;
