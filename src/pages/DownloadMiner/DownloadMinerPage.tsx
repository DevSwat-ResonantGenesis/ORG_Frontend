import React, { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import styles from './DownloadMinerPage.module.css';

const GITHUB_REPO = 'https://github.com/DevSwat-ResonantGenesis/RG_miner_app';
const GITHUB_DOWNLOAD = 'https://github.com/DevSwat-ResonantGenesis/RG_miner_app/archive/refs/heads/main.zip';

const SETUP_STEPS = [
  { cmd: 'git clone https://github.com/DevSwat-ResonantGenesis/RG_miner_app.git', note: 'Clone the repo' },
  { cmd: 'cd RG_miner_app', note: 'Enter directory' },
  { cmd: 'python3 -m venv venv', note: 'Create virtual environment' },
  { cmd: 'source venv/bin/activate', note: 'Activate venv (Linux/Mac)' },
  { cmd: 'pip install -r requirements.txt', note: 'Install dependencies' },
  { cmd: 'python server.py', note: 'Start the miner' },
];

const FEATURES = [
  { title: 'Real GPU Training', desc: 'Actual PyTorch forward/backward passes on CUDA, MPS, or CPU. Auto-scales batch size for your device — batch_size=1, seq_len=512 for MPS/CPU fallback.' },
  { title: 'Pipeline-Parallel Training', desc: '1F1B microbatch scheduling across multi-GPU pipelines. Large models (7B–405B) split across multiple miners automatically using the ModelShard architecture.' },
  { title: 'P2P Weight Transfer', desc: 'Download model weights directly from peer miners via /p2p/serve-weights. No central bottleneck — liquid redistribution if miners go offline.' },
  { title: '$RGT Rewards', desc: 'Earn ResonantGenesis Tokens for every accepted gradient. Top-K gradient compression (100x) for efficient submission with SHA256 verification.' },
  { title: 'Live Dashboard', desc: 'Real-time loss curves, reward tracking, training logs at http://localhost:3000. WebSocket-powered updates with network status monitoring.' },
  { title: 'Platform Integration', desc: 'Authenticate with your ResonantGenesis account (same credentials as Resonant IDE). JWT tokens stored locally, all mining calls include proper auth headers.' },
];

const REQUIREMENTS = [
  { label: 'Python 3.9+', detail: '(3.11+ recommended)' },
  { label: 'RAM', detail: '8 GB minimum, 16+ GB recommended' },
  { label: 'GPU', detail: 'NVIDIA CUDA or Apple MPS (optional, CPU fallback works)' },
  { label: 'GPU VRAM', detail: '4 GB for Seed 1B, 24+ GB for larger models' },
  { label: 'PyTorch 2.1+', detail: '2.4+ recommended' },
  { label: 'Network', detail: 'Broadband internet, 100+ Mbps for P2P weight transfer' },
  { label: 'Free account', detail: 'at dev-swat.com (required for mining)' },
];

const NETWORK_FLOW = [
  { step: '1', title: 'Login', desc: 'Credentials sent to platform auth service, JWT token stored locally' },
  { step: '2', title: 'Register Capability', desc: 'Report your GPU model, VRAM, region to the Mining service' },
  { step: '3', title: 'Shard Assignment', desc: 'Server assigns you a slice of the model (e.g., layers 0-12 of a 24-layer model)' },
  { step: '4', title: 'Weight Transfer Plan', desc: 'Server tells you which peers already have your layers' },
  { step: '5', title: 'P2P Weight Download', desc: 'Pull weights directly from peers via /p2p/serve-weights (fallback: genesis seed)' },
  { step: '6', title: 'Report Loaded', desc: 'Tell the server your shard is ready for training' },
  { step: '7', title: 'Receive Task', desc: 'Get a training task (epoch, batch index, hyperparameters)' },
  { step: '8', title: 'Train (1F1B pipeline)', desc: 'Run 1F1B microbatch schedule — forward/backward passes interleaved for GPU efficiency' },
  { step: '9', title: 'Submit Gradient', desc: 'Compressed gradient (Top-K with SHA256 hash) sent to parameter server' },
  { step: '10', title: 'Earn $RGT', desc: 'ResonantGenesis Tokens credited for accepted gradients' },
];

const DownloadMinerPage: React.FC = () => {
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
            RG <span className={styles.heroAccent}>Miner</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Standalone mining client for the ResonantGenesis decentralized LLM training network.
            Download, login, and start earning $RGT tokens by training AI models on your GPU.
            Your machine becomes a node in a global pipeline-parallel training swarm.
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
            Python 3.9+ &bull; PyTorch 2.1+ &bull; CUDA / MPS / CPU &bull; AGPL-3.0 License
          </div>
        </div>
      </section>

      {/* Quick Setup — Two Column */}
      <section className={styles.setupSection}>
        <div className={styles.setupGrid}>
          {/* Left: Prerequisites */}
          <div>
            <div style={{ background: 'var(--bg-secondary, #111827)', border: '1px solid var(--border-color, #1f2937)', borderRadius: 12, padding: '20px 24px' }}>
              <h3 style={{ color: 'var(--text-primary, #e5e7eb)', fontSize: 13, fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>System Requirements</h3>
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
              <strong style={{ color: 'var(--text-primary, #e5e7eb)' }}>Tip:</strong> For CUDA support, install PyTorch with:{' '}
              <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>pip install torch --index-url https://download.pytorch.org/whl/cu121</code>
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

      {/* Network Flow */}
      <section className={styles.networkFlow}>
        <h2 className={styles.sectionTitle}>How the Network Works</h2>
        <p className={styles.sectionDesc}>
          Your miner connects to a 3-service mesh: Lighthouse (P2P discovery), Mining (orchestration), and External Blockchain (Raft consensus). 
          Gradients are recorded on-chain, rewards distributed automatically.
        </p>
        <div className={styles.flowGrid}>
          {NETWORK_FLOW.map((item, i) => (
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
        <p className={styles.sectionDesc}>Built for decentralized training at scale — every component optimized for P2P collaboration.</p>
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
          <h2 className={styles.ctaTitle}>Start Mining Today</h2>
          <p className={styles.ctaDesc}>
            Join the ResonantGenesis decentralized training network. Contribute compute, earn $RGT, help train the next generation of open-source AI.
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

export default DownloadMinerPage;
