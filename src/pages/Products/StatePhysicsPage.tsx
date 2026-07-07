import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Atom, Zap, Eye, Shield, ArrowRight, Layers, BarChart3 } from 'lucide-react';

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

const StatePhysicsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Hash Sphere — Physics-Based State Engine &amp; N-Body Simulation | DevSwat</title>
        <meta name="description" content="Completely novel physics-based state engine. N-body simulation with gravity, repulsion, electromagnetic, and resonance forces. Conservation invariants, entropy injection, Three.js 3D visualization." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/state-physics" />
        <meta property="og:title" content="Hash Sphere — Physics-Based State Engine" />
        <meta property="og:description" content="N-body simulation with gravity, repulsion, entropy forces. Conservation invariants. Three.js 3D visualization." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/state-physics" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Atom size={14} /> Hash Sphere</div>
        <h1 style={s.h1}>State Management<br />Through Physics</h1>
        <p style={s.lead}>
          A completely novel approach. State represented as particles in a 3D N-body simulation.
          Gravity pulls related states together. Repulsion prevents collision. Entropy forces drive evolution.
          Conservation laws guarantee system integrity.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Physics Forces</h2>
        <div style={s.grid}>
          {[
            { icon: <Atom size={16} color="#818cf8" />, t: 'Gravity', d: 'Related states attract. Strength proportional to semantic similarity. Creates natural clusters.' },
            { icon: <Shield size={16} color="#818cf8" />, t: 'Repulsion', d: 'Prevents state collapse. Minimum distance enforcement. Maintains distinctness of individual states.' },
            { icon: <Zap size={16} color="#818cf8" />, t: 'Electromagnetic', d: 'Charged interactions between complementary states. Positive-negative attraction creates meaningful pairings.' },
            { icon: <Layers size={16} color="#818cf8" />, t: 'Resonance', d: 'Harmonic coupling between states at similar frequencies. Amplifies coherent patterns, dampens noise.' },
          ].map(f => (
            <div key={f.t} style={s.card}>
              <div style={s.cardTitle}>{f.icon} {f.t}</div>
              <div style={s.cardText}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Conservation Invariants</h2>
        <div style={s.grid}>
          {[
            { t: 'Mass Conservation', d: 'Total system mass never changes. States can transform but not appear or disappear without cause.' },
            { t: 'Energy Conservation', d: 'Total energy (kinetic + potential) is conserved. No perpetual motion or energy creation.' },
            { t: 'Identity Uniqueness', d: 'Every state has a unique identity (DSID). No two states may occupy the same identity.' },
            { t: 'Causality', d: 'Effects cannot precede causes. Temporal ordering enforced across all state transitions.' },
            { t: 'Trust Bounds', d: 'Trust scores bounded [0,1]. Can only decay, never spontaneously increase beyond threshold.' },
          ].map(inv => (
            <div key={inv.t} style={s.card}>
              <div style={s.cardTitle}><Shield size={14} color="#818cf8" /> {inv.t}</div>
              <div style={s.cardText}>{inv.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Visualization & Interaction</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Eye size={16} color="#818cf8" /> Three.js 3D Scene</div>
            <div style={s.cardText}>Interactive 3D particle cloud. Zoom, rotate, click to inspect. Real-time physics simulation running at 60fps.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><BarChart3 size={16} color="#818cf8" /> Real-Time Analytics</div>
            <div style={s.cardText}>System energy, entropy, cluster count, force magnitudes. All updated every physics tick.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Entropy Injection</div>
            <div style={s.cardText}>Inject perturbation events. Watch the system respond, reorganize, and settle into new equilibria.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/state-physics')}>
          Explore Hash Sphere <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default StatePhysicsPage;
