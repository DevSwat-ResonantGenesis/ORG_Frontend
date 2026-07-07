import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight } from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 3rem' },
  h2: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' },
  p: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1rem' },
  code: { background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', whiteSpace: 'pre' as const, overflowX: 'auto' as const, marginBottom: '1.5rem', display: 'block' },
  method: { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, marginRight: 8, fontFamily: 'monospace' },
  endpoint: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto 3rem', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '2rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const endpoints = [
  { m: 'POST', c: '#4ade80', path: '/api/agents', desc: 'Create a new agent with name, instructions, tools, and configuration.' },
  { m: 'GET', c: '#60a5fa', path: '/api/agents', desc: 'List all agents for the authenticated user.' },
  { m: 'GET', c: '#60a5fa', path: '/api/agents/:id', desc: 'Get a specific agent by ID with full configuration.' },
  { m: 'PUT', c: '#f59e0b', path: '/api/agents/:id', desc: 'Update agent instructions, tools, or settings.' },
  { m: 'DELETE', c: '#ef4444', path: '/api/agents/:id', desc: 'Delete an agent and all associated data.' },
  { m: 'POST', c: '#4ade80', path: '/api/agents/:id/run', desc: 'Execute an agent. Returns SSE stream of execution events.' },
  { m: 'POST', c: '#4ade80', path: '/api/agents/:id/schedule', desc: 'Set cron schedule for automatic agent execution.' },
  { m: 'GET', c: '#60a5fa', path: '/api/agents/:id/executions', desc: 'Get execution history with traces and cost tracking.' },
  { m: 'POST', c: '#4ade80', path: '/api/agent-teams', desc: 'Create a multi-agent team with voting/debate protocol.' },
  { m: 'POST', c: '#4ade80', path: '/api/agent-architect/stream', desc: 'Start Agent Architect session (SSE). Builds agents from description.' },
];

const AgentAPIPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Agent API Reference — Create, Run &amp; Schedule Agents | DevSwat Docs</title>
        <meta name="description" content="DevSwat Agent API reference. REST endpoints for creating, running, scheduling, and managing autonomous AI agents. SSE streaming, multi-agent teams, Agent Architect. Full request/response examples." />
        <link rel="canonical" href="https://resonant.dev-swat.com/docs/agent-api" />
        <meta property="og:title" content="Agent API Reference — DevSwat Docs" />
        <meta property="og:description" content="REST API for creating, running, and scheduling autonomous AI agents." />
        <meta property="og:url" content="https://resonant.dev-swat.com/docs/agent-api" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Bot size={14} /> Agent API</div>
        <h1 style={s.h1}>Agent API Reference</h1>
        <p style={s.lead}>REST API for creating, running, scheduling, and managing autonomous AI agents.</p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Authentication</h2>
        <p style={s.p}>All endpoints require a JWT bearer token in the Authorization header.</p>
        <code style={s.code}>{`Authorization: Bearer <your-jwt-token>`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Endpoints</h2>
        {endpoints.map(ep => (
          <div key={ep.path + ep.m} style={s.endpoint}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ ...s.method, background: ep.c + '22', color: ep.c }}>{ep.m}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{ep.path}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{ep.desc}</div>
          </div>
        ))}
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Example: Create Agent</h2>
        <code style={s.code}>{`POST /api/agents
Content-Type: application/json

{
  "name": "Code Reviewer",
  "instructions": "Review code for bugs, security issues, and best practices.",
  "tools": ["code_visualizer_scan", "grep_search", "read_file"],
  "model": "gpt-4o",
  "execution_mode": "governed",
  "max_steps": 25
}`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Example: Run Agent (SSE)</h2>
        <code style={s.code}>{`POST /api/agents/:id/run
Content-Type: application/json

{
  "input": "Review the authentication module for security issues",
  "stream": true
}

// Response: SSE stream
data: {"type": "thinking", "content": "Analyzing auth module..."}
data: {"type": "tool_call", "tool": "code_visualizer_scan", "args": {...}}
data: {"type": "tool_result", "result": {...}}
data: {"type": "response", "content": "Found 3 issues..."}
data: {"type": "done", "cost": 0.02, "steps": 4}`}</code>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/api/docs')}>
          Full API Documentation <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default AgentAPIPage;
