import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/terms'];

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  h1: { fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 800, margin: '0 auto', padding: '0 2rem 3rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '2rem' },
  p: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: '1rem' },
  ul: { paddingLeft: '1.25rem', margin: '0.5rem 0 1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '0.9rem' },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 800 },
};

const TermsPage: React.FC = () => (
  <div style={s.page}>
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href="https://dev-swat.com/terms" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content="https://dev-swat.com/terms" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
    </Helmet>

    <section style={s.hero}>
      <h1 style={s.h1}>Terms of Service</h1>
      <p style={s.lead}>Last updated: April 2026</p>
    </section>

    <div style={s.divider} />

    <section style={s.section}>
      <h2 style={s.h2}>1. Acceptance</h2>
      <p style={s.p}>
        By using DevSwat (dev-swat.com), you agree to these terms. If you don't agree, don't use the platform.
      </p>

      <h2 style={s.h2}>2. Account</h2>
      <p style={s.p}>
        You must provide accurate information when creating an account. You are responsible for
        maintaining the security of your account credentials and MFA tokens.
      </p>

      <h2 style={s.h2}>3. Pricing & Credits</h2>
      <ul style={s.ul}>
        <li>Free tier: Limited usage across all features</li>
        <li>Developer ($15/mo): Extended usage, all LLM providers</li>
        <li>Plus ($499/mo): Full access, all LLM providers, priority support, rollover credits</li>
        <li>Enterprise (custom): Unlimited usage, self-hosted option, SLA, dedicated support</li>
      </ul>

      <h2 style={s.h2}>4. Acceptable Use</h2>
      <p style={s.p}>You may not use DevSwat to:</p>
      <ul style={s.ul}>
        <li>Generate illegal, harmful, or abusive content</li>
        <li>Attempt to bypass governance controls or safety limits</li>
        <li>Attack the platform infrastructure or other users</li>
        <li>Resell platform access without authorization</li>
      </ul>

      <h2 style={s.h2}>5. Intellectual Property</h2>
      <p style={s.p}>
        Content you create using DevSwat belongs to you. The platform software, architecture, and
        proprietary systems (ResonantChat, Hash Sphere, DSID-P, RARA, etc.) are owned by DevSwat.
        Open-source components are licensed under their respective licenses (AGPL-3.0 for the miner app).
      </p>

      <h2 style={s.h2}>6. Agent Responsibilities</h2>
      <p style={s.p}>
        You are responsible for the actions of agents you create and run on the platform. While RARA
        governance provides safety controls, the user bears ultimate responsibility for agent behavior.
      </p>

      <h2 style={s.h2}>7. Limitation of Liability</h2>
      <p style={s.p}>
        DevSwat is provided "as is." We do not guarantee uptime, accuracy of AI responses, or
        specific outcomes. Our liability is limited to the amount you've paid in the last 12 months.
      </p>

      <h2 style={s.h2}>8. Contact</h2>
      <p style={s.p}>Legal questions: <strong>legal@dev-swat.com</strong></p>
    </section>
  </div>
);

export default TermsPage;
