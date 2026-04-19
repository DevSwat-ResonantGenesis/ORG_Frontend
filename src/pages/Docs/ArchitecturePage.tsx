import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Server, Database, Shield, Globe, ArrowRight, Layers } from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 3rem' },
  h2: { fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem' },
  h3: { fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#a5b4fc' },
  p: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 },
  code: { background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', whiteSpace: 'pre' as const, overflowX: 'auto' as const, marginBottom: '1.25rem' },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto 3rem', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '2rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const services = [
  { name: 'RG_Gateway', port: 8000, desc: 'Central API gateway, JWT auth, rate limiting, reverse proxy to all services' },
  { name: 'RG_Auth', port: 8001, desc: 'Identity, OAuth, JWT issuance, role/plan management' },
  { name: 'RG_Chat', port: 8002, desc: 'ResonantChat 68-module AI pipeline, neural skill classifier' },
  { name: 'RG_Agent_Engine', port: 8003, desc: 'Agent CRUD, scheduling, autonomous daemon, multi-agent orchestration' },
  { name: 'RG_Billing', port: 8004, desc: 'Credits, Stripe, usage tracking, plan management' },
  { name: 'RG_Memory', port: 8005, desc: 'Semantic memory, embeddings, RAG, Hash Sphere coordinates' },
  { name: 'RG_Blockchain', port: 8006, desc: 'Internal chain, DSID-P, audit chain, merkle proofs' },
  { name: 'RG_Mining', port: 8007, desc: 'Training orchestration, gradient compression, reward distribution' },
  { name: 'RG_LLM_Service', port: 8008, desc: 'Multi-provider LLM routing, context injection, tool execution' },
  { name: 'RG_AST_analysis', port: 8009, desc: 'Code Visualizer, AST/SAST, dependency graphs' },
  { name: 'RG_Crypto', port: 8010, desc: '$RGT wallet, token operations, mining credits' },
  { name: 'RG_OpenClaw', port: 8011, desc: '137-tool federated agent connector, ClawHub' },
  { name: 'RG_External_Blockchain', port: 8012, desc: 'Sovereign chain, Raft consensus, P2P gossip' },
  { name: 'RG_Lighthouse', port: 8013, desc: 'Bootstrap/discovery, peer registry, heartbeat' },
  { name: 'RG_Internal_Invariants', port: 8014, desc: 'RARA governance, kill switch, compliance' },
  { name: 'RG_Users_Invariants', port: 8015, desc: 'Hash Sphere physics, N-body simulation' },
];

const ArchitecturePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Architecture — Platform Infrastructure & Service Topology | DevSwat Docs</title>
        <meta name="description" content="DevSwat platform architecture: full-stack AI agent infrastructure with blockchain logging, smart routing, governance, 9-layer memory, IDE, mining network. Technical deep dive into service topology." />
        <link rel="canonical" href="https://dev-swat.com/docs/architecture" />
        <meta property="og:title" content="DevSwat Architecture — Platform Infrastructure" />
        <meta property="og:description" content="Full-stack AI agent infrastructure. Blockchain, governance, smart routing, mining, IDE." />
        <meta property="og:url" content="https://dev-swat.com/docs/architecture" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Server size={14} /> Architecture</div>
        <h1 style={s.h1}>Platform Architecture</h1>
        <p style={s.lead}>
          30 FastAPI microservices, 33 Docker containers, PostgreSQL, Redis, Nginx TLS termination.
          4,384 API endpoints. 120+ database tables. All orchestrated via Docker Compose.
        </p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Infrastructure Stack</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Server size={14} color="#818cf8" /> Compute</div>
            <div style={s.cardText}>DigitalOcean droplet. Ubuntu. Docker Compose v2. 33 containers. All services on one machine (vertical scaling).</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Database size={14} color="#818cf8" /> Database</div>
            <div style={s.cardText}>PostgreSQL 16 (shared). Per-service tables via Alembic migrations. SQLite for local tools (OpenClaw). Redis for caching.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Globe size={14} color="#818cf8" /> Networking</div>
            <div style={s.cardText}>Nginx TLS termination. Let's Encrypt SSL. HSTS, CORS lockdown. Docker internal network. Gateway reverse proxy.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={14} color="#818cf8" /> Security</div>
            <div style={s.cardText}>JWT auth on every request. MFA/TOTP. AES encryption for memory. Fail-closed auth middleware.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Service Topology</h2>
        <p style={s.p}>All services are FastAPI (Python 3.11+). Each runs in its own Docker container with isolated dependencies.</p>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))' }}>
          {services.map(svc => (
            <div key={svc.name} style={{ ...s.card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: '#818cf8', fontSize: '0.8rem', fontFamily: 'monospace', minWidth: 48 }}>{`:${svc.port}`}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{svc.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{svc.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/technology')}>
          Read Technology Deep Dive <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default ArchitecturePage;
