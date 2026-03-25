import React, { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import styles from './DownloadIDEPage.module.css';

const GITHUB_REPO = 'https://github.com/DevSwat-ResonantGenesis/RG_IDE';
const GITHUB_DOWNLOAD = 'https://github.com/DevSwat-ResonantGenesis/RG_IDE/archive/refs/heads/main.zip';

const SETUP_STEPS = [
  { cmd: 'git clone https://github.com/DevSwat-ResonantGenesis/RG_IDE.git', note: 'Clone the repo' },
  { cmd: 'cd RG_IDE', note: 'Enter directory' },
  { cmd: 'npm install', note: 'Install dependencies (2-5 min)' },
  { cmd: 'cd extensions/resonant-ai && npm install && npx tsc -p tsconfig.json && cd ../..', note: 'Build the AI extension' },
  { cmd: 'npm run compile', note: 'Compile the IDE (~2 min)' },
  { cmd: './scripts/code.sh', note: 'Launch Resonant IDE' },
];

const FEATURES = [
  { title: '71 Local Tools · 13 Categories', desc: 'File I/O, multi-edit, grep, find, git (status/diff/commit/push/pull/branch), run_command, 8 interactive terminal tools, web search, browser preview, notebook edit, deploy, SSH, Docker, MCP, workflows, checkpoints, and inline SVG/Mermaid visualization — all executed locally via Electron IPC.' },
  { title: '11 AI Providers · Cloud + Local', desc: '6 cloud providers (OpenAI, Anthropic, Groq, Google, DeepSeek, BYOK) + 5 local (Ollama, LM Studio, llama.cpp, LocalAI, vLLM). Server-side fallback chain auto-rotates through keys and providers on failure. You choose the model in the IDE picker.' },
  { title: '14 Code Visualizer Tools', desc: 'AST-based static analysis engine with 14 dedicated tools: scan projects, trace dependency flows, run SAST security audits, detect dead code, score governance compliance (0–100), compare multi-repo drift, verify formal invariants, and compile reversible Graph Analysis Language patches.' },
  { title: 'Hash Sphere Memory', desc: 'Persistent cross-session memory synced with dev-swat.com via save_memory, read_memory, and create_memory tools. The AI stores project context, coding preferences, and decisions — retrieves them semantically across machines.' },
  { title: 'Agentic Chat Loop', desc: 'LLM plans → calls tools → reads results → iterates. Configurable loop depth (1 to unlimited). Smart context compression summarizes large tool outputs to reduce token usage. Interactive terminals let the AI run REPLs, dev servers, and SSH sessions persistently.' },
  { title: 'Platform API Access', desc: 'platform_api_search indexes 450+ backend endpoints across agents, billing, memory, blockchain, marketplace, Invariants SIM, and more. platform_api_call lets the AI invoke any endpoint directly — turning the IDE into a full control plane for the Resonant Genesis platform.' },
];

const REQUIREMENTS = [
  { label: 'Node.js 22.x', detail: '(22.22.0 recommended — do NOT use Node 23+ or 25+)' },
  { label: 'npm 10.x+', detail: '' },
  { label: 'Python 3.10+', detail: '(for native modules & SAST analysis)' },
  { label: 'Xcode CLI Tools', detail: '(macOS) or build-essential (Linux)' },
  { label: 'Free account', detail: 'at dev-swat.com (required for AI features)' },
];

const DownloadIDEPage: React.FC = () => {
  const { theme } = useThemeStore();
  const [copied, setCopied] = useState(false);

  const fullCloneScript = SETUP_STEPS.map(s => s.cmd).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCloneScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Open Source on GitHub
          </div>
          <h1 className={styles.heroTitle}>
            Resonant <span className={styles.heroAccent}>IDE</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Fork of VS Code Open Source with a built-in AI extension — 71 local tools across 13 categories,
            agentic chat loop, AST code analysis engine, interactive terminals, and cross-session memory.
            All tools execute locally on your machine. Server provides LLM routing and memory sync only.
          </p>
          <div className={styles.heroActions}>
            <a href={GITHUB_DOWNLOAD} className={styles.downloadButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download for macOS (266 MB)
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadButtonOutline}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
          <div className={styles.heroPlatforms}>
            macOS (Apple Silicon) &bull; Node.js 22 required &bull; Windows &amp; Linux coming soon
          </div>
        </div>
      </section>

      {/* Quick Setup — Two Column */}
      <section className={styles.setupSection}>
        <p className={styles.sectionDesc}>Clone, build, and launch in under 10 minutes.</p>

        <div className={styles.setupGrid}>
          {/* Left: Prerequisites */}
          <div>
            <div style={{ background: 'var(--bg-secondary, #111827)', border: '1px solid var(--border-color, #1f2937)', borderRadius: 12, padding: '20px 24px' }}>
              <h3 style={{ color: 'var(--text-primary, #e5e7eb)', fontSize: 13, fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>Prerequisites</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {REQUIREMENTS.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13, color: 'var(--text-secondary, #94a3b8)' }}>
                    <span style={{ color: 'var(--accent-color, #818cf8)', fontWeight: 600 }}>{r.label}</span>
                    {r.detail && <span style={{ opacity: 0.7 }}>{r.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* Tip */}
            <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--bg-secondary, #111827)', border: '1px solid var(--border-color, #1f2937)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary, #e5e7eb)' }}>Tip:</strong> If you have Node 25+, use{' '}
              <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>brew install node@22</code>{' '}
              and prefix with{' '}
              <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>PATH="/opt/homebrew/opt/node@22/bin:$PATH"</code>
            </div>
          </div>

          {/* Right: Terminal */}
          <div style={{ position: 'relative', background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #21262d', background: '#161b22' }}>
              <span style={{ fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>Terminal</span>
              <button
                onClick={handleCopy}
                style={{ background: 'none', border: '1px solid #30363d', borderRadius: 6, color: copied ? '#3fb950' : '#8b949e', fontSize: 12, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ padding: '16px 20px', overflowX: 'auto' }}>
              {SETUP_STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < SETUP_STEPS.length - 1 ? 8 : 0, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13, lineHeight: 1.6 }}>
                  <span style={{ color: '#3fb950', userSelect: 'none', flexShrink: 0 }}>$</span>
                  <span style={{ color: '#e6edf3' }}>{step.cmd}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className={styles.screenshots}>
        <h2 className={styles.sectionTitle}>See It in Action</h2>
        <p className={styles.sectionDesc}>
          A professional code editor with an AI assistant that reads, analyzes, and modifies your code.
        </p>
        <div className={styles.screenshotGrid}>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotImageWrap}>
              <img src="/images/showcase/resonant-ide-answer.png" alt="Resonant AI IDE — Code Analysis" className={styles.screenshotImage} />
            </div>
            <div className={styles.screenshotCaption}>
              <h3>Deep Code Analysis</h3>
              <p>Analyze project structure, trace execution flows, and generate dependency graphs.</p>
            </div>
          </div>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotImageWrap}>
              <img src="/images/showcase/resonant-ide-inquiry.png" alt="Resonant AI IDE — Agentic Tool Execution" className={styles.screenshotImage} />
            </div>
            <div className={styles.screenshotCaption}>
              <h3>Agentic Tool Execution</h3>
              <p>Watch the AI read files, search code, and execute commands in real-time with full SSE streaming.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>What's Inside</h2>
        <p className={styles.sectionDesc}>Built-in extension with 71 tools across 13 categories — every tool runs locally on your machine.</p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <img
            src={theme === 'dark' ? '/logo white.png' : '/logo black.png'}
            alt=""
            className={styles.ctaLogo}
          />
          <h2 className={styles.ctaTitle}>Build with Resonant AI</h2>
          <p className={styles.ctaDesc}>
            Open source. Clone it, build it, run it. Your code stays on your machine.
          </p>
          <div className={styles.ctaActions}>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className={styles.downloadButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View Source on GitHub
            </a>
            <a href={GITHUB_DOWNLOAD} className={styles.downloadButtonOutline}>
              Download ZIP (latest from GitHub)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DownloadIDEPage;
