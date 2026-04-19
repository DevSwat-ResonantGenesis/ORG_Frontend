import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';

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

const NeuralRoutingDocsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Neural Routing Docs — MLP Classifier Architecture &amp; Training | DevSwat Docs</title>
        <meta name="description" content="Neural skill classifier technical docs: MLP architecture (384→256→128→14), training pipeline, active learning, model persistence in PostgreSQL, skill continuity boost, seed data." />
        <link rel="canonical" href="https://dev-swat.com/docs/neural-routing" />
        <meta property="og:title" content="Neural Routing Architecture — DevSwat Docs" />
        <meta property="og:description" content="MLP classifier architecture, training pipeline, active learning, PostgreSQL persistence." />
        <meta property="og:url" content="https://dev-swat.com/docs/neural-routing" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Brain size={14} /> Neural Routing</div>
        <h1 style={s.h1}>Neural Skill Classifier Architecture</h1>
        <p style={s.lead}>Trained MLP on sentence-transformer embeddings. ~5ms inference. Active learning.</p>
      </section>

      <div style={s.divider} />

      <section style={s.section}>
        <h2 style={s.h2}>Model Architecture</h2>
        <code style={s.code}>{`Encoder: sentence-transformers/all-MiniLM-L6-v2
  Input: user message + last 3 messages (concatenated)
  Output: 384-dimensional embedding vector

Classifier: 2-layer MLP
  Layer 1: Linear(384, 256) → ReLU → Dropout(0.3)
  Layer 2: Linear(256, 128) → ReLU → Dropout(0.3)
  Output:  Linear(128, 14) → Softmax

14 Classes:
  code_visualizer, web_search, image_generation, memory,
  agent_architect, state_physics, ide, rabbit, google_drive,
  google_calendar, figma, sigma, sendgrid, none`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Training Pipeline</h2>
        <code style={s.code}>{`Seed Data: 250+ curated samples (skill_training_data.py)
  - Manually labeled message → skill pairs
  - Balanced across all 14 classes

Training:
  1. Load seed samples + all active learning samples from DB
  2. Encode messages with sentence-transformer
  3. Train MLP with Adam optimizer (lr=0.001)
  4. 80/20 train/validation split
  5. 50 epochs, batch_size=32
  6. Serialize model weights to binary blob
  7. Store in PostgreSQL skill_classifier_models table

Active Learning:
  - Every prediction saved to skill_active_samples table
  - Batch flush every 50 predictions
  - Retraining merges seed + all accumulated samples
  - Model version incremented on retrain`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Skill Continuity Boost</h2>
        <code style={s.code}>{`If user is currently in a skill session (e.g., using code_visualizer):
  meta_data.toolResults contains active tool results
  → Active skill gets +0.30 probability boost
  → Prevents unnecessary skill switches mid-workflow

Example:
  Raw prediction: code_visualizer=0.35, web_search=0.30, none=0.20
  Active skill: code_visualizer (from toolResults)
  Boosted:      code_visualizer=0.65, web_search=0.30, none=0.20`}</code>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Database Tables</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}>skill_classifier_models</div>
            <div style={s.cardText}>id, version, model_blob (LargeBinary), n_samples, train_accuracy, cv_accuracy, stats_json, is_active, created_at</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>skill_active_samples</div>
            <div style={s.cardText}>id, user_message, predicted_skill, confidence, method, active_skill, probabilities, intents, user_id, was_correct, created_at</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/products/neural-routing')}>
          Neural Routing Overview <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default NeuralRoutingDocsPage;
