import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/products/ide'];
import {
  Code2, Terminal, Eye, FolderOpen, Cpu, ArrowRight,
  Download, Monitor, Laptop, Smartphone
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
  tag: { display: 'inline-block', padding: '3px 10px', background: 'rgba(99,102,241,0.15)', borderRadius: 6, fontSize: '0.75rem', color: '#a5b4fc', marginRight: 6, marginBottom: 4 },
};

const IDEPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/products/ide" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/products/ide" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "DevSwat IDE", "applicationCategory": "DeveloperApplication",
          "operatingSystem": "macOS, Linux, Windows",
          "description": "AI-powered code editor with 66 tools, code execution intelligence, and integrated development environment.",
          "url": "https://dev-swat.com/products/ide",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>

      <section style={s.hero}>
        <div style={s.badge}><Code2 size={14} /> DevSwat IDE</div>
        <h1 style={s.h1}>Code With AI<br />That Understands Your Project</h1>
        <p style={s.lead}>
          Not just autocomplete. The DevSwat IDE has 66 tools — from code execution to memory search
          to agent orchestration. Code execution intelligence that actually runs your code, reads errors,
          and fixes them autonomously.
        </p>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Core Features</h2>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}><Cpu size={16} color="#818cf8" /> Code Execution Intelligence</div>
            <div style={s.cardText}>AI runs your code, reads stdout/stderr, identifies errors, and iteratively fixes them. Not simulation — real execution in sandboxed environments.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Terminal size={16} color="#818cf8" /> Integrated Terminal</div>
            <div style={s.cardText}>Full terminal with command execution. AI can run commands, check output, install dependencies, and debug build failures.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><Eye size={16} color="#818cf8" /> Live Preview</div>
            <div style={s.cardText}>See changes instantly. Web apps render in real-time as you or the AI makes edits. Hot module replacement built in.</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><FolderOpen size={16} color="#818cf8" /> Project Management</div>
            <div style={s.cardText}>File tree, search, multi-file editing. AI understands your full project structure and can navigate, create, and modify files.</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>66 Built-in Tools</h2>
        <p style={s.p}>
          Every tool from the DevSwat platform is available directly in the IDE. The AI agent
          selects and chains tools automatically based on your request.
        </p>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}>File Operations</div>
            <div style={s.cardText}>read_file, write_file, edit, multi_edit, find_by_name, grep_search, list_dir</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>Code Intelligence</div>
            <div style={s.cardText}>code_search, code_visualizer_scan, run_command, command_status, browser_preview</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>Memory & Context</div>
            <div style={s.cardText}>save_memory, read_memory, create_memory, trajectory_search, save_checkpoint, load_checkpoint</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>Platform Integration</div>
            <div style={s.cardText}>deploy_web_app, read_url_content, search_web, read_notebook, edit_notebook, list_workflows, run_workflow</div>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      <section style={{ ...s.section, paddingTop: '3rem' }}>
        <h2 style={s.h2}>Available On</h2>
        <div style={{ ...s.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            { icon: <Laptop size={20} color="#818cf8" />, t: 'macOS', d: 'Apple Silicon & Intel' },
            { icon: <Monitor size={20} color="#818cf8" />, t: 'Linux', d: 'x64 & ARM64' },
            { icon: <Monitor size={20} color="#818cf8" />, t: 'Windows', d: 'x64' },
          ].map(p => (
            <div key={p.t} style={{ ...s.card, textAlign: 'center' }}>
              {p.icon}
              <div style={{ fontWeight: 600, marginTop: 8 }}>{p.t}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{p.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.cta}>
        <button style={s.btn} onClick={() => navigate('/download-ide')}>
          <Download size={16} /> Download IDE
        </button>
      </section>
    </div>
  );
};

export default IDEPage;
