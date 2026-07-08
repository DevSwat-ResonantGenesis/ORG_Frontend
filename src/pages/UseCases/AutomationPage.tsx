import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Zap, Calendar, Webhook, Bot, ArrowRight, Layers, GitBranch } from 'lucide-react';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/use-cases/automation'];

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 960, margin: '0 auto', padding: '0 2rem 4rem' },
  h2: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const AutomationPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/use-cases/automation" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/use-cases/automation" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Zap size={14} /> For Automation</div>
        <h1 style={s.h1}>Set It. Forget It.<br />Agents Handle the Rest.</h1>
        <p style={s.lead}>
          Schedule agents with cron expressions, trigger them via webhooks, or chain them
          in visual workflows. Integrate with Gmail, Slack, Google Calendar, and more.
          Governed execution ensures they stay within bounds.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Automation Features</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Calendar size={16} color="#818cf8" /> Cron Scheduling</div>
            <div style={s.cardText}>Run agents on any schedule: every hour, daily at midnight, weekly on Mondays. Standard cron expression syntax.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Webhook size={16} color="#818cf8" /> Webhook Triggers</div>
            <div style={s.cardText}>Trigger agent execution from external events. GitHub pushes, Stripe payments, form submissions — anything that can send HTTP.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> Visual Workflows</div>
            <div style={s.cardText}>Drag-and-drop workflow designer. Connect agents, conditions, and actions. Multi-step pipelines with branching logic.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Bot size={16} color="#818cf8" /> Multi-Agent Pipelines</div>
            <div style={s.cardText}>Chain agents together. Output of one feeds into the next. Voting for consensus decisions. Debate for exploring options.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><GitBranch size={16} color="#818cf8" /> Integrations</div>
            <div style={s.cardText}>Gmail, Slack, Google Calendar, Google Drive, Figma, Sigma, SendGrid. OAuth-based with cloud fallback for authorized tools.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={16} color="#818cf8" /> Execution History</div>
            <div style={s.cardText}>Full execution traces with waterfall views. Cost tracking per run. Success/failure monitoring. Retry failed runs.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/signup')}>
          Automate Now <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default AutomationPage;
