import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, Database, Globe, Layers, Lock, Server, Shield, Zap,
  ArrowRight, GitBranch, Box, Radio, Brain, Network
} from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 4rem' },
  h2: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' },
  h3: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#c7d2fe' },
  p: { fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1.25rem' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 },
  tag: { display: 'inline-block', padding: '3px 10px', background: 'rgba(99,102,241,0.15)', borderRadius: 6, fontSize: '0.75rem', color: '#a5b4fc', marginRight: 6, marginBottom: 4 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' },
  ul: { paddingLeft: '1.25rem', margin: '0.5rem 0 1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 },
};

const TechnologyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Helmet>
        <title>Technology — DevSwat Architecture, Blockchain, Mining, AI Infrastructure</title>
        <meta name="description" content="Explore DevSwat's technology: AI agent platform, 3-blockchain architecture, pipeline-parallel LLM training, physics-based state engine, 137-tool federated agent runtime, personalized chat intelligence, smart routing, and governance." />
        <link rel="canonical" href="https://resonant.dev-swat.com/technology" />
        <meta property="og:title" content="Technology — DevSwat Architecture" />
        <meta property="og:description" content="AI agent platform, 3-blockchain architecture, LLM training, state physics engine, 137-tool federated agent runtime, smart routing." />
        <meta property="og:url" content="https://resonant.dev-swat.com/technology" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Cpu size={14} /> Technology</div>
        <h1 style={s.h1}>Engineering Deep Dive</h1>
        <p style={s.lead}>
          Full-stack AI infrastructure. 3-blockchain architecture. Pipeline-parallel LLM training.
          Physics-based state simulation. 137-tool federated agent runtime. Smart routing. Every system built from scratch.
        </p>
      </section>

      <div style={s.divider} />

      {/* Three-Blockchain Architecture */}
      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Three-Blockchain Architecture</h2>
        <p style={s.p}>
          DevSwat runs three distinct blockchain layers, each purpose-built for its role — not one chain forced to do everything.
        </p>
        <div style={s.grid3}>
          <div style={s.card}>
            <div style={s.cardTitle}><Database size={16} color="#818cf8" /> Internal Blockchain</div>
            <div style={s.cardText}>
              DSID-P (Digital State Identity Protocol) for agent identity, hash lineage tracking, transaction graphs,
              and immutable audit chains. Periodic merkle root anchoring to Base Sepolia.
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={s.tag}>DSID-P</span><span style={s.tag}>Merkle Trees</span><span style={s.tag}>Audit Chain</span><span style={s.tag}>Smart Contracts</span>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Network size={16} color="#818cf8" /> External Blockchain</div>
            <div style={s.cardText}>
              Sovereign distributed chain with Raft consensus, P2P gossip protocol, block production every 10s,
              fork handling, and deterministic replay. Transaction types: transfers, state updates, agent actions, training gradients.
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={s.tag}>Raft Consensus</span><span style={s.tag}>P2P Gossip</span><span style={s.tag}>Fork Handling</span>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><GitBranch size={16} color="#818cf8" /> Cross-Chain Bridge</div>
            <div style={s.cardText}>
              $RGT lives on the sovereign chain (chain ID: resonant-genesis-external-1). Base/ETH mainnet bridge
              planned as the network matures — utility first, not speculation.
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={s.tag}>Base L2</span><span style={s.tag}>$RGT Token</span><span style={s.tag}>Planned</span>
            </div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      {/* Mining & Training */}
      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Decentralized LLM Training</h2>
        <p style={s.p}>
          Real GPU training — not fake mining or idle hashing. PyTorch forward/backward passes on a transformer
          with Grouped Query Attention (GQA), Rotary Position Embeddings (RoPE), and SwiGLU activations.
          Same architecture techniques as LLaMA and Mistral.
        </p>
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Pipeline-Parallel Training</div>
            <div style={s.cardText}>
              <ul style={s.ul}>
                <li>Models split into layer groups across miners (1B–405B parameters)</li>
                <li>1F1B microbatch scheduling (same as Microsoft DeepSpeed)</li>
                <li>32 microbatches × 4 stages = 91% pipeline efficiency</li>
                <li>Top-K gradient compression: 100–1000x reduction</li>
                <li>FedAvg (Federated Averaging) for gradient aggregation</li>
              </ul>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Radio size={16} color="#818cf8" /> P2P Network</div>
            <div style={s.cardText}>
              <ul style={s.ul}>
                <li>WebRTC signaling for NAT traversal — no port forwarding</li>
                <li>Direct miner-to-miner DataChannels for weight shards</li>
                <li>Lighthouse bootstrap/discovery nodes (TCP protocol)</li>
                <li>Liquid redistribution when miners disconnect</li>
                <li>SHA-256 gradient hash verification</li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ ...s.card, marginTop: '1.5rem' }}>
          <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> Proof-of-Training (5-Layer Security)</div>
          <div style={s.cardText}>
            <ul style={s.ul}>
              <li><strong>Internal Key Auth</strong> — only the mining service inside Docker can call the credit endpoint</li>
              <li><strong>Gradient Hash Required</strong> — no hash = no credit, must actually train</li>
              <li><strong>HMAC-SHA256 Signature</strong> — mining service signs, crypto service verifies (5-min window)</li>
              <li><strong>Replay Protection</strong> — each gradient_hash credited exactly once (UNIQUE constraint)</li>
              <li><strong>Reward Cap</strong> — max 500 $RGT per credit call prevents single-call inflation</li>
            </ul>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      {/* Agent Runtime */}
      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Agent Runtime & OpenClaw</h2>
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardTitle}><Brain size={16} color="#818cf8" /> Agents OS</div>
            <div style={s.cardText}>
              <ul style={s.ul}>
                <li>Autonomous daemon with goal pursuit and world model</li>
                <li>Multi-agent orchestration: voting, debate, chain protocols</li>
                <li>Agent Architect: autonomous agent builder with intent classification</li>
                <li>Governed (25 steps, approval gates) and Unbounded (200 steps) modes</li>
                <li>Full execution traces with waterfall views and cost tracking</li>
              </ul>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Globe size={16} color="#818cf8" /> OpenClaw (Local-First)</div>
            <div style={s.cardText}>
              <ul style={s.ul}>
                <li>137 tools across 15 categories — all available day one</li>
                <li>Local execution: web_search, memory, code run on YOUR machine</li>
                <li>Self-creating tools: agents build tools at runtime via LLM + AST safety scan</li>
                <li>Server receives only tool name + timing + final answer</li>
                <li>Zero inbound connections. Works behind any firewall/NAT/VPN</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      {/* AI Pipeline */}
      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>ResonantChat — 68-Module AI Pipeline</h2>
        <div style={s.grid3}>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Hallucination Detection</div>
            <div style={s.cardText}>System prompt grounding, LLM-as-judge, knowledge base cross-referencing. Every claim linked to sources via evidence graphs.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Brain size={16} color="#818cf8" /> Neural Skill Classifier</div>
            <div style={s.cardText}>Trained MLP on all-MiniLM-L6-v2 embeddings (384-dim → 256 → 128 → 14 classes). ~5ms inference, active learning, PostgreSQL persistence.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> Multi-Provider Fallback</div>
            <div style={s.cardText}>Connect any LLM provider — OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, Ollama, and more. Smart routing reduces token costs. SSE streaming with automatic failover.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      {/* RARA Governance */}
      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>RARA Governance Layer</h2>
        <p style={s.p}>
          The Resident Autonomous Runtime Architecture enforces structural, semantic, and temporal invariants
          across the entire platform. Admin-only access.
        </p>
        <div style={s.grid3}>
          {[
            { t: 'Invariant Engine', d: 'Graph constraint enforcement via AST Analysis. If invariants break, mutations are rejected.' },
            { t: 'Capability Engine', d: 'Capabilities can only decay, never expand autonomously. No agent may grant itself new authority.' },
            { t: 'Kill Switch', d: 'Emergency freeze, stop, or reset. Deterministic bridge from physics state to governance actions.' },
            { t: 'Atomic Mutations', d: 'Mutations with rollback. Blast radius calculation. Core state modification forbidden.' },
            { t: 'Compliance', d: 'EU AI Act, SOC2 profiles (minimal/standard/strict). Cryptographic receipts for all mutations.' },
            { t: 'Snapshot Engine', d: 'System state snapshots and restore. Quorum and epoch-based authority.' },
          ].map(c => (
            <div key={c.t} style={s.card}>
              <div style={s.cardTitle}><Shield size={14} color="#818cf8" /> {c.t}</div>
              <div style={s.cardText}>{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* Infrastructure */}
      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Infrastructure</h2>
        <div style={s.grid3}>
          <div style={s.card}>
            <div style={s.cardTitle}><Server size={16} color="#818cf8" /> Backend</div>
            <div style={s.cardText}>Python, FastAPI, SQLAlchemy, Alembic, Pydantic, Celery, asyncio, httpx, WebSockets, JWT, Stripe SDK</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Box size={16} color="#818cf8" /> Frontend</div>
            <div style={s.cardText}>React 18, TypeScript, Vite, Zustand, Three.js, D3.js, Monaco Editor, Lucide Icons, CSS Modules</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> DevOps</div>
            <div style={s.cardText}>Docker Compose (33 containers), Nginx with SSL, PostgreSQL, Redis, DigitalOcean, GitHub Actions, Certbot</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Start Building <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default TechnologyPage;
