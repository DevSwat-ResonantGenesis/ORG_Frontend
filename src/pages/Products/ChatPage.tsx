import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/products/chat'];
import {
  MessageSquare, Shield, Brain, Layers, Zap, ArrowRight,
  CheckCircle2, Globe, BarChart3
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
  stat: { textAlign: 'center', padding: '1.5rem' },
  statNum: { fontSize: '2rem', fontWeight: 700, color: '#818cf8' },
  statLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
};

const providers = [
  { name: 'OpenAI', models: 'GPT-4o, GPT-4o-mini, GPT-4-Turbo, o1-preview, o1-mini' },
  { name: 'Anthropic', models: 'Claude 3.5 Sonnet/Haiku, Claude 3 Opus/Sonnet/Haiku' },
  { name: 'Google Gemini', models: 'Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash' },
  { name: 'Groq', models: 'LLaMA 3.3 70B, 3.1 70B/8B, Mixtral 8x7B, Gemma 2 9B' },
  { name: 'Mistral AI', models: 'Mistral Large/Medium/Small, Codestral' },
  { name: 'Cohere', models: 'Command R+/R, Embed English/Multilingual v3.0' },
  { name: 'Ollama', models: 'Any local GGUF — LLaMA 3, Mistral 7B, CodeLlama, Phi-3' },
];

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/products/chat" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/products/chat" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><MessageSquare size={14} /> ResonantChat</div>
        <h1 style={s.h1}>Personalized Chat Intelligence.<br />Smart Routing. Zero Hallucinations.</h1>
        <p style={s.lead}>
          The most sophisticated AI chat pipeline in any SaaS product. Hallucination detection,
          evidence graphs, neural skill classification, and multi-provider failover — all in one system.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {[
            { n: '68', l: 'Processing Modules' },
            { n: '7', l: 'LLM Providers' },
            { n: '~5ms', l: 'Skill Classification' },
            { n: '14', l: 'Skill Classes' },
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
        <h2 style={s.h2}>Anti-Hallucination System</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> System Prompt Grounding</div>
            <div style={s.cardText}>Every response grounded against the system prompt context. Claims that contradict known facts are flagged.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Brain size={16} color="#818cf8" /> LLM-as-Judge</div>
            <div style={s.cardText}>A separate LLM call evaluates the primary response for factual accuracy, logical consistency, and source attribution.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><BarChart3 size={16} color="#818cf8" /> Evidence Graphs</div>
            <div style={s.cardText}>Every claim linked to source material via citation chains. Visual evidence graph shows the reasoning trail.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Neural Skill Classifier</h2>
        <p style={s.p}>
          A trained MLP on all-MiniLM-L6-v2 embeddings (384-dim → 256 → 128 → 14 classes). Routes
          messages to specialized skills in ~5ms. Active learning — gets smarter with every conversation.
          Trained on 250+ curated samples, model weights stored in PostgreSQL.
        </p>
        <div style={s.grid}>
          {['Code Visualizer', 'Web Search', 'Image Generation', 'Memory', 'Agent Architect',
            'State Physics', 'IDE Completions', 'Rabbit (Social)', 'Google Drive', 'Google Calendar',
            'Figma', 'Sigma', 'SendGrid', 'General Chat'].map(skill => (
            <div key={skill} style={{ ...s.card, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={14} color="#818cf8" />
              <span style={{ fontSize: '0.9rem' }}>{skill}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Connect Any LLM Provider</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {providers.map(p => (
            <div key={p.name} style={s.card}>
              <div style={s.cardTitle}><Globe size={14} color="#818cf8" /> {p.name}</div>
              <div style={s.cardText}>{p.models}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Try ResonantChat Free <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default ChatPage;
