import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Search, GitBranch, Shield, FileWarning, ArrowRight,
  BarChart3, Eye, Layers, Github
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
  tag: { display: 'inline-block', padding: '3px 10px', background: 'rgba(99,102,241,0.15)', borderRadius: 6, fontSize: '0.75rem', color: '#a5b4fc', marginRight: 6, marginBottom: 4 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: 960 },
  cta: { textAlign: 'center', padding: '3rem 2rem 5rem' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};

const CodeAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>Code Visualizer — AST/SAST Analysis, Dependency Graphs | DevSwat</title>
        <meta name="description" content="AST/SAST code analysis for Python, JavaScript, TypeScript. GitHub repo scanning, dependency graphs, function tracing, dead code detection, governance reports, multi-project comparison." />
        <link rel="canonical" href="https://resonant.dev-swat.com/products/code-analysis" />
        <meta property="og:title" content="Code Visualizer — AST/SAST Code Analysis" />
        <meta property="og:description" content="AST/SAST scanning with dependency graphs, dead code detection, governance reports. Python, JS, TS." />
        <meta property="og:url" content="https://resonant.dev-swat.com/products/code-analysis" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonant.dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "DevSwat Code Visualizer", "applicationCategory": "DeveloperApplication",
          "description": "AST/SAST code analysis with dependency graphs, function tracing, and governance reports.",
          "url": "https://resonant.dev-swat.com/products/code-analysis",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Search size={14} /> Code Visualizer</div>
        <h1 style={s.h1}>See Your Code<br />Like Never Before</h1>
        <p style={s.lead}>
          AST/SAST analysis for Python, JavaScript, and TypeScript. Scan GitHub repos, upload archives,
          or analyze local codebases. Dependency graphs, function tracing, dead code detection,
          and governance reports.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Analysis Capabilities</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><GitBranch size={16} color="#818cf8" /> Dependency Graphs</div>
            <div style={s.cardText}>Interactive visualization of imports, calls, and inheritance. Nodes for services, files, classes, functions, and endpoints. Edges for every connection.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Eye size={16} color="#818cf8" /> Function Tracing</div>
            <div style={s.cardText}>Trace any function through the call graph. See every caller and callee across the entire codebase. Cross-file, cross-module resolution.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><FileWarning size={16} color="#818cf8" /> Dead Code Detection</div>
            <div style={s.cardText}>Find unreachable functions, unused imports, and orphaned modules. Classification by reachability from entry points.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Shield size={16} color="#818cf8" /> Governance Reports</div>
            <div style={s.cardText}>Reachability contracts, drift detection, compliance checks. Ensure your codebase meets architectural invariants.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><BarChart3 size={16} color="#818cf8" /> Multi-Project Comparison</div>
            <div style={s.cardText}>Compare two or more repos. Diff analysis, heat maps, instability metrics, evolution timeline across versions.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Github size={16} color="#818cf8" /> GitHub Integration</div>
            <div style={s.cardText}>Scan repos directly via OAuth. Single repo or multi-repo comparison. Clone, analyze, and persist results.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Supported Languages</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            { t: 'Python', d: 'Full AST parsing via ast module. Classes, functions, decorators, async.' },
            { t: 'JavaScript', d: 'Regex-based analyzer. ES6+ imports, exports, classes, functions.' },
            { t: 'TypeScript', d: 'TypeScript-aware analysis. Interfaces, types, generics, decorators.' },
          ].map(l => (
            <div key={l.t} style={s.card}>
              <div style={s.cardTitle}>{l.t}</div>
              <div style={s.cardText}>{l.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Graph Janitor Agent</h2>
        <p style={s.p}>
          An AI agent that autonomously analyzes your code graph and proposes cleanup actions.
          Remove dead code, simplify dependency chains, and enforce architectural boundaries — all
          with human-in-the-loop approval.
        </p>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/code-visualizer')}>
          Try Code Visualizer <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default CodeAnalysisPage;
