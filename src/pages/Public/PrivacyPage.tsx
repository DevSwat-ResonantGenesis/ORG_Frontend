import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/privacy'];

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  h1: { fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 800, margin: '0 auto', padding: '0 2rem 3rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '2rem' },
  p: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1rem' },
  ul: { paddingLeft: '1.25rem', margin: '0.5rem 0 1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '0.9rem' },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 800 },
};

const PrivacyPage: React.FC = () => (
  <div style={s.page}>
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href="https://dev-swat.com/privacy" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content="https://dev-swat.com/privacy" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
    </Helmet>

    <section style={s.hero}>
      <h1 style={s.h1}>Privacy Policy</h1>
      <p style={s.lead}>Last updated: April 2026</p>
    </section>

    <div style={s.divider} />

    <section style={s.section}>
      <h2 style={s.h2}>Data We Collect</h2>
      <p style={s.p}>We collect the minimum data needed to operate the platform:</p>
      <ul style={s.ul}>
        <li>Account information (email, name) for authentication</li>
        <li>Usage data (API calls, feature usage) for billing and analytics</li>
        <li>Chat messages and agent instructions (encrypted per-user)</li>
        <li>Semantic memory data (encrypted with per-user AES keys)</li>
      </ul>

      <h2 style={s.h2}>Data We Do NOT Collect</h2>
      <ul style={s.ul}>
        <li>Source code from your machine (OpenClaw tools run locally)</li>
        <li>Browser history or tracking cookies for advertising</li>
        <li>Keystroke logging or screen recording</li>
        <li>Data from local tool executions (only tool name + timing reported)</li>
      </ul>

      <h2 style={s.h2}>Encryption</h2>
      <p style={s.p}>
        Semantic memory data is encrypted at rest using per-user AES keys. Only the authenticated
        user can decrypt their own memories. We cannot read your memory data even if we wanted to.
      </p>

      <h2 style={s.h2}>OpenClaw Privacy</h2>
      <p style={s.p}>
        OpenClaw tools (web search, code execution, file operations, memory) run on YOUR machine.
        The server only receives: tool name, execution timing, and final answer text. Your files,
        code, and local data never leave your hardware.
      </p>

      <h2 style={s.h2}>LLM Provider Data</h2>
      <p style={s.p}>
        When you use cloud LLM providers (OpenAI, Anthropic, etc.), your messages are sent to their
        APIs subject to their privacy policies. For maximum privacy, use Ollama (local models) —
        no data leaves your machine.
      </p>

      <h2 style={s.h2}>Data Deletion</h2>
      <p style={s.p}>
        You can delete your account and all associated data at any time. This includes:
        chat history, memories, and agents. Deletion is permanent.
      </p>

      <h2 style={s.h2}>Contact</h2>
      <p style={s.p}>Privacy questions: <strong>privacy@dev-swat.com</strong></p>
    </section>
  </div>
);

export default PrivacyPage;
