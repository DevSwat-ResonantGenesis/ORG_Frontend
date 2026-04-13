import React, { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import styles from './DownloadMinerPage.module.css';

const GITHUB_REPO = 'https://github.com/DevSwat-ResonantGenesis/RG_miner_app';
const GITHUB_DOWNLOAD = 'https://github.com/DevSwat-ResonantGenesis/RG_miner_app/archive/refs/heads/main.zip';
const ONE_LINE_INSTALL = `bash -lc 'set -e; [ -d RG_miner_app ] || git clone https://github.com/DevSwat-ResonantGenesis/RG_miner_app.git; cd RG_miner_app; python3 -m venv venv; source venv/bin/activate; pip install --upgrade pip; pip install -r requirements.txt; python server.py'`;

const SETUP_STEPS = [
  { cmd: 'git clone https://github.com/DevSwat-ResonantGenesis/RG_miner_app.git', note: 'Clone the repo' },
  { cmd: 'cd RG_miner_app', note: 'Enter directory' },
  { cmd: 'python3 -m venv venv', note: 'Create virtual environment' },
  { cmd: 'source venv/bin/activate', note: 'Activate venv' },
  { cmd: 'pip install --upgrade pip', note: 'Upgrade pip (recommended)' },
  { cmd: 'pip install -r requirements.txt', note: 'Install dependencies' },
  { cmd: 'python server.py', note: 'Start the miner (open localhost:3000)' },
];

const FEATURES = [
  { title: 'Real GPU Training', desc: 'Actual PyTorch forward/backward passes on CUDA, MPS, or CPU. Auto-scales batch size for your device — batch_size=1, seq_len=512 for MPS/CPU fallback.' },
  { title: 'Pipeline-Parallel Training', desc: '1F1B microbatch scheduling across multi-GPU pipelines. Large models (7B–405B) split across multiple miners automatically using the ModelShard architecture.' },
  { title: 'P2P Weight Transfer', desc: 'Download model weights directly from peer miners via /p2p/serve-weights. No central bottleneck — liquid redistribution if miners go offline.' },
  { title: '$RGT Rewards', desc: 'Earn DevSwat Tokens for every accepted gradient. Top-K gradient compression (100x) for efficient submission with SHA256 verification.' },
  { title: 'Live Dashboard', desc: 'Real-time loss curves, reward tracking, training logs at http://localhost:3000. WebSocket-powered updates with network status monitoring.' },
  { title: 'Platform Integration', desc: 'Authenticate with your DevSwat account (same credentials as DevSwat IDE). JWT tokens stored locally, all mining calls include proper auth headers.' },
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
  { step: '10', title: 'Earn $RGT', desc: 'DevSwat Tokens credited for accepted gradients' },
];

const FAQ_ITEMS = [
  {
    label: 'Architecture',
    labelClass: 'faqLabelArch',
    question: 'Who is actually training what? Can consumer GPUs really train AI models?',
    answer: `<p><strong>Yes — and we don't hide how.</strong> The entire training architecture is open-source (AGPL-3.0) and auditable on GitHub. Here's exactly what happens:</p>
<p><strong>Pipeline-Parallel Training:</strong> Large models (7B–405B parameters) are split into layer groups across multiple miners. Each miner holds only a slice — e.g., layers 0–12 of a 24-layer model. No single consumer GPU needs to hold the full model. The <code>ShardManager</code> in our Mining service computes optimal pipeline stages based on each miner's reported GPU VRAM, then assigns layer ranges accordingly.</p>
<p><strong>1F1B Microbatch Scheduling:</strong> We use a one-forward-one-backward interleaved schedule (same technique used by Microsoft DeepSpeed and Meta's pipeline training). This keeps GPU utilization high and reduces peak activation memory — critical for consumer-grade hardware. With 32 microbatches and 4 stages, pipeline efficiency is 91%.</p>
<p><strong>Activation Router:</strong> Between pipeline stages, activation tensors are forwarded miner-to-miner. Our <code>ActivationRouter</code> supports adaptive compression (INT8 quantization = 2x compression, INT8+zlib = 3–4x) and chunked transfer for tensors over 64 MB. Checksums (SHA-256) verify data integrity on every transfer.</p>
<p><strong>P2P via WebRTC:</strong> Miners behind home routers (NAT) discover each other through WebRTC signaling — no manual port forwarding needed. The <code>P2PDiscovery</code> service handles ICE candidate exchange and establishes DataChannels for direct miner-to-miner communication.</p>
<p><strong>Gradient Aggregation:</strong> Each pipeline stage has its own <code>ShardParameterServer</code> that collects and aggregates gradients using staleness-aware weighted averaging. A <code>GlobalAggregator</code> coordinates step advancement across all shards with O(log N) hierarchical consensus — scalable from 4 miners to millions.</p>
<p><strong>Fault Tolerance:</strong> If a miner disconnects, "liquid redistribution" automatically reassigns its shard to the best available replacement miner and re-links the pipeline. No human intervention needed.</p>
<p><strong>Current phase:</strong> The seed model (<code>devswat-seed-1b</code>, 1B params, 24 layers) fits entirely in 2 GB VRAM, so each miner holds a full copy and trains independently with compressed gradient submission. Pipeline sharding activates automatically when the network scales to larger models that don't fit on a single GPU.</p>`,
  },
  {
    label: 'Token',
    labelClass: 'faqLabelToken',
    question: 'What is $RGT worth? Is it traded anywhere?',
    answer: `<p><strong>$RGT is a utility token — not a speculative asset.</strong> Here's the transparent breakdown:</p>
<p><strong>How rewards work:</strong> Every time your miner submits a gradient that passes verification (SHA-256 hash match, staleness check, parameter server validation), the Mining service credits your wallet with $RGT via the <code>ChainBridge</code>. The reward amount depends on your miner tier:</p>
<ul>
<li><strong>Genesis Validator (T1):</strong> 150 $RGT per accepted gradient (1.5x multiplier)</li>
<li><strong>Core Contributor (T2):</strong> 125 $RGT per accepted gradient (1.25x multiplier)</li>
<li><strong>Standard Miner (T3/T4):</strong> 100 $RGT per accepted gradient (base rate)</li>
</ul>
<p><strong>Halving schedule:</strong> Block rewards halve yearly — Year 1: 100 $RGT/block, Year 2: 50, Year 3: 25, Year 4: 12.5. This is a deflationary model similar to Bitcoin's halving mechanism.</p>
<p><strong>A closed utility economy, not speculation:</strong> $RGT isn't trying to be traded on exchanges — it's a platform currency. You mine it by contributing compute, and spend it on IDE access, LLM API calls, agent creation and management. That's a closed utility loop: earn by training models, spend on platform services. This is actually more sustainable than "earn tokens and hope someone buys them" — value comes from real usage, not exchange speculation.</p>
<p><strong>The real break-even question:</strong> It's not "when does $RGT hit X price on a DEX" — it's "does my GPU mining output cover what I'd otherwise pay in platform fees?" If you're already using the DevSwat IDE, LLM APIs, or AI agents, mining essentially makes those services free. Your cost is electricity + GPU wear instead of subscription fees.</p>
<p><strong>On-chain recording:</strong> Every gradient submission and reward distribution is recorded as a <code>training_gradient</code> transaction on the DevSwat Blockchain (chain ID: <code>resonant-genesis-external-1</code>), which uses Raft consensus with Merkle-tree block validation. This creates an immutable provenance trail for all training contributions.</p>
<p><strong>Staking & slashing:</strong> The <code>WalletService</code> supports staking (with lock periods) and slashing penalties for misbehavior. Minimum stake for RG_TOKEN is 1,000 $RGT. This is an economic incentive layer to ensure honest training contributions.</p>
<p><strong>Future Base L2 anchor:</strong> $RGT currently lives on the DevSwat sovereign chain. A cross-chain bridge to Base/ETH mainnet is planned as the network matures and more contributors join — we're building the utility first, not the speculation layer.</p>`,
  },
  {
    label: 'Platform',
    labelClass: 'faqLabelPlatform',
    question: 'Why does it require a free account at dev-swat.com?',
    answer: `<p><strong>Authentication prevents abuse, not lock-in.</strong> Here's why and how it works:</p>
<p><strong>Why auth is required:</strong> Without identity verification, anyone could submit garbage gradients and claim rewards. The auth system ensures every gradient submission is tied to a verified account, making it possible to enforce quality control, slashing penalties for bad actors, and fair reward distribution.</p>
<p><strong>How login works:</strong> The miner app sends your credentials to the platform auth service and receives a JWT token, stored locally on your machine. All subsequent API calls (mining tasks, gradient submission, reward claims) include this token. This is the exact same auth flow used by the DevSwat IDE — one account for the entire platform.</p>
<p><strong>Identity layers:</strong> On registration, each user gets 4 identity anchors: a platform UUID, a SHA-256 blockchain identity (crypto_hash), a Hash Sphere semantic identity (user_hash), and a deterministic Anchor Universe ID (universe_id). Your blockchain identity is anchored on-chain via the <code>/identity/register</code> endpoint.</p>
<p><strong>About the domain:</strong> <code>dev-swat.com</code> is the production domain for the DevSwat platform, operated by the DevSwat-ResonantGenesis organization (same org that owns all the GitHub repos). The name "DevSwat" is the parent organization. All services (auth, mining, blockchain, lighthouse) run behind HTTPS on this domain with HSTS, CORS lockdown, and fail-closed auth in production.</p>
<p><strong>No vendor lock-in:</strong> The miner app is fully open-source. The <code>RG_PLATFORM_URL</code> is configurable — you can point it at any compatible backend. The code for all 3 backend services (Mining, Lighthouse, External Blockchain) is also open-source under AGPL-3.0.</p>`,
  },
  {
    label: 'Trust',
    labelClass: 'faqLabelTrust',
    question: 'This project is brand new with zero stars — why should I trust it?',
    answer: `<p><strong>We won't pretend we're established. Here's where we actually stand:</strong></p>
<p><strong>Yes, we're early.</strong> The repos are new, the star count is zero, and there's no large community yet. We're a small team that shipped real code before marketing it. Every project starts here — the question is whether the substance is real.</p>
<p><strong>What you can verify right now:</strong></p>
<ul>
<li><strong>7+ repos on GitHub</strong> under <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer">DevSwat-ResonantGenesis</a> — miner app, mining service, blockchain, lighthouse, crypto service, memory service, frontend. All open-source under AGPL-3.0.</li>
<li><strong>Real ML engineering:</strong> Raft consensus from scratch, 1F1B pipeline parallelism, GQA+RoPE+SwiGLU transformer architecture, Top-K gradient compression with SHA-256 verification, WebRTC P2P NAT traversal, slashing with Merkle proof verification.</li>
<li><strong>Production infrastructure:</strong> Docker-composed microservices, Nginx TLS termination, JWT auth with fail-closed security, HSTS, CORS lockdown. This isn't a weekend hackathon project.</li>
<li><strong>Live platform:</strong> <a href="https://dev-swat.com" target="_blank" rel="noopener noreferrer">dev-swat.com</a> runs the DevSwat IDE, AI agents, LLM APIs, Hash Sphere memory, and Code Visualizer — the services that $RGT pays for.</li>
</ul>
<p><strong>What we haven't done yet:</strong></p>
<ul>
<li>No Base mainnet token contract — $RGT lives on our sovereign chain for now. The bridge comes when the network proves itself.</li>
<li>No third-party security audit — the code is open for anyone to audit, but we haven't paid for a formal one yet.</li>
<li>No large miner network — we need early participants to help stress-test the P2P pipeline. That's why we're here.</li>
</ul>
<p><strong>The honest pitch:</strong> If you're looking for a proven, battle-tested network — wait. If you want to be an early contributor to a technically real project, help the network form, and accumulate $RGT before the crowd shows up — that's what early participation looks like. We'd rather be transparent about where we are than fake momentum we don't have.</p>`,
  },
  {
    label: 'License',
    labelClass: 'faqLabelLicense',
    question: 'What does the AGPL-3.0 license mean for me?',
    answer: `<p><strong>AGPL-3.0 is one of the strongest open-source licenses — and that's the point.</strong></p>
<p><strong>What it guarantees you:</strong></p>
<ul>
<li><strong>Full source access:</strong> Every line of miner code, model architecture, training logic, gradient compression, blockchain consensus, and P2P discovery is available on GitHub.</li>
<li><strong>Right to fork:</strong> You can fork, modify, and run your own version of the entire stack.</li>
<li><strong>Transparency:</strong> If we modify the server-side code, AGPL requires those changes to also be available. No hidden proprietary training logic.</li>
</ul>
<p><strong>What it requires:</strong> If you modify and distribute the code (or run a modified version as a network service), you must also share your modifications under AGPL-3.0. This prevents someone from taking the open-source work, making it proprietary, and competing against the community that built it.</p>
<p><strong>What you can audit right now:</strong></p>
<ul>
<li><strong>Model architecture:</strong> <code>model_architecture.py</code> — GQA, RoPE, SwiGLU, RMSNorm (same techniques as LLaMA/Mistral)</li>
<li><strong>Training engine:</strong> <code>real_trainer.py</code> — actual PyTorch forward/backward with Top-K gradient compression</li>
<li><strong>Pipeline scheduling:</strong> <code>pipeline.py</code> — 1F1B microbatch scheduling implementation</li>
<li><strong>Shard management:</strong> <code>shard_manager.py</code> — how miners are grouped and assigned model layers</li>
<li><strong>Blockchain consensus:</strong> <code>consensus.py</code> — full Raft protocol implementation</li>
<li><strong>Reward mechanics:</strong> <code>training_task.py</code> — reward multipliers and halving schedule</li>
</ul>
<p>This is not a black box. Every claim on this page can be verified by reading the source.</p>`,
  },
];

const DownloadMinerPage: React.FC = () => {
  const { theme } = useThemeStore();
  const [copied, setCopied] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fullCloneScript = SETUP_STEPS.map(s => s.cmd).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCloneScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOneLiner = () => {
    navigator.clipboard.writeText(ONE_LINE_INSTALL);
    setCopiedOneLiner(true);
    setTimeout(() => setCopiedOneLiner(false), 2000);
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
            DevSwat <span className={styles.heroAccent}>Miner</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Standalone mining client for the DevSwat decentralized LLM training network.
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
          <div style={{ marginTop: 16, width: '100%', maxWidth: 980 }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>One-line install (copy/paste in Terminal)</div>
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 12px', overflowX: 'auto', textAlign: 'left' }}>
              <code style={{ color: '#e6edf3', fontSize: 12, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", whiteSpace: 'pre' }}>{ONE_LINE_INSTALL}</code>
            </div>
            <button
              type="button"
              onClick={handleCopyOneLiner}
              style={{ marginTop: 8, background: 'none', border: '1px solid #30363d', borderRadius: 6, color: copiedOneLiner ? '#3fb950' : '#8b949e', fontSize: 12, padding: '6px 10px', cursor: 'pointer' }}
            >
              {copiedOneLiner ? 'One-line copied!' : 'Copy one-line command'}
            </button>
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

      {/* FAQ / Transparency */}
      <section className={styles.faq}>
        <h2 className={styles.sectionTitle}>Transparency & FAQ</h2>
        <p className={styles.sectionDesc}>
          We know "train AI + earn crypto" raises eyebrows. Here are honest, code-backed answers to the hardest questions.
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
            src="/devswat/devswat_logo.png"
            alt="DevSwat"
            className={styles.ctaLogo}
          />
          <h2 className={styles.ctaTitle}>Start Mining Today</h2>
          <p className={styles.ctaDesc}>
            Join the DevSwat decentralized training network. Contribute compute, earn $RGT, help train the next generation of open-source AI.
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
