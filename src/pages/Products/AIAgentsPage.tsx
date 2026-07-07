import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Zap, Users, Calendar, Shield, ArrowRight, Brain,
  GitBranch, Play, Settings, Layers, CheckCircle2
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
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  ul: { paddingLeft: '1.25rem', margin: '0.5rem 0 1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '0.9rem' },
};

const AIAgentsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>AI Agents — Build, Run &amp; Schedule Autonomous Agents | DevSwat</title>
        <meta name="description" content="Build, run, and schedule autonomous AI agents on server or local hardware. Multi-agent orchestration with voting, debate, and chain protocols. 30+ tools, Agent Architect, governed and unbounded modes." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/ai-agents" />
        <meta property="og:title" content="AI Agents — Build, Run & Schedule Autonomous Agents" />
        <meta property="og:description" content="Autonomous AI agents with multi-agent orchestration, 30+ tools, scheduling, and governed execution modes." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/ai-agents" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "DevSwat Agents OS", "applicationCategory": "DeveloperApplication",
          "description": "Build, run, and schedule autonomous AI agents with multi-agent orchestration.",
          "url": "https://resonant.dev-swat.com/products/ai-agents",
          "operatingSystem": "Web, macOS, Linux, Windows",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Bot size={14} /> Agents OS</div>
        <h1 style={s.h1}>Build Agents That<br />Actually Do Things</h1>
        <p style={s.lead}>
          Create, run, and schedule autonomous AI agents on server or local hardware.
          Multi-agent orchestration with voting, debate, and chain protocols.
          30+ built-in tools. Agent Architect builds agents for you.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Agent Capabilities</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Brain size={16} color="#818cf8" /> Autonomous Execution</div>
            <div style={s.cardText}>Agents pursue goals autonomously with world model reasoning. ReAct loop with real tool execution — not simulated.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Users size={16} color="#818cf8" /> Multi-Agent Teams</div>
            <div style={s.cardText}>Voting protocol, debate protocol, chain protocol. Swarm controller for team management. Cross-service delegation.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Calendar size={16} color="#818cf8" /> Scheduling</div>
            <div style={s.cardText}>Cron expressions, interval triggers, webhook triggers. Agents run on schedule without human intervention.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Governed Execution</div>
            <div style={s.cardText}>Governed mode: 25 steps max with approval gates. Unbounded mode: 200 steps, no checks. You choose the safety level.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Agent Architect</div>
            <div style={s.cardText}>Describe what you want in natural language. Agent Architect builds the agent autonomously — blueprint, tools, testing, blockchain registration.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Settings size={16} color="#818cf8" /> 30+ Tools</div>
            <div style={s.cardText}>Workspace management, memory access, billing, integrations, blockchain status, code execution, web search, and more.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>How It Works</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Play size={16} color="#818cf8" /> 1. Create</div>
            <div style={s.cardText}>Define your agent with a name, instructions, and tool selection. Or let Agent Architect build it from a natural language description.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><GitBranch size={16} color="#818cf8" /> 2. Configure</div>
            <div style={s.cardText}>Set execution mode (governed/unbounded), LLM provider, tool permissions, memory scope, and safety boundaries.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> 3. Run & Monitor</div>
            <div style={s.cardText}>Execute manually, on schedule, or via webhook. Full execution traces with waterfall views, cost tracking, and safety flags.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Agent Architect Modes</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            { t: 'Brainstorm', d: 'Explore ideas and possibilities with the architect' },
            { t: 'Control', d: 'Direct the architect with specific instructions' },
            { t: 'Review', d: 'Architect analyzes existing agents for improvements' },
            { t: 'Diagnose', d: 'Debug and fix agent issues with guided analysis' },
          ].map(m => (
            <div key={m.t} style={s.card}>
              <div style={s.cardTitle}>{m.t}</div>
              <div style={s.cardText}>{m.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Start Building Agents <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default AIAgentsPage;
