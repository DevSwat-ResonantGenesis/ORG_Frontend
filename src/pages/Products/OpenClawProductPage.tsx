import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Terminal, Shield, Wrench, Lock, ArrowRight, Download,
  Cpu, Database, Globe, Eye, Zap
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
  stat: { textAlign: 'center', padding: '1.5rem' },
  statNum: { fontSize: '2rem', fontWeight: 700, color: '#818cf8' },
  statLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
};

const categories = [
  { name: 'Search & Web', count: 11, examples: 'web_search, fetch_url, deep_research, reddit_search' },
  { name: 'Memory (Local)', count: 9, examples: 'memory_read/write/search, hash_sphere_search/anchor' },
  { name: 'Code Visualizer', count: 8, examples: 'scan, functions, trace, governance, graph' },
  { name: 'Agents OS', count: 24, examples: 'CRUD, sessions, scheduling, architect tools' },
  { name: 'Media Generation', count: 3, examples: 'generate_image (DALL-E), generate_audio, generate_music' },
  { name: 'Integrations', count: 9, examples: 'Gmail, Slack, Google Calendar/Drive, Figma, Sigma' },
  { name: 'GitHub', count: 9, examples: 'repos, files, PRs, issues, commits, comments' },
  { name: 'Git Operations', count: 5, examples: 'clone, branch, merge, push, pull' },
  { name: 'State Physics', count: 21, examples: 'universe CRUD, physics config, entropy, experiments' },
  { name: 'Community', count: 12, examples: 'posts, communities, comments, voting, search' },
  { name: 'Developer', count: 4, examples: 'execute_code, http_request, dev_tool' },
  { name: 'Utilities', count: 6, examples: 'weather, stock_crypto, chart, time, system_info' },
  { name: 'Platform API', count: 2, examples: 'platform_api_search (~383 endpoints), platform_api_call' },
  { name: 'Filesystem', count: 10, examples: 'file CRUD, grep_search, find_by_name, run_command' },
  { name: 'Tool Management', count: 6, examples: 'create_tool, auto_build_tool, list/delete/update_tool' },
];

const OpenClawProductPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>OpenClaw — 137-Tool Local-First AI Agent Connector | DevSwat</title>
        <meta name="description" content="OpenClaw: local-first federated agent connector with 137 tools across 15 categories. Tools run on YOUR machine. Self-creating tools via LLM + AST safety scan. Data never leaves your hardware." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/openclaw" />
        <meta property="og:title" content="OpenClaw — 137-Tool Local-First Agent Connector" />
        <meta property="og:description" content="137 tools, 15 categories. Tools run locally. Self-creating tools. Data never leaves your machine." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/openclaw" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "OpenClaw", "applicationCategory": "DeveloperApplication",
          "description": "Local-first federated agent connector with 137 tools. Privacy-first — tools run on your machine.",
          "url": "https://resonant.dev-swat.com/products/openclaw",
          "operatingSystem": "macOS, Linux, Windows",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Terminal size={14} /> OpenClaw</div>
        <h1 style={s.h1}>137 Tools.<br />Your Machine. Your Data.</h1>
        <p style={s.lead}>
          Local-first federated agent connector. Web search, memory, code execution — all run on YOUR hardware.
          Server only sees tool name + timing + final answer. Self-creating tools via LLM + AST safety scan.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {[
            { n: '137', l: 'Built-in Tools' },
            { n: '15', l: 'Tool Categories' },
            { n: '0', l: 'Data Sent to Server' },
            { n: '∞', l: 'Custom Tools' },
          ].map(st => (
            <div key={st.l} style={{ ...s.card, ...s.stat }}>
              <div style={s.statNum}>{st.n}</div>
              <div style={s.statLabel}>{st.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Privacy Model</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> Local Execution</div>
            <div style={s.cardText}>web_search, fetch_url, memory, execute_code — all run locally via DuckDuckGo, SQLite FTS5, and subprocess. No data leaves your machine.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Globe size={16} color="#818cf8" /> Cloud Fallback Only</div>
            <div style={s.cardText}>OAuth tools (Google Calendar, Slack) and GPU tools (DALL-E) require cloud. Everything else stays local.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Zero Inbound Connections</div>
            <div style={s.cardText}>ALL traffic is outbound HTTPS. Platform NEVER connects to you. Works behind any firewall, NAT, or VPN.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>15 Tool Categories</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {categories.map(cat => (
            <div key={cat.name} style={s.card}>
              <div style={s.cardTitle}><Wrench size={14} color="#818cf8" /> {cat.name} <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 400 }}>({cat.count})</span></div>
              <div style={s.cardText}>{cat.examples}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Self-Creating Tools</h2>
        <p style={s.p}>
          Agents can create their own tools at runtime. The flow:
        </p>
        <div style={s.grid}>
          {[
            { icon: <Eye size={16} color="#818cf8" />, t: '1. Check Existing', d: 'check_tool_exists searches 137+ built-in tools + all custom tools.' },
            { icon: <Cpu size={16} color="#818cf8" />, t: '2. Auto-Build', d: 'auto_build_tool — LLM designs a complete tool spec from natural language description.' },
            { icon: <Shield size={16} color="#818cf8" />, t: '3. Safety Scan', d: 'AST analysis validates: no SSRF, no forbidden URLs, valid JSON schema.' },
            { icon: <Zap size={16} color="#818cf8" />, t: '4. Registered', d: 'Saved to DB. Immediately available platform-wide for all agents.' },
          ].map(step => (
            <div key={step.t} style={s.card}>
              <div style={s.cardTitle}>{step.icon} {step.t}</div>
              <div style={s.cardText}>{step.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/download-openclaw')}>
          <Download size={16} /> Download OpenClaw
        </button>
      </section>
    </div>
  );
};

export default OpenClawProductPage;
