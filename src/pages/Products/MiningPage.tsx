import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Pickaxe, Zap, Shield, Radio, Coins, ArrowRight,
  Download, Cpu, Lock, BarChart3, Network
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
  stat: { textAlign: 'center', padding: '1.5rem' },
  statNum: { fontSize: '2rem', fontWeight: 700, color: '#818cf8' },
  statLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
};

const MiningPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Decentralized LLM Training — Mine AI Models &amp; Earn $RGT | DevSwat</title>
        <meta name="description" content="Train frontier LLMs on your GPU and earn $RGT tokens. Real PyTorch training with 1F1B pipeline parallelism, GQA+RoPE+SwiGLU transformer, WebRTC P2P weight transfer, 5-layer Proof-of-Training security." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/mining" />
        <meta property="og:title" content="Decentralized LLM Training — Mine & Earn $RGT" />
        <meta property="og:description" content="Real GPU training for frontier LLMs. Pipeline parallelism, P2P weight transfer, Proof-of-Training verification." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/mining" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "DevSwat Mining Client", "applicationCategory": "UtilitiesApplication",
          "description": "Decentralized LLM training client. Train AI models on your GPU and earn $RGT tokens.",
          "url": "https://resonant.dev-swat.com/products/mining",
          "operatingSystem": "macOS, Linux, Windows",
          "license": "https://www.gnu.org/licenses/agpl-3.0.html",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Pickaxe size={14} /> Decentralized Mining</div>
        <h1 style={s.h1}>Train Frontier LLMs.<br />Earn $RGT.</h1>
        <p style={s.lead}>
          Real GPU training — not fake mining or idle hashing. PyTorch forward/backward passes
          on a GQA+RoPE+SwiGLU transformer. Pipeline-parallel across miners.
          Contribute compute, earn tokens, spend on platform services.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {[
            { n: '1B–405B', l: 'Parameter Models' },
            { n: '91%', l: 'Pipeline Efficiency' },
            { n: '100x', l: 'Gradient Compression' },
            { n: '5-Layer', l: 'Proof-of-Training' },
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
        <h2 style={s.h2}>How Mining Works</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Cpu size={16} color="#818cf8" /> Pipeline-Parallel Training</div>
            <div style={s.cardText}>
              Models split into layer groups across miners. 1F1B microbatch scheduling (same technique as Microsoft DeepSpeed and Meta). 32 microbatches × 4 stages = 91% pipeline efficiency.
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Radio size={16} color="#818cf8" /> P2P Weight Transfer</div>
            <div style={s.cardText}>
              WebRTC signaling for NAT traversal — no manual port forwarding needed. Direct miner-to-miner DataChannels for weight shard transfer. Liquid redistribution when miners disconnect.
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Gradient Compression</div>
            <div style={s.cardText}>
              Top-K sparsification reduces gradient transfer by 100–1000x. FedAvg (Federated Averaging) for aggregation. SHA-256 hash verification for every gradient.
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Network size={16} color="#818cf8" /> Lighthouse Discovery</div>
            <div style={s.cardText}>
              Bootstrap/discovery nodes for the mesh network. TCP protocol for peer registration, heartbeat, and discovery. Supports miners, validators, chain nodes.
            </div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>5-Layer Proof-of-Training Security</h2>
        <div style={s.grid}>
          {[
            { icon: <Lock size={16} color="#818cf8" />, t: 'Internal Key Auth', d: 'Only the mining service inside Docker can call the credit endpoint.' },
            { icon: <Shield size={16} color="#818cf8" />, t: 'Gradient Hash Required', d: 'No hash = no credit. Must actually process a gradient to earn.' },
            { icon: <Lock size={16} color="#818cf8" />, t: 'HMAC-SHA256 Signature', d: 'Mining service signs, crypto service verifies. 5-minute validity window.' },
            { icon: <Shield size={16} color="#818cf8" />, t: 'Replay Protection', d: 'Each gradient_hash credited exactly once (UNIQUE constraint in DB).' },
            { icon: <Lock size={16} color="#818cf8" />, t: 'Reward Cap', d: 'Max 500 $RGT per credit call prevents single-call inflation attacks.' },
          ].map(layer => (
            <div key={layer.t} style={s.card}>
              <div style={s.cardTitle}>{layer.icon} {layer.t}</div>
              <div style={s.cardText}>{layer.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>$RGT Token Economics</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Coins size={16} color="#818cf8" /> Closed Utility Economy</div>
            <div style={s.cardText}>Earn by mining, spend on IDE, LLM APIs, agents, and platform services. Not intended for exchange trading — value from real usage.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><BarChart3 size={16} color="#818cf8" /> Halving Schedule</div>
            <div style={s.cardText}>100 → 50 → 25 → 12.5 $RGT per year. Reduces supply over time. Recorded on sovereign blockchain with Merkle-tree validation.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Miner Tiers</div>
            <div style={s.cardText}>Genesis Validator (1.5x rewards), Core Contributor (1.25x), Standard Miner (1.0x). Higher tiers for earlier and more reliable miners.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/download-miner')}>
          <Download size={16} /> Download Miner
        </button>
      </section>
    </div>
  );
};

export default MiningPage;
