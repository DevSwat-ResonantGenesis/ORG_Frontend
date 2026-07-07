import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Lock, Server, Users, Cpu, FileCheck, ArrowRight,
  Building2, Globe, Layers, CheckCircle2, Zap
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
  check: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer' },
  price: { textAlign: 'center', marginBottom: '2rem' },
  priceNum: { fontSize: '3rem', fontWeight: 700, color: '#818cf8' },
  priceLabel: { fontSize: '1rem', color: 'rgba(255,255,255,0.5)' },
};

const EnterprisePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Helmet>
        <title>Enterprise — DevSwat Self-Hosted Agentic AI for Teams &amp; Organizations</title>
        <meta name="description" content="DevSwat Enterprise: self-hosted agentic AI infrastructure for teams. RARA governance, SOC2 compliance profiles, on-prem deployment, custom agents, full audit trails. Custom pricing." />
        <link rel="canonical" href="https://resonant.dev-swat.com/enterprise" />
        <meta property="og:title" content="Enterprise — DevSwat Self-Hosted Agentic AI" />
        <meta property="og:description" content="Self-hosted agentic AI for teams. RARA governance, SOC2 compliance, on-prem deployment, custom agents, full audit trails." />
        <meta property="og:url" content="https://resonant.dev-swat.com/enterprise" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "DevSwat Enterprise",
          "description": "Self-hosted agentic AI infrastructure for teams and organizations.",
          "url": "https://resonant.dev-swat.com/enterprise",
          "brand": { "@type": "Brand", "name": "DevSwat" },
          "offers": { "@type": "Offer", "price": "499", "priceCurrency": "USD", "billingIncrement": "month" }
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Building2 size={14} /> Enterprise</div>
        <h1 style={s.h1}>Agentic AI Infrastructure<br />for Your Organization</h1>
        <p style={s.lead}>
          Full-stack AI agent platform your team controls. Self-hosted deployment, RARA governance
          with kill switch, SOC2 compliance profiles, immutable audit trails — the entire platform
          running on your own infrastructure.
        </p>
        <div style={s.price}>
          <div style={s.priceNum}>Custom</div>
          <div style={s.priceLabel}>Enterprise plan — unlimited agents, full governance, dedicated support</div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Why Enterprise Teams Choose DevSwat</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Server size={16} color="#818cf8" /> Self-Hosted Deployment</div>
            <div style={s.cardText}>Full platform on your infrastructure. Everything within your network boundary. No data leaves your environment. Complete control.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> RARA Governance</div>
            <div style={s.cardText}>Kill switch, capability decay (agents can never self-expand), atomic mutations with rollback, blast radius analysis, cryptographic receipts for every action.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><FileCheck size={16} color="#818cf8" /> Compliance</div>
            <div style={s.cardText}>EU AI Act and SOC2 compliance profiles (minimal/standard/strict). Immutable audit chain on internal blockchain. Explainability artifacts for every decision.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> Security</div>
            <div style={s.cardText}>JWT authentication, MFA/TOTP, HSTS, CORS lockdown, AES-encrypted per-user memory, 5-layer Proof-of-Training verification for mining.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Users size={16} color="#818cf8" /> Team Management</div>
            <div style={s.cardText}>Role-based access (free/developer/plus/enterprise/owner). Organization management. Multi-agent teams with shared workspaces.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Cpu size={16} color="#818cf8" /> Custom Agents</div>
            <div style={s.cardText}>Build custom agents with 137+ tools. Governed mode (25 steps, approval gates) or Unbounded (200 steps). Agent Architect builds agents autonomously.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Everything Included</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
          <div>
            {[
              'Unlimited AI agents with scheduling',
              'Unlimited LLM providers — connect any model, any provider',
              'DevSwat IDE with code execution intelligence',
              'Code Visualizer AST/SAST scanning',
              'OpenClaw local-first agent connector (137 tools)',
              'Hash Sphere physics-based state engine',
              'Semantic Memory (9-layer, AES-encrypted)',
            ].map(item => (
              <div key={item} style={s.check}>
                <CheckCircle2 size={16} color="#818cf8" style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div>
            {[
              'ResonantChat (68-module AI pipeline)',
              'Internal blockchain with DSID-P audit chain',
              'RARA governance with kill switch',
              'Full audit trails and compliance reports',
              'Priority support',
              'Custom agent development assistance',
              'On-premise deployment support',
            ].map(item => (
              <div key={item} style={s.check}>
                <CheckCircle2 size={16} color="#818cf8" style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Deployment Options</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Globe size={16} color="#818cf8" /> DevSwat Cloud</div>
            <div style={s.cardText}>Fully managed. We handle infrastructure, updates, scaling. Data hosted on DigitalOcean with SSL, backups, and monitoring.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Server size={16} color="#818cf8" /> Self-Hosted</div>
            <div style={s.cardText}>Docker Compose on your servers. 33 containers, PostgreSQL, Redis, Nginx. Full control. Works on any Linux server with Docker.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> Hybrid</div>
            <div style={s.cardText}>Run sensitive workloads on-premise, use DevSwat Cloud for non-sensitive operations. Mix and match as needed.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/contact')}>
          Contact Sales <ArrowRight size={16} />
        </button>
        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
          Or <span style={{ color: '#818cf8', cursor: 'pointer' }} onClick={() => navigate('/signup')}>start with a free account</span> and upgrade anytime
        </div>
      </section>
    </div>
  );
};

export default EnterprisePage;
