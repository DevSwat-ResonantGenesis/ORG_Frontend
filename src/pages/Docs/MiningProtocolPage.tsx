import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Pickaxe, ArrowRight } from 'lucide-react';

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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' },
  cardText: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto 3rem', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '2rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const MiningProtocolPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Mining Protocol — Pipeline Parallelism, Gradient Compression | DevSwat Docs</title>
        <meta name="description" content="DevSwat mining protocol: 1F1B pipeline parallelism, Top-K gradient compression (100x), FedAvg aggregation, 5-layer Proof-of-Training, reward tiers, slashing, halving schedule." />
        <link rel="canonical" href="https://resonant.dev-swat.com/docs/mining-protocol" />
        <meta property="og:title" content="Mining Protocol — DevSwat Docs" />
        <meta property="og:description" content="1F1B pipeline parallelism, gradient compression, FedAvg, Proof-of-Training." />
        <meta property="og:url" content="https://resonant.dev-swat.com/docs/mining-protocol" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Pickaxe size={14} /> Mining Protocol</div>
        <h1 style={s.h1}>Mining Protocol Specification</h1>
        <p style={s.lead}>1F1B pipeline parallelism, gradient compression, FedAvg, and Proof-of-Training verification.</p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Pipeline-Parallel Training (1F1B)</h2>
        <p style={s.p}>
          Models split into layer groups (stages). Each miner handles one stage. 1F1B (One Forward One Backward)
          microbatch scheduling — same technique used by Microsoft DeepSpeed and Meta's PiPPy.
        </p>
        <code style={s.code}>{`Pipeline Configuration:
  Stages: 4 (model split into 4 layer groups)
  Microbatches: 32 per step
  Scheduling: 1F1B (One Forward One Backward)
  Efficiency: 91% pipeline utilization

Stage 0: layers[0:8]   → Miner A
Stage 1: layers[8:16]  → Miner B
Stage 2: layers[16:24] → Miner C
Stage 3: layers[24:32] → Miner D

Activation flow: A→B→C→D (forward), D→C→B→A (backward)`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Gradient Compression</h2>
        <p style={s.p}>
          Top-K sparsification selects only the K largest gradient values for transmission.
          Reduces bandwidth by 100–1000x while preserving training quality.
        </p>
        <code style={s.code}>{`Top-K Compression:
  k = 0.01 (keep top 1% of gradients)
  Compression ratio: ~100x
  Verification: SHA-256 hash of compressed tensor
  Aggregation: FedAvg (Federated Averaging)

Flow:
  1. Miner computes gradients locally
  2. Top-K selects largest k% values + indices
  3. SHA-256 hash computed for verification
  4. Compressed gradients sent to mining service
  5. FedAvg aggregates across all miners
  6. Aggregated update applied to global model`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Reward Distribution</h2>
        <div style={s.grid}>
          {[
            { t: 'Genesis Validator', d: '1.5x reward multiplier. For early adopters and reliable nodes.' },
            { t: 'Core Contributor', d: '1.25x multiplier. Consistent miners with good uptime.' },
            { t: 'Standard Miner', d: '1.0x base rate. Any participant with valid gradients.' },
          ].map(tier => (
            <div key={tier.t} style={s.card}>
              <div style={s.cardTitle}>{tier.t}</div>
              <div style={s.cardText}>{tier.d}</div>
            </div>
          ))}
        </div>
        <code style={{ ...s.code, marginTop: '1rem' }}>{`Halving Schedule:
  Year 1: 100 $RGT base reward
  Year 2: 50 $RGT
  Year 3: 25 $RGT
  Year 4: 12.5 $RGT
  ...continues halving`}</code>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/products/mining')}>
          Mining Product Page <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default MiningProtocolPage;
