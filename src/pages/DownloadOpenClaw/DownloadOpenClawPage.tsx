import React, { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import styles from './DownloadOpenClawPage.module.css';

const GITHUB_REPO = 'https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw';
const GITHUB_DOWNLOAD = 'https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw/archive/refs/heads/main.zip';

const SETUP_STEPS = [
  { cmd: 'git clone https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw.git', note: 'Clone the repo' },
  { cmd: 'cd RG_OpenClaw', note: 'Enter directory' },
  { cmd: 'npm install', note: 'Install dependencies' },
  { cmd: 'npm run build', note: 'Build the extension' },
  { cmd: 'code --install-extension openclaw-*.vsix', note: 'Install in VS Code (or open Extensions > Install from VSIX)' },
];

const FEATURES = [
  { title: 'Federation Protocol', desc: 'Register your local machine as a federated agent node on the ResonantGenesis platform. Your VS Code becomes a first-class participant in the agent mesh — receiving tasks, executing tools, and reporting results.' },
  { title: '200+ Platform Tools', desc: 'Access the full ResonantGenesis tool registry directly from VS Code: filesystem, search, memory, agents, code visualizer, integrations (Gmail, Slack, Drive, Calendar, Figma), media generation, GitHub, and more.' },
  { title: 'Hash Sphere Memory', desc: 'Persistent cross-session memory synced with dev-swat.com. The AI stores project context, coding preferences, and decisions — retrieves them semantically across machines and sessions.' },
  { title: 'Agent Architect', desc: 'Design, create, and deploy autonomous agents from inside VS Code. Set goals, assign tools, configure governance modes, schedule recurring tasks, and monitor execution traces.' },
  { title: 'Heartbeat & Status', desc: 'Automatic heartbeat keeps your node online in the federation. Real-time status reporting with hardware info, capabilities, and connection metrics visible on your platform dashboard.' },
  { title: 'Secure Authentication', desc: 'JWT-based auth with your dev-swat.com account. Tokens stored in VS Code secure credential storage. All API calls use HTTPS with fail-closed security — same infrastructure protecting $RGT wallets.' },
];

const REQUIREMENTS = [
  { label: 'VS Code', detail: '1.85+ or any Code-OSS fork' },
  { label: 'Node.js 18+', detail: '(for building the extension)' },
  { label: 'Network', detail: 'Internet connection for platform API access' },
  { label: 'Free account', detail: 'at dev-swat.com (required for federation)' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Install Extension', desc: 'Build from source or install the .vsix file in VS Code' },
  { step: '2', title: 'Login', desc: 'Authenticate with your dev-swat.com credentials — JWT stored securely' },
  { step: '3', title: 'Register Node', desc: 'Your machine registers as a federated agent with hardware info and capabilities' },
  { step: '4', title: 'Access Tools', desc: '200+ platform tools become available in the chat panel — search, memory, agents, integrations' },
  { step: '5', title: 'Execute Tasks', desc: 'Run agent tasks locally with full tool access — file I/O, terminal, git, and cloud tools' },
  { step: '6', title: 'Stay Connected', desc: 'Automatic heartbeat keeps your node online — disconnect gracefully when done' },
];

const FAQ_ITEMS = [
  {
    label: 'Architecture',
    labelClass: 'faqLabelArch',
    question: 'What is OpenClaw and how does it differ from the Resonant IDE?',
    answer: `<p><strong>OpenClaw is a VS Code extension</strong> that connects your existing VS Code installation to the ResonantGenesis platform. The Resonant IDE is a full fork of VS Code with the AI built in.</p>
<p><strong>Choose OpenClaw if:</strong></p>
<ul>
<li>You already have VS Code set up with your preferred extensions and settings</li>
<li>You want to add ResonantGenesis AI capabilities without switching editors</li>
<li>You want to participate in the federated agent network from your existing environment</li>
</ul>
<p><strong>Choose Resonant IDE if:</strong></p>
<ul>
<li>You want a dedicated AI-first editor with deeper integration</li>
<li>You want 71 local tools executing via Electron IPC (faster than API calls)</li>
<li>You're starting fresh and want the full experience out of the box</li>
</ul>
<p><strong>Both share:</strong> The same platform tools, Hash Sphere memory, agent capabilities, Code Visualizer, and LLM routing. Your memories and agents sync across both.</p>`,
  },
  {
    label: 'Federation',
    labelClass: 'faqLabelToken',
    question: 'What does "federated agent node" mean?',
    answer: `<p><strong>Your machine becomes a node in the ResonantGenesis agent mesh.</strong></p>
<p>When you install OpenClaw and authenticate, your VS Code instance registers with the platform via <code>POST /federation/register</code>. This creates a federated agent entry in the system with your hardware info, capabilities, and connection URL.</p>
<p><strong>What this enables:</strong></p>
<ul>
<li><strong>Tool execution:</strong> You can execute any of 200+ platform tools directly from the chat panel</li>
<li><strong>Agent tasks:</strong> Create and run autonomous agents that use your local environment</li>
<li><strong>Memory sync:</strong> Your AI context persists across sessions via Hash Sphere</li>
<li><strong>Status monitoring:</strong> Your node appears in the platform dashboard with online/offline status</li>
</ul>
<p><strong>What stays local:</strong> Your source code, file system, and terminal sessions. The extension only sends tool requests and results to the platform — never your raw files unless a specific tool requires it.</p>`,
  },
  {
    label: 'Platform',
    labelClass: 'faqLabelPlatform',
    question: 'Why does it need a dev-swat.com account?',
    answer: `<p><strong>Authentication ties your node to your identity and prevents abuse.</strong></p>
<p>Without auth, anyone could register fake nodes, spam the federation, or access other users' memories and agents. The JWT flow ensures every API call is tied to a verified account.</p>
<p><strong>Your account gives you:</strong></p>
<ul>
<li>Access to the full tool registry (200+ tools across 16 categories)</li>
<li>Persistent Hash Sphere memory (syncs across IDE, OpenClaw, and web)</li>
<li>Agent creation and management capabilities</li>
<li>$RGT wallet for platform services</li>
</ul>
<p>Registration is free. The same account works across the web platform, Resonant IDE, OpenClaw extension, and Miner app.</p>`,
  },
  {
    label: 'Trust',
    labelClass: 'faqLabelTrust',
    question: 'Is the extension safe? What data does it send?',
    answer: `<p><strong>The extension is fully open-source — audit every line on GitHub.</strong></p>
<p><strong>What is sent to the platform:</strong></p>
<ul>
<li>Your JWT token (for authentication)</li>
<li>Tool execution requests and their results</li>
<li>Federation heartbeat (status, hardware info)</li>
<li>Memory read/write operations</li>
</ul>
<p><strong>What is NOT sent:</strong></p>
<ul>
<li>Your source code files (unless you explicitly use a tool that requires content)</li>
<li>Your VS Code settings or other extensions</li>
<li>Your terminal history</li>
<li>Your git credentials</li>
</ul>
<p>All communication is over HTTPS. The extension uses VS Code's secure credential storage for tokens — never plain text files.</p>`,
  },
  {
    label: 'License',
    labelClass: 'faqLabelLicense',
    question: 'What license is the extension under?',
    answer: `<p><strong>OpenClaw is open-source under the AGPL-3.0 license</strong> — the same license as the Miner app and other ResonantGenesis services.</p>
<p>You can fork, modify, and build it yourself. If you distribute modifications or run a modified version as a service, you must share your changes under AGPL-3.0.</p>
<p>The full source is available at <a href="https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw" target="_blank" rel="noopener noreferrer">github.com/DevSwat-ResonantGenesis/RG_OpenClaw</a>.</p>`,
  },
];

const DownloadOpenClawPage: React.FC = () => {
  const { theme } = useThemeStore();
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <span className={styles.heroAccent}>OpenClaw</span> Extension
          </h1>
          <p className={styles.heroSubtitle}>
            VS Code extension that connects your editor to the ResonantGenesis platform.
            200+ tools, federated agent node, Hash Sphere memory, and full agent orchestration —
            all from your existing VS Code setup.
          </p>
          <div className={styles.heroActions}>
            <a href={GITHUB_DOWNLOAD} className={styles.downloadButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download from GitHub
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
            VS Code 1.85+ &bull; Node.js 18+ &bull; Any OS &bull; AGPL-3.0 License
          </div>
        </div>
      </section>

      {/* Quick Setup */}
      <section className={styles.setupSection}>
        <div className={styles.setupGrid}>
          {/* Left: Prerequisites */}
          <div>
            <div style={{ background: 'var(--bg-secondary, #111827)', border: '1px solid var(--border-color, #1f2937)', borderRadius: 12, padding: '20px 24px' }}>
              <h3 style={{ color: 'var(--text-primary, #e5e7eb)', fontSize: 13, fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>Requirements</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {REQUIREMENTS.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13, color: 'var(--text-secondary, #94a3b8)' }}>
                    <span style={{ color: 'var(--accent-color, #818cf8)', fontWeight: 600 }}>{r.label}</span>
                    {r.detail && <span style={{ opacity: 0.7 }}>{r.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--bg-secondary, #111827)', border: '1px solid var(--border-color, #1f2937)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary, #e5e7eb)' }}>Tip:</strong> You can also install from the VS Code Extensions panel — search for "OpenClaw" or use "Install from VSIX" with the built .vsix file.
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

      {/* How It Works */}
      <section className={styles.networkFlow}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionDesc}>
          Install the extension, authenticate, and your VS Code becomes a federated node in the ResonantGenesis agent network.
        </p>
        <div className={styles.flowGrid}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} className={styles.flowCard}>
              <div className={styles.flowStepNumber}>{item.step}</div>
              <h3 className={styles.flowStepTitle}>{item.title}</h3>
              <p className={styles.flowStepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>What's Inside</h2>
        <p className={styles.sectionDesc}>Full platform access from your existing VS Code — no editor switch required.</p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <h2 className={styles.sectionTitle}>Transparency & FAQ</h2>
        <p className={styles.sectionDesc}>
          Common questions about what OpenClaw does, what data it accesses, and how federation works.
        </p>
        <div className={styles.faqList}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>
                  <span className={`${styles.faqLabel} ${styles[item.labelClass]}`}>{item.label}</span>
                  {item.question}
                </span>
                <svg
                  className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === i && (
                <div
                  className={styles.faqAnswer}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              )}
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
          <h2 className={styles.ctaTitle}>Connect Your Editor</h2>
          <p className={styles.ctaDesc}>
            Install OpenClaw and turn your VS Code into a federated agent node. Access 200+ tools, persistent memory, and full agent orchestration.
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

export default DownloadOpenClawPage;
