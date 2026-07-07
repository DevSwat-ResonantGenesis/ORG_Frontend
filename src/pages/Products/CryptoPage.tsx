import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Coins, Wallet, Shield, Lock, ArrowRight, BarChart3, Zap } from 'lucide-react';

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
};

const CryptoPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>$RGT Token — Crypto Wallet &amp; Mining Credits | DevSwat</title>
        <meta name="description" content="$RGT token: closed utility economy for DevSwat. Earn by mining LLMs, spend on IDE, agents, LLM APIs. Wallet management, transaction explorer, 5-layer Proof-of-Training verification, halving schedule." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/crypto" />
        <meta property="og:title" content="$RGT Token — Crypto Wallet & Mining Credits" />
        <meta property="og:description" content="Earn $RGT by training LLMs. Spend on platform services. 5-layer security. Halving schedule." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/crypto" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Coins size={14} /> $RGT Token</div>
        <h1 style={s.h1}>Earn by Training.<br />Spend on Platform.</h1>
        <p style={s.lead}>
          $RGT is a closed utility token. Earn it by contributing GPU compute to train frontier LLMs.
          Spend it on IDE access, LLM API calls, agent execution, and platform services.
          Not designed for speculation — value from real usage.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Wallet Features</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Wallet size={16} color="#818cf8" /> Token Management</div>
            <div style={s.cardText}>View balance, send tokens, receive tokens, view transaction history. All operations recorded on the sovereign blockchain.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><BarChart3 size={16} color="#818cf8" /> Transaction Explorer</div>
            <div style={s.cardText}>Etherscan-style network explorer. View all transactions, blocks, addresses, and mining rewards on the public feed.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Mining Credits</div>
            <div style={s.cardText}>Credits earned from accepted gradient submissions. Each credit verified through 5-layer Proof-of-Training before wallet deposit.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Token Economics</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Coins size={16} color="#818cf8" /> Halving Schedule</div>
            <div style={s.cardText}>100 → 50 → 25 → 12.5 $RGT per year. Reduces new supply over time. Creates increasing scarcity as network grows.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> 5-Layer Security</div>
            <div style={s.cardText}>Internal key auth, gradient hash required, HMAC-SHA256 signature, replay protection (UNIQUE constraint), reward cap (500 $RGT max per call).</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> On-Chain Recording</div>
            <div style={s.cardText}>Every gradient submission recorded as training_gradient transaction on sovereign blockchain with Raft consensus and Merkle-tree validation.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/download-miner')}>
          Start Mining $RGT <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default CryptoPage;
