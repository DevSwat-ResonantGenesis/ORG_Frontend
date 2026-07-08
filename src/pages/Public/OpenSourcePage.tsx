import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Github, ExternalLink, ArrowRight, Cpu, Database, Radio,
  Shield, Box, Pickaxe, Terminal
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: '0.75rem' },
  tag: { display: 'inline-block', padding: '3px 10px', background: 'rgba(99,102,241,0.15)', borderRadius: 6, fontSize: '0.75rem', color: '#a5b4fc', marginRight: 6, marginBottom: 4 },
  repoLink: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none', marginTop: 8 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'transparent', color: '#a5b4fc', borderRadius: 8, border: '1px solid rgba(99,102,241,0.4)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', marginLeft: 12 },
};

const repos = [
  {
    name: 'RG_miner_app',
    title: 'Miner App',
    icon: <Pickaxe size={18} color="#818cf8" />,
    license: 'AGPL-3.0',
    desc: 'Standalone mining client for decentralized LLM training. Real PyTorch training with GQA+RoPE+SwiGLU transformer. 1F1B pipeline parallelism, WebRTC P2P weight transfer, gradient compression.',
    tags: ['PyTorch', '1F1B Pipeline', 'WebRTC P2P', 'GQA+RoPE', 'Top-K Compression'],
    url: 'https://github.com/DevSwat-ResonantGenesis/RG_miner_app',
  },
  {
    name: 'RG_OpenClaw',
    title: 'OpenClaw — Federated Agent Connector',
    icon: <Terminal size={18} color="#818cf8" />,
    license: 'Source Available',
    desc: 'Local-first agent runtime with 137 tools across 15 categories. Tools run on YOUR machine. Self-creating tools via LLM + AST safety scan. Memory stays local in SQLite.',
    tags: ['137 Tools', 'Local-First', 'Self-Creating Tools', 'SQLite FTS5', 'Privacy'],
    url: 'https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw',
  },
  {
    name: 'RG_Mining',
    title: 'Mining Service',
    icon: <Cpu size={18} color="#818cf8" />,
    license: 'Source Available',
    desc: 'Server-side training orchestration. Gradient compression (Top-K, 100-1000x), FedAvg aggregation, miner tier rewards, halving schedule. Proof-of-Training verification.',
    tags: ['Top-K Sparsification', 'FedAvg', 'Reward Tiers', 'Halving'],
    url: 'https://github.com/DevSwat-ResonantGenesis/RG_Mining',
  },
  {
    name: 'RG_external_blockchain',
    title: 'External Blockchain',
    icon: <Database size={18} color="#818cf8" />,
    license: 'Source Available',
    desc: 'Sovereign distributed chain with Raft consensus, P2P gossip, block production, merkle trees, fork handling, and deterministic replay. Not riding on another chain.',
    tags: ['Raft Consensus', 'P2P Gossip', 'Block Production', 'Fork Handling'],
    url: 'https://github.com/DevSwat-ResonantGenesis/RG_external_blockchain',
  },
  {
    name: 'RG_lighthouse',
    title: 'Lighthouse — Bootstrap Node',
    icon: <Radio size={18} color="#818cf8" />,
    license: 'Source Available',
    desc: 'Bootstrap/discovery node for the decentralized network. TCP protocol for peer registration, heartbeat, and discovery. Supports miners, validators, chain nodes, and lighthouse replicas.',
    tags: ['TCP Discovery', 'Peer Registry', 'NAT Traversal', 'Mesh Network'],
    url: 'https://github.com/DevSwat-ResonantGenesis/RG_lighthouse',
  },
  {
    name: 'RG_Blockchain',
    title: 'Internal Blockchain',
    icon: <Shield size={18} color="#818cf8" />,
    license: 'Source Available',
    desc: 'DSID-P protocol, hash lineage tracking, transaction graphs, audit chains, Base Sepolia anchoring. Distributed consensus, smart contracts, ZK proofs, identity registry.',
    tags: ['DSID-P', 'Merkle Proofs', 'Audit Chain', 'Base Sepolia'],
    url: 'https://github.com/DevSwat-ResonantGenesis/RG_Blockchain',
  },
  {
    name: 'RG_Crypto',
    title: 'Crypto Service',
    icon: <Box size={18} color="#818cf8" />,
    license: 'Source Available',
    desc: '$RGT wallet management, token operations, 5-layer Proof-of-Training verification, HMAC-SHA256 signature validation, replay protection, mining credit ledger.',
    tags: ['$RGT Wallet', 'HMAC-SHA256', 'Replay Protection', 'Mining Credits'],
    url: 'https://github.com/DevSwat-ResonantGenesis/RG_Crypto',
  },
];

const OpenSourcePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Helmet>
        <title>Open Source — DevSwat GitHub Repos, Mining Client, OpenClaw, Blockchain</title>
        <meta name="description" content="DevSwat open-source repositories on GitHub. AGPL-3.0 miner app, OpenClaw federated agent connector, sovereign blockchain with Raft consensus, Lighthouse discovery, and more. 7+ repos, all auditable." />
        <link rel="canonical" href="https://dev-swat.com/open-source" />
        <meta property="og:title" content="Open Source — DevSwat GitHub Repos" />
        <meta property="og:description" content="7+ open-source repos: AGPL-3.0 miner app, OpenClaw, sovereign blockchain, Lighthouse P2P discovery. All auditable on GitHub." />
        <meta property="og:url" content="https://dev-swat.com/open-source" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Github size={14} /> Open Source</div>
        <h1 style={s.h1}>Verify Everything.<br />Trust Nothing Blindly.</h1>
        <p style={s.lead}>
          Every line of training logic, model architecture, gradient compression, blockchain recording,
          and P2P networking is auditable. Real ML engineering, not marketing slides.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Public Repositories</h2>
        <p style={s.p}>
          7+ repos on GitHub under <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>DevSwat-ResonantGenesis</a>.
          The miner app is fully open under AGPL-3.0. Platform services are source-available.
        </p>

        <div style={s.grid}>
          {repos.map(repo => (
            <div key={repo.name} style={s.card}>
              <div style={s.cardTitle}>{repo.icon} {repo.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: 8 }}>License: {repo.license}</div>
              <div style={s.cardText}>{repo.desc}</div>
              <div>
                {repo.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}
              </div>
              <a href={repo.url} target="_blank" rel="noopener noreferrer" style={s.repoLink}>
                <Github size={14} /> View on GitHub <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>What You Can Verify Right Now</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}>Real ML Engineering</div>
            <div style={s.cardText}>
              Raft consensus from scratch. 1F1B pipeline parallelism with 12/12 tests passing.
              GQA+RoPE+SwiGLU transformer. Top-K gradient compression with SHA-256 verification.
              WebRTC P2P NAT traversal. Slashing with Merkle proof verification.
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>Production Infrastructure</div>
            <div style={s.cardText}>
              Production infrastructure with Nginx TLS termination, JWT auth, HSTS, CORS lockdown.
              All services run behind HTTPS with fail-closed auth in production.
              Live platform at dev-swat.com.
            </div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/download-miner')}>
          Download Miner <ArrowRight size={16} />
        </button>
        <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" style={s.btnOutline}>
          <Github size={16} /> View All Repos
        </a>
      </section>
    </div>
  );
};

export default OpenSourcePage;
