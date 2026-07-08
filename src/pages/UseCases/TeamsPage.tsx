import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Brain, GitBranch, ArrowRight, Layers, Lock } from 'lucide-react';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/use-cases/teams'];

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

const TeamsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/use-cases/teams" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/use-cases/teams" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Users size={14} /> For Teams</div>
        <h1 style={s.h1}>Agents That Work<br />As a Team</h1>
        <p style={s.lead}>
          Multi-agent teams with voting, debate, and chain protocols. Shared semantic memory.
          RARA governance ensures agents stay within bounds. Full audit trails for compliance.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Team Capabilities</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Users size={16} color="#818cf8" /> Multi-Agent Orchestration</div>
            <div style={s.cardText}>Create agent teams. Voting protocol for consensus. Debate protocol for exploring alternatives. Chain protocol for sequential workflows.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Brain size={16} color="#818cf8" /> Shared Memory</div>
            <div style={s.cardText}>Team-scoped semantic memory. Agents share knowledge, context, and learned patterns. Per-user encryption maintained.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Governed Execution</div>
            <div style={s.cardText}>RARA governance with capability decay. Agents can't self-expand authority. Kill switch for emergencies. Compliance profiles.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Lock size={16} color="#818cf8" /> Role-Based Access</div>
            <div style={s.cardText}>4 plan tiers with different capabilities. Organization management. Invite members, assign roles, control agent access.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><GitBranch size={16} color="#818cf8" /> Audit Trails</div>
            <div style={s.cardText}>Every agent action recorded in a tamper-evident, hash-chained audit log. Exportable audit logs for SOC2 and EU AI Act.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Layers size={16} color="#818cf8" /> Workflow Designer</div>
            <div style={s.cardText}>Visual workflow builder. Connect agents, triggers, and conditions. Schedule complex multi-agent workflows with approval gates.</div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/enterprise')}>
          Explore Enterprise <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default TeamsPage;
