import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/integrations'];

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
  cardTitle: { fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const llms = [
  { name: 'OpenAI', models: 'GPT-4o, GPT-4o-mini, GPT-4-Turbo, o1-preview, o1-mini', use: 'Primary chat, agents, IDE' },
  { name: 'Anthropic', models: 'Claude 3.5 Sonnet/Haiku, Claude 3 Opus/Sonnet/Haiku', use: 'Complex reasoning, code' },
  { name: 'Google Gemini', models: 'Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash', use: 'Fast inference, multimodal' },
  { name: 'Groq', models: 'LLaMA 3.3 70B, 3.1 70B/8B, Mixtral 8x7B', use: 'Ultra-fast inference (~200ms)' },
  { name: 'Mistral AI', models: 'Mistral Large/Medium/Small, Codestral', use: 'European hosting, code gen' },
  { name: 'Cohere', models: 'Command R+/R, Embed v3.0', use: 'RAG, embeddings, multilingual' },
  { name: 'Ollama', models: 'Any local GGUF model', use: 'Privacy-first, on-device, free' },
];

const integrations = [
  { name: 'Google OAuth', desc: 'Single sign-on via Google accounts.' },
  { name: 'GitHub OAuth', desc: 'Login and repo access for Code Visualizer.' },
  { name: 'Gmail', desc: 'Send emails, read inbox via OpenClaw tools.' },
  { name: 'Google Calendar', desc: 'Create events, check availability.' },
  { name: 'Google Drive', desc: 'Read and create files/folders.' },
  { name: 'Slack', desc: 'Send messages, read channels.' },
  { name: 'Figma', desc: 'Access design files and components.' },
  { name: 'Sigma', desc: 'Connect to data dashboards.' },
  { name: 'Stripe', desc: 'Payment processing for subscriptions.' },
  { name: 'SendGrid', desc: 'Transactional email delivery.' },
  { name: 'DALL-E', desc: 'Image generation via OpenAI.' },
  { name: 'DuckDuckGo', desc: 'Private web search (local, no API key).' },
];

const IntegrationsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/integrations" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/integrations" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Globe size={14} /> Integrations</div>
        <h1 style={s.h1}>Connect Everything</h1>
        <p style={s.lead}>
          Connect any LLM provider and any external platform. Switch models per-conversation.
          Platform connectors for Google Drive, deployments, and more. Unlimited integrations.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>LLM Providers</h2>
        <div style={s.grid}>
          {llms.map(l => (
            <div key={l.name} style={s.card}>
              <div style={s.cardTitle}>{l.name}</div>
              <div style={s.cardText}><strong>Models:</strong> {l.models}</div>
              <div style={{ ...s.cardText, marginTop: 4 }}><strong>Best for:</strong> {l.use}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Service Integrations</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {integrations.map(i => (
            <div key={i.name} style={{ ...s.card, display: 'flex', gap: 10, alignItems: 'flex-start', padding: '1rem' }}>
              <CheckCircle2 size={16} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{i.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{i.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Get Started Free <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default IntegrationsPage;
