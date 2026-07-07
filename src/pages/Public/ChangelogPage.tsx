import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, CheckCircle2 } from 'lucide-react';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)', color: '#fff' },
  hero: { textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' },
  h1: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 2.5rem' },
  section: { maxWidth: 800, margin: '0 auto', padding: '0 2rem 2rem' },
  entry: { borderLeft: '2px solid rgba(99,102,241,0.3)', paddingLeft: '1.5rem', marginBottom: '2.5rem', position: 'relative' as const },
  dot: { width: 10, height: 10, borderRadius: '50%', background: '#818cf8', position: 'absolute' as const, left: -6, top: 4 },
  date: { fontSize: '0.85rem', color: '#818cf8', fontWeight: 600, marginBottom: '0.5rem' },
  version: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' },
  item: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '0.4rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 800 },
};

const releases = [
  {
    date: 'April 18, 2026',
    version: 'v2.4.0 — DevSwat Rebrand',
    items: [
      'Complete rebrand from ResonantGenesis to DevSwat across 49 files',
      'Neural Skill Classifier: trained MLP replaces LLM prompt detection (~5ms)',
      'Active learning: model improves with every conversation',
      'Model weights stored in PostgreSQL (container-independent)',
      'New homepage design with Abril Fatface + Work Sans typography',
    ],
  },
  {
    date: 'April 13, 2026',
    version: 'v2.3.0 — IDE Upgrade',
    items: [
      'DevSwat IDE system prompt upgraded to Cascade architecture',
      '66 tools (up from 61): list_workflows, run_workflow, trajectory_search, save/load_checkpoint',
      'Context window reduced from 40 to 10 turns (50% token savings)',
      'Workspace layout injection for project-aware AI',
      'IDE metadata: active file, cursor, language, selection',
    ],
  },
  {
    date: 'April 13, 2026',
    version: 'v2.2.0 — Persistent Credit Queue',
    items: [
      'Mining credits now survive service restarts (PendingCredit table)',
      'Save-before-send pattern: DB → HTTP → mark_sent',
      'Auto-retry pending credits on startup',
      'Network Dashboard page with real-time mining stats',
    ],
  },
  {
    date: 'April 12, 2026',
    version: 'v2.1.0 — Memory Security Fix',
    items: [
      'Fixed unfiltered /memory/hash-sphere/anchors endpoint',
      'RAG router prefix fixed (/rag → /memory/rag)',
      'Removed stub endpoints that shadowed real routers',
      'Anchors default limit increased 50 → 2000',
    ],
  },
  {
    date: 'April 11, 2026',
    version: 'v2.0.0 — Production Deploy',
    items: [
      '21/21 services healthy on production (resonant.dev-swat.com)',
      '315 routes, 94 intelligence router endpoints',
      'Agent Engine scheduler and autonomous daemon enabled',
      '30 intelligence files restored from RG_core',
      'Full Docker Compose orchestration with proper dependency chains',
    ],
  },
];

const ChangelogPage: React.FC = () => {
  return (
    <div style={s.page}>
      <Helmet>
        <title>Changelog — Platform Updates &amp; Release History | DevSwat</title>
        <meta name="description" content="DevSwat changelog: all platform updates, new features, bug fixes, and improvements across the entire AI agent platform, IDE, blockchain, mining, and governance systems." />
        <link rel="canonical" href="https://resonant.dev-swat.com/changelog" />
        <meta property="og:title" content="DevSwat Changelog" />
        <meta property="og:description" content="Platform updates, new features, and release history." />
        <meta property="og:url" content="https://resonant.dev-swat.com/changelog" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Zap size={14} /> Changelog</div>
        <h1 style={s.h1}>Changelog</h1>
        <p style={s.lead}>Every update, feature, and fix across the entire platform.</p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        {releases.map(r => (
          <div key={r.version} style={s.entry}>
            <div style={s.dot} />
            <div style={s.date}>{r.date}</div>
            <div style={s.version}>{r.version}</div>
            {r.items.map(item => (
              <div key={item} style={s.item}>
                <CheckCircle2 size={14} color="#818cf8" style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
};

export default ChangelogPage;
